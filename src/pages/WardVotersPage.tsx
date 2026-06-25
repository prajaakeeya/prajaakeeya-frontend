import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, TextField, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Card, CardContent, IconButton, Divider, useTheme, useMediaQuery, Snackbar, Alert } from '@mui/material';
import { Apartment as ApartmentIcon, Report as ReportIcon, MoreVert as MoreVertIcon, Close as CloseIcon, AttachFile as AttachFileIcon, Delete as DeleteIcon, Person as PersonIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { reportUser } from '../services/voterService';
import apiClient from '../services/apiClient';
import useSnackbar from '../hooks/useSnackbar';

const WardVotersPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
    const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
    const FF = FF_BODY;
    const isKannada = (i18n.language || '').startsWith('kn');
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [voters, setVoters] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVoters, setTotalVoters] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState<any | null>(null);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [reportedIds, setReportedIds] = useState<any[]>([]);
    const [reportFile, setReportFile] = useState<File | null>(null);
    const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
    const [photoDialogSrc, setPhotoDialogSrc] = useState<string | null>(null);
    const [photoDialogName, setPhotoDialogName] = useState('');

    const storageKey = () => `reported_voters_all`;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const fetchVoters = useCallback(async (searchQuery: string, pageNum: number, append: boolean) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = { page: pageNum, limit: 50 };
            if (searchQuery.trim()) params.search = searchQuery.trim();
            const resp = await apiClient.get('/users/voters', { params });
            const raw = Array.isArray(resp?.data?.data) ? resp.data.data : (Array.isArray(resp?.data) ? resp.data : []);
            const tp = resp?.data?.totalPages || 1;
            setTotalPages(tp);
            if (resp?.data?.total != null) setTotalVoters(resp.data.total);
            else if (resp?.data?.totalUsers != null) setTotalVoters(resp.data.totalUsers);
            const data = raw.map((v: any) => ({
                ...v,
                photoUrl: v.profilePicture || v.profile_picture || v.profilePictureUrl || v.photoUrl || v.photo || v.avatar || null,
                nameEn: v.nameEn || v.name || v.nameKn || '',
                nameKn: v.nameKn || v.name || v.nameEn || ''
            }));
            if (append) {
                setVoters((prev) => [...prev, ...data]);
            } else {
                setVoters(data);
            }
            setHasMore(pageNum < tp);
        } catch (err: any) {
            console.error('Failed to fetch voters', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load voters');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Initial fetch on mount; debounced refetch when the search query changes.
    // Merged into a single effect so we don't fire two requests on mount.
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            fetchVoters(query, 1, false);
            return;
        }
        const timer = setTimeout(() => {
            setPage(1);
            setHasMore(true);
            fetchVoters(query, 1, false);
        }, 400);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    // Infinite scroll — IntersectionObserver on sentinel
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    setPage((prev) => {
                        const next = prev + 1;
                        fetchVoters(query, next, true);
                        return next;
                    });
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, query, fetchVoters]);

    // Fetch reported IDs from API
    useEffect(() => {
        apiClient.get('/users/my-reports')
            .then((resp) => {
                const reports = Array.isArray(resp?.data) ? resp.data : [];
                const ids = reports.map((r: any) => r.reportedUserId).filter(Boolean);
                setReportedIds(ids);
                try { localStorage.setItem(storageKey(), JSON.stringify(ids)); } catch (e) { /* ignore */ }
            })
            .catch(() => {
                // Fallback to localStorage if API fails
                try {
                    const raw = localStorage.getItem(storageKey());
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed)) setReportedIds(parsed);
                    }
                } catch (e) { /* ignore */ }
            });
    }, []);

    const resolve = (primary: string, secondary: string, fallback: string) => {
        const p = t(primary);
        if (p && p !== primary) return p;
        const s = t(secondary);
        if (s && s !== secondary) return s;
        return fallback;
    };

    const snackbar = useSnackbar();

    const submitReport = async () => {
        if (!reportTarget) return;
        setSubmittingReport(true);
        try {
            const reportedUserId = reportTarget.id ?? reportTarget.userId ?? reportTarget.epicId ?? reportTarget.voter_id;
            const payload = {
                reportedUserId,
                reportedUserType: 'voter',
                reason: reportReason || 'Reported via app'
            } as any;

            // If there is an attachment, send as FormData
            if (reportFile) {
                const fd = new FormData();
                fd.append('reportedUserId', String(payload.reportedUserId));
                fd.append('reportedUserType', String(payload.reportedUserType));
                fd.append('reason', String(payload.reason));
                fd.append('attachment', reportFile, reportFile.name);
                await reportUser(fd);
            } else {
                await reportUser(payload);
            }
            snackbar.showMessage(t('reportSubmitted') || 'Report submitted', 'success');
            // persist reported id locally so it survives a page refresh
            try {
                const key = storageKey();
                const existing = Array.isArray(reportedIds) ? reportedIds : [];
                const updated = Array.from(new Set([...existing, reportedUserId]));
                setReportedIds(updated);
                localStorage.setItem(key, JSON.stringify(updated));
            } catch (e) {
                // ignore storage errors
                setReportedIds((s) => Array.from(new Set([...s, reportedUserId])));
            }
            // clear attachment after reporting
            setReportFile(null);
            setReportOpen(false);
        } catch (err: any) {
            console.error('Report submit failed', err);
            const msg = err?.response?.data?.message || err?.message || 'Failed to submit report';
            snackbar.showMessage(msg, 'error');
        } finally {
            setSubmittingReport(false);
        }
    };

    const openPhotoPreview = (v: any) => {
        const src = v?.photoUrl || v?.photo || null;
        if (!src) return;
        setPhotoDialogSrc(src);
        setPhotoDialogName(isKannada ? (v.nameKn || v.nameEn || v.name || '') : (v.nameEn || v.name || v.nameKn || ''));
        setPhotoDialogOpen(true);
    };

    const descText = resolve('pages.voterCount.listDescription', 'voters', 'List of voters');
    const textPrimary = theme.palette.text.primary;
    const textSecondary = theme.palette.text.secondary;
    const border = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(17,24,39,0.14)';
    const panelBg = theme.palette.mode === 'dark'
        ? 'linear-gradient(155deg, rgba(20,24,34,0.95) 0%, rgba(13,17,28,0.96) 100%)'
        : 'linear-gradient(155deg, #FFFFFF 0%, #F8FAFC 100%)';

    return (
        <Box sx={{ p: { xs: 1.25, sm: 2.5 } }}>
            <Card sx={{ mb: 2.2, borderRadius: 2.5, background: panelBg, border: `1px solid ${border}`, boxShadow: theme.palette.mode === 'dark' ? '0 18px 40px rgba(0,0,0,0.35)' : '0 10px 24px rgba(17,24,39,0.08)' }}>
                <Box sx={{ display: 'flex', height: 4 }}>
                    {['#C8180A', '#253A9A', '#6B3A00'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
                </Box>
                <CardContent sx={{ p: { xs: 1.5, sm: 2.2 }, '&:last-child': { pb: { xs: 1.5, sm: 2.2 } } }}>
                    <Stack spacing={1.35}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', sm: '2rem' }, color: textPrimary }}>
                                {t('userDashboard.actions.voters') || 'Voters'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.4, color: textSecondary, fontFamily: FF_BODY }}>
                                {descText} - {totalVoters || voters.length}
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            size="small"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={isKannada ? 'ದಿ ರಿಯಲ್ ಪ್ರಜಾಕೀಯರನ್ನು ಹುಡುಕಿ' : 'Search The Real Prajaakeeyan'}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& input::placeholder': { fontSize: '0.75rem' },
                            }}
                        />
                    </Stack>
                </CardContent>
            </Card>
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <>
                    {isMobile ? (
                        <Box>
                            <Stack spacing={1.4}>
                                {voters.map((v: any, idx: number) => {
                                    const idKey = v.id ?? v.userId ?? v.epicId ?? v.voter_id ?? idx;
                                    const reported = reportedIds.includes(idKey);
                                    return (
                                        <Card
                                            key={idKey}
                                            sx={{
                                                borderRadius: 2,
                                                border: `1px solid ${border}`,
                                                borderLeft: `4px solid ${reported ? '#ef4444' : '#F5A800'}`,
                                                boxShadow: theme.palette.mode === 'dark' ? '0 8px 20px rgba(0,0,0,0.3)' : '0 4px 14px rgba(17,24,39,0.06)',
                                                ...(reported ? { backgroundColor: 'error.main', color: 'common.white' } : {})
                                            }}
                                        >
                                            <CardContent sx={{ p: isMobile ? 1.25 : 2 }}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        justifyContent: "space-between"
                                                    }}>
                                                    <Stack direction="row" spacing={1.5} sx={{
                                                        alignItems: "center"
                                                    }}>
                                                        <Avatar
                                                            src={v.photoUrl || v.photo || undefined}
                                                            alt={v.name || v.nameEn || ''}
                                                            sx={{
                                                                width: isMobile ? 44 : 40,
                                                                height: isMobile ? 44 : 40,
                                                                bgcolor: reported ? 'rgba(255,255,255,0.16)' : 'primary.100',
                                                                color: reported ? 'common.white' : undefined,
                                                                fontSize: isMobile ? '0.95rem' : '0.9rem',
                                                                cursor: (v.photoUrl || v.photo) ? 'pointer' : 'default'
                                                            }}
                                                            onClick={() => openPhotoPreview(v)}
                                                        >
                                                            {(!v.photo && (v.name || v.nameEn)) ? ((v.name || v.nameEn).split(' ').map((s: string) => s.charAt(0)).slice(0, 2).join('')) : null}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: FF_HEADING, fontSize: isMobile ? '0.95rem' : undefined, color: reported ? 'common.white' : undefined }}>
                                                                {isKannada ? (v.nameKn || v.nameEn || v.name || '') : (v.nameEn || v.name || v.nameKn || '')}
                                                            </Typography>
                                                            <Stack
                                                                direction="row"
                                                                spacing={1}
                                                                sx={{
                                                                    alignItems: "flex-start",
                                                                    mt: 0.5
                                                                }}>
                                                                <ApartmentIcon fontSize="small" color={reported ? 'inherit' : 'action'} sx={{ mt: '2px', color: reported ? 'common.white' : undefined }} />
                                                                <Typography variant="caption" color={reported ? 'common.white' : 'text.secondary'} sx={{ fontFamily: FF_BODY, fontSize: isMobile ? '0.78rem' : undefined }}>
                                                                    {v.psName || v.psNameL1 || ''}
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                    <Box>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => { setReportTarget(v); setReportReason(''); setReportFile(null); setReportOpen(true); }}
                                                            disabled={reported}
                                                            aria-label={t('report') || 'Report'}
                                                            sx={{
                                                                border: `1px solid ${reported ? 'rgba(255,255,255,0.35)' : border}`,
                                                                borderRadius: 1.5,
                                                            }}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Stack>
                        </Box>
                    ) : (
                        <Card sx={{ borderRadius: 2.2, border: `1px solid ${border}`, overflow: 'hidden', background: panelBg }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)' }}>
                                        <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.9rem', letterSpacing: '.02em' }}>{t('voter.name') || 'Name'}</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {voters.map((v: any, idx: number) => {
                                        const idKey = v.id ?? v.userId ?? v.epicId ?? v.voter_id ?? idx;
                                        const reported = reportedIds.includes(idKey);
                                        return (
                                            <TableRow key={idKey} sx={reported ? { backgroundColor: 'error.main', color: 'common.white' } : { '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)' } }}>
                                                <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        src={v.photoUrl || v.photo || undefined}
                                                        alt={v.name || v.nameEn || ''}
                                                        sx={{ bgcolor: reported ? 'rgba(255,255,255,0.16)' : undefined, color: reported ? 'common.white' : undefined, cursor: (v.photoUrl || v.photo) ? 'pointer' : 'default' }}
                                                        onClick={() => openPhotoPreview(v)}
                                                    />
                                                    <span style={{ ...(reported ? { color: '#fff' } : {}), fontFamily: FF_HEADING, fontWeight: 700 }}>{isKannada ? (v.nameKn || v.nameEn || v.name || '') : (v.nameEn || v.name || v.nameKn || '')}</span>
                                                </TableCell>
                                                <TableCell sx={{ ...(reported ? { color: 'common.white' } : {}), fontFamily: FF_HEADING, fontWeight: 600 }}>{isKannada ? (v.psNameL1 || v.psName || '') : (v.psName || v.psNameL1 || '')}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={() => { setReportTarget(v); setReportReason(''); setReportFile(null); setReportOpen(true); }} disabled={reported} aria-label={t('report') || 'Report'}>
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                    {/* Infinite scroll sentinel */}
                    <Box ref={sentinelRef} sx={{ height: 1, mb: isMobile ? 8 : 2 }} />
                    {loadingMore && (
                        <Box sx={{ textAlign: 'center', py: 2, mb: isMobile ? 8 : 2 }}>
                            <CircularProgress size={28} />
                        </Box>
                    )}
                    {!hasMore && voters.length > 0 && (
                        <Typography variant="body2" sx={{ textAlign: 'center', py: 2, mb: isMobile ? 8 : 2, color: textSecondary, fontFamily: FF_BODY }}>
                            {t('noMoreResults', { defaultValue: 'No more voters to load' })}
                        </Typography>
                    )}
                </>
            )}
            {isMobile ? (
                <Box sx={{ position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 1400 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate('/user/civic-issues')}
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontFamily: FF_BODY,
                            py: 1.25,
                            fontSize: '0.95rem',
                            color: '#fff',
                            background: 'linear-gradient(135deg, #C8180A 0%, #F5A800 100%)',
                            boxShadow: '0 6px 24px rgba(200,24,10,0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #df210f 0%, #ffbe1a 100%)',
                                boxShadow: '0 8px 30px rgba(200,24,10,0.55)',
                            },
                        }}
                    >
                        {t('userDashboard.actions.civicIssues', { defaultValue: 'Public Issues' })}
                    </Button>
                </Box>
            ) : (
                // Desktop: floating button bottom-right
                (<Box sx={{ position: 'fixed', right: 12, bottom: 24, zIndex: 1400 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/user/civic-issues')}
                        sx={{
                            borderRadius: 999,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontFamily: FF_BODY,
                            py: 0.8,
                            px: 2,
                            fontSize: '0.95rem',
                            color: '#fff',
                            background: 'linear-gradient(135deg, #C8180A 0%, #F5A800 100%)',
                            boxShadow: '0 8px 34px rgba(200,24,10,0.45)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #df210f 0%, #ffbe1a 100%)',
                                boxShadow: '0 10px 40px rgba(200,24,10,0.6)',
                                transform: 'translateY(-2px)'
                            },
                        }}
                    >
                        {t('userDashboard.actions.civicIssues', { defaultValue: 'Public Issues' })}
                    </Button>
                </Box>)
            )}
            {/* <Box sx={{ mt: 1.5 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/user/civic-issues')}
                    sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontFamily: FF_BODY,
                        py: 1.5,
                        fontSize: '0.95rem',
                        borderColor: '#F5A800',
                        color: '#F5A800',
                        '&:hover': {
                            borderColor: '#d99000',
                            bgcolor: 'rgba(245,168,0,0.08)',
                        },
                    }}
                >
                    {t('userDashboard.actions.civicIssues', { defaultValue: 'Public Issues' })}
                </Button>
            </Box> */}
            {/* Report dialog */}
            <Dialog
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                fullWidth
                maxWidth="sm"
                slotProps={{ paper: {
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }
                } }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Stack direction="row" spacing={1} sx={{
                        alignItems: "center"
                    }}>
                        <WarningIcon color="error" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {t('report') || 'Report Voter'}
                        </Typography>
                    </Stack>
                    <IconButton
                        size="small"
                        onClick={() => setReportOpen(false)}
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {/* Voter Info Card */}
                    <Card
                        elevation={0}
                        sx={{
                            mb: 3,
                            // Use the theme's paper/background color in dark mode so the card blends with dialog background,
                            // while keeping a subtle light background in light mode.
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#FFFFFF', border: '1px solid',
                            borderColor: theme.palette.mode === 'dark' ? theme.palette.divider : 'grey.200',
                            // let the dialog's normal text color apply; avoid forcing white text so contrast rules are preserved
                            color: undefined,
                            borderRadius: 2
                        }}
                    >
                        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                            <Stack direction="row" spacing={2} sx={{
                                alignItems: "center"
                            }}>
                                <Avatar
                                    src={reportTarget?.photoUrl || reportTarget?.photo || undefined}
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        bgcolor: 'primary.main'
                                    }}
                                >
                                    <PersonIcon />
                                </Avatar>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "text.secondary",
                                            fontSize: '0.75rem',
                                            mb: 0.25
                                        }}>
                                        Reporting
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                        {reportTarget ? (isKannada ? (reportTarget.nameKn || reportTarget.nameEn || reportTarget.name) : (reportTarget.nameEn || reportTarget.name || reportTarget.nameKn)) : ''}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Report Reason */}
                    <TextField
                        label={t('reportReason') || 'Report Reason'}
                        fullWidth
                        multiline
                        rows={4}
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        sx={{ mb: 3 }}
                        placeholder={t('reportReason1')}
                        required
                    />

                    {/* Attachment Section */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
                            {t('attachmentRequired') || 'Attachment (Required)'}
                        </Typography>

                        {!reportFile ? (
                            <Box>
                                <input
                                    id="report-attachment"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setReportFile(file);
                                    }}
                                />
                                <label htmlFor="report-attachment">
                                    <Button
                                        component="span"
                                        variant="outlined"
                                        startIcon={<AttachFileIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            borderStyle: 'dashed',
                                            borderWidth: 2,
                                            py: 1.5,
                                            width: '100%',
                                            '&:hover': {
                                                borderStyle: 'dashed',
                                                borderWidth: 2
                                            }
                                        }}
                                    >
                                        {t('reportAttachments') || 'Add attachment (PDF, JPEG, PNG)'}
                                    </Button>
                                </label>
                            </Box>
                        ) : (
                            <Card
                                elevation={0}
                                sx={{
                                    bgcolor: 'success.50',
                                    border: '1px solid',
                                    borderColor: 'success.200',
                                    borderRadius: 2
                                }}
                            >
                                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        sx={{
                                            alignItems: "center",
                                            justifyContent: "space-between"
                                        }}>
                                        <Stack
                                            direction="row"
                                            spacing={1.5}
                                            sx={{
                                                alignItems: "center",
                                                flex: 1,
                                                minWidth: 0
                                            }}>
                                            <AttachFileIcon color="success" sx={{ fontSize: 20 }} />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 500,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {reportFile.name}
                                            </Typography>
                                        </Stack>
                                        <IconButton
                                            size="small"
                                            onClick={() => setReportFile(null)}
                                            sx={{
                                                color: 'error.main',
                                                '&:hover': { bgcolor: 'error.50' }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        onClick={() => setReportOpen(false)}
                        sx={{
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 600
                        }}
                    >
                        {t('common.cancel') || 'Cancel'}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={submitReport}
                        disabled={submittingReport || !reportReason.trim()}
                        startIcon={submittingReport ? <CircularProgress size={16} color="inherit" /> : <ReportIcon />}
                        sx={{
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(211,47,47,0.25)',
                            '&:hover': {
                                boxShadow: '0 6px 16px rgba(211,47,47,0.35)'
                            }
                        }}
                    >
                        {submittingReport ? 'Submitting...' : (t('report') || 'Report')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Profile photo preview */}
            <Dialog
                open={photoDialogOpen}
                onClose={() => setPhotoDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 2.5, overflow: 'hidden' } } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FF_HEADING, fontWeight: 700 }}>
                    {photoDialogName || (t('menu.myProfile') || 'Profile')}
                    <IconButton size="small" onClick={() => setPhotoDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 1.5 }}>
                    <Box
                        component="img"
                        src={photoDialogSrc || ''}
                        alt={photoDialogName || 'profile'}
                        sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                    />
                </DialogContent>
            </Dialog>
            {/* Inline snackbar for feedback */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={snackbar.close} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={snackbar.close} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default WardVotersPage;
