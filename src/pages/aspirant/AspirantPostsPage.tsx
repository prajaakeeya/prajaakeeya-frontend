import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import { Box, Container, Typography, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { getAspirantById, getAspirantVisits, postAspirantVisit } from '../../services/aspirantService';
import AspirantPostsTab from '../../components/aspirant/AspirantPostsTab';

const AspirantPostsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [aspirantProfile, setAspirantProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Direct meet dialog state
    const [directMeetOpen, setDirectMeetOpen] = useState(false);
    const [dmLocation, setDmLocation] = useState('');
    const [dmGoogleMapsLink, setDmGoogleMapsLink] = useState('');
    const [dmDate, setDmDate] = useState('');
    const [dmTime, setDmTime] = useState('');
    const [dmEndTime, setDmEndTime] = useState('');
    const [dmPosting, setDmPosting] = useState(false);
    const [dmSavedOpen, setDmSavedOpen] = useState(false);

    // Today's date in local YYYY-MM-DD for date input min attr
    const todayDateMin = (() => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    })();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user?.id) {
                    navigate('/register');
                    return;
                }

                // Use aspirantId if available, otherwise fall back to user.id
                const aspirantId = user?.aspirantId ?? user?.id;
                const [profile, visits] = await Promise.all([
                    getAspirantById(aspirantId),
                    getAspirantVisits(aspirantId)
                ]);

                setAspirantProfile(profile.data);
                setPosts(visits?.data || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
                setPostsLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const fetchAspirantPosts = async () => {
        if (!user?.id) return;

        setPostsLoading(true);
        try {
            // Use aspirantId if available, otherwise fall back to user.id (same logic as initial load)
            const aspirantId = user?.aspirantId ?? user?.id;
            const visits = await getAspirantVisits(aspirantId);
            setPosts(visits?.data || []);
        } catch (err: any) {
            console.error('Failed to fetch posts:', err);
        } finally {
            setPostsLoading(false);
        }
    };

    const handlePostDirectMeet = async () => {
        if (!aspirantProfile?.id) return;

        setDmPosting(true);
        try {
            const payload: any = {
                location: dmLocation || undefined,
            };
            if (dmGoogleMapsLink && dmGoogleMapsLink.trim()) payload.googleMapsLink = dmGoogleMapsLink.trim();

            if (dmDate && dmTime) {
                const startDt = new Date(`${dmDate}T${dmTime}`);
                payload.startTime = startDt.getTime();
                if (dmEndTime) {
                    const endDt = new Date(`${dmDate}T${dmEndTime}`);
                    payload.endTime = endDt.getTime();
                } else {
                    // default to +1 hour
                    payload.endTime = startDt.getTime() + 60 * 60 * 1000;
                }
            }

            await postAspirantVisit(aspirantProfile.id, payload);

            // Reset form
            setDmLocation('');
            setDmDate('');
            setDmTime('');
            setDmEndTime('');
            setDmGoogleMapsLink('');
            setDirectMeetOpen(false);
            setDmSavedOpen(true);

            // Refresh posts
            await fetchAspirantPosts();
        } catch (err: any) {
            console.error('Failed to post direct meet:', err);
        } finally {
            setDmPosting(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, px: 0 }}>
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
            <Container maxWidth="lg" sx={{ py: 4, px: 0 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!aspirantProfile) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, px: 0 }}>
                <Alert severity="warning">
                    {t('userDashboard.aspirant.noProfile') || 'Aspirant profile not found'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4, px: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                {t('userDashboard.aspirant.tabs.posts') || 'Posts'}
            </Typography>
            <AspirantPostsTab
                posts={posts}
                postsLoading={postsLoading}
                fetchAspirantPosts={fetchAspirantPosts}
                setDirectMeetOpen={setDirectMeetOpen}
                aspirantId={aspirantProfile?.id}
            />
            {/* Direct Meet Dialog */}
            <Dialog open={directMeetOpen} onClose={() => setDirectMeetOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{t('userDashboard.aspirant.createDirectPost') || 'Create Direct Meet Post'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {/* Title and description removed per API — only location/time sent */}
                        <TextField
                            label={t('userDashboard.aspirant.dmLocation') || 'Location'}
                            fullWidth
                            value={dmLocation}
                            onChange={(e) => setDmLocation(e.target.value)}
                        />
                        <TextField
                            label={t('userDashboard.aspirant.dmGoogleMapsLink') || 'Google Maps Link'}
                            fullWidth
                            value={dmGoogleMapsLink}
                            onChange={(e) => setDmGoogleMapsLink(e.target.value)}
                            placeholder="https://maps.app.goo.gl/..."
                        />
                        <TextField
                            label={t('userDashboard.aspirant.dmDate') || 'Date'}
                            type="date"
                            fullWidth
                            value={dmDate}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val && val < todayDateMin) return;
                                setDmDate(val);
                            }}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { min: todayDateMin }
                            }}
                            sx={{
                                '& input': { color: isDark ? '#fff' : undefined },
                                '& input[type="date"]::-webkit-calendar-picker-indicator': { filter: isDark ? 'invert(1) contrast(1.6)' : 'none' },
                                '& input[type="date"]::-webkit-clear-button, & input[type="date"]::-webkit-inner-spin-button': { WebkitAppearance: 'none' }
                            }} />
                        <TextField
                            label={t('userDashboard.aspirant.dmTime') || 'Time'}
                            type="time"
                            fullWidth
                            value={dmTime}
                            onChange={(e) => setDmTime(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{
                                '& input': { color: isDark ? '#fff' : undefined },
                                '& input[type="time"]::-webkit-calendar-picker-indicator': { filter: isDark ? 'invert(1) contrast(1.6)' : 'none' },
                                '& input[type="time"]::-webkit-clear-button, & input[type="time"]::-webkit-inner-spin-button': { WebkitAppearance: 'none' }
                            }}
                        />
                        <TextField
                            label={t('userDashboard.aspirant.dmEndTime') || 'End Time'}
                            type="time"
                            fullWidth
                            value={dmEndTime}
                            onChange={(e) => setDmEndTime(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{
                                '& input': { color: isDark ? '#fff' : undefined },
                                '& input[type="time"]::-webkit-calendar-picker-indicator': { filter: isDark ? 'invert(1) contrast(1.6)' : 'none' },
                                '& input[type="time"]::-webkit-clear-button, & input[type="time"]::-webkit-inner-spin-button': { WebkitAppearance: 'none' }
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDirectMeetOpen(false)} disabled={dmPosting}>
                        {t('common.cancel') || 'Cancel'}
                    </Button>
                    <Button variant="contained" onClick={handlePostDirectMeet} disabled={dmPosting}>
                        {dmPosting ? (t('userDashboard.aspirant.posting') || 'Posting...') : (t('userDashboard.aspirant.post') || 'Post')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Success Snackbar */}
            <Snackbar open={dmSavedOpen} autoHideDuration={3000} onClose={() => setDmSavedOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" onClose={() => setDmSavedOpen(false)}>
                    {t('userDashboard.aspirant.directPosted') || 'Direct meet posted'}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AspirantPostsPage;