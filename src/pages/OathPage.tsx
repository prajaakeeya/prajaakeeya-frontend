import React from 'react';
import { Box, Button, Stack, Typography, useTheme, keyframes, Grid } from '@mui/material';
import { DarkModeRounded, LightModeRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import LanguageSelector from '../components/LanguageSelector';

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

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const OathPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isKannada = i18n.language === 'kn';
  const strongText = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(17,24,39,0.95)';

  const oathPoints = [
    t('pages.login.oath.point1'),
    t('pages.login.oath.point2'),
    t('pages.login.oath.point3'),
    t('pages.login.oath.point4'),
  ];
  
  const workerText = t('pages.login.oath.para1');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? '#0A0808' : '#F3F4F6',
        px: 2,
        pt: 9,
        pb: 4,
      }}
    >
      {/* Theme & Language toggle — top right */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 1.2,
        bgcolor: isDark ? 'rgba(10,8,8,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
      }}>
        <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: 40 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            onClick={toggleTheme}
            sx={{
              minWidth: 40, width: 40, height: 40, p: 0, borderRadius: 50,
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
              color: isDark ? '#F5A800' : '#111827',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(17,24,39,0.12)'}`,
              boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.35)' : '0 2px 10px rgba(17,24,39,0.15)',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.94)' },
            }}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          </Button>
          <LanguageSelector
            size="small"
            sx={{
              px: 2, py: 0.6, fontSize: '0.82rem', fontWeight: 700, borderRadius: 50,
              bgcolor: '#F5A800', color: '#0A0808', textTransform: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
              '&:hover': { bgcolor: '#d99000' },
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ maxWidth: 1200, margin: '0 auto', flexGrow: 1, alignItems: 'center' }}>
        
        {/* LEFT COLUMN: The Oath Points */}
        <Grid item xs={12} md={7} lg={7}>
          <Stack spacing={2.5}>
            {oathPoints.map((text, idx) => (
              <Box
                key={idx}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  p: { xs: 2, sm: 3 },
                  borderRadius: '16px',
                  background: isDark 
                    ? 'rgba(255,255,255,0.03)'
                    : '#1F2937',
                  border: isDark 
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid #374151',
                  boxShadow: isDark 
                    ? '0 8px 32px rgba(0,0,0,0.4)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  animation: `${slideUp} 0.5s ease backwards`,
                  animationDelay: `${idx * 0.1}s`,
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 100,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #4B5563',
                    boxShadow: isDark 
                      ? '0 12px 40px rgba(0,0,0,0.6)'
                      : '0 12px 24px rgba(0,0,0,0.08)',
                  }
                }}
              >
                {/* Large Watermark Number */}
                <Typography
                  sx={{
                    position: 'absolute',
                    left: { xs: -10, sm: -5 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: '"Bebas Neue", sans-serif',
                    fontSize: { xs: '6rem', sm: '8rem' },
                    lineHeight: 1,
                    color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.04)',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    fontWeight: 900
                  }}
                >
                  {idx + 1}
                </Typography>
                
                {/* Point Text */}
                <Typography
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    color: isDark ? 'rgba(255,255,255,0.95)' : '#F9FAFB',
                    lineHeight: 1.6,
                    fontFamily: isKannada ? '"Tiro Kannada", serif' : '"Mukta", sans-serif',
                    fontWeight: 600,
                    pl: { xs: 5, sm: 7 }, // padding to avoid the watermark slightly if needed
                  }}
                >
                  {text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: The Agreement Card */}
        <Grid item xs={12} md={5} lg={5}>
          <Box
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: '24px',
              background: isDark 
                ? 'rgba(255,255,255,0.02)' 
                : '#1F2937',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #374151',
              boxShadow: isDark 
                ? '0 24px 64px rgba(0,0,0,0.6)' 
                : '0 12px 32px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: `${slideUp} 0.7s ease backwards`,
              animationDelay: '0.4s',
            }}
          >
            <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ height: { xs: 64, sm: 80 }, objectFit: 'contain', mb: 2 }} />
            
            <Typography sx={{ 
              fontFamily: '"Bebas Neue", "Impact", sans-serif', 
              fontSize: { xs: '1.6rem', sm: '2rem' }, 
              letterSpacing: '0.08em', 
              lineHeight: 1.2, 
              mb: 0.5,
              textAlign: 'center',
              color: isDark ? '#FFFFFF' : '#F9FAFB'
            }}>
              {t('pages.login.oath.title')}
            </Typography>
            
            <Typography
              sx={{
                fontFamily: '"Bebas Neue", "Impact", sans-serif',
                fontSize: { xs: '1.2rem', sm: '1.4rem' },
                letterSpacing: '0.25em',
                color: isDark ? '#9CA3AF' : '#9CA3AF',
                textShadow: isDark ? '0 0 4px rgba(255,255,255,0.4)' : 'none',
                textTransform: 'uppercase',
                mb: 4,
                textAlign: 'center'
              }}
            >
              {t('forms.aspirant.defaults.party')}
            </Typography>

            <Box
              sx={{
                width: '100%',
                p: '16px',
                borderRadius: '12px',
                background: isDark ? 'rgba(255,255,255,0.04)' : '#374151',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #4B5563',
                mb: 4,
              }}
            >
              <Typography
                sx={{
                  fontSize: isKannada ? '1rem' : '1.05rem',
                  color: isDark ? 'rgba(255,255,255,0.95)' : '#F9FAFB',
                  lineHeight: 1.6,
                  fontFamily: isKannada ? '"Tiro Kannada", serif' : 'inherit',
                  fontWeight: 600,
                  textAlign: 'center'
                }}
              >
                {(() => {
                  const workerPhrase = 'I Want A WORKER ';
                  if (!workerText.includes(workerPhrase)) return workerText;
                  const parts = workerText.split(workerPhrase);
                  return (
                    <>
                      <Box component="span" sx={{
                        fontSize: '1.45em',
                        fontFamily: '"Bebas Neue", sans-serif',
                        ...(isDark ? {
                          color: '#FFD700',
                        } : {
                          color: '#FCD34D',
                        }),
                        display: 'inline',
                        letterSpacing: '1px',
                        lineHeight: 1.2
                      }}>
                        {workerPhrase}
                      </Box>
                      <br/>
                      {parts[1]}
                    </>
                  );
                })()}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate('/register', { state: { fromPledge: true } })}
              sx={{
                py: 1.6,
                fontWeight: 800,
                fontSize: '1.1rem',
                letterSpacing: '1px',
                borderRadius: '14px',
                color: '#fff',
                background: isDark ? 'linear-gradient(135deg, #C8180A 0%, #F5A800 100%)' : '#E02010',
                boxShadow: isDark ? '0 8px 28px rgba(200,24,10,0.35)' : 'none',
                textTransform: 'uppercase',
                '&:hover': {
                  background: isDark ? 'linear-gradient(135deg, #df210f 0%, #ffbe1a 100%)' : '#C8180A',
                  boxShadow: isDark ? '0 10px 34px rgba(200,24,10,0.5)' : '0 4px 12px rgba(224,32,16,0.2)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              {isKannada ? 'ಒಪ್ಪಿಗೆ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ' : 'Agree and Proceed'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OathPage;
