import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, useTheme, useMediaQuery,
} from '@mui/material';
import {
    ShieldOutlined, ReportProblemOutlined,
    EmailOutlined, GavelOutlined, ChildCareOutlined,
    BlockOutlined, SecurityOutlined, VerifiedUserOutlined,
} from '@mui/icons-material';
import { DarkModeRounded, LightModeRounded, CloudRounded } from '@mui/icons-material';
import RainEffect from '../components/RainEffect';
import { motion } from 'framer-motion';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import { BRAND } from '../theme';
import useThemeStore from '../store/useThemeStore';
import LanguageSelector from '../components/LanguageSelector';

interface SafetySection {
    id: string;
    title: string;
    icon: React.ReactElement;
    paragraphs: string[];
    bullets?: string[];
}

const sections: SafetySection[] = [
    {
        id: '1',
        title: '1. Our Commitment',
        icon: <ShieldOutlined />,
        paragraphs: [
            'Prajaakeeya is committed to creating a safe environment for all users, including children. We maintain a zero-tolerance policy towards Child Sexual Abuse and Exploitation (CSAE) content on our platform.',
            'We comply with all applicable Indian laws, including the Protection of Children from Sexual Offences (POCSO) Act, 2012, the Information Technology Act, 2000, and Google Play\'s Child Safety policies.',
        ],
    },
    {
        id: '2',
        title: '2. Prohibited Content and Conduct',
        icon: <BlockOutlined />,
        paragraphs: [
            'The following content and conduct are strictly prohibited on Prajaakeeya:',
        ],
        bullets: [
            'Any content that sexually exploits or endangers children',
            'Sharing, distributing, or promoting Child Sexual Abuse Material (CSAM)',
            'Grooming or solicitation of minors for sexual purposes',
            'Any content that depicts, encourages, or promotes abuse of children',
            'Sextortion or blackmail involving minors',
            'Trafficking of minors in any form',
            'Any attempt to collect personal information from children for exploitative purposes',
        ],
    },
    {
        id: '3',
        title: '3. Detection and Prevention',
        icon: <SecurityOutlined />,
        paragraphs: [
            'We employ the following measures to detect and prevent CSAE on our platform:',
        ],
        bullets: [
            'Content moderation and review of user-generated content',
            'User reporting mechanisms for flagging inappropriate content',
            'Prompt review and action on all reports related to child safety',
            'Cooperation with law enforcement agencies when required',
        ],
    },
    {
        id: '4',
        title: '4. Reporting and Enforcement',
        icon: <ReportProblemOutlined />,
        paragraphs: [
            'If you encounter any content or behaviour on Prajaakeeya that endangers children or constitutes CSAE, please report it immediately through any of the following channels:',
        ],
        bullets: [
            'Email: support@prajaakeeya.org',
            'In-app reporting feature',
            'Contact local law enforcement or Childline India (Dial 1098)',
            'Report to the National Commission for Protection of Child Rights (NCPCR) at https://ncpcr.gov.in',
        ],
    },
    {
        id: '5',
        title: '5. Actions Taken Against Violations',
        icon: <GavelOutlined />,
        paragraphs: [
            'Upon identification of CSAE content or conduct, Prajaakeeya will take the following actions:',
        ],
        bullets: [
            'Immediate removal of the offending content',
            'Permanent ban of the offending user account',
            'Preservation of relevant evidence for law enforcement',
            'Reporting to the Indian Cyber Crime Coordination Centre (I4C) and relevant authorities',
            'Reporting to the National Center for Missing & Exploited Children (NCMEC) as applicable',
            'Full cooperation with law enforcement investigations',
        ],
    },
    {
        id: '6',
        title: '6. Child User Safety',
        icon: <ChildCareOutlined />,
        paragraphs: [
            'Prajaakeeya is designed for users aged 18 and above. We do not knowingly collect personal information from children under 18 years of age. If we discover that a child under 18 has provided us with personal information, we will delete such information from our servers immediately.',
        ],
    },
    {
        id: '7',
        title: '7. Training and Awareness',
        icon: <VerifiedUserOutlined />,
        paragraphs: [
            'Our team is trained to identify and respond to CSAE content. We continuously update our policies and practices to align with the latest child safety standards and legal requirements.',
        ],
    },
    {
        id: '8',
        title: '8. Contact Information',
        icon: <EmailOutlined />,
        paragraphs: [
            'For any questions, concerns, or reports related to child safety on Prajaakeeya, please contact us:',
        ],
        bullets: [
            'Email: support@prajaakeeya.org',
            'Organization: Prajaakeeya',
            'Website: https://prajaakeeya.org',
        ],
    },
];

export default function ChildSafetyPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { mode, toggleTheme, rainEnabled, toggleRain } = useThemeStore();

    const pageBg = mode === 'grey' ? '#202225' : isDark ? BRAND.black : '#F3F0EB';
    const cardBg = mode === 'grey'
        ? 'linear-gradient(160deg,#282a2d 0%,#202225 100%)'
        : isDark
            ? 'linear-gradient(160deg,#1C1212 0%,#13161A 100%)'
            : 'linear-gradient(160deg,#FFFFFF 0%,#FFF8F0 100%)';
    const cardShadow = isDark
        ? '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,24,10,0.2)'
        : '0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(200,24,10,0.1)';
    const headerBg = mode === 'grey' ? 'rgba(32,34,37,0.85)' : isDark ? 'rgba(10,8,8,0.85)' : 'rgba(243,240,235,0.92)';
    const bodyText = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(17,24,39,0.78)';
    const dimText = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(17,24,39,0.5)';

    return (
        <Box sx={{ minHeight: '100vh', background: pageBg, position: 'relative', pb: 8 }}>

            {/* Top accent stripe */}
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, zIndex: 500, display: 'flex' }}>
                <Box sx={{ flex: 1, background: BRAND.red }} />
                <Box sx={{ flex: 1, background: BRAND.yellow }} />
                <Box sx={{ flex: 1, background: BRAND.red2 }} />
            </Box>

            {/* Bottom accent stripe */}
            <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 3, zIndex: 500, display: 'flex', opacity: 0.5 }}>
                <Box sx={{ flex: 1, background: BRAND.red }} />
                <Box sx={{ flex: 1, background: BRAND.yellow }} />
                <Box sx={{ flex: 1, background: BRAND.red2 }} />
            </Box>

            {/* Sticky header */}
            <Box
                component="header"
                sx={{
                    position: 'sticky', top: 4, left: 0, right: 0, zIndex: 400,
                    backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
                    background: headerBg,
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.08)'}`,
                    px: isMobile ? 2 : 4,
                    py: 1.25,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                    onClick={() => navigate('/oath')}
                >
                    <Box sx={{
                        width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '12px',
                        background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red2} 180deg 270deg, ${BRAND.yellow2} 270deg 360deg)`,
                        padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Box sx={{
                            width: '100%', height: '100%', borderRadius: '10px',
                            background: pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Box component="img" src={prajakeeyaLogo} alt="Prajaakeeya"
                                sx={{ width: isMobile ? 34 : 42, height: isMobile ? 34 : 42, borderRadius: '8px', objectFit: 'contain' }} />
                        </Box>
                    </Box>
                    <Box>
                        <Typography sx={{
                            fontFamily: '"Baloo 2", cursive', fontSize: isMobile ? '1.15rem' : '1.45rem',
                            fontWeight: 900, lineHeight: 1.1,
                            background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.yellow2} 45%, ${BRAND.yellow} 100%)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Prajaakeeya
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {mode === 'grey' && (
                        <Button
                            size="small"
                            onClick={toggleRain}
                            sx={{
                                minWidth: 38, width: 38, height: 38, p: 0, borderRadius: '50%',
                                bgcolor: '#4E535C',
                                color: rainEnabled ? '#AECAE8' : '#9CA3AF',
                                border: `1.5px solid ${rainEnabled ? '#C0C6CF' : '#626873'}`,
                                boxShadow: rainEnabled ? '0 2px 8px rgba(192,198,207,0.3)' : '0 2px 8px rgba(0,0,0,0.12)',
                                mr: 1,
                                '&:hover': { bgcolor: '#5A606A' },
                            }}
                            title="Toggle Rain Effect"
                        >
                            <span style={{ fontSize: '18px' }}>🌧️</span>
                        </Button>
                    )}
                    <Button
                        size="small"
                        onClick={toggleTheme}
                        sx={{
                            minWidth: 38, width: 38, height: 38, p: 0, borderRadius: '50%',
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                            color: mode === 'light' ? '#111827' : mode === 'grey' ? '#9CA3AF' : BRAND.yellow,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(17,24,39,0.12)'}`,
                            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.35)' : '0 2px 8px rgba(17,24,39,0.12)',
                            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.14)' : '#f5f5f5' },
                        }}
                        aria-label={
                            mode === 'dark'
                                ? 'Switch to light theme'
                                : mode === 'light'
                                ? 'Switch to grey theme'
                                : 'Switch to dark theme'
                        }
                    >
                        {mode === 'dark' ? (
                            <DarkModeRounded fontSize="small" />
                        ) : mode === 'light' ? (
                            <LightModeRounded fontSize="small" />
                        ) : (
                            <CloudRounded fontSize="small" />
                        )}
                    </Button>
                    <LanguageSelector
                        size="small"
                        sx={{
                            px: 1.75, py: 0.5, fontSize: '0.78rem', fontWeight: 700, borderRadius: 50,
                            bgcolor: BRAND.yellow, color: BRAND.black, textTransform: 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                            '&:hover': { bgcolor: '#d99000' },
                        }}
                    />
                </Box>
            </Box>

            {/* Hero banner */}
            <Box
                component={motion.div as any}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                sx={{ maxWidth: 860, mt: isMobile ? 3 : 4, mb: 3, mx: 'auto', px: isMobile ? 2 : 4 }}
            >
                <Box sx={{
                    background: cardBg, boxShadow: cardShadow, borderRadius: '20px',
                    overflow: 'hidden', position: 'relative',
                }}>
                    <Box sx={{
                        height: 4,
                        background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red2} 180deg 270deg, ${BRAND.yellow2} 270deg 360deg)`,
                    }} />

                    <Box sx={{
                        position: 'absolute', top: -60, right: -60, width: 240, height: 240,
                        borderRadius: '50%', pointerEvents: 'none',
                        background: `radial-gradient(circle, ${BRAND.red}22 0%, transparent 70%)`,
                    }} />
                    <Box sx={{
                        position: 'absolute', bottom: -40, left: -40, width: 180, height: 180,
                        borderRadius: '50%', pointerEvents: 'none',
                        background: `radial-gradient(circle, ${BRAND.yellow}18 0%, transparent 70%)`,
                    }} />

                    <Box sx={{ px: isMobile ? 2.5 : 5, py: isMobile ? 3 : 4, position: 'relative' }}>
                        <Box sx={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 52, height: 52, borderRadius: '14px', mb: 2,
                            background: `linear-gradient(135deg, ${BRAND.red}33, ${BRAND.yellow}22)`,
                            border: `1px solid ${isDark ? 'rgba(245,168,0,0.25)' : 'rgba(200,24,10,0.18)'}`,
                            color: isDark ? BRAND.yellow : BRAND.red,
                        }}>
                            <ShieldOutlined sx={{ fontSize: 26 }} />
                        </Box>

                        <Typography variant="h3" sx={{
                            fontFamily: '"Baloo 2", cursive', fontWeight: 900,
                            fontSize: isMobile ? '1.85rem' : '2.4rem', lineHeight: 1.15,
                            background: `${BRAND.red2}`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            mb: 0.5,
                        }}>
                            Child Safety Standards
                        </Typography>

                        <Typography sx={{
                            fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700,
                            color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(17,24,39,0.9)',
                            mb: 0.5,
                        }}>
                            Prajaakeeya - Standards Against Child Sexual Abuse and Exploitation (CSAE)
                        </Typography>

                        <Typography sx={{
                            fontSize: '0.875rem',
                            color: isDark ? BRAND.yellow : BRAND.red,
                            fontWeight: 600, mb: 2,
                        }}>
                            Effective Date: March 28, 2026
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Sections */}
            <Box sx={{ maxWidth: 860, mx: 'auto', px: isMobile ? 2 : 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {sections.map((section, idx) => (
                    <Box
                        key={section.id}
                        component={motion.div as any}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.45, delay: idx * 0.03, ease: [0.22, 1, 0.36, 1] }}
                        sx={{ background: cardBg, boxShadow: cardShadow, borderRadius: '16px', overflow: 'hidden' }}
                    >
                        {/* Section header */}
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: isMobile ? 2.5 : 4, py: 1.75,
                            background: isDark
                                ? 'linear-gradient(135deg, rgba(200,24,10,0.18), rgba(245,168,0,0.1))'
                                : 'linear-gradient(135deg, rgba(200,24,10,0.07), rgba(245,168,0,0.05))',
                            borderBottom: `1px solid ${isDark ? 'rgba(245,168,0,0.15)' : 'rgba(200,24,10,0.1)'}`,
                        }}>
                            <Box sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                                background: isDark ? 'rgba(245,168,0,0.12)' : 'rgba(200,24,10,0.08)',
                                color: isDark ? BRAND.yellow : BRAND.red,
                                '& svg': { fontSize: '1.25rem' },
                            }}>
                                {section.icon}
                            </Box>
                            <Typography sx={{
                                fontWeight: 800, fontSize: isMobile ? '0.97rem' : '1.05rem',
                                color: isDark ? BRAND.yellow : BRAND.red, letterSpacing: '0.2px',
                            }}>
                                {section.title}
                            </Typography>
                        </Box>

                        {/* Section body */}
                        <Box sx={{ px: isMobile ? 2.5 : 4, py: 2.5 }}>
                            {section.paragraphs.map((p, i) => (
                                <Typography key={i} sx={{ fontSize: '0.92rem', color: bodyText, lineHeight: 1.8, mb: 1 }}>
                                    {p}
                                </Typography>
                            ))}
                            {section.bullets && (
                                <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                                    {section.bullets.map((bullet, i) => (
                                        <Box key={i} component="li" sx={{ mb: 0.25 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        mt: '7px', flexShrink: 0, width: 7, height: 7, borderRadius: '50%',
                                                        background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.yellow})`,
                                                        boxShadow: `0 0 6px ${BRAND.yellow}55`,
                                                    }}
                                                />
                                                <Typography sx={{
                                                    fontSize: '0.92rem', lineHeight: 1.75,
                                                    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(17,24,39,0.85)',
                                                }}>
                                                    {bullet}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Footer */}
            <Box
                component={motion.div as any}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                sx={{ maxWidth: 860, mx: 'auto', px: isMobile ? 2 : 4, mt: 3, textAlign: 'center' }}
            >
                <Typography sx={{ fontSize: '0.8rem', color: dimText }}>
                    {`\u00A9 ${new Date().getFullYear()} Prajaakeeya. All rights reserved.`}
                </Typography>
            </Box>
            {mode === 'grey' && rainEnabled && <RainEffect />}
        </Box>
    );
}
