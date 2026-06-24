import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Alert, Stack, Typography } from '@mui/material';
import useAuthStore from '../store/useAuthStore';

/**
 * Handles the redirect back from the backend Google OAuth flow.
 * Backend redirects to: /auth/callback?token=<jwt>&user=<url-encoded-json>
 * (or ?error=...).
 */
const AuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const handled = useRef(false);

  const error = params.get('error');
  const token = params.get('token');
  const userParam = params.get('user');

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (error || !token) return;

    try {
      const user = userParam ? JSON.parse(decodeURIComponent(userParam)) : null;

      // Detect a first-time registration and route through the register
      // page so the celebration screen is shown. We combine two signals:
      //   1. The OAuth flow must have started from the Register page
      //      (sessionStorage __FROM_REGISTER__ flag), AND
      //   2. We have not celebrated this user id on this device before
      //      (tracked in localStorage). The user id is decoded from the
      //      JWT "sub" claim, since the backend does not return a user
      //      object on the callback.
      const fromRegisterPage =
        sessionStorage.getItem('__FROM_REGISTER__') === '1';
      sessionStorage.removeItem('__FROM_REGISTER__');

      let jwtSub: string | null = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
        jwtSub = payload?.sub != null ? String(payload.sub) : null;
      } catch {
        // ignore — treat as unknown user id
      }

      const CELEBRATED_KEY = '__celebrated_user_ids__';
      let celebratedIds: string[] = [];
      try {
        const raw = localStorage.getItem(CELEBRATED_KEY);
        if (raw) celebratedIds = JSON.parse(raw);
        if (!Array.isArray(celebratedIds)) celebratedIds = [];
      } catch {
        celebratedIds = [];
      }
      const alreadyCelebrated =
        jwtSub != null && celebratedIds.includes(jwtSub);

      const isFreshSignup = fromRegisterPage && !alreadyCelebrated;

      if (isFreshSignup) {
        if (jwtSub != null) {
          try {
            localStorage.setItem(
              CELEBRATED_KEY,
              JSON.stringify([...celebratedIds, jwtSub]),
            );
          } catch {
            // ignore storage errors
          }
        }
        sessionStorage.setItem(
          '__PENDING_AUTH__',
          JSON.stringify({ token, user: user ?? {} }),
        );
        navigate('/register?celebrate=1', { replace: true });
        return;
      }

      if (!user) {
        // Token without user payload — set a placeholder; App.tsx will call fetchProfile()
        setAuth(token, {} as any);
      } else {
        setAuth(token, user);
      }
      
      // Check if there's a saved return path (e.g., from guest dashboard)
      const returnTo = sessionStorage.getItem('__RETURN_TO__');
      sessionStorage.removeItem('__RETURN_TO__');
      // Security: only allow internal relative paths
      const isSafeInternal = returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//');
      navigate(isSafeInternal ? returnTo : '/user/dashboard', { replace: true });
    } catch (e) {
      console.error('Failed to parse auth callback params', e);
    }
  }, [token, userParam, error, setAuth, navigate]);

  if (error || !token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Stack spacing={2} alignItems="center" maxWidth={420}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error || 'Missing authentication token'}
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
