import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
  Container
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import LanguageSelector from '../components/LanguageSelector';
import HomeIcon from '@mui/icons-material/Home';
import ForumIcon from '@mui/icons-material/ForumRounded';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import AppFooter from '../components/AppFooter';

const PublicLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: t('pages.landing.nav.home'), path: '/', icon: <HomeIcon /> },
    { label: 'Katte', path: '/guest/discussions', icon: <ForumIcon /> },
    { label: t('pages.landing.nav.about'), path: '/about', icon: <InfoIcon /> },
    // { label: t('pages.landing.nav.candidates'), path: '/candidateslist', icon: <PeopleIcon /> },
    { label: t('pages.landing.nav.elections'), path: '/elections', icon: <BarChartIcon /> },
    { label: t('pages.landing.nav.contact'), path: '/contact-us', icon: <ContactMailIcon /> }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box component="img" src={prajakeeyaLogo} alt={t('pages.landing.kicker')} sx={{ height: 36 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {t('pages.landing.kicker')}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavClick(item.path)}
            sx={{
              py: 1.5,
              px: 3,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <Box sx={{ mr: 2, color: 'primary.main' }}>{item.icon}</Box>
            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  sx: {
                    fontWeight: 500
                  }
                }
              }}
            />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
          <Box sx={{ px: 3, pb: 2 }}>
        <Stack spacing={1.5}>
          <LanguageSelector
            fullWidth
            onSelect={() => { if (isMobile) setMobileOpen(false); }}
            sx={{ fontWeight: 700, justifyContent: 'flex-start', display: { xs: 'none', md: 'flex' } }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              navigate('/register');
              if (isMobile) setMobileOpen(false);
            }}
            sx={{ justifyContent: 'flex-start', color: '#fff' }}
          >
            {t('pages.landing.ctaVoter')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={0} color="transparent" sx={{ top: 0, bgcolor: '#ffffff' }}>
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            py: { xs: 2, sm: 2.5 },
            px: { xs: 2, sm: 3 },
            minHeight: { xs: 72, sm: 80 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: 'primary.main' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box component="img" src={prajakeeyaLogo} alt={t('pages.landing.kicker')} sx={{ height: 44 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', display: { xs: 'none', sm: 'block' } }}>
                {t('pages.landing.kicker')}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'contained' : 'text'}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 20,
                    px: 3,
                    boxShadow: isActive ? 'none' : 'none',
                    color: isActive ? '#fff' : 'text.primary',
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover'
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              display: { xs: 'none', md: 'flex' }
            }}>
            <LanguageSelector
              sx={{ fontWeight: 700, minWidth: 64 }}
            />
            <Button variant="contained" onClick={() => navigate('/register')} size="small" sx={{ color: '#fff' }}>
              {t('pages.landing.ctaVoter')}
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ display: { xs: 'flex', md: 'none' } }}>
            <LanguageSelector
              sx={{ fontWeight: 700, minWidth: 48, px: 1 }}
            />
          </Stack>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280
          }
        }}
      >
        {drawer}
      </Drawer>
      <Container maxWidth="xl" sx={{ pt: 0, pb: 0, px: { xs: 0, sm: 3 }, flex: 1 }}>
        <Outlet />
      </Container>
      <AppFooter />
    </Box>
  );
};

export default PublicLayout;
