import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Stack,
    Typography,
    TextField,
    MenuItem,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import adminService from '../../services/adminService';
import { fetchElections, type Election } from '../../services/electionService';

const AdminVotingWindowPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        electionId: '' as number | string,
        startTime: '',
        endTime: '',
        description: ''
    });
    const [elections, setElections] = useState<Election[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState('');
    const [votingWindows, setVotingWindows] = useState<any[]>([]);

    const formatToLocalDatetime = (ts: number) => {
        const d = new Date(Number(ts));
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleReset = () => {
        setError('');
        setSuccess('');
        setFormData({ electionId: '', startTime: '', endTime: '', description: '' });
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            if (!formData.electionId) throw new Error('Please select an election type');
            const startTs = new Date(formData.startTime).getTime();
            const endTs = new Date(formData.endTime).getTime();
            if (isNaN(startTs) || isNaN(endTs)) throw new Error('Invalid start or end time');
            if (endTs <= startTs) throw new Error('End time must be after start time');

            const payload = {
                electionId: Number(formData.electionId),
                startTime: startTs,
                endTime: endTs,
                description: formData.description
            };

            await adminService.createVotingWindow(payload as any);
            setSuccess('Voting window set successfully');
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to set voting window');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const resp = await fetchElections();
                if (!mounted) return;
                const data = resp?.data ?? [];
                setElections(Array.isArray(data) ? data : []);
            } catch (e) {
                // ignore
            }
        };
        void load();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        let mounted = true;
        const loadList = async () => {
            setListLoading(true);
            setListError('');
            try {
                const list = await adminService.getVotingWindows();
                if (!mounted) return;
                setVotingWindows(Array.isArray(list) ? list : []);
            } catch (err: any) {
                if (!mounted) return;
                setListError(err?.response?.data?.message || err?.message || 'Failed to load voting windows');
            } finally {
                if (mounted) setListLoading(false);
            }
        };
        void loadList();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <Box>
            <Card sx={{ maxWidth: 920, mx: 'auto', mt: 4 }}>
                <CardContent>
                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <HowToVoteIcon color="primary" />
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Set Voting Window
                            </Typography>
                        </Box>

                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    select
                                    label="Election Type"
                                    value={formData.electionId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, electionId: e.target.value }))}
                                    required
                                    fullWidth
                                    slotProps={{ select: { native: false } }}
                                >
                                    {elections.map((el) => (
                                        <MenuItem key={el.id} value={el.id}>{el.name}</MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    label="Start Time"
                                    value={formData.startTime}
                                    onChange={handleChange('startTime')}
                                    required
                                    fullWidth
                                    type="datetime-local"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />

                                <TextField
                                    label="End Time"
                                    value={formData.endTime}
                                    onChange={handleChange('endTime')}
                                    required
                                    fullWidth
                                    type="datetime-local"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />

                                <TextField
                                    label="Description"
                                    value={formData.description}
                                    onChange={handleChange('description')}
                                    fullWidth
                                    multiline
                                    rows={3}
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} /> : <HowToVoteIcon />}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Set Voting Window'}
                    </Button>
                </CardActions>
            </Card>
            <Box sx={{ maxWidth: 920, mx: 'auto', mt: 4 }}>
                <Paper>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>All Voting Windows</Typography>
                        {listLoading && <CircularProgress size={20} />}
                    </Box>
                    {listError && <Alert severity="error">{listError}</Alert>}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Description</TableCell>
                                <TableCell>Election</TableCell>
                                <TableCell>Start Time</TableCell>
                                <TableCell>End Time</TableCell>
                                <TableCell>Active</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {votingWindows.map((w) => (
                                <TableRow key={w.id} hover>
                                    <TableCell>{w.description || '-'}</TableCell>
                                    <TableCell>{w.election?.name || '-'}</TableCell>
                                    <TableCell>{w.startTime ? new Date(Number(w.startTime)).toLocaleString() : '-'}</TableCell>
                                    <TableCell>{w.endTime ? new Date(Number(w.endTime)).toLocaleString() : '-'}</TableCell>
                                    <TableCell>
                                        {w.isActive ? <Chip label="Active" color="success" size="small" /> : <Chip label="Inactive" size="small" />}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {votingWindows.length === 0 && !listLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No voting windows found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>
        </Box>
    );
};

export default AdminVotingWindowPage;
