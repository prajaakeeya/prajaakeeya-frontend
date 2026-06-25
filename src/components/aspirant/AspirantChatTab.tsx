import React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Button,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface AspirantChatTabProps {
    aspirantProfile: any;
    user: any;
}

const AspirantChatTab: React.FC<AspirantChatTabProps> = ({
    aspirantProfile,
    user
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Grid container columnSpacing={{ xs: 0, md: 3 }} rowSpacing={{ xs: 2, md: 3 }}>
            <Grid
                size={{
                    xs: 12,
                    md: 8
                }}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 3px 14px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            {t('userDashboard.aspirant.chatTitle') || 'Chat with Citizens'}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                mb: 3
                            }}>
                            {t('userDashboard.aspirant.chatSubtitle') || 'Have a direct text conversation with citizens from your ward to listen, respond, and engage transparently.'}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => {
                                const aspirantId = (aspirantProfile as any).id || user?.id;
                                if (aspirantId) {
                                    const candidateName = (aspirantProfile as any).name || user?.name || `Aspirant ${aspirantId}`;
                                    const candidate = { ...(aspirantProfile as any), name: candidateName };
                                    navigate(`/user/chat/${aspirantId}`, { state: { candidate } });
                                } else {
                                    navigate('/user/chat');
                                }
                            }}
                            sx={{ bgcolor: 'primary.main' }}
                        >
                            {t('userDashboard.aspirant.joinInterview') || 'Join Interview'}
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default AspirantChatTab;
