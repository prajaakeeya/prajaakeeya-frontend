import React from 'react';
import { Box, Grid, Container, useTheme, Typography, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import introPerceptiveImg from '../assets/images/intro_perceptive.png';
import peopleAreOwnerImg from '../assets/images/people_are_owner.png';
import employeesImg from '../assets/images/employees.webp';
import officeImg from '../assets/images/office.webp';
import RainEffect from '../components/RainEffect';
import AppFooter from '../components/AppFooter';
import { BRAND } from '../theme';
import usePreferenceStore from '../store/usePreferenceStore';

/* ═══════════════ ICONS ═══════════════ */

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'lockBlink 1.5s ease-in-out infinite' }}>
    <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="#C8180A" strokeWidth="1.8" />
    <path d="M8 11V8a4 4 0 118 0v3" stroke="#C8180A" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1.5" fill="#C8180A" />
  </svg>
);

const OpenLockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="#F5A800" strokeWidth="1.8" />
    <path d="M8 11V8a4 4 0 118 0" stroke="#F5A800" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1.5" fill="#F5A800" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/* ═══════════════ ANIMATED CROWN ═══════════════ */

const AnimatedCrown = () => (
  <div className="crown-wrap">
    <div className="sparkle s1" /><div className="sparkle s2" />
    <div className="sparkle s3" /><div className="sparkle s4" />
    <div className="crown-glow" />
    <svg className="crown-svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M6 35L10 13l10 10L24 6l4 17 10-10 4 22H6z" fill="url(#crG)" stroke="#F5A800" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="6" y="35" width="36" height="5.5" rx="2.5" fill="url(#crBand)" />
      <circle cx="14" cy="37.8" r="1.8" fill="#C8180A" />
      <circle cx="24" cy="37.8" r="2" fill="#F5A800" />
      <circle cx="34" cy="37.8" r="1.8" fill="#C8180A" />
      <circle cx="24" cy="6" r="2.2" fill="#FFD700" stroke="#DAA520" strokeWidth=".8" />
      <circle cx="10" cy="13" r="1.6" fill="#FFD700" stroke="#DAA520" strokeWidth=".6" />
      <circle cx="38" cy="13" r="1.6" fill="#FFD700" stroke="#DAA520" strokeWidth=".6" />
      <defs>
        <linearGradient id="crG" x1="24" y1="6" x2="24" y2="35">
          <stop stopColor="#FFE566" /><stop offset=".5" stopColor="#FFD700" /><stop offset="1" stopColor="#FF9500" />
        </linearGradient>
        <linearGradient id="crBand" x1="6" y1="35" x2="42" y2="40">
          <stop stopColor="#DAA520" /><stop offset=".5" stopColor="#FFD700" /><stop offset="1" stopColor="#B8860B" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

/* ═══════════════ MAIN REDESIGN ═══════════════ */

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { mode, rainEnabled } = useThemeStore();
  const { t } = useTranslation();

  const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;

  // Custom CSS mimicking the Stitch layout and style tokens using clean Vanilla CSS
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

    body {
      font-family: 'Sora', sans-serif;
    }

    .glass-nav {
      position: fixed;
      top: 24px;
      left: 5%;
      right: 5%;
      width: 90%;
      margin: 0 auto;
      z-index: 1000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 28px;
      background: ${isDark ? 'rgba(18, 20, 21, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
      backdrop-filter: blur(12px);
      border: 1px solid ${isDark ? '#5B403D' : 'rgba(239, 68, 68, 0.2)'};
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      /* Always visible since hero is removed */
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .glass-nav.scrolled {
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      border-radius: 0;
      border-left: none;
      border-right: none;
      padding: 10px 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      
      /* Make visible when scrolled */
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .nav-links {
      display: flex;
      gap: 32px;
      align-items: center;
    }

    .nav-link {
      font-family: 'Sora', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: ${isDark ? '#E2E2E3' : '#374151'};
      text-decoration: none;
      transition: color 0.2s ease;
      cursor: pointer;
    }

    .nav-link:hover {
      color: ${isDark ? '#F5A800' : '#BE8507'};
    }

    .nav-pill-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 9999px;
      border: 1px solid #F5A800;
      color: #F5A800;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      background: rgba(245, 168, 0, 0.05);
      margin-bottom: 24px;
      animation: breathe 3s infinite ease-in-out;
    }

    @keyframes breathe {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.03); }
    }

    .hero-btn-red {
      padding: 16px 36px;
      background: #C8180A;
      color: #FFFFFF;
      font-family: 'Sora', sans-serif;
      font-weight: 700;
      font-size: 15px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(200, 24, 10, 0.25);
      transition: all 0.2s ease;
    }

    .hero-btn-red:hover {
      background: #E02010;
      transform: translateY(-2px);
      box-shadow: 0 6px 28px rgba(200, 24, 10, 0.45);
    }

    .hero-btn-gold {
      padding: 16px 36px;
      background: transparent;
      color: ${isDark ? '#F5A800' : '#BE8507'};
      font-family: 'Sora', sans-serif;
      font-weight: 700;
      font-size: 15px;
      border: 1.5px solid #F5A800;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .hero-btn-gold:hover {
      background: rgba(245, 168, 0, 0.08);
      transform: translateY(-2px);
    }

    .premium-card {
      background: ${paper};
      border-radius: 12px;
      padding: 32px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .premium-card.red-theme {
      border: 1px solid ${isDark ? '#5B403D' : 'rgba(239,68,68,.3)'};
    }
    .premium-card.red-theme:hover {
      border-color: #C8180A;
      box-shadow: 0 8px 32px rgba(200, 24, 10, 0.15);
    }

    .premium-card.gold-theme {
      border: 1px solid ${isDark ? '#F5A800' : 'rgba(245, 168, 0, 0.3)'};
      box-shadow: ${isDark ? '0 8px 32px rgba(200,24,10,0.15)' : 'none'};
    }
    .premium-card.gold-theme:hover {
      border-color: #F5A800;
      box-shadow: 0 8px 40px rgba(245, 168, 0, 0.18);
    }

    .crown-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      margin-bottom: 8px;
    }
    .crown-svg {
      position: relative;
      z-index: 2;
      animation: crownFloat 3s ease-in-out infinite;
      filter: drop-shadow(0 4px 12px rgba(245,168,0,.35));
    }
    @keyframes crownFloat {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(1deg); }
    }
    .crown-glow {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      z-index: 0;
      background: radial-gradient(circle, rgba(245,168,0,0.2) 0%, transparent 70%);
      animation: glowP 3s ease-in-out infinite;
    }
    @keyframes glowP {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.15); }
    }
    .sparkle {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      z-index: 3;
      background: #F5A800;
      animation: sparkA 2.4s ease-in-out infinite;
    }
    .s1 { top: 6px; left: 20px; animation-delay: 0s; }
    .s2 { top: 10px; right: 14px; animation-delay: .6s; }
    .s3 { bottom: 16px; left: 10px; animation-delay: 1.2s; }
    .s4 { bottom: 10px; right: 20px; animation-delay: 1.8s; }
    @keyframes sparkA {
      0%, 100% { opacity: 0; transform: scale(0); }
      30% { opacity: 1; transform: scale(1.2); }
      60% { opacity: 0; transform: scale(0); }
    }

    @keyframes lockBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }

    .value-card {
      background: ${paper};
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'};
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      height: 100%;
    }
    .value-card:hover {
      border-color: ${isDark ? '#F5A800' : '#BE8507'};
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }

    .cta-banner {
      background: ${isDark ? 'rgba(30, 32, 33, 0.6)' : 'rgba(255, 255, 255, 0.9)'};
      border: 2px solid ${isDark ? 'rgba(200, 24, 10, 0.15)' : 'rgba(239, 68, 68, 0.2)'};
      border-radius: 24px;
      padding: 64px 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
  `;

  const { activeLayout } = usePreferenceStore();
  const isActive = activeLayout !== null;

  // Derive layout flags from the single active layout
  const isReverse  = activeLayout === 'reverse';
  const isStraight = activeLayout === 'straight' || activeLayout === 'cardover';
  const isLeft     = false;
  const isRight    = false;
  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh', color: isDark ? '#E2E2E3' : '#111827', pb: 0, overflowX: 'hidden' }}>
      <style>{CSS}</style>

      {/* ── Floating Preferences FAB ── */}
      <Tooltip title={`View Preferences${isActive ? ' (1 active)' : ''}`} placement="left" arrow>
        <Box
          onClick={() => navigate('/preferences')}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 28,
            zIndex: 1200,
            width: 52,
            height: 52,
            borderRadius: '14px',
            background: isDark
              ? 'linear-gradient(135deg, #1A1D22, #161920)'
              : 'linear-gradient(135deg, #FFFFFF, #F8FAFC)',
            border: isActive ? `1.5px solid ${BRAND.red}` : (isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)'),
            boxShadow: isActive
              ? `0 8px 28px ${BRAND.red}30, 0 2px 8px rgba(0,0,0,0.3)`
              : '0 4px 20px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s ease',
            '&:hover': {
              transform: 'translateY(-3px) scale(1.06)',
              borderColor: BRAND.red,
              boxShadow: `0 12px 36px ${BRAND.red}40`,
            },
          }}
        >
          {/* Tune SVG icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h10M4 18h13" stroke={isActive ? BRAND.red : (isDark ? '#E2E2E3' : '#374151')} strokeWidth="2" strokeLinecap="round" />
            <circle cx="17" cy="6" r="2.5" stroke={isActive ? BRAND.red : (isDark ? '#E2E2E3' : '#374151')} strokeWidth="1.8" fill={isDark ? '#161920' : '#fff'} />
            <circle cx="15" cy="12" r="2.5" stroke={BRAND.yellow} strokeWidth="1.8" fill={isDark ? '#161920' : '#fff'} />
            <circle cx="18" cy="18" r="2.5" stroke={isActive ? BRAND.red : (isDark ? '#E2E2E3' : '#374151')} strokeWidth="1.8" fill={isDark ? '#161920' : '#fff'} />
          </svg>
          {isActive && (
            <Box
              sx={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: BRAND.red,
                border: `2px solid ${isDark ? '#0D0F12' : '#F8FAFC'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 800,
                color: '#fff',
                fontFamily: "'Heming', 'Geist Variable', 'Geist', sans-serif",
              }}
            >
              1
            </Box>
          )}
        </Box>
      </Tooltip>

      {/* ── Left/Right accent strip when those layouts are active ── */}
      {(isLeft || isRight) && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          [isLeft ? 'left' : 'right']: 0,
          width: 4,
          zIndex: 1100,
          background: isLeft
            ? `linear-gradient(180deg, ${BRAND.red}, ${BRAND.red}55, transparent)`
            : `linear-gradient(180deg, ${BRAND.yellow}, ${BRAND.yellow}55, transparent)`,
        }} />
      )}

      {/* No Entry / Welcome Owner Sections */}
      <Container id="appraisal" maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: 8 }}>
        <Box sx={{
          textAlign: isRight ? 'right' : isLeft ? 'left' : 'center',
          mb: 6,
          pl: isLeft ? 3 : 0,
          pr: isRight ? 3 : 0,
          borderLeft: isLeft ? `4px solid ${BRAND.red}` : 'none',
          borderRight: isRight ? `4px solid ${BRAND.yellow}` : 'none',
          transition: 'all 0.4s ease',
        }}>
          <Typography variant="overline" sx={{ fontFamily: "'Heming', 'Geist Variable', 'Geist', sans-serif", fontWeight: 700, letterSpacing: 3, color: '#C8180A' }}>
            {t('pages.landing.homePage.title')}
          </Typography>
          <Typography variant="h3" sx={{ fontFamily: "'Heming', 'Geist Variable', 'Geist', sans-serif", fontWeight: 800, mt: 1, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            {(() => {
              const text = t('pages.landing.animatedSubtitle', { defaultValue: 'Every citizen shapes our future.' });
              if (text.includes("citizen")) {
                const parts = text.split("citizen");
                return (
                  <>
                    {parts[0]}
                    <span style={{ color: '#F5A800' }}>citizen</span>
                    {parts[1]}
                  </>
                );
              } else if (text.includes("ನಾಗರಿಕನು")) {
                const parts = text.split("ನಾಗರಿಕನು");
                return (
                  <>
                    {parts[0]}
                    <span style={{ color: '#F5A800' }}>ನಾಗರಿಕನು</span>
                    {parts[1]}
                  </>
                );
              }
              return text;
            })()}
          </Typography>
        </Box>

        {/* ── Image grid — layout controlled by activeLayout ── */}
        <Grid
          container
          spacing={isStraight ? 3 : 4}
          sx={{
            justifyContent: isLeft ? 'flex-start' : isRight ? 'flex-end' : 'center',
            flexDirection: isStraight ? 'column' : isReverse ? 'row-reverse' : 'row',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Image 1: Intro Perceptive */}
          <Grid size={{ xs: 12, md: isStraight ? 12 : 6 }}>
            <Box
              component="img"
              src={introPerceptiveImg}
              alt="Intro Perceptive"
              sx={{
                width: '100%',
                borderRadius: '12px',
                border: `1.5px solid ${isDark ? '#5B403D' : 'rgba(239, 68, 68, 0.2)'}`,
                boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 24px rgba(17, 24, 39, 0.05)',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                '&:hover': { transform: 'scale(1.02)', borderColor: '#C8180A' },
              }}
            />
          </Grid>

          {/* Image 2: People are Owner */}
          <Grid size={{ xs: 12, md: isStraight ? 12 : 6 }}>
            <Box
              component="img"
              src={peopleAreOwnerImg}
              alt="People are Owner"
              sx={{
                width: '100%',
                borderRadius: '12px',
                border: `1.5px solid ${isDark ? '#F5A800' : 'rgba(245, 168, 0, 0.2)'}`,
                boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 24px rgba(245, 168, 0, 0.05)',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                '&:hover': { transform: 'scale(1.02)', borderColor: '#F5A800' },
              }}
            />
          </Grid>

          {/* Action Row containing Consolidated Proceed Button */}
          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <button
                className="hero-btn-red"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  width: '100%',
                  maxWidth: '420px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  letterSpacing: '0.5px',
                  borderRadius: '12px',
                  textAlign: 'left'
                }}
                onClick={() => navigate('/oath')}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    p: '6px',
                    height: 38,
                    width: 38,
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya Logo" sx={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'rgba(255,255,255,0.75)', fontWeight: 800, fontFamily: "'Geist Variable', 'Geist', sans-serif", lineHeight: 1.1 }}>
                    Prajaakeeya Governance
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '16px', fontWeight: 800, color: BRAND.green, fontFamily: "'Geist Variable', 'Geist', sans-serif", lineHeight: 1.2, mt: '2px' }}>
                    {t('pages.landing.homePage.proceed')}
                  </Typography>
                </Box>
              </button>
            </Box>
          </Grid>
        </Grid>
      </Container>



      <AppFooter />
      {mode === 'grey' && rainEnabled && <RainEffect />}
    </Box>
  );
};

export default HomePage;
