import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, Typography, Button, Container, IconButton, useTheme, Avatar,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon, LightMode as LightModeIcon, AppRegistration as RegisterIcon,
  ArrowBack as ArrowBackIcon, Logout as LogoutIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import { BRAND } from '../theme';
import LanguageSelector from '../components/LanguageSelector';

const FF = "'Baloo 2', sans-serif";

const GuestLayout = () => {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = mode === 'dark';
  const { user, logout } = useAuthStore();
  const isLoggedIn = Boolean(user);

  const navBg = isDark
    ? 'radial-gradient(130% 140% at 0% 0%, rgba(200,24,10,0.2) 0%, rgba(10,8,8,1) 55%), radial-gradient(120% 130% at 100% 0%, rgba(37,58,154,0.16) 0%, rgba(10,8,8,1) 55%)'
    : 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)';

  const subtleText = isDark ? 'rgba(255,255,255,0.52)' : 'rgba(17,24,39,0.45)';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{
        background: navBg,
        color: isDark ? 'white' : 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&::before': isDark ? {
          content: '""', position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        } : {},
      }}>
        <Box sx={{ display: 'flex', height: '3px' }}>
          {[BRAND.red, BRAND.blue, BRAND.brown].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
        </Box>

        <Container maxWidth="xl" sx={{ px: '0 !important' }}>
          <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 0.9, sm: 1.2 }, minHeight: { xs: 56, sm: 72 } }}>
            {!isLoggedIn && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                onClick={() => navigate('/')}>
                <Box sx={{
                  p: 0.8, borderRadius: 2,
                  background: 'linear-gradient(135deg,rgba(200,24,10,.18),rgba(245,168,0,.14))',
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: { xs: 28, sm: 34 } }} />
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography sx={{ fontFamily: FF, fontWeight: 800, lineHeight: 1.05, color: isDark ? '#fff' : 'text.primary', fontSize: { sm: '1rem', md: '1.08rem' } }}>
                    {t('pages.landing.kicker')}
                  </Typography>
                  <Typography sx={{ fontFamily: FF, fontSize: '0.73rem', letterSpacing: '.06em', textTransform: 'uppercase', color: subtleText }}>
                    Guest
                  </Typography>
                </Box>
              </Box>
            )}
            {isLoggedIn && (
              <>
                {/* Mobile: back arrow only */}
                <IconButton
                  onClick={() => navigate(-1)}
                  size="small"
                  aria-label="go back"
                  sx={{
                    display: { xs: 'flex', sm: 'none' },
                    color: isDark ? BRAND.yellow : BRAND.saffron,
                    p: 0.8, borderRadius: 2,
                    background: `linear-gradient(135deg,rgba(200,24,10,.18),rgba(245,168,0,.14))`,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: 22 }} />
                </IconButton>

                {/* Desktop: logo + app name */}
                <Box
                  sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                  onClick={() => navigate('/')}
                >
                  <Box sx={{
                    p: 0.8, borderRadius: 2,
                    background: 'linear-gradient(135deg,rgba(200,24,10,.18),rgba(245,168,0,.14))',
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: 34 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: FF, fontWeight: 800, lineHeight: 1.05, color: isDark ? '#fff' : 'text.primary', fontSize: '1.08rem' }}>
                      {t('pages.landing.kicker')}
                    </Typography>
                    <Typography sx={{ fontFamily: FF, fontSize: '0.73rem', letterSpacing: '.06em', textTransform: 'uppercase', color: subtleText }}>
                      {t('common.home')}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.5 } }}>
              <IconButton onClick={toggleTheme} size="small" aria-label="toggle theme"
                sx={{ width: 36, height: 36, color: isDark ? BRAND.yellow : BRAND.saffron }}>
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              <LanguageSelector sx={{ minWidth: 64, px: 1, fontFamily: FF, fontWeight: 800, fontSize: '0.9rem', color: isDark ? BRAND.yellow : BRAND.saffron }} />

              {!isLoggedIn && (
                <>
                  <Box sx={{ width: { xs: 4, sm: 8 } }} />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RegisterIcon />}
                    onClick={() => navigate('/register')}
                    sx={{ fontFamily: FF, minHeight: 36, px: 2 }}
                  >
                    Register
                  </Button>
                </>
              )}

              {isLoggedIn && (
                <>
                  {/* Desktop: avatar + name + logout */}
                  <Box
                    sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, cursor: 'pointer' }}
                    onClick={() => navigate('/user/complete-profile')}
                  >
                    <Avatar
                      src={user?.profilePicture || undefined}
                      alt={user?.name || 'User'}
                      sx={{
                        width: 34, height: 34,
                        bgcolor: user?.profilePicture ? 'transparent' : 'primary.main',
                        border: `2px solid ${isDark ? 'rgba(245,168,0,0.55)' : BRAND.yellow}`,
                      }}
                    >
                      {!user?.profilePicture && (user?.name?.charAt(0).toUpperCase() || 'U')}
                    </Avatar>
                    <Typography sx={{ fontFamily: FF, fontWeight: 700, fontSize: '0.88rem', color: isDark ? '#fff' : 'text.primary' }}>
                      {user?.name}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<LogoutIcon />}
                    onClick={() => { logout(); navigate('/'); }}
                    sx={{
                      display: { xs: 'none', sm: 'flex' },
                      fontFamily: FF, fontWeight: 700, textTransform: 'none',
                      borderRadius: 50, px: 1.5,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : theme.palette.divider}`,
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                      '&:hover': { borderColor: 'error.main', color: 'error.main', bgcolor: 'rgba(200,24,10,0.06)' },
                    }}
                  >
                    Logout
                  </Button>

                  {/* Mobile: avatar + logout icon (the desktop text button above is hidden here) */}
                  <Avatar
                    src={user?.profilePicture || undefined}
                    alt={user?.name || 'User'}
                    onClick={() => navigate('/user/complete-profile')}
                    sx={{
                      display: { xs: 'flex', sm: 'none' },
                      width: 34, height: 34,
                      bgcolor: user?.profilePicture ? 'transparent' : 'primary.main',
                      border: `2px solid ${isDark ? 'rgba(245,168,0,0.55)' : BRAND.yellow}`,
                      cursor: 'pointer',
                    }}
                  >
                    {!user?.profilePicture && (user?.name?.charAt(0).toUpperCase() || 'U')}
                  </Avatar>
                  <IconButton
                    onClick={() => { logout(); navigate('/'); }}
                    size="small"
                    aria-label={t('common.logout')}
                    sx={{
                      display: { xs: 'flex', sm: 'none' },
                      color: 'text.secondary',
                      '&:hover': { color: BRAND.red, bgcolor: `${BRAND.red}0F` },
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </>
              )}

            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 } }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default GuestLayout;
