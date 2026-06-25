import React, { useEffect, useState } from 'react';
import {
    Box, Typography, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell,
    TextField, Avatar, Card, CardContent, Stack, useTheme, useMediaQuery, Chip, Pagination
} from '@mui/material';
import { Person as PersonIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAllAspirants } from '../services/aspirantService';

const PAGE_SIZE = 50;

const RegisteredAspirantsPage: React.FC = () => {
    const { i18n } = useTranslation();
    const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
    const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
    const FF = FF_BODY;
    const isKannada = (i18n.language || '').startsWith('kn');

    const [aspirants, setAspirants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const border = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(17,24,39,0.14)';
    const panelBg = theme.palette.mode === 'dark'
        ? 'linear-gradient(155deg, rgba(20,24,34,0.95) 0%, rgba(13,17,28,0.96) 100%)'
        : 'linear-gradient(155deg, #FFFFFF 0%, #F8FAFC 100%)';
    const textPrimary = theme.palette.text.primary;
    const textSecondary = theme.palette.text.secondary;

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    // Fetch aspirants — server-side pagination and search
    useEffect(() => {
        setLoading(true);
        setError(null);
        getAllAspirants(page, PAGE_SIZE, debouncedQuery || undefined)
            .then((resp: any) => {
                const raw = Array.isArray(resp?.data?.data) ? resp.data.data : [];
                setTotalPages(resp?.data?.totalPages ?? 1);
                setTotal(resp?.data?.total ?? raw.length);
                setAspirants(raw);
            })
            .catch((err: any) => setError(err?.response?.data?.message || err?.message || 'Failed to load aspirants'))
            .finally(() => setLoading(false));
    }, [page, debouncedQuery]);

    return (
        <Box sx={{ p: { xs: 1.25, sm: 2.5 } }}>
            {/* Header card */}
            <Card sx={{ mb: 2.2, borderRadius: 2.5, background: panelBg, border: `1px solid ${border}`, boxShadow: theme.palette.mode === 'dark' ? '0 18px 40px rgba(0,0,0,0.35)' : '0 10px 24px rgba(17,24,39,0.08)' }}>
                <Box sx={{ display: 'flex', height: 4 }}>
                    {['#C8180A', '#253A9A', '#6B3A00'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
                </Box>
                <CardContent sx={{ p: { xs: 1.5, sm: 2.2 }, '&:last-child': { pb: { xs: 1.5, sm: 2.2 } } }}>
                    <Stack spacing={1.35}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', sm: '2rem' }, color: textPrimary }}>
                                {isKannada ? 'ನೋಂದಾಯಿತ ಆಕಾಂಕ್ಷಿಗಳು' : 'Registered Aspirants'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.4, color: textSecondary, fontFamily: FF_BODY }}>
                                {isKannada ? 'ಒಟ್ಟು ಆಕಾಂಕ್ಷಿಗಳು' : 'Total Aspirants'} — {total || aspirants.length}
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            size="small"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={isKannada ? 'ಹೆಸರಿನ ಮೂಲಕ ಹುಡುಕಿ' : 'Search by name'}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
            ) : aspirants.length === 0 ? (
                <Typography sx={{ textAlign: 'center', py: 6, color: textSecondary, fontFamily: FF_BODY }}>
                    {isKannada ? 'ಆಕಾಂಕ್ಷಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No aspirants found'}
                </Typography>
            ) : (
                <>
                    {isMobile ? (
                        <Stack spacing={1.4}>
                            {aspirants.map((a: any, idx: number) => (
                                <Card
                                    key={a.id ?? idx}
                                    onClick={() => a.id && navigate(`/user/aspirants/${a.id}/view`)}
                                    sx={{
                                        borderRadius: 2,
                                        border: `1px solid ${border}`,
                                        borderLeft: '4px solid #253A9A',
                                        boxShadow: theme.palette.mode === 'dark' ? '0 8px 20px rgba(0,0,0,0.3)' : '0 4px 14px rgba(17,24,39,0.06)',
                                        cursor: 'pointer',
                                        transition: 'box-shadow 0.2s, transform 0.15s',
                                        '&:hover': { boxShadow: theme.palette.mode === 'dark' ? '0 12px 30px rgba(0,0,0,0.5)' : '0 8px 24px rgba(17,24,39,0.14)', transform: 'translateY(-1px)' },
                                    }}
                                >
                                    <CardContent sx={{ p: 1.25 }}>
                                        <Stack direction="row" spacing={1.5} sx={{
                                            alignItems: "center"
                                        }}>
                                            <Avatar
                                                src={a.selfieUrl || undefined}
                                                alt={a.name || ''}
                                                sx={{ width: 48, height: 48, bgcolor: 'primary.100' }}
                                            >
                                                {!a.selfieUrl && (a.name ? a.name.charAt(0).toUpperCase() : <PersonIcon />)}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: FF_HEADING, fontSize: '0.95rem' }}>
                                                    {a.name || ''}
                                                </Typography>
                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    sx={{
                                                        flexWrap: "wrap",
                                                        mt: 0.4
                                                    }}>
                                                    <Chip label={a.party || 'Independent'} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                                                </Stack>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "text.secondary",
                                                        fontFamily: FF_BODY,
                                                        display: 'block',
                                                        mt: 0.3
                                                    }}>
                                                    {a.electionName || ''}{a.constituencyName ? ` · ${a.constituencyName}` : ''}
                                                </Typography>
                                            </Box>
                                            <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: '1.2rem' }} />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Card sx={{ borderRadius: 2.2, border: `1px solid ${border}`, overflow: 'hidden', background: panelBg }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)' }}>
                                        <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.9rem' }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.9rem' }}>{isKannada ? 'ಹೆಸರು' : 'Name'}</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.9rem' }}>{isKannada ? 'ಪಕ್ಷ' : 'Party'}</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.9rem' }}>{isKannada ? 'ಚುನಾವಣೆ' : 'Election'}</TableCell>
                                        <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.9rem' }}>{isKannada ? 'ಕ್ಷೇತ್ರ' : 'Constituency'}</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {aspirants.map((a: any, idx: number) => (
                                        <TableRow
                                            key={a.id ?? idx}
                                            onClick={() => a.id && navigate(`/user/aspirants/${a.id}/view`)}
                                            sx={{ cursor: 'pointer', '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(37,58,154,0.12)' : 'rgba(37,58,154,0.04)' } }}
                                        >
                                            <TableCell sx={{ color: textSecondary, fontFamily: FF_HEADING, fontSize: '0.82rem' }}>
                                                {(page - 1) * PAGE_SIZE + idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} sx={{
                                                    alignItems: "center"
                                                }}>
                                                    <Avatar
                                                        src={a.selfieUrl || undefined}
                                                        alt={a.name || ''}
                                                        sx={{ width: 36, height: 36 }}
                                                    >
                                                        {!a.selfieUrl && (a.name ? a.name.charAt(0).toUpperCase() : <PersonIcon fontSize="small" />)}
                                                    </Avatar>
                                                    <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.9rem' }}>{a.name || ''}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: FF_HEADING, fontSize: '0.88rem' }}>{a.party || 'Independent'}</TableCell>
                                            <TableCell sx={{ fontFamily: FF_HEADING, fontSize: '0.88rem' }}>{a.electionName || ''}</TableCell>
                                            <TableCell sx={{ fontFamily: FF_HEADING, fontSize: '0.88rem' }}>{a.constituencyName || ''}</TableCell>
                                            <TableCell sx={{ width: 32, p: 0.5 }}><ChevronRightIcon sx={{ color: 'text.disabled', fontSize: '1.1rem' }} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, value) => { setPage(value); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                color="primary"
                                shape="rounded"
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default RegisteredAspirantsPage;
