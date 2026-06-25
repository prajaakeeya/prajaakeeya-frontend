import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { getAspirantById, getAspirantMeetings, postAspirantMeetingComplete, setAspirantsMeeting } from '../../services/aspirantService';
import AspirantMeetingLinksTab from '../../components/aspirant/AspirantMeetingLinksTab';

const AspirantMeetingLinksPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // helper to normalize time fields coming from the server (startTime / scheduledAt)
    const parseScheduledAt = (val: any): number | null => {
        if (val == null) return null;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            // numeric string containing milliseconds
            if (/^\d+$/.test(val)) return parseInt(val, 10);
            const ts = Date.parse(val);
            return isNaN(ts) ? null : ts;
        }
        return null;
    };

    const [aspirantProfile, setAspirantProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
    const [noteText, setNoteText] = useState('');
    const [noteSaving, setNoteSaving] = useState(false);
    const [noteError, setNoteError] = useState<string | null>(null);
    const [savingMeet, setSavingMeet] = useState(false);
    const [meetSaveError, setMeetSaveError] = useState('');
    const [meetSavedOpen, setMeetSavedOpen] = useState(false);

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

                // Use aspirant-level meetings only (ward-level meetings removed)
                try {
                    const aspirantMeetings = Array.isArray(profile.data?.meetings) ? profile.data.meetings : [];
                    const normalized = aspirantMeetings.map((m: any) => ({
                        ...m,
                        // prefer explicit startTime from backend, fall back to scheduledAt for older APIs
                        scheduledAt: parseScheduledAt(m?.startTime ?? m?.scheduledAt ?? null),
                        endTime: parseScheduledAt(m?.endTime ?? null)
                    }));
                    setAspirantProfile((prev: any) => ({ ...prev, meetings: normalized }));
                } catch { /* ignore */ }
            } catch (err: any) {
                setError(err.message || 'Failed to load aspirant profile');
            } finally {
                setLoading(false);
            }
        };

        fetchAspirantProfile();
    }, [user, navigate]);

    const handleSaveMeet = async () => {
        if (!aspirantProfile) return;

        setSavingMeet(true);
        setMeetSaveError('');
        try {
            const payload: any = {
                meetingLink: aspirantProfile.meetLink || null,
                title: aspirantProfile.meetTitle || null,
                description: aspirantProfile.meetDescription || null
            };

            // compute numeric startTime and endTime (milliseconds)
            if (aspirantProfile.meetDate) {
                const dateStr = aspirantProfile.meetDate;
                const startTimeStr = aspirantProfile.meetTime || '00:00';
                const endTimeStr = aspirantProfile.meetEndTime || '';

                const startDt = new Date(`${dateStr}T${startTimeStr}`);
                if (isNaN(startDt.getTime())) {
                    throw new Error('Invalid meeting date or start time. Please pick a valid date and time.');
                }
                payload.startTime = startDt.getTime();

                if (endTimeStr) {
                    const endDt = new Date(`${dateStr}T${endTimeStr}`);
                    if (isNaN(endDt.getTime())) {
                        throw new Error('Invalid meeting end time. Please pick a valid end time.');
                    }
                    payload.endTime = endDt.getTime();
                } else {
                    // If no end time provided, default to 1 hour after start
                    payload.endTime = startDt.getTime() + 60 * 60 * 1000;
                }
            }

            // Log payload to help debug server validation errors
            console.debug('Saving meeting payload', payload);

            const aspirantId = aspirantProfile.id || user?.id;
            if (!aspirantId) throw new Error('No aspirant id available to save meeting');

            const aspirantIdToUse = aspirantId;
            // call new bulk aspirants meeting API with single aspirant id in array
            await setAspirantsMeeting({ aspirantIds: [aspirantIdToUse], meetingLink: payload.meetingLink, startTime: payload.startTime ?? null, endTime: payload.endTime ?? null, title: payload.title, description: payload.description, platform: aspirantProfile.meetPlatform || null });

            // Refresh meetings to reconcile server state (server returns meetings for aspirant)
            try { await fetchAspirantMeetings(); } catch (e) { /* ignore */ }

            setMeetSavedOpen(true);
        } catch (err: any) {
            console.error('Failed to save meeting', err);

            if (err?.response?.status === 404) {
                setMeetSaveError('Aspirant not found (404). Please confirm you have an aspirant profile.');
            } else {
                const serverMsg = err?.response?.data?.message;
                const serverErrors = err?.response?.data?.errors;
                const details = serverErrors ? ` Details: ${JSON.stringify(serverErrors)}` : '';
                setMeetSaveError(serverMsg ? `${serverMsg}${details}` : (err?.message || 'Failed to save meeting'));
            }
        } finally {
            setSavingMeet(false);
        }
    };

    const fetchAspirantMeetings = async () => {
        if (!user?.id) return;

        try {
            const aspirantId = user?.aspirantId ?? user?.id;
            // Call aspirant-specific meetings endpoint
            const resp = await getAspirantMeetings(aspirantId);
            const meetings = resp?.data?.meetings ?? resp?.data ?? [];
            const normalized = Array.isArray(meetings)
                ? meetings.map((m: any) => ({
                    ...m,
                    // prefer explicit startTime from backend, fall back to scheduledAt for older APIs
                    scheduledAt: parseScheduledAt(m?.startTime ?? m?.scheduledAt ?? null),
                    endTime: parseScheduledAt(m?.endTime ?? null),
                }))
                : [];
            setAspirantProfile((prev: any) => ({ ...prev, meetings: normalized, meetLink: '', meetTitle: '', meetDescription: '', meetDate: '', meetTime: '', meetEndTime: '', meetPlatform: '' }));
        } catch (err: any) {
            console.error('Failed to fetch meetings:', err);
        }
    };

    const openNoteDialog = (meeting: any) => {
        setSelectedMeeting(meeting);
        setNoteText(meeting.notes || '');
        setNoteDialogOpen(true);
        setNoteError(null);
    };

    const handleSaveNote = async () => {
        if (!selectedMeeting || !noteText.trim()) return;

        setNoteSaving(true);
        setNoteError(null);

        try {
            const aspirantId = aspirantProfile?.id || user?.id;
            if (!aspirantId) throw new Error('No aspirant id available');

            const aspirantIdToUse = aspirantId;
            await postAspirantMeetingComplete(aspirantIdToUse, selectedMeeting.id, { notes: noteText });
            setNoteDialogOpen(false);
            setSelectedMeeting(null);
            setNoteText('');

            // Refresh meetings
            await fetchAspirantMeetings();
        } catch (err: any) {
            setNoteError(err.message || 'Failed to save note');
        } finally {
            setNoteSaving(false);
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
                {t('userDashboard.aspirant.tabs.meetings') || 'My Meeting Links'}
            </Typography>

            <AspirantMeetingLinksTab
                aspirantProfile={aspirantProfile}
                setAspirantProfile={setAspirantProfile}
                handleSaveMeet={handleSaveMeet}
                fetchAspirantMeetings={fetchAspirantMeetings}
                openNoteDialog={openNoteDialog}
            />

            {/* Note Dialog */}
            <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{t('userDashboard.aspirant.addNoteTitle') || 'Add Meeting Note'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2">{t('userDashboard.aspirant.addNotePrompt') || 'Add notes or summary after the meeting is completed.'}</Typography>
                        <TextField
                            label={t('userDashboard.aspirant.field.note') || 'Note'}
                            fullWidth
                            multiline
                            rows={6}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            error={!!noteError}
                            helperText={noteError}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNoteDialogOpen(false)} disabled={noteSaving}>
                        {t('common.cancel') || 'Cancel'}
                    </Button>
                    <Button variant="contained" onClick={handleSaveNote} disabled={noteSaving || !noteText.trim()}>
                        {noteSaving ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AspirantMeetingLinksPage;