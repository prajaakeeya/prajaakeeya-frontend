import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { DarkModeRounded, LightModeRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';
import useThemeStore from '../store/useThemeStore';
import LanguageSelector from '../components/LanguageSelector';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';

/* ─────────────────────────────────────────────────────────────────────────
   The landing page is a threshold, not a dashboard: a citizen sheds two
   mindsets at the door — the Hopeless and the Possessed — and crosses over as
   the Owner. The redesign leans into that as an editorial "manifesto":
   restraint, a single serif statement per block, one calm accent per side
   (red = barred, gold = sovereign), and one quiet entrance motion. No
   sparkles, shimmer, gradient text or blinking icons — the words carry it.
   ───────────────────────────────────────────────────────────────────────── */

/* ═══════════════ MARKS ═══════════════ */

const BarredMark = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
    <line x1="6.5" y1="12" x2="17.5" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CrownMark = ({ color }: { color: string }) => (
  <svg
    className="pj-crown"
    width="34"
    height="34"
    viewBox="0 0 48 40"
    fill="none"
    aria-hidden
  >
    <path
      d="M5 33 8.5 13l9 8.5L24 5l6.5 16.5 9-8.5L43 33H5Z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <line x1="5" y1="35.5" x2="43" y2="35.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const ArrowIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h13M12 6l6 6-6 6" />
  </svg>
);

/* ═══════════════ ENTRANCE + CROWN MOTION (reduced-motion safe) ═══════════════ */

const CSS = `
  .pj-rise{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s cubic-bezier(.22,.61,.36,1)}
  .pj-rise.on{opacity:1;transform:none}
  .pj-crown{animation:pjFloat 6s ease-in-out infinite}
  @keyframes pjFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
  @media (prefers-reduced-motion: reduce){
    .pj-rise{opacity:1;transform:none;transition:none}
    .pj-crown{animation:none}
  }
`;

/* ═══════════════ MAIN ═══════════════ */

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 120),
      setTimeout(() => setStep(2), 340),
      setTimeout(() => setStep(3), 560),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  /* ── Palette tokens (red = barred · gold = sovereign · warm neutrals) ── */
  const RED = '#C8180A';
  const GOLD = isDark ? '#F5A800' : '#B87400';
  const pageBg = isDark ? '#0A0807' : '#FBF7F1';
  const ink = isDark ? '#F5EFEA' : '#1A1614';
  const inkSoft = isDark ? 'rgba(245,239,234,0.62)' : 'rgba(26,22,20,0.60)';
  const hairline = isDark ? 'rgba(245,239,234,0.12)' : 'rgba(26,22,20,0.12)';

  const barredCard: React.CSSProperties = {
    position: 'relative',
    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(200,24,10,0.03)',
    border: `1px solid ${isDark ? 'rgba(200,24,10,0.22)' : 'rgba(200,24,10,0.16)'}`,
    borderRadius: 18,
    padding: '22px 20px 22px 24px',
    overflow: 'hidden',
  };

  const ownerCard: React.CSSProperties = {
    position: 'relative',
    background: isDark ? 'rgba(245,168,0,0.05)' : '#FFFFFF',
    border: `1px solid ${isDark ? 'rgba(245,168,0,0.30)' : 'rgba(184,116,0,0.28)'}`,
    borderRadius: 20,
    padding: '30px 24px 26px',
    overflow: 'hidden',
    boxShadow: isDark
      ? '0 10px 40px rgba(0,0,0,0.45)'
      : '0 12px 40px rgba(184,116,0,0.10)',
  };

  const accentRule = (color: string): React.CSSProperties => ({
    position: 'absolute',
    top: 18,
    bottom: 18,
    left: 0,
    width: 3,
    borderRadius: 3,
    background: color,
  });

  const eyebrow: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Inter', 'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  };

  const mindsetLabel: React.CSSProperties = {
    fontFamily: "'Inter', 'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: isDark ? 'rgba(252,165,165,0.85)' : '#B23A2E',
    margin: 0,
  };

  const mindsetQuote: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 19,
    fontWeight: 500,
    fontStyle: 'italic',
    lineHeight: 1.35,
    color: inkSoft,
    margin: '3px 0 0',
  };

  const ownerBullet: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    fontFamily: "'Inter', 'DM Sans', sans-serif",
    fontSize: 16,
    lineHeight: 1.55,
    color: ink,
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Top bar */}
      <Box
        sx={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.25, py: 1.25,
          bgcolor: isDark ? 'rgba(10,8,7,0.86)' : 'rgba(251,247,241,0.86)',
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${hairline}`,
        }}
      >
        <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: 38 }} />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            size="small"
            onClick={toggleTheme}
            sx={{
              minWidth: 38, width: 38, height: 38, p: 0, borderRadius: '50%',
              bgcolor: 'transparent',
              color: isDark ? '#F5A800' : '#5A4A42',
              border: `1px solid ${hairline}`,
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(26,22,20,0.04)' },
            }}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          </Button>
          <LanguageSelector
            size="small"
            sx={{
              px: 1.75, py: 0.6, fontSize: '0.8rem', fontWeight: 700, borderRadius: 999,
              bgcolor: 'transparent',
              color: isDark ? '#F5EFEA' : '#1A1614',
              border: `1px solid ${hairline}`,
              textTransform: 'none',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(26,22,20,0.04)' },
            }}
          />
        </Box>
      </Box>

      {/* Page */}
      <Box
        sx={{
          minHeight: '100dvh',
          bgcolor: pageBg,
          color: ink,
          px: 2.25,
          pt: '82px',
          pb: 6,
        }}
      >
        <Box sx={{ maxWidth: 460, mx: 'auto' }}>

          {/* Framing line */}
          <Box className={`pj-rise ${step >= 1 ? 'on' : ''}`} sx={{ mb: 3 }}>
            <span style={{ ...eyebrow, color: GOLD }}>
              {t('pages.landing.homePage.association')}
            </span>
            <Box
              sx={{
                mt: 1.25,
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: { xs: 26, sm: 28 },
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: ink,
              }}
            >
              Three citizens stand at the door.
              <br />
              <Box component="span" sx={{ color: GOLD }}>Only one may enter.</Box>
            </Box>
          </Box>

          {/* ═══ BARRED: the two mindsets left at the door ═══ */}
          <Box className={`pj-rise ${step >= 1 ? 'on' : ''}`} style={{ transitionDelay: '0.05s' }} sx={{ mb: 2.25 }}>
            <div style={barredCard}>
              <span style={accentRule(RED)} />

              <div style={{ ...eyebrow, color: RED, marginBottom: 16 }}>
                <BarredMark color={RED} />
                {t('pages.landing.homePage.noEntryBadge')}
              </div>

              <div style={{ marginBottom: 16 }}>
                <p style={mindsetLabel}>{t('pages.landing.homePage.hopelessLabel')}</p>
                <p style={mindsetQuote}>“{t('pages.landing.homePage.hopelessQuote')}”</p>
              </div>

              <div style={{ height: 1, background: hairline, margin: '0 0 16px' }} />

              <div>
                <p style={mindsetLabel}>{t('pages.landing.homePage.dreamerLabel')}</p>
                <p style={mindsetQuote}>“{t('pages.landing.homePage.dreamerQuote')}”</p>
              </div>
            </div>
          </Box>

          {/* Threshold divider */}
          <Box
            className={`pj-rise ${step >= 2 ? 'on' : ''}`}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2.25 }}
          >
            <Box sx={{ flex: 1, height: '1px', background: hairline }} />
            <Box
              sx={{
                fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: '0.24em', textTransform: 'uppercase', color: inkSoft,
              }}
            >
              cross over
            </Box>
            <Box sx={{ flex: 1, height: '1px', background: hairline }} />
          </Box>

          {/* ═══ THE OWNER ═══ */}
          <Box className={`pj-rise ${step >= 2 ? 'on' : ''}`} style={{ transitionDelay: '0.05s' }}>
            <div style={ownerCard}>
              <span style={accentRule(GOLD)} />

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <CrownMark color={GOLD} />
                <div style={{ ...eyebrow, color: GOLD, marginTop: 12 }}>
                  {t('pages.landing.homePage.welcomeLabel')}
                </div>
                <Box
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 800,
                    fontSize: { xs: 34, sm: 38 },
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    color: ink,
                    mt: 0.75,
                    mb: 2,
                  }}
                >
                  {t('pages.landing.homePage.ownerLabel')}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 2 }}>
                <div style={ownerBullet}>
                  <Box component="span" sx={{ color: GOLD, mt: '2px', flexShrink: 0 }}>
                    <ArrowIcon color={GOLD} />
                  </Box>
                  <span>{t('pages.landing.homePage.ownerQuote1')}</span>
                </div>
                <div style={ownerBullet}>
                  <Box component="span" sx={{ color: GOLD, mt: '2px', flexShrink: 0 }}>
                    <ArrowIcon color={GOLD} />
                  </Box>
                  <span>{t('pages.landing.homePage.ownerQuote2')}</span>
                </div>
              </Box>

              {/* Declaration */}
              <Box
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: { xs: 20, sm: 22 },
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: ink,
                  mb: 1,
                }}
              >
                {t('pages.landing.homePage.leaderDeclaration')}
                <Box
                  component="span"
                  sx={{
                    color: GOLD,
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    borderBottom: `2px solid ${GOLD}`,
                    pb: '1px',
                  }}
                >
                  {t('pages.landing.homePage.leader')}
                </Box>
              </Box>

              <Box
                sx={{
                  fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600,
                  letterSpacing: '0.04em', color: inkSoft, mb: 3,
                }}
              >
                {t('pages.landing.homePage.awakeLabel')}
              </Box>

              <button
                onClick={() => navigate('/oath')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  background: RED,
                  border: 'none',
                  borderRadius: 12,
                  padding: '15px 18px',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  color: '#fff',
                  fontFamily: "'Inter', 'DM Sans', sans-serif",
                  transition: 'background-color .18s ease, box-shadow .18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#A5130A';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,24,10,0.30)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = RED;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span>{t('pages.landing.homePage.proceed')}</span>
                <Box component="span" sx={{ color: GOLD, display: 'inline-flex' }}>
                  <ArrowIcon color={GOLD} />
                </Box>
              </button>
            </div>
          </Box>

          {/* Tagline footnote */}
          <Box
            className={`pj-rise ${step >= 3 ? 'on' : ''}`}
            sx={{
              mt: 3.5,
              textAlign: 'center',
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 13.5,
              lineHeight: 1.6,
              color: inkSoft,
              whiteSpace: 'pre-line',
            }}
          >
            {t('pages.landing.homePage.tagline')}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
