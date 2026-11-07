import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  ButtonBase,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  LogoutRounded as LogoutIcon,
  DarkModeOutlined as DarkModeIcon,
  LightModeOutlined as LightModeIcon,
  ArrowBackRounded as ArrowBackIcon,
  HomeRounded as HomeRoundedIcon,
  ReportProblemRounded as ReportProblemRoundedIcon,
  GroupsRounded as GroupsRoundedIcon,
  DescriptionRounded as DescriptionRoundedIcon,
  PersonAddAlt1Rounded as PersonAddAlt1RoundedIcon,
  PersonRounded as PersonRoundedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import LanguageSelector from '../components/LanguageSelector';
import NotificationBell from '../components/NotificationBell';
import { fetchAspirant } from '../services/aspirantService';

const UserLayout = () => {
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = mode === 'dark';
  const isDashboard = location.pathname === '/user/dashboard';
  const isVotersPage = location.pathname === '/user/voters';
  const isCivicIssuesPage = location.pathname === '/user/civic-issues';
  const isSopPage = location.pathname === '/user/sop';
  const isAspirantRegister = location.pathname === '/user/aspirants/register' || location.pathname === '/user/aspirants/declaration' || location.pathname === '/user/aspirants/documents';
  const isNotificationsPage = location.pathname === '/user/notifications';
  const isRegisteredAspirants = location.pathname === '/user/registered-aspirants';
  const isProfilePage = location.pathname === '/user/complete-profile' || location.pathname === '/user/dashboard/profile';
  // Top-level pages show the logo on mobile; nested pages show a back arrow instead.
  const isTopLevel = isDashboard || isVotersPage || isCivicIssuesPage || isSopPage || isAspirantRegister || isNotificationsPage || isRegisteredAspirants || isProfilePage;

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

  // logout() itself hard-redirects to '/' (window.location.replace) once auth
  // state is cleared — do NOT navigate() here too, or the client-side nav races
  // the reload and flashes the register/home page before the preloader.
  const handleLogout = () => { logout(); };

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

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const wardText = wardNumber ? `${t('common.ward', { defaultValue: 'Ward' })} ${wardNumber}` : null;
  const themeLabel = isDark
    ? t('common.switchToLight', { defaultValue: 'Switch to light theme' })
    : t('common.switchToDark', { defaultValue: 'Switch to dark theme' });

  const userAvatar = (size: number) => (
    <Avatar
      src={displayUser.profilePicture || undefined}
      alt={displayName || 'User'}
      sx={{ width: size, height: size, fontSize: size * 0.42, fontWeight: 600, bgcolor: 'primary.main' }}
    >
      {!displayUser.profilePicture && (displayName?.charAt(0).toUpperCase() || 'U')}
    </Avatar>
  );

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Container maxWidth="lg" disableGutters>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, gap: 1 }}>
            {/* Mobile back button — hidden on top-level pages */}
            {!isTopLevel && (
              <IconButton
                onClick={() => navigate(-1)}
                aria-label="go back"
                sx={{ display: { xs: 'inline-flex', sm: 'none' }, ml: -1 }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}

            <ButtonBase
              onClick={() => navigate('/user/dashboard')}
              sx={{
                display: { xs: isTopLevel ? 'flex' : 'none', sm: 'flex' },
                alignItems: 'center', gap: 1.25, borderRadius: 2, p: 0.5, ml: -0.5, flexShrink: 0,
              }}
            >
              <Box component="img" src={prajakeeyaLogo} alt={t('userDashboard.title')} sx={{ width: 32, height: 32, borderRadius: 2 }} />
              <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, fontSize: '1rem' }}>
                {t('pages.landing.kicker')}
              </Typography>
            </ButtonBase>

            {/* Desktop primary nav */}
            <Stack component="nav" direction="row" sx={{ display: { xs: 'none', md: 'flex' }, ml: 4, alignSelf: 'stretch' }}>
              {bottomNavItems.map((item, idx) => {
                const active = idx === currentNavIndex;
                return (
                  <ButtonBase
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      px: 1.5, fontSize: '0.875rem', fontWeight: active ? 600 : 500,
                      color: active ? 'text.primary' : 'text.secondary',
                      borderBottom: 2, borderColor: active ? 'primary.main' : 'transparent',
                      mb: '-1px', transition: 'color 120ms ease',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                    {item.label}
                  </ButtonBase>
                );
              })}
            </Stack>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" alignItems="center" spacing={{ xs: 0.25, sm: 0.5 }}>
              <Tooltip title={themeLabel}>
                <IconButton onClick={toggleTheme} aria-label="toggle theme" sx={{ color: 'text.secondary' }}>
                  {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <LanguageSelector sx={{ color: 'text.primary', minWidth: 0 }} />
              <NotificationBell />

              <ButtonBase
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                aria-label={displayName || 'Account'}
                aria-haspopup="menu"
                sx={{ ml: 0.5, borderRadius: 2, p: 0.5, gap: 1 }}
              >
                {userAvatar(32)}
                <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'left' }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 }}>{displayName}</Typography>
                  {wardText && (
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.3 }}>{wardText}</Typography>
                  )}
                </Box>
              </ButtonBase>
            </Stack>
          </Toolbar>
        </Container>

        {/* Tablet nav (sm–md): a scrollable second row */}
        <Box sx={{ display: { xs: 'none', sm: 'block', md: 'none' }, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" sx={{ px: 2, overflowX: 'auto' }}>
            {bottomNavItems.map((item, idx) => {
              const active = idx === currentNavIndex;
              return (
                <ButtonBase
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    px: 1.5, py: 1.25, whiteSpace: 'nowrap', fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500, color: active ? 'text.primary' : 'text.secondary',
                    borderBottom: 2, borderColor: active ? 'primary.main' : 'transparent',
                  }}
                >
                  {item.label}
                </ButtonBase>
              );
            })}
          </Stack>
        </Box>
      </AppBar>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 240, mt: 1 } }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1.5 }}>
          {userAvatar(40)}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }} noWrap>{displayName}</Typography>
            {wardText && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{wardText}</Typography>}
          </Box>
        </Stack>
        <Divider />
        <MenuItem onClick={() => { setMenuAnchor(null); navigate('/user/complete-profile'); }}>
          <ListItemIcon><PersonRoundedIcon fontSize="small" /></ListItemIcon>
          {t('userDashboard.actions.myProfile', { defaultValue: 'My Profile' })}
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); handleLogout(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}><LogoutIcon fontSize="small" /></ListItemIcon>
          {t('common.logout')}
        </MenuItem>
      </Menu>

      <Container maxWidth="lg" sx={{ pt: { xs: 3, sm: 4, md: 5 }, pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', sm: 4, md: 6 } }}>
        <Outlet />
      </Container>

      {/* Mobile bottom navigation — fixed, xs only */}
      <Paper
        square
        sx={{
          display: { xs: 'block', sm: 'none' },
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: (th) => th.zIndex.appBar,
          borderTop: 1, borderColor: 'divider',
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <BottomNavigation
          showLabels
          value={currentNavIndex === -1 ? false : currentNavIndex}
          onChange={(_, newValue) => navigate(bottomNavItems[newValue].path)}
          sx={{
            height: 64, bgcolor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0, px: 0.5, color: 'text.secondary', justifyContent: 'flex-start', pt: 1.25, gap: 0.5,
            },
            '& .MuiBottomNavigationAction-root.Mui-selected': { color: 'primary.main' },
            '& .MuiBottomNavigationAction-label, & .MuiBottomNavigationAction-label.Mui-selected': {
              fontSize: '0.6875rem', fontWeight: 600, lineHeight: 1.2, textAlign: 'center',
            },
          }}
        >
          {bottomNavItems.map((item) => (
            <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default UserLayout;
