import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  TextField, Button, Stack, Alert, Box, CircularProgress,
  Paper, IconButton, useTheme, Tooltip, Typography,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ContrastIcon from '@mui/icons-material/Contrast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { adminLoginWithPassword } from '../services/authService';
import { COOKIE_AUTH } from '../config/authMode';
import { isMockMode } from '../config/appMode';
import * as yup from 'yup';
import { emailSchema } from '../utils/validation';
import prajakeeya1 from '../assets/images/prajakeeya.webp';

interface AdminLoginForm {
  email: string;
  password: string;
}

const AdminLoginPage = () => {
  const { t, i18n } = useTranslation();
  const { setAuth, clearSession } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const schema = yup
    .object({
      email: emailSchema,
      password: yup.string().required('validation.required').min(6, 'validation.passwordMin')
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AdminLoginForm>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (values: AdminLoginForm) => {
    setError('');
    setLoading(true);
    try {
      clearSession();
      setRedirecting(true);

      if (isMockMode) {
        const dummyToken = 'dummy-jwt-token-' + Date.now();
        const dummyUser = {
          id: 1,
          name: 'Admin User',
          email: values.email,
          role: 'admin' as const
        };
        setAuth(dummyToken, dummyUser as any);
      } else {
        const { token, user } = await adminLoginWithPassword({ email: values.email, password: values.password });
        // Cookie mode: the admin/login response sets the httpOnly session cookie;
        // the returned `token` is only for native/mobile clients, so ignore it on
        // web and keep client state token-free. Legacy mode pins the Bearer token.
        setAuth(COOKIE_AUTH ? '' : token, user);
      }

      navigate('/admin/users', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || t('common.error') || 'Something went wrong');
      setRedirecting(false);
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <Box
        sx={{
          position: 'fixed', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          bgcolor: 'background.default', zIndex: 1300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: '90vw', sm: 400, md: 420 },
        borderRadius: 4,
        p: { xs: 3, sm: 5 },
        bgcolor: 'background.paper',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 40px rgba(0,0,0,0.6)'
          : '0 8px 32px rgba(0,0,0,0.10)',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(245,168,0,0.12)'
          : 'rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      {/* Theme toggle */}
      <Tooltip title={
        mode === 'dark'
          ? 'Switch to light mode'
          : mode === 'light'
          ? 'Switch to grey mode'
          : 'Switch to dark mode'
      }>
        <IconButton
          onClick={toggleTheme}
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'text.secondary',
          }}
        >
          {mode === 'dark' ? (
            <DarkModeIcon fontSize="small" />
          ) : mode === 'light' ? (
            <LightModeIcon fontSize="small" />
          ) : (
            <ContrastIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
            <Box
              component="img"
              src={prajakeeya1}
              alt="Prajakeeya"
              sx={{ width: 64, height: 64, borderRadius: 1, objectFit: 'contain' }}
            />
            <Typography sx={{
              fontFamily: '"Bebas Neue", "Impact", sans-serif',
              fontSize: '1.5rem',
              letterSpacing: '0.08em',
              lineHeight: 1,
              mt: 1,
              pb: 0.7,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #E02010 0%, #FFCB00 45%, #F5A800 100%)'
                : 'linear-gradient(135deg, #E02010 0%, #c32d0c 45%, #ff9500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {i18n.language === 'kn' ? 'ದಿ ರಿಯಲ್ ಪ್ರಜಾಕೀಯ' : 'The Real Prajaakeeya'}
            </Typography>
          </Box>

          <TextField
            label={t('adminLogin.emailLabel') || 'Email'}
            fullWidth
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email && t((errors.email.message as string) || 'validation.required')}
            disabled={loading}
            placeholder="you@example.com"
            type="email"
            autoFocus
          />

          <TextField
            label={t('adminLogin.passwordLabel') || 'Password'}
            fullWidth
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password && t((errors.password.message as string) || 'validation.required')}
            disabled={loading}
            placeholder="Enter your password"
            type="password"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ py: 1.5, borderRadius: 2, color: '#fff' }}
          >
            {loading ? t('common.loading') || 'Loading...' : t('adminLogin.login') || 'Login'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default AdminLoginPage;
