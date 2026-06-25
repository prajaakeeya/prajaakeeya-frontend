import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    TextField,
    MenuItem,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import meetingsService, { Meeting } from '../../services/meetingsService';
import { getWards } from '../../services/wardService';
import { Autocomplete } from '@mui/material';
import { safeUrl } from '../../utils/safeUrl';

const AdminMeetingsPage: React.FC = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(false);
    const [wardFilter, setWardFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; meeting?: Meeting }>({ open: false });

    const [wards, setWards] = useState<{ ward_number: string; ward_name: string }[]>([]);

    useEffect(() => {
        loadMeetings();
        // Fetch wards for filter
        (async () => {
            try {
                const resp = await getWards();
                const data = resp?.data ?? resp ?? [];
                setWards(Array.isArray(data) ? data : []);
            } catch (e) {
                console.warn('Failed to load wards', e);
            }
        })();
    }, []);

    const loadMeetings = async (filters?: { wardNumber?: string; isActive?: boolean }) => {
        setLoading(true);
        try {
            const params: any = {};
            if (filters?.wardNumber) params.wardNumber = filters.wardNumber;
            if (filters?.isActive !== undefined) params.isActive = filters.isActive;

            const data = await meetingsService.getMeetings(params);
            setMeetings(data);
        } catch (error) {
            console.error('Failed to load meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        const filters: any = {};
        if (wardFilter.trim()) {
            filters.wardNumber = wardFilter.trim();
        }
        if (activeFilter !== '') {
            filters.isActive = activeFilter === 'true';
        }
        loadMeetings(filters);
    };

    const handleClearFilters = () => {
        setWardFilter('');
        setActiveFilter('');
        loadMeetings();
    };

    const handleDeleteClick = (meeting: Meeting) => {
        setDeleteConfirm({ open: true, meeting });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.meeting) return;

        try {
            await meetingsService.deleteMeeting(deleteConfirm.meeting.id);
            // Remove the deleted meeting from the list
            setMeetings(prev => prev.filter(m => m.id !== deleteConfirm.meeting!.id));
        } catch (error) {
            console.error('Failed to delete meeting:', error);
        } finally {
            setDeleteConfirm({ open: false });
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const openMeetingLink = (url: string) => {
        // C-SEC-4: meetingLink is user-supplied — block script-capable schemes.
        const safe = safeUrl(url);
        if (!safe) return;
        window.open(safe, '_blank');
    };

    return (
        <Box>
            <Stack spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <VideoCallIcon color="primary" />
                            Admin - Meetings
                        </Typography>
                    </Box>
                </Box>

                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6">Filters</Typography>

                            <Grid container spacing={2} sx={{
                                alignItems: "center"
                            }}>
                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 4
                                    }}>
                                    <Autocomplete
                                        options={wards}
                                        getOptionLabel={(option) => `${option.ward_number} - ${option.ward_name}`}
                                        value={wards.find(w => w.ward_number === wardFilter) || null}
                                        onChange={(_, newValue) => setWardFilter(newValue ? newValue.ward_number : '')}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Ward" placeholder="Type or select ward" fullWidth />
                                        )}
                                        isOptionEqualToValue={(option, value) => option.ward_number === value.ward_number}
                                        clearOnEscape
                                    />
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 3
                                    }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Status"
                                        value={activeFilter}
                                        onChange={(e) => setActiveFilter(e.target.value)}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="true">Active</MenuItem>
                                        <MenuItem value="false">Inactive</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 5
                                    }}>
                                    <Stack direction="row" spacing={1}>
                                        <Button variant="contained" onClick={handleFilter}>
                                            Apply Filters
                                        </Button>
                                        <Button variant="outlined" onClick={handleClearFilters}>
                                            Clear
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Stack>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        {loading ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Ward</TableCell>
                                            <TableCell>Scheduled At</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Created By</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {meetings.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                                                    <Typography sx={{
                                                        color: "text.secondary"
                                                    }}>No meetings found</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            meetings.map((meeting) => (
                                                <TableRow key={meeting.id} hover>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                {meeting.title}
                                                            </Typography>
                                                            {meeting.description && (
                                                                <Typography variant="body2" sx={{
                                                                    color: "text.secondary"
                                                                }}>
                                                                    {meeting.description}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 600 }}>
                                                                {meeting.ward.number}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{
                                                                color: "text.secondary"
                                                            }}>
                                                                {meeting.ward.name}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDateTime(meeting.scheduledAt)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={meeting.isActive ? 'Active' : 'Inactive'}
                                                            color={meeting.isActive ? 'success' : 'default'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {meeting.createdBy.name}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Join Meeting">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => openMeetingLink(meeting.meetingLink)}
                                                                color="primary"
                                                            >
                                                                <LinkIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete Meeting">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteClick(meeting)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            </Stack>
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })}>
                <DialogTitle>Delete Meeting</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the meeting &quot;{deleteConfirm.meeting?.title}&quot;?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm({ open: false })}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminMeetingsPage;