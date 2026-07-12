import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Stack, Chip, useTheme } from '@mui/material';
import { ArrowBack as ArrowBackIcon, AccountTree as AccountTreeIcon } from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SopFlowChart from '../components/aspirant/SopFlowChart';
import { BRAND } from '../theme';
import useAuthStore from '../store/useAuthStore';
import { fetchVotingWindow } from '../services/voteService';

const SopPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [votingAllowed, setVotingAllowed] = React.useState(false);
    const fromAspirantRegistration =
        (location.state as { from?: string } | null)?.from === 'aspirant-registration';
    const SOP_AGREED_KEY = `aspirant_sop_agreed_${user?.id ?? 'guest'}`;
    const [sopAgreed, setSopAgreed] = React.useState(() => {
        if (!fromAspirantRegistration) return false;
        try { return localStorage.getItem(SOP_AGREED_KEY) === 'true'; } catch { return false; }
    });

    const handleAgreeAndReturn = () => {
        try { localStorage.setItem(SOP_AGREED_KEY, 'true'); } catch { /* ignore */ }
        navigate('/user/aspirants/declaration', { replace: true });
    };

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    React.useEffect(() => {
        let mounted = true;
        fetchVotingWindow()
            .then((resp) => {
                const data = resp?.data as any;
                if (!mounted) return;
                setVotingAllowed(Boolean(data?.isVotingAllowed));
            })
            .catch(() => {
                if (!mounted) return;
                setVotingAllowed(false);
            });
        return () => { mounted = false; };
    }, []);

    const textPrimary = theme.palette.text.primary;
    const textSecondary = theme.palette.text.secondary;
    const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;

    return (
        <Stack spacing={3} sx={{ pb: { xs: 3, md: 5 } }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.33 }}>
                <Box
                    sx={{
                        borderRadius: 4,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                        boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.24)' : '0 10px 26px rgba(15,23,42,0.06)',
                        p: { xs: 2.4, md: 3 },
                    }}
                >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 50, height: 50, borderRadius: 3, bgcolor: 'rgba(245,168,0,0.14)', color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.palette.divider}` }}>
                                <AccountTreeIcon sx={{ fontSize: 26 }} />
                            </Box>
                            <Box>
                                <Chip label={t('pages.landing.sopOverline', { defaultValue: 'How Prajaakeeya works' })} color="warning" variant="outlined" sx={{ mb: 1, borderRadius: 999 }} />
                                <Typography variant="h4" sx={{ fontWeight: 800, color: textPrimary, lineHeight: 1.1 }}>
                                    {t('pages.landing.sopFlow.coreRule', { defaultValue: 'Understand the civic process and follow it clearly.' })}
                                </Typography>
                                <Typography variant="body2" sx={{ color: textSecondary, mt: 0.35 }}>
                                    {t('pages.landing.sopFlow.coreRule', { defaultValue: 'Follow each step, stay informed, and participate through verified public channels.' })}
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Box>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.06 }}>
                <Box sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff', p: { xs: 1.5, md: 2.2 }, boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.2)' : '0 8px 22px rgba(15,23,42,0.05)' }}>
                    <SopFlowChart
                        sopAgreed={sopAgreed}
                        setSopAgreed={setSopAgreed}
                        onAgree={handleAgreeAndReturn}
                        onCancel={fromAspirantRegistration
                            ? () => navigate('/user/aspirants/declaration', { replace: true })
                            : undefined}
                        hideAgreement
                    />
                </Box>
            </motion.div>

            {fromAspirantRegistration && (
                <Stack spacing={1.5}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/user/aspirants/declaration', { replace: true })}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 1.4 }}
                    >
                        {t('forms.aspirant.navigation.back', { defaultValue: 'Back to Declaration' })}
                    </Button>
                </Stack>
            )}

            <Stack spacing={1.5} sx={{ display: fromAspirantRegistration ? 'none' : 'flex' }}>
                <Button fullWidth variant="contained" onClick={() => navigate('/user/dashboard')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 1.4 }}>
                    {t('userDashboard.actions.candidates', { defaultValue: 'Aspirants List' })}
                </Button>
                {!(user as any)?.aspirantId && !votingAllowed && (
                    <Button fullWidth variant="outlined" onClick={() => navigate('/user/aspirants/declaration')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 1.4 }}>
                        {t('userDashboard.actions.registerAspirant', { defaultValue: 'Register as Aspirant' })}
                    </Button>
                )}
            </Stack>
        </Stack>
    );
};

export default SopPage;
