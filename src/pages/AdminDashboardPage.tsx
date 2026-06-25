import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import {
  People as PeopleIcon,
  HowToVote as HowToVoteIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import StatsCard from '../components/StatsCard';
import apiClient from '../services/apiClient';
import { isMockMode } from '../config/appMode';

interface DashboardResponse {
  totals: {
    wards: number;
    aspirants: number;
    votes: number;
    citizens: number;
  };
}

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState('');
  const dummyData: DashboardResponse = useMemo(
    () => ({
      totals: {
        wards: 28,
        aspirants: 45,
        votes: 87500,
        citizens: 125000
      }
    }),
    []
  );
  const [data, setData] = useState<DashboardResponse>(dummyData);

  useEffect(() => {
    if (isMockMode) return;
    setLoading(true);
    apiClient
      .get<DashboardResponse>('/admin/dashboard')
      .then((response) => {
        setData({
          totals: response.data.totals
        });
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err?.message || t('common.error') || 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('adminDashboard.title')}
        </Typography>
        <Typography variant="body1" sx={{
          color: "text.secondary"
        }}>
          {t('adminDashboard.subtitle') || 'Overview of your ward management system'}
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <StatsCard
            label={t('adminDashboard.cards.voters')}
            value={data.totals.citizens}
            icon={<PeopleIcon />}
            color="info"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <StatsCard
            label={t('adminDashboard.cards.aspirants')}
            value={data.totals.aspirants}
            icon={<HowToVoteIcon />}
            color="secondary"
          />
        </Grid>
      </Grid>
      {/* Extraction Progress removed from dashboard */}
    </Stack>
  );
};

export default AdminDashboardPage;
