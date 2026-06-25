import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, Typography, Button, Container, IconButton, useTheme, Avatar, Paper, BottomNavigation, BottomNavigationAction,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon, LightMode as LightModeIcon, CloudRounded as CloudRoundedIcon,
  AppRegistration as RegisterIcon, ArrowBack as ArrowBackIcon, Logout as LogoutIcon,
  HomeRounded as HomeRoundedIcon, ReportProblemRounded as ReportProblemRoundedIcon,
  GroupsRounded as GroupsRoundedIcon, DescriptionRounded as DescriptionRoundedIcon,
  BarChart as BarChartIcon, Leaderboard as LeaderboardIcon,
  ContactMail as ContactMailIcon, Info as InfoIcon,
  ForumRounded as ForumIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import { BRAND } from '../theme';
import LanguageSelector from '../components/LanguageSelector';
import RainEffect from '../components/RainEffect';
import AppFooter from '../components/AppFooter';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";

const GuestLayout = () => {
  const { t } = useTranslation();
  const { mode, toggleTheme, rainEnabled, toggleRain } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = mode === 'dark';
  const { user, logout } = useAuthStore();
  const isLoggedIn = Boolean(user);

  const desktopNavItems = [
    { label: t('common.home', { defaultValue: 'Home' }), icon: <HomeRoundedIcon />, path: '/guest/dashboard' },
    { label: 'Katte', icon: <ForumIcon />, path: '/guest/discussions' },
    { label: 'Election', icon: <BarChartIcon />, path: '/guest/elections' },
    { label: 'Stats', icon: <LeaderboardIcon />, path: '/guest/stats' },
    { label: 'Contact Us', icon: <ContactMailIcon />, path: '/guest/contact-us' },
    { label: 'Karyakartas', icon: <GroupsRoundedIcon />, path: '/guest/karyakartas' },
    { label: 'About Us', icon: <InfoIcon />, path: '/guest/about' },
  ];

  const mobileNavItems = [
    { label: t('common.home', { defaultValue: 'Home' }), icon: <HomeRoundedIcon />, path: '/guest/dashboard' },
    { label: 'Katte', icon: <ForumIcon />, path: '/guest/discussions' },
    { label: 'Election', icon: <BarChartIcon />, path: '/guest/elections' },
    { label: 'Karyakartas', icon: <GroupsRoundedIcon />, path: '/guest/karyakartas' },
  ];

  const currentDesktopNavIndex = desktopNavItems.findIndex((item) =>
    item.path === '/guest/dashboard'
      ? location.pathname === '/guest/dashboard'
      : location.pathname.startsWith(item.path)
  );

  const currentMobileNavIndex = mobileNavItems.findIndex((item) =>
    item.path === '/guest/dashboard'
      ? location.pathname === '/guest/dashboard'
      : location.pathname.startsWith(item.path)
  );

  const navBg = isDark
    ? 'radial-gradient(130% 140% at 0% 0%, rgba(200,24,10,0.2) 0%, rgba(13,15,18,1) 55%), radial-gradient(120% 130% at 100% 0%, rgba(37,58,154,0.16) 0%, rgba(13,15,18,1) 55%)'
    : 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)';

  const subtleText = isDark ? 'rgba(255,255,255,0.52)' : 'rgba(17,24,39,0.45)';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {mode === 'grey' && rainEnabled && <RainEffect />}
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

        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 0.9, sm: 1.2 }, minHeight: { xs: 56, sm: 72 }, px: { xs: 1 } }}>
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
                  <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, lineHeight: 1.05, color: isDark ? '#fff' : 'text.primary', fontSize: { sm: '1rem', md: '1.08rem' } }}>
                    {t('pages.landing.kicker')}
                  </Typography>
                  <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.73rem', letterSpacing: '.06em', textTransform: 'uppercase', color: subtleText }}>
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
                    <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, lineHeight: 1.05, color: isDark ? '#fff' : 'text.primary', fontSize: '1.08rem' }}>
                      {t('pages.landing.kicker')}
                    </Typography>
                    <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.73rem', letterSpacing: '.06em', textTransform: 'uppercase', color: subtleText }}>
                      {t('common.home')}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.5 } }}>
              {mode === 'grey' && (
                <IconButton
                  onClick={toggleRain}
                  size="small"
                  title="Toggle Rain Effect"
                  sx={{
                    width: 36,
                    height: 36,
                    color: rainEnabled ? '#AECAE8' : '#9CA3AF',
                    border: `1.5px solid ${rainEnabled ? 'rgba(255, 255, 255, 0.15)' : 'transparent'}`,
                    bgcolor: rainEnabled ? 'rgba(255,255,255,0.06)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🌧️</span>
                </IconButton>
              )}

              <IconButton onClick={toggleTheme} size="small"
                aria-label={
                  mode === 'dark'
                    ? 'Switch to light theme'
                    : mode === 'light'
                    ? 'Switch to grey theme'
                    : 'Switch to dark theme'
                }
                sx={{ width: 36, height: 36, color: mode === 'light' ? BRAND.saffron : mode === 'grey' ? '#9CA3AF' : BRAND.yellow }}>
                {mode === 'dark' ? (
                  <DarkModeIcon />
                ) : mode === 'light' ? (
                  <LightModeIcon />
                ) : (
                  <CloudRoundedIcon />
                )}
              </IconButton>

              <LanguageSelector sx={{ minWidth: 64, px: 1, fontFamily: FF_HEADING, fontWeight: 800, fontSize: '0.9rem', color: isDark ? BRAND.yellow : BRAND.saffron }} />

              {!isLoggedIn && (
                <>
                  <Box sx={{ width: { xs: 4, sm: 8 } }} />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RegisterIcon />}
                    onClick={() => navigate('/register')}
                    sx={{ fontFamily: FF_HEADING, minHeight: 36, px: 2 }}
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
                    <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.88rem', color: isDark ? '#fff' : 'text.primary' }}>
                      {user?.name}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<LogoutIcon />}
                    onClick={() => { logout(); navigate('/'); }}
                    sx={{
                      display: { xs: 'none', sm: 'flex' },
                      fontFamily: FF_HEADING, fontWeight: 700, textTransform: 'none',
                      borderRadius: 50, px: 1.5,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : theme.palette.divider}`,
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                      '&:hover': { borderColor: 'error.main', color: 'error.main', bgcolor: 'rgba(200,24,10,0.06)' },
                    }}
                  >
                    Logout
                  </Button>

                  {/* Mobile: avatar only */}
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
                </>
              )}

            </Box>
          </Toolbar>
        </Container>

        {/* Desktop primary nav — mirrors the mobile bottom nav, shown on sm+.
            Same items / paths / active-state; replaces the bottom bar on desktop. */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: { sm: 0.5, md: 1 }, py: 0.5 }}>
              {desktopNavItems.map((item, idx) => {
                const active = idx === currentDesktopNavIndex;
                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      fontFamily: FF_HEADING,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: { sm: 1.2, md: 2 },
                      py: 0.9,
                      fontSize: { sm: '0.8rem', md: '0.9rem' },
                      color: active
                        ? (isDark ? BRAND.yellow : BRAND.saffron)
                        : (isDark ? 'rgba(255,255,255,0.72)' : 'text.secondary'),
                      bgcolor: active ? 'rgba(245,168,0,0.12)' : 'transparent',
                      '& .MuiButton-startIcon': { mr: 0.6 },
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'action.hover',
                        color: isDark ? '#fff' : 'text.primary',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Container>
        </Box>
      </AppBar>

      <Container maxWidth="xl" sx={{ pt: { xs: 3, sm: 4, md: 5 }, pb: { xs: 'calc(90px + env(safe-area-inset-bottom))', sm: 4, md: 5 }, flex: 1 }}>
        <Outlet />
      </Container>

      <AppFooter />

      {/* Mobile bottom navigation — fixed, xs only */}
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'block', sm: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          backgroundColor: isDark ? '#0d0f12' : '#ffffff',
          backgroundImage: navBg,
          borderTop: `1px solid ${theme.palette.divider}`,
          pb: 'calc(8px + env(safe-area-inset-bottom))',
        }}
      >
        <BottomNavigation
          showLabels
          value={currentMobileNavIndex === -1 ? false : currentMobileNavIndex}
          onChange={(_, newValue) => navigate(mobileNavItems[newValue].path)}
          sx={{
            bgcolor: 'transparent',
            height: 62,
            alignItems: 'flex-start',
            pt: 1,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0,
              px: 0.5,
              justifyContent: 'flex-start',
              gap: 0.5,
              color: isDark ? '#fff' : 'rgba(17,24,39,0.5)',
            },
            '& .MuiBottomNavigationAction-root.Mui-selected': {
              color: isDark ? BRAND.yellow : BRAND.saffron,
            },
            '& .MuiBottomNavigationAction-label': {
              mt: 0,
              lineHeight: 1.2,
              fontFamily: FF_HEADING,
              fontWeight: 700,
              fontSize: '0.62rem',
              '&.Mui-selected': { fontSize: '0.64rem' },
            },
          }}
        >
          {mobileNavItems.map((item) => (
            <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default GuestLayout;
