import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Grid,
    Button,
    Typography,
    Box,
    Stack,
    Chip,
    Alert,
    CircularProgress,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    FileDownload as FileDownloadIcon,
    InsertDriveFile as InsertDriveFileIcon,
    Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BRAND } from '../../theme';
import SopAgreementCard from './SopAgreementCard';

interface AspirantProfileTabProps {
    aspirantProfile: any;
    isMobile: boolean;
    handleDownload: (url: string) => void;
    onWithdraw?: () => void;
    withdrawBusy?: boolean;
}
const AspirantProfileTab: React.FC<AspirantProfileTabProps> = ({ aspirantProfile, isMobile, handleDownload, onWithdraw, withdrawBusy }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const [continuing, setContinuing] = useState(false);
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

    const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
    const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
    const FF = FF_BODY;
    const isDark = theme.palette.mode === 'dark';
    const cardBg = theme.palette.background.paper;
    const insetBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(17,24,39,0.04)';
    const goldd = 'rgba(245,168,0,0.45)';
    const textPri = theme.palette.text.primary;
    const textSec = theme.palette.text.secondary;
    const textDim = isDark ? 'rgba(255,255,255,0.46)' : 'rgba(17,24,39,0.50)';
    const border = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(17,24,39,0.08)';
    const cardShadow = isDark ? '0 16px 36px rgba(0,0,0,0.36)' : '0 4px 16px rgba(17,24,39,0.06)';

    const formatDate = (d: any) => {
        if (!d) return '—';
        try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return String(d);
            return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return String(d);
        }
    };

    if (!aspirantProfile) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: textSec, fontFamily: FF_HEADING }}>
                    Profile data not available
                </Typography>
            </Box>
        );
    }

    // SOP is intentionally excluded — it's surfaced via SopAgreementCard below
    // so legacy aspirants with only sopUrl get the same signed-agreement UI as
    // those with sopAgreed=true.
    const fieldMap = [
        { url: 'agreementUrl', status: 'agreementStatus', label: 'Agreement' },
        { url: 'propertyDeclarationUrl', status: 'propertyDeclarationStatus', label: 'Property Declaration' },
        { url: 'codeOfConductUrl', status: 'codeOfConductStatus', label: 'Code of Conduct' },
        { url: 'resumeUrl', status: 'resumeStatus', label: 'Resume' },
        { url: 'epicCardUrl', status: 'epicCardStatus', label: 'EPIC Card (Front)' },
        { url: 'epicCardBackUrl', status: 'epicCardBackStatus', label: 'EPIC Card (Back)' },
        { url: 'addressProofUrl', status: 'addressProofStatus', label: 'Address Proof' },
        { url: 'recentPhotoUrl', status: 'recentPhotoStatus', label: 'Recent Photo' },
    ];

    const docs: any[] = fieldMap.map(f => {
        const url = (aspirantProfile as any)[f.url];
        const status = (aspirantProfile as any)[f.status];
        if (!url || url === '' || url === 'null' || url === 'undefined') return null;
        return { name: f.label, url, status: status || 'uploaded', verified: (status || '').toString().toLowerCase() === 'verified', uploaded: true };
    }).filter(Boolean) as any[];

    try {
        const arr = Array.isArray((aspirantProfile as any).documents) ? (aspirantProfile as any).documents : [];
        arr.forEach((d: any) => {
            const url = d.documentUrl || d.url || d.fileUrl || d.urlFull || d.path || d.downloadUrl;
            if (!url) return;
            const type = (d.documentType || d.type || d.name || '').toString().toLowerCase();
            const label = type === 'selfie' ? 'Selfie' : (d.name || d.displayName || d.documentType || type || 'Document');
            const exists = docs.find(x => x.url === url || x.name === label);
            if (!exists) {
                const verified = (d.status || d.verified || '').toString().toLowerCase() === 'verified' || Boolean(d.isVerified);
                docs.push({ name: label, url, status: d.status || (verified ? 'verified' : 'uploaded'), verified, uploaded: true });
            }
        });
    } catch (e) { /* ignore */ }

    try {
        // debug logging removed
    } catch (e) { /* ignore */ }

    const isPending = (aspirantProfile.status || '').toString().toLowerCase() === 'pending';

    // Ward-based elections have ward/zone/category; constituency-based (lok_sabha, vidhan_sabha) use constituencyName
    const electionType = (aspirantProfile.electionType || '').toLowerCase();
    const isConstituencyBased = electionType === 'lok_sabha' || electionType === 'vidhan_sabha';
    // Also detect via presence of ward data if electionType is missing
    const hasWardData = !!(aspirantProfile.ward?.number || aspirantProfile.wardId || aspirantProfile.wardNumber);
    const showWardFields = !isConstituencyBased && hasWardData;

    return (
        <Box>
            {isPending && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
                    <Typography variant="body1" sx={{ fontFamily: FF_HEADING, fontWeight: 700, mb: 0.5 }}>
                        Application is pending
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: FF_BODY }}>
                        Your aspirant registration is pending. Please continue to complete document uploads.
                    </Typography>
                </Alert>
            )}
            {isPending && (
                <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-start' }, mb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => { setContinuing(true); navigate('/user/aspirants/declaration', { state: { resume: true } }); }}
                        disabled={continuing}
                        startIcon={continuing ? <CircularProgress size={18} color="inherit" /> : undefined}
                        sx={{
                            minWidth: 170, fontWeight: 800, fontFamily: FF_HEADING, borderRadius: 2.2, textTransform: 'none',
                            color: '#fff',
                            background: `linear-gradient(135deg,${BRAND.red} 0%,${BRAND.yellow} 100%)`,
                            boxShadow: '0 10px 28px rgba(200,24,10,0.35)',
                            '&:hover': { background: `linear-gradient(135deg,${BRAND.red2} 0%,#ffbe1a 100%)` },
                        }}
                    >
                        {continuing ? 'Continuing…' : 'Continue Registration'}
                    </Button>
                </Box>
            )}
            {/* Withdraw confirm dialog */}
            <Dialog open={withdrawDialogOpen} onClose={() => setWithdrawDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontFamily: FF_HEADING, fontWeight: 800 }}>
                    {t('userDashboard.aspirant.withdrawConfirmTitle') || 'Withdraw Registration'}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontFamily: FF_BODY }}>
                        {t('userDashboard.aspirant.withdrawConfirmText') || 'Are you sure you want to withdraw your aspirant registration? This action cannot be undone.'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWithdrawDialogOpen(false)} sx={{ textTransform: 'none', fontFamily: FF_HEADING }}>
                        {t('common.cancel') || 'Cancel'}
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        disabled={withdrawBusy}
                        onClick={() => { setWithdrawDialogOpen(false); onWithdraw?.(); }}
                        sx={{ textTransform: 'none', fontFamily: FF_BODY }}
                    >
                        {t('userDashboard.aspirant.withdraw') || 'Withdraw'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid container columnSpacing={{ xs: 0, md: 3 }} rowSpacing={{ xs: 2, md: 3 }} sx={{
                alignItems: "stretch"
            }}>
                {/* ── Profile card ── */}
                <Grid
                    size={{
                        xs: 12,
                        md: 4
                    }}>
                    <Card sx={{ borderRadius: 3, bgcolor: cardBg, boxShadow: cardShadow, border: `1px solid ${border}`, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', height: '3px' }}>
                            {[BRAND.red, BRAND.blue, BRAND.brown].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
                        </Box>
                        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                            <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 800, mb: 2.4, color: textPri }}>
                                {t('userDashboard.aspirant.profileTitle') || 'Aspirant Profile'}
                            </Typography>

                            {showWardFields && (
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FF_HEADING, color: textDim }}>
                                        {t('userDashboard.aspirant.fieldLabels.wardNumber') || 'Ward Number'}
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPri }}>
                                            {aspirantProfile.wardNumber ?? aspirantProfile.wardId ?? '—'}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            <Box sx={{ mt: 2.2, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr' }, gap: 1.2 }}>
                                {showWardFields ? (
                                    <Box sx={{ gridColumn: '1 / -1', p: 1.2, borderRadius: 2, bgcolor: insetBg, border: `1px solid ${border}` }}>
                                        <Typography variant="caption" sx={{ fontFamily: FF_BODY, color: textSec }}>
                                            {t('forms.ward.name') || 'Ward Name'}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPri }}>
                                            {aspirantProfile.ward?.name ?? aspirantProfile.wardName ?? aspirantProfile.assembly ?? '—'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <>
                                        {aspirantProfile.electionName && (
                                            <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: insetBg, border: `1px solid ${border}` }}>
                                                <Typography variant="caption" sx={{ fontFamily: FF_BODY, color: textSec, display: 'block', mb: 0.4 }}>
                                                    Election
                                                </Typography>
                                                <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPri, fontSize: '0.82rem', lineHeight: 1.3 }}>
                                                    {aspirantProfile.electionName}
                                                </Typography>
                                            </Box>
                                        )}
                                        {aspirantProfile.constituencyName && (
                                            <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: insetBg, border: `1px solid ${border}` }}>
                                                <Typography variant="caption" sx={{ fontFamily: FF_BODY, color: textSec, display: 'block', mb: 0.4 }}>
                                                    Constituency
                                                </Typography>
                                                <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPri, fontSize: '0.82rem', lineHeight: 1.3 }}>
                                                    {aspirantProfile.constituencyName}
                                                </Typography>
                                            </Box>
                                        )}
                                    </>
                                )}
                                <Box sx={{ gridColumn: !showWardFields && (!aspirantProfile.electionName || !aspirantProfile.constituencyName) ? 'auto' : '1 / -1', p: 1.2, borderRadius: 2, bgcolor: insetBg, border: `1px solid ${border}` }}>
                                    <Typography variant="caption" sx={{ fontFamily: FF_BODY, color: textSec, display: 'block', mb: 0.4 }}>
                                        {t('userDashboard.aspirant.fieldLabels.applicationDate') || 'Application Date'}
                                    </Typography>
                                    <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPri, fontSize: '0.82rem', lineHeight: 1.3 }}>
                                        {formatDate(aspirantProfile.applicationDate ?? aspirantProfile.createdAt)}
                                    </Typography>
                                </Box>
                            </Box>

                            {showWardFields && (
                                <>
                                    <Box sx={{ mt: 2.2, display: 'flex', gap: 1.2, flexDirection: 'row', flexWrap: 'wrap' }}>
                                        <Box sx={{ flex: 1, minWidth: '45%', p: 1.2, borderRadius: 2, bgcolor: insetBg, border: `1px solid ${border}` }}>
                                            <Typography variant="caption" sx={{ fontFamily: FF_BODY, color: textSec }}>
                                                {t('forms.ward.zone') || 'Zone'}
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPri }}>
                                                {aspirantProfile.ward?.zone ?? '—'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: '45%', p: 1.2, borderRadius: 2, bgcolor: insetBg, border: `1px solid ${border}` }}>
                                            <Typography variant="caption" sx={{ fontFamily: FF_BODY, color: textSec }}>
                                                {t('forms.ward.category') || 'Category'}
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPri }}>
                                                {aspirantProfile.ward?.category ?? '—'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 1.2, p: 1.2, borderRadius: 2, bgcolor: insetBg, border: `1px solid ${border}` }}>
                                        <Typography variant="caption" sx={{ fontFamily: FF_BODY, color: textSec }}>
                                            {t('forms.ward.municipality') || 'Municipality'}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPri }}>
                                            {aspirantProfile.ward?.municipality ?? '—'}
                                        </Typography>
                                    </Box>
                                </>
                            )}

                            {aspirantProfile?.rejectionReasons ? (
                                (() => {
                                    let reasonsObj: Record<string, string> = {};
                                    try {
                                        reasonsObj = typeof aspirantProfile.rejectionReasons === 'string'
                                            ? JSON.parse(aspirantProfile.rejectionReasons)
                                            : aspirantProfile.rejectionReasons || {};
                                    } catch (e) {
                                        return (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="caption" color="error" sx={{ fontFamily: FF_HEADING, fontWeight: 700 }}>Rejection Notes</Typography>
                                                <Typography variant="body2" sx={{ color: textSec, fontFamily: FF_BODY }}>{String(aspirantProfile.rejectionReasons)}</Typography>
                                            </Box>
                                        );
                                    }
                                    const keyToLabel: Record<string, string> = {
                                        address_proof: 'Address Proof', recent_photo: 'Recent Photo', epic_card: 'EPIC Card (Front)', epic_card_back: 'EPIC Card (Back)',
                                        resume: 'Resume', agreement: 'Agreement', property_declaration: 'Property Declaration',
                                        code_of_conduct: 'Code Of Conduct', selfie: 'Selfie'
                                    };
                                    const entries = Object.entries(reasonsObj || {});
                                    if (entries.length === 0) return null;
                                    return (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" color="error" sx={{ fontWeight: 700, fontFamily: FF_HEADING }}>Rejection Reasons</Typography>
                                            <Box sx={{ mt: 1 }}>
                                                {entries.map(([k, v]) => (
                                                    <Box key={k} sx={{ mt: 0.75 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: FF_HEADING, color: textPri }}>{keyToLabel[k] ?? k}</Typography>
                                                        <Typography variant="body2" sx={{ color: textSec, fontFamily: FF_BODY }}>{String(v)}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    );
                                })()
                            ) : null}
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── SOP Agreement card ── */}
                <Grid
                    size={{
                        xs: 12,
                        md: 8
                    }}>
                    <Card sx={{ borderRadius: 3, bgcolor: cardBg, boxShadow: cardShadow, border: `1px solid ${border}`, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', height: '3px' }}>
                            {[BRAND.red, BRAND.blue, BRAND.brown].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
                        </Box>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            <Stack
                                direction="row"
                                spacing={1.2}
                                sx={{
                                    alignItems: "center",
                                    mb: 2
                                }}>
                                <VerifiedIcon sx={{ color: BRAND.yellow }} />
                                <Typography variant="h6" sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPri }}>
                                    {t('userDashboard.aspirant.sopAgreementTitle') || 'SOP Agreement'}
                                </Typography>
                            </Stack>

                            {(aspirantProfile.sopAgreed || (aspirantProfile as any).sopUrl) ? (
                                <SopAgreementCard
                                    sopAgreed
                                    name={aspirantProfile.name}
                                    sopAgreedAt={aspirantProfile.sopAgreedAt}
                                />
                            ) : (
                                <Box sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: insetBg, border: `1px dashed ${border}` }}>
                                    <Typography variant="body2" sx={{ color: textSec, fontFamily: FF_BODY }}>
                                        {t('userDashboard.aspirant.sopNotAgreed') || 'SOP not agreed yet.'}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {/* Withdraw button — below Documents Uploaded, full width */}
            {onWithdraw && (
                <Box id="withdraw-application" sx={{ mt: 3, scrollMarginTop: 80 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        disabled={withdrawBusy}
                        onClick={() => setWithdrawDialogOpen(true)}
                        sx={{ fontFamily: FF_HEADING, fontWeight: 700, borderRadius: 2, textTransform: 'none', py: 1.2 }}
                    >
                        {withdrawBusy ? 'Withdrawing…' : (t('userDashboard.aspirant.withdraw') || 'Withdraw')}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default AspirantProfileTab;
