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
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';

const PublicLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: t('pages.landing.nav.home'), path: '/', icon: <HomeIcon /> },
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
        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
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
            <Box sx={{ mr: 2, color: 'text.secondary', display: 'flex' }}>{item.icon}</Box>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: 500
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
            
          >
            {t('pages.landing.ctaVoter')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 },
            minHeight: { xs: 56, sm: 64 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box component="img" src={prajakeeyaLogo} alt={t('pages.landing.kicker')} sx={{ width: 32, height: 32, borderRadius: 2 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', display: { xs: 'none', sm: 'block' } }}>
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
                  onClick={() => navigate(item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  sx={{
                    px: 1.5,
                    color: isActive ? 'text.primary' : 'text.secondary',
                    fontWeight: isActive ? 600 : 500,
                    '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            <LanguageSelector
              sx={{ color: 'text.primary', minWidth: 64 }}
            />
            <Button variant="contained" onClick={() => navigate('/register')} size="small">
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

      <Container maxWidth="lg" sx={{ pt: 0, pb: 0, px: { xs: 0, sm: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default PublicLayout;
