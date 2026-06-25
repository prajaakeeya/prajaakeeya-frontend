import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Avatar, Card, CardContent,
    Stack, Chip, Grid, useTheme, useMediaQuery,
    Tooltip, LinearProgress,
} from '@mui/material';
import {
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
    Share as ShareIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../theme';
import { safeUrl } from '../utils/safeUrl';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;

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
                    <Typography sx={{ fontSize: '0.95rem', fontFamily: FF_HEADING, fontWeight: 700, color: 'text.primary', lineHeight: 1.2, mt: 0.2 }}>{value}</Typography>
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
        <Typography sx={{ fontSize: '0.78rem', fontFamily: FF_BODY, fontWeight: 600, minWidth: 14, color: 'text.secondary' }}>{label}</Typography>
        <LinearProgress
            variant="determinate"
            value={total > 0 ? (count / total) * 100 : 0}
            sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.08)', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }}
        />
        <Typography sx={{ fontSize: '0.78rem', fontFamily: FF_BODY, minWidth: 18, color: 'text.secondary', textAlign: 'right' }}>{count}</Typography>
    </Stack>
);

// ── Static demo data ────────────────────────────────────────────────────
const demoAspirant = {
    name: 'Prajaakeeya Demo Aspirant',
    party: 'Independent',
    status: 'approved',
    age: 35,
    gender: 'Male',
    education: 'B.Tech',
    occupation: 'Social Worker',
    address: 'Bengaluru, Karnataka',
    phone: '+91 99999 99999',
    whatsappNumber: '+91 99999 99999',
    allowPhone: true,
    allowWhatsapp: true,
    selfieUrl: null as string | null,
    recentPhotoUrl: null as string | null,
    electionName: 'Demo Election 2026',
    constituencyName: 'All Wards (Demo)',
    manifesto: 'This is a demo aspirant profile to showcase how the platform works. Our vision includes transparent governance, citizen-first policies, community development, and digital empowerment for every ward member.',
    instagramLink: 'https://www.instagram.com/prajaakeeya',
    facebookLink: 'https://www.facebook.com/prajaakeeya',
    linkedinLink: 'https://www.linkedin.com/company/prajaakeeya',
    twitterLink: 'https://twitter.com/prajaakeeya',
    identityBackground: 'Committed to serving the community with integrity and transparency. 10+ years of social work experience across multiple wards.',
    resignationPledge: 'I pledge to resign immediately if I fail to uphold the trust of the voters or violate any code of conduct.',
    noHighCommand: 'All decisions will be made locally with direct input from ward residents, not dictated by any external authority.',
    technicalCompetence: 'Proficient in digital governance tools, data-driven policy making, and modern civic technology platforms.',
    transparency: 'All expenditures, meeting minutes, and decisions will be published publicly on the platform within 24 hours.',
    emergencyProtocol: 'A dedicated emergency response team will be available 24/7 for ward residents during natural disasters or civic emergencies.',
    expertConsultation: 'Will establish an advisory panel of domain experts for infrastructure, education, healthcare, and environmental issues.',
    voterFeedback: 'Monthly town halls and continuous digital feedback mechanisms will ensure every voice is heard and acted upon.',
    primaryRule: 'The people are supreme. Every decision must pass the test of public benefit before implementation.',
    overallRating: {
        averageRating: 4.2,
        totalRatings: 128,
        distribution: { '5': 52, '4': 38, '3': 22, '2': 10, '1': 6 },
    },
    meetings: [
        {
            id: -9001,
            platform: 'instagram',
            title: 'Instagram Live Q&A',
            description: 'Join us for a live Q&A session on Instagram',
            startTime: new Date('2026-04-05T10:00:00+05:30').getTime(),
            endTime: new Date('2026-04-05T11:00:00+05:30').getTime(),
            attendingCount: 24,
            rating: { averageRating: 4.5, totalRatings: 18, distribution: { '5': 10, '4': 5, '3': 2, '2': 1, '1': 0 } },
        },
        {
            id: -9002,
            platform: 'google_meet',
            title: 'Google Meet Town Hall',
            description: 'Open discussion on ward development plans',
            startTime: new Date('2026-04-10T10:00:00+05:30').getTime(),
            endTime: new Date('2026-04-10T11:00:00+05:30').getTime(),
            attendingCount: 42,
            rating: { averageRating: 4.0, totalRatings: 30, distribution: { '5': 12, '4': 10, '3': 5, '2': 2, '1': 1 } },
        },
        {
            id: -9003,
            platform: 'zoom',
            title: 'Zoom Community Session',
            description: 'Ward improvement discussion via Zoom',
            startTime: new Date('2026-04-15T10:00:00+05:30').getTime(),
            endTime: new Date('2026-04-15T11:00:00+05:30').getTime(),
            attendingCount: 18,
            rating: { averageRating: 0, totalRatings: 0, distribution: {} },
        },
    ],
    visits: [
        {
            id: -9101,
            title: 'Direct Meet — Community Hall',
            location: 'Community Hall, Jayanagar, Bengaluru',
            startTime: new Date('2026-04-03T10:00:00+05:30').getTime(),
            description: 'Meet & greet with ward residents to discuss local issues',
            attendingCount: 56,
            rating: { averageRating: 4.6, totalRatings: 42, distribution: { '5': 25, '4': 10, '3': 5, '2': 1, '1': 1 } },
        },
    ],
};

// ── Component ───────────────────────────────────────────────────────────
const DemoAspirantViewPage: React.FC = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const isKannada = (i18n.language || '').startsWith('kn');
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const aspirant = demoAspirant;
    const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(17,24,39,0.1)';
    const cardBg = isDark
        ? 'linear-gradient(160deg, rgba(20,24,34,0.97) 0%, rgba(13,17,28,0.98) 100%)'
        : 'linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)';

    const rating = aspirant.overallRating;
    const avgRating = rating.averageRating;
    const totalRatings = rating.totalRatings;
    const dist = rating.distribution;

    const formatTs = (ts: string | number | null | undefined) => {
        if (!ts) return '';
        const d = new Date(Number(ts));
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Box sx={{ p: { xs: 1.25, sm: 2.5 }, maxWidth: 900, mx: 'auto' }}>
            {/* DEMO banner */}
            <Box sx={{
                mb: 2, p: 1.5, borderRadius: 2, textAlign: 'center',
                background: isDark ? 'rgba(200,24,10,0.15)' : 'rgba(200,24,10,0.08)',
                border: `1px solid ${BRAND.red}`,
            }}>
                <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.85rem', color: BRAND.red }}>
                    {isKannada
                        ? 'ಇದು ಡೆಮೊ ಆಕಾಂಕ್ಷಿ ಪ್ರೊಫೈಲ್ — ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ತೋರಿಸಲು ಮಾತ್ರ'
                        : 'This is a demo aspirant profile — for demonstration purposes only'}
                </Typography>
            </Box>
            {/* ── HERO CARD ─────────────────────────────────── */}
            <Card sx={{
                mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, overflow: 'hidden',
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 12px 40px rgba(17,24,39,0.12)',
            }}>
                <Box sx={{
                    height: { xs: 50, sm: 75 },
                    background: isDark
                        ? 'radial-gradient(130% 200% at 0% 0%, rgba(200,24,10,0.45) 0%, rgba(37,58,154,0.45) 55%, rgba(13,17,28,1) 100%)'
                        : 'linear-gradient(135deg, rgba(200,24,10,0.85) 0%, rgba(37,58,154,0.85) 60%, rgba(107,58,0,0.8) 100%)',
                    position: 'relative',
                }}>
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', height: 4 }}>
                        {['#C8180A', '#253A9A', '#6B3A00', '#F5A800'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
                    </Box>
                </Box>

                <CardContent sx={{ pt: 0, pb: '14px !important', px: { xs: 1.5, sm: 2.5 }, position: 'relative' }}>
                    {/* Mobile-only rating */}
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

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 0.8, sm: 2 }}
                        sx={{
                            alignItems: { xs: 'center', sm: 'stretch' },
                            mt: { xs: -3.5, sm: -4.5 }
                        }}>
                        <Avatar
                            alt={aspirant.name}
                            sx={{
                                width: { xs: 64, sm: 100 }, height: { xs: 64, sm: 100 },
                                border: `3px solid ${isDark ? '#1a1f2e' : '#ffffff'}`,
                                boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
                                fontSize: '1.6rem', fontWeight: 800,
                                background: 'linear-gradient(135deg, #C8180A 0%, #253A9A 100%)',
                                color: '#fff',
                            }}
                        >
                            P
                        </Avatar>

                        <Box sx={{ flex: 1, pb: { sm: 0.5 }, textAlign: { xs: 'center', sm: 'left' } }}>
                            <Stack
                                direction="row"
                                spacing={0.8}
                                sx={{
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    justifyContent: { xs: 'center', sm: 'flex-start' }
                                }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: FF_HEADING, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                    {aspirant.name}
                                </Typography>
                                <Tooltip title="Verified Aspirant">
                                    <VerifiedIcon sx={{ color: '#22c55e', fontSize: '1.3rem', flexShrink: 0 }} />
                                </Tooltip>
                                <Chip
                                    label={aspirant.party}
                                    size="small"
                                    sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.68rem', height: 20, bgcolor: isDark ? 'rgba(245,168,0,0.18)' : 'rgba(245,168,0,0.14)', color: isDark ? '#F5A800' : '#92400e', border: `1px solid ${isDark ? 'rgba(245,168,0,0.4)' : 'rgba(245,168,0,0.3)'}` }}
                                />
                                <Chip label="DEMO" size="small" sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: '0.6rem', height: 20, bgcolor: 'rgba(200,24,10,0.15)', color: BRAND.red, border: `1px solid ${BRAND.red}` }} />
                            </Stack>
                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: { xs: 'center', sm: 'flex-start' },
                                    mt: { xs: 0.5, sm: 3 }
                                }}>
                                <Chip
                                    icon={<HowToVoteIcon sx={{ fontSize: '0.85rem !important' }} />}
                                    label={aspirant.electionName}
                                    size="small"
                                    sx={{ fontFamily: FF_BODY, fontWeight: 600, fontSize: '0.66rem', height: 20, bgcolor: isDark ? 'rgba(37,58,154,0.25)' : 'rgba(37,58,154,0.08)', color: isDark ? '#93c5fd' : '#1e3a8a' }}
                                />
                            </Stack>
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
                                    }}>{aspirant.constituencyName}</Typography>
                            </Stack>
                        </Box>

                        {/* Overall Rating — desktop */}
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
                    </Stack>
                </CardContent>
            </Card>
            {/* ── PERSONAL INFO ─────────────────────────────── */}
            <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: '16px !important' } }}>
                    <SectionHeader icon={<PersonIcon fontSize="small" />} title={isKannada ? 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ' : 'Personal Information'} />
                    <Grid container spacing={1.5}>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 4,
                                md: 3
                            }}><InfoTile icon={<PersonIcon fontSize="small" />} label={isKannada ? 'ವಯಸ್ಸು' : 'Age'} value={`${aspirant.age} yrs`} /></Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 4,
                                md: 3
                            }}><InfoTile icon={<PersonIcon fontSize="small" />} label={isKannada ? 'ಲಿಂಗ' : 'Gender'} value={aspirant.gender} /></Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 4,
                                md: 3
                            }}><InfoTile icon={<SchoolIcon fontSize="small" />} label={isKannada ? 'ಶಿಕ್ಷಣ' : 'Education'} value={aspirant.education} /></Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 4,
                                md: 3
                            }}><InfoTile icon={<WorkIcon fontSize="small" />} label={isKannada ? 'ವೃತ್ತಿ' : 'Occupation'} value={aspirant.occupation} /></Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 8
                            }}><InfoTile icon={<LocationOnIcon fontSize="small" />} label={isKannada ? 'ವಿಳಾಸ' : 'Address'} value={aspirant.address} /></Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 4
                            }}><InfoTile icon={<PhoneIcon fontSize="small" />} label={isKannada ? 'ಫೋನ್' : 'Phone'} value={aspirant.phone} /></Grid>
                    </Grid>
                </CardContent>
            </Card>
            {/* ── MANIFESTO ─────────────────────────────────── */}
            <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <SectionHeader icon={<DescriptionIcon fontSize="small" />} title={isKannada ? 'ನನ್ನ ಬಗ್ಗೆ' : 'Manifesto'} />
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.03)', border: `1px solid ${border}`, borderLeft: `4px solid ${isDark ? BRAND.yellow : BRAND.saffron}` }}>
                        <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.95rem', lineHeight: 1.75, color: 'text.primary', whiteSpace: 'pre-line' }}>
                            {aspirant.manifesto}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
            {/* ── SOCIAL PLATFORMS ─────────────────────────── */}
            <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <SectionHeader icon={<ShareIcon fontSize="small" />} title={isKannada ? 'ಸಾಮಾಜಿಕ ವೇದಿಕೆಗಳು' : 'Social Platforms'} />
                    <Grid container spacing={1.2} sx={{ mt: 0.5 }}>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 3
                            }}>
                            <Box component="a" href={safeUrl(aspirant.instagramLink) ?? undefined} target="_blank" rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7, textDecoration: 'none', px: 1.2, py: 0.7, borderRadius: '10px', border: '1px solid rgba(225,48,108,0.6)', background: 'rgba(225,48,108,0.08)', '&:hover': { background: 'rgba(225,48,108,0.16)' } }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><defs><radialGradient id="ig-demo" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497" /><stop offset="5%" stopColor="#fdf497" /><stop offset="45%" stopColor="#fd5949" /><stop offset="60%" stopColor="#d6249f" /><stop offset="90%" stopColor="#285AEB" /></radialGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="url(#ig-demo)" /><circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" fill="none" /><circle cx="17.5" cy="6.5" r="1.2" fill="white" /></svg>
                                <Typography variant="body2" sx={{ fontFamily: FF_BODY, color: '#E1306C', fontWeight: 600 }}>Instagram</Typography>
                            </Box>
                        </Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 3
                            }}>
                            <Box component="a" href={safeUrl(aspirant.facebookLink) ?? undefined} target="_blank" rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7, textDecoration: 'none', px: 1.2, py: 0.7, borderRadius: '10px', border: '1px solid rgba(24,119,242,0.6)', background: 'rgba(24,119,242,0.08)', '&:hover': { background: 'rgba(24,119,242,0.16)' } }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#1877F2" /><path d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10H15.5L15.2 12.5H13V19H10.5V12.5H9V10H10.5V8.5C10.5 6.6 11.6 5.5 13.5 5.5H15.5V8Z" fill="white" /></svg>
                                <Typography variant="body2" sx={{ fontFamily: FF_BODY, color: '#1877F2', fontWeight: 600 }}>Facebook</Typography>
                            </Box>
                        </Grid>
                        <Grid
                            size={{
                                xs: 6,
                                sm: 3
                            }}>
                            <Box component="a" href={safeUrl(aspirant.twitterLink) ?? undefined} target="_blank" rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7, textDecoration: 'none', px: 1.2, py: 0.7, borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', '&:hover': { background: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.1)' } }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill={isDark ? '#ffffff' : '#000000'} /><path d="M13.6 10.8L17.7 6H16.7L13.2 10.2L10.4 6H7L11.3 12.7L7 17.8H8L11.7 13.4L14.6 17.8H18L13.6 10.8ZM12.2 12.8L11.8 12.2L8.4 6.8H10L12.5 10.5L12.9 11.1L16.7 17.1H15L12.2 12.8Z" fill={isDark ? '#000000' : '#ffffff'} /></svg>
                                <Typography variant="body2" sx={{ fontFamily: FF_BODY, color: isDark ? '#ffffff' : '#000000', fontWeight: 600 }}>Twitter</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            {/* ── OVERALL RATING ────────────────────────────── */}
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
                                    count={(dist as any)[String(star)] ?? 0}
                                    total={totalRatings}
                                    color={star >= 4 ? '#22c55e' : star === 3 ? '#f59e0b' : '#ef4444'}
                                />
                            ))}
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
            {/* ── MEETINGS ──────────────────────────────────── */}
            <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <SectionHeader icon={<EventIcon fontSize="small" />} title={isKannada ? 'ಸಭೆಗಳು' : 'Meetings'} />
                    <Stack spacing={1.5}>
                        {aspirant.meetings.map((m) => {
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
                                    <Box sx={{ flex: 1 }}>
                                        {m.title && <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>{m.title}</Typography>}
                                        {start && (
                                            <Stack
                                                direction="row"
                                                spacing={0.6}
                                                sx={{
                                                    alignItems: "center",
                                                    mb: 0.4
                                                }}>
                                                <EventIcon sx={{ fontSize: '0.85rem', color: 'text.secondary' }} />
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
                                </Box>
                            );
                        })}
                    </Stack>
                </CardContent>
            </Card>
            {/* ── VISITS ────────────────────────────────────── */}
            <Card sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${border}`, background: cardBg, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 8px 24px rgba(17,24,39,0.07)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <SectionHeader icon={<PlaceIcon fontSize="small" />} title={isKannada ? 'ಜನ ಭೇಟಿಗಳು' : 'Field Visits'} />
                    <Stack spacing={1.5}>
                        {aspirant.visits.map((v) => {
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
                                                alignItems: "center",
                                                mb: 0.4
                                            }}>
                                            <PlaceIcon sx={{ fontSize: '0.85rem', color: isDark ? BRAND.yellow : BRAND.saffron }} />
                                            <Typography variant="body2" sx={{ fontFamily: FF_BODY, fontWeight: 600 }}>{v.location}</Typography>
                                        </Stack>
                                    )}
                                    {start && (
                                        <Stack
                                            direction="row"
                                            spacing={0.6}
                                            sx={{
                                                alignItems: "center",
                                                mb: 0.4
                                            }}>
                                            <EventIcon sx={{ fontSize: '0.85rem', color: 'text.secondary' }} />
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
        </Box>
    );
};

export default DemoAspirantViewPage;
