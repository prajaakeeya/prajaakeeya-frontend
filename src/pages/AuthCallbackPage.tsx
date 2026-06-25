import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Alert, Stack, Typography } from '@mui/material';
import useAuthStore from '../store/useAuthStore';
import { GOOGLE_OAUTH_STATE_KEY, exchangeGoogleCode } from '../services/authService';
import { COOKIE_AUTH } from '../config/authMode';

/**
 * Handles the redirect back from the backend Google OAuth flow.
 *
 * Legacy flow: /auth/callback?token=<jwt>&user=<url-encoded-json> (or ?error=).
 * Cookie flow (COOKIE_AUTH): /auth/callback?code=<one-time>&state=<csrf>; we
 * exchange the code for a session (httpOnly cookie) and read `user` from the
 * exchange response — there is no JWT in the URL to read or decode.
 */
const AuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const handled = useRef(false);
  const [stateError, setStateError] = useState<string | null>(null);

  const error = params.get('error');
  const token = params.get('token');
  const userParam = params.get('user');

  // Shared tail for both flows: given the authenticated user (and, in legacy
  // mode, the JWT) decide whether to show the first-time-signup celebration or
  // go straight to the dashboard. In cookie mode there is no token to carry —
  // the httpOnly session cookie is already set by the exchange — so `token` is
  // an empty string and the celebration screen finalizes auth from the cookie.
  const finalizeSession = (userId: string | null, user: any, jwt: string) => {
    const fromRegisterPage = sessionStorage.getItem('__FROM_REGISTER__') === '1';
    sessionStorage.removeItem('__FROM_REGISTER__');

    const CELEBRATED_KEY = '__celebrated_user_ids__';
    let celebratedIds: string[] = [];
    try {
      const raw = localStorage.getItem(CELEBRATED_KEY);
      if (raw) celebratedIds = JSON.parse(raw);
      if (!Array.isArray(celebratedIds)) celebratedIds = [];
    } catch {
      celebratedIds = [];
    }
    const alreadyCelebrated = userId != null && celebratedIds.includes(userId);
    const isFreshSignup = fromRegisterPage && !alreadyCelebrated;

    if (isFreshSignup) {
      if (userId != null) {
        try {
          localStorage.setItem(
            CELEBRATED_KEY,
            JSON.stringify([...celebratedIds, userId]),
          );
        } catch {
          // ignore storage errors
        }
      }
      sessionStorage.setItem(
        '__PENDING_AUTH__',
        JSON.stringify({ token: jwt, user: user ?? {} }),
      );
      navigate('/register?celebrate=1', { replace: true });
      return;
    }

    if (!user) {
      // No user payload — set a placeholder; App.tsx will call fetchProfile().
      setAuth(jwt, {} as any);
    } else {
      setAuth(jwt, user);
    }
    navigate('/user/dashboard', { replace: true });
  };

  // COOKIE_AUTH callback: ?code=<one-time>&state=<csrf>. Verify CSRF, exchange
  // the code for a session cookie, then finalize from the returned user.
  const handleCookieCallback = async () => {
    const callbackError = params.get('error');
    if (callbackError) {
      setStateError(callbackError);
      return;
    }

    const code = params.get('code');
    const receivedState = params.get('state');
    const expectedState = sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
    sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);

    // CSRF check: the echoed state MUST match what we stored before redirecting.
    if (!code || !receivedState || !expectedState || receivedState !== expectedState) {
      setStateError('Login failed: invalid state. Please try again.');
      return;
    }

    // Scrub code/state out of the URL before any navigation or error reporting
    // can record them (they are single-use, but defense in depth).
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState({}, '', '/auth/callback');
    }

    try {
      // Single-use, 60s code → session cookie + user. Never retry the same code.
      const { user } = await exchangeGoogleCode(code, receivedState);
      const userId = user?.id != null ? String(user.id) : null;
      // No JWT on web (cookie holds it) — pass '' as the token everywhere.
      finalizeSession(userId, user, '');
    } catch (e) {
      console.error('OAuth code exchange failed', e);
      setStateError('Login failed or link expired. Please sign in again.');
    }
  };

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (COOKIE_AUTH) {
      void handleCookieCallback();
      return;
    }

    if (error || !token) return;

    // C-SEC-1: Validate the OAuth CSRF `state` token before trusting the
    // token in the URL. getGoogleOAuthUrl() mints this value into
    // sessionStorage immediately before redirecting to the backend, so any
    // legitimate OAuth return carries a matching state. A forged callback
    // link (login-fixation / CSRF) will not — fail closed in that case.
    const expectedState = sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
    const receivedState = params.get('state');
    sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
    if (!expectedState || !receivedState || expectedState !== receivedState) {
      setStateError('Sign-in failed (state mismatch). Please try again.');
      return;
    }

    // H-SEC-2: Scrub the token + user PII out of the URL immediately, before
    // any further navigation or error reporting records it. The values were
    // already captured from useSearchParams above, so the login flow below is
    // unaffected — this only cleans the address bar / history / Referer / logs.
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState({}, '', '/auth/callback');
    }

    try {
      const user = userParam ? JSON.parse(decodeURIComponent(userParam)) : null;

      // The user id used to gate the first-time-signup celebration comes from
      // the JWT "sub" claim, since the legacy callback does not return a user
      // object. (Cookie mode reads it from the exchange response instead.)
      let jwtSub: string | null = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
        jwtSub = payload?.sub != null ? String(payload.sub) : null;
      } catch {
        // ignore — treat as unknown user id
      }

      finalizeSession(jwtSub, user, token);
    } catch (e) {
      console.error('Failed to parse auth callback params', e);
    }
  }, [token, userParam, error, setAuth, navigate]);

  // In cookie mode there is no `token` in the URL, so only an explicit error or
  // a CSRF/exchange failure (stateError) should show the error screen — never
  // the bare "missing token" state. Legacy mode still treats a missing token as
  // an error.
  const showError = COOKIE_AUTH ? Boolean(error || stateError) : Boolean(error || !token || stateError);

  if (showError) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
            maxWidth: 420
          }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error || stateError || 'Missing authentication token'}
          </Alert>
          <Typography
            onClick={() => navigate('/register', { replace: true })}
            sx={{ color: '#F5A800', cursor: 'pointer', fontWeight: 600 }}
          >
            Back to login
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
};

export default AuthCallbackPage;
