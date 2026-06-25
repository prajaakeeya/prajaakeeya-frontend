import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import SelfieLivenessCapture from '../SelfieLivenessCapture';
import { useTranslation } from 'react-i18next';
import { uploadAspirantDocument, uploadProfilePicture } from '../../services/mediaService';
import {
  Box,
  Typography,
  Stack,
  Button,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

const GOLD = '#F5A800';
const GOLDD = 'rgba(245,168,0,0.45)';
const DARK = '#0D0F12';
const BORDER = 'rgba(245,168,0,0.18)';
const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;

interface Props {
  cameraActive: boolean;
  capturedPhoto: string | null;
  loading: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  stopCamera: () => void;
  capturePhoto: () => void;
  retakePhoto: () => void;
  handleConfirmSelfie: () => void;
  onBack: () => void;
  startCamera?: () => void; // Optional for inline usage
  onSelfieCaptured?: (file: File) => void; // Enables MediaPipe liveness mode for "Take Photo"
  clearPhoto?: () => void; // Clear captured photo without starting raw camera
  aspirantId?: number; // Used for direct API upload
  onUploadSuccess?: (result: any) => void; // Called after successful auto-upload
  onUploadError?: (error: any) => void; // Called when auto-upload fails
  alreadyUploaded?: boolean; // True when photo was already uploaded in a previous session (draft restore)
  uploadedPhotoUrl?: string | null; // Server URL of already-uploaded photo to show as preview
}

const LivePhotoCaptureStep = ({
  cameraActive,
  capturedPhoto,
  loading,
  videoRef,
  canvasRef,
  stopCamera,
  capturePhoto,
  retakePhoto,
  handleConfirmSelfie,
  // gallery upload removed
  onBack,
  startCamera,
  onSelfieCaptured,
  clearPhoto,
  aspirantId,
  onUploadSuccess,
  onUploadError,
  alreadyUploaded,
  uploadedPhotoUrl,
}: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? DARK : 'linear-gradient(180deg,#fffdfa 0%,#f9f4ec 100%)';
  const cardBorder = isDark ? BORDER : 'rgba(245,168,0,0.24)';
  const textPrimary = isDark ? '#fff' : 'rgba(15,23,42,0.94)';
  const textSecondary = isDark ? 'rgba(255,255,255,0.56)' : 'rgba(15,23,42,0.62)';
  const [showLiveness, setShowLiveness] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset facingMode to front whenever the raw camera becomes active
  useEffect(() => {
    if (cameraActive) setFacingMode('user');
  }, [cameraActive]);

  // Switch between front and back camera without touching business logic
  const switchCamera = async () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(t => t.stop());
    const tryGet = async (constraint: MediaTrackConstraints) => {
      const s = await navigator.mediaDevices.getUserMedia({ video: constraint, audio: false });
      if (videoRef.current) videoRef.current.srcObject = s;
      setFacingMode(next);
    };
    try {
      await tryGet({ facingMode: { exact: next } });
    } catch {
      try {
        await tryGet({ facingMode: next });
      } catch (err) {
        console.error('Camera switch failed:', err);
        // Restore original stream
        try {
          const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
          if (videoRef.current) videoRef.current.srcObject = s;
        } catch {
          // Ignore restore failure
        }
      }
    }
  };

  // ── Internal auto-upload state ────────────────────────────────────────────
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>(
    alreadyUploaded ? 'success' : 'idle'
  );
  const [uploadErrorKey, setUploadErrorKey] = useState('');
  // Prevents the raw-camera useEffect from double-uploading when liveness/gallery
  // paths already called performUpload directly. Also set when the photo was
  // restored from a prior session so we don't re-upload on refresh.
  const uploadTriggeredRef = useRef(!!alreadyUploaded);

  // Sync uploadStatus when alreadyUploaded changes (e.g. after async server fetch on mount)
  useEffect(() => {
    if (alreadyUploaded && uploadStatus === 'idle') {
      setUploadStatus('success');
      uploadTriggeredRef.current = true;
    }
  }, [alreadyUploaded]);

  // Validate file before upload — returns an i18n key on failure
  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
      return 'forms.aspirant.messages.galleryImageOnly';
    }
    if (file.size > 20 * 1024 * 1024) {
      return 'forms.aspirant.messages.fileSize10mb';
    }
    return null;
  };

  // Core upload function used by all three capture paths
  const performUpload = async (file: File) => {
    const errorKey = validateFile(file);
    if (errorKey) {
      setUploadErrorKey(errorKey);
      setUploadStatus('error');
      onUploadError?.(new Error(errorKey));
      return;
    }

    setUploadStatus('uploading');
    setUploadErrorKey('');

    try {
      let result: any;
      if (aspirantId) {
        result = await uploadAspirantDocument(aspirantId, 'selfie', file);
      } else {
        result = await uploadProfilePicture(file);
      }
      setUploadStatus('success');
      onUploadSuccess?.(result);
    } catch (err: any) {
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        setUploadErrorKey('forms.aspirant.messages.uploadTimeout');
      } else if (!navigator.onLine || err?.message === 'Network Error') {
        setUploadErrorKey('forms.aspirant.messages.networkError');
      } else {
        setUploadErrorKey(err?.response?.data?.message || 'forms.aspirant.messages.profilePictureUploadFailed');
      }
      setUploadStatus('error');
      onUploadError?.(err);
    }
  };

  // Handle file selection from gallery/file picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected
    e.target.value = '';
    // Reset upload state for re-upload
    setUploadStatus('idle');
    setUploadErrorKey('');
    uploadTriggeredRef.current = true;
    // Show preview via onSelfieCaptured if available, otherwise use a data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (onSelfieCaptured) {
        onSelfieCaptured(file);
      }
    };
    reader.readAsDataURL(file);
    performUpload(file);
  };

  // Auto-upload for raw-camera capture path:
  // capturedPhoto is set by the parent after capturePhoto() draws to canvas.
  useEffect(() => {
    if (capturedPhoto && !uploadTriggeredRef.current) {
      uploadTriggeredRef.current = true;
      fetch(capturedPhoto)
        .then((r) => r.blob())
        .then((blob) => {
          const file = new File([blob], 'selfie.png', { type: blob.type || 'image/png' });
          performUpload(file);
        })
        .catch((err) => {
          setUploadErrorKey('forms.aspirant.messages.profilePictureUploadFailed');
          setUploadStatus('error');
          onUploadError?.(err);
        });
    }
    if (!capturedPhoto) {
      // Reset when photo is cleared (retake)
      uploadTriggeredRef.current = false;
      setUploadStatus('idle');
      setUploadErrorKey('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedPhoto]);

  // gallery upload removed

  return (
    <Box sx={{
      bgcolor: DARK,
      borderRadius: 2,
      overflow: 'hidden',
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(17,24,39,0.08)',
    }}>
      <Box sx={{ display: 'flex', height: '5px' }}>
        {['#C8180A', '#253A9A', '#6B3A00'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
      </Box>
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
            width: 52,
            height: 52,
            borderRadius: '12px',
            background: 'linear-gradient(135deg,rgba(200,24,10,.24),rgba(37,58,154,.22))',
            border: '1.5px solid rgba(245,168,0,.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CameraAltIcon sx={{ color: GOLD, fontSize: 28 }} />
          </Box>
          <Box>
            <Typography sx={{
              fontFamily: FF_BODY,
              fontWeight: 800,
              fontSize: { xs: '1.08rem', sm: '1.32rem' },
              color: textPrimary,
            }}>
              {t('forms.aspirant.livePhoto.title')}
            </Typography>
            <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.84rem', color: textSecondary }}>
              {t('forms.aspirant.livePhoto.subtitle')}
            </Typography>
          </Box>
        </Box>
      </motion.div>
      <Box sx={{ px: { xs: 2, sm: 4 }, py: 2.8 }}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Stack spacing={3} sx={{
            alignItems: "center"
          }}>
            {!cameraActive && !capturedPhoto && !showLiveness && uploadStatus !== 'success' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <Stack spacing={2.2} sx={{
                  alignItems: "center"
                }}>
                  <CameraAltIcon sx={{ fontSize: 80, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)' }} />
                  <Typography sx={{ fontFamily: FF_BODY, color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.78)', textAlign: 'center' }}>
                    {t('forms.aspirant.livePhoto.description')}
                  </Typography>
                  <Alert severity="info" sx={{ width: '100%', bgcolor: isDark ? 'rgba(50,95,180,0.15)' : 'rgba(50,95,180,0.12)', color: isDark ? '#dfe9ff' : '#163b7a' }}>
                    <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.82rem', fontWeight: 600, mb: 0.4 }}>
                      {t('forms.aspirant.livePhoto.instructions')}
                    </Typography>
                  </Alert>
                  {startCamera && (
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<CameraAltIcon />}
                      onClick={() => { if (onSelfieCaptured) { setShowLiveness(true); } else { startCamera?.(); } }}
                      sx={{
                        py: 1.35,
                        fontFamily: FF_BODY,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg,#C8180A 0%,#F5A800 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 20px rgba(200,24,10,0.35)',
                        '&:hover': {
                          background: 'linear-gradient(135deg,#e01c0c 0%,#ffb800 100%)',
                          boxShadow: '0 6px 24px rgba(200,24,10,0.55)',
                        },
                      }}
                    >
                      {t('forms.aspirant.livePhoto.takePhoto')}
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<PhotoLibraryIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      py: 1.35,
                      fontFamily: FF_BODY,
                      fontWeight: 700,
                      color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.8)',
                      borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.2)',
                      '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
                    }}
                  >
                    {t('forms.aspirant.livePhoto.uploadFromFile', { defaultValue: 'Upload From File' })}
                  </Button>
                </Stack>
              </motion.div>
            )}

            {showLiveness && !capturedPhoto && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ width: '100%' }}>
                <Stack spacing={2} sx={{
                  alignItems: "center"
                }}>
                  <SelfieLivenessCapture
                    onCaptured={(file) => {
                      // Mark as triggered so the useEffect won't double-upload
                      uploadTriggeredRef.current = true;
                      onSelfieCaptured!(file);
                      setShowLiveness(false);
                      performUpload(file);
                    }}
                    onError={(msg) => console.error('Liveness capture error:', msg)}
                  />
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setShowLiveness(false)}
                    sx={{
                      width: 260,
                      py: '11px',
                      borderRadius: '28px',
                      fontFamily: FF_BODY,
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: '0.3px',
                      color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.8)',
                      borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.2)',
                      '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
                    }}
                  >
                    {t('forms.aspirant.navigation.back', { defaultValue: 'Back' })}
                  </Button>
                </Stack>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: cameraActive && !capturedPhoto && !showLiveness ? 1 : 0, scale: cameraActive && !capturedPhoto && !showLiveness ? 1 : 0.98 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', display: cameraActive && !capturedPhoto && !showLiveness ? 'block' : 'none' }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 360,
                  aspectRatio: '1',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  bgcolor: '#000',
                  mx: 'auto',
                  boxShadow: '0 0 0 2px rgba(245,168,0,0.18), 0 10px 30px rgba(0,0,0,0.35)',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#000',
                    display: 'block',
                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '70%',
                    height: '70%',
                    border: '3px solid white',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)',
                  }}
                />
              </Box>
            </motion.div>

            {cameraActive && !capturedPhoto && !showLiveness && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
                <Stack spacing={1.2} sx={{
                  alignItems: "center"
                }}>
                  <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.7)' }}>
                    {t('forms.aspirant.livePhoto.alignFace')}
                  </Typography>
                  <Stack direction="row" spacing={1.4}>
                    {/* Cancel button intentionally removed to prevent early exit during live capture */}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={switchCamera}
                      title={facingMode === 'user' ? 'Switch to back camera' : 'Switch to front camera'}
                      sx={{
                        fontFamily: FF_BODY,
                        minWidth: 'auto',
                        px: 1.2,
                        color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.78)',
                        borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.2)',
                        '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
                      }}
                    >
                      <CameraswitchIcon fontSize="small" />
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CameraAltIcon />}
                      onClick={capturePhoto}
                      sx={{
                        fontFamily: FF_BODY,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg,#C8180A 0%,#F5A800 100%)',
                        color: '#fff',
                        '&:hover': { background: 'linear-gradient(135deg,#e01c0c 0%,#ffb800 100%)' },
                      }}
                    >
                      {t('forms.aspirant.livePhoto.capture')}
                    </Button>
                  </Stack>
                </Stack>
              </motion.div>
            )}

            {uploadStatus === 'success' && !capturedPhoto && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Stack spacing={1.6} sx={{
                  alignItems: "center"
                }}>
                  <Box sx={{
                    width: 200, height: 200, borderRadius: '50%',
                    overflow: 'hidden',
                    boxShadow: '0 0 0 2px rgba(43,180,104,0.45), 0 10px 30px rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                  }}>
                    {uploadedPhotoUrl ? (
                      <img
                        src={uploadedPhotoUrl}
                        alt="Uploaded"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50' }} />
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.8} sx={{
                    alignItems: "center"
                  }}>
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                    <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.88rem', color: '#4caf50', fontWeight: 700 }}>
                      {t('common.uploaded') || 'Uploaded!'}
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CameraswitchIcon />}
                    onClick={() => {
                      setUploadStatus('idle');
                      uploadTriggeredRef.current = false;
                      if (onSelfieCaptured && clearPhoto) { clearPhoto(); setShowLiveness(true); } else { retakePhoto?.(); }
                    }}
                    sx={{
                      fontFamily: FF_HEADING, fontWeight: 700,
                      color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.8)',
                      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.2)',
                      '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
                    }}
                  >
                    {t('forms.aspirant.livePhoto.retake')}
                  </Button>
                </Stack>
              </motion.div>
            )}

            {capturedPhoto && (
              <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <Stack spacing={1.6} sx={{
                  alignItems: "center"
                }}>
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 200,
                      aspectRatio: '1',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      boxShadow: '0 0 0 2px rgba(245,168,0,0.2), 0 10px 30px rgba(0,0,0,0.35)',
                    }}
                  >
                    <img
                      src={capturedPhoto}
                      alt="Captured"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                  <Stack spacing={1} sx={{
                    alignItems: "center"
                  }}>
                    {/* Error message shown above the button */}
                    {uploadStatus === 'error' && (
                      <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.78rem', color: '#ef5350', textAlign: 'center' }}>
                        {uploadErrorKey ? t(uploadErrorKey, { defaultValue: uploadErrorKey }) : t('forms.aspirant.messages.profilePictureUploadFailed', { defaultValue: 'Upload failed.' })}
                      </Typography>
                    )}

                    {/* Upload status indicators */}
                    {uploadStatus === 'uploading' && (
                      <Stack direction="row" spacing={0.8} sx={{
                        alignItems: "center"
                      }}>
                        <CircularProgress size={16} sx={{ color: GOLD }} />
                        <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)' }}>
                          {t('common.uploading') || 'Uploading…'}
                        </Typography>
                      </Stack>
                    )}

                    {uploadStatus === 'success' && (
                      <Stack direction="row" spacing={0.8} sx={{
                        alignItems: "center"
                      }}>
                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                        <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.82rem', color: '#4caf50', fontWeight: 700 }}>
                          {t('common.uploaded') || 'Uploaded!'}
                        </Typography>
                      </Stack>
                    )}

                    <Stack direction="row" spacing={1.2}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CameraswitchIcon />}
                        onClick={() => { if (onSelfieCaptured && clearPhoto) { clearPhoto(); setShowLiveness(true); } else { retakePhoto(); } }}
                        disabled={uploadStatus === 'uploading'}
                        sx={{
                          whiteSpace: 'nowrap',
                          minWidth: 'auto',
                          px: 1.5,
                          fontFamily: FF_BODY,
                          color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.8)',
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.2)',
                          '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
                        }}
                      >
                        {t('forms.aspirant.livePhoto.retake')}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadStatus === 'uploading'}
                        sx={{
                          whiteSpace: 'nowrap',
                          minWidth: 'auto',
                          px: 1.5,
                          fontFamily: FF_BODY,
                          color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.8)',
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.2)',
                          '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
                        }}
                      >
                        {t('forms.aspirant.livePhoto.uploadFromFile', { defaultValue: 'Upload' })}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </motion.div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Stack>
        </Box>
      </Box>
      {/* <Box sx={{
        px: { xs: 2, sm: 4 },
        py: 2.4,
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(17,24,39,0.02)',
        borderTop: `1px solid ${cardBorder}`,
      }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            fontFamily: FF_BODY,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.74)',
            borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.22)',
            '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
          }}
        >
          {t('forms.aspirant.navigation.back')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', height: '3px' }}>
        {['#6B3A00', '#253A9A', '#C8180A'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
      </Box> */}
    </Box>
  );
};

export default LivePhotoCaptureStep;
