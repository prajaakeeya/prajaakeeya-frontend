import React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Button,
    Typography,
    Box,
    Stack,
    TextField,
    IconButton,
    Chip,
    useMediaQuery,
    useTheme,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import {
    Save as SaveIcon,
    Refresh as RefreshIcon,
    MoreHoriz as OthersIcon
} from '@mui/icons-material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import apiClient from '../../services/apiClient';
import { deleteAspirantsMeeting } from '../../services/aspirantService';
import { useTranslation } from 'react-i18next';
import { safeUrl } from '../../utils/safeUrl';
import googleMeetImg from '../../assets/images/googl-meet.webp';
import zoomImg from '../../assets/images/zoom.webp';

interface AspirantMeetingLinksTabProps {
    aspirantProfile: any;
    setAspirantProfile: React.Dispatch<React.SetStateAction<any>>;
    handleSaveMeet: () => void;
    fetchAspirantMeetings: () => void;
    openNoteDialog: (meeting: any) => void;
}

const AspirantMeetingLinksTab: React.FC<AspirantMeetingLinksTabProps> = ({
    aspirantProfile,
    setAspirantProfile,
    handleSaveMeet,
    fetchAspirantMeetings,
    openNoteDialog
}) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDark = theme.palette.mode === 'dark';
    const DARK = theme.palette.background.paper;
    const DARK2 = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(17,24,39,0.04)';
    const [now, setNow] = React.useState<number>(Date.now());
    const [linkError, setLinkError] = React.useState<string | null>(null);
    const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(() => ({ open: false, message: '', severity: 'success' }));

    // Helper function to get platform icon
    const getPlatformIcon = (platform?: string | null) => {
        const iconProps = { fontSize: 'small' as const, sx: { mr: 0.5 } };
        switch(platform) {
            case 'google_meet':
                return <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                    <img src={googleMeetImg} alt="Google Meet" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>;
            case 'zoom':
                return <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                    <img src={zoomImg} alt="Zoom" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>;
            case 'instagram':
                return <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                    <img src="/images/insta.png" alt="Instagram" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>;
            case 'facebook':
                return <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                    <img src="/images/facebook.png" alt="Facebook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>;
            case 'others':
                return <OthersIcon {...iconProps} />;
            default:
                return null;
        }
    };

    // Helper function to get platform display name
    const getPlatformDisplayName = (platform?: string | null) => {
        switch(platform) {
            case 'google_meet':
                return 'Google Meet';
            case 'zoom':
                return 'Zoom';
            case 'instagram':
                return 'Instagram';
            case 'facebook':
                return 'Facebook';
            case 'others':
                return 'Others';
            default:
                return '';
        }
    };

    const handleDeleteMeeting = async (meetingId?: number) => {
        if (!meetingId) return;
        try {
            // call bulk delete endpoint with meeting id
            await deleteAspirantsMeeting({ meetingIds: [meetingId] });
            // refresh meetings after delete
            try { fetchAspirantMeetings(); } catch (e) { /* ignore */ }
            // update local state optimistically
            setAspirantProfile((p: any) => ({ ...p, meetings: Array.isArray(p.meetings) ? p.meetings.filter((m: any) => m.id !== meetingId) : p.meetings }));
            setSnack({ open: true, message: t('userDashboard.aspirant.deleted') || 'Meeting deleted', severity: 'success' });
        } catch (err) {
            console.error('Failed to delete meeting', err);
            const status = (err as any)?.response?.status;
            if (status === 403) {
                setSnack({ open: true, message: t('userDashboard.aspirant.deleteForbidden') || 'You cannot delete this meeting because it was created by another aspirant.', severity: 'error' });
            } else {
                setSnack({ open: true, message: t('userDashboard.aspirant.deleteFailed') || 'Failed to delete meeting', severity: 'error' });
            }
        }
    };

    const normalizeMeetingUrl = (input: string) => {
        let url = input.trim();
        if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
        return url;
    };

    const validateMeetingLink = (value: string) => {
        const v = (value || '').trim();
        if (!v) return t('userDashboard.aspirant.meetLinkRequired', { defaultValue: 'Please enter a meeting link.' });
        try {
            const u = new URL(normalizeMeetingUrl(v));
            if (u.protocol !== 'https:') return t('userDashboard.aspirant.meetLinkHttps', { defaultValue: 'Meeting link must start with https://' });
            const host = u.hostname.replace(/^www\./, '');
            const path = u.pathname;

            const hostMatches = (base: string) => host === base || host.endsWith(`.${base}`);
            const igUser = '[A-Za-z0-9_.][A-Za-z0-9_.]{0,29}';
            const fbUser = '[A-Za-z0-9.][A-Za-z0-9.-]{2,}';

            const allowedDomains: { base: string; check: (p: string) => boolean }[] = [
                {
                    base: 'meet.google.com',
                    check: (p) =>
                        /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/.test(p) ||
                        /^\/lookup\/[A-Za-z0-9_-]+\/?$/.test(p),
                },
                {
                    base: 'zoom.us',
                    check: (p) =>
                        /^\/j\/\d{8,12}\/?$/.test(p) ||
                        /^\/my\/[A-Za-z0-9._-]+\/?$/.test(p) ||
                        /^\/webinar\/register\/[A-Za-z0-9_-]+\/?$/.test(p) ||
                        /^\/meeting\/\d{8,12}\/?$/.test(p) ||
                        /^\/s\/\d{8,12}\/?$/.test(p),
                },
                {
                    base: 'instagram.com',
                    check: (p) =>
                        new RegExp(`^/${igUser}/?$`).test(p) ||
                        new RegExp(`^/${igUser}/live/?$`).test(p) ||
                        /^\/live\/[A-Za-z0-9_-]+\/?$/.test(p) ||
                        /^\/reel\/[A-Za-z0-9_-]+\/?$/.test(p) ||
                        /^\/p\/[A-Za-z0-9_-]+\/?$/.test(p) ||
                        new RegExp(`^/stories/${igUser}(/[A-Za-z0-9_-]+)?/?$`).test(p),
                },
                {
                    base: 'facebook.com',
                    check: (p) =>
                        /^\/profile\.php\/?$/.test(p) ||
                        /^\/(groups|events|watch|live|messages|gaming)(\/.*)?$/.test(p) ||
                        new RegExp(`^/${fbUser}/?$`).test(p) ||
                        new RegExp(`^/${fbUser}/(live|videos|posts|photos)(\\/.*)?$`).test(p),
                },
                {
                    // m.me is Messenger's short link host — common for shared
                    // chat / video-call invites from Facebook accounts.
                    base: 'm.me',
                    check: (p) => /^\/[A-Za-z0-9.][A-Za-z0-9.-]{0,49}\/?$/.test(p),
                },
                {
                    base: 'fb.com',
                    check: (p) => new RegExp(`^/${fbUser}/?$`).test(p),
                },
            ];

            const matched = allowedDomains.find((d) => hostMatches(d.base));
            if (!matched) return t('userDashboard.aspirant.meetLinkDomain', { defaultValue: 'Enter a valid meeting link (Google Meet / Zoom / Instagram / Facebook)' });
            if (!matched.check(path)) return t('userDashboard.aspirant.meetLinkInvalid', { defaultValue: 'The meeting link format appears invalid. Please check and try again.' });
            return null;
        } catch (e) {
            return t('userDashboard.aspirant.meetLinkInvalid', { defaultValue: 'Please enter a valid URL for the meeting link.' });
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];

    React.useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <Grid container columnSpacing={{ xs: 0, md: 3 }} rowSpacing={{ xs: 2, md: 3 }} sx={{
            alignItems: "stretch"
        }}>
            <Grid
                size={{
                    xs: 12,
                    md: 4
                }}>
                <Card sx={{
                    borderRadius: 4,
                    boxShadow: isDark ? '0 14px 34px rgba(0,0,0,0.55)' : '0 4px 20px rgba(0,0,0,0.08)',
                    border: '2px solid',
                    borderColor: isDark ? 'rgba(245,168,0,0.20)' : 'primary.main',
                    bgcolor: isDark ? DARK : '#FFFBF5',
                    height: '100%'
                }}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: isDark ? theme.palette.text.primary : 'primary.main' }}>
                            {t('userDashboard.aspirant.publicInteractionTitle') || 'Video Chat Link'}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                mb: 3
                            }}>
                            {t('userDashboard.aspirant.publicInteractionDesc') || 'This link will be visible to voters for public interaction and interviews.'}
                        </Typography>

                        {/* Title and description removed per UX request */}

                        <TextField
                            fullWidth
                            label={t('userDashboard.aspirant.meetLinkLabel') || 'Meeting Link'}
                            placeholder={t('userDashboard.aspirant.meetLinkPlaceholder') || 'https://meet.google.com/...'}
                            value={aspirantProfile?.meetLink ?? ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setAspirantProfile((p: any) => ({ ...p, meetLink: val }));
                                const err = validateMeetingLink(val);
                                setLinkError(err);
                            }}
                            onBlur={(e) => setLinkError(validateMeetingLink(e.target.value))}
                            error={Boolean(linkError)}
                            helperText={linkError || ''}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                        borderWidth: 2,
                                    },
                                },
                            }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>{t('userDashboard.aspirant.meetPlatformLabel') || 'Platform'}</InputLabel>
                            <Select
                                value={aspirantProfile?.meetPlatform ?? ''}
                                label={t('userDashboard.aspirant.meetPlatformLabel') || 'Platform'}
                                onChange={(e) => setAspirantProfile((p: any) => ({ ...p, meetPlatform: e.target.value }))}
                                sx={{
                                    borderRadius: 1,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main',
                                        borderWidth: 2,
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <Typography variant="body2">Select a platform</Typography>
                                </MenuItem>
                                <MenuItem value="google_meet">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                                            <img src={googleMeetImg} alt="Google Meet" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </Box>
                                        Google Meet
                                    </Box>
                                </MenuItem>
                                <MenuItem value="zoom">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                                            <img src={zoomImg} alt="Zoom" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </Box>
                                        Zoom
                                    </Box>
                                </MenuItem>
                                <MenuItem value="instagram">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                                            <img src="/images/insta.png" alt="Instagram" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </Box>
                                        Instagram
                                    </Box>
                                </MenuItem>
                                <MenuItem value="facebook">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                                            <img src="/images/facebook.png" alt="Facebook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </Box>
                                        Facebook
                                    </Box>
                                </MenuItem>
                                <MenuItem value="others">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <OthersIcon sx={{ mr: 1 }} />
                                        Others
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    label={t('userDashboard.aspirant.meetDateLabel') || 'Meeting Date'}
                                    type="date"
                                    value={aspirantProfile?.meetDate ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && val < todayStr) return;
                                        setAspirantProfile((p: any) => ({ ...p, meetDate: val }));
                                    }}
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },

                                        htmlInput: { min: todayStr }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            '&:hover fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                                borderWidth: 2,
                                            },
                                        },
                                        // native calendar icon color for webkit browsers
                                        '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                            filter: isDark ? 'invert(1) brightness(0.9)' : 'none',
                                            WebkitAppearance: 'auto',
                                        },
                                        '& input': { color: theme.palette.text.primary }
                                    }} />
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 6
                                }}>
                                <TextField
                                    fullWidth
                                    label={t('userDashboard.aspirant.meetStartTimeLabel') || 'Start Time'}
                                    type="time"
                                    value={aspirantProfile?.meetTime ?? ''}
                                    onChange={(e) => setAspirantProfile((p: any) => ({ ...p, meetTime: e.target.value }))}
                                    slotProps={{ inputLabel: {
                                        shrink: true,
                                    } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            '&:hover fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                                borderWidth: 2,
                                            },
                                        },
                                        // native time picker icon color for webkit
                                        '& input[type="time"]::-webkit-calendar-picker-indicator': {
                                            filter: isDark ? 'invert(1) brightness(0.9)' : 'none',
                                            WebkitAppearance: 'auto',
                                        },
                                        '& input': { color: theme.palette.text.primary }
                                    }}
                                />
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 6
                                }}>
                                <TextField
                                    fullWidth
                                    label={t('userDashboard.aspirant.meetEndTimeLabel') || 'End Time'}
                                    type="time"
                                    value={aspirantProfile?.meetEndTime ?? ''}
                                    onChange={(e) => setAspirantProfile((p: any) => ({ ...p, meetEndTime: e.target.value }))}
                                    slotProps={{ inputLabel: {
                                        shrink: true,
                                    } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            '&:hover fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                                borderWidth: 2,
                                            },
                                        },
                                        // native time picker icon color for webkit
                                        '& input[type="time"]::-webkit-calendar-picker-indicator': {
                                            filter: isDark ? 'invert(1) brightness(0.9)' : 'none',
                                            WebkitAppearance: 'auto',
                                        },
                                        '& input': { color: theme.palette.text.primary }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={() => {
                                const normalized = normalizeMeetingUrl(aspirantProfile?.meetLink || '');
                                if (normalized !== (aspirantProfile?.meetLink || '').trim()) {
                                    setAspirantProfile((p: any) => ({ ...p, meetLink: normalized }));
                                }
                                const err = validateMeetingLink(normalized);
                                setLinkError(err);
                                if (err) return;
                                handleSaveMeet();
                            }}
                            sx={{
                                bgcolor: 'primary.main',
                                '&:hover': { bgcolor: 'primary.dark' },
                                borderRadius: 3,
                                height: 44,
                                // ensure the start icon matches text color
                                '& .MuiButton-startIcon': { color: theme.palette.common.white }
                            }}
                        >
                            Save
                        </Button>
                        {aspirantProfile.meetLastUpdated && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                    mt: 2,
                                    display: 'block',
                                    textAlign: 'center'
                                }}>
                                Last updated: {new Date(aspirantProfile.meetLastUpdated).toLocaleString()}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 8
                }}>
                <Card sx={{
                    borderRadius: 1,
                    boxShadow: isDark ? '0 16px 38px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: isDark ? DARK : '#fff',
                    height: '100%'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {t('userDashboard.aspirant.scheduledMeetings', { count: Array.isArray(aspirantProfile.meetings) ? aspirantProfile.meetings.length : 0 })}
                            </Typography>
                            <IconButton size="small" onClick={() => fetchAspirantMeetings()} aria-label="Refresh meetings" sx={{ color: theme.palette.text.primary }}>
                                <RefreshIcon fontSize="small" sx={{ color: 'inherit' }} />
                            </IconButton>
                        </Box>
                        {(!Array.isArray(aspirantProfile.meetings) || aspirantProfile.meetings.length === 0) ? (
                            <Typography variant="body2" sx={{
                                color: "text.secondary"
                            }}>
                                {t('userDashboard.aspirant.noMeetings') || 'No meetings scheduled yet.'}
                            </Typography>
                        ) : (
                            <Stack spacing={1.5}>
                                {(() => {
                                    const now = Date.now();
                                    const sortedMeetings = [...aspirantProfile.meetings].sort((a: any, b: any) => {
                                        const aTime = Number(a.scheduledAt);
                                        const bTime = Number(b.scheduledAt);
                                        const aIsPast = aTime < now;
                                        const bIsPast = bTime < now;
                                        if (aIsPast !== bIsPast) return aIsPast ? 1 : -1;
                                        return aTime - bTime;
                                    });
                                    return sortedMeetings.map((meeting: any, idx: number) => {
                                        const scheduledAt = Number(meeting.scheduledAt);
                                        const isPast = scheduledAt < now;
                                        const isCompleted = Boolean(meeting.completed === true);
                                        const meetingDate = new Date(scheduledAt);
                                        const formattedDate = meetingDate.toLocaleDateString();
                                        const formattedTime = meetingDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                                        const endTimeRaw = meeting.endTime ? Number(meeting.endTime) : null;
                                        const endDate = endTimeRaw ? new Date(endTimeRaw > 1e12 ? endTimeRaw : endTimeRaw * 1000) : null;
                                        const formattedEndTime = endDate ? endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : null;
                                        const startsIn = scheduledAt > now && !isCompleted ? (() => {
                                            let diff = scheduledAt - now;
                                            if (diff <= 0) return null;
                                            const days = Math.floor(diff / 86400000);
                                            diff %= 86400000;
                                            const hours = Math.floor(diff / 3600000);
                                            diff %= 3600000;
                                            const minutes = Math.floor(diff / 60000);
                                            const seconds = Math.floor((diff % 60000) / 1000);
                                            const parts: string[] = [];
                                            if (days) parts.push(`${days}d`);
                                            if (hours) parts.push(`${hours}h`);
                                            if (minutes) parts.push(`${minutes}m`);
                                            parts.push(`${seconds}s`);
                                            return parts.join(' ');
                                        })() : null;

                                        return (
                                            <Box
                                                key={meeting.id || idx}
                                                sx={(t) => ({
                                                    position: 'relative',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: 2,
                                                    borderRadius: 3,
                                                    border: '1px solid',
                                                    borderColor: isCompleted ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)') : (isDark ? 'rgba(255,168,0,0.12)' : 'rgba(255,106,0,0.12)'),
                                                    bgcolor: isCompleted ? (isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFB') : (isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF'),
                                                    boxShadow: isCompleted ? 'none' : (isDark ? '0 10px 26px rgba(0,0,0,0.45)' : '0 12px 30px rgba(255,106,0,0.06)'),
                                                    cursor: meeting.meetingLink ? 'pointer' : 'default',
                                                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                                                    borderLeft: isCompleted ? undefined : '4px solid',
                                                    borderLeftColor: isCompleted ? undefined : t.palette.primary.main,
                                                    '&:hover': isCompleted ? { transform: 'none' } : { transform: 'translateY(-4px)', boxShadow: isDark ? '0 18px 40px rgba(0,0,0,0.5)' : '0 18px 40px rgba(255,106,0,0.08)' }
                                                })}
                                                onClick={() => {
                                                    if (!meeting.meetingLink) return;
                                                    // C-SEC-4: sanitize aspirant-supplied meeting link before navigating.
                                                    const link = safeUrl(normalizeMeetingUrl(meeting.meetingLink));
                                                    if (!link) return;
                                                    // See note in WardCandidateListPage — iOS WebView / standalone
                                                    // PWA silently no-ops window.open('_blank'), causing blank
                                                    // Instagram links. Use same-window nav so iOS routes the
                                                    // universal link to the native app.
                                                    const isStandalone =
                                                        window.matchMedia?.('(display-mode: standalone)').matches ||
                                                        (navigator as any).standalone === true ||
                                                        !!(window as any).ReactNativeWebView;
                                                    if (isStandalone) window.location.href = link;
                                                    else window.open(link, '_blank', 'noopener');
                                                }}
                                            >
                                                {/* Mobile: delete icon at top-right */}
                                                {isMobile && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteMeeting(meeting.id); }}
                                                        aria-label="Delete meeting"
                                                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: theme.palette.background.paper, color: theme.palette.error.main, boxShadow: '0 6px 18px rgba(0,0,0,0.32)' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Typography variant="body1" sx={{ fontWeight: 800, color: isCompleted ? 'text.secondary' : 'primary.main', fontSize: { xs: '1rem', md: '1.05rem' } }}>
                                                            {meeting.title || 'Meeting'}
                                                        </Typography>
                                                        {/* Show status chip next to title: Completed / Past / Upcoming */}
                                                        <Chip
                                                            label={isCompleted ? (t('userDashboard.aspirant.meetingCompleted') || 'Completed') : (isPast ? (t('userDashboard.aspirant.past') || 'Past') : (t('userDashboard.aspirant.upcoming') || 'Upcoming'))}
                                                            size="small"
                                                            color={isCompleted ? 'default' : isPast ? 'default' : 'primary'}
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography variant="caption" sx={{
                                                        color: "text.secondary"
                                                    }}>
                                                        {formattedDate} • {formattedTime}{formattedEndTime ? ` - ${formattedEndTime}` : ''}
                                                    </Typography>
                                                    {meeting.platform && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                            {getPlatformIcon(meeting.platform)}
                                                            <Typography variant="caption" sx={{
                                                                color: "text.secondary"
                                                            }}>
                                                                {getPlatformDisplayName(meeting.platform)}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {meeting.createdBy?.name && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: "text.secondary",
                                                                display: 'block'
                                                            }}>
                                                            {`Created by: ${meeting.createdBy.name}`}
                                                        </Typography>
                                                    )}
                                                    {/* countdown moved to right-side chip area */}
                                                    {meeting.meetingLink && (
                                                        <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5, wordBreak: 'break-all' }}>
                                                            {meeting.meetingLink}
                                                        </Typography>
                                                    )}
                                                    {meeting.notes && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: "text.secondary",
                                                                display: 'block',
                                                                mt: 0.5
                                                            }}>
                                                            Note: {meeting.notes}
                                                        </Typography>
                                                    )}

                                                    {/* Mobile: show Add Note then countdown below the meeting link */}
                                                    {isMobile && !isCompleted && (
                                                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            <Button
                                                                fullWidth
                                                                size="small"
                                                                variant="contained"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openNoteDialog(meeting);
                                                                }}
                                                                sx={{
                                                                    bgcolor: 'orange',
                                                                    color: 'white',
                                                                    '&:hover': { bgcolor: '#ff8c00' },
                                                                    py: 0.6,
                                                                    borderRadius: 2
                                                                }}
                                                            >
                                                                {t('userDashboard.aspirant.addNote') || 'Add Note'}
                                                            </Button>
                                                            {startsIn ? (
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: 'primary.main',
                                                                        fontWeight: 700,
                                                                        whiteSpace: 'nowrap',
                                                                        bgcolor: '#FFF4EA',
                                                                        px: 1,
                                                                        py: '4px',
                                                                        borderRadius: 1,
                                                                        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.02)',
                                                                        display: 'inline-block',
                                                                        alignSelf: 'flex-start'
                                                                    }}
                                                                >
                                                                    {`Starts in ${startsIn}`}
                                                                </Typography>
                                                            ) : null}
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Box sx={{ display: isMobile ? 'none' : 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                                                    {/* Right-side controls: Add Note (desktop) with Starts in below it */}
                                                    {!isCompleted && (
                                                        <>
                                                            {!isMobile && (
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openNoteDialog(meeting);
                                                                    }}
                                                                    sx={{
                                                                        mt: 0.5,
                                                                        bgcolor: 'orange',
                                                                        color: 'white',
                                                                        '&:hover': { bgcolor: '#ff8c00' },
                                                                        px: 0.75,
                                                                        py: 0.3,
                                                                        minWidth: 72,
                                                                        borderRadius: 2
                                                                    }}
                                                                >
                                                                    {t('userDashboard.aspirant.addNote') || 'Add Note'}
                                                                </Button>
                                                            )}
                                                            {/* place Starts in below the Add Note button on desktop */}
                                                            {!isMobile && startsIn ? (
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: 'primary.main',
                                                                        fontWeight: 700,
                                                                        whiteSpace: 'nowrap',
                                                                        bgcolor: '#FFF4EA',
                                                                        px: 1,
                                                                        py: '4px',
                                                                        borderRadius: 1,
                                                                        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.02)',
                                                                        mt: 0.25
                                                                    }}
                                                                >
                                                                    {`Starts in ${startsIn}`}
                                                                </Typography>
                                                            ) : null}
                                                        </>
                                                    )}

                                                    {/* Delete action always visible on right side */}
                                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteMeeting(meeting.id); }}
                                                            aria-label="Delete meeting"
                                                            sx={{ color: theme.palette.error.main }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        );
                                    });
                                })()}
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </Grid>
    );
};

export default AspirantMeetingLinksTab;
