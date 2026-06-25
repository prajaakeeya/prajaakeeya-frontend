import { useState, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { AccountTree as AccountTreeIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SopFlowChart from '../../components/aspirant/SopFlowChart';
import { BRAND } from '../../theme';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;

const GuestSopPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sopAgreed, setSopAgreed] = useState(false);

  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Stack spacing={3} sx={{ pb: { xs: 3, md: 5 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1.4, sm: 2 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2,
                bgcolor: 'rgba(245,168,0,0.12)',
                color: GOLD,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(245,168,0,0.3)',
                flexShrink: 0,
              }}
            >
              <AccountTreeIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPrimary, lineHeight: 1.1 }}
              >
                {t('pages.landing.sopOverline') || 'How Prajakeeya Works'}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: FF_BODY, color: textSecondary, mt: 0.3 }}>
                {t('pages.landing.sopFlow.coreRule') ||
                  'Understand the governance process and how citizens can raise and track civic issues.'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* SOP Flow Chart (view-only) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <SopFlowChart
          sopAgreed={sopAgreed}
          setSopAgreed={setSopAgreed}
          onAgree={() => undefined}
          hideAgreement
        />
      </motion.div>
    </Stack>
  );
};

export default GuestSopPage;
