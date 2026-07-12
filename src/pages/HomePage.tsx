import React, { useState, useEffect } from 'react';
import { Box, Button, Chip, Stack, Typography, useTheme } from '@mui/material';
import {
  ArrowForwardRounded,
  DarkModeRounded,
  LightModeRounded,
  ShieldOutlined,
  VerifiedUserOutlined,
  GavelOutlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import LanguageSelector from '../components/LanguageSelector';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import unlockImg from '../assets/images/unlock.png';
import { BRAND } from '../theme';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 220),
      setTimeout(() => setStep(2), 520),
      setTimeout(() => setStep(3), 920),
      setTimeout(() => setStep(4), 1320),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const isKannada = (i18n.language || '').startsWith('kn');
  const heroBackground = isDark
    ? 'radial-gradient(circle at top left, rgba(245,168,0,0.18), transparent 36%), linear-gradient(135deg, rgba(12,10,8,1) 0%, rgba(20,14,10,1) 100%)'
    : 'linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(255,250,243,1) 100%)';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, md: 3 },
          py: 1.5,
          bgcolor: isDark ? 'rgba(10,8,8,0.86)' : 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: 38 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            onClick={toggleTheme}
            sx={{
              minWidth: 40,
              width: 40,
              height: 40,
              p: 0,
              borderRadius: '50%',
              color: isDark ? BRAND.yellow : theme.palette.text.primary,
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.04)',
              border: `1px solid ${theme.palette.divider}`,
            }}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          </Button>
          <LanguageSelector
            size="small"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              bgcolor: BRAND.yellow,
              color: BRAND.black,
              fontWeight: 700,
              '&:hover': { bgcolor: BRAND.yellow2 },
            }}
          />
        </Stack>
      </Box>

      <Box sx={{ maxWidth: 1080, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 20 }} transition={{ duration: 0.35 }}>
          <Box
            sx={{
              borderRadius: { xs: 3, md: 4 },
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.35)' : '0 16px 45px rgba(15,23,42,0.08)',
              background: heroBackground,
              position: 'relative',
            }}
          >
            <Box sx={{ position: 'absolute', inset: 0, backgroundImage: isDark ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)' : 'linear-gradient(rgba(17,24,39,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
            <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 5 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Box sx={{ maxWidth: 560 }}>
                  <Chip
                    label={t('pages.landing.homePage.noEntryBadge', { defaultValue: 'Trusted civic access' })}
                    color="warning"
                    variant="outlined"
                    sx={{ mb: 2, borderRadius: 999, fontWeight: 700 }}
                  />
                  <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.1, mb: 1.5 }}>
                    {t('pages.landing.homePage.ownerLabel', { defaultValue: 'Prajaakeeya for a stronger civic voice' })}
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 520, mb: 2.5 }}>
                    {t('pages.landing.homePage.ownerQuote1', { defaultValue: 'Access government processes, follow civic procedures, and participate with confidence.' })}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardRounded />}
                      onClick={() => navigate('/oath')}
                      sx={{ borderRadius: 999, px: 3, py: 1.25 }}
                    >
                      {t('pages.landing.homePage.proceed', { defaultValue: 'Continue to the platform' })}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/guest/dashboard')}
                      sx={{ borderRadius: 999, px: 3, py: 1.25 }}
                    >
                      {t('pages.register.continueAsGuest', { defaultValue: 'Continue as guest' })}
                    </Button>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    minWidth: { xs: '100%', md: 300 },
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : 'inset 0 1px 0 rgba(255,255,255,0.8)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(245,168,0,0.16)', color: BRAND.yellow }}>
                      <VerifiedUserOutlined />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {t('pages.landing.homePage.welcomeLabel', { defaultValue: 'Secure and guided' })}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {t('pages.landing.homePage.awakeLabel', { defaultValue: 'Prepared for every step' })}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={1.2}>
                    {[
                      { icon: ShieldOutlined, label: t('pages.landing.homePage.ownerQuote2', { defaultValue: 'Trusted information and verified civic pathways' }) },
                      { icon: GavelOutlined, label: t('pages.landing.homePage.leaderDeclaration', { defaultValue: 'Transparent governance with accountable public processes' }) },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Box key={index} sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                          <Box sx={{ mt: 0.2, color: BRAND.yellow }}><Icon fontSize="small" /></Box>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{item.label}</Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Box>
        </motion.div>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ mt: 3 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 24 }} transition={{ duration: 0.35 }} style={{ flex: 1 }}>
            <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff', boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.25)' : '0 10px 28px rgba(15,23,42,0.06)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t('pages.landing.homePage.hopelessQuote', { defaultValue: 'A clear civic journey' })}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {t('pages.landing.homePage.hopelessLabel', { defaultValue: 'Move from registration to participation with simple guidance at each step.' })}
              </Typography>
            </Box>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 24 }} transition={{ duration: 0.35 }} style={{ flex: 1 }}>
            <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff', boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.25)' : '0 10px 28px rgba(15,23,42,0.06)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t('pages.landing.homePage.dreamerQuote', { defaultValue: 'A modern public platform' })}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {t('pages.landing.homePage.dreamerLabel', { defaultValue: 'Professional, accessible, and designed to serve citizens with care.' })}
              </Typography>
            </Box>
          </motion.div>
        </Stack>
      </Box>
    </Box>
  );
};

export default HomePage;
