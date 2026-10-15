import { Card, CardContent, Typography, Box, Stack, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Share as ShareIcon } from '@mui/icons-material';
import React from 'react';
import leaderImg from '../../assets/images/leader.webp';
import alertImg from '../../assets/images/alert.webp';
import sopImg from '../../assets/images/sop.webp';
import employeesImg from '../../assets/images/employees.webp';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../../theme';
import { getCitizensCount } from '../../services/statsService';

const FF = "'Baloo 2', sans-serif";

const GuestDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const isKannada = (i18n.language || '').startsWith('kn');
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const textPrimary = theme.palette.text.primary;
  const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;
  const textHigh = isDark ? 'rgba(255,255,255,0.66)' : 'rgba(17,24,39,0.72)';
  const BORDER = isDark ? 'rgba(245,168,0,0.20)' : 'rgba(245,168,0,0.35)';

  const [totalCitizens, setTotalCitizens] = React.useState<number | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    getCitizensCount()
      .then((resp) => {
        if (cancelled) return;
        const total = resp?.data?.citizens;
        if (typeof total === 'number') setTotalCitizens(total);
      })
      .catch(() => { /* ignore — count stays hidden */ });
    return () => { cancelled = true; };
  }, []);

  const heroBg = isDark
    ? 'radial-gradient(130% 150% at 6% 0%, rgba(200,24,10,0.2) 0%, rgba(10,8,8,1) 55%), radial-gradient(120% 130% at 100% 0%, rgba(37,58,154,0.16) 0%, rgba(10,8,8,1) 55%)'
    : 'linear-gradient(135deg, rgba(200,24,10,0.07) 0%, rgba(245,168,0,0.07) 50%, rgba(37,58,154,0.05) 100%)';
  const gridOverlay = isDark
    ? 'linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)'
    : 'linear-gradient(rgba(17,24,39,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(17,24,39,.02) 1px,transparent 1px)';

  const handleShare = async () => {
    const shareData = {
      title: 'Prajaakeeya',
      text: isKannada
        ? 'ಹೊಣೆಗಾರಿಕೆಯುಳ್ಳ, ಹಣ-ಮುಕ್ತ ಮತ್ತು ಜಾಹೀರಾತು-ಮುಕ್ತ ಪ್ರಜಾಕೀಯ ವ್ಯವಸ್ಥೆಯನ್ನು ನಿರ್ಮಿಸೋಣ. ಅಧಿಕೃತ ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ಸ್ಥಾಪಿಸಿ:'
        : 'Let us build a responsible, money-free, and advertisement-free Prajaakeeya system together. Install the official app:',
      url: 'https://prajaakeeya.org',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      }
    } catch (err) {
      // User cancelled or clipboard failed — silently ignore
    }
  };

  const actions = [
    // Registered Citizens tile — temporarily disabled; count shown in hero strip instead
    // {
    //   title: t('userDashboard.actions.voters', { defaultValue: 'Registered Voters' }),
    //   icon: <img src={king1Img} alt="registered voters" width={30} height={30} />,
    //   path: '/guest/voters',
    // },
    {
      title: t('userDashboard.actions.candidates', { defaultValue: 'View Aspirants' }),
      icon: <img src={leaderImg} alt="view aspirants" width={30} height={30} />,
      path: '/guest/aspirants',
    },
    {
      title: t('userDashboard.actions.civicIssues', { defaultValue: 'Public Issues' }),
      icon: <img src={alertImg} alt="civic issues" width={30} height={30} />,
      path: '/guest/civic-issues',
    },
    {
      title: t('userDashboard.actions.howUPPWorks', { defaultValue: 'SOP' }),
      icon: <img src={sopImg} alt="sop" width={30} height={30} />,
      path: '/guest/sop',
    },
    {
      title: t('userDashboard.actions.registeredAspirants', { defaultValue: 'Registered Aspirants' }),
      icon: <img src={employeesImg} alt="registered aspirants" width={30} height={30} />,
      path: '/guest/registered-aspirants',
    },
  ];

  const actionTitleFontSize = isKannada ? { xs: '0.9rem', md: '1rem' } : { xs: '1rem', md: '1.125rem' };

  return (
    <Stack spacing={3} sx={{ fontFamily: FF, pb: { xs: 2, md: 4 } }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}>
        <Box sx={{
          borderRadius: '20px', overflow: 'hidden', background: heroBg,
          border: `1.5px solid ${isDark ? 'rgba(245,140,0,0.7)' : 'rgba(245,168,0,0.35)'}`,
          boxShadow: isDark
            ? '0 0 28px rgba(245,130,0,0.4), 0 0 60px rgba(200,80,0,0.2), 0 12px 40px rgba(0,0,0,0.6)'
            : '0 0 0 1px rgba(245,168,0,0.08), 0 8px 32px rgba(17,24,39,0.07)',
          position: 'relative',
        }}>
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: gridOverlay, backgroundSize: '44px 44px', pointerEvents: 'none' }} />
          <Box sx={{ display: 'flex', height: '4px' }}>
            {[BRAND.red, BRAND.blue, BRAND.brown].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
          </Box>
          <Box sx={{
            px: { xs: 2.2, sm: 3.2, md: 4 }, py: { xs: 2.4, md: 3.2 },
            display: 'flex', alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' },
            gap: 2, position: 'relative', zIndex: 1,
          }}>
            <Box>
              <Typography sx={{ fontFamily: FF, fontWeight: 800, fontSize: { xs: '1.55rem', md: '2rem' }, lineHeight: 1.08, color: textPrimary }}>
                {t('guestDashboard.title', { defaultValue: 'Guest Dashboard' })}
              </Typography>
              <Typography sx={{ fontFamily: FF, mt: 1, fontSize: '0.95rem', color: textHigh }}>
                {t('guestDashboard.subtitle', { defaultValue: 'Explore Prajaakeeya — Register to participate' })}
              </Typography>
            </Box>
            {totalCitizens != null && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.2,
                  px: 1,
                  py: 0.25,
                  borderRadius: 2,
                  background: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.7)',
                  border: `1px solid ${BORDER}`,
                  alignSelf: 'flex-start',
                }}
              >
                <Typography sx={{ fontFamily: FF, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: textHigh, lineHeight: 1 }}>
                  {t('userDashboard.totalVoters', { defaultValue: 'No. of Registered Citizens' })}
                </Typography>
                <Typography sx={{ fontFamily: FF, fontSize: { xs: '1.2rem', md: '1.4rem' }, fontWeight: 800, color: textPrimary, lineHeight: 1 }}>
                  {totalCitizens.toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </motion.div>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
        gap: 2, width: '100%', mx: 'auto', px: { xs: 1, sm: 0 },
      }}>
        {actions.map((action, index) => (
          <Box key={action.path} sx={{ display: 'flex', flexDirection: 'column' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34, delay: 0.12 + index * 0.05 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Card
                onClick={() => navigate(action.path)}
                sx={{
                  height: '100%', borderRadius: '18px', cursor: 'pointer',
                  background: isDark
                    ? `radial-gradient(ellipse at 60% 0%, rgba(200,80,0,0.12) 0%, rgba(10,6,4,0.98) 55%), radial-gradient(ellipse at 10% 90%, rgba(${index % 2 === 0 ? '200,80,0' : '37,58,154'},0.1) 0%, transparent 60%), #0a0604`
                    : 'linear-gradient(150deg, #fffdf7 0%, #fff8e8 100%)',
                  backgroundImage: isDark
                    ? 'radial-gradient(circle, rgba(255,180,60,0.13) 1px, transparent 1px), radial-gradient(circle, rgba(255,120,30,0.06) 1px, transparent 1px), radial-gradient(ellipse at 60% 0%, rgba(200,80,0,0.14) 0%, transparent 55%)'
                    : 'none',
                  backgroundSize: isDark ? '48px 48px, 22px 22px, 100% 100%' : 'auto',
                  backgroundPosition: isDark ? '0 0, 11px 11px, 0 0' : '0 0',
                  border: `1.5px solid ${isDark
                    ? (index % 2 === 0 ? 'rgba(245,140,0,0.65)' : 'rgba(80,110,240,0.55)')
                    : (index % 2 === 0 ? 'rgba(245,168,0,0.4)' : 'rgba(37,58,154,0.35)')}`,
                  boxShadow: isDark
                    ? (index % 2 === 0
                      ? '0 0 18px rgba(245,130,0,0.45), 0 0 42px rgba(200,80,0,0.2), inset 0 0 20px rgba(180,60,0,0.07)'
                      : '0 0 18px rgba(60,90,240,0.45), 0 0 42px rgba(37,58,154,0.22), inset 0 0 20px rgba(37,58,154,0.07)')
                    : '0 4px 20px rgba(245,168,0,0.07)',
                  overflow: 'hidden',
                  transition: 'transform 0.28s cubic-bezier(.17,.67,.4,1.3), box-shadow 0.3s ease, border-color 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.018)',
                    boxShadow: isDark
                      ? (index % 2 === 0
                        ? '0 0 30px rgba(245,140,0,0.65), 0 0 70px rgba(200,80,0,0.3), 0 24px 50px rgba(0,0,0,0.6)'
                        : '0 0 30px rgba(80,110,240,0.65), 0 0 70px rgba(37,58,154,0.35), 0 24px 50px rgba(0,0,0,0.6)')
                      : '0 0 24px rgba(245,168,0,0.2), 0 14px 32px rgba(17,24,39,0.1)',
                    borderColor: isDark
                      ? (index % 2 === 0 ? 'rgba(255,160,0,0.9)' : 'rgba(100,140,255,0.8)')
                      : (index % 2 === 0 ? 'rgba(245,168,0,0.7)' : 'rgba(37,58,154,0.6)'),
                  },
                }}>
                {isDark && <Box sx={{
                  height: '3px', background: index % 2 === 0
                    ? 'linear-gradient(90deg, rgba(255,160,0,0) 0%, rgba(255,160,0,0.9) 45%, rgba(255,160,0,0) 100%)'
                    : 'linear-gradient(90deg, rgba(100,140,255,0) 0%, rgba(100,140,255,0.85) 45%, rgba(100,140,255,0) 100%)'
                }} />}
                <CardContent sx={{ p: { xs: 2.2, md: 2.8 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.6, height: '100%' }}>
                  <Box sx={{
                    width: 72, height: 72, borderRadius: '20px',
                    background: isDark
                      ? 'linear-gradient(145deg, #1a0f04 0%, #100a02 100%)'
                      : 'radial-gradient(circle at 30% 30%, rgba(245,168,0,0.22), rgba(245,168,0,0.06))',
                    color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${isDark ? 'rgba(245,168,0,0.35)' : 'rgba(245,168,0,0.4)'}`,
                    boxShadow: isDark
                      ? '0 0 0 5px rgba(245,140,0,0.08), 0 0 18px rgba(245,130,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)'
                      : '0 0 0 5px rgba(245,168,0,0.1), 0 4px 14px rgba(245,168,0,0.18)',
                    '& svg': { fontSize: 30 },
                  }}>
                    {action.icon}
                  </Box>
                  <Typography sx={{ fontFamily: FF, fontWeight: 800, color: isDark ? '#fff' : textPrimary, fontSize: actionTitleFontSize, lineHeight: 1.2, textAlign: 'center', letterSpacing: '-0.01em', textShadow: isDark ? '0 0 18px rgba(255,255,255,0.25)' : 'none' }}>
                    {action.title}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        ))}
      </Box>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34, delay: 0.4 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<ShareIcon />}
          onClick={handleShare}
          sx={{
            py: 1.5,
            borderRadius: '18px',
            fontWeight: 800,
            fontSize: '1rem',
            fontFamily: FF,
            textTransform: 'none',
            background: isDark
              ? 'linear-gradient(135deg, rgba(245,168,0,0.9) 0%, rgba(200,24,10,0.9) 100%)'
              : 'linear-gradient(135deg, #F5A800 0%, #C8180A 100%)',
            color: '#fff',
            boxShadow: isDark
              ? '0 0 24px rgba(245,168,0,0.4), 0 8px 32px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(245,168,0,0.3)',
            transition: 'transform 0.28s cubic-bezier(.17,.67,.4,1.3), box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px) scale(1.01)',
              boxShadow: isDark
                ? '0 0 36px rgba(245,168,0,0.6), 0 12px 40px rgba(0,0,0,0.5)'
                : '0 12px 40px rgba(245,168,0,0.4)',
            },
          }}
        >
          {isKannada ? 'ಅಪ್ಲಿಕೇಶನ್ ಹಂಚಿಕೊಳ್ಳಿ' : 'Share Prajaakeeya App'}
        </Button>
      </motion.div>
    </Stack>
  );
};

export default GuestDashboardPage;
