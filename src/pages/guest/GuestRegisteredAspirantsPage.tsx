import { useEffect, useState } from 'react';
import {
    Box, Typography, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell,
    TextField, Avatar, Card, CardContent, Stack, useTheme, useMediaQuery, Pagination, Chip, InputAdornment
} from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAllAspirants } from '../../services/aspirantService';
import { BRAND } from '../../theme';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;

const GuestRegisteredAspirantsPage = () => {
    const { t, i18n } = useTranslation();
    const isKannada = (i18n.language || '').startsWith('kn');
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));



    const [aspirants, setAspirants] = useState<any[]>([]);
    const [allAspirants, setAllAspirants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;
    const border = isDark ? 'rgba(245,168,0,0.15)' : 'rgba(17,24,39,0.12)';
    const cardBg = isDark ? 'linear-gradient(160deg, #1C1010 0%, #130B0B 100%)' : theme.palette.background.paper;
    const textPrimary = theme.palette.text.primary;

    useEffect(() => {
        setLoading(true);
        setError(null);
        getAllAspirants(page, 50)
            .then((resp) => {
                const raw = Array.isArray(resp?.data?.data) ? resp.data.data : [];
                if (resp?.data?.totalPages) setTotalPages(resp.data.totalPages);
                if (resp?.data?.total) setTotal(resp.data.total);
                setAllAspirants(raw);
                setAspirants(raw);
            })
            .catch((err: any) => setError(err?.response?.data?.message || err?.message || 'Failed to load aspirants'))
            .finally(() => setLoading(false));
    }, [page]);

    useEffect(() => {
        if (!query.trim()) { setAspirants(allAspirants); return; }
        const lower = query.toLowerCase();
        setAspirants(
            allAspirants.filter((a: any) =>
                (a.name || '').toLowerCase().includes(lower) ||
                (a.party || '').toLowerCase().includes(lower) ||
                (a.electionName || '').toLowerCase().includes(lower) ||
                (a.constituencyName || '').toLowerCase().includes(lower)
            )
        );
    }, [allAspirants, query]);

    return (
        <Stack spacing={3} sx={{ fontFamily: FF_BODY }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{
                        justifyContent: "space-between",
                        alignItems: { sm: 'center' }
                    }}>
                    <Box>
                        <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: textPrimary }}>
                            {isKannada ? 'ನೋಂದಾಯಿತ ಆಕಾಂಕ್ಷಿಗಳು' : 'Registered Aspirants'}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                fontFamily: FF_BODY,
                                mt: 0.3
                            }}>
                            {isKannada ? 'ಒಟ್ಟು' : 'Total'} — {total || aspirants.length}
                        </Typography>
                    </Box>
                    <TextField
                        size="small"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={isKannada ? 'ಹೆಸರು, ಪಕ್ಷ ಹುಡುಕಿ...' : 'Search by name, party, election...'}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                        sx={{ minWidth: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </Stack>
            </motion.div>
            {/* Content */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            ) : error ? (
                <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>{error}</Typography>
            ) : aspirants.length === 0 ? (
                <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary', fontFamily: FF_BODY }}>
                    {isKannada ? 'ಆಕಾಂಕ್ಷಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No aspirants found'}
                </Typography>
            ) : isMobile ? (
                /* ── Mobile card list ── */
                (<Stack spacing={1.5}>
                    {aspirants.map((a: any, idx: number) => (
                        <motion.div key={a.id ?? idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                            <Card
                                onClick={() => a.id && navigate(`/guest/aspirants/${a.id}/view`)}
                                sx={{
                                    borderRadius: '12px', border: `1px solid ${border}`,
                                    background: cardBg, cursor: 'pointer', overflow: 'hidden',
                                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 14px rgba(17,24,39,0.06)',
                                    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                                    position: 'relative',
                                    '&::before': {
                                        content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                                        background: `linear-gradient(180deg, ${BRAND.red} 0%, ${BRAND.yellow} 55%, ${BRAND.brown} 100%)`,
                                    },
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: isDark ? '0 14px 36px rgba(0,0,0,0.6)' : '0 10px 28px rgba(17,24,39,0.12)',
                                        borderColor: isDark ? 'rgba(245,168,0,0.35)' : 'rgba(245,168,0,0.4)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 1.5, pl: 2.5 }}>
                                    <Stack direction="row" spacing={1.5} sx={{
                                        alignItems: "center"
                                    }}>
                                        <Box sx={{
                                            p: '2px', borderRadius: '50%', flexShrink: 0,
                                            background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red} 180deg 270deg, ${BRAND.yellow} 270deg 360deg)`,
                                        }}>
                                            <Avatar
                                                src={a.selfieUrl || undefined}
                                                alt={a.name || ''}
                                                sx={{ width: 46, height: 46, bgcolor: isDark ? '#1C1010' : '#fff', color: GOLD, fontWeight: 700, border: `2px solid ${isDark ? '#1C1010' : '#fff'}` }}
                                            >
                                                {!a.selfieUrl && (a.name ? a.name.charAt(0).toUpperCase() : <PersonIcon fontSize="small" />)}
                                            </Avatar>
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.95rem', color: textPrimary }}>
                                                {a.name || ''}
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                spacing={0.6}
                                                sx={{
                                                    flexWrap: "wrap",
                                                    mt: 0.4
                                                }}>
                                                <Chip label={a.party || 'Independent'} size="small" sx={{ fontSize: '0.68rem', height: 18, fontFamily: FF_HEADING, bgcolor: 'rgba(245,168,0,0.12)', color: GOLD, border: '1px solid rgba(245,168,0,0.25)' }} />
                                            </Stack>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "text.secondary",
                                                    fontFamily: FF_BODY,
                                                    display: 'block',
                                                    mt: 0.3,
                                                    lineHeight: 1.3
                                                }}>
                                                {a.electionName || ''}{a.constituencyName ? ` · ${a.constituencyName}` : ''}
                                            </Typography>
                                        </Box>
                                        <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: '1.2rem', flexShrink: 0 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </Stack>)
            ) : (
                /* ── Desktop table ── */
                (<Card sx={{ borderRadius: '14px', border: `1px solid ${border}`, background: cardBg, overflow: 'hidden', boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.45)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: isDark ? 'rgba(245,168,0,0.06)' : 'rgba(245,168,0,0.04)' }}>
                                <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.85rem', color: GOLD, borderBottom: `1px solid ${border}` }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.85rem', color: GOLD, borderBottom: `1px solid ${border}` }}>{isKannada ? 'ಹೆಸರು' : 'Name'}</TableCell>
                                <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.85rem', color: GOLD, borderBottom: `1px solid ${border}` }}>{isKannada ? 'ಪಕ್ಷ' : 'Party'}</TableCell>
                                <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.85rem', color: GOLD, borderBottom: `1px solid ${border}` }}>{isKannada ? 'ಚುನಾವಣೆ' : 'Election'}</TableCell>
                                <TableCell sx={{ fontWeight: 800, fontFamily: FF_HEADING, fontSize: '0.85rem', color: GOLD, borderBottom: `1px solid ${border}` }}>{isKannada ? 'ಕ್ಷೇತ್ರ' : 'Constituency'}</TableCell>
                                <TableCell sx={{ borderBottom: `1px solid ${border}` }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {aspirants.map((a: any, idx: number) => (
                                <TableRow
                                    key={a.id ?? idx}
                                    onClick={() => a.id && navigate(`/guest/aspirants/${a.id}/view`)}
                                    sx={{
                                        cursor: 'pointer',
                                        borderBottom: `1px solid ${border}`,
                                        '&:hover': { bgcolor: isDark ? 'rgba(245,168,0,0.05)' : 'rgba(245,168,0,0.03)' },
                                        '&:last-child td': { border: 0 },
                                    }}
                                >
                                    <TableCell sx={{ color: 'text.secondary', fontFamily: FF_HEADING, fontSize: '0.82rem' }}>
                                        {(page - 1) * 50 + idx + 1}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1.5} sx={{
                                            alignItems: "center"
                                        }}>
                                            <Box sx={{
                                                p: '2px', borderRadius: '50%',
                                                background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red} 180deg 270deg, ${BRAND.yellow} 270deg 360deg)`,
                                            }}>
                                                <Avatar
                                                    src={a.selfieUrl || undefined}
                                                    alt={a.name || ''}
                                                    sx={{ width: 34, height: 34, bgcolor: isDark ? '#1C1010' : '#fff', color: GOLD, fontWeight: 700, border: `2px solid ${isDark ? '#1C1010' : '#fff'}`, fontSize: '0.85rem' }}
                                                >
                                                    {!a.selfieUrl && (a.name ? a.name.charAt(0).toUpperCase() : <PersonIcon sx={{ fontSize: '1rem' }} />)}
                                                </Avatar>
                                            </Box>
                                            <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.9rem', color: textPrimary }}>{a.name || ''}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: FF_HEADING, fontSize: '0.88rem' }}>
                                        <Chip label={a.party || 'Independent'} size="small" sx={{ fontSize: '0.68rem', height: 20, fontFamily: FF_HEADING, bgcolor: 'rgba(245,168,0,0.1)', color: GOLD, border: '1px solid rgba(245,168,0,0.22)' }} />
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: FF_HEADING, fontSize: '0.88rem', color: 'text.secondary' }}>{a.electionName || ''}</TableCell>
                                    <TableCell sx={{ fontFamily: FF_HEADING, fontSize: '0.88rem', color: 'text.secondary' }}>{a.constituencyName || ''}</TableCell>
                                    <TableCell sx={{ width: 32, p: 0.5 }}><ChevronRightIcon sx={{ color: 'text.disabled', fontSize: '1.1rem' }} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>)
            )}
            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => { setPage(value); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            )}
        </Stack>
    );
};

export default GuestRegisteredAspirantsPage;
