import {
  Card,
  Button,
  Typography,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Avatar,
  IconButton
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  DownloadRounded as DownloadRoundedIcon,
  IosShare as IosShareIcon,
  AddAPhoto as AddAPhotoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';
import chatImg from '../assets/images/chat.webp';
import videoCameraImg from '../assets/images/video.webp';
import meetImg from '../assets/images/meet.webp';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { COOKIE_AUTH } from '../config/authMode';
import ActionTile from '../components/ActionTile';
import apiClient from '../services/apiClient';
import { fetchAllWards } from '../services/wardService';
import { getVoters } from '../services/voterService';
// C-PERF-4: Lazy-load the candidate list instead of a static import. The
// dashboard renders it inline (<WardCandidateListPage embedded /> below), so we
// can't drop it — but a static import merges its ~98 KB chunk into the
// dashboard chunk, defeating code-splitting. Lazy() keeps the same UX while
// splitting it into its own chunk that streams in behind the dashboard shell.
const WardCandidateListPage = React.lazy(() => import('./WardCandidateListPage'));

const UserDashboardPage = () => {
  const { user, token } = useAuthStore();

  // helper: normalize scheduledAt values (supports numeric strings, ISO strings, and numbers)
  const parseScheduledAt = (val: any): number | null => {
    if (val == null) return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      if (/^\d+$/.test(val)) return parseInt(val, 10);
      const ts = Date.parse(val);
      return isNaN(ts) ? null : ts;
    }
    return null;
  };


  const { t, i18n } = useTranslation();
  const isKannada = (i18n.language || '').startsWith('kn');
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-open photo frame dialog if navigated with state
  React.useEffect(() => {
    if ((location.state as any)?.openPhotoFrame) {
      setPhotoFrameOpen(true);
      // Clear state so it doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const isAspirant = user?.role === 'aspirant' && (user as any)?.documentStatus === 'completed';

  // Resolve ward name from API when user.wardName is missing
  const [resolvedWardName, setResolvedWardName] = React.useState<string>('');
  React.useEffect(() => {
    if (user?.wardName) { setResolvedWardName(user.wardName); return; }
    if (!user?.wardNumber) return;
    fetchAllWards()
      .then((resp) => {
        const wards: any[] = Array.isArray(resp.data) ? resp.data : [];
        const match = wards.find((w) => String(w.number) === String(user.wardNumber));
        if (match?.name) setResolvedWardName(match.name);
      })
      .catch(() => { /* ignore — ward name stays empty */ });
  }, [user?.wardNumber, user?.wardName]);

  // Total registered voters count, shown in the hero strip. Fetches a minimal
  // page (limit=1) since we only need the `totalUsers` field from the response.
  const [totalVoters, setTotalVoters] = React.useState<number | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    getVoters(1, 1)
      .then((resp) => {
        if (cancelled) return;
        const total = (resp?.data as any)?.totalUsers ?? (resp?.data as any)?.total ?? null;
        if (typeof total === 'number') setTotalVoters(total);
      })
      .catch(() => { /* ignore — count stays hidden */ });
    return () => { cancelled = true; };
  }, []);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  const [photoFrameOpen, setPhotoFrameOpen] = React.useState(false);
  const [selectedFrameIndex] = React.useState(0);
  const [photoFrameBusy, setPhotoFrameBusy] = React.useState(false);
  const [framePhoto, setFramePhoto] = React.useState<string | null>(null);
  const frameFileInputRef = React.useRef<HTMLInputElement>(null);
  const [photoFrameToast, setPhotoFrameToast] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [pendingAlertDismissed, setPendingAlertDismissed] = React.useState(false);
  const displayUser = user || {
    name: 'Voter User',
    relativeName: 'Ramesh Kumar',
    epicId: 'ABC1234567',
    wardName: 'Ward 101 - Central',
    constituency: 'Greater Bengaluru Authority',
    corporationName: '',
    psName: ''
  };

  const DRAFT_KEY = `aspirant_registration_draft_${user?.id ?? 'guest'}`;
  const [hasLocalDraft, setHasLocalDraft] = React.useState(false);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setHasLocalDraft(true);
    } catch (e) {
      // ignore
    }
  }, [DRAFT_KEY]);

  const hasIncompleteAspirant = Boolean(user?.role === 'aspirant' && (user as any)?.documentStatus !== 'completed');
  const shouldShowContinue = hasLocalDraft || hasIncompleteAspirant;


  const isDark = theme.palette.mode === 'dark';

  const photoFrameOptions = React.useMemo(
    () => [
      {
        key: 'responsible-voter',
        badge: t('userDashboard.frame.brandName', { defaultValue: 'Prajaakeeya' }),
        title: t('userDashboard.frame.responsibleVoter', { defaultValue: 'I am a responsible voter' }),
        subtitle: '',
        accent: '#F5A800',
        accentSoft: 'rgba(245,168,0,0.18)',
        gradient: isDark
          ? 'linear-gradient(145deg, rgba(34,24,8,0.98) 0%, rgba(18,12,8,0.96) 40%, rgba(35,18,8,0.94) 100%)'
          : 'linear-gradient(145deg, #fffaf0 0%, #fff6e0 46%, #fffdf4 100%)',
      },
    ],
    [isDark, t]
  );

  const selectedPhotoFrame = photoFrameOptions[selectedFrameIndex] ?? photoFrameOptions[0];
  const userDisplayName = (user?.name || 'Citizen').trim();
  const userInitials = React.useMemo(() => {
    const tokens = userDisplayName.split(/\s+/).filter(Boolean);
    return (tokens.slice(0, 2).map((token) => token.charAt(0)).join('') || 'U').toUpperCase();
  }, [userDisplayName]);

  React.useEffect(() => {
    if (!user) return;
    try {
      if (window.sessionStorage.getItem('dashboard_photo_frame_prompt') === '1') {
        setPhotoFrameOpen(true);
        window.sessionStorage.removeItem('dashboard_photo_frame_prompt');
      }
    } catch (e) {
      console.warn('Unable to read dashboard photo frame prompt state', e);
    }
  }, [user]);

  const showPhotoFrameToast = React.useCallback((message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setPhotoFrameToast({ open: true, message, severity });
  }, []);


  const generatePhotoFrameBlob = React.useCallback(async () => {
    if (typeof document === 'undefined') throw new Error('Document not available');

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to generate poster');
    }

    const frame = selectedPhotoFrame;
    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    const loadCanvasSafeImage = async (src: string) => {
      if (!src) return null;
      if (src.startsWith('data:') || src.startsWith('blob:')) {
        return { image: await loadImage(src), cleanup: () => { } };
      }

      const isAbsoluteUrl = /^https?:\/\//i.test(src);

      const blobToDataUrl = (b: Blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') resolve(reader.result);
          else reject(new Error('Unable to read profile image'));
        };
        reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
        reader.readAsDataURL(b);
      });

      // For absolute URLs (e.g. S3): use mode:'cors' so the browser sends the
      // Origin header, which causes S3 to return Access-Control-Allow-Origin.
      // Without mode:'cors' the Origin header is omitted and S3 won't include
      // CORS response headers, blocking canvas readback despite the bucket policy.
      if (isAbsoluteUrl) {
        try {
          const resp = await fetch(src, { mode: 'cors', credentials: 'omit' });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const blob = await resp.blob();
          if (!blob || blob.size === 0) throw new Error('Empty blob from S3');
          const dataUrl = await blobToDataUrl(blob);
          return { image: await loadImage(dataUrl), cleanup: () => { } };
        } catch (s3Err) {
          // Fallback: load via <img crossOrigin="anonymous"> — works when S3
          // CORS headers are present and the image is publicly accessible.
          console.warn('S3 cors fetch failed, trying crossOrigin img load', s3Err);
          try {
            const image = await new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error('crossOrigin image load failed'));
              // Cache-bust to avoid the browser reusing a cached non-CORS response
              img.src = src + (src.includes('?') ? '&' : '?') + '_cb=' + Date.now();
            });
            return { image, cleanup: () => { } };
          } catch (corsErr) {
            console.warn('crossOrigin image load failed', corsErr);
            return null; // triggers initials fallback
          }
        }
      }

      // Relative API path — use apiClient with baseURL
      let blob: Blob | null = null;
      try {
        const apiResp = await apiClient.get(src, { responseType: 'blob' });
        blob = apiResp.data as Blob;
      } catch (apiErr) {
        const resp = await fetch(src, {
          method: 'GET',
          // Cookie mode: no token to send as a header; authenticate via the
          // httpOnly session cookie instead (raw fetch omits cookies unless
          // credentials:'include' is set). Legacy mode keeps the Bearer header.
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: COOKIE_AUTH ? 'include' : 'same-origin',
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        blob = await resp.blob();
      }
      if (!blob || blob.size === 0) throw new Error('Empty profile image');
      const dataUrl = await blobToDataUrl(blob);
      return { image: await loadImage(dataUrl), cleanup: () => { } };
    };

    // ── Background ──
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, '#fff9e8');
    bg.addColorStop(0.55, '#fff5dc');
    bg.addColorStop(1, '#fffdfa');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── Tricolor top bar ──
    const barH = 18;
    ctx.fillStyle = '#C8180A';
    ctx.fillRect(0, 0, canvas.width * 0.36, barH);
    ctx.fillStyle = '#253A9A';
    ctx.fillRect(canvas.width * 0.36, 0, canvas.width * 0.28, barH);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(canvas.width * 0.64, 0, canvas.width * 0.36, barH);

    // ── Header: Logo + "Prajaakeeya" then Name below ──
    const headerY = 60;
    // Draw logo
    try {
      const logoImg = await loadImage(prajakeeyaLogo);
      ctx.drawImage(logoImg, 60, headerY - 16, 56, 56);
    } catch { /* skip logo if load fails */ }

    // Prajaakeeya text with gradient
    ctx.font = '900 48px Arial';
    const prajaGrad = ctx.createLinearGradient(130, headerY, 450, headerY);
    prajaGrad.addColorStop(0, '#C8180A');
    prajaGrad.addColorStop(1, '#F5A800');
    ctx.fillStyle = prajaGrad;
    ctx.fillText(t('userDashboard.frame.brandName', { defaultValue: 'Prajaakeeya' }), 130, headerY + 26);

    // Name below logo
    ctx.font = '700 32px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText(userDisplayName, 130, headerY + 68);

    // ── Photo (circular) ──
    const photoSize = 480;
    const photoX = (canvas.width - photoSize) / 2;
    const photoY = 170;
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    let photoDrawn = false;
    const photoSrc = framePhoto || user?.profilePicture;
    if (photoSrc) {
      let cleanupImageUrl = () => { };
      try {
        const loaded = await loadCanvasSafeImage(photoSrc);
        if (!loaded) throw new Error('Photo missing');
        const { image, cleanup } = loaded;
        cleanupImageUrl = cleanup;
        const imageWidth = image.naturalWidth || image.width;
        const imageHeight = image.naturalHeight || image.height;
        if (!imageWidth || !imageHeight) throw new Error('Invalid image dimensions');
        const scale = Math.max(photoSize / imageWidth, photoSize / imageHeight);
        const drawW = imageWidth * scale;
        const drawH = imageHeight * scale;
        const dx = photoX - (drawW - photoSize) / 2;
        const dy = photoY - (drawH - photoSize) / 2;
        ctx.drawImage(image, dx, dy, drawW, drawH);
        photoDrawn = true;
      } catch (e) {
        console.warn('Unable to load photo for frame', e);
      } finally {
        cleanupImageUrl();
      }
    }

    if (!photoDrawn) {
      const fallbackBg = ctx.createLinearGradient(photoX, photoY, photoX + photoSize, photoY + photoSize);
      fallbackBg.addColorStop(0, frame.accentSoft);
      fallbackBg.addColorStop(1, '#ffffff');
      ctx.fillStyle = fallbackBg;
      ctx.fillRect(photoX, photoY, photoSize, photoSize);
      ctx.fillStyle = frame.accent;
      ctx.font = '800 192px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(userInitials, canvas.width / 2, photoY + photoSize / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
    ctx.restore();

    // Photo border ring
    ctx.strokeStyle = frame.accent;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, photoY + photoSize / 2, photoSize / 2 + 8, 0, Math.PI * 2);
    ctx.stroke();

    // ── Tagline below photo ──
    const taglineY = photoY + photoSize + 100;
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 64px Arial';
    ctx.textAlign = 'center';
    const taglineWords = frame.title.split(' ');
    let tLine = '';
    let tLineY = taglineY;
    const tLineH = 76;
    const tMaxW = canvas.width - 160;
    taglineWords.forEach((word: string, idx: number) => {
      const next = tLine ? `${tLine} ${word}` : word;
      if (ctx.measureText(next).width > tMaxW && tLine) {
        ctx.fillText(tLine, canvas.width / 2, tLineY);
        tLine = word;
        tLineY += tLineH;
      } else {
        tLine = next;
      }
      if (idx === taglineWords.length - 1 && tLine) {
        ctx.fillText(tLine, canvas.width / 2, tLineY);
      }
    });
    ctx.textAlign = 'left';

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Unable to export poster'));
      }, 'image/png');
    });
  }, [selectedPhotoFrame, token, user?.profilePicture, userDisplayName, userInitials, framePhoto]);

  const downloadPhotoFrame = React.useCallback(async () => {
    setPhotoFrameBusy(true);
    try {
      const blob = await generatePhotoFrameBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prajakeeya-${selectedPhotoFrame.key}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showPhotoFrameToast(t('userDashboard.frame.downloaded', { defaultValue: 'Frame downloaded successfully.' }), 'success');
    } catch (e) {
      console.error('Photo frame download failed', e);
      showPhotoFrameToast(t('userDashboard.frame.downloadFailed', { defaultValue: 'Unable to download the frame right now.' }), 'error');
    } finally {
      setPhotoFrameBusy(false);
    }
  }, [generatePhotoFrameBlob, selectedPhotoFrame.key, showPhotoFrameToast, t]);

  const sharePhotoFrame = React.useCallback(async () => {
    setPhotoFrameBusy(true);
    try {
      const blob = await generatePhotoFrameBlob();
      const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const shareText = `${selectedPhotoFrame.subtitle}${shareUrl ? ` ${shareUrl}` : ''}`;

      // Detect if running inside React Native WebView
      const isReactNativeWebView = !!(window as any).ReactNativeWebView;

      if (isReactNativeWebView) {
        // Convert blob to base64 data URI and send to React Native
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SHARE_IMAGE',
          title: selectedPhotoFrame.title,
          text: shareText,
          dataUrl,
        }));
        showPhotoFrameToast(t('userDashboard.frame.shared', { defaultValue: 'Share sheet opened successfully.' }), 'success');
      } else if (navigator.share) {
        const file = new File([blob], `prajakeeya-${selectedPhotoFrame.key}.png`, { type: 'image/png' });
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: selectedPhotoFrame.title,
            text: shareText,
            url: shareUrl || undefined,
          });
          showPhotoFrameToast(t('userDashboard.frame.shared', { defaultValue: 'Share sheet opened successfully.' }), 'success');
        } else {
          throw new Error('canShare returned false');
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prajakeeya-${selectedPhotoFrame.key}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showPhotoFrameToast(t('userDashboard.frame.shareFallback', { defaultValue: 'Native sharing is not available here, so the image was downloaded instead.' }), 'info');
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        showPhotoFrameToast(t('userDashboard.frame.shareCancelled', { defaultValue: 'Sharing was cancelled.' }), 'info');
      } else {
        console.error('Photo frame share failed', e);
        showPhotoFrameToast(t('userDashboard.frame.shareFailed', { defaultValue: 'Unable to share the frame right now.' }), 'error');
      }
    } finally {
      setPhotoFrameBusy(false);
    }
  }, [generatePhotoFrameBlob, selectedPhotoFrame, showPhotoFrameToast, t]);

  // ── Greeting card: who you are, your ward, and the movement's size ──
  const wardLabel = user?.wardNumber || user?.wardId
    ? `${t('common.ward', { defaultValue: 'Ward' })} ${user?.wardNumber ?? user?.wardId}${user?.wardName || resolvedWardName ? ` · ${user?.wardName || resolvedWardName}` : ''}`
    : null;
  const mobileHero = (
    <Card sx={{ p: { xs: 2.5, md: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2.5, sm: 3 }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            src={user?.profilePicture || undefined}
            alt={userDisplayName}
            sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 600 }}
          >
            {userInitials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1.6 }}>
              {isKannada ? 'ದಿ ರಿಯಲ್ ಪ್ರಜಾಕೀಯ' : 'The Real Prajaakeeya'}
            </Typography>
            <Typography variant="h4" component="h1" noWrap>{userDisplayName}</Typography>
            {wardLabel && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>{wardLabel}</Typography>
            )}
          </Box>
        </Stack>
        {totalVoters != null && (
          <Box sx={{ textAlign: { sm: 'right' }, pl: { sm: 3 }, borderLeft: { sm: 1 }, borderColor: { sm: 'divider' } }}>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
              {totalVoters.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('userDashboard.citizensRegistered', { defaultValue: 'Citizens are registered.' })}
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );

  // Aspirant-only quick actions shown above the aspirants list.
  const aspirantQuickTiles = [
    { title: t('userDashboard.actions.meetCitizens') || 'Meet Citizens', icon: <img src={meetImg} alt="" />, path: '/user/dashboard/posts' },
    { title: t('userDashboard.actions.videoMeetings') || 'Video Meetings', icon: <img src={videoCameraImg} alt="" style={{ width: 52, height: 52 }} />, path: '/user/dashboard/meetings' },
    { title: t('userDashboard.actions.chatWithCitizens') || 'Chat with Citizens', icon: <img src={chatImg} alt="" />, path: `/user/chat/${user?.aspirantId || ''}` },
  ];
  const mobileAspirantTiles = (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
      {aspirantQuickTiles.map((action) => (
        <ActionTile key={action.path} title={action.title} icon={action.icon} onClick={() => navigate(action.path)} />
      ))}
    </Box>
  );

  const continueRegistration = () => navigate('/user/aspirants/declaration', { state: { resume: true } });
  const pendingAspirantAlert = user?.role === 'aspirant' && (user as any)?.documentStatus !== 'completed' && !pendingAlertDismissed && (
    <Alert
      severity="warning"
      variant="outlined"
      sx={{ alignItems: 'flex-start', '& .MuiAlert-message': { width: '100%' } }}
      action={isSm ? undefined : (
        <Stack direction="row" spacing={1} alignItems="center">
          <Button color="inherit" size="small" variant="outlined" onClick={continueRegistration} sx={{ whiteSpace: 'nowrap' }}>
            {t('userDashboard.actions.continueAspirantRegistration')}
          </Button>
          <IconButton aria-label="Dismiss" size="small" color="inherit" onClick={() => setPendingAlertDismissed(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}
    >
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {t('userDashboard.actions.pendingAspirantAlert')}
        </Typography>
        {isSm && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Button color="inherit" size="small" variant="outlined" fullWidth onClick={continueRegistration}>
              {t('userDashboard.actions.continueAspirantRegistration')}
            </Button>
            <IconButton aria-label="Dismiss" size="small" color="inherit" onClick={() => setPendingAlertDismissed(true)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Stack>
    </Alert>
  );

  const closeFrame = () => { setPhotoFrameOpen(false); setFramePhoto(null); };

  return (
    <>
      <Stack spacing={3} sx={{ pb: { xs: 2, md: 4 } }}>
        {mobileHero}
        {pendingAspirantAlert}
        {isAspirant && mobileAspirantTiles}
        <React.Suspense fallback={null}>
          <WardCandidateListPage embedded />
        </React.Suspense>
      </Stack>

      <Dialog open={photoFrameOpen} onClose={closeFrame} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
          {t('userDashboard.framePrompt.title', { defaultValue: 'Add Frame' })}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {/* Hidden file input for photo upload */}
          <input
            ref={frameFileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setFramePhoto(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
              e.target.value = '';
            }}
          />

          {/* Poster preview — mirrors the canvas output of generatePhotoFrameBlob */}
          <Box
            sx={{
              position: 'relative', mx: 'auto', maxWidth: 420, p: 3, borderRadius: 3,
              border: 1, borderColor: 'divider', bgcolor: isDark ? 'grey.900' : 'grey.50', overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: 'primary.main' }} />
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box component="img" src={prajakeeyaLogo} alt="" sx={{ width: 32, height: 32, borderRadius: 2 }} />
                <Box>
                  <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {t('userDashboard.frame.brandName', { defaultValue: 'Prajaakeeya' })}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{userDisplayName}</Typography>
                </Box>
              </Stack>

              <Box
                component="button"
                type="button"
                onClick={() => frameFileInputRef.current?.click()}
                aria-label={t('userDashboard.framePrompt.tapToUpload', { defaultValue: 'Tap photo to upload from gallery or camera' })}
                sx={{ position: 'relative', alignSelf: 'center', p: 0, border: 0, bgcolor: 'transparent', cursor: 'pointer', borderRadius: '50%' }}
              >
                <Avatar
                  src={framePhoto || user?.profilePicture || undefined}
                  sx={{
                    width: { xs: 160, sm: 200 }, height: { xs: 160, sm: 200 },
                    fontSize: '3.5rem', fontWeight: 700,
                    bgcolor: 'background.paper', color: 'primary.main',
                    border: 6, borderColor: 'primary.main',
                  }}
                >
                  {userInitials}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute', bottom: 10, right: 10, width: 36, height: 36, borderRadius: '50%',
                    display: 'grid', placeItems: 'center', bgcolor: 'grey.900', color: 'common.white',
                    border: 2, borderColor: 'background.paper',
                  }}
                >
                  <AddAPhotoIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                {t('userDashboard.framePrompt.tapToUpload', { defaultValue: 'Tap photo to upload from gallery or camera' })}
              </Typography>
              <Typography variant="h4" component="p" sx={{ textAlign: 'center' }}>{selectedPhotoFrame.title}</Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={closeFrame} sx={{ color: 'text.secondary' }}>
            {t('common.cancel') || 'Later'}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={downloadPhotoFrame} disabled={photoFrameBusy} variant="outlined" startIcon={<DownloadRoundedIcon />}>
            {t('userDashboard.framePrompt.download', { defaultValue: 'Download' })}
          </Button>
          <Button onClick={sharePhotoFrame} disabled={photoFrameBusy} variant="contained" startIcon={<IosShareIcon />}>
            {t('userDashboard.framePrompt.share', { defaultValue: 'Share Now' })}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={photoFrameToast.open}
        autoHideDuration={3200}
        onClose={() => setPhotoFrameToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={photoFrameToast.severity} onClose={() => setPhotoFrameToast((prev) => ({ ...prev, open: false }))}>
          {photoFrameToast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserDashboardPage;
