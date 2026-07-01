import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '../types/auth';
import apiClient from '../services/apiClient';
import { fetchProfile } from '../services/authService';
import { getWardById } from '../services/wardService';
import { isMockMode } from '../config/appMode';
import { COOKIE_AUTH } from '../config/authMode';
import { setSentryUser } from '../config/sentry';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAdmin: false,
      isAuthenticated: false,
      setAuth: (token, user) => {
        // Cookie mode: the httpOnly `session` cookie authenticates requests, so
        // there is no token to attach as a Bearer header (token is '' here).
        // Legacy mode: pin the Bearer header for all subsequent calls.
        if (!COOKIE_AUTH && token) {
          apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        // Normalize user to ensure ward fields are available whether API returns nested `ward` or top-level wardName/wardNumber
        const normalizedUser: AuthUser = {
          ...user,
          aspirantWardNumber: user.aspirantWardNumber,
          wardId: user.ward?.id ?? user.wardId,
          wardNumber: user.ward?.number ?? user.wardNumber,
          wardName: user.ward?.name ?? user.wardName,
          assembly: user.ward?.assembly ?? user.assembly,
          ward: user.ward ?? {
            id: user.wardId,
            number: user.wardNumber,
            name: user.wardName,
            assembly: user.assembly,
            parliamentary: user.parliamentary,
            state: user.state
          }
        };

        set({ token, user: normalizedUser, isAdmin: normalizedUser.role === 'admin', isAuthenticated: true });
        setSentryUser({ id: normalizedUser.id, role: normalizedUser.role });
      },
      // Clear the current session (in-memory state + persisted localStorage)
      // WITHOUT triggering a full-page reload. Use this when you need to drop
      // a previous user's cached data before attaching a new session — e.g.
      // at the end of a fresh OAuth sign-up on a device where someone else
      // was previously logged in.
      clearSession: () => {
        set({ token: null, user: null, isAdmin: false, isAuthenticated: false });
        setSentryUser(null);
        delete apiClient.defaults.headers.common.Authorization;
        const preserveKeys = ['theme-storage', 'i18nextLng'];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('civic_raised_')) preserveKeys.push(key);
        }
        const preserved: Record<string, string> = {};
        preserveKeys.forEach(key => {
          const val = localStorage.getItem(key);
          if (val !== null) preserved[key] = val;
        });
        localStorage.clear();
        Object.entries(preserved).forEach(([key, val]) => localStorage.setItem(key, val));
      },
      logout: async () => {
        // Capture the JWT/header BEFORE we wipe state, so the best-effort backend
        // cleanup below (which needs a valid session) can still run afterwards.
        const hadAuthHeader = apiClient.defaults.headers.common.Authorization;

        // ── 1. Clear auth state SYNCHRONOUSLY, first thing ──────────────────
        // The previous order awaited push-token + cookie + cache deletion (up to
        // ~6s) BEFORE clearing isAuthenticated, so the UI still looked logged in
        // during that window — the user briefly saw the dashboard before logout
        // "took". Flip it: drop auth state immediately so the app reflects logged
        // out instantly, then do the slow best-effort cleanup in the background.
        set({ token: null, user: null, isAdmin: false, isAuthenticated: false });
        setSentryUser(null);
        delete apiClient.defaults.headers.common.Authorization;

        // Clear all localStorage except theme, language, and civic raised state
        const preserveKeys = ['theme-storage', 'i18nextLng'];
        // Preserve all civic_raised_* keys so hand-raise history survives logout
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('civic_raised_')) preserveKeys.push(key);
        }
        const preserved: Record<string, string> = {};
        preserveKeys.forEach(key => {
          const val = localStorage.getItem(key);
          if (val !== null) preserved[key] = val;
        });
        localStorage.clear();
        Object.entries(preserved).forEach(([key, val]) => localStorage.setItem(key, val));

        // ── 2. Best-effort backend/cache cleanup (does NOT block the UI) ─────
        // Remove this device's FCM push token, clear the httpOnly session cookie
        // (cookie mode — JS can't delete it, only the server can), and drop the
        // SW api-cache (H-SEC-3). Each is capped so a slow/unreachable API can't
        // hang logout. The push/cookie calls still carry credentials: the cookie
        // is sent until the server clears it, and the captured header is restored
        // just for these requests. All failures are swallowed.
        if (hadAuthHeader) {
          apiClient.defaults.headers.common.Authorization = hadAuthHeader;
        }
        // Push-token removal and SW-cache deletion are truly fire-and-forget —
        // they don't need to finish before we redirect, so we never await them.
        void import('../services/pushNotifications')
          .then((push) => push.disablePushNotifications())
          .catch(() => undefined);
        if (typeof window !== 'undefined' && 'caches' in window) {
          void caches.delete('api-cache').catch(() => undefined);
        }
        // Cookie clear (cookie mode) is the one call worth a SHORT wait — we'd
        // like the server to drop the httpOnly session before the reload — but
        // capped tight (600ms) so the redirect (and preloader) appears almost
        // instantly. If it doesn't finish in time, the cookie still expires
        // server-side on its own, so this stays best-effort.
        if (COOKIE_AUTH) {
          try {
            const { logoutSession } = await import('../services/authService');
            await Promise.race([
              logoutSession().catch(() => undefined),
              new Promise((resolve) => setTimeout(resolve, 600)),
            ]);
          } catch {
            /* best-effort — cookie expires server-side regardless */
          }
        }
        delete apiClient.defaults.headers.common.Authorization;

        // ── 3. Hard refresh to '/' so the next session loads the latest build ─
        // This shows the preloader and lands on HomePage. replace() (not href=)
        // so logout doesn't leave the post-logout page on the history stack —
        // prevents back-button loops back into a stale session. Callers must NOT
        // also navigate() — a client-side nav here races this hard reload and
        // briefly flashes the register/home page before the preloader appears.
        window.location.replace('/');
      },
      fetchProfile: async () => {
        const state = get();
        // Cookie mode: there is no token to gate on — the session lives in the
        // httpOnly cookie, so /auth/me is the ONLY way to know whether we're
        // authenticated. A 401 here means no/expired session and the apiClient
        // interceptor will trigger refresh-or-logout. Legacy mode still requires
        // a stored token before bothering to hit the API.
        if (!COOKIE_AUTH && !state.token) return;
        if (isMockMode) {
          if (state.user) {
            set({ isAdmin: state.user.role === 'admin', isAuthenticated: true });
          }
          return;
        }
        try {
          const response = await fetchProfile();
          const apiUser = response.data as AuthUser;
          // Normalize nested ward object into top-level fields if present
          const normalizedUser: AuthUser = {
            ...apiUser,
            aspirantId: apiUser.aspirantId,
            wardId: apiUser.ward?.id ?? apiUser.wardId,
            wardNumber: apiUser.ward?.number ?? apiUser.wardNumber,
            wardName: apiUser.ward?.name ?? apiUser.wardName,
            assembly: apiUser.ward?.assembly ?? apiUser.assembly
          };
          // If API returned only wardId, fetch ward details to populate wardNumber/wardName/assembly
          if ((normalizedUser.wardNumber === undefined || normalizedUser.wardName === undefined) && normalizedUser.wardId) {
            try {
              const wardResp = await getWardById(normalizedUser.wardId as number);
              const wardData = (wardResp && (wardResp as { data: Record<string, unknown> }).data) || null;
              if (wardData) {
                normalizedUser.wardNumber = normalizedUser.wardNumber ?? wardData.number;
                normalizedUser.wardName = normalizedUser.wardName ?? wardData.name;
                normalizedUser.assembly = normalizedUser.assembly ?? wardData.assembly;
                normalizedUser.parliamentary = normalizedUser.parliamentary ?? wardData.parliamentary;
                normalizedUser.state = normalizedUser.state ?? wardData.state;
              }
            } catch (e) {
              console.warn('[auth] fetch ward by id failed', e);
            }
          }
          set({ user: normalizedUser, isAdmin: normalizedUser.role === 'admin', isAuthenticated: true });
          setSentryUser({ id: normalizedUser.id, role: normalizedUser.role });
        } catch (err) {
          console.warn('[auth] fetchProfile failed', err);
          // Cookie mode: /auth/me is the source of truth for "am I logged in".
          // A 401 here simply means no/expired session, so reflect that as
          // unauthenticated and let the UI route to login. /auth/me is a "soft"
          // endpoint in the apiClient interceptor (no refresh, no logout/reload),
          // so this catch is the ONLY place that reacts to it — no loop.
          if (COOKIE_AUTH) {
            set({ user: null, isAdmin: false, isAuthenticated: false });
            setSentryUser(null);
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      // Cookie mode: never persist a token (there isn't one — the session lives
      // in the httpOnly cookie). Persist only the user so the UI can render
      // optimistically on reload while /auth/me re-confirms. Legacy mode keeps
      // persisting the token as before.
      partialize: (state) =>
        COOKIE_AUTH ? { user: state.user } : { token: state.token, user: state.user },
      onRehydrateStorage: () => (state) => {
        if (COOKIE_AUTH) {
          // No token to pin as a Bearer header — the cookie authenticates. If a
          // user was persisted, optimistically mark authenticated; App.tsx then
          // calls fetchProfile() (/auth/me) which confirms or clears this.
          if (state?.user) {
            state.isAuthenticated = true;
            state.isAdmin = state.user.role === 'admin';
            setSentryUser({ id: state.user.id, role: state.user.role });
          }
          return;
        }
        // Legacy: on page refresh, if we have a token and user, restore auth state
        if (state?.token && state?.user) {
          apiClient.defaults.headers.common.Authorization = `Bearer ${state.token}`;
          state.isAuthenticated = true;
          state.isAdmin = state.user.role === 'admin';
          setSentryUser({ id: state.user.id, role: state.user.role });
        }
      }
    }
  )
);

export default useAuthStore;
