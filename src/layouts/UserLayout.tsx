import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Chip,
  Container,
  IconButton,
  useTheme,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ArrowBack as ArrowBackIcon,
  HomeRounded as HomeRoundedIcon,
  ReportProblemRounded as ReportProblemRoundedIcon,
  GroupsRounded as GroupsRoundedIcon,
  DescriptionRounded as DescriptionRoundedIcon,
  PersonAddAlt1Rounded as PersonAddAlt1RoundedIcon,
  PersonRounded as PersonRoundedIcon,
  IosShareRounded as ShareIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useSnackbar from '../hooks/useSnackbar';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import { BRAND } from '../theme';
import LanguageSelector from '../components/LanguageSelector';
import NotificationBell from '../components/NotificationBell';
import { fetchAspirant } from '../services/aspirantService';

const FF = "'Baloo 2', sans-serif";

const UserLayout = () => {
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = mode === 'dark';
  const isDashboard = location.pathname === '/user/dashboard';
  const isVotersPage = location.pathname === '/user/voters';
  const isCivicIssuesPage = location.pathname === '/user/civic-issues';
  const isSopPage = location.pathname === '/user/sop';
  const isAspirantRegister = location.pathname === '/user/aspirants/register' || location.pathname === '/user/aspirants/declaration' || location.pathname === '/user/aspirants/documents';
  const isNotificationsPage = location.pathname === '/user/notifications';
  const isRegisteredAspirants = location.pathname === '/user/registered-aspirants';
  const isProfilePage = location.pathname === '/user/complete-profile' || location.pathname === '/user/dashboard/profile';

  const [aspirantName, setAspirantName] = useState<string | null>(null);
  const [aspirantLoading, setAspirantLoading] = useState(user?.role === 'aspirant');

  useEffect(() => {
    if (user?.role === 'aspirant' && user.aspirantId) {
      setAspirantLoading(true);
      fetchAspirant(user.aspirantId)
        .then(res => setAspirantName(res.data?.name ?? null))
        .catch(() => setAspirantName(null))
        .finally(() => setAspirantLoading(false));
    } else {
      setAspirantLoading(false);
    }
  }, [user?.role, user?.aspirantId]);

  const displayUser = user || { name: 'Voter User', wardId: 101, wardName: '', profilePicture: null } as any;
  const displayName = user?.role === 'aspirant'
    ? (aspirantLoading ? '' : (aspirantName || displayUser.name))
    : displayUser.name;
  // Derive ward number from user profile (already available from /auth/me) — no extra API call needed
  const wardNumber = displayUser.wardNumber || displayUser.wardId || null;

  const handleLogout = () => { logout(); navigate('/'); };

  const snackbar = useSnackbar();

  // Share the app via the native Web Share sheet (WhatsApp/Telegram/SMS/etc.),
  // falling back to copying the link when Web Share isn't available (#44).
  const handleShareApp = async () => {
    const shareData = {
      title: t('pages.landing.kicker'),
      text: t('menu.shareText'),
      url: 'https://prajaakeeya.org',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        snackbar.showMessage(t('menu.shareCopied'), 'success');
      }
    } catch {
      // User dismissed the share sheet, or share/clipboard is unavailable — no-op.
    }
  };

  // ── Mobile bottom navigation (xs only). Mirrors the dashboard's primary
  //    actions; the dashboard "Home" now shows the aspirants list with tabs.
  //    For a fully-registered aspirant the last tab becomes "My Profile"
  //    instead of "Register Aspirant" (mirrors the dashboard tile logic). ──
  const isAspirant = user?.role === 'aspirant' && (user as any)?.documentStatus === 'completed';
  const bottomNavItems = [
    { label: t('common.home', { defaultValue: 'Home' }), icon: <HomeRoundedIcon />, path: '/user/dashboard' },
    { label: t('userDashboard.actions.civicIssues', { defaultValue: 'Civic Issues' }), icon: <ReportProblemRoundedIcon />, path: '/user/civic-issues' },
    { label: t('userDashboard.actions.registeredAspirants', { defaultValue: 'Aspirants' }), icon: <GroupsRoundedIcon />, path: '/user/registered-aspirants' },
    { label: t('userDashboard.actions.howUPPWorks', { defaultValue: 'SOP' }), icon: <DescriptionRoundedIcon />, path: '/user/sop' },
    isAspirant
      ? { label: t('userDashboard.actions.myProfile', { defaultValue: 'My Profile' }), icon: <PersonRoundedIcon />, path: '/user/dashboard/profile' }
      : { label: t('userDashboard.actions.registerAspirant', { defaultValue: 'Register Aspirant' }), icon: <PersonAddAlt1RoundedIcon />, path: '/user/aspirants/declaration' },
  ];
  const currentNavIndex = bottomNavItems.findIndex((item) =>
    item.path === '/user/dashboard'
      ? location.pathname === '/user/dashboard'
      : location.pathname.startsWith(item.path)
  );

  // Theme-aware colour helpers
  const navBg = isDark
    ? 'radial-gradient(130% 140% at 0% 0%, rgba(200,24,10,0.2) 0%, rgba(10,8,8,1) 55%), radial-gradient(120% 130% at 100% 0%, rgba(37,58,154,0.16) 0%, rgba(10,8,8,1) 55%)'
    : `linear-gradient(135deg, #fff 0%, #FFF8F0 100%)`;

  const subtleText = isDark ? 'rgba(255,255,255,0.52)' : 'rgba(17,24,39,0.45)';

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{
        background: navBg,
        color: isDark ? 'white' : 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&::before': isDark ? {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        } : {},
      }}>
        {/* Tri-colour top accent */}
        <Box sx={{ display: 'flex', height: '3px' }}>
          {[BRAND.red, BRAND.blue, BRAND.brown].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
        </Box>

        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 0.9, sm: 1.2 }, minHeight: { xs: 56, sm: 72 }, px: { xs: 1 } }}>
            {/* Left: back button (mobile, non-dashboard) or logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Mobile back button — shown on all pages except dashboard, voters, civic issues, sop, aspirant register, notifications, and registered-aspirants */}
              {!isDashboard && !isVotersPage && !isCivicIssuesPage && !isSopPage && !isAspirantRegister && !isNotificationsPage && !isRegisteredAspirants && !isProfilePage && (
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
              )}

              {/* Logo — always on desktop, on dashboard/voters/civic-issues/sop on mobile */}
              <Box
                sx={{ display: { xs: (isDashboard || isVotersPage || isCivicIssuesPage || isSopPage || isAspirantRegister || isNotificationsPage || isRegisteredAspirants || isProfilePage) ? 'flex' : 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                onClick={() => navigate('/user/dashboard')}
              >
                <Box sx={{
                  p: 0.8, borderRadius: 2,
                  background: `linear-gradient(135deg,rgba(200,24,10,.18),rgba(245,168,0,.14))`,
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Box component="img" src={prajakeeyaLogo} alt={t('userDashboard.title')} sx={{ height: { xs: 28, sm: 34 } }} />
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography sx={{ fontFamily: FF, fontWeight: 800, lineHeight: 1.05, color: isDark ? '#fff' : 'text.primary', fontSize: { sm: '1rem', md: '1.08rem' } }}>
                    {t('pages.landing.kicker')}
                  </Typography>
                  <Typography sx={{ fontFamily: FF, fontSize: '0.73rem', letterSpacing: '.06em', textTransform: 'uppercase', color: subtleText }}>
                    {t('menu.dashboard') || 'Dashboard'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right: theme toggle + lang switch + avatar + logout(desktop) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.5 } }}>
              {/* Dark / Light mode toggle */}
              <IconButton
                onClick={toggleTheme}
                size="small"
                aria-label="toggle theme"
                sx={{
                  width: 36, height: 36,
                  color: isDark ? BRAND.yellow : BRAND.saffron,
                }}>
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              {/* Lang selector */}
              <LanguageSelector
                sx={{
                  minWidth: 64,
                  px: 1,
                  fontFamily: FF,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: isDark ? BRAND.yellow : BRAND.saffron,
                }}
              />

              {/* Share app — opens the native share sheet (or copies the link) */}
              <IconButton
                onClick={handleShareApp}
                size="small"
                aria-label={t('menu.shareApp')}
                title={t('menu.shareApp')}
                sx={{
                  width: 36, height: 36,
                  color: isDark ? BRAND.yellow : BRAND.saffron,
                }}>
                <ShareIcon sx={{ fontSize: 22 }} />
              </IconButton>

              {/* Notifications bell — opens /user/notifications */}
              <NotificationBell />

              <Box sx={{ width: { xs: 4, sm: 8 } }} />

              {/* User avatar (desktop: full, mobile: compact) */}
              <Box sx={{
                display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.2, cursor: 'pointer',
                p: 0.7, pr: { xs: 0.7, sm: 1.2 }, borderRadius: 3,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : theme.palette.divider}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'action.hover',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'action.selected' },
              }} onClick={() => navigate('/user/complete-profile')}>
                <Avatar
                  src={displayUser.profilePicture || undefined}
                  alt={displayName || 'User'}
                  sx={{
                    width: { xs: 34, sm: 38 }, height: { xs: 34, sm: 38 },
                    bgcolor: displayUser.profilePicture ? 'transparent' : 'primary.main',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : theme.palette.divider}`,
                  }}
                >
                  {!displayUser.profilePicture && (displayName?.charAt(0).toUpperCase() || 'U')}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: FF, fontWeight: 700, lineHeight: 1.2, color: isDark ? '#fff' : 'text.primary' }}>
                    {displayName}
                  </Typography>
                  {(wardNumber || displayUser.wardId) && (
                    <Chip
                      label={`Ward ${wardNumber ?? displayUser.wardId}`}
                      size="small"
                      sx={{
                        height: 18, fontSize: '0.64rem', fontWeight: 700, fontFamily: FF,
                        bgcolor: isDark ? 'rgba(245,168,0,0.16)' : 'rgba(245,168,0,0.15)',
                        color: isDark ? '#ffe4aa' : BRAND.brown,
                        border: `1px solid rgba(245,168,0,0.36)`,
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Mobile-only profile avatar */}
              <Box
                onClick={() => navigate('/user/complete-profile')}
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Avatar
                  src={displayUser.profilePicture || undefined}
                  alt={displayName || 'User'}
                  sx={{
                    width: 34, height: 34,
                    bgcolor: displayUser.profilePicture ? 'transparent' : 'primary.main',
                    border: `2px solid ${isDark ? 'rgba(245,168,0,0.55)' : BRAND.yellow}`,
                  }}
                >
                  {!displayUser.profilePicture && (displayName?.charAt(0).toUpperCase() || 'U')}
                </Avatar>
              </Box>

              {/* Logout (desktop) */}
              <Button size="small" startIcon={<LogoutIcon />} onClick={handleLogout}
                sx={{
                  fontFamily: FF, borderRadius: 50,
                  display: { xs: 'none', sm: 'inline-flex' },
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : theme.palette.divider}`,
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  textTransform: 'none', fontWeight: 700,
                  '&:hover': {
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.45)' : theme.palette.primary.main}`,
                    color: isDark ? '#fff' : 'text.primary',
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'action.hover',
                  },
                }}>
                {t('common.logout')}
              </Button>
            </Box>
          </Toolbar>
        </Container>

        {/* Desktop primary nav — mirrors the mobile bottom nav, shown on sm+.
            Same items / paths / active-state; replaces the bottom bar on desktop. */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: { sm: 0.5, md: 1 }, py: 0.5 }}>
              {bottomNavItems.map((item, idx) => {
                const active = idx === currentNavIndex;
                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      fontFamily: FF,
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

      <Container maxWidth="lg" sx={{ pt: { xs: 3, sm: 4, md: 5 }, pb: { xs: 'calc(90px + env(safe-area-inset-bottom))', sm: 4, md: 5 } }}>
        <Outlet />
      </Container>

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
          // Solid opaque base so page content scrolling underneath never shows
          // through; the gradient sits on top via backgroundImage.
          backgroundColor: isDark ? '#0a0808' : '#ffffff',
          backgroundImage: navBg,
          borderTop: `1px solid ${theme.palette.divider}`,
          pb: 'calc(8px + env(safe-area-inset-bottom))',
        }}
      >
        <BottomNavigation
          showLabels
          value={currentNavIndex === -1 ? false : currentNavIndex}
          onChange={(_, newValue) => navigate(bottomNavItems[newValue].path)}
          sx={{
            bgcolor: 'transparent',
            height: 62,
            alignItems: 'flex-start',
            pt: 1,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0,
              px: 0.5,
              // Anchor icon + label to the top so every icon lines up on the
              // same row regardless of how many lines its label wraps to.
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
              fontFamily: FF,
              fontWeight: 700,
              fontSize: '0.62rem',
              '&.Mui-selected': { fontSize: '0.64rem' },
            },
          }}
        >
          {bottomNavItems.map((item) => (
            <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={snackbar.close} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={snackbar.close} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserLayout;
