import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LoadingPage = () => {
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
      <CircularProgress />
      <Typography>{t('pages.loading.title')}</Typography>
    </Box>
  );
};

export default LoadingPage;
