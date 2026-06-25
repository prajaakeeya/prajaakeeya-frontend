import React from 'react';
import { Box, Container, Grid, Typography, useTheme, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import useThemeStore from '../store/useThemeStore';
import RainEffect from '../components/RainEffect';

const AboutPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { mode, setMode, rainEnabled, toggleRain } = useThemeStore();
  const isDark = mode === 'dark' || mode === 'grey';
  const isKannada = (i18n.language || '').startsWith('kn');

  const FF = "'Geist Variable', 'Geist', sans-serif";
  const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
  const headingColor = isDark ? '#ffffff' : '#000000';
  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;

  return (
    <Box sx={{ bgcolor: bg, minHeight: '80vh', color: isDark ? '#E2E2E3' : '#111827', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="xl">
        <Grid container spacing={8} sx={{ alignItems: 'center' }}>
          {/* Left Column: Mission Description */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Typography variant="overline" sx={{ fontFamily: FF_HEADING, fontWeight: 700, letterSpacing: 2, color: '#F5A800' }}>
              {t('pages.landing.foundation.kicker', { defaultValue: 'FOUNDATION PRINCIPLES' })}
            </Typography>
            <Typography variant="h2" sx={{ fontFamily: FF_HEADING, fontWeight: 800, mt: 1, mb: 3, fontSize: { xs: '2.2rem', md: '3.2rem' }, lineHeight: 1.2, color: headingColor }}>
              {(() => {
                const titleText = t('pages.landing.foundation.title', { defaultValue: 'Direct Democracy Foundation' });
                if (titleText.includes("Democracy")) {
                  const parts = titleText.split("Democracy");
                  return (
                    <>
                      {parts[0]}
                      <span style={{ color: '#F5A800' }}>Democracy</span>
                      {parts[1]}
                    </>
                  );
                } else if (titleText.includes("ಮೂಲ ಮೌಲ್ಯಗಳು")) {
                  const parts = titleText.split("ಮೂಲ ಮೌಲ್ಯಗಳು");
                  return (
                    <>
                      {parts[0]}
                      <span style={{ color: '#F5A800' }}>ಮೂಲ ಮೌಲ್ಯಗಳು</span>
                      {parts[1]}
                    </>
                  );
                }
                return titleText;
              })()}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', fontSize: '1.1rem', lineHeight: 1.7, mb: 5 }}>
              {t('pages.landing.foundation.subtitle', { defaultValue: 'Establishing a system where the citizens hold supreme authority, guiding candidates transparently.' })}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Pillar 1 */}
              <Box sx={{ display: 'flex', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(245,168,0,0.1)', color: '#F5A800', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="10" width="18" height="11" rx="2" stroke="#F5A800" strokeWidth="1.6" fill="rgba(245,168,0,0.08)"/>
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#F5A800" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M9.5 15.5l2 2 3-3.5" stroke="#F5A800" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 700, mb: 0.5, color: headingColor }}>
                    {t('pages.landing.pillars.election.title', { defaultValue: 'Citizen Decided Elections' })}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', lineHeight: 1.5 }}>
                    {t('pages.landing.pillars.election.body', { defaultValue: 'Voters screen, approve, and direct candidates based on manifesto pledges.' })}
                  </Typography>
                </Box>
              </Box>

              {/* Pillar 2 */}
              <Box sx={{ display: 'flex', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(200,24,10,0.1)', color: '#C8180A', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 3l7 7-2 2-7-7 2-2z" stroke="#C8180A" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(200,24,10,0.08)"/>
                    <path d="M3 21l8-8" stroke="#C8180A" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M3 17l4 4" stroke="#C8180A" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M10 7l2 2" stroke="#C8180A" strokeWidth="1.6" strokeLinecap="round"/>
                    <rect x="3" y="20" width="8" height="1.5" rx="0.75" fill="#C8180A"/>
                  </svg>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 700, mb: 0.5, color: headingColor }}>
                    {t('pages.landing.pillars.mission.title', { defaultValue: 'Accountable Governance' })}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', lineHeight: 1.5 }}>
                    {t('pages.landing.pillars.mission.body', { defaultValue: 'Continuous citizen guidance and verification to enforce transparency.' })}
                  </Typography>
                </Box>
              </Box>

              {/* Pillar 3 */}
              <Box sx={{ display: 'flex', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(34,197,94,0.1)', color: '#22c55e', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#22c55e" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(34,197,94,0.08)"/>
                    <circle cx="12" cy="12" r="3" stroke="#22c55e" strokeWidth="1.6" fill="rgba(34,197,94,0.15)"/>
                    <circle cx="12" cy="12" r="1.2" fill="#22c55e"/>
                  </svg>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 700, mb: 0.5, color: headingColor }}>
                    {t('pages.landing.pillars.issues.title', { defaultValue: 'Complete Transparency' })}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', lineHeight: 1.5 }}>
                    {t('pages.landing.pillars.issues.body', { defaultValue: 'Open tracking of public work approvals, candidate credentials, and spending.' })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Column: Values Cards Grid */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Grid container spacing={3}>
              {/* Card 1: Citizen Power */}
              <Grid size={6} sx={{ pb: { xs: 2, md: 4 } }}>
                <Box
                  sx={{
                    bgcolor: paper,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '12px',
                    p: 3,
                    height: '100%',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#F5A800',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(245,168,0,0.1)', color: '#F5A800', mb: 3 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5A800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4l3 13h14l3-13-5 5-5-5-5 5-5-5z" fill="rgba(245,168,0,0.08)"/>
                      <rect x="5" y="17" width="14" height="3" rx="1" fill="rgba(245,168,0,0.15)"/>
                      <circle cx="2" cy="4" r="0.8" fill="#F5A800"/>
                      <circle cx="7" cy="9" r="0.6" fill="#F5A800"/>
                      <circle cx="12" cy="4" r="0.8" fill="#F5A800"/>
                      <circle cx="17" cy="9" r="0.6" fill="#F5A800"/>
                      <circle cx="22" cy="4" r="0.8" fill="#F5A800"/>
                    </svg>
                  </Box>
                  <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 700, mb: 0.8, fontSize: 16, color: headingColor }}>
                    {t('pages.landing.features.item1.title', { defaultValue: 'Citizen Power' })}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', fontSize: 13, lineHeight: 1.5 }}>
                    {t('pages.landing.features.item1.body', { defaultValue: 'Citizens decide on policies rather than representatives.' })}
                  </Typography>
                </Box>
              </Grid>

              {/* Card 2: Accountability */}
              <Grid size={6} sx={{ mt: { md: 4 } }}>
                <Box
                  sx={{
                    bgcolor: paper,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '12px',
                    p: 3,
                    height: '100%',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#C8180A',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(200,24,10,0.1)', color: '#C8180A', mb: 3 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8180A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v17M19 7H5M8 20h8" />
                      <path d="M6 7l-2 6h4z" fill="rgba(200,24,10,0.12)" />
                      <path d="M18 7l-2 6h4z" fill="rgba(200,24,10,0.12)" />
                      <circle cx="12" cy="3" r="1.5" fill="#C8180A" stroke="none" />
                    </svg>
                  </Box>
                  <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 700, mb: 0.8, fontSize: 16, color: headingColor }}>
                    {t('pages.landing.features.item2.title', { defaultValue: 'Accountability' })}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', fontSize: 13, lineHeight: 1.5 }}>
                    {t('pages.landing.features.item2.body', { defaultValue: 'Elected officials act as workers executing decisions.' })}
                  </Typography>
                </Box>
              </Grid>

              {/* Card 3: Transparency */}
              <Grid size={6} sx={{ mt: { md: -4 } }}>
                <Box
                  sx={{
                    bgcolor: paper,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '12px',
                    p: 3,
                    height: '100%',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#F5A800',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(245,168,0,0.1)', color: '#F5A800', mb: 3 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5A800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="rgba(245,168,0,0.05)"/>
                      <circle cx="12" cy="12" r="3" fill="rgba(245,168,0,0.15)"/>
                      <circle cx="12" cy="12" r="1"/>
                      <path d="M3 8V5h3M21 8V5h-3M3 16v3h3M21 16v3h-3" strokeWidth="1.2" opacity="0.8"/>
                    </svg>
                  </Box>
                  <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 700, mb: 0.8, fontSize: 16, color: headingColor }}>
                    {t('pages.landing.features.item3.title', { defaultValue: 'Transparency' })}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', fontSize: 13, lineHeight: 1.5 }}>
                    {t('pages.landing.features.item3.body', { defaultValue: 'Decisions and funding details are cryptographically auditable.' })}
                  </Typography>
                </Box>
              </Grid>

              {/* Card 4: Citizen Directives */}
              <Grid size={6}>
                <Box
                  sx={{
                    bgcolor: paper,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '12px',
                    p: 3,
                    height: '100%',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#C8180A',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(200,24,10,0.1)', color: '#C8180A', mb: 3 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8180A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="rgba(200,24,10,0.08)"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="15.54" cy="8.46" r="0.5" fill="#C8180A"/>
                      <circle cx="15.54" cy="15.54" r="0.5" fill="#C8180A"/>
                    </svg>
                  </Box>
                  <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 700, mb: 0.8, fontSize: 16, color: headingColor }}>
                    {t('pages.landing.features.item4.title', { defaultValue: 'Citizen Directives' })}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', fontSize: 13, lineHeight: 1.5 }}>
                    {t('pages.landing.features.item4.body', { defaultValue: 'Voters guide the candidate on every legislative action.' })}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* ── Theme Console Section ────────────────────────────────────────── */}
        <Box sx={{ mt: { xs: 8, md: 12 }, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`, pt: { xs: 6, md: 8 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
            <Typography variant="overline" sx={{ fontFamily: FF_HEADING, fontWeight: 700, letterSpacing: 3, color: '#C8180A', display: 'block', mb: 1 }}>
              VISUAL AESTHETICS
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.4rem' }, color: headingColor, lineHeight: 1.2 }}>
              Choose Your Theme
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#6B7280', mt: 1.5, maxWidth: 560, mx: 'auto', fontSize: '1rem', lineHeight: 1.7 }}>
              Select from three premium color options designed to suit your local workspace lighting and aesthetics.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ maxWidth: 960, mx: 'auto' }}>
            {/* Light Mode Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                onClick={() => setMode('light')}
                sx={{
                  bgcolor: mode === 'light' ? '#FFFFFF' : paper,
                  border: `2px solid ${mode === 'light' ? '#F5A800' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}`,
                  borderRadius: '16px',
                  p: 3.5,
                  cursor: 'pointer',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: mode === 'light' ? '0 8px 32px rgba(245,168,0,0.18)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: '#F5A800',
                  }
                }}
              >
                <Box sx={{
                  width: 48, height: 48, borderRadius: '50%',
                  bgcolor: mode === 'light' ? 'rgba(245,168,0,0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  color: '#F5A800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" fill="rgba(245,168,0,0.1)"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                </Box>
                <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: 18, color: headingColor }}>
                  Light Theme
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', fontSize: 13, lineHeight: 1.6, flexGrow: 1 }}>
                  High-contrast minimalist layout designed for reading comfort during bright daylight hours.
                </Typography>
                {mode === 'light' && (
                  <Box sx={{ bgcolor: '#F5A800', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 1, px: 2, py: 0.5, borderRadius: 5, textTransform: 'uppercase', fontFamily: FF_HEADING }}>
                    Active
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Dark Mode Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                onClick={() => setMode('dark')}
                sx={{
                  bgcolor: mode === 'dark' ? (isDark ? '#161920' : '#f8fafc') : paper,
                  border: `2px solid ${mode === 'dark' ? '#C8180A' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}`,
                  borderRadius: '16px',
                  p: 3.5,
                  cursor: 'pointer',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: mode === 'dark' ? '0 8px 32px rgba(200,24,10,0.18)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: '#C8180A',
                  }
                }}
              >
                <Box sx={{
                  width: 48, height: 48, borderRadius: '50%',
                  bgcolor: mode === 'dark' ? 'rgba(200,24,10,0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  color: '#C8180A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="rgba(200,24,10,0.08)"/>
                  </svg>
                </Box>
                <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: 18, color: headingColor }}>
                  Dark Theme
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', fontSize: 13, lineHeight: 1.6, flexGrow: 1 }}>
                  Conserves device power and prevents eye strain during long evening and night-time usage.
                </Typography>
                {mode === 'dark' && (
                  <Box sx={{ bgcolor: '#C8180A', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 1, px: 2, py: 0.5, borderRadius: 5, textTransform: 'uppercase', fontFamily: FF_HEADING }}>
                    Active
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Noon Mode Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                onClick={() => setMode('grey')}
                sx={{
                  bgcolor: mode === 'grey' ? (isDark ? '#1e2224' : '#e6e8eb') : paper,
                  border: `2px solid ${mode === 'grey' ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}`,
                  borderRadius: '16px',
                  p: 3.5,
                  cursor: 'pointer',
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: mode === 'grey' ? '0 8px 32px rgba(34,197,94,0.18)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: '#22c55e',
                  }
                }}
              >
                <Box sx={{
                  width: 48, height: 48, borderRadius: '50%',
                  bgcolor: mode === 'grey' ? 'rgba(34,197,94,0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  color: '#22c55e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" fill="rgba(34,197,94,0.08)"/>
                    <path d="M8 21v2M12 21v2M16 21v2" strokeLinecap="round"/>
                  </svg>
                </Box>
                <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: 18, color: headingColor }}>
                  Noon Theme
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#4B5563', fontSize: 13, lineHeight: 1.6, flexGrow: 1 }}>
                  Soft afternoon grey aesthetics featuring a fully integrated falling rain backdrop option.
                </Typography>
                {mode === 'grey' && (
                  <Box sx={{ bgcolor: '#22c55e', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 1, px: 2, py: 0.5, borderRadius: 5, textTransform: 'uppercase', fontFamily: FF_HEADING }}>
                    Active
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Interactive rain effect toggle for Noon mode */}
          {mode === 'grey' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Box sx={{
                mt: 4, mx: 'auto', maxWidth: 480, p: 2.5, borderRadius: '16px',
                bgcolor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textAlign: 'left' }}>
                  <Box sx={{ fontSize: 24 }}>🌧️</Box>
                  <Box>
                    <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.9rem', color: headingColor }}>
                      Interactive Rain Backdrop
                    </Typography>
                    <Typography sx={{ fontFamily: FF, fontSize: '0.78rem', color: isDark ? '#A0A5B0' : '#4B5563' }}>
                      Toggle realistic falling raindrops in the background.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant={rainEnabled ? "contained" : "outlined"}
                  color="success"
                  onClick={toggleRain}
                  sx={{
                    fontFamily: FF_HEADING, fontWeight: 800, fontSize: '0.75rem', px: 2.5, py: 1, borderRadius: '8px',
                    bgcolor: rainEnabled ? '#22c55e' : 'transparent',
                    color: rainEnabled ? '#fff' : '#22c55e',
                    borderColor: '#22c55e',
                    '&:hover': {
                      bgcolor: rainEnabled ? '#1b9d4b' : 'rgba(34,197,94,0.08)',
                      borderColor: '#22c55e',
                    }
                  }}
                >
                  {rainEnabled ? "Disable" : "Enable"}
                </Button>
              </Box>
            </motion.div>
          )}
        </Box>

        {/* ── Built With / Tech Stack Section ──────────────────────────────── */}
        <Box sx={{ mt: { xs: 8, md: 12 }, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`, pt: { xs: 6, md: 8 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography variant="overline" sx={{ fontFamily: FF_HEADING, fontWeight: 700, letterSpacing: 3, color: '#F5A800', display: 'block', mb: 1 }}>
              OPEN SOURCE
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.4rem' }, color: headingColor, lineHeight: 1.2 }}>
              Built in the Open
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: FF, color: isDark ? '#A0A5B0' : '#6B7280', mt: 1.5, maxWidth: 560, mx: 'auto', fontSize: '1rem', lineHeight: 1.7 }}>
              Prajaakeeya is proudly open source. Every line of UI code is public and welcomes contributions.
            </Typography>
          </Box>

          {/* Tech Pill Grid */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
            gap: 2,
            mb: { xs: 6, md: 8 },
          }}>
            {[
              {
                label: 'React 19',
                desc: 'UI Framework',
                color: '#61DAFB',
                bg: 'rgba(97,218,251,0.08)',
                border: 'rgba(97,218,251,0.2)',
                svg: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <ellipse cx="14" cy="14" rx="4" ry="4" fill="#61DAFB" opacity="0.9"/>
                    <ellipse cx="14" cy="14" rx="13" ry="5.2" stroke="#61DAFB" strokeWidth="1.4" fill="none"/>
                    <ellipse cx="14" cy="14" rx="13" ry="5.2" stroke="#61DAFB" strokeWidth="1.4" fill="none" transform="rotate(60 14 14)"/>
                    <ellipse cx="14" cy="14" rx="13" ry="5.2" stroke="#61DAFB" strokeWidth="1.4" fill="none" transform="rotate(120 14 14)"/>
                  </svg>
                ),
              },
              {
                label: 'Vite',
                desc: 'Build Tool',
                color: '#A78BFA',
                bg: 'rgba(167,139,250,0.08)',
                border: 'rgba(167,139,250,0.2)',
                svg: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <polygon points="14,3 25,22 3,22" stroke="#A78BFA" strokeWidth="1.5" fill="rgba(167,139,250,0.12)" strokeLinejoin="round"/>
                    <line x1="14" y1="8" x2="10" y2="22" stroke="#A78BFA" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="14" y1="8" x2="19" y2="16" stroke="#F5A800" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                label: 'MUI v9',
                desc: 'Component Library',
                color: '#007FFF',
                bg: 'rgba(0,127,255,0.08)',
                border: 'rgba(0,127,255,0.2)',
                svg: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M4 20V10l8-6 8 6v10" stroke="#007FFF" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(0,127,255,0.08)"/>
                    <path d="M10 20v-6l4-3 4 3v6" stroke="#007FFF" strokeWidth="1.4" strokeLinejoin="round" fill="rgba(0,127,255,0.15)"/>
                  </svg>
                ),
              },
              {
                label: 'TypeScript',
                desc: 'Type Safety',
                color: '#3178C6',
                bg: 'rgba(49,120,198,0.08)',
                border: 'rgba(49,120,198,0.2)',
                svg: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="3" y="3" width="22" height="22" rx="3" fill="rgba(49,120,198,0.12)" stroke="#3178C6" strokeWidth="1.4"/>
                    <text x="5.5" y="20" fontFamily="monospace" fontWeight="bold" fontSize="12" fill="#3178C6">TS</text>
                  </svg>
                ),
              },
              {
                label: 'Heming',
                desc: 'Heading Font',
                color: '#F5A800',
                bg: 'rgba(245,168,0,0.08)',
                border: 'rgba(245,168,0,0.2)',
                svg: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <text x="4" y="21" fontFamily="serif" fontWeight="900" fontSize="20" fill="#F5A800">H</text>
                    <path d="M18 8v13M22 8v13M18 14.5h4" stroke="#F5A800" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                label: 'Geist',
                desc: 'Body Font',
                color: isDark ? '#e0e0e0' : '#374151',
                bg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(55,65,81,0.06)',
                border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(55,65,81,0.15)',
                svg: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <text x="5" y="21" fontFamily="sans-serif" fontWeight="400" fontSize="16" fill={isDark ? '#e0e0e0' : '#374151'}>Aa</text>
                  </svg>
                ),
              },
            ].map((tech) => (
              <Box
                key={tech.label}
                sx={{
                  bgcolor: paper,
                  border: `1px solid ${tech.border}`,
                  borderRadius: '12px',
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  textAlign: 'center',
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 24px ${tech.bg}`,
                    borderColor: tech.color,
                  },
                }}
              >
                <Box sx={{
                  width: 48, height: 48, borderRadius: '12px',
                  bgcolor: tech.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${tech.border}`,
                }}>
                  {tech.svg}
                </Box>
                <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.9rem', color: headingColor, lineHeight: 1.2 }}>
                  {tech.label}
                </Typography>
                <Typography sx={{ fontFamily: FF, fontSize: '0.72rem', color: isDark ? '#6B7280' : '#9CA3AF', lineHeight: 1.3 }}>
                  {tech.desc}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* GitHub CTA */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 3, sm: 4 },
            p: { xs: 3, md: 4 },
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          }}>
            {/* GitHub SVG icon */}
            <Box sx={{
              width: 56, height: 56, borderRadius: '14px', flexShrink: 0,
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill={isDark ? '#e0e0e0' : '#374151'}>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.09.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.254-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.393.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.748 0 .267.18.577.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '1.05rem', color: headingColor, mb: 0.5 }}>
                Are you a techie &amp; interested in Open Source?
              </Typography>
              <Typography sx={{ fontFamily: FF, fontSize: '0.9rem', color: isDark ? '#A0A5B0' : '#6B7280', lineHeight: 1.6 }}>
                Prajaakeeya's frontend is open source. If you care about democracy and technology, we'd love your contribution — bug fixes, features, translations, anything helps.
              </Typography>
            </Box>
            <Box
              component="a"
              href="https://github.com/prajaakeeya/prajaakeeya-frontend"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                px: 3, py: 1.25,
                borderRadius: '10px',
                fontFamily: FF_HEADING,
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                color: isDark ? '#fff' : '#111827',
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)',
                  transform: 'translateY(-1px)',
                  boxShadow: isDark ? '0 4px 14px rgba(255,255,255,0.08)' : '0 4px 14px rgba(0,0,0,0.1)',
                },
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.09.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.254-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.393.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.748 0 .267.18.577.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              View on GitHub
            </Box>
          </Box>
        </Box>
      </Container>
      {mode === 'grey' && rainEnabled && <RainEffect />}
    </Box>
  );
};

export default AboutPage;
