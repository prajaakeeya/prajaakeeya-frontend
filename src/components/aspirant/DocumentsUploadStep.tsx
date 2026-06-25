import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button,
  Alert,
  LinearProgress,
  Chip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import apiClient from '../../services/apiClient';
import LivePhotoCaptureStep from './LivePhotoCaptureStep';
import { safeUrl } from '../../utils/safeUrl';

const GOLD = '#F5A800';
const GOLDD = 'rgba(245,168,0,0.45)';
const DARK = '#0D0F12';
const BORDER = 'rgba(245,168,0,0.18)';
const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

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

type DocKey = 'resume' | 'epic' | 'epicBack' | 'addressProof' | 'signedAgreement' | 'photo';
type DocumentsState = Record<DocKey | 'codeOfConduct' | 'sopEn' | 'sopKn', UploadedFile | null>;

interface Props {
  documents: DocumentsState;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentsState>>;
  handleFileUpload: (docType: keyof DocumentsState) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onNext: () => void;
  onCancel?: () => void;
  canProceed?: boolean;
  submitButtonText?: string; // Custom text for the submit button
  // Live photo capture props
  cameraActive?: boolean;
  capturedPhoto?: string | null;
  loading?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  startCamera?: () => void;
  stopCamera?: () => void;
  capturePhoto?: () => void;
  retakePhoto?: () => void;
  handleConfirmSelfie?: () => void;
  onSelfieCaptured?: (file: File) => void;
  clearPhoto?: () => void;
  aspirantId?: number | null;
  onAspirantUpdated?: (data: any) => void;
  uploadedPhotoUrl?: string | null;
}

const DOC_CONFIG: Array<{
  key: DocKey;
  titleKey: string;
  formatKey: string;
  buttonKey: string;
  accept: string;
  accent: string;
}> = [
    // Resume removed — not required
    // EPIC / Voter ID (Front & Back) removed
    // Recent Photo upload removed
  ];

const DocumentsUploadStep = ({
  documents,
  setDocuments,
  handleFileUpload,
  onBack,
  onNext,
  canProceed,
  submitButtonText,
  cameraActive,
  capturedPhoto,
  loading,
  videoRef,
  canvasRef,
  startCamera,
  stopCamera,
  capturePhoto,
  retakePhoto,
  handleConfirmSelfie,

  onSelfieCaptured,
  clearPhoto,
  aspirantId,
  onAspirantUpdated,
  uploadedPhotoUrl,
}: Props) => {
  const { t } = useTranslation();
  // Placeholder SOP download URLs — replace with actual hosted files
  const SOP_EN_URL = '/documents/SOP-English.pdf';
  const SOP_KN_URL = '/documents/SOP-Kannada.pdf';
  const theme = useTheme();

  const [sopEnUrl, setSopEnUrl] = useState<string>(SOP_EN_URL);
  const [sopKnUrl, setSopKnUrl] = useState<string>(SOP_KN_URL);
  const [downloading, setDownloading] = useState(false);

  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const downloadPdf = async (rawUrl: string, filename: string) => {
    // C-SEC-4: bail on script-capable schemes before fetch / window.open.
    const url = safeUrl(rawUrl);
    if (!url) { return; }
    setDownloading(true);

    // iOS Safari ignores the download attribute entirely — open in new tab
    // so the user can use the Share sheet to save the file
    if (isIOS()) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setDownloading(false);
      return;
    }

    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Delay revoke so the browser has time to start the download
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      // Fallback (e.g. CORS-blocked cross-origin URL): open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get('/media/admin/documents');
        const docs = Array.isArray(res.data) ? res.data : (res.data?.documents || []);
        if (!mounted) return;
        const sop = docs.find((d: any) => d.documentType === 'sop');
        const sopKn = docs.find((d: any) => d.documentType === 'sop_kannada');
        if (sop && sop.documentUrl) setSopEnUrl(sop.documentUrl);
        if (sopKn && sopKn.documentUrl) setSopKnUrl(sopKn.documentUrl);
      } catch (e) {
        // ignore — keep defaults
      }
    })();
    return () => { mounted = false; };
  }, []);
  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? DARK : 'linear-gradient(180deg,#fffdfa 0%,#f9f4ec 100%)';
  const cardBorder = isDark ? BORDER : 'rgba(245,168,0,0.24)';
  const textPrimary = isDark ? '#fff' : 'rgba(15,23,42,0.94)';
  const textSecondary = isDark ? 'rgba(255,255,255,0.56)' : 'rgba(15,23,42,0.62)';
  const surface1 = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.04)';
  const surfaceBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.14)';

  return (
    <Box sx={{
      bgcolor: DARK,
      borderRadius: 2,
      overflow: 'hidden',
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(17,24,39,0.08)',
    }}>
      {/* Live Photo Capture Section */}
      {cameraActive !== undefined &&
        capturedPhoto !== undefined &&
        loading !== undefined &&
        videoRef &&
        canvasRef &&
        stopCamera &&
        capturePhoto &&
        retakePhoto &&
        handleConfirmSelfie && (
          <Box sx={{ mt: 3 }}>
            <motion.div variants={itemVariants}>
              <LivePhotoCaptureStep
                cameraActive={cameraActive!}
                capturedPhoto={capturedPhoto!}
                loading={loading!}
                videoRef={videoRef!}
                canvasRef={canvasRef!}
                startCamera={startCamera}
                stopCamera={stopCamera!}
                capturePhoto={capturePhoto!}
                retakePhoto={retakePhoto!}
                handleConfirmSelfie={handleConfirmSelfie!}

                onBack={() => { }} // Not needed for inline use
                onSelfieCaptured={onSelfieCaptured}
                clearPhoto={clearPhoto}
                aspirantId={aspirantId ?? undefined}
                alreadyUploaded={!!documents.photo?.uploaded}
                uploadedPhotoUrl={uploadedPhotoUrl}
                onUploadSuccess={(result) => {
                  // Mark photo as uploaded so the parent can proceed
                  setDocuments(prev => ({ ...prev, photo: { name: 'selfie.png', size: 0, uploaded: true, progress: 100 } }));
                  // Notify parent page so it can refresh aspirant/profile state
                  try { onAspirantUpdated?.(result); } catch (e) { /* ignore */ }
                }}
                onUploadError={(err) => {
                  // Optional: mark photo as errored in documents state
                  setDocuments(prev => ({ ...prev, photo: { name: 'selfie.png', size: 0, uploaded: false, progress: 0, error: true, errorKey: 'forms.aspirant.messages.profilePictureUploadFailed' } }));
                  try { onAspirantUpdated?.(null); } catch (e) { /* ignore */ }
                }}
              />
            </motion.div>
          </Box>
        )}
      <Box sx={{ display: 'flex', height: '5px' }}>
        {['#C8180A', '#253A9A', '#6B3A00'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
      </Box>
      <Box sx={{ px: { xs: 2, sm: 4 }, py: 2.5 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={2.2}>
            {DOC_CONFIG.map((doc) => {
              const current = documents[doc.key];
              return (
                <Grid
                  key={doc.key}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <motion.div variants={itemVariants}>
                    <Box sx={{
                      borderRadius: '11px',
                      background: surface1,
                      border: `1px solid ${surfaceBorder}`,
                      overflow: 'hidden',
                      transition: 'all .25s ease',
                      '&:hover': { borderColor: 'rgba(245,168,0,.35)', transform: 'translateY(-1px)' },
                    }}>
                      <Box sx={{ height: '3px', bgcolor: doc.accent }} />
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <UploadFileIcon sx={{ color: doc.accent }} />
                          <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, color: textPrimary, fontSize: '0.9rem' }}>
                            {t(doc.titleKey)}
                          </Typography>
                          {current?.uploaded && <CheckCircleIcon sx={{ ml: 'auto', color: '#2fbf71' }} />}
                          {current?.error && <ErrorIcon sx={{ ml: 'auto', color: '#ff6d6d' }} />}
                        </Box>

                        <Typography sx={{ mt: 0.8, fontFamily: FF_BODY, fontSize: '0.78rem', color: textSecondary }}>
                          {t(doc.formatKey)}
                        </Typography>

                        {current?.error && (
                          <Alert severity="error" sx={{ mt: 1.2, py: 0.3, bgcolor: isDark ? 'rgba(255,65,65,0.08)' : 'rgba(255,65,65,0.12)', color: isDark ? '#ffd3d3' : '#8b1111' }}>
                            <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.76rem' }}>{current.errorKey ? t(current.errorKey, { defaultValue: current.errorKey }) : current.errorMessage}</Typography>
                          </Alert>
                        )}

                        {current && !current.uploaded && !current.error && (
                          <Box sx={{ mt: 1.2 }}>
                            <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.76rem', color: isDark ? 'rgba(255,255,255,0.62)' : 'rgba(15,23,42,0.72)' }}>
                              {current.name}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={current.progress}
                              sx={{
                                mt: 0.9,
                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)',
                                '& .MuiLinearProgress-bar': { bgcolor: doc.accent },
                              }}
                            />
                          </Box>
                        )}

                        {current?.uploaded && (
                          <Chip
                            label={current.name}
                            onDelete={() => setDocuments(prev => ({ ...prev, [doc.key]: null }))}
                            size="small"
                            sx={{
                              mt: 1.2,
                              fontFamily: FF_BODY,
                              color: isDark ? '#d8ffe9' : '#0f5132',
                              bgcolor: isDark ? 'rgba(43,180,104,0.2)' : 'rgba(43,180,104,0.22)',
                              border: '1px solid rgba(43,180,104,0.38)',
                            }}
                          />
                        )}

                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          disabled={current?.uploaded}
                          onClick={() => {
                            if (current?.error) {
                              setDocuments(prev => ({ ...prev, [doc.key]: null }));
                            }
                          }}
                          sx={{
                            mt: 1.6,
                            fontFamily: FF_BODY,
                            fontWeight: 700,
                            color: isDark ? 'rgba(255,255,255,0.76)' : 'rgba(15,23,42,0.8)',
                            borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.2)',
                            '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
                            '&.Mui-disabled': { color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(15,23,42,0.36)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)' },
                          }}
                        >
                          {t(doc.buttonKey)}
                          <input type="file" hidden accept={doc.accept} onChange={handleFileUpload(doc.key)} />
                        </Button>
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>




        </motion.div>
      </Box>
      <Box sx={{
        px: { xs: 2, sm: 4 },
        py: 2.4,
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(17,24,39,0.02)',
        borderTop: `1px solid ${cardBorder}`,
      }}>
        <Stack direction="row" spacing={1.5} sx={{ ml: 'auto', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          <Stack direction="row" spacing={1} sx={{ flex: { xs: 1, sm: 'none' } }}>
            {/* Home button — commented out per request. To restore: uncomment this
                block and re-add `onCancel` to the props destructure above.
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                sx={{
                  fontFamily: FF_BODY,
                  fontWeight: 700,
                  borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.22)',
                  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.6)',
                  '&:hover': { borderColor: 'rgba(245,168,0,0.45)', color: '#F5A800', bgcolor: 'rgba(245,168,0,0.06)' },
                }}
              >
                {t('common.home')}
              </Button>
            )}
            */}
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                fontFamily: FF_BODY,
                fontWeight: 700,
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
            onClick={onNext}
            disabled={!canProceed}
            sx={{
              flex: { xs: 1, sm: 'none' },
              width: { xs: '100%', sm: 'auto' },
              fontFamily: FF_BODY,
              fontWeight: 800,
              px: { xs: 2.8, sm: 3.5 },
              background: 'linear-gradient(135deg,#C8180A 0%,#F5A800 100%)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(200,24,10,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg,#e01c0c 0%,#ffb800 100%)',
                boxShadow: '0 6px 24px rgba(200,24,10,0.55)',
              },
              '&.Mui-disabled': {
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)',
                color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.38)',
                boxShadow: 'none'
              },
            }}
          >
            {submitButtonText || t('forms.aspirant.navigation.next')}
          </Button>
        </Stack>
      </Box>
      <Box sx={{ display: 'flex', height: '3px' }}>
        {['#6B3A00', '#253A9A', '#C8180A'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
      </Box>
    </Box>
  );
};

export default DocumentsUploadStep;
