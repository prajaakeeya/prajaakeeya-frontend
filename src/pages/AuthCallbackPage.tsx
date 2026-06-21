import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Alert, Stack, Typography } from '@mui/material';
import useAuthStore from '../store/useAuthStore';
import { consumeGoogleOAuthState, exchangeGoogleOAuthCode } from '../services/authService';
import { AuthUser } from '../types/auth';

/**
 * Handles the redirect back from the backend Google OAuth flow.
 * Preferred backend redirect: /auth/callback?code=<one-time-code>&state=...
 * Legacy token redirects are still accepted during rollout, but the URL is
 * scrubbed immediately and the token is kept in memory only.
 */
const AuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const handled = useRef(false);

  const error = params.get('error');
  const code = params.get('code');
  const state = params.get('state');
  const queryToken = params.get('token');
  const userParam = params.get('user');
  const hashParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '',
  );
  const token = queryToken ?? hashParams.get('token');

  const finishAuth = useCallback((authToken: string | null | undefined, authUser: Partial<AuthUser> | null | undefined) => {
    const user = authUser ?? {};
    const fromRegisterPage = sessionStorage.getItem('__FROM_REGISTER__') === '1';
    sessionStorage.removeItem('__FROM_REGISTER__');

    let userId: string | null = user?.id != null ? String(user.id) : null;
    if (!userId && authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split('.')[1] ?? ''));
        userId = payload?.sub != null ? String(payload.sub) : null;
      } catch {
        // Treat as unknown user id.
      }
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

    const alreadyCelebrated = userId != null && celebratedIds.includes(userId);
    if (fromRegisterPage && !alreadyCelebrated) {
      if (userId != null) {
        try {
          localStorage.setItem(CELEBRATED_KEY, JSON.stringify([...celebratedIds, userId]));
        } catch {
          // Ignore storage errors.
        }
      }
      sessionStorage.setItem('__PENDING_AUTH__', JSON.stringify({ token: authToken ?? null, user }));
      navigate('/register?celebrate=1', { replace: true });
      return;
    }

    setAuth(authToken, user as AuthUser);
    navigate('/user/dashboard', { replace: true });
  }, [navigate, setAuth]);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (typeof window !== 'undefined' && (window.location.search || window.location.hash)) {
      window.history.replaceState(null, document.title, window.location.pathname);
    }

    if (error) return;

    const run = async () => {
      try {
        if (code) {
          if (!consumeGoogleOAuthState(state)) {
            throw new Error('Invalid OAuth state');
          }
          const response = await exchangeGoogleOAuthCode({ code, state: state ?? '' });
          finishAuth(response.token, response.user);
          return;
        }

        if (!token) return;

        if (state && !consumeGoogleOAuthState(state)) {
          throw new Error('Invalid OAuth state');
        }

        const user = userParam ? JSON.parse(userParam) : null;
        finishAuth(token, user);
      } catch (e) {
        console.error('Failed to process auth callback params', e);
      }
    };

    void run();
  }, [code, state, token, userParam, error, finishAuth]);

  if (error || (!code && !token)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Stack spacing={2} alignItems="center" maxWidth={420}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error || 'Missing authentication code'}
          </Alert>
          <Typography
            onClick={() => navigate('/login', { replace: true })}
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
