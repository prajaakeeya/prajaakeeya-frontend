import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Stack,
  Button,
  Alert,
  Grid,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { HowToVote as HowToVoteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { getAspirantById } from '../services/aspirantService';
import apiClient from '../services/apiClient';
import { safeUrl } from '../utils/safeUrl';

const GOLD = '#F5A800';
const GOLDD = 'rgba(245,168,0,0.45)';
const DARK = '#0D0F12';
const BORDER = 'rgba(245,168,0,0.18)';
const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;

const SOP_EN_URL = '';

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

interface UploadedFile {
  name: string;
  size: number;
  uploaded: boolean;
  progress: number;
  error?: boolean;
  errorMessage?: string;
  errorKey?: string;
}

const SopUploadPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? DARK : 'linear-gradient(180deg,#fffdfa 0%,#f9f4ec 100%)';
  const cardBorder = isDark ? BORDER : 'rgba(245,168,0,0.24)';
  const textPrimary = isDark ? '#fff' : 'rgba(15,23,42,0.94)';
  const surface1 = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.04)';
  const surfaceBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.14)';

  const [aspirantId, setAspirantId] = useState<number | null>(null);
  const [sopEnUrl, setSopEnUrl] = useState<string>(SOP_EN_URL);
  const [downloading, setDownloading] = useState(false);
  const [sopEn, setSopEn] = useState<UploadedFile | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Fetch aspirant data on mount — hydrate sopEn if already uploaded
  useEffect(() => {
    const id = user?.aspirantId;
    if (!id) return;
    setAspirantId(Number(id));
    getAspirantById(Number(id))
      .then((resp) => {
        const data = resp?.data ?? resp;
        if (!data) return;
        if (data.sopUrl) {
          setSopEn({ name: 'sop.pdf', size: 0, uploaded: true, progress: 100 });
        }
      })
      .catch(() => {});
  }, [user?.aspirantId]);

  // Fetch SOP download URL from admin documents
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get('/media/admin/documents');
        const docs = Array.isArray(res.data) ? res.data : (res.data?.documents || []);
        if (!mounted) return;
        const sop = docs.find((d: any) => d.documentType === 'sop');
        if (sop?.documentUrl) setSopEnUrl(sop.documentUrl);
      } catch {
        // keep default
      }
    })();
    return () => { mounted = false; };
  }, []);

  const downloadPdf = async (rawUrl: string, filename: string) => {
    // C-SEC-4: bail on script-capable schemes before fetch / window.open.
    const url = safeUrl(rawUrl);
    if (!url) return;
    setDownloading(true);
    try {
      const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isIos) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  const handleNext = async () => {
    try {
      await fetchProfile();
    } catch {
      // non-fatal
    }
    setSuccessDialogOpen(true);
  };

  const canProceed = !!sopEn?.uploaded;

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1, color: theme.palette.text.primary, fontFamily: FF_HEADING }}>
            {t('forms.aspirant.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: FF_BODY }}>
            {t('forms.aspirant.formSubtitle')}
          </Typography>
        </Box>
      </Box>
      <Box sx={{
        bgcolor: DARK,
        borderRadius: 2,
        overflow: 'hidden',
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(17,24,39,0.08)',
      }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}>
          <Box sx={{
            px: { xs: 2.5, sm: 4 },
            pt: 3.25,
            pb: 2.2,
            borderBottom: `1px solid ${cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <Box sx={{
              width: 52, minWidth: 52, height: 52, minHeight: 52,
              borderRadius: '12px',
              background: 'linear-gradient(135deg,rgba(200,24,10,.24),rgba(37,58,154,.22))',
              border: '1.5px solid rgba(245,168,0,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <UploadFileIcon sx={{ color: GOLD, fontSize: 28 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: { xs: '1.08rem', sm: '1.32rem' }, color: textPrimary }}>
                {t('forms.aspirant.documents.title')}
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* SOP section */}
        <Box sx={{ px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Grid container spacing={2.2}>

            {/* Download card */}
            <Grid size={12}>
              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Box sx={{ borderRadius: '11px', background: surface1, border: `1px solid ${surfaceBorder}`, overflow: 'hidden' }}>
                  <Box sx={{ height: '3px', bgcolor: '#C8180A' }} />
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileDownloadIcon sx={{ color: '#C8180A' }} />
                      <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, color: textPrimary, fontSize: '0.95rem' }}>
                        {t('forms.aspirant.documents.downloadSop') || 'Download SOP (English & Kannada)'}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1.6 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        disabled={downloading}
                        onClick={() => downloadPdf(sopEnUrl, 'SOP-English-Kannada.pdf')}
                        size="small"
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.78rem', py: 0.6, px: 1.5 }}
                      >
                        {downloading ? 'Downloading...' : (t('userDashboard.framePrompt.download') || 'Download')}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </Grid>

            {/* Upload card */}
            <Grid size={12}>
              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Box sx={{ borderRadius: 2, background: surface1, border: `1px solid ${surfaceBorder}`, p: 2 }}>
                  <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, mb: 1, color: textPrimary }}>
                    {t('forms.aspirant.documents.signAndUploadSop') || 'Sign and Upload SOP (English & Kannada)'}
                  </Typography>

                  {sopEn?.uploaded && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon sx={{ color: '#2fbf71', fontSize: 18 }} />
                      <Chip
                        label={sopEn.name}
                        size="small"
                        onDelete={() => setSopEn(null)}
                        sx={{
                          fontFamily: FF_BODY,
                          color: isDark ? '#d8ffe9' : '#0f5132',
                          bgcolor: isDark ? 'rgba(43,180,104,0.2)' : 'rgba(43,180,104,0.22)',
                          border: '1px solid rgba(43,180,104,0.38)',
                        }}
                      />
                    </Box>
                  )}

                  {sopEn?.error && (
                    <Alert severity="error" sx={{ mt: 1, mb: 1, py: 0.3, bgcolor: isDark ? 'rgba(255,65,65,0.08)' : 'rgba(255,65,65,0.12)', color: isDark ? '#ffd3d3' : '#8b1111' }}>
                      <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.76rem' }}>
                        {sopEn.errorKey ? t(sopEn.errorKey, { defaultValue: sopEn.errorKey }) : sopEn.errorMessage}
                      </Typography>
                    </Alert>
                  )}

                  {(() => {
                    const sopUploading = !!sopEn && !sopEn.uploaded && !sopEn.error;
                    return (
                      <Button
                        fullWidth
                        component="label"
                        variant="contained"
                        startIcon={sopUploading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CloudUploadIcon />}
                        disabled={sopEn?.uploaded || sopUploading}
                        size="small"
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.78rem', py: 0.6, px: 1.5 }}
                      >
                        {sopUploading
                          ? ((t('common.uploading') || 'Uploading…') + (sopEn?.progress ? ` ${sopEn.progress}%` : ''))
                          : (t('forms.aspirant.documents.signAndUpload') || 'Sign and Upload')}
                        <input
                          type="file"
                          hidden
                          accept=".pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const ext = file.name.split('.').pop()?.toLowerCase();
                            if (ext !== 'pdf' || (file.type && !file.type.includes('pdf'))) {
                              setSopEn({ name: file.name, size: file.size, uploaded: false, progress: 0, error: true, errorKey: 'forms.aspirant.messages.pdfOnly' });
                              e.target.value = '';
                              return;
                            }
                            if (file.size > 700 * 1024) {
                              setSopEn({ name: file.name, size: file.size, uploaded: false, progress: 0, error: true, errorKey: 'forms.aspirant.messages.fileSize700kb' });
                              e.target.value = '';
                              return;
                            }
                            if (!aspirantId) {
                              setSopEn({ name: file.name, size: file.size, uploaded: false, progress: 0, error: true, errorMessage: 'Missing aspirantId' });
                              return;
                            }

                            setSopEn({ name: file.name, size: file.size, uploaded: false, progress: 0 });

                            try {
                              const form = new FormData();
                              form.append('documentType', 'sop');
                              form.append('file', file, file.name);
                              await apiClient.post(`/media/aspirant/${aspirantId}/document`, form, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                                onUploadProgress: (ev) => {
                                  const pct = ev.total ? Math.round((ev.loaded / ev.total) * 100) : 0;
                                  setSopEn((prev) => prev ? { ...prev, progress: pct } : prev);
                                },
                              });
                              setSopEn({ name: file.name, size: file.size, uploaded: true, progress: 100 });
                            } catch (err: any) {
                              let errorKey = 'forms.aspirant.messages.uploadFailed';
                              let errorMessage: string | undefined;
                              if (err?.response?.status === 413) {
                                errorKey = 'forms.aspirant.messages.fileSize700kb';
                              } else if (err?.response?.data?.message) {
                                errorMessage = err.response.data.message;
                              }
                              setSopEn({ name: file.name, size: file.size, uploaded: false, progress: 0, error: true, errorKey, errorMessage });
                            } finally {
                              e.target.value = '';
                            }
                          }}
                        />
                      </Button>
                    );
                  })()}
                </Box>
              </motion.div>
            </Grid>

          </Grid>
        </Box>

        {/* Nav buttons */}
        <Box sx={{
          px: { xs: 2, sm: 4 },
          py: 2.4,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(17,24,39,0.02)',
          borderTop: `1px solid ${cardBorder}`,
        }}>
          <Stack direction="row" spacing={1.5} sx={{
            justifyContent: "space-between"
          }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => navigate('/user/dashboard', { replace: true })}
                sx={{
                  fontFamily: FF_HEADING, fontWeight: 700,
                  borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.22)',
                  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.6)',
                  '&:hover': { borderColor: 'rgba(245,168,0,0.45)', color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
                }}
              >
                {t('common.home')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/user/aspirants/documents')}
                sx={{
                  fontFamily: FF_HEADING, fontWeight: 700,
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.74)',
                  borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.22)',
                  '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
                }}
              >
                {t('forms.aspirant.navigation.back')}
              </Button>
            </Stack>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
              disabled={!canProceed}
              sx={{
                fontFamily: FF_HEADING, fontWeight: 800,
                px: { xs: 2.8, sm: 3.5 },
                background: 'linear-gradient(135deg,#C8180A 0%,#F5A800 100%)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(200,24,10,0.35)',
                '&:hover': { background: 'linear-gradient(135deg,#e01c0c 0%,#ffb800 100%)', boxShadow: '0 6px 24px rgba(200,24,10,0.55)' },
                '&.Mui-disabled': {
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)',
                  color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.38)',
                  boxShadow: 'none',
                },
              }}
            >
              {t('forms.aspirant.navigation.submit')}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', height: '3px' }}>
          {['#6B3A00', '#253A9A', '#C8180A'].map((c) => (
            <Box key={c} sx={{ flex: 1, bgcolor: c }} />
          ))}
        </Box>
      </Box>
      {/* Success dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => { setSuccessDialogOpen(false); navigate('/user/dashboard', { replace: true }); }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.74)' } },
          paper: {
            sx: {
              bgcolor: isDark ? '#0D0F12' : '#FFFFFF',
              color: theme.palette.text.primary,
              borderRadius: '16px',
              overflow: 'hidden',
              border: isDark ? '1px solid rgba(245,168,0,0.22)' : '1px solid rgba(245,168,0,0.3)',
              boxShadow: isDark
                ? '0 20px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset'
                : '0 20px 70px rgba(17,24,39,0.18), 0 0 0 1px rgba(15,23,42,0.04) inset',
              backgroundImage: isDark
                ? 'linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)'
                : 'linear-gradient(rgba(17,24,39,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(17,24,39,.02) 1px,transparent 1px)',
              backgroundSize: '44px 44px',
            },
          }
        }}
      >
        <Box sx={{ display: 'flex', height: '4px' }}>
          {['#C8180A', '#253A9A', '#6B3A00'].map((c) => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
        </Box>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Box sx={{
            width: 78, height: 78, borderRadius: '50%', mx: 'auto', mb: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,rgba(200,24,10,0.22),rgba(245,168,0,0.16))',
            border: '1.5px solid rgba(245,168,0,0.45)',
            '@keyframes votePulse': {
              '0%,100%': { boxShadow: '0 0 0 0 rgba(245,168,0,0.0), 0 0 22px rgba(200,24,10,0.22)' },
              '50%': { boxShadow: '0 0 0 8px rgba(245,168,0,0.06), 0 0 34px rgba(245,168,0,0.35)' },
            },
            animation: 'votePulse 2.4s ease-in-out infinite',
          }}>
            <HowToVoteIcon sx={{ fontSize: 42, color: '#F5A800' }} />
          </Box>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {t('forms.aspirant.successDialog.title')}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2, px: { xs: 3, sm: 5 } }}>
          <Typography variant="body1" sx={{ mb: 1, color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.74)' }}>
            {t('forms.aspirant.successDialog.message')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(15,23,42,0.9)' }}>
            {t('forms.aspirant.successDialog.thanks')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => { setSuccessDialogOpen(false); navigate('/user/dashboard', { replace: true }); }}
            sx={{
              px: 4, fontWeight: 800, color: '#fff', borderRadius: '10px',
              background: 'linear-gradient(135deg,#C8180A 0%,#F5A800 100%)',
              boxShadow: '0 8px 28px rgba(200,24,10,0.38)',
              '&:hover': { background: 'linear-gradient(135deg,#df210f 0%,#ffbe1a 100%)', boxShadow: '0 10px 34px rgba(200,24,10,0.52)' },
            }}
          >
            {t('common.ok')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default SopUploadPage;
