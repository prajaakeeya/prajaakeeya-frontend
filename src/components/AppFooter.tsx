import React from 'react';
import { Box, Container, Grid, Typography, Link, useTheme, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import { BRAND } from '../theme';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";

const AppFooter: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  const footerBg = mode === 'grey'
    ? '#E4E3D5'
    : isDark
      ? '#090A0D'
      : '#F8FAFC';

  const borderCol = mode === 'grey'
    ? 'rgba(0, 0, 0, 0.06)'
    : isDark
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(17, 24, 39, 0.06)';

  const textColor = isDark ? '#E2E2E3' : '#374151';
  const textMuted = isDark ? 'rgba(255, 255, 255, 0.55)' : '#6B7280';
  const linkColor = isDark ? BRAND.yellow : BRAND.saffron;

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: footerBg,
        borderTop: `1px solid ${borderCol}`,
        py: { xs: 5, md: 7 },
        px: { xs: 2, sm: 4 },
        mt: 'auto',
        fontFamily: FF_BODY,
        position: 'relative',
        zIndex: 10,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} sx={{ justifyContent: 'space-between' }}>
          {/* Brand Info */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{
                p: 0.6, borderRadius: 1.5,
                background: 'linear-gradient(135deg,rgba(200,24,10,.15),rgba(245,168,0,.12))',
                border: `1px solid ${borderCol}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: 32 }} />
              </Box>
              <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: '1.05rem', color: textColor, letterSpacing: '-0.01em' }}>
                {t('pages.landing.kicker', { defaultValue: 'The Real Prajaakeeya' })}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontFamily: FF_BODY, color: textMuted, mb: 3, lineHeight: 1.6, maxWidth: 360 }}>
              {t('pages.landing.tagline', { defaultValue: 'A direct democracy initiative enabling citizens to drive policy decisions and monitor governance.' })}
            </Typography>
            <Typography sx={{
              fontFamily: FF_HEADING,
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: isDark ? BRAND.yellow : BRAND.saffron,
              textTransform: 'uppercase',
            }}>
              {t('pages.login.footerMotto', { defaultValue: 'SELECTION · ELECTION · CORRECTION · REJECTION' })}
            </Typography>
          </Grid>

          {/* Links Section */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle2" sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textColor, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Portal Links
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/" sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: textMuted, textDecoration: 'none', '&:hover': { color: linkColor } }}>
                Home
              </Link>
              <Link component={RouterLink} to="/register" sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: textMuted, textDecoration: 'none', '&:hover': { color: linkColor } }}>
                Register
              </Link>
              <Link component={RouterLink} to="/guest/dashboard" sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: textMuted, textDecoration: 'none', '&:hover': { color: linkColor } }}>
                Guest Dashboard
              </Link>
              <Link component={RouterLink} to="/elections" sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: textMuted, textDecoration: 'none', '&:hover': { color: linkColor } }}>
                Elections
              </Link>
            </Stack>
          </Grid>

          {/* Guidelines & Safety */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle2" sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textColor, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Guidelines & Safety
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/privacy-policy" sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: textMuted, textDecoration: 'none', '&:hover': { color: linkColor } }}>
                Privacy Policy
              </Link>
              <Link component={RouterLink} to="/terms-and-conditions" sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: textMuted, textDecoration: 'none', '&:hover': { color: linkColor } }}>
                Terms & Conditions
              </Link>
              <Link component={RouterLink} to="/community-guidelines" sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: textMuted, textDecoration: 'none', '&:hover': { color: linkColor } }}>
                Community Guidelines
              </Link>
              <Link component={RouterLink} to="/child-safety" sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: textMuted, textDecoration: 'none', '&:hover': { color: linkColor } }}>
                Child Safety Policy
              </Link>
            </Stack>
          </Grid>
        </Grid>

        {/* Divider */}
        <Box sx={{
          borderTop: `1px solid ${borderCol}`,
          mt: 5,
          pt: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}>
          <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.75rem', color: textMuted }}>
            © {new Date().getFullYear()} Prajaakeeya. All rights reserved.
          </Typography>
          <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.75rem', color: textMuted, textAlign: { xs: 'center', sm: 'right' } }}>
            All candidate pledges are cryptographically verified and citizen-driven.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AppFooter;
