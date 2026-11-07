import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Stack } from '@mui/material';
import { ArrowBack as ArrowBackIcon, AccountTree as AccountTreeIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';
import SopFlowChart from '../components/aspirant/SopFlowChart';
import useAuthStore from '../store/useAuthStore';
import { fetchVotingWindow } from '../services/voteService';
const FF = 'inherit';

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
    const borderFaint = theme.palette.divider;
    const GOLD = theme.palette.primary.main;

    return (
        <Stack spacing={3} sx={{ pb: { xs: 3, md: 5 } }}>
            <PageHeader
                title={t('pages.landing.sopOverline') || 'How Prajakeeya Works'}
                subtitle={t('pages.landing.sopFlow.coreRule') ||
                    'Understand the governance process and how citizens can raise and track civic issues.'}
            />

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
                            fontWeight: 700,
                            py: 1.5,
                            fontSize: '0.95rem',
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
                        fontWeight: 700,
                        py: 1.5,
                        fontSize: '0.95rem',
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
                            fontWeight: 700,
                            py: 1.5,
                            fontSize: '0.95rem',
                            '&:hover': {
                                bgcolor: 'rgba(120,113,108,0.08)',
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
