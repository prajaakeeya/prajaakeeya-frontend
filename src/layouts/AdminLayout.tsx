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
  Chip,
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
  DarkMode as DarkModeIcon,
  Contrast as ContrastIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import { BRAND } from '../theme';
import AppFooter from '../components/AppFooter';

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
    <Box sx={{ bgcolor: BRAND.red, minHeight: '100vh' }}>
      <Box sx={{ p: 2, pt: 2, bgcolor: BRAND.red }}>
        <Typography variant="overline" sx={{ px: 2, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
          {t('common.navigation')}
        </Typography>
      </Box>
      <List
        sx={{
          px: 1.5,
          pt: 1,
          bgcolor: BRAND.red,
          minHeight: '100vh'
        }}
      >
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
                mb: 0.5,
                borderRadius: 2,
                bgcolor: isSelected ? 'white' : BRAND.red,
                color: isSelected ? BRAND.red : 'white',
                fontWeight: isSelected ? 700 : 500,
                '&:hover': {
                  bgcolor: isSelected ? 'white' : 'rgba(255, 255, 255, 0.1)',
                  color: isSelected ? BRAND.red : 'white',
                  '& .MuiListItemIcon-root': {
                    color: isSelected ? BRAND.red : 'white',
                  },
                  '& .MuiListItemText-primary': {
                    color: isSelected ? BRAND.red : 'white',
                  }
                },
                '&:active': {
                  bgcolor: isSelected ? 'white' : 'rgba(255, 255, 255, 0.15)',
                  color: isSelected ? BRAND.red : 'white',
                },
                '&:focus': {
                  bgcolor: isSelected ? 'white' : BRAND.red,
                  color: isSelected ? BRAND.red : 'white',
                },
                '&.Mui-selected': {
                  bgcolor: 'white !important',
                  color: `${BRAND.red} !important`,
                  '& .MuiListItemIcon-root': {
                    color: `${BRAND.red} !important`,
                  },
                  '& .MuiListItemText-primary': {
                    color: `${BRAND.red} !important`,
                    fontWeight: 700,
                  }
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'white !important',
                  color: `${BRAND.red} !important`,
                },
                '&.Mui-selected:active': {
                  bgcolor: 'white !important',
                  color: `${BRAND.red} !important`,
                },
                '&.Mui-selected:focus': {
                  bgcolor: 'white !important',
                  color: `${BRAND.red} !important`,
                },
                '& .MuiListItemIcon-root': {
                  color: isSelected ? BRAND.red : 'white',
                },
                '& .MuiListItemText-primary': {
                  color: isSelected ? BRAND.red : 'white',
                  fontWeight: isSelected ? 700 : 500,
                }
              }}
            >
              <ListItemIcon sx={{ color: isSelected ? BRAND.red : 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
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
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
          color: 'text.primary',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 1px 3px rgba(0,0,0,0.4)'
            : '0 1px 3px rgba(0,0,0,0.08)'
        }}
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
              <Box component="img" src={prajakeeyaLogo} alt={t('adminDashboard.title')} sx={{ height: 44 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
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
                <Chip
                  label={displayUser?.role}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>
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
                sx={{ color: 'text.secondary' }}
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
            <IconButton
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
              borderRight: 'none',
              bgcolor: BRAND.red,
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1400, mx: 'auto', flex: 1, width: '100%' }}>
          <Outlet />
        </Box>
        <AppFooter />
      </Box>
    </Box>
  );
};

export default AdminLayout;
