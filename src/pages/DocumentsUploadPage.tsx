import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Snackbar,
  Alert,
  Box,
  Button,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import { HowToVote as HowToVoteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { isFileSizeValid } from '../utils/fileUtils';
import { uploadAspirantDocument, uploadProfilePicture } from '../services/mediaService';
import { getAspirantById } from '../services/aspirantService';
import DocumentsUploadStep from '../components/aspirant/DocumentsUploadStep';

interface UploadedFile {
  name: string;
  size: number;
  uploaded: boolean;
  progress: number;
  error?: boolean;
  errorMessage?: string;
}

const DocumentsUploadPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState({
    resume: null as UploadedFile | null,
    epic: null as UploadedFile | null,
    epicBack: null as UploadedFile | null,
    addressProof: null as UploadedFile | null,
    photo: null as UploadedFile | null,
    signedAgreement: null as UploadedFile | null,
    codeOfConduct: null as UploadedFile | null,
    sopEn: null as UploadedFile | null,
    sopKn: null as UploadedFile | null,
  });
  const [aspirantResp, setAspirantResp] = useState<any | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = theme.palette.mode === 'dark';

  // Release the camera (camera/LED off) when the page unmounts — e.g. the user
  // navigates away while the camera is still active. Without this the
  // MediaStream tracks keep running after the component is gone. Self-contained
  // (reads videoRef directly) so it always stops whatever stream is current,
  // including one swapped in by the front/back camera switch.
  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  // Load aspirant data on mount and hydrate already-uploaded documents from server
  useEffect(() => {
    const aspirantId = user?.aspirantId;
    if (!aspirantId) return;
    getAspirantById(Number(aspirantId))
      .then((resp) => {
        const data = resp?.data ?? resp;
        setAspirantResp(data);
        if (!data) return;
        const uploadedMarker = (name: string): UploadedFile => ({
          name,
          size: 0,
          uploaded: true,
          progress: 100,
        });
        setDocuments((prev) => ({
          ...prev,
          photo:
            data.selfieUrl || data.recentPhotoUrl
              ? uploadedMarker('selfie.png')
              : prev.photo,
          // sopEn: data.sopUrl ? uploadedMarker('sop.pdf') : prev.sopEn,
        }));
      })
      .catch(() => {});
  }, [user?.aspirantId]);

  const canProceedStep4 = !!documents.photo?.uploaded;

  const handleHome = () => {
    navigate('/user/dashboard', { replace: true });
  };

  const handleFileUpload = (docType: keyof typeof documents) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!isFileSizeValid(file)) {
        setDocuments((prev) => ({
          ...prev,
          [docType]: {
            name: file.name,
            size: file.size,
            uploaded: false,
            progress: 0,
            error: true,
            errorMessage: t('forms.aspirant.messages.fileSize2mb'),
          },
        }));
        event.target.value = '';
        return;
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let isValidType = false;
      let errorMessage = '';

      switch (docType) {
        case 'resume':
          isValidType = fileExtension === 'pdf';
          errorMessage = t('forms.aspirant.messages.resumePdfOnly');
          break;
        case 'epic':
        case 'epicBack':
          isValidType = ['jpg', 'jpeg', 'png'].includes(fileExtension || '');
          errorMessage = t('forms.aspirant.messages.epicImageOnly');
          break;
        case 'addressProof':
          isValidType = ['jpg', 'jpeg', 'png'].includes(fileExtension || '');
          errorMessage = t('forms.aspirant.messages.addressProofImageOnly');
          break;
        case 'photo':
          isValidType = ['jpg', 'jpeg', 'png'].includes(fileExtension || '');
          errorMessage = t('forms.aspirant.messages.photoImageOnly');
          break;
        case 'signedAgreement':
        case 'codeOfConduct':
          isValidType = fileExtension === 'pdf';
          errorMessage = t('forms.aspirant.messages.pdfOnly');
          break;
        default:
          isValidType = true;
      }

      if (!isValidType) {
        setDocuments((prev) => ({
          ...prev,
          [docType]: {
            name: file.name,
            size: file.size,
            uploaded: false,
            progress: 0,
            error: true,
            errorMessage: errorMessage,
          },
        }));
        event.target.value = '';
        return;
      }

      const uploadedFile: UploadedFile = { name: file.name, size: file.size, uploaded: false, progress: 10 };
      setDocuments((prev) => ({ ...prev, [docType]: uploadedFile }));

      const aspirantId = aspirantResp?.id ?? user?.aspirantId ?? null;
      if (!aspirantId) {
        setError(t('forms.aspirant.messages.missingAspirantRecord'));
        setOpen(true);
        event.target.value = '';
        return;
      }

      const docTypeMap: Record<string, string> = {
        resume: 'resume',
        epic: 'epic_card',
        epicBack: 'epic_card_back',
        addressProof: 'address_proof',
        photo: 'recent_photo',
        signedAgreement: 'agreement',
        codeOfConduct: 'code_of_conduct',
      };

      const apiDocType = docTypeMap[docType] || String(docType);

      (async () => {
        try {
          setLoading(true);
          const result = await uploadAspirantDocument(Number(aspirantId), apiDocType, file);
          setDocuments((prev) => ({
            ...prev,
            [docType]: { name: file.name, size: file.size, uploaded: true, progress: 100 },
          }));
          setAspirantResp(result ?? aspirantResp);
          event.target.value = '';
        } catch (err: any) {
          console.error('Document upload failed', err?.response?.data || err);
          const status = err?.response?.status;
          const code = err?.code;
          let errorMsg = t('forms.aspirant.messages.uploadFailed');
          if (status === 413) {
            errorMsg = t('forms.aspirant.messages.fileSize10mb');
          } else if (code === 'ERR_NETWORK' || !err?.response) {
            errorMsg = t('forms.aspirant.messages.uploadFailedMaybeLarge');
          } else {
            errorMsg = err?.response?.data?.message || err?.message || t('forms.aspirant.messages.uploadFailed');
          }
          setDocuments((prev) => ({
            ...prev,
            [docType]: {
              name: file.name,
              size: file.size,
              uploaded: false,
              progress: 0,
              error: true,
              errorMessage: errorMsg,
            },
          }));
          event.target.value = '';
        } finally {
          setLoading(false);
        }
      })();
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      if (!videoRef.current) {
        setError(t('forms.aspirant.messages.cameraNotReady'));
        return;
      }

      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError(t('forms.aspirant.messages.cameraStartError'));
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        const offsetX = (video.videoWidth - size) / 2;
        const offsetY = (video.videoHeight - size) / 2;
        context.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
        const imageData = canvasRef.current.toDataURL('image/png');
        setCapturedPhoto(imageData);
        setError('');
        setOpen(false);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleAspirantSelfieCaptured = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setCapturedPhoto(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setCapturedPhoto(null);
  };

  const handleConfirmSelfie = async () => {
    if (!capturedPhoto) {
      setError(t('forms.aspirant.messages.noPhotoCaptured'));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      const file = new File([blob], 'selfie.png', { type: 'image/png' });
      const aspirantId = aspirantResp?.id ?? user?.aspirantId ?? null;
      let result: any = null;
      if (aspirantId) {
        result = await uploadAspirantDocument(Number(aspirantId), 'selfie', file);
      } else {
        result = await uploadProfilePicture(file);
      }

      setDocuments((prev) => ({
        ...prev,
        photo: { name: 'selfie.png', size: blob.size || 0, uploaded: true, progress: 100 },
      }));
      setAspirantResp(result ?? aspirantResp);
      try {
        if (typeof fetchProfile === 'function') {
          await fetchProfile();
        }
      } catch (e) {
        console.warn('fetchProfile failed after selfie upload', e);
      }

      try {
        window.dispatchEvent(
          new CustomEvent('aspirant:documentUploaded', {
            detail: { documentType: aspirantId ? 'selfie' : 'profile-picture' },
          })
        );
      } catch (e) {
        // ignore
      }

      setError('');
      stopCamera();
    } catch (err: any) {
      console.error('Profile picture upload failed', err?.response?.data || err);
      setError(
        err?.response?.data?.message || err?.message || t('forms.aspirant.messages.profilePictureUploadFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    // SOP upload step is disabled — finish registration here instead of navigating
    // to '/user/aspirants/sop'.
    try { await fetchProfile(); } catch { /* non-fatal */ }
    setSuccessDialogOpen(true);
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              color: theme.palette.text.primary,
              fontFamily: "'Baloo 2', sans-serif",
            }}
          >
            {t('forms.aspirant.title')}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, fontFamily: "'Baloo 2', sans-serif" }}
          >
            {t('forms.aspirant.formSubtitle')}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <DocumentsUploadStep
        documents={documents}
        setDocuments={setDocuments}
        handleFileUpload={handleFileUpload}
        onBack={() => navigate('/user/aspirants/register', { state: { resume: true } })}
        onNext={handleNext}
        onCancel={handleHome}
        canProceed={canProceedStep4}
        submitButtonText={t('forms.aspirant.navigation.submit')}
        cameraActive={cameraActive}
        capturedPhoto={capturedPhoto}
        loading={loading}
        videoRef={videoRef}
        canvasRef={canvasRef}
        startCamera={startCamera}
        stopCamera={stopCamera}
        capturePhoto={capturePhoto}
        retakePhoto={retakePhoto}
        handleConfirmSelfie={handleConfirmSelfie}
        onSelfieCaptured={handleAspirantSelfieCaptured}
        clearPhoto={clearPhoto}
        aspirantId={aspirantResp?.id ?? user?.aspirantId ?? null}
        uploadedPhotoUrl={aspirantResp?.selfieUrl || aspirantResp?.recentPhotoUrl || null}
        onAspirantUpdated={async (result) => {
          try {
            if (result) {
              setAspirantResp(result ?? aspirantResp);
            }
            try {
              await fetchProfile();
            } catch (e) {
              /* non-fatal */
            }
          } catch (e) {
            /* ignore */
          }
        }}
      />

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={error ? 'error' : 'success'} onClose={() => setOpen(false)}>
          {error || t('status.aspirantRegistered') || t('forms.aspirant.messages.applicationSubmitted')}
        </Alert>
      </Snackbar>

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

export default DocumentsUploadPage;
