import React from 'react';
import { Box, Button, Stack, Typography, useTheme, keyframes, Container, Paper, Checkbox, FormControlLabel } from '@mui/material';
import { DarkModeRounded, LightModeRounded, CloudRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import RainEffect from '../components/RainEffect';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppFooter from '../components/AppFooter';
import useThemeStore from '../store/useThemeStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import LanguageSelector from '../components/LanguageSelector';
import { BRAND } from '../theme';

const amountPulse = keyframes`
  0%, 100% {
    text-shadow: 0 0 10px rgba(255,180,0,0.7), 0 0 20px rgba(255,140,0,0.5), 0 0 40px rgba(255,100,0,0.3);
    background-position: 0% 50%;
  }
  50% {
    text-shadow: 0 0 20px rgba(255,200,0,1), 0 0 40px rgba(255,160,0,0.8), 0 0 60px rgba(255,100,0,0.5), 0 0 80px rgba(255,60,0,0.3);
    background-position: 100% 50%;
  }
`;

const OathPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleTheme, rainEnabled, toggleRain } = useThemeStore();
  const isDark = mode === 'dark';
  const isKannada = i18n.language === 'kn';
  const strongText = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(17,24,39,0.92)';

  const [pledged, setPledged] = React.useState(false);

  const oathParagraphs = [
    t('pages.login.oath.para0'),
    t('pages.login.oath.para1'),
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: mode === 'grey'
          ? 'rgb(242, 241, 230)'
          : isDark
            ? 'radial-gradient(ellipse at 50% 0%, rgba(200,24,10,0.10) 0%, transparent 60%), #0D0F12'
            : 'radial-gradient(ellipse at 50% 0%, rgba(200, 24, 10, 0.06) 0%, transparent 60%), #FFFFFF',
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: 720,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 12, sm: 8 },
          px: 2,
          zIndex: 5,
        }}
      >
        <Paper
          elevation={0}
          component={motion.div as any}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          sx={{
            width: '100%',
            p: { xs: 3, sm: 5 },
            borderRadius: '20px',
            background: mode === 'grey'
              ? 'linear-gradient(135deg, #FAF8F5 0%, #F5EFEB 100%)'
              : isDark
                ? 'linear-gradient(135deg, rgba(20, 22, 25, 0.75) 0%, rgba(13, 15, 18, 0.85) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 248, 240, 0.9) 100%)',
            backdropFilter: 'blur(24px)',
            border: `1.5px solid ${isDark ? 'rgba(245, 168, 0, 0.22)' : 'rgba(200, 24, 10, 0.16)'}`,
            outline: `1px solid ${isDark ? 'rgba(245, 168, 0, 0.15)' : 'rgba(245, 168, 0, 0.25)'}`,
            outlineOffset: '-8px',
            boxShadow: isDark
              ? '0 24px 64px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              : '0 24px 64px rgba(200, 24, 10, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top color accent strip */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${BRAND.red} 0%, #F5A800 50%, ${BRAND.red} 100%)`
            }}
          />

          {/* Glow circle background */}
          <Box
            sx={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 168, 0, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <Stack spacing={4} sx={{ alignItems: "center", width: '100%' }}>
            {/* Header info */}
            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              {/* Small logo with pulse glow */}
              <Box
                sx={{
                  p: 1,
                  borderRadius: '16px',
                  background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0,0,0,0.015)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.03)'
                }}
              >
                <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: { xs: 52, sm: 64 }, objectFit: 'contain' }} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Bebas Neue", "Impact", sans-serif',
                    fontSize: { xs: '1.6rem', sm: '2rem' },
                    letterSpacing: '0.06em',
                    lineHeight: 1.2,
                    px: 2,
                    background: isDark
                      ? 'linear-gradient(135deg, #E02010 0%, #FFCB00 45%, #F5A800 100%)'
                      : 'linear-gradient(135deg, #E02010 0%, #c32d0c 45%, #ff9500 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {t('pages.login.oath.title')}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Sora", sans-serif',
                    fontSize: '0.73rem',
                    letterSpacing: '0.2em',
                    fontWeight: 800,
                    mt: 0.5,
                    color: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(17, 24, 39, 0.55)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('forms.aspirant.defaults.party')}
                </Typography>
              </Box>
            </Box>

            {/* Paragraph containers */}
            <Stack spacing={2} sx={{ width: '100%' }}>
              {oathParagraphs.map((text, idx) => (
                <Box
                  key={idx}
                  component={motion.div as any}
                  whileHover={{ y: -2, boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 8px 24px rgba(0,0,0,0.04)' }}
                  sx={{
                    display: 'flex',
                    gap: 2.5,
                    alignItems: 'flex-start',
                    p: '20px',
                    borderRadius: '8px',
                    background: mode === 'grey'
                      ? 'linear-gradient(135deg, #FFFDF9 0%, #FFF9F0 100%)'
                      : isDark
                        ? 'linear-gradient(135deg, rgba(245,168,0,0.06) 0%, rgba(245,168,0,0.03) 100%)'
                        : 'linear-gradient(135deg, #FFFDF9 0%, #FFF9F0 100%)',
                    borderLeft: `5px solid ${BRAND.yellow}`,
                    borderTop: `1px solid ${isDark ? 'rgba(245, 168, 0, 0.15)' : 'rgba(245, 168, 0, 0.25)'}`,
                    borderRight: `1px solid ${isDark ? 'rgba(245, 168, 0, 0.15)' : 'rgba(245, 168, 0, 0.25)'}`,
                    borderBottom: `1px solid ${isDark ? 'rgba(245, 168, 0, 0.15)' : 'rgba(245, 168, 0, 0.25)'}`,
                    transition: 'all 0.25s ease',
                  }}
                >
                  {idx === 0 ? (
                    <Box sx={{ color: BRAND.yellow, flexShrink: 0, mt: '2px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </Box>
                  ) : (
                    <Box sx={{ color: BRAND.yellow, flexShrink: 0, mt: '2px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </Box>
                  )}
                  <Typography
                    sx={{
                      fontSize: isKannada ? '0.94rem' : '0.88rem',
                      color: strongText,
                      lineHeight: 1.7,
                      fontFamily: isKannada ? '"Tiro Kannada", serif' : 'inherit',
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
                              <Box
                                component="span"
                                sx={{
                                  fontWeight: 900,
                                  fontSize: '1.15em',
                                  background: isDark
                                    ? 'linear-gradient(90deg, #FFD700, #FF8C00, #FFD700)'
                                    : 'linear-gradient(90deg, #E65100, #F57C00, #E65100)',
                                  backgroundSize: '200% auto',
                                  backgroundClip: 'text',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  animation: `${amountPulse} 2.5s ease-in-out infinite`,
                                  display: 'inline',
                                }}
                              >
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
                              <Box component="span" sx={{
                                fontSize: '1.45em',
                                fontFamily: '"Bebas Neue", sans-serif',
                                ...(isDark ? {
                                  color: '#FFD700',
                                  textShadow: '0 0 20px rgba(255,215,0,.35)',
                                } : {
                                  background: 'linear-gradient(135deg, #E02010 0%, #c32d0c 45%, #ff9500 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  backgroundClip: 'text',
                                }),
                                display: 'inline',
                              }}>
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

            {/* Clubbed Action Box containing the Pledge Checkbox and the Proceed Button */}
            <Box
              sx={{
                width: '100%',
                p: 2.5,
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pledged}
                    onChange={(e) => setPledged(e.target.checked)}
                    sx={{
                      color: isDark ? 'rgba(245, 168, 0, 0.6)' : 'rgba(200, 24, 10, 0.6)',
                      '&.Mui-checked': {
                        color: isDark ? '#F5A800' : BRAND.red,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: strongText,
                    lineHeight: 1.5,
                    userSelect: 'none',
                  }}>
                    {t('pages.login.oath.pledgeText', {
                      defaultValue: isKannada
                        ? 'ನಾನು ಒಬ್ಬ ನಾಗರಿಕನಾಗಿ ಮೇಲಿನ ನಾಗರಿಕ ಹಕ್ಕುಗಳ ಘೋಷಣೆಯನ್ನು ಓದಿದ್ದೇನೆ ಮತ್ತು ಪ್ರತ್ಯಕ್ಷ ಪ್ರಜಾಪ್ರಭುತ್ವ ಮಾದರಿಯನ್ನು ಬೆಂಬಲಿಸಲು ಒಪ್ಪುತ್ತೇನೆ ಎಂದು ಪ್ರತಿಜ್ಞೆ ಮಾಡುತ್ತೇವೆ.'
                        : 'I solemnly pledge as a Citizen that I have read the above citizen rights declaration and agree to support the direct democracy model.'
                    })}
                  </Typography>
                }
                sx={{
                  alignSelf: 'flex-start',
                  alignItems: 'flex-start',
                  m: 0,
                  '& .MuiFormControlLabel-label': { mt: '2px', pl: 1 }
                }}
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!pledged}
                onClick={() => navigate('/register', { state: { fromPledge: true } })}
                sx={{
                  py: 1.6,
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '8px',
                  color: '#fff',
                  backgroundColor: BRAND.red,
                  backgroundImage: 'none',
                  fontFamily: '"Sora", sans-serif',
                  boxShadow: pledged ? '0 4px 18px rgba(200,24,10,0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: BRAND.red2,
                    backgroundImage: 'none',
                    boxShadow: '0 8px 24px rgba(200,24,10,0.45)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {isKannada ? 'ಒಪ್ಪಿಗೆ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ' : 'Agree and Proceed'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
      <AppFooter />
      {mode === 'grey' && rainEnabled && <RainEffect />}
    </Box>
  );
};

export default OathPage;
