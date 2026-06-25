import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Stack } from '@mui/material';
import { ArrowBack as ArrowBackIcon, AccountTree as AccountTreeIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SopFlowChart from '../components/aspirant/SopFlowChart';
import { BRAND } from '../theme';
import useAuthStore from '../store/useAuthStore';
import { fetchVotingWindow } from '../services/voteService';
const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;

const SopPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [votingAllowed, setVotingAllowed] = React.useState(false);
    const telegramLink = (user as any)?.telegramGroupLink || 'https://t.me/prajakeeya';
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
    const borderFaint = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.10)';
    const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;

    return (
        <Stack spacing={3} sx={{ pb: { xs: 3, md: 5 } }}>
            {/* ── Header ── */}
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

            {/* ── SOP Flow Chart (view-only — agreement section hidden) ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
            >
                <SopFlowChart
                    sopAgreed={sopAgreed}
                    setSopAgreed={setSopAgreed}
                    onAgree={handleAgreeAndReturn}
                    onCancel={fromAspirantRegistration
                        ? () => navigate('/user/aspirants/declaration', { replace: true })
                        : undefined}
                    hideAgreement
                />
            </motion.div>

            {/* ── Back to Registration (only when arriving from aspirant registration) ── */}
            {fromAspirantRegistration && (
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/user/aspirants/declaration', { replace: true })}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontFamily: FF_BODY,
                            py: 1.5,
                            fontSize: '0.95rem',
                            color: '#fff',
                            background: 'linear-gradient(135deg, #C8180A 0%, #F5A800 100%)',
                            boxShadow: '0 6px 24px rgba(200,24,10,0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #df210f 0%, #ffbe1a 100%)',
                                boxShadow: '0 8px 30px rgba(200,24,10,0.55)',
                            },
                        }}
                    >
                        {t('forms.aspirant.navigation.back', { defaultValue: 'Back to Declaration' })}
                    </Button>
                </Stack>
            )}

            {/* ── Action Buttons ── */}
            <Stack spacing={1.5} sx={{ mt: 2, display: fromAspirantRegistration ? 'none' : 'flex' }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                        navigate('/user/dashboard');
                    }}
                    sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontFamily: FF_BODY,
                        py: 1.5,
                        fontSize: '0.95rem',
                        color: '#fff',
                        background: 'linear-gradient(135deg, #C8180A 0%, #F5A800 100%)',
                        boxShadow: '0 6px 24px rgba(200,24,10,0.4)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #df210f 0%, #ffbe1a 100%)',
                            boxShadow: '0 8px 30px rgba(200,24,10,0.55)',
                        },
                    }}
                >
                    {t('userDashboard.actions.candidates', { defaultValue: 'Aspirants List' })}
                </Button>
                {!(user as any)?.aspirantId && !votingAllowed && (
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate('/user/aspirants/declaration')}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontFamily: FF_BODY,
                            py: 1.5,
                            fontSize: '0.95rem',
                            borderColor: '#F5A800',
                            color: '#F5A800',
                            '&:hover': {
                                borderColor: '#d99000',
                                bgcolor: 'rgba(245,168,0,0.08)',
                            },
                        }}
                    >
                        {t('userDashboard.actions.registerAspirant', { defaultValue: 'Register as Aspirant' })}
                    </Button>
                )}
            </Stack>
        </Stack>
    );
};

export default SopPage;
