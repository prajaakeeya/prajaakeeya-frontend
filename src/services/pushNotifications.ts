import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  deleteToken,
  onMessage,
  isSupported,
  type Messaging,
} from 'firebase/messaging';
import {
  registerDeviceToken,
  unregisterDeviceToken,
  emitNotificationsChanged,
} from './notificationService';
import { useAuthStore } from '../store/useAuthStore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

/** Push is only wired when the Firebase env is fully configured. */
const isConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    vapidKey,
);

const FCM_SW_SCOPE = '/firebase-cloud-messaging-push-scope';
/** Persisted copy of the registered FCM token so logout can unregister it even
 *  after a page reload (before initPush re-runs and repopulates currentToken). */
const DEVICE_TOKEN_KEY = 'fcm_device_token';

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let currentToken: string | null = null;
let foregroundWired = false;

function getApp(): FirebaseApp {
  if (!app) app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig as Record<string, string>);
  return app;
}

/** Register the dedicated FCM service worker, passing the config via query params. */
async function registerSw(): Promise<ServiceWorkerRegistration> {
  const qs = new URLSearchParams({
    apiKey: firebaseConfig.apiKey ?? '',
    authDomain: firebaseConfig.authDomain ?? '',
    projectId: firebaseConfig.projectId ?? '',
    storageBucket: firebaseConfig.storageBucket ?? '',
    messagingSenderId: firebaseConfig.messagingSenderId ?? '',
    appId: firebaseConfig.appId ?? '',
  }).toString();
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${qs}`, {
    scope: FCM_SW_SCOPE,
  });
}

function detectPlatform(): string {
  const ua = navigator.userAgent || '';
  const os = /android/i.test(ua)
    ? 'android'
    : /iphone|ipad|ipod/i.test(ua)
      ? 'ios'
      : 'web';
  const standalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    (navigator as unknown as { standalone?: boolean }).standalone;
  return standalone ? `pwa-${os}` : os;
}

// ── iOS native bridge (WKWebView shell) ────────────────────────────────────
// The native iOS app (built from ios-pwa-shell) can't use the Web Push API, so
// it exposes a JS bridge instead: the web posts to
// `window.webkit.messageHandlers.<name>` and the shell replies by dispatching
// CustomEvents on `window`. The FCM token is minted by the app's *native*
// Firebase SDK (GoogleService-Info.plist) — this path needs no web Firebase
// config or VAPID key. The handler/event names below are a contract that must
// stay in sync with the shell's Swift code (PushNotifications.swift / ViewController.swift).

type NativeMessageHandler = { postMessage: (message: unknown) => void };

/** The shell's message-handler registry, or undefined when not inside the app. */
function nativeHandlers():
  | Record<string, NativeMessageHandler | undefined>
  | undefined {
  return (
    window as unknown as {
      webkit?: {
        messageHandlers?: Record<string, NativeMessageHandler | undefined>;
      };
    }
  ).webkit?.messageHandlers;
}

/** True only when running inside the native iOS WKWebView shell. */
export function isIOSShell(): boolean {
  if (typeof window === 'undefined') return false;
  const handlers = nativeHandlers();
  return Boolean(handlers && handlers['push-token']);
}

/** Post a message to the native shell. The shell ignores the body for every
 *  handler except `push-subscribe`, which expects a JSON *string*. */
function postToNative(name: string, body: unknown = name): void {
  const handler = nativeHandlers()?.[name];
  if (handler) handler.postMessage(body);
}

let iosListenersWired = false;
let iosToken: string | null = null;
/** Whether the current iosToken has been accepted by the backend. Lets us defer
 *  registration until the user is authenticated and retry on failure. */
let iosTokenRegistered = false;

/** True only when an auth token is present, so a native token emission that
 *  races a logout/login transition can't POST /notifications/device-token
 *  unauthenticated (a 401 would otherwise trip the global logout handler). */
function isAuthenticated(): boolean {
  try {
    return Boolean(useAuthStore.getState().token);
  } catch {
    return false;
  }
}

/** Register the captured native token, but only while authenticated and not
 *  already registered. Safe to call repeatedly (e.g. to flush on login). */
function registerIOSTokenIfReady(): void {
  if (!iosToken || iosTokenRegistered || !isAuthenticated()) return;
  iosTokenRegistered = true;
  void registerDeviceToken(iosToken, 'ios').catch(() => {
    iosTokenRegistered = false; // allow a later retry
  });
}

/** React Router navigator, registered by the app shell so notification taps do
 *  client-side navigation instead of a full reload. Null until App mounts. */
let spaNavigate: ((path: string) => void) | null = null;

/** Let the React tree hand us its navigate() so deep links stay in-SPA.
 *  Pass null on unmount. */
export function setPushNavigator(navigate: ((path: string) => void) | null): void {
  spaNavigate = navigate;
}

function eventDetail(event: Event): unknown {
  return (event as CustomEvent).detail;
}

/** Pull a deep-link target out of a native push payload, if one is present. */
function extractLink(detail: unknown): string | null {
  if (!detail || typeof detail !== 'object') return null;
  const obj = detail as Record<string, unknown>;
  const nested = obj.data as Record<string, unknown> | undefined;
  const link = obj.link ?? obj.url ?? nested?.link ?? nested?.url;
  return typeof link === 'string' && link.length > 0 ? link : null;
}

// ── Web-push deep-link stash (shared with firebase-messaging-sw.js) ──────────
// The FCM service worker writes the tapped notification's target route into the
// Cache API (it can't reliably postMessage a page launched via openWindow, which
// loads uncontrolled). The app PULLS the route here whenever it regains focus,
// so the navigation works regardless of service-worker control state.
const PENDING_ROUTE_CACHE = 'push-pending-route';
const PENDING_ROUTE_KEY = '/__pending_push_route';
let consumingPendingRoute = false;

/** Read + clear the route the service worker stashed on notification tap, then
 *  navigate to it in-SPA. Safe to call repeatedly / from multiple triggers
 *  (visibilitychange, focus, mount, the PUSH_NAVIGATE nudge) — it deletes the
 *  entry so only the first call navigates. No-op when nothing is pending. */
export async function consumePendingPushRoute(): Promise<void> {
  if (consumingPendingRoute) return;
  if (typeof caches === 'undefined') return;
  consumingPendingRoute = true;
  try {
    const cache = await caches.open(PENDING_ROUTE_CACHE);
    const res = await cache.match(PENDING_ROUTE_KEY);
    if (!res) return;
    await cache.delete(PENDING_ROUTE_KEY);
    const { route, ts } = (await res.json()) as { route?: string; ts?: number };
    // Ignore stale stashes (>2 min) so an old tap can't hijack a later focus.
    if (route && (!ts || Date.now() - ts < 120_000)) {
      followDeepLink(route);
    }
  } catch {
    /* best-effort */
  } finally {
    consumingPendingRoute = false;
  }
}

/** Home route seeded behind a cold-launch deep link so Back has somewhere to go. */
const DEEP_LINK_HOME = '/user/dashboard';

/** True on a cold app launch, where the browser/WKWebView history holds only the
 *  current entry. Tapping a notification then opens the deep link with nothing
 *  behind it, so the in-app/hardware Back button is a dead end. */
function isColdLaunch(): boolean {
  try {
    return window.history.length <= 1;
  } catch {
    return false;
  }
}

/** Navigate in-SPA when a navigator is registered, else fall back to a full load. */
function goTo(path: string): void {
  if (spaNavigate) spaNavigate(path);
  else window.location.assign(path);
}

/** Follow a notification deep link. Same-origin targets go through React Router
 *  (no full reload, no WKWebView host-allowlist round-trip); external URLs fall
 *  back to the browser, which the shell opens in SFSafariViewController.
 *  Shared by the iOS native bridge and the web-push stash consumer above.
 *
 *  On a cold launch (empty history) we first seed the user dashboard as a base
 *  entry, then push the deep link, so Back returns to the dashboard instead of
 *  dead-ending on the launched page (e.g. opening straight into chat from a push). */
export function followDeepLink(link: string): void {
  try {
    const url = new URL(link, window.location.origin);
    if (url.origin === window.location.origin) {
      const path = url.pathname + url.search + url.hash;
      if (isColdLaunch() && url.pathname !== DEEP_LINK_HOME) {
        goTo(DEEP_LINK_HOME);
      }
      goTo(path);
    } else {
      window.location.assign(link);
    }
  } catch {
    // Not a parseable URL — treat as an in-app relative path.
    if (isColdLaunch() && link !== DEEP_LINK_HOME) goTo(DEEP_LINK_HOME);
    goTo(link);
  }
}

/** Wire the persistent native→web listeners exactly once per page load. */
function wireIOSListeners(): void {
  if (iosListenersWired || typeof window === 'undefined') return;
  iosListenersWired = true;

  // FCM token delivered by the shell — on explicit request and on every native
  // token refresh (the shell's MessagingDelegate re-emits this automatically).
  window.addEventListener('push-token', (event) => {
    const detail = eventDetail(event);
    const token = typeof detail === 'string' ? detail : '';
    if (!token || token === 'ERROR GET TOKEN') return;
    if (token !== iosToken) {
      iosToken = token;
      iosTokenRegistered = false; // a new token must be (re)registered
      try {
        localStorage.setItem(DEVICE_TOKEN_KEY, token);
      } catch {
        /* ignore — persistence is only a fallback for logout teardown */
      }
    }
    registerIOSTokenIfReady();
  });

  // Result of the native permission prompt.
  window.addEventListener('push-permission-request', (event) => {
    if (eventDetail(event) === 'granted') postToNative('push-token');
  });

  // Foreground push received → refresh the in-app bell.
  window.addEventListener('push-notification', () => emitNotificationsChanged());

  // Notification tapped → refresh, then deep-link if the payload carries a target.
  window.addEventListener('push-notification-click', (event) => {
    emitNotificationsChanged();
    const link = extractLink(eventDetail(event));
    if (link) {
      try {
        followDeepLink(link);
      } catch {
        /* ignore */
      }
    }
  });
}

/**
 * iOS branch of setupPushForUser: register silently if the user already granted
 * notifications, otherwise arm a one-time prompt on their next gesture (iOS
 * requires a user gesture to show the permission dialog). Returns a cleanup fn.
 */
function setupPushIOS(): () => void {
  wireIOSListeners();
  // Flush a token that the shell may have emitted before auth was ready.
  registerIOSTokenIfReady();

  let cleanupGesture: () => void = () => {};
  const armGesturePrompt = () => {
    const handler = () => {
      cleanupGesture();
      postToNative('push-permission-request');
    };
    cleanupGesture = () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
  };

  const onState = (event: Event) => {
    window.removeEventListener('push-permission-state', onState);
    const state = eventDetail(event);
    if (
      state === 'authorized' ||
      state === 'ephemeral' ||
      state === 'provisional'
    ) {
      postToNative('push-token'); // already granted → fetch + register the token
    } else if (state === 'notDetermined') {
      armGesturePrompt(); // prompt on the user's next interaction
    }
    // 'denied' / unknown → wait for an explicit enablePushNotifications() call
  };
  window.addEventListener('push-permission-state', onState);
  postToNative('push-permission-state');

  return () => {
    window.removeEventListener('push-permission-state', onState);
    cleanupGesture();
  };
}

/** Subscribe/unsubscribe this device to an FCM topic via the native shell.
 *  No-op outside the iOS app (web topic management isn't wired). */
export function setIOSTopicSubscription(
  topic: string,
  unsubscribe = false,
): void {
  if (!isIOSShell()) return;
  postToNative('push-subscribe', JSON.stringify({ topic, unsubscribe }));
}

/**
 * True only where web push actually works. This automatically excludes iOS
 * Safari tabs and iOS Chrome (no Push API) — on iOS, isSupported() returns true
 * only inside an installed PWA (Add to Home Screen, iOS 16.4+).
 */
export async function isPushSupported(): Promise<boolean> {
  if (!isConfigured) return false;
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return false;
  try {
    return await isSupported();
  } catch {
    return false;
  }
}

/**
 * Idempotently set up push for the signed-in user: obtain an FCM token,
 * register it with the backend, and wire the foreground handler. Only prompts
 * for permission when `promptIfDefault` is true (and only from a user gesture).
 * No-ops when push is unsupported / unconfigured. Safe to call repeatedly.
 */
export async function initPushNotifications(
  options: { promptIfDefault?: boolean } = {},
): Promise<void> {
  const { promptIfDefault = false } = options;
  if (!(await isPushSupported())) return;
  if (Notification.permission === 'denied') return;
  if (Notification.permission === 'default') {
    if (!promptIfDefault) return;
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return;
  }

  try {
    const registration = await registerSw();
    messaging = getMessaging(getApp());
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!token) return;
    currentToken = token;
    await registerDeviceToken(token, detectPlatform());
    try {
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    } catch {
      /* ignore — persistence is only a fallback for logout teardown */
    }

    if (!foregroundWired) {
      foregroundWired = true;
      onMessage(messaging, (payload) => {
        // App is in the foreground: the OS won't show a banner automatically.
        emitNotificationsChanged(); // refresh the in-app bell
        if (payload.notification) {
          void registration.showNotification(
            payload.notification.title || 'Prajaakeeya',
            {
              body: payload.notification.body || '',
              icon: '/images/android-chrome-192x192.png',
              data: payload.data || {},
            },
          );
        }
      });
    }
  } catch (err) {
    // Best-effort; never break the app over notifications.
    console.warn('[push] init failed', err);
  }
}

/** Prompt the user (call from a click handler / "Enable notifications" button). */
export function enablePushNotifications(): Promise<void> {
  if (isIOSShell()) {
    wireIOSListeners();
    postToNative('push-permission-request');
    return Promise.resolve();
  }
  return initPushNotifications({ promptIfDefault: true });
}

/**
 * Wire push for an authenticated user:
 *  - register silently if permission was already granted;
 *  - otherwise arm a ONE-TIME prompt on the next user gesture (browsers, and
 *    especially iOS, require a gesture to show the permission dialog).
 * Returns a cleanup function for use in a React effect.
 */
export function setupPushForUser(): () => void {
  if (typeof window === 'undefined') return () => {};

  // Inside the native iOS app, push runs over the WKWebView bridge (native FCM),
  // independent of the web Firebase config. Check this before the isConfigured
  // gate so iOS works even when the web VAPID env isn't set.
  if (isIOSShell()) return setupPushIOS();

  if (!isConfigured) return () => {};

  void initPushNotifications({ promptIfDefault: false });

  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    const handler = () => {
      cleanup();
      void initPushNotifications({ promptIfDefault: true });
    };
    const cleanup = () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    return cleanup;
  }
  return () => {};
}

/** Best-effort teardown on logout: remove the token server-side and locally. */
export async function disablePushNotifications(): Promise<void> {
  // iOS native bridge: the token is owned by the native FCM SDK, so we can only
  // unregister it from our backend and drop our local copy. The native shell
  // keeps its own token (a fresh login re-registers it via setupPushIOS).
  if (isIOSShell()) {
    let stored = iosToken;
    if (!stored) {
      try {
        stored = localStorage.getItem(DEVICE_TOKEN_KEY);
      } catch {
        /* ignore */
      }
    }
    if (stored) await unregisterDeviceToken(stored).catch(() => undefined);
    iosToken = null;
    iosTokenRegistered = false;
    try {
      localStorage.removeItem(DEVICE_TOKEN_KEY);
    } catch {
      /* ignore */
    }
    return;
  }

  // Resolve the token to unregister. Prefer the one captured at register time,
  // then the persisted copy (survives page reloads), then ask FCM for the live
  // token. Without these fallbacks, logging out right after a reload — before
  // setupPushForUser re-runs — leaves currentToken null and the device-token
  // row is never deleted server-side.
  let token = currentToken;
  if (!token) {
    try {
      token = localStorage.getItem(DEVICE_TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }
  try {
    if (!messaging && (await isPushSupported())) {
      messaging = getMessaging(getApp());
    }
    if (!token && messaging && Notification.permission === 'granted') {
      try {
        const registration = await registerSw();
        token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });
      } catch {
        /* ignore — fall through with whatever we have */
      }
    }
    if (token) await unregisterDeviceToken(token).catch(() => undefined);
    // Invalidate the token in FCM so this device stops receiving pushes and the
    // next login mints a fresh one — run even if the server delete failed.
    if (messaging) await deleteToken(messaging).catch(() => undefined);
  } catch {
    /* ignore */
  } finally {
    currentToken = null;
    try {
      localStorage.removeItem(DEVICE_TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }
}
