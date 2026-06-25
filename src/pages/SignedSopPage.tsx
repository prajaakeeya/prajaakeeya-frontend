import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, useTheme, Card, CardContent, CircularProgress, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { BRAND } from '../theme';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAspirantById } from '../services/aspirantService';
import SopAgreementCard from '../components/aspirant/SopAgreementCard';

const SignedSopPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;
    const { user } = useAuthStore();
    const textPrimary = theme.palette.text.primary;
    const textHigh = isDark ? 'rgba(255,255,255,0.66)' : 'rgba(17,24,39,0.72)';
    const textFaint = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(17,24,39,0.42)';
    const BORDER = isDark ? 'rgba(245,168,0,0.20)' : 'rgba(245,168,0,0.35)';
    const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
    const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
    const FF = FF_BODY;

    // page uses layout header; no hero background here

    const [loading, setLoading] = useState(true);
    const [aspirant, setAspirant] = useState<any>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!id) return;
                setLoading(true);
                const resp = await getAspirantById(Number(id));
                if (!mounted) return;
                setAspirant(resp.data);
            } catch (e) {
                // ignore
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    return (
        <Box sx={{ bgcolor: isDark ? theme.palette.background.default : '#0b0b0b', color: '#fff', minHeight: '100vh' }}>
            <Stack spacing={3} sx={{ fontFamily: FF_BODY, pb: { xs: 2, md: 4 } }}>
                {/* Header removed — page uses the layout's header for consistency */}

                {/* ── Content Container (full width) ────────────────────────────── */}
                <Container maxWidth={false} disableGutters>
                    <Card sx={{ borderRadius: 2, border: `1px solid ${BORDER}`, width: '100%' }}>
                        <CardContent>
                            {aspirant && (
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 700, color: textPrimary }}>
                                        {aspirant.name || aspirant.fullName || `${aspirant.firstName || ''} ${aspirant.lastName || ''}`.trim()}
                                    </Typography>
                                    {aspirant.party && <Typography variant="body2" sx={{ color: textFaint }}>{aspirant.party}</Typography>}
                                </Box>
                            )}

                            {loading ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        minHeight: "240px"
                                    }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontFamily: FF_HEADING, fontWeight: 600, mb: 1.5, color: textPrimary }}>
                                        {t('userDashboard.aspirant.signedSOP') || 'Signed SOP'}
                                    </Typography>
                                    {(aspirant?.sopAgreed || aspirant?.sopUrl) ? (
                                        <SopAgreementCard
                                            sopAgreed
                                            name={aspirant?.name || aspirant?.fullName || `${aspirant?.firstName || ''} ${aspirant?.lastName || ''}`.trim()}
                                            sopAgreedAt={aspirant?.sopAgreedAt}
                                            isKannada={(i18n.language || '').startsWith('kn')}
                                        />
                                    ) : (
                                        <Typography variant="body2" sx={{ color: textFaint, fontFamily: FF_BODY }}>
                                            {t('userDashboard.aspirant.sopNotAgreed') || 'SOP not agreed yet.'}
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Container>
            </Stack>
        </Box>
    );
};

export default SignedSopPage;
