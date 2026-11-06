import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import leaderImg from '../../assets/images/leader.webp';
import alertImg from '../../assets/images/alert.webp';
import sopImg from '../../assets/images/sop.webp';
import employeesImg from '../../assets/images/employees.webp';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCitizensCount } from '../../services/statsService';
import ActionTile from '../../components/ActionTile';

const GuestDashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      icon: <img src={leaderImg} alt="" />,
      path: '/guest/aspirants',
    },
    {
      title: t('userDashboard.actions.civicIssues', { defaultValue: 'Public Issues' }),
      icon: <img src={alertImg} alt="" />,
      path: '/guest/civic-issues',
    },
    {
      title: t('userDashboard.actions.howUPPWorks', { defaultValue: 'SOP' }),
      icon: <img src={sopImg} alt="" />,
      path: '/guest/sop',
    },
    {
      title: t('userDashboard.actions.registeredAspirants', { defaultValue: 'Registered Aspirants' }),
      icon: <img src={employeesImg} alt="" />,
      path: '/guest/registered-aspirants',
    },
  ];

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'flex-end' }}
      >
        <Box>
          <Typography variant="h3" component="h1">
            {t('guestDashboard.title', { defaultValue: 'Guest Dashboard' })}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 0.75 }}>
            {t('guestDashboard.subtitle', { defaultValue: 'Explore Prajaakeeya — Register to participate' })}
          </Typography>
        </Box>
        {totalCitizens != null && (
          <Paper variant="outlined" sx={{ px: 2.5, py: 1.5, borderRadius: 3, minWidth: 200 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }}>
              {t('userDashboard.totalVoters', { defaultValue: 'No. of Registered Citizens' })}
            </Typography>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
              {totalCitizens.toLocaleString()}
            </Typography>
          </Paper>
        )}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
        {actions.map((action) => (
          <ActionTile key={action.path} title={action.title} icon={action.icon} onClick={() => navigate(action.path)} />
        ))}
      </Box>
    </Stack>
  );
};

export default GuestDashboardPage;
