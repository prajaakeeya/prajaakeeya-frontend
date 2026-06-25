// Cookie-based auth migration flag (Google OAuth + Admin).
//
// Fail closed: default to the LEGACY token-in-URL + localStorage flow. The new
// httpOnly-cookie flow (one-time code exchange, /auth/refresh, no client-side
// token) must be opted into explicitly via VITE_COOKIE_AUTH=true once the
// backend's cookie endpoints are deployed. A missing/misbuilt env var can never
// silently switch a build to the cookie flow against a backend that doesn't yet
// set the session cookie (which would break every login).
//
// While this flag is false, every cookie-flow branch is dormant and the app
// behaves exactly as before. Flip it to true (and confirm CORS allow-list +
// cookie SameSite with the backend) to activate cookie auth; flip back to roll
// back instantly without a redeploy.
export const COOKIE_AUTH = import.meta.env.VITE_COOKIE_AUTH === 'true';
