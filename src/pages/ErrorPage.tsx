import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        flexDirection: "column",
        gap: 2
      }}>
      <Typography variant="h3">404</Typography>
      <Typography sx={{
        color: "text.secondary"
      }}>{t('pages.error.title')}</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        {t('pages.error.back')}
      </Button>
    </Box>
  );
};

export default ErrorPage;
