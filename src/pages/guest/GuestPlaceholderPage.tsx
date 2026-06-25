import React from 'react';
import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import useThemeStore from '../../store/useThemeStore';
import { HomeRounded as HomeIcon } from '@mui/icons-material';

interface GuestPlaceholderPageProps {
  title: string;
}

const GuestPlaceholderPage: React.FC<GuestPlaceholderPageProps> = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  const isUser = location.pathname.startsWith('/user');
  const dashboardPath = isUser ? '/user/dashboard' : '/guest/dashboard';

  const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
  const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
  const FF = FF_BODY;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center', fontFamily: FF_BODY }}>
      <Box sx={{
        bgcolor: theme.palette.background.paper,
        border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'}`,
        borderRadius: '16px',
        p: { xs: 4, md: 8 },
        boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(17, 24, 39, 0.04)',
      }}>
        <Box sx={{
          display: 'inline-flex',
          p: 2,
          borderRadius: '50%',
          bgcolor: 'rgba(245, 168, 0, 0.1)',
          color: '#F5A800',
          mb: 4
        }}>
          <span style={{ fontSize: '32px' }}>⚙️</span>
        </Box>
        <Typography variant="h3" sx={{ fontFamily: FF_HEADING, fontWeight: 800, mb: 2, color: theme.palette.text.primary }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ fontFamily: FF_BODY, color: isDark ? '#A0A5B0' : '#4B5563', mb: 5, fontSize: '1.1rem' }}>
          Details will be updated soon.
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate(dashboardPath)}
          sx={{ fontFamily: FF_HEADING, fontWeight: 700, px: 4, py: 1.5 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default GuestPlaceholderPage;
