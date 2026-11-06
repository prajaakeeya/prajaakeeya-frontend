import React from 'react';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { CheckCircleOutlineRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicTopBar from '../components/PublicTopBar';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';

const WORKER_PHRASE = 'I Want A WORKER ';

/** Bold the first ₹ amount or the "I Want A WORKER" phrase inside an oath line. */
const emphasise = (text: string): React.ReactNode => {
  const match = text.match(/₹[\d,]+/) ?? (text.includes(WORKER_PHRASE) ? [WORKER_PHRASE] : null);
  if (!match) return text;
  const [before, after] = text.split(match[0]);
  return (
    <>
      {before}
      <Box component="strong" sx={{ color: 'primary.main', fontWeight: 700 }}>{match[0]}</Box>
      {after}
    </>
  );
};

const OathPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const oathParagraphs = [t('pages.login.oath.para0'), t('pages.login.oath.para1')];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PublicTopBar />

      <Container maxWidth="sm" sx={{ pt: { xs: 12, sm: 14 }, pb: 8 }}>
        <Stack alignItems="center" spacing={1.5} sx={{ textAlign: 'center', mb: 4 }}>
          <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya" sx={{ width: 64, height: 64, borderRadius: 3 }} />
          <Typography variant="h3" component="h1">{t('pages.login.oath.title')}</Typography>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.2em' }}>
            {t('forms.aspirant.defaults.party')}
          </Typography>
        </Stack>

        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {oathParagraphs.map((text, idx) => (
            <Stack
              key={idx}
              direction="row"
              spacing={1.5}
              sx={{ p: { xs: 2.5, sm: 3 }, borderTop: idx ? 1 : 0, borderColor: 'divider' }}
            >
              <CheckCircleOutlineRounded sx={{ color: 'primary.main', fontSize: 20, mt: '3px' }} />
              <Typography sx={{ lineHeight: 1.7 }}>{emphasise(text)}</Typography>
            </Stack>
          ))}
        </Paper>

        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 3 }}
          onClick={() => navigate('/register', { state: { fromPledge: true } })}
        >
          {t('pages.login.oath.agreeAndProceed', { defaultValue: 'Agree and Proceed' })}
        </Button>
      </Container>
    </Box>
  );
};

export default OathPage;
