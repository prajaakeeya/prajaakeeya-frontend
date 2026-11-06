import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Avatar, Box, Button, ButtonBase, Container, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import {
  ArrowBackRounded, DarkModeOutlined, LightModeOutlined, LogoutRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import LanguageSelector from '../components/LanguageSelector';

const GuestLayout = () => {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const isDark = mode === 'dark';
  const { user, logout } = useAuthStore();
  const isLoggedIn = Boolean(user);
  const themeLabel = isDark
    ? t('common.switchToLight', { defaultValue: 'Switch to light theme' })
    : t('common.switchToDark', { defaultValue: 'Switch to dark theme' });

  const avatar = (
    <Avatar
      src={user?.profilePicture || undefined}
      alt={user?.name || 'User'}
      sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'primary.main' }}
    >
      {!user?.profilePicture && (user?.name?.charAt(0).toUpperCase() || 'U')}
    </Avatar>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Container maxWidth="lg" disableGutters>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
            {isLoggedIn && (
              <IconButton
                onClick={() => navigate(-1)}
                aria-label="go back"
                sx={{ display: { xs: 'inline-flex', sm: 'none' }, ml: -1 }}
              >
                <ArrowBackRounded />
              </IconButton>
            )}

            <ButtonBase
              onClick={() => navigate('/')}
              sx={{ display: isLoggedIn ? { xs: 'none', sm: 'flex' } : 'flex', alignItems: 'center', gap: 1.25, borderRadius: 2, p: 0.5, ml: -0.5 }}
            >
              <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ width: 32, height: 32, borderRadius: 2 }} />
              <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                  {t('pages.landing.kicker')}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.3 }}>
                  {isLoggedIn ? t('common.home') : t('common.guest', { defaultValue: 'Guest' })}
                </Typography>
              </Box>
            </ButtonBase>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }}>
              <Tooltip title={themeLabel}>
                <IconButton onClick={toggleTheme} aria-label="toggle theme" sx={{ color: 'text.secondary' }}>
                  {isDark ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
                </IconButton>
              </Tooltip>

              <LanguageSelector sx={{ color: 'text.primary' }} />

              {!isLoggedIn && (
                <Button variant="contained" size="small" onClick={() => navigate('/register')} sx={{ ml: 0.5 }}>
                  {t('common.register', { defaultValue: 'Register' })}
                </Button>
              )}

              {isLoggedIn && (
                <>
                  <ButtonBase
                    onClick={() => navigate('/user/complete-profile')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2, p: 0.5 }}
                  >
                    {avatar}
                    <Typography sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 600, fontSize: '0.875rem' }}>
                      {user?.name}
                    </Typography>
                  </ButtonBase>
                  <Button
                    size="small"
                    startIcon={<LogoutRounded fontSize="small" />}
                    onClick={() => { logout(); navigate('/'); }}
                    sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'text.secondary' }}
                  >
                    {t('common.logout')}
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default GuestLayout;
