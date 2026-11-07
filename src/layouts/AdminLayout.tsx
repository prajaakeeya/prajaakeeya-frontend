import { useMemo, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Button,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  AddLocation as AddLocationIcon,
  Description as DescriptionIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  HowToVote as HowToVoteIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
LocationCity as LocationCityIcon,
  Grass as GrassIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';

const drawerWidth = 280;

const AdminLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();

  // Display the signed-in admin's own identity. The /admin route guard in
  // App.tsx already requires isAuthenticated && isAdmin before this layout
  // mounts, so `user` is present in normal use; the optional chaining below is
  // null-safety only — no fabricated demo-admin identity.
  const displayUser = user;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', to: '/admin/dashboard', icon: <DashboardIcon /> },
      { label: 'User List', to: '/admin/users', icon: <PeopleIcon /> },
      { label: 'Aspirant List', to: '/admin/registered-aspirants', icon: <PeopleIcon /> },
      { label: 'Elections', to: '/admin/elections', icon: <HowToVoteIcon /> },
      { label: 'Voting Window', to: '/admin/voting-window', icon: <HowToVoteIcon /> },
      { label: 'Create Parliament', to: '/admin/parliamentary', icon: <AddLocationIcon /> },
      { label: 'Create Assembly', to: '/admin/assembly', icon: <AddLocationIcon /> },
      { label: 'Create Municipality', to: '/admin/municipalities', icon: <LocationCityIcon /> },
      { label: 'Create Ward', to: '/admin/wards/create', icon: <AddLocationIcon /> },
      { label: 'Create Grama Panchayat', to: '/admin/grama-panchayat', icon: <GrassIcon /> },
      // { label: 'Reported List', to: '/admin/reports', icon: <DescriptionIcon /> },
    ],
    [t]
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ pt: { xs: 2, md: 10 }, pb: 2 }}>
      <Typography variant="overline" sx={{ px: 3, color: 'text.secondary', fontWeight: 700 }}>
        {t('common.navigation')}
      </Typography>
      <List sx={{ px: 1.5, pt: 1 }}>
        {navItems.map((item) => {
          const isSelected = pathname === item.to || pathname.startsWith(item.to + '/');
          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              selected={isSelected}
              onClick={handleDrawerClose}
              sx={{
                mb: 0.25, borderRadius: 2, py: 0.875,
                color: 'text.secondary',
                '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 36 },
                '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: 500 },
                '&:hover': { color: 'text.primary' },
                '&.Mui-selected, &.Mui-selected:hover': {
                  bgcolor: 'action.selected', color: 'primary.main',
                  '& .MuiListItemText-primary': { fontWeight: 600 },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1, color: 'primary.main' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box component="img" src={prajakeeyaLogo} alt={t('adminDashboard.title')} sx={{ width: 32, height: 32, borderRadius: 2 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {t('pages.landing.kicker')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {displayUser?.name?.charAt(0).toUpperCase() || 'A'}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {displayUser?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                  {displayUser?.role}
                </Typography>
              </Box>
            </Box>
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                aria-label="Toggle theme"
                onClick={toggleTheme}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <IconButton
              aria-label="Log out"
              onClick={handleLogout}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover', color: 'error.main' }
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 1,
              borderColor: 'divider',
              overflow: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
                width: 0,
                height: 0
              },
              '&::-webkit-scrollbar-thumb': {
                display: 'none'
              },
              '&::-webkit-scrollbar-track': {
                display: 'none'
              },
              msOverflowStyle: 'none'
            },
            display: { xs: 'block', md: 'block' }
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: { xs: 2, sm: 3, md: 4 },
          minHeight: '100vh',
          width: { md: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
