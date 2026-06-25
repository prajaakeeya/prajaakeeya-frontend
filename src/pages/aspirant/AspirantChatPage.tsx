import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Alert, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { getAspirantById } from '../../services/aspirantService';
import AspirantChatTab from '../../components/aspirant/AspirantChatTab';

const AspirantChatPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [aspirantProfile, setAspirantProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAspirantProfile = async () => {
            try {
                if (!user?.id) {
                    navigate('/register');
                    return;
                }

                // Use aspirantId if available, otherwise fall back to user.id
                const aspirantId = user?.aspirantId ?? user?.id;
                const profile = await getAspirantById(aspirantId);
                setAspirantProfile(profile.data);
            } catch (err: any) {
                setError(err.message || 'Failed to load aspirant profile');
            } finally {
                setLoading(false);
            }
        };

        fetchAspirantProfile();
    }, [user, navigate]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "400px"
                    }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!aspirantProfile) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">
                    {t('userDashboard.aspirant.noProfile') || 'Aspirant profile not found'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                {t('userDashboard.aspirant.tabs.chat') || 'Chat with Citizens'}
            </Typography>

            <AspirantChatTab
                aspirantProfile={aspirantProfile}
                user={user}
            />
        </Container>
    );
};

export default AspirantChatPage;