import * as Sentry from '@sentry/react';

// Query params that may carry a JWT or PII and must never reach Sentry.
// `token` is the auth JWT (OAuth callback URL + SSE chat stream URL); `user`
// is the url-encoded user JSON in the OAuth callback URL.
const SENSITIVE_QUERY_KEYS = ['token', 'user'];

// Replaces the value of any sensitive query param in a URL-ish string with
// `[redacted]`, leaving everything else intact. Works on absolute URLs,
// path+query strings, and bare `?a=b` fragments. Returns the input unchanged
// when there is nothing to scrub.
function scrubUrl(value: string): string {
  if (!value.includes('=')) return value;
  let scrubbed = value;
  for (const key of SENSITIVE_QUERY_KEYS) {
    // Match `key=<value>` up to the next & or # (or end of string), in either
    // the query string or a forged value, regardless of position.
    const re = new RegExp(`([?&]${key}=)[^&#\\s]*`, 'gi');
    scrubbed = scrubbed.replace(re, `$1[redacted]`);
  }
  return scrubbed;
}

// Error tracking via Sentry.
//
// Initialises only when VITE_SENTRY_DSN is set, so local dev (and any build
// without the DSN) stays completely silent — no events captured, no network
// calls. This keeps the dashboard free of noise from developer machines.
//
// sendDefaultPii is intentionally false: Sentry will NOT attach users' IP
// addresses or other personally identifiable data to events. Flip it to true
// only if the client decides per-user/IP tracking is required (and update the
// privacy policy accordingly).
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  // Only run in built/deployed apps with a DSN configured. import.meta.env.PROD
  // is false under the Vite dev server, so `npm run dev` never sends events —
  // keeping the dashboard free of developer-machine noise. To test locally,
  // build and serve the production bundle: `npm run build && npm run preview`.
  if (!dsn || !import.meta.env.PROD) return;

  Sentry.init({
    dsn,
    // Lets you filter issues by environment in the Sentry UI. Falls back to
    // Vite's build mode ('development' | 'production') when not set explicitly.
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    // Tags every event with the build, so you can see which deploy a bug came
    // from. Set by CI/Amplify; harmless when undefined.
    release: import.meta.env.VITE_SENTRY_RELEASE,
    sendDefaultPii: false,
    // Performance monitoring: captures page-load and navigation transactions
    // plus outgoing request spans, so slow page loads and slow API calls show
    // up under Sentry → Performance. Sample 20% of transactions to keep volume
    // (and quota) reasonable in production; override via VITE_SENTRY_TRACES_RATE.
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_RATE ?? 0.2),
    // M-SEC-3 / H-SEC-1 / H-SEC-2: strip the auth JWT (and url-encoded user
    // PII) out of every breadcrumb before it is recorded. Sentry auto-
    // instruments fetch/XHR and navigation, so without this the SSE chat
    // stream URL (?token=<jwt>) and the OAuth callback URL (?token=&user=)
    // would be stored as breadcrumb data and shipped with the next event.
    beforeBreadcrumb(breadcrumb) {
      if (typeof breadcrumb.data?.url === 'string') {
        breadcrumb.data.url = scrubUrl(breadcrumb.data.url);
      }
      if (typeof breadcrumb.message === 'string') {
        breadcrumb.message = scrubUrl(breadcrumb.message);
      }
      return breadcrumb;
    },
    // Scrub the same sensitive params from the event itself: the request URL
    // captured on transactions/errors and the `extra.url` we attach in the
    // apiClient response interceptor. Belt-and-suspenders alongside the
    // breadcrumb scrub above.
    beforeSend(event) {
      if (event.request?.url) {
        event.request.url = scrubUrl(event.request.url);
      }
      if (event.extra && typeof event.extra.url === 'string') {
        event.extra.url = scrubUrl(event.extra.url);
      }
      return event;
    },
  });
}

// Attach the authenticated user to all subsequent Sentry events so errors can
// be correlated to a specific account. Only non-PII identifiers are sent (id +
// role); email/phone/name are intentionally omitted to match sendDefaultPii:false.
// No-op until Sentry is initialised, so safe to call in dev.
export function setSentryUser(user: { id?: string | number; role?: string } | null): void {
  if (!import.meta.env.VITE_SENTRY_DSN || !import.meta.env.PROD) return;
  if (!user || user.id == null) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({ id: String(user.id), ...(user.role ? { role: user.role } : {}) });
}
