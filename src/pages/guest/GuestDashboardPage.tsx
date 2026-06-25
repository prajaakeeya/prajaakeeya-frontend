import { Card, CardContent, Typography, Box, Stack, useTheme, Button, Grid, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import leaderImg from '../../assets/images/leader.webp';
import alertImg from '../../assets/images/alert.webp';
import sopImg from '../../assets/images/sop.webp';
import employeesImg from '../../assets/images/employees.webp';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../../theme';

import { getVoters } from '../../services/voterService';
import { getCitizensCount } from '../../services/statsService';
import useThemeStore from '../../store/useThemeStore';
import usePreferenceStore from '../../store/usePreferenceStore';
import { ArrowForwardRounded as ArrowIcon, AppRegistration as RegisterIcon, HomeRounded as HomeIcon, TuneRounded as TuneIcon } from '@mui/icons-material';


const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";

const CSSStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes pulse-live {
      0% { transform: scale(0.85); opacity: 0.6; }
      50% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(0.85); opacity: 0.6; }
    }
    @keyframes draw-sparkline {
      to {
        stroke-dashoffset: 0;
      }
    }
    .pulse-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background-color: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 8px #22c55e;
      animation: pulse-live 2s infinite ease-in-out;
    }
    .sparkline-path {
      stroke-dasharray: 200;
      stroke-dashoffset: 200;
      animation: draw-sparkline 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    .tech-grid-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-size: 32px 32px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
    }
    .tech-grid-overlay-light {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-size: 32px 32px;
      background-image: 
        linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
    }
  `}} />
);

const GuestDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const isKannada = (i18n.language || '').startsWith('kn');
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';
  const { activeLayout } = usePreferenceStore();
  const activePrefs = activeLayout !== null ? 1 : 0;

  const textPrimary = theme.palette.text.primary;
  const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;
  const textHigh = isDark ? '#A0A5B0' : '#4B5563';
  const BORDER = mode === 'grey' ? 'rgba(0, 0, 0, 0.08)' : isDark ? '#5B403D' : 'rgba(239, 68, 68, 0.2)';

  const [totalCitizens, setTotalCitizens] = React.useState<number | null>(null);

  const handleActionClick = (path: string) => {
    navigate(path);
  };
  React.useEffect(() => {
    let cancelled = false;
    getCitizensCount()
      .then((resp: any) => {
        if (cancelled) return;
        const total = resp?.data?.citizens;
        if (typeof total === 'number') setTotalCitizens(total);
      })
      .catch(() => { /* ignore — count stays hidden */ });
    return () => { cancelled = true; };
  }, []);

  const heroBg = mode === 'grey'
    ? 'linear-gradient(135deg, rgb(242, 241, 230) 0%, #EBEAE0 100%)'
    : isDark
      ? 'radial-gradient(130% 150% at 6% 0%, rgba(200, 24, 10, 0.15) 0%, #121415 65%), radial-gradient(120% 130% at 100% 0%, rgba(245, 168, 0, 0.08) 0%, #121415 65%)'
      : 'linear-gradient(135deg, rgba(200, 24, 10, 0.03) 0%, rgba(245, 168, 0, 0.04) 50%, rgba(255, 255, 255, 0.9) 100%)';

  const kpiCardBg = mode === 'grey'
    ? 'rgba(255, 255, 255, 0.7)'
    : isDark
      ? 'rgba(18, 20, 21, 0.6)'
      : 'rgba(255, 255, 255, 0.85)';

  const kpiCardBorder = mode === 'grey'
    ? 'rgba(0, 0, 0, 0.08)'
    : isDark
      ? 'rgba(245, 168, 0, 0.15)'
      : 'rgba(245, 168, 0, 0.25)';

  const actions = [
    {
      title: t('userDashboard.actions.candidates', { defaultValue: 'View Aspirants' }),
      desc: t('userDashboard.actions.candidatesDesc', { defaultValue: 'View All Aspirants from Your Ward' }),
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="11" r="5" stroke={BRAND.red} strokeWidth="1.6" fill="rgba(200,24,10,0.1)"/>
          <path d="M5 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke={BRAND.red} strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="22" cy="9" r="3" stroke={BRAND.red} strokeWidth="1.2" fill="rgba(200,24,10,0.08)" opacity="0.5" strokeDasharray="2 1.5"/>
        </svg>
      ),
      path: '/guest/aspirants',
      color: BRAND.red,
    },
    {
      title: t('userDashboard.actions.civicIssues', { defaultValue: 'Public Issues' }),
      desc: t('userDashboard.actions.civicIssuesDesc', { defaultValue: 'Report Your Public Issues' }),
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="12" stroke="#F5A800" strokeWidth="1.6" fill="rgba(245,168,0,0.08)"/>
          <path d="M15 9v8" stroke="#F5A800" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="15" cy="21" r="1.2" fill="#F5A800"/>
        </svg>
      ),
      path: '/guest/civic-issues',
      color: '#F5A800',
    },
    {
      title: t('userDashboard.actions.howUPPWorks', { defaultValue: 'SOP' }),
      desc: t('userDashboard.actions.howWorksTitle', { defaultValue: 'Check the SOP to understand how the Prajaakeeya system works.' }),
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="11" stroke={BRAND.red} strokeWidth="1.5" fill="rgba(200,24,10,0.08)"/>
          <path d="M11.5 12a3.5 3.5 0 0 1 7 0c0 2-2 3-2 5" stroke={BRAND.red} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="15" cy="22" r="1.2" fill={BRAND.red}/>
        </svg>
      ),
      path: '/guest/sop',
      color: BRAND.red,
    },
    {
      title: t('userDashboard.actions.registeredAspirants', { defaultValue: 'Registered Aspirants' }),
      desc: t('userDashboard.actions.registeredAspirantsDesc', { defaultValue: 'See all registered aspirants' }),
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="11" cy="10" r="4" stroke="#F5A800" strokeWidth="1.6" fill="rgba(245,168,0,0.12)"/>
          <path d="M3 25c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#F5A800" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="21" cy="10" r="3" stroke="#F5A800" strokeWidth="1.4" fill="rgba(245,168,0,0.08)" opacity="0.6"/>
          <path d="M23 25c0-3.314-2.686-6-6-6" stroke="#F5A800" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
        </svg>
      ),
      path: '/guest/registered-aspirants',
      color: '#F5A800',
    },
    {
      title: isKannada ? 'ಚುನಾವಣೆ' : 'Election',
      desc: isKannada
        ? 'ಪ್ರಸ್ತುತ ಪ್ರತ್ಯಕ್ಷ ಪ್ರಜಾಪ್ರಭುತ್ವ ಚುನಾವಣೆಗಳ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ.'
        : 'View details and results of direct democracy elections.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={BRAND.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 12V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v7" />
          <rect x="2" y="12" width="20" height="9" rx="2" />
          <path d="M12 15h.01" />
        </svg>
      ),
      path: '/guest/elections',
      color: BRAND.red,
    },
    {
      title: isKannada ? 'ಅಂಕಿಅಂಶಗಳು' : 'Stats',
      desc: isKannada
        ? 'ನಾಗರಿಕರ ನೋಂದಣಿ ಸಂಖ್ಯೆಗಳು ಮತ್ತು ಪ್ರಗತಿಯ ಅಂಕಿಅಂಶಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.'
        : 'Track citizen registration numbers and participation statistics.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F5A800" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      path: '/guest/stats',
      color: '#F5A800',
    },
    {
      title: isKannada ? 'ಸಂಪರ್ಕಿಸಿ' : 'Contact Us',
      desc: isKannada
        ? 'ಪ್ರಜಾಕೀಯ ಆಡಳಿತ ಬೆಂಬಲ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.'
        : 'Get in touch with the Prajaakeeya administration support team.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={BRAND.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      path: '/guest/contact-us',
      color: BRAND.red,
    },
    {
      title: isKannada ? 'ಕಾರ್ಯಕರ್ತರು' : 'Karyakartas',
      desc: isKannada
        ? 'ನಮ್ಮ ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ಸಕ್ರಿಯ ನಾಗರಿಕರ ತಂಡವನ್ನು ಸೇರಿಕೊಳ್ಳಿ.'
        : 'Join our team of volunteers and active citizens.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F5A800" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      path: '/guest/karyakartas',
      color: '#F5A800',
    },
  ];

  return (
    <Stack spacing={5} sx={{ fontFamily: FF_BODY, pb: { xs: 5, md: 8 } }}>
      <CSSStyles />

      {/* Split Hero Banner (Corporate & Creative Level) */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: heroBg,
          border: `1px solid ${BORDER}`,
          position: 'relative',
          boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.45)' : '0 12px 30px rgba(17,24,39,0.04)',
        }}>
          {/* Tech Grid Background Lines */}
          <div className={isDark ? 'tech-grid-overlay' : 'tech-grid-overlay-light'} />
          
          {/* Top color trim */}
          <Box sx={{ height: '4px', background: `linear-gradient(90deg, ${BRAND.red} 0%, #F5A800 50%, ${BRAND.red} 100%)` }} />

          <Box sx={{
            px: { xs: 3, sm: 4, md: 6 },
            py: { xs: 4, sm: 5, md: 6 },
            position: 'relative',
            zIndex: 2,
          }}>

            <Grid container spacing={4} sx={{ alignItems: 'center' }}>
              {/* Left Column - Branding and Directives */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2.5}>
                  {/* Status Pill Badge */}
                  <Box sx={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      px: 2,
                      py: 0.7,
                      borderRadius: '50px',
                      bgcolor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                    }}>
                      <span className="pulse-dot" />
                      <Typography sx={{
                        fontFamily: FF_HEADING,
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: '#22c55e',
                        textTransform: 'uppercase',
                      }}>
                        {isKannada ? 'ಪ್ರತ್ಯಕ್ಷ ಪ್ರಜಾಪ್ರಭುತ್ವ ನಿಯಂತ್ರಣ' : 'Direct Democracy Console'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* High-end Title */}
                  <Box>
                    <Typography variant="h3" sx={{
                      fontFamily: FF_HEADING,
                      fontWeight: 800,
                      color: textPrimary,
                      letterSpacing: '-0.025em',
                      lineHeight: 1.15,
                    }}>
                      {isKannada ? (
                        <>
                          ಅತಿಥಿ <span style={{ color: GOLD }}>ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</span>
                        </>
                      ) : (
                        <>
                          Guest <span style={{ color: GOLD }}>Dashboard</span>
                        </>
                      )}
                    </Typography>
                    <Typography sx={{
                      fontFamily: FF_BODY,
                      mt: 1.5,
                      fontSize: '1.02rem',
                      color: textHigh,
                      fontWeight: 500,
                      lineHeight: 1.6,
                      maxWidth: '580px',
                    }}>
                      {isKannada
                        ? 'ಪ್ರಜಾಕೀಯ ಅನ್ವೇಷಿಸಿ — ಭಾಗವಹಿಸಲು ಮತ್ತು ನಿಮ್ಮ ಪ್ರತಿನಿಧಿಗಳನ್ನು ನಿಯಂತ್ರಿಸಲು ನಾಗರಿಕರಾಗಿ ನೋಂದಾಯಿಸಿ.'
                        : 'Explore Prajaakeeya — Register as a citizen to actively elect, monitor, and guide candidates in a transparent direct democracy model.'}
                    </Typography>
                  </Box>

                  {/* Call-to-actions */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1.5 }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/register')}
                      startIcon={<RegisterIcon />}
                      sx={{
                        fontFamily: FF_HEADING,
                        fontWeight: 700,
                        px: 3.5,
                        py: 1.5,
                        borderRadius: '6px',
                        boxShadow: `0 4px 18px ${BRAND.red}35`,
                      }}
                    >
                      {isKannada ? 'ನಾಗರಿಕರಾಗಿ ನೋಂದಾಯಿಸಿ' : 'Become a Citizen'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/')}
                      startIcon={<HomeIcon />}
                      sx={{
                        fontFamily: FF_HEADING,
                        fontWeight: 700,
                        px: 3.5,
                        py: 1.5,
                        borderRadius: '6px',
                      }}
                    >
                      {isKannada ? 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' : 'Back to Home'}
                    </Button>
                    <Tooltip title={`View Preferences${activePrefs > 0 ? ` (${activePrefs} active)` : ''}`} arrow>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/preferences')}
                        startIcon={<TuneIcon />}
                        sx={{
                          fontFamily: FF_HEADING,
                          fontWeight: 700,
                          px: 3,
                          py: 1.5,
                          borderRadius: '6px',
                          borderColor: activePrefs > 0 ? BRAND.red : undefined,
                          color: activePrefs > 0 ? BRAND.red : undefined,
                          position: 'relative',
                        }}
                      >
                        {isKannada ? 'ಆದ್ಯತೆಗಳು' : 'Preferences'}
                        {activePrefs > 0 && (
                          <Box component="span" sx={{
                            ml: 0.8,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: BRAND.red,
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#fff',
                          }}>{activePrefs}</Box>
                        )}
                      </Button>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Grid>

              {/* Right Column - Goldman Sachs Styled KPI Graph Card */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{
                  background: kpiCardBg,
                  border: `1.5px solid ${kpiCardBorder}`,
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  p: 3.5,
                  boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(17, 24, 39, 0.04)',
                }}>
                  {/* KPI header */}
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{
                      fontFamily: FF_HEADING,
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: GOLD,
                    }}>
                      {t('userDashboard.totalCitizens', { defaultValue: 'No. of Registered Citizens' })}
                    </Typography>
                    <Box sx={{
                      px: 1, py: 0.3, borderRadius: '4px',
                      bgcolor: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.15)',
                    }}>
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '9px', fontWeight: 800, color: '#22c55e' }}>
                        LIVE
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Main numeric statistic */}
                  <Typography sx={{
                    fontFamily: FF_HEADING,
                    fontSize: { xs: '2.2rem', sm: '2.6rem', md: '2.8rem' },
                    fontWeight: 800,
                    color: textPrimary,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}>
                    {totalCitizens != null ? totalCitizens.toLocaleString() : '...'}
                  </Typography>

                  {/* SVG Sparkline chart representing growth trend */}
                  <Box sx={{ mt: 3.5, mb: 3.5, height: 42, overflow: 'visible', position: 'relative' }}>
                    <svg viewBox="0 0 200 40" width="100%" height="100%" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Area under chart */}
                      <path d="M 0,40 Q 30,35 60,25 T 120,22 T 170,10 T 200,4 L 200,40 Z" fill="url(#chartGrad)" />
                      {/* Drawing Line */}
                      <path
                        className="sparkline-path"
                        d="M 0,38 Q 30,35 60,25 T 120,22 T 170,10 T 200,4"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Pulsing indicator node */}
                      <circle cx="200" cy="4" r="4.5" fill="#22c55e" stroke={isDark ? '#121415' : '#ffffff'} strokeWidth="1.5" />
                    </svg>
                  </Box>

                  {/* Meta Details Grid */}
                  <Box sx={{
                    pt: 2.5,
                    borderTop: `1px solid ${mode === 'grey' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1.5,
                  }}>
                    <Box>
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '8px', color: textHigh, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.3 }}>
                        Active Wards
                      </Typography>
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.85rem', fontWeight: 800, color: textPrimary }}>
                        198 / 198
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '8px', color: textHigh, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.3 }}>
                        Audit Status
                      </Typography>
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.85rem', fontWeight: 800, color: '#22c55e' }}>
                        Verified
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '8px', color: textHigh, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.3 }}>
                        Audit Node
                      </Typography>
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.85rem', fontWeight: 800, color: textPrimary }}>
                        Direct-Dem
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>

          </Box>
        </Box>
      </motion.div>

      {/* Grid of Action Tiles */}
      {activeLayout === 'cardover' ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            width: '100%',
            mx: 'auto',
            pb: 4,
          }}
        >
          {actions.map((action, index) => {
            return (
              <Box
                key={action.path}
                sx={{
                  position: 'sticky',
                  top: { xs: 70 + index * 20, sm: 80 + index * 25 },
                  zIndex: 10 + index,
                  width: '100%',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <Card
                    onClick={() => handleActionClick(action.path)}
                    sx={{
                      borderRadius: '20px',
                      cursor: 'pointer',
                      background: theme.palette.background.paper,
                      border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'}`,
                      boxShadow: isDark
                        ? '0 -8px 24px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.7)'
                        : '0 -4px 16px rgba(0,0,0,0.03), 0 12px 24px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.005)',
                        borderColor: action.color,
                        boxShadow: isDark
                          ? `0 14px 36px rgba(0,0,0,0.5), 0 0 0 1px ${action.color}35`
                          : `0 14px 36px rgba(0, 0, 0, 0.06), 0 0 0 1px ${action.color}35`,
                      },
                    }}
                  >
                    {/* Accent bar at the top */}
                    <Box sx={{ height: '4px', background: action.color, opacity: 0.85 }} />

                    <CardContent
                      sx={{
                        p: { xs: 2.5, sm: 3, md: 4 },
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        gap: { xs: 2.5, sm: 4 },
                        '&:last-child': { pb: { xs: 2.5, sm: 3, md: 4 } },
                      }}
                    >
                      {/* Larger icon container */}
                      <Box
                        sx={{
                          width: { xs: 72, sm: 84, md: 96 },
                          height: { xs: 72, sm: 84, md: 96 },
                          borderRadius: '20px',
                          background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                          flexShrink: 0,
                          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          '.MuiCard-root:hover &': {
                            background: `${action.color}12`,
                            borderColor: action.color,
                            transform: 'rotate(10deg) scale(1.08)',
                          },
                          '& svg': { fontSize: { xs: 36, sm: 42, md: 48 } },
                          '& img': { width: { xs: 36, sm: 42, md: 48 }, height: { xs: 36, sm: 42, md: 48 } },
                        }}
                      >
                        {action.icon}
                      </Box>

                      {/* Title and description */}
                      <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography
                          sx={{
                            fontFamily: FF_HEADING,
                            fontWeight: 800,
                            color: textPrimary,
                            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                            lineHeight: 1.25,
                            mb: 0.75,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {action.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: FF_BODY,
                            color: textHigh,
                            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                            lineHeight: 1.55,
                            fontWeight: 500,
                          }}
                        >
                          {action.desc}
                        </Typography>
                      </Box>

                      {/* Launch indicator link with arrow horizontal shift */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.8,
                          color: action.color,
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          flexShrink: 0,
                          alignSelf: { xs: 'stretch', sm: 'center' },
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          '& .arrow-icon': {
                            fontSize: '16px',
                            transition: 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          },
                          '.MuiCard-root:hover & .arrow-icon': {
                            transform: 'translateX(6px)',
                          },
                        }}
                      >
                        <span>{isKannada ? 'ಸೇವೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ' : 'Launch Service'}</span>
                        <ArrowIcon className="arrow-icon" />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: 3.5,
          width: '100%',
          mx: 'auto',
        }}>
          {actions.map((action, index) => (
            <Box key={action.path} sx={{ display: 'flex', flexDirection: 'column' }}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.45, delay: 0.1 + index * 0.08 }} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Card
                  onClick={() => handleActionClick(action.path)}
                  sx={{
                    height: '100%',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: theme.palette.background.paper,
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'}`,
                    boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.02)',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: isDark
                        ? `0 14px 36px rgba(0,0,0,0.5), 0 0 0 1px ${action.color}35`
                        : `0 14px 36px rgba(0, 0, 0, 0.06), 0 0 0 1px ${action.color}35`,
                      borderColor: action.color,
                    },
                  }}
                >
                  {/* Accent bar at the top */}
                  <Box sx={{ height: '4px', background: action.color, opacity: 0.85 }} />

                  <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1 }}>
                    {/* Circular Icon Container with rotation on hover */}
                    <Box sx={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                      mb: 3.5,
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      '.MuiCard-root:hover &': {
                        background: `${action.color}12`,
                        borderColor: action.color,
                        transform: 'rotate(10deg) scale(1.08)',
                      }
                    }}>
                      {action.icon}
                    </Box>

                    {/* Title */}
                    <Typography sx={{
                      fontFamily: FF_HEADING,
                      fontWeight: 800,
                      color: textPrimary,
                      fontSize: '1.12rem',
                      lineHeight: 1.3,
                      mb: 1.2,
                      letterSpacing: '-0.01em',
                    }}>
                      {action.title}
                    </Typography>

                    {/* Description */}
                    <Typography sx={{
                      fontFamily: FF_BODY,
                      color: textHigh,
                      fontSize: '0.84rem',
                      lineHeight: 1.55,
                      fontWeight: 500,
                    }}>
                      {action.desc}
                    </Typography>

                    {/* Launch indicator link with arrow horizontal shift */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      mt: 'auto',
                      pt: 3.5,
                      color: action.color,
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      '& .arrow-icon': {
                        fontSize: '16px',
                        transition: 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      },
                      '.MuiCard-root:hover & .arrow-icon': {
                        transform: 'translateX(6px)',
                      }
                    }}>
                      <span>{isKannada ? 'ಸೇವೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ' : 'Launch Service'}</span>
                      <ArrowIcon className="arrow-icon" />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          ))}
        </Box>
      )}
    </Stack>
  );
};

export default GuestDashboardPage;
