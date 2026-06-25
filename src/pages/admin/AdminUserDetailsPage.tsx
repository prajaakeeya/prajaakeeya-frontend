import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Stack,
    Typography,
    Button,
    CircularProgress,
    Divider,
    Chip,
    Grid,
    Avatar,
    Paper,
} from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAspirantById, approveAspirant } from '../../services/aspirantService';

const AdminUserDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [aspirant, setAspirant] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getAspirantById(Number(id))
            .then((resp) => {
                const data = resp?.data ?? resp;
                setAspirant(data);
            })
            .catch((e) => console.error('Failed to load aspirant', e))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;
    if (!aspirant) return <Typography color="error">Aspirant not found</Typography>;

    return (
        <Box>
            <Card sx={{ overflow: 'visible', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                    {/* Header */}
                    <Grid container spacing={2} sx={{
                        alignItems: "center"
                    }}>
                        <Grid>
                            <Avatar
                                src={aspirant.selfieUrl || undefined}
                                alt={aspirant.name}
                                sx={{ width: 64, height: 64, bgcolor: 'primary.light', color: 'primary.contrastText', fontSize: 28 }}
                            >
                                {String(aspirant.name || 'A').trim().charAt(0).toUpperCase()}
                            </Avatar>
                        </Grid>
                        <Grid size="grow">
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>{aspirant.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                <Chip label={aspirant.party || 'Independent'} color="primary" size="small" sx={{ fontWeight: 700 }} />
                                {aspirant.electionName && <Chip label={aspirant.electionName} size="small" variant="outlined" />}
                                {aspirant.constituencyName && <Chip label={aspirant.constituencyName} size="small" variant="outlined" />}
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Contact & Info */}
                    <Grid container spacing={2}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Contact Information</Typography>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PhoneAndroidIcon color="action" />
                                        <Box>
                                            <Typography variant="caption" sx={{
                                                color: "text.secondary"
                                            }}>Phone Number</Typography>
                                            <Typography><strong>{aspirant.phone ?? '—'}</strong></Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Profile Details</Typography>
                                <Stack spacing={0.5}>
                                    {aspirant.age && <Typography>Age: <strong>{aspirant.age}</strong></Typography>}
                                    {aspirant.gender && <Typography>Gender: <strong>{aspirant.gender}</strong></Typography>}
                                    {aspirant.education && <Typography>Education: <strong>{aspirant.education}</strong></Typography>}
                                    {aspirant.occupation && <Typography>Occupation: <strong>{aspirant.occupation}</strong></Typography>}
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Approve Button */}
                    {aspirant.status !== 'approved' && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="success"
                                size="large"
                                fullWidth
                                onClick={async () => {
                                    try {
                                        await approveAspirant(aspirant.id);
                                        const refreshed = await getAspirantById(aspirant.id);
                                        setAspirant((refreshed?.data) ?? refreshed);
                                    } catch (e) {
                                        console.error('Failed to approve aspirant', e);
                                    }
                                }}
                            >
                                Approve Aspirant
                            </Button>
                        </Box>
                    )}

                </CardContent>

                <CardActions sx={{ px: 3, pb: 3 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
                </CardActions>
            </Card>
        </Box>
    );
};

export default AdminUserDetailsPage;
