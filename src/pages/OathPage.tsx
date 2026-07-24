import React from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { DarkModeRounded, LightModeRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import LanguageSelector from '../components/LanguageSelector';

/* The oath is the second beat of the entry flow that starts on the landing
   page: having crossed the threshold as "the Owner", the citizen affirms what
   that ownership means. It shares the landing's editorial language — warm
   paper, red/gold accents, one serif statement, solid (never glowing)
   emphasis — so the two screens read as a single, deliberate journey. */

const CheckMark = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 6 9 17l-5-5" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h13M12 6l6 6-6 6" />
  </svg>
);

const OathPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isKannada = i18n.language === 'kn';

  /* Shared palette tokens (matched to HomePage) */
  const RED = '#C8180A';
  const GOLD = isDark ? '#F5A800' : '#B87400';
  const pageBg = isDark ? '#0A0807' : '#FBF7F1';
  const ink = isDark ? '#F5EFEA' : '#1A1614';
  const inkSoft = isDark ? 'rgba(245,239,234,0.62)' : 'rgba(26,22,20,0.60)';
  const hairline = isDark ? 'rgba(245,239,234,0.12)' : 'rgba(26,22,20,0.12)';

  const oathParagraphs = [
    t('pages.login.oath.para0'),
    t('pages.login.oath.para1'),
  ];

  const emphasis = {
    fontWeight: 800,
    color: GOLD,
    display: 'inline',
  } as const;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: pageBg,
        color: ink,
        px: 2.25,
        pt: '92px',
        pb: 5,
      }}
    >
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
              color: ink,
              border: `1px solid ${hairline}`,
              textTransform: 'none',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(26,22,20,0.04)' },
            }}
          />
        </Box>
      </Box>

      <Stack spacing={3} sx={{ maxWidth: 480, width: '100%' }}>
        {/* Masthead */}
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25 }}>
          <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: { xs: 56, sm: 64 }, objectFit: 'contain' }} />
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 800,
              fontSize: { xs: '1.9rem', sm: '2.1rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: ink,
            }}
          >
            {t('pages.login.oath.title')}
          </Typography>
          <Box
            sx={{
              fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD,
            }}
          >
            {t('forms.aspirant.defaults.party')}
          </Box>
        </Box>

        {/* Pledges */}
        <Stack spacing={1.5}>
          {oathParagraphs.map((text, idx) => (
            <Box
              key={idx}
              sx={{
                position: 'relative',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
                p: '18px 18px 18px 20px',
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(245,168,0,0.05)' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(245,168,0,0.24)' : 'rgba(184,116,0,0.22)'}`,
              }}
            >
              <Box sx={{ position: 'absolute', top: 16, bottom: 16, left: 0, width: 3, borderRadius: 3, bgcolor: GOLD }} />
              <Box component="span" sx={{ color: GOLD, flexShrink: 0, mt: '2px', display: 'inline-flex' }}>
                <CheckMark color={GOLD} />
              </Box>
              <Typography
                sx={{
                  fontSize: isKannada ? '0.98rem' : '0.95rem',
                  color: ink,
                  lineHeight: 1.7,
                  fontFamily: isKannada ? '"Tiro Kannada", serif' : "'Inter', sans-serif",
                  fontWeight: 500,
                }}
              >
                {idx === 0
                  ? (() => {
                      const amountRegex = /(₹[\d,]+)/;
                      const match = text.match(amountRegex);
                      if (!match) return text;
                      const amount = match[0];
                      const parts = text.split(amount);
                      return (
                        <>
                          {parts[0]}
                          <Box component="span" sx={{ ...emphasis, fontSize: '1.08em' }}>
                            {amount}
                          </Box>
                          {parts[1]}
                        </>
                      );
                    })()
                  : (() => {
                      const workerPhrase = 'I Want A WORKER ';
                      if (!text.includes(workerPhrase)) return text;
                      const parts = text.split(workerPhrase);
                      return (
                        <>
                          <Box
                            component="span"
                            sx={{
                              fontFamily: '"Playfair Display", serif',
                              fontSize: '1.15em',
                              fontWeight: 800,
                              color: GOLD,
                              display: 'inline',
                            }}
                          >
                            {workerPhrase}
                          </Box>
                          {parts[1]}
                        </>
                      );
                    })()}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Typography sx={{ fontSize: 12.5, color: inkSoft, textAlign: 'center', lineHeight: 1.6, px: 1 }}>
          {isKannada
            ? 'ಮೇಲಿನದನ್ನು ಒಪ್ಪಿ ಮುಂದುವರಿಯುವ ಮೂಲಕ, ನೀವು ಈ ಪ್ರಮಾಣವನ್ನು ಸ್ವೀಕರಿಸುತ್ತೀರಿ.'
            : 'By proceeding, you affirm this oath as your own.'}
        </Typography>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => navigate('/register', { state: { fromPledge: true } })}
          endIcon={<Box component="span" sx={{ color: GOLD, display: 'inline-flex' }}><ArrowIcon color={GOLD} /></Box>}
          sx={{
            py: 1.6,
            fontWeight: 700,
            fontSize: '1rem',
            borderRadius: '12px',
            color: '#fff',
            backgroundColor: RED,
            backgroundImage: 'none',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#A5130A',
              boxShadow: '0 6px 20px rgba(200,24,10,0.30)',
            },
          }}
        >
          {isKannada ? 'ಒಪ್ಪಿಗೆ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ' : 'Agree and Proceed'}
        </Button>
      </Stack>
    </Box>
  );
};

export default OathPage;
