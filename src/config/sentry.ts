import * as Sentry from '@sentry/react';

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
