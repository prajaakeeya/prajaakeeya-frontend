import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Button, Stack, Alert, Box, CircularProgress, Divider, Typography, useTheme, InputAdornment } from '@mui/material';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import SplitAuthLayout from '../components/SplitAuthLayout';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { sendAspirantOtp, verifyAspirantLoginOtp, resendAspirantOtp } from '../services/authService';
import { getGoogleOAuthUrl } from '../services/authService';
import * as yup from 'yup';

interface AspirantLoginForm {
  phone: string;
  otp: string;
}

const GoogleSvg = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 33 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.9 29.3 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.6-.4-3.8-.1-.4-.4-.7-1-.7z" />
    <path fill="#FF3D00" d="M6.3 15.2l6.6 4.8C14.7 16.5 19 14 24 14c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.9 29.3 5 24 5 16.3 5 9.6 9.2 6.3 15.2z" />
    <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 36.5 26.8 37.5 24 37.5c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.7 40.8 16.4 45 24 45z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2.1 3.7-3.8 4.9l6.2 5.2C42.6 34.5 44 30 44 25c0-1.3-.1-2.6-.4-3.8-.1-.4-.4-.7-1-.7z" />
  </svg>
);

const UserLoginPage = () => {
  const { t } = useTranslation();
  const { setAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState<0 | 1>(0); // 0 = Voters, 1 = Aspirants
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [aspirantOtpSent, setAspirantOtpSent] = useState(false);
  const [aspirantPhone, setAspirantPhone] = useState('');
  const [aspirantVerificationId, setAspirantVerificationId] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [otpTimer > 0]);

  const aspirantSchema = yup.object({
    phone: yup.string().required('validation.required').matches(/^\d{10}$/, 'validation.invalidPhone'),
    otp: yup.string().required('validation.required').length(4, 'validation.otpLength')
  }).required();

  const aspirantForm = useForm<AspirantLoginForm>({
    resolver: yupResolver(aspirantSchema),
    defaultValues: { phone: '', otp: '' },
    mode: 'onChange'
  });

  const { setValue: setAspirantValue } = aspirantForm;

  const onAspirantRequestOtp = async () => {
    setError('');
    if (!aspirantPhone.match(/^\d{10}$/)) {
      setError(t('validation.invalidPhone') || 'Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const response = await sendAspirantOtp({ mobileNumber: aspirantPhone });
      setAspirantVerificationId(response.verificationId);
      setAspirantOtpSent(true);
      setOtpTimer(60);
      setError('');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setError(apiMessage || t('common.error') || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onAspirantSubmit = async (values: AspirantLoginForm) => {
    setError('');
    setLoading(true);
    try {
      const { token, user } = await verifyAspirantLoginOtp({
        mobileNumber: aspirantPhone,
        verificationId: aspirantVerificationId,
        code: values.otp
      });
      logout();
      setRedirecting(true);
      setAuth(token, user);
      navigate('/user/dashboard', { replace: true });
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setError(apiMessage || t('common.error') || 'Invalid OTP or something went wrong');
      setRedirecting(false);
    } finally {
      setLoading(false);
    }
  };

  const onAspirantResendOtp = async () => {
    setError('');
    setResendLoading(true);
    try {
      const response = await resendAspirantOtp({ mobileNumber: aspirantPhone });
      setAspirantVerificationId(response.verificationId);
      setOtpTimer(60);
      setError('');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setError(apiMessage || t('common.error') || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const isInWebView = typeof window !== 'undefined' && (/ReactNative/i.test(navigator.userAgent || '') || (window as any).isPrajaakeeyaApp);

  const onGoogleSignIn = () => {
    setError('');
    // In React Native WebView, delegate to native layer (it will open the same URL in an in-app browser)
    if (isInWebView && /ReactNative/i.test(navigator.userAgent || '')) {
      (window as any).ReactNativeWebView?.postMessage(
        JSON.stringify({ type: 'GOOGLE_SIGN_IN', url: getGoogleOAuthUrl() })
      );
      return;
    }
    setGoogleLoading(true);
    // Clear any stale auth before starting the OAuth flow
    logout();
    window.location.replace(getGoogleOAuthUrl());
  };

  useEffect(() => {
    if (otpTimer <= 0) return;
    const timer = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimer]);

  if (redirecting) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%)', zIndex: 1300 }}>
        <CircularProgress />
      </div>
    );
  }

  const darkFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      color: isDark ? '#fff' : theme.palette.text.primary,
      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.18)' },
      '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
      '&.Mui-focused fieldset': { borderColor: '#F5A800', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.55)' : theme.palette.text.secondary },
    '& .MuiInputLabel-root.Mui-focused': { color: '#F5A800' },
    '& .MuiInputLabel-root.Mui-disabled': { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(17,24,39,0.35)' },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(17,24,39,0.5)',
      color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(17,24,39,0.5)',
    },
    '& .MuiOutlinedInput-root.Mui-disabled fieldset': {
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.14)',
    },
    '& .MuiInputAdornment-root svg': { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(17,24,39,0.55)' },
    '& .MuiFormHelperText-root': { color: '#f87171' },
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
      WebkitBoxShadow: `0 0 0 100px ${isDark ? '#150E0E' : '#FFFFFF'} inset`,
      WebkitTextFillColor: isDark ? '#fff' : theme.palette.text.primary,
      caretColor: isDark ? '#fff' : theme.palette.text.primary,
    },
  };

  return (
    <SplitAuthLayout
      leftTitle={t('pages.login.leftTitle')}
      leftSubtitle={t('pages.login.leftSubtitle')}
      cardTitle={t('pages.login.title')}
      topContent={
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: { xs: 64, sm: 80 }, objectFit: 'contain' }} />
          <Typography sx={{ fontFamily: '"Bebas Neue", "Impact", sans-serif', fontSize: { xs: '1.4rem', sm: '1.7rem' }, letterSpacing: '0.08em', lineHeight: 1, background: isDark ? 'linear-gradient(135deg, #E02010 0%, #FFCB00 45%, #F5A800 100%)' : 'linear-gradient(135deg, #E02010 0%, #c32d0c 45%, #ff9500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            The Real Prajaakeeya
          </Typography>
        </Box>
      }
    >
      <Box sx={{ width: '100%' }}>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 3,
              bgcolor: 'rgba(200,24,10,0.12)',
              color: '#fca5a5',
              border: '1px solid rgba(200,24,10,0.3)',
              '& .MuiAlert-icon': { color: '#f87171' },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Google-only sign-in (voter + aspirant) */}
        <Stack spacing={2.5}>
          <Button
            type="button"
            variant="outlined"
            size="large"
            fullWidth
            disabled={googleLoading || loading}
            onClick={onGoogleSignIn}
            startIcon={googleLoading ? <CircularProgress size={18} color="inherit" /> : <GoogleSvg />}
            sx={{
              py: 1.3,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.97rem',
              border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.2)'}`,
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(17,24,39,0.85)',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)',
              boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.25)' : '0 2px 12px rgba(17,24,39,0.08)',
              '&:hover': {
                border: '1.5px solid #F5A800',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,1)',
              },
              '&.Mui-disabled': {
                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.1)'}`,
                color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.35)',
              },
            }}
          >
            {googleLoading ? t('common.loading') : t('pages.login.socialGoogle')}
          </Button>
        </Stack>

        {/* Bottom actions — always visible */}
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.1)' }} />

          <Typography sx={{ textAlign: 'center', fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(17,24,39,0.62)' }}>
            {t('pages.login.noAccount')}{' '}
            <Box
              component="span"
              onClick={() => navigate('/oath')}
              sx={{
                color: '#F5A800',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t('pages.login.signUp')}
            </Box>
          </Typography>

          
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/guest/dashboard')}
            sx={{
              py: 1,
              borderRadius: 50,
              fontWeight: 700,
              fontSize: '0.88rem',
              textTransform: 'none',
              border: `1.5px solid ${isDark ? 'rgba(245,168,0,0.4)' : 'rgba(245,168,0,0.5)'}`,
              color: '#F5A800',
              '&:hover': {
                border: '1.5px solid #F5A800',
                bgcolor: 'rgba(245,168,0,0.08)',
              },
            }}
          >
            {t('pages.login.continueAsGuest')}
          </Button>
         
        </Stack>

      </Box>
    </SplitAuthLayout>
  );
};

export default UserLoginPage;
