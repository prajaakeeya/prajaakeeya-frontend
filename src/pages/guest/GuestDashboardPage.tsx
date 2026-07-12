import { Card, CardContent, Typography, Box, Stack, useTheme, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import leaderImg from '../../assets/images/leader.webp';
import alertImg from '../../assets/images/alert.webp';
import sopImg from '../../assets/images/sop.webp';
import employeesImg from '../../assets/images/employees.webp';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../../theme';
import { getCitizensCount } from '../../services/statsService';

const GuestDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const isKannada = (i18n.language || '').startsWith('kn');
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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

  const actions = [
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

  const actionTitleFontSize = isKannada ? { xs: '0.9rem', md: '1rem' } : { xs: '0.95rem', md: '1.05rem' };

  return (
    <Stack spacing={3} sx={{ pb: { xs: 2, md: 4 } }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Box
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.3)' : '0 14px 40px rgba(15,23,42,0.07)',
            background: isDark
              ? 'linear-gradient(135deg, rgba(16,12,10,0.98) 0%, rgba(24,18,14,0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,250,243,1) 100%)',
          }}
        >
          <Box sx={{ height: 4, display: 'flex' }}>
            {[BRAND.red, BRAND.yellow, BRAND.blue].map((color) => (
              <Box key={color} sx={{ flex: 1, bgcolor: color }} />
            ))}
          </Box>
          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.5} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box sx={{ maxWidth: 620 }}>
                <Chip label={t('guestDashboard.title', { defaultValue: 'Guest Dashboard' })} color="warning" variant="outlined" sx={{ mb: 1.25, borderRadius: 999, fontWeight: 700 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.12, mb: 1 }}>
                  {t('guestDashboard.subtitle', { defaultValue: 'Explore public civic services with confidence.' })}
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                  {t('userDashboard.actions.civicIssues', { defaultValue: 'Review public information, follow the SOP, and browse civic listings.' })}
                </Typography>
              </Box>
              {totalCitizens != null && (
                <Box
                  sx={{
                    minWidth: { xs: '100%', md: 260 },
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
                    p: 2,
                  }}
                >
                  <Typography variant="overline" sx={{ color: theme.palette.text.secondary, letterSpacing: '0.12em' }}>
                    {t('userDashboard.totalVoters', { defaultValue: 'Registered Citizens' })}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {totalCitizens.toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      </motion.div>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
        {actions.map((action, index) => (
          <motion.div key={action.path} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.06 + index * 0.04 }}>
            <Card
              onClick={() => navigate(action.path)}
              sx={{
                height: '100%',
                cursor: 'pointer',
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                boxShadow: isDark ? '0 12px 28px rgba(0,0,0,0.2)' : '0 10px 24px rgba(15,23,42,0.06)',
                transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: isDark ? '0 18px 40px rgba(0,0,0,0.26)' : '0 16px 36px rgba(15,23,42,0.1)',
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: { xs: 2.25, md: 2.6 } }}>
                <Box
                  sx={{
                    width: 62,
                    height: 62,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(245,168,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: BRAND.yellow,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: actionTitleFontSize, lineHeight: 1.25 }}>
                  {action.title}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Stack>
  );
};

export default GuestDashboardPage;
