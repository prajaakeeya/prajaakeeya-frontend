import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Avatar, Card, CardContent,
    Stack, Chip, Divider, Button, Grid, useTheme, useMediaQuery,
    Tooltip, LinearProgress, Dialog, IconButton as MuiIconButton,
    Alert
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Work as WorkIcon,
    LocationOn as LocationOnIcon,
    Phone as PhoneIcon,
    HowToVote as HowToVoteIcon,
    Star as StarIcon,
    StarHalf as StarHalfIcon,
    StarBorder as StarBorderIcon,
    Event as EventIcon,
    Place as PlaceIcon,
    Groups as GroupsIcon,
    Verified as VerifiedIcon,
    Description as DescriptionIcon,
    Close as CloseIcon,
    Share as ShareIcon,
    Visibility as VisibilityIcon,
    InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getAspirantById } from '../services/aspirantService';
import { BRAND } from '../theme';
import SopAgreementCard from '../components/aspirant/SopAgreementCard';
import { safeUrl } from '../utils/safeUrl';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
// blocking handoff to native apps (Instagram, Facebook, etc.). Navigate the current
// window instead — iOS then hands the URL off to the right app.
const openExternal = (url: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    // C-SEC-4: never navigate to a script-capable URL (javascript:/data:/...)
    // saved by an aspirant. safeUrl returns the URL unchanged when safe, or
    // null when dangerous — in which case we simply do nothing.
    const safe = safeUrl(url);
    if (!safe) return;
    const isStandalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true;
    if (isStandalone) window.location.href = safe;
    else window.open(safe, '_blank', 'noopener,noreferrer');
};

const StarRating: React.FC<{ value: number; total?: number }> = ({ value, total = 5 }) => {
    const stars = [];
    for (let i = 1; i <= total; i++) {
        if (value >= i) stars.push(<StarIcon key={i} sx={{ fontSize: '1.1rem', color: '#F5A800' }} />);
        else if (value >= i - 0.5) stars.push(<StarHalfIcon key={i} sx={{ fontSize: '1.1rem', color: '#F5A800' }} />);
        else stars.push(<StarBorderIcon key={i} sx={{ fontSize: '1.1rem', color: '#F5A800' }} />);
    }
    return (
        <Stack direction="row" spacing={0.2} sx={{
            alignItems: "center"
        }}>{stars}</Stack>
    );
};

const InfoTile: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    return (
        <Box sx={{
            p: 1, borderRadius: 2.5,
            background: isDark
                ? 'linear-gradient(135deg, rgba(37,58,154,0.18) 0%, rgba(245,168,0,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(37,58,154,0.05) 0%, rgba(245,168,0,0.05) 100%)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(17,24,39,0.09)'}`,
            borderLeft: `3px solid ${isDark ? BRAND.yellow : BRAND.saffron}`,
        }}>
            <Stack direction="row" spacing={1.2} sx={{
                alignItems: "center"
            }}>
                <Box sx={{ color: isDark ? BRAND.yellow : BRAND.saffron, display: 'flex' }}>{icon}</Box>
                <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontFamily: FF_HEADING, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontFamily: FF_BODY, fontWeight: 700, color: 'text.primary', lineHeight: 1.2, mt: 0.2 }}>{value}</Typography>
                </Box>
            </Stack>
        </Box>
    );
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    return (
        <Stack
            direction="row"
            spacing={1.2}
            sx={{
                alignItems: "center",
                mb: 1.8
            }}>
            <Box sx={{
                width: 36, height: 36, borderRadius: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${BRAND.saffron} 0%, ${BRAND.yellow} 100%)`,
                color: '#fff', boxShadow: '0 4px 12px rgba(200,24,10,0.25)'
            }}>{icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: FF_HEADING, letterSpacing: '-0.01em', color: isDark ? '#FFD27A' : '#B45309' }}>
                {title}
            </Typography>
        </Stack>
    );
};

const RatingBar: React.FC<{ label: string; count: number; total: number; color: string }> = ({ label, count, total, color }) => (
    <Stack direction="row" spacing={1} sx={{
        alignItems: "center"
    }}>
        <Typography sx={{ fontSize: '0.78rem', fontFamily: FF_HEADING, fontWeight: 600, minWidth: 14, color: 'text.secondary' }}>{label}</Typography>
        <LinearProgress
            variant="determinate"
            value={total > 0 ? (count / total) * 100 : 0}
            sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.08)', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }}
        />
        <Typography sx={{ fontSize: '0.78rem', fontFamily: FF_HEADING, minWidth: 18, color: 'text.secondary', textAlign: 'right' }}>{count}</Typography>
    </Stack>
);

const AspirantViewDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isKannada = (i18n.language || '').startsWith('kn');
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [aspirant, setAspirant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [photoOpen, setPhotoOpen] = useState(false);
    const [pdfViewUrl, setPdfViewUrl] = useState<string | null>(null);

    const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(17,24,39,0.1)';
    const cardBg = isDark
        ? 'linear-gradient(160deg, rgba(20,24,34,0.97) 0%, rgba(13,17,28,0.98) 100%)'
        : 'linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)';

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getAspirantById(Number(id))
            .then((resp) => setAspirant(resp?.data))
            .catch((err: any) => setError(err?.response?.data?.message || err?.message || 'Failed to load'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
        </Box>
    );

    if (error || !aspirant) return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" sx={{ mb: 2 }}>{error || 'Aspirant not found'}</Typography>
            <Button variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
        </Box>
    );

    const rating = aspirant.overallRating;
    const avgRating = rating?.averageRating ?? 0;
    const totalRatings = rating?.totalRatings ?? 0;
    const dist = rating?.distribution ?? {};


    // Render SOP as a signed agreement card whenever the aspirant has agreed
    // OR has a legacy uploaded sopUrl — both flows mean "this person committed
    // to the SOP", so the digital-signature card is a better presentation than
    // a raw PDF link.
    const hasSopRecord = Boolean(aspirant.sopAgreed || aspirant.sopUrl);

    const docs = [
        { label: 'SOP (Kannada)', url: aspirant.sopKannadaUrl, status: aspirant.sopKannadaStatus },
        { label: 'Agreement', url: aspirant.agreementUrl, status: aspirant.agreementStatus },
        { label: 'Property Declaration', url: aspirant.propertyDeclarationUrl, status: aspirant.propertyDeclarationStatus },
        { label: 'Code of Conduct', url: aspirant.codeOfConductUrl, status: aspirant.codeOfConductStatus },
        { label: 'Resume', url: aspirant.resumeUrl, status: aspirant.resumeStatus },
        { label: 'EPIC Card (Front)', url: aspirant.epicCardUrl, status: aspirant.epicCardStatus },
        { label: 'EPIC Card (Back)', url: aspirant.epicCardBackUrl, status: aspirant.epicCardBackStatus },
        { label: 'Address Proof', url: aspirant.addressProofUrl, status: aspirant.addressProofStatus },
        { label: 'Recent Photo', url: aspirant.recentPhotoUrl, status: aspirant.recentPhotoStatus },

    ].filter((d) => d.url);

    const formatTs = (ts: string | number | null | undefined) => {
        if (!ts) return '';
        const d = new Date(Number(ts));
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const statusColor = aspirant.status === 'approved' ? '#22c55e' : aspirant.status === 'rejected' ? '#ef4444' : '#f59e0b';

    return (
        <Box sx={{ p: { xs: 1.25, sm: 2.5 }, maxWidth: 900, mx: 'auto' }}>
            {/* ── HERO CARD ─────────────────────────────────── */}
            <Card sx={{
                mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, overflow: 'hidden',
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 12px 40px rgba(17,24,39,0.12)',
            }}>
                {/* Gradient banner */}
                <Box sx={{
                    height: { xs: 50, sm: 75 },
                    background: isDark
                        ? 'radial-gradient(130% 200% at 0% 0%, rgba(200,24,10,0.45) 0%, rgba(37,58,154,0.45) 55%, rgba(13,17,28,1) 100%)'
                        : 'linear-gradient(135deg, rgba(200,24,10,0.85) 0%, rgba(37,58,154,0.85) 60%, rgba(107,58,0,0.8) 100%)',
                    position: 'relative',
                }}>
                    {/* Decorative strip */}
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', height: 4 }}>
                        {['#C8180A', '#253A9A', '#6B3A00', '#F5A800'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
                    </Box>
                </Box>

                <CardContent sx={{ pt: 0, pb: '14px !important', px: { xs: 1.5, sm: 2.5 }, position: 'relative' }}>
                    {/* Mobile-only rating — top right corner */}
                    {totalRatings > 0 && (
                        <Box sx={{
                            display: { xs: 'flex', sm: 'none' },
                            flexDirection: 'row', alignItems: 'center', gap: '3.2px',
                            position: 'absolute', top: -7, right: 18, zIndex: 1,
                        }}>
                            <StarIcon sx={{ fontSize: '1rem', color: '#F5A800' }} />
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: FF_HEADING, lineHeight: 1, color: '#F5A800' }}>
                                {avgRating.toFixed(1)}
                            </Typography>
                        </Box>
                    )}
                    {/* Avatar overlapping banner */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 0.8, sm: 2 }}
                        sx={{
                            alignItems: { xs: 'center', sm: 'stretch' },
                            mt: { xs: -3.5, sm: -4.5 }
                        }}>
                        <Avatar
                            src={aspirant.selfieUrl || aspirant.recentPhotoUrl || undefined}
                            alt={aspirant.name || ''}
                            onClick={() => (aspirant.selfieUrl || aspirant.recentPhotoUrl) && setPhotoOpen(true)}
                            sx={{
                                width: { xs: 64, sm: 100 }, height: { xs: 64, sm: 100 },
                                border: `3px solid ${isDark ? '#1a1f2e' : '#ffffff'}`,
                                boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
                                fontSize: '1.6rem', fontWeight: 800,
                                background: 'linear-gradient(135deg, #C8180A 0%, #253A9A 100%)',
                                color: '#fff',
                                cursor: (aspirant.selfieUrl || aspirant.recentPhotoUrl) ? 'pointer' : 'default',
                            }}
                        >
                            {!aspirant.selfieUrl && (aspirant.name ? aspirant.name.charAt(0).toUpperCase() : <PersonIcon sx={{ fontSize: '1.6rem' }} />)}
                        </Avatar>

                        <Box sx={{ flex: 1, pb: { sm: 0.5 }, textAlign: { xs: 'center', sm: 'left' } }}>
                            {/* Row 1: Name + verified + party chip */}
                            <Stack
                                direction="row"
                                spacing={0.8}
                                sx={{
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    justifyContent: { xs: 'center', sm: 'flex-start' }
                                }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: FF_HEADING, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                    {aspirant.name || ''}
                                </Typography>
                                {aspirant.status === 'approved' && (
                                    <Tooltip title="Verified Aspirant">
                                        <VerifiedIcon sx={{ color: '#22c55e', fontSize: '1.3rem', flexShrink: 0 }} />
                                    </Tooltip>
                                )}
                                <Chip
                                    label={aspirant.party || 'Independent'}
                                    size="small"
                                    sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.68rem', height: 20, bgcolor: isDark ? 'rgba(245,168,0,0.18)' : 'rgba(245,168,0,0.14)', color: isDark ? '#F5A800' : '#92400e', border: `1px solid ${isDark ? 'rgba(245,168,0,0.4)' : 'rgba(245,168,0,0.3)'}` }}
                                />
                            </Stack>
                            {/* Row 2: Election chip */}
                            {(aspirant.electionName || aspirant.isDemo) && (
                                <Stack
                                    direction="row"
                                    sx={{
                                        justifyContent: { xs: 'center', sm: 'flex-start' },
                                        mt: { xs: 0.5, sm: 3 }
                                    }}>
                                    <Chip
                                        icon={<HowToVoteIcon sx={{ fontSize: '0.85rem !important' }} />}
                                        label={aspirant.electionName || 'Demo Election 2026'}
                                        size="small"
                                        sx={{ fontFamily: FF_HEADING, fontWeight: 600, fontSize: '0.66rem', height: 20, bgcolor: isDark ? 'rgba(37,58,154,0.25)' : 'rgba(37,58,154,0.08)', color: isDark ? '#93c5fd' : '#1e3a8a' }}
                                    />
                                </Stack>
                            )}
                            {/* Row 3: Location */}
                            {(aspirant.constituencyName || aspirant.isDemo) && (
                                <Stack
                                    direction="row"
                                    spacing={0.4}
                                    sx={{
                                        alignItems: "center",
                                        justifyContent: { xs: 'center', sm: 'flex-start' },
                                        mt: 0.4
                                    }}>
                                    <LocationOnIcon sx={{ fontSize: '0.8rem', color: 'text.secondary' }} />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "text.secondary",
                                            fontFamily: FF_BODY,
                                            fontWeight: 600
                                        }}>{aspirant.constituencyName || 'Demo Constituency'}</Typography>
                                </Stack>
                            )}
                        </Box>

                        {/* Overall Rating — right side, desktop only */}
                        {totalRatings > 0 && (
                            <Box sx={{
                                display: { xs: 'none', sm: 'flex' },
                                flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                                flexShrink: 0, minWidth: 90, alignSelf: 'flex-end', pb: 1,
                            }}>
                                <Typography sx={{ fontSize: '2rem', fontWeight: 900, fontFamily: FF_HEADING, lineHeight: 1, color: '#F5A800' }}>
                                    {avgRating.toFixed(1)}
                                </Typography>
                                <StarRating value={avgRating} />
                            </Box>
                        )}

                    </Stack>


                </CardContent>
            </Card>
            {/* Photo popup */}
            <Dialog open={photoOpen} onClose={() => setPhotoOpen(false)} maxWidth="sm" fullWidth
                slotProps={{
                    paper: { sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'visible' } },
                    backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.88)' } }
                }}
            >
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <MuiIconButton
                        onClick={() => setPhotoOpen(false)}
                        sx={{ position: 'absolute', top: -16, right: -16, bgcolor: isDark ? '#1a1f2e' : '#fff', border: `2px solid ${BRAND.yellow}`, zIndex: 1, '&:hover': { bgcolor: isDark ? '#252a3a' : '#f5f5f5' } }}
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </MuiIconButton>
                    <Box
                        component="img"
                        src={aspirant?.selfieUrl || aspirant?.recentPhotoUrl}
                        alt={aspirant?.name || ''}
                        sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 3, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
                    />
                </Box>
            </Dialog>
            {/* ── PERSONAL INFO ─────────────────────────────── */}
            <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: '16px !important' } }}>
                    <SectionHeader icon={<PersonIcon fontSize="small" />} title={isKannada ? 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ' : 'Personal Information'} />
                    <Grid container spacing={1.5}>
                        {aspirant.age && <Grid
                            size={{
                                xs: 6,
                                sm: 4,
                                md: 3
                            }}><InfoTile icon={<PersonIcon fontSize="small" />} label={isKannada ? 'ವಯಸ್ಸು' : 'Age'} value={`${aspirant.age} yrs`} /></Grid>}
                        {aspirant.gender && <Grid
                            size={{
                                xs: 6,
                                sm: 4,
                                md: 3
                            }}><InfoTile icon={<PersonIcon fontSize="small" />} label={isKannada ? 'ಲಿಂಗ' : 'Gender'} value={aspirant.gender} /></Grid>}
                        {aspirant.education && <Grid
                            size={{
                                xs: 6,
                                sm: 4,
                                md: 3
                            }}><InfoTile icon={<SchoolIcon fontSize="small" />} label={isKannada ? 'ಶಿಕ್ಷಣ' : 'Education'} value={aspirant.education} /></Grid>}
                        {aspirant.occupation && <Grid
                            size={{
                                xs: 6,
                                sm: 4,
                                md: 3
                            }}><InfoTile icon={<WorkIcon fontSize="small" />} label={isKannada ? 'ವೃತ್ತಿ' : 'Occupation'} value={aspirant.occupation} /></Grid>}
                        {aspirant.address && <Grid
                            size={{
                                xs: 12,
                                sm: 8
                            }}><InfoTile icon={<LocationOnIcon fontSize="small" />} label={isKannada ? 'ವಿಳಾಸ' : 'Address'} value={aspirant.address} /></Grid>}
                        {/* Show when the value is present. The backend strips phone/whatsapp for
                            non-owners when the allow* flag is off, and returns it to the owner
                            regardless — so presence-based display lets the owner see their own. */}
                        {aspirant.phone && <Grid
                            size={{
                                xs: 6,
                                sm: 4
                            }}><InfoTile icon={<PhoneIcon fontSize="small" />} label={isKannada ? 'ಫೋನ್' : 'Phone'} value={aspirant.phone} /></Grid>}
                        {aspirant.whatsappNumber && <Grid
                            size={{
                                xs: 6,
                                sm: 4
                            }}><InfoTile icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#25D366" /><path d="M16.6 14.2c-.3-.15-1.7-.85-2-.95-.3-.1-.5-.15-.7.15-.2.3-.75.95-.9 1.15-.15.2-.35.2-.65.05-.3-.15-1.25-.45-2.4-1.45-.9-.8-1.5-1.75-1.65-2.05-.15-.3 0-.45.15-.6.1-.1.25-.3.35-.45.1-.15.15-.25.2-.4.05-.15.05-.3-.05-.45-.1-.15-.7-1.7-.95-2.3-.25-.6-.5-.5-.7-.5h-.6c-.2 0-.5.05-.75.35-.25.3-1 1-1 2.4s1 2.8 1.15 3c.15.2 2 3.05 4.85 4.3.7.3 1.2.45 1.65.6.7.2 1.3.2 1.8.1.55-.1 1.7-.7 1.95-1.35.25-.65.25-1.2.15-1.35-.1-.15-.3-.2-.6-.35z" fill="white" /></svg>} label="WhatsApp" value={aspirant.whatsappNumber} /></Grid>}
                    </Grid>
                </CardContent>
            </Card>
            {/* ── MANIFESTO ─────────────────────────────────── */}
            {aspirant.manifesto && (
                <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <SectionHeader icon={<DescriptionIcon fontSize="small" />} title={isKannada ? ' ನನ್ನ ಬಗ್ಗೆ' : 'About me'} />
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.03)', border: `1px solid ${border}`, borderLeft: `4px solid ${isDark ? BRAND.yellow : BRAND.saffron}` }}>
                            <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.95rem', lineHeight: 1.75, color: 'text.primary', whiteSpace: 'pre-line' }}>
                                {aspirant.manifesto}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}
            {/* ── SOCIAL PLATFORMS ─────────────────────────── */}
            {(aspirant.instagramLink || aspirant.facebookLink || aspirant.linkedinLink || aspirant.twitterLink) && (
                <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <SectionHeader icon={<ShareIcon fontSize="small" />} title={isKannada ? 'ಸಾಮಾಜಿಕ ವೇದಿಕೆಗಳು' : 'Social Platforms'} />
                        <Alert
                            severity="info"
                            icon={<InfoOutlinedIcon fontSize="small" sx={{ color: isDark ? '#FFCB00' : '#dc2626' }} />}
                            sx={{
                                borderRadius: '10px',
                                mb: 1.5,
                                mt: 0.5,
                                ...(isDark
                                    ? {
                                        color: '#FFCB00',
                                        backgroundColor: 'rgba(255,203,0,0.08)',
                                        border: '1px solid rgba(255,203,0,0.25)',
                                        '& .MuiAlert-icon': { color: '#FFCB00' },
                                      }
                                    : {
                                        color: '#dc2626',
                                        backgroundColor: 'rgba(220,38,38,0.06)',
                                        border: '1px solid rgba(220,38,38,0.25)',
                                        '& .MuiAlert-icon': { color: '#dc2626' },
                                      }),
                                '& .MuiAlert-message': { fontSize: '0.82rem' },
                            }}
                        >
                            {t('pages.wardCandidates.profileDisclaimer')}
                        </Alert>
                        <Grid container spacing={1.2} sx={{ mt: 0.5 }}>
                            {aspirant.instagramLink && (
                                <Grid
                                    size={{
                                        xs: 6,
                                        sm: 3
                                    }}>
                                    <Box
                                        component="a"
                                        href={safeUrl(aspirant.instagramLink) ?? undefined}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => openExternal(aspirant.instagramLink!, e)}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7, textDecoration: 'none', px: 1.2, py: 0.7, borderRadius: '10px', border: '1px solid rgba(225,48,108,0.6)', background: 'rgba(225,48,108,0.08)', '&:hover': { background: 'rgba(225,48,108,0.16)' } }}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <radialGradient id="ig-grad-avd" cx="30%" cy="107%" r="150%">
                                                    <stop offset="0%" stopColor="#fdf497" />
                                                    <stop offset="5%" stopColor="#fdf497" />
                                                    <stop offset="45%" stopColor="#fd5949" />
                                                    <stop offset="60%" stopColor="#d6249f" />
                                                    <stop offset="90%" stopColor="#285AEB" />
                                                </radialGradient>
                                            </defs>
                                            <rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="url(#ig-grad-avd)" />
                                            <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" fill="none" />
                                            <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
                                        </svg>
                                        <Typography variant="body2" sx={{ fontFamily: FF_HEADING, color: '#E1306C', fontWeight: 600 }}>Instagram</Typography>
                                    </Box>
                                </Grid>
                            )}
                            {aspirant.facebookLink && (
                                <Grid
                                    size={{
                                        xs: 6,
                                        sm: 3
                                    }}>
                                    <Box
                                        component="a"
                                        href={safeUrl(aspirant.facebookLink) ?? undefined}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => openExternal(aspirant.facebookLink!, e)}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7, textDecoration: 'none', px: 1.2, py: 0.7, borderRadius: '10px', border: '1px solid rgba(24,119,242,0.6)', background: 'rgba(24,119,242,0.08)', '&:hover': { background: 'rgba(24,119,242,0.16)' } }}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="12" fill="#1877F2" />
                                            <path d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10H15.5L15.2 12.5H13V19H10.5V12.5H9V10H10.5V8.5C10.5 6.6 11.6 5.5 13.5 5.5H15.5V8Z" fill="white" />
                                        </svg>
                                        <Typography variant="body2" sx={{ fontFamily: FF_HEADING, color: '#1877F2', fontWeight: 600 }}>Facebook</Typography>
                                    </Box>
                                </Grid>
                            )}
                            {aspirant.linkedinLink && (
                                <Grid
                                    size={{
                                        xs: 6,
                                        sm: 3
                                    }}>
                                    <Box
                                        component="a"
                                        href={safeUrl(aspirant.linkedinLink) ?? undefined}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => openExternal(aspirant.linkedinLink!, e)}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7, textDecoration: 'none', px: 1.2, py: 0.7, borderRadius: '10px', border: '1px solid rgba(10,102,194,0.6)', background: 'rgba(10,102,194,0.08)', '&:hover': { background: 'rgba(10,102,194,0.16)' } }}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="12" fill="#0A66C2" />
                                            <path d="M8.5 10H6.5V17.5H8.5V10ZM7.5 9C8.05 9 8.5 8.55 8.5 8C8.5 7.45 8.05 7 7.5 7C6.95 7 6.5 7.45 6.5 8C6.5 8.55 6.95 9 7.5 9ZM17.5 17.5H15.5V13.75C15.5 12.9 14.85 12.25 14 12.25C13.15 12.25 12.5 12.9 12.5 13.75V17.5H10.5V10H12.5V11.05C12.97 10.4 13.78 10 14.5 10C16.16 10 17.5 11.34 17.5 13V17.5Z" fill="white" />
                                        </svg>
                                        <Typography variant="body2" sx={{ fontFamily: FF_HEADING, color: '#0A66C2', fontWeight: 600 }}>LinkedIn</Typography>
                                    </Box>
                                </Grid>
                            )}
                            {aspirant.twitterLink && (
                                <Grid
                                    size={{
                                        xs: 6,
                                        sm: 3
                                    }}>
                                    <Box
                                        component="a"
                                        href={safeUrl(aspirant.twitterLink) ?? undefined}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => openExternal(aspirant.twitterLink!, e)}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7, textDecoration: 'none', px: 1.2, py: 0.7, borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', '&:hover': { background: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.1)' } }}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="12" fill={isDark ? '#ffffff' : '#000000'} />
                                            <path d="M13.6 10.8L17.7 6H16.7L13.2 10.2L10.4 6H7L11.3 12.7L7 17.8H8L11.7 13.4L14.6 17.8H18L13.6 10.8ZM12.2 12.8L11.8 12.2L8.4 6.8H10L12.5 10.5L12.9 11.1L16.7 17.1H15L12.2 12.8Z" fill={isDark ? '#000000' : '#ffffff'} />
                                        </svg>
                                        <Typography variant="body2" sx={{ fontFamily: FF_HEADING, color: isDark ? '#ffffff' : '#000000', fontWeight: 600 }}>Twitter</Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            )}
            {/* ── OVERALL RATING ────────────────────────────── */}
            {totalRatings > 0 && (
                <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <SectionHeader icon={<StarIcon fontSize="small" />} title={isKannada ? 'ಒಟ್ಟಾರೆ ರೇಟಿಂಗ್' : 'Overall Rating'} />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{
                            alignItems: { sm: 'center' }
                        }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: FF_HEADING, lineHeight: 1, color: isDark ? '#F5A800' : '#92400e' }}>
                                    {avgRating.toFixed(1)}
                                </Typography>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                    <StarRating value={avgRating} />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "text.secondary",
                                            fontFamily: FF_BODY
                                        }}>
                                        {totalRatings} {isKannada ? 'ರೇಟಿಂಗ್' : 'ratings'}
                                    </Typography>
                                </Stack>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <RatingBar
                                        key={star}
                                        label={String(star)}
                                        count={dist[String(star)] ?? 0}
                                        total={totalRatings}
                                        color={star >= 4 ? '#22c55e' : star === 3 ? '#f59e0b' : '#ef4444'}
                                    />
                                ))}
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            )}
            {/* ── MEETINGS ──────────────────────────────────── */}
            {Array.isArray(aspirant.meetings) && aspirant.meetings.length > 0 && (
                <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <SectionHeader icon={<EventIcon fontSize="small" />} title={isKannada ? 'ಸಭೆಗಳು' : 'Video Meetings'} />
                        <Stack spacing={1.5}>
                            {aspirant.meetings.map((m: any) => {
                                const start = formatTs(m.startTime);
                                const end = formatTs(m.endTime);
                                const mRating = m.rating?.averageRating ?? 0;
                                const mTotal = m.rating?.totalRatings ?? 0;
                                return (
                                    <Box key={m.id} sx={{
                                        p: 2, borderRadius: 2.5,
                                        border: `1px solid ${border}`,
                                        borderLeft: `4px solid #253A9A`,
                                        bgcolor: isDark ? 'rgba(37,58,154,0.1)' : 'rgba(37,58,154,0.04)',
                                    }}>
                                        <Stack
                                            direction="row"
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "flex-start"
                                            }}>
                                            <Box sx={{ flex: 1 }}>
                                                {m.title && <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>{m.title}</Typography>}
                                                {start && (
                                                    <Stack
                                                        direction="row"
                                                        spacing={0.6}
                                                        sx={{
                                                            alignItems: "flex-start",
                                                            mb: 0.4
                                                        }}>
                                                        <EventIcon sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: '3px', flexShrink: 0 }} />
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: "text.secondary",
                                                                fontFamily: FF_BODY
                                                            }}>{start}{end ? ` — ${end}` : ''}</Typography>
                                                    </Stack>
                                                )}
                                                {m.description && <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "text.secondary",
                                                        fontFamily: FF_BODY,
                                                        mt: 0.4
                                                    }}>{m.description}</Typography>}
                                                <Stack direction="row" spacing={1.5} sx={{ mt: 0.6 }}>
                                                    <Chip label={m.platform || 'Online'} size="small" sx={{ fontSize: '0.7rem', height: 20, fontFamily: FF_HEADING }} />
                                                    <Chip icon={<GroupsIcon sx={{ fontSize: '0.8rem !important' }} />} label={`${m.attendingCount || 0} attending`} size="small" sx={{ fontSize: '0.7rem', height: 20, fontFamily: FF_HEADING, bgcolor: 'success.50', color: 'success.700' }} />
                                                    {m.completed && <Chip label="Completed" size="small" sx={{ fontSize: '0.7rem', height: 20, fontFamily: FF_HEADING, bgcolor: 'success.100', color: 'success.800' }} />}
                                                </Stack>
                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    sx={{
                                                        alignItems: "center",
                                                        mt: 0.8
                                                    }}>
                                                    <StarRating value={mRating} />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "text.secondary",
                                                            fontFamily: FF_BODY
                                                        }}>
                                                        {mTotal > 0 ? `(${mTotal})` : (isKannada ? 'ರೇಟಿಂಗ್ ಇಲ್ಲ' : 'No ratings yet')}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </CardContent>
                </Card>
            )}
            {/* ── VISITS ────────────────────────────────────── */}
            {Array.isArray(aspirant.visits) && aspirant.visits.length > 0 && (
                <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <SectionHeader icon={<PlaceIcon fontSize="small" />} title={isKannada ? 'ಜನ ಭೇಟಿಗಳು' : 'Direct Meet'} />
                        <Stack spacing={1.5}>
                            {aspirant.visits.map((v: any) => {
                                const start = formatTs(v.startTime);
                                const vRating = v.rating?.averageRating ?? 0;
                                const vTotal = v.rating?.totalRatings ?? 0;
                                return (
                                    <Box key={v.id} sx={{
                                        p: 2, borderRadius: 2.5,
                                        border: `1px solid ${border}`,
                                        borderLeft: `4px solid ${isDark ? BRAND.yellow : BRAND.saffron}`,
                                        bgcolor: isDark ? 'rgba(245,168,0,0.08)' : 'rgba(245,168,0,0.04)',
                                    }}>
                                        {v.title && <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>{v.title}</Typography>}
                                        {v.location && (
                                            <Stack
                                                direction="row"
                                                spacing={0.6}
                                                sx={{
                                                    alignItems: "flex-start",
                                                    mb: 0.4
                                                }}>
                                                <PlaceIcon sx={{ fontSize: '0.85rem', color: isDark ? BRAND.yellow : BRAND.saffron, mt: '3px', flexShrink: 0 }} />
                                                <Typography variant="body2" sx={{ fontFamily: FF_BODY, fontWeight: 600 }}>{v.location}</Typography>
                                            </Stack>
                                        )}
                                        {start && (
                                            <Stack
                                                direction="row"
                                                spacing={0.6}
                                                sx={{
                                                    alignItems: "flex-start",
                                                    mb: 0.4
                                                }}>
                                                <EventIcon sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: '3px', flexShrink: 0 }} />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "text.secondary",
                                                        fontFamily: FF_BODY
                                                    }}>{start}</Typography>
                                            </Stack>
                                        )}
                                        {v.description && <Typography
                                            variant="body2"
                                            sx={{
                                                color: "text.secondary",
                                                fontFamily: FF_BODY,
                                                mt: 0.4
                                            }}>{v.description}</Typography>}
                                        <Stack direction="row" spacing={1.5} sx={{ mt: 0.6 }}>
                                            <Chip icon={<GroupsIcon sx={{ fontSize: '0.8rem !important' }} />} label={`${v.attendingCount || 0} attending`} size="small" sx={{ fontSize: '0.7rem', height: 20, fontFamily: FF_HEADING }} />
                                        </Stack>
                                        <Stack
                                            direction="row"
                                            spacing={0.5}
                                            sx={{
                                                alignItems: "center",
                                                mt: 0.8
                                            }}>
                                            <StarRating value={vRating} />
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "text.secondary",
                                                    fontFamily: FF_BODY
                                                }}>
                                                {vTotal > 0 ? `(${vTotal})` : (isKannada ? 'ರೇಟಿಂಗ್ ಇಲ್ಲ' : 'No ratings yet')}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </CardContent>
                </Card>
            )}
            {/* ── SOP AGREEMENT ─────────────────────────────────── */}
            {hasSopRecord && (
                <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <SectionHeader icon={<VerifiedIcon fontSize="small" />} title={isKannada ? 'SOP ಒಪ್ಪಂದ' : 'SOP Agreement'} />
                        <SopAgreementCard
                            sopAgreed
                            name={aspirant.name}
                            sopAgreedAt={aspirant.sopAgreedAt}
                            isKannada={isKannada}
                        />
                    </CardContent>
                </Card>
            )}
            {/* ── DOCUMENTS ─────────────────────────────────── */}
            {docs.length > 0 && (
                <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <SectionHeader icon={<DescriptionIcon fontSize="small" />} title={isKannada ? 'ದಾಖಲೆಗಳು' : 'Documents'} />
                        <Grid container spacing={1.5}>
                            {docs.map((d) => {
                                const isSop = d.label.toLowerCase().includes('sop');
                                return (
                                    <Grid
                                        key={d.label}
                                        size={{
                                            xs: 12,
                                            sm: 6
                                        }}>
                                        <Box sx={{
                                            p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            border: `1px solid ${isDark ? 'rgba(245,168,0,0.2)' : 'rgba(245,168,0,0.25)'}`,
                                            bgcolor: isDark ? 'rgba(245,168,0,0.06)' : 'rgba(245,168,0,0.04)',
                                        }}>
                                            <Stack
                                                direction="row"
                                                spacing={1.2}
                                                sx={{
                                                    alignItems: "center",
                                                    flex: 1,
                                                    minWidth: 0
                                                }}>
                                                <Box sx={{ width: 32, height: 32, borderRadius: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isDark ? 'rgba(245,168,0,0.18)' : 'rgba(245,168,0,0.14)', color: isDark ? BRAND.yellow : BRAND.saffron, flexShrink: 0 }}>
                                                    <DescriptionIcon sx={{ fontSize: '1rem' }} />
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.85rem' }}>{d.label}</Typography>
                                                    {d.status === 'verified' && (
                                                        <Typography sx={{
                                                            display: 'inline-block', mt: 0.3,
                                                            fontSize: '0.65rem', fontFamily: FF_HEADING, fontWeight: 700,
                                                            px: 0.8, py: 0.1, borderRadius: 1,
                                                            bgcolor: isDark ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.12)',
                                                            color: isDark ? '#86efac' : '#166534',
                                                        }}>
                                                            Verified
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                            {isSop && d.url && (
                                                <Button
                                                    size="small"
                                                    startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem' }} />}
                                                    onClick={() => setPdfViewUrl(d.url)}
                                                    sx={{
                                                        textTransform: 'none', fontFamily: FF_HEADING, fontWeight: 700,
                                                        fontSize: '0.75rem', borderRadius: 1.5, ml: 1, flexShrink: 0,
                                                        color: isDark ? BRAND.yellow : BRAND.saffron,
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            )}
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </CardContent>
                </Card>
            )}
            {/* PDF Viewer Dialog */}
            <Dialog
                open={Boolean(pdfViewUrl)}
                onClose={() => setPdfViewUrl(null)}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
                slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : 3, overflow: 'hidden', height: isMobile ? '100%' : '85vh' } } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: `1px solid ${border}` }}>
                    <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.95rem' }}>SOP Document</Typography>
                    <MuiIconButton onClick={() => setPdfViewUrl(null)} size="small"><CloseIcon /></MuiIconButton>
                </Box>
                {pdfViewUrl && (
                    <iframe
                        src={/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                            ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfViewUrl)}&embedded=true`
                            : pdfViewUrl}
                        title="SOP Document"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                )}
            </Dialog>
        </Box>
    );
};

export default AspirantViewDetailsPage;
