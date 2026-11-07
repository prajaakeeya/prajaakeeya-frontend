import { Box, Button, Stack, Typography } from '@mui/material';
import { ArrowBackRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';

const ErrorPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', px: 2 }}>
      <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center', maxWidth: 420 }}>
        <Box component="img" src={prajakeeyaLogo} alt="" sx={{ width: 56, height: 56, borderRadius: 3, mb: 1 }} />
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.16em' }}>404</Typography>
        <Typography variant="h3" component="h1">
          {t('pages.landing.error.title', { defaultValue: 'Page not found' })}
        </Typography>
        <Button variant="contained" startIcon={<ArrowBackRounded />} onClick={() => navigate('/')} sx={{ mt: 1 }}>
          {t('pages.landing.error.back', { defaultValue: 'Go Home' })}
        </Button>
      </Stack>
    </Box>
  );
};

export default ErrorPage;
