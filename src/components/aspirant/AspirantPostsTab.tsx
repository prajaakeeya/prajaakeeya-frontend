import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Grid,
    Button,
    Typography,
    Box,
    Stack,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import {
    InsertDriveFile as InsertDriveFileIcon,
    Refresh as RefreshIcon,
    LocationOn as LocationOnIcon,
    AccessTime as AccessTimeIcon,
    Apartment as ApartmentIcon,
    ThumbUpOutlined as ThumbUpIcon,
    Link as LinkIcon
} from '@mui/icons-material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import apiClient from '../../services/apiClient';
import { useTranslation } from 'react-i18next';
import { safeUrl } from '../../utils/safeUrl';

interface AspirantPostsTabProps {
    posts: any[];
    postsLoading: boolean;
    fetchAspirantPosts: () => void;
    setDirectMeetOpen: (open: boolean) => void;
    aspirantId?: number;
}

const AspirantPostsTab: React.FC<AspirantPostsTabProps> = ({
    posts,
    postsLoading,
    fetchAspirantPosts,
    setDirectMeetOpen
    , aspirantId
}) => {
    const { t } = useTranslation();
    const [deleting, setDeleting] = useState<number | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    const handleDelete = async (postId?: number) => {
        if (!postId || !aspirantId) return;
        setDeleting(postId);
        try {
            await apiClient.delete(`/aspirants/${aspirantId}/visits/${postId}`);
            setSnack({ open: true, message: t('userDashboard.aspirant.postDeleted') || 'Post deleted', severity: 'success' });
            try { await fetchAspirantPosts(); } catch (e) { /* ignore */ }
        } catch (err) {
            console.error('Failed to delete post', err);
            const serverMsg = (err as any)?.response?.data?.message || (err as any)?.message;
            setSnack({ open: true, message: serverMsg || t('userDashboard.aspirant.postDeleteFailed') || 'Failed to delete post', severity: 'error' });
        } finally {
            setDeleting(null);
        }
    };

    return (
        <>
            <Grid container columnSpacing={{ xs: 0, md: 3 }} rowSpacing={{ xs: 1.5, md: 3 }}>
                <Grid size={12}>
                    <Card sx={{ borderRadius: { xs: 1, md: 3 }, boxShadow: '0 3px 14px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: { xs: 1.5, md: 3 } }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 1 }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
                                {/* <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {t('userDashboard.aspirant.postsTitle') || 'Posts'}
                            </Typography> */}
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<InsertDriveFileIcon />}
                                        onClick={() => setDirectMeetOpen(true)}
                                        sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        {t('userDashboard.aspirant.createDirectPost') || 'Create Direct meet post'}
                                    </Button>
                                    <IconButton size="small" onClick={() => fetchAspirantPosts()} aria-label={t('userDashboard.aspirant.refreshPostsAria') || 'Refresh posts'}>
                                        <RefreshIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                            {postsLoading ? (
                                <Typography variant="body2">{t('userDashboard.aspirant.loadingPosts') || 'Loading posts…'}</Typography>
                            ) : posts && posts.length > 0 ? (
                                <Stack spacing={1}>
                                    {posts.map((p: any) => (
                                        <Card key={p.id} variant="outlined" sx={{ position: 'relative', borderRadius: { xs: 1, md: 3 }, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                            <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                                    {/* Left: Icon */}
                                                    <Box
                                                        sx={{
                                                            width: { xs: 40, sm: 56 },
                                                            height: { xs: 40, sm: 56 },
                                                            borderRadius: '50%',
                                                            bgcolor: '#FFB84D',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <ApartmentIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 28 } }} />
                                                    </Box>
                                                    {/* Right: Date, Location, Map link, Attending, Delete */}
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Stack direction="row" spacing={0.5} sx={{
                                                            alignItems: "center"
                                                        }}>
                                                            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                                                            <Typography variant="caption" noWrap sx={{
                                                                color: "text.secondary"
                                                            }}>
                                                                {(() => {
                                                                    const startRaw = p.startTime ?? p.scheduledAt ?? null;
                                                                    const endRaw = p.endTime ?? null;
                                                                    const startTs = startRaw ? Number(startRaw) : NaN;
                                                                    if (isNaN(startTs)) return '';
                                                                    const startMs = startTs > 1e12 ? startTs : startTs * 1;
                                                                    const startDate = new Date(Number(startMs));
                                                                    let timePart = startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' \u2022 ' + startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                                    if (endRaw) {
                                                                        const endTs = Number(endRaw);
                                                                        const endMs = endTs > 1e12 ? endTs : endTs * 1;
                                                                        const endDate = new Date(Number(endMs));
                                                                        timePart += ' - ' + endDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                                    }
                                                                    return timePart;
                                                                })()}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack
                                                            direction="row"
                                                            spacing={0.5}
                                                            sx={{
                                                                alignItems: "center",
                                                                mt: 0.5
                                                            }}>
                                                            <LocationOnIcon sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} />
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.location || '—'}</Typography>
                                                        </Stack>
                                                        {p.googleMapsLink && (
                                                            <Stack
                                                                direction="row"
                                                                spacing={0.5}
                                                                sx={{
                                                                    alignItems: "center",
                                                                    mt: 0.5
                                                                }}>
                                                                <LinkIcon sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} />
                                                                <Typography
                                                                    component="a"
                                                                    variant="caption"
                                                                    onClick={() => { const u = safeUrl(p.googleMapsLink); if (u) window.open(u, '_blank', 'noopener'); }}
                                                                    sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
                                                                >
                                                                    View on Google Maps
                                                                </Typography>
                                                            </Stack>
                                                        )}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0 }}>
                                                            <Stack direction="row" spacing={0.5} sx={{
                                                                alignItems: "center"
                                                            }}>
                                                                <ThumbUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: "text.secondary",
                                                                        fontWeight: 600
                                                                    }}>
                                                                    {p.attendingCount ?? 0} {t('userDashboard.aspirant.attending') || 'Attending'}
                                                                </Typography>
                                                            </Stack>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                                                                aria-label={t('userDashboard.aspirant.deletePostAria') || 'Delete post'}
                                                                sx={{ color: 'error.main' }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" sx={{
                                    color: "text.secondary"
                                }}>
                                    {t('userDashboard.noPosts') || 'No posts yet.'}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AspirantPostsTab;
