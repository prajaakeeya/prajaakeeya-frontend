import {
  Card,
  CardContent,
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
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import usePreferenceStore from '../store/usePreferenceStore';
import { COOKIE_AUTH } from '../config/authMode';
import { BRAND } from '../theme';
import apiClient from '../services/apiClient';
import { fetchAllWards } from '../services/wardService';
import { getVoters } from '../services/voterService';
// C-PERF-4: Lazy-load the candidate list instead of a static import. The
// dashboard renders it inline (<React.Suspense fallback={null}>
//           <WardCandidateListPage embedded />
//         </React.Suspense> below), so we
// can't drop it — but a static import merges its ~98 KB chunk into the
// dashboard chunk, defeating code-splitting. Lazy() keeps the same UX while
// splitting it into its own chunk that streams in behind the dashboard shell.
const WardCandidateListPage = React.lazy(() => import('./WardCandidateListPage'));

const UserDashboardPage = () => {
  const { user, token } = useAuthStore();
  const { activeLayout } = usePreferenceStore();

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
const actionTitleFontSize = isKannada ? { xs: '0.9rem', md: '1rem' } : { xs: '1rem', md: '1.125rem' };
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

const actions = [
    // Registered Citizens tile — temporarily disabled
    // {
    //   title: t('userDashboard.actions.voters') || 'View Voters',
    //   description: t('userDashboard.actions.votersDesc') || 'See all registered voters',
    //   icon: <img src={king1Img} alt="voters" width={30} height={30} />,
    //   path: `/user/voters`,
    //   variant: 'outlined' as const,
    //   color: 'secondary' as const
    // },
    {
      title: t('userDashboard.actions.registeredAspirants') || 'Registered Aspirants',
      description: t('userDashboard.actions.registeredAspirantsDesc') || 'See all registered aspirants',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="11" cy="10" r="4" stroke="#F5A800" strokeWidth="1.6" fill="rgba(245,168,0,0.12)"/>
          <path d="M3 25c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#F5A800" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="21" cy="10" r="3" stroke="#F5A800" strokeWidth="1.4" fill="rgba(245,168,0,0.08)" opacity="0.6"/>
          <path d="M23 25c0-3.314-2.686-6-6-6" stroke="#F5A800" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
        </svg>
      ),
      path: `/user/registered-aspirants`,
      variant: 'outlined' as const,
      color: 'secondary' as const
    },
    {
      title: t('userDashboard.actions.civicIssues') || 'Public Issues',
      description: t('userDashboard.actions.civicIssuesDesc') || 'Report and track issues in your ward',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="12" stroke="#C8180A" strokeWidth="1.6" fill="rgba(200,24,10,0.08)"/>
          <path d="M15 9v8" stroke="#C8180A" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="15" cy="21" r="1.2" fill="#C8180A"/>
        </svg>
      ),
      path: '/user/civic-issues',
      variant: 'outlined' as const,
      color: 'secondary' as const
    },
    // Lok Sabha and State Assembly tiles are always shown. If the user hasn't
    // saved a constituency for the type yet, clicking lands them on the
    // /user/aspirantslist "Update Profile" empty state.
    {
      title: t('userDashboard.actions.myLokSabhaAspirants') || 'My Lok Sabha Aspirants',
      description: t('userDashboard.actions.myLokSabhaAspirantsDesc') || 'Aspirants in your Lok Sabha constituency',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="3" y="20" width="24" height="3" rx="1" fill="rgba(37,58,154,0.15)" stroke="#253A9A" strokeWidth="1.4"/>
          <path d="M15 5 C8 5 4 13 4 20 h22 C26 13 22 5 15 5z" stroke="#253A9A" strokeWidth="1.5" fill="rgba(37,58,154,0.1)" strokeLinejoin="round"/>
          <line x1="15" y1="5" x2="15" y2="20" stroke="#253A9A" strokeWidth="1.2" strokeDasharray="2 2"/>
          <line x1="9" y1="8" x2="9" y2="20" stroke="#253A9A" strokeWidth="1" strokeDasharray="2 2" opacity="0.6"/>
          <line x1="21" y1="8" x2="21" y2="20" stroke="#253A9A" strokeWidth="1" strokeDasharray="2 2" opacity="0.6"/>
          <rect x="13" y="3" width="4" height="4" rx="1" fill="#253A9A"/>
        </svg>
      ),
      path: `/user/aspirantslist?type=lok_sabha`,
      variant: 'outlined' as const,
      color: 'secondary' as const
    },
    {
      title: t('userDashboard.actions.myStateAssemblyAspirants') || 'My State Assembly Aspirants',
      description: t('userDashboard.actions.myStateAssemblyAspirantsDesc') || 'Aspirants in your Assembly constituency',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="5" y="12" width="20" height="13" rx="1.5" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.08)"/>
          <rect x="10" y="18" width="4" height="7" rx="1" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1.2"/>
          <rect x="16" y="18" width="4" height="7" rx="1" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1.2"/>
          <path d="M3 12h24" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M15 4l10 8H5l10-8z" stroke="#22c55e" strokeWidth="1.4" fill="rgba(34,197,94,0.12)" strokeLinejoin="round"/>
        </svg>
      ),
      path: `/user/aspirantslist?type=state_assembly`,
      variant: 'outlined' as const,
      color: 'secondary' as const
    },
    // Municipal Corporation and Gram Panchayat tiles only render when the
    // user has actually saved a constituency for that type. Since each user
    // belongs to exactly one of these two (urban vs rural), hiding the
    // irrelevant one keeps the dashboard clean.
    ...((user as any)?.municipalCorporationConstituency?.id != null ? [{
      title: t('userDashboard.actions.myMunicipalCorporationAspirants') || 'My Municipal Corporation Aspirants',
      description: t('userDashboard.actions.myMunicipalCorporationAspirantsDesc') || 'Aspirants in your corporation ward',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="4" y="14" width="22" height="12" rx="1.5" stroke="#F5A800" strokeWidth="1.5" fill="rgba(245,168,0,0.08)"/>
          <rect x="8" y="18" width="3" height="4" rx="0.8" fill="rgba(245,168,0,0.3)" stroke="#F5A800" strokeWidth="1.1"/>
          <rect x="13.5" y="17" width="3" height="5" rx="0.8" fill="rgba(245,168,0,0.3)" stroke="#F5A800" strokeWidth="1.1"/>
          <rect x="19" y="18" width="3" height="4" rx="0.8" fill="rgba(245,168,0,0.3)" stroke="#F5A800" strokeWidth="1.1"/>
          <path d="M2 14h26M8 14V9M15 14V6M22 14V9" stroke="#F5A800" strokeWidth="1.3" strokeLinecap="round"/>
          <rect x="12" y="4" width="6" height="4" rx="1" fill="#F5A800" opacity="0.7"/>
        </svg>
      ),
      path: `/user/aspirantslist?type=municipal_corporation`,
      variant: 'outlined' as const,
      color: 'secondary' as const
    }] : []),
    ...((user as any)?.gramPanchayatConstituency != null ? [{
      title: t('userDashboard.actions.myGramPanchayatAspirants') || 'My Gram Panchayat Aspirants',
      description: t('userDashboard.actions.myGramPanchayatAspirantsDesc') || 'Aspirants in your Gram Panchayat',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M5 26 Q8 16 15 12 Q22 16 25 26" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.08)" strokeLinejoin="round"/>
          <circle cx="15" cy="10" r="3.5" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.15)"/>
          <path d="M10 20c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="3" y1="26" x2="27" y2="26" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      path: `/user/aspirantslist?type=gram_panchayat`,
      variant: 'outlined' as const,
      color: 'secondary' as const
    }] : []),
    {
      title: t('userDashboard.actions.registerAspirant') || 'Register as Aspirant',
      description: t('userDashboard.actions.registerAspirantDesc') || 'Apply to become an aspirant in your ward',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="13" cy="10" r="4.5" stroke="#F5A800" strokeWidth="1.6" fill="rgba(245,168,0,0.1)"/>
          <path d="M4 26c0-4.97 4.03-9 9-9" stroke="#F5A800" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="22" cy="21" r="6" fill="rgba(245,168,0,0.12)" stroke="#F5A800" strokeWidth="1.6"/>
          <line x1="22" y1="18" x2="22" y2="24" stroke="#F5A800" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="19" y1="21" x2="25" y2="21" stroke="#F5A800" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
      path: '/user/aspirants/register',
      variant: 'contained' as const,
      color: 'primary' as const,
    },
    {
      title: t('userDashboard.actions.howUPPWorks') || 'How Prajakeeya Works',
      description: t('userDashboard.actions.howWorksTitle') || 'Learn the Prajakeeya SOP and how the system works.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="11" stroke="#C8180A" strokeWidth="1.5" fill="rgba(200,24,10,0.08)"/>
          <path d="M11.5 12a3.5 3.5 0 0 1 7 0c0 2-2 3-2 5" stroke="#C8180A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="15" cy="22" r="1.2" fill="#C8180A"/>
        </svg>
      ),
      path: '/user/sop',
      variant: 'outlined' as const,
      color: 'primary' as const
    },
    {
      title: isKannada ? 'ಕಾರ್ಯಕರ್ತರು' : 'Karyakartas',
      description: isKannada
        ? 'ನಮ್ಮ ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ಸಕ್ರಿಯ ನಾಗರಿಕರ ತಂಡವನ್ನು ಸೇರಿಕೊಳ್ಳಿ.'
        : 'Join our team of volunteers and active citizens.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="8" cy="11" r="3" stroke="#253A9A" strokeWidth="1.4" fill="rgba(37,58,154,0.1)"/>
          <path d="M2 24c0-3.314 2.686-6 6-6" stroke="#253A9A" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="15" cy="10" r="3.5" stroke="#253A9A" strokeWidth="1.5" fill="rgba(37,58,154,0.15)"/>
          <path d="M7 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#253A9A" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="22" cy="11" r="3" stroke="#253A9A" strokeWidth="1.4" fill="rgba(37,58,154,0.1)"/>
          <path d="M24 18c3.314 0 6 2.686 6 6" stroke="#253A9A" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      path: '/user/karyakartas',
      variant: 'outlined' as const,
      color: 'secondary' as const
    }
  ];

  const aspirantActions = [
    {
      title: t('userDashboard.actions.myProfile') || 'My Profile',
      description: t('userDashboard.actions.myProfileDesc') || 'Update and manage your public candidate profile details.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="11" r="5" stroke="#F5A800" strokeWidth="1.6" fill="rgba(245,168,0,0.1)"/>
          <path d="M5 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#F5A800" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="22" cy="9" r="3" stroke="#F5A800" strokeWidth="1.2" fill="rgba(245,168,0,0.08)" opacity="0.5" strokeDasharray="2 1.5"/>
        </svg>
      ),
      path: '/user/dashboard/profile',
      variant: 'outlined' as const,
      color: 'secondary' as const,
    },
    {
      title: t('userDashboard.actions.civicIssues') || 'Public Issues',
      description: t('userDashboard.actions.civicIssuesDesc') || 'Report and track issues in your ward',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="12" stroke="#C8180A" strokeWidth="1.6" fill="rgba(200,24,10,0.08)"/>
          <path d="M15 9v8" stroke="#C8180A" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="15" cy="21" r="1.2" fill="#C8180A"/>
        </svg>
      ),
      path: '/user/civic-issues',
      variant: 'outlined' as const,
      color: 'secondary' as const,
    },
    {
      title: t('userDashboard.actions.howUPPWorks') || 'How Prajakeeya Works',
      description: t('userDashboard.actions.howWorksTitle') || 'Learn the Prajakeeya SOP and how the system works.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="11" stroke="#C8180A" strokeWidth="1.5" fill="rgba(200,24,10,0.08)"/>
          <path d="M11.5 12a3.5 3.5 0 0 1 7 0c0 2-2 3-2 5" stroke="#C8180A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="15" cy="22" r="1.2" fill="#C8180A"/>
        </svg>
      ),
      path: '/user/sop',
      variant: 'outlined' as const,
      color: 'primary' as const,
    },
    {
      title: t('userDashboard.actions.meetCitizens') || 'Meet Citizens',
      description: t('userDashboard.actions.meetCitizensDesc') || 'Connect with voters and publish updates about your work.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="4" y="8" width="22" height="16" rx="3" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.08)"/>
          <circle cx="11" cy="15" r="3" stroke="#22c55e" strokeWidth="1.4" fill="rgba(34,197,94,0.15)"/>
          <circle cx="19" cy="15" r="3" stroke="#22c55e" strokeWidth="1.4" fill="rgba(34,197,94,0.15)"/>
          <path d="M14 15h2" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      path: '/user/dashboard/posts',
      variant: 'outlined' as const,
      color: 'secondary' as const,
    },
    {
      title: t('userDashboard.actions.videoMeetings') || 'Video Meetings',
      description: t('userDashboard.actions.videoMeetingsDesc') || 'Schedule and host virtual meetings with citizens.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="3" y="9" width="18" height="13" rx="2.5" stroke="#253A9A" strokeWidth="1.5" fill="rgba(37,58,154,0.08)"/>
          <path d="M21 13l6-3v10l-6-3v-4z" stroke="#253A9A" strokeWidth="1.4" strokeLinejoin="round" fill="rgba(37,58,154,0.12)"/>
          <circle cx="9" cy="15" r="2" fill="rgba(37,58,154,0.3)" stroke="#253A9A" strokeWidth="1.2"/>
        </svg>
      ),
      path: '/user/dashboard/meetings',
      variant: 'outlined' as const,
      color: 'secondary' as const,
    },
    {
      title: t('userDashboard.actions.chatWithCitizens') || 'Chat with Citizens',
      description: t('userDashboard.actions.chatWithCitizensDesc') || 'Chat directly with citizens in your ward.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M4 6h22a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-5 4V8a2 2 0 0 1 2-2z" stroke="#F5A800" strokeWidth="1.5" fill="rgba(245,168,0,0.08)" strokeLinejoin="round"/>
          <line x1="9" y1="13" x2="21" y2="13" stroke="#F5A800" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="9" y1="17" x2="17" y2="17" stroke="#F5A800" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      path: `/user/chat/${user?.aspirantId || ''}`,
      variant: 'outlined' as const,
      color: 'secondary' as const,
    },
    // Lok Sabha and State Assembly tiles are always shown. The aspirants list
    // page nudges them to /user/complete-profile if the constituency isn't set.
    {
      title: t('userDashboard.actions.myLokSabhaAspirants') || 'My Lok Sabha Aspirants',
      description: t('userDashboard.actions.myLokSabhaAspirantsDesc') || 'Aspirants in your Lok Sabha constituency',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="3" y="20" width="24" height="3" rx="1" fill="rgba(37,58,154,0.15)" stroke="#253A9A" strokeWidth="1.4"/>
          <path d="M15 5 C8 5 4 13 4 20 h22 C26 13 22 5 15 5z" stroke="#253A9A" strokeWidth="1.5" fill="rgba(37,58,154,0.1)" strokeLinejoin="round"/>
          <line x1="15" y1="5" x2="15" y2="20" stroke="#253A9A" strokeWidth="1.2" strokeDasharray="2 2"/>
          <line x1="9" y1="8" x2="9" y2="20" stroke="#253A9A" strokeWidth="1" strokeDasharray="2 2" opacity="0.6"/>
          <line x1="21" y1="8" x2="21" y2="20" stroke="#253A9A" strokeWidth="1" strokeDasharray="2 2" opacity="0.6"/>
          <rect x="13" y="3" width="4" height="4" rx="1" fill="#253A9A"/>
        </svg>
      ),
      path: `/user/aspirantslist?type=lok_sabha`,
      variant: 'outlined' as const,
      color: 'secondary' as const,
    },
    {
      title: t('userDashboard.actions.myStateAssemblyAspirants') || 'My State Assembly Aspirants',
      description: t('userDashboard.actions.myStateAssemblyAspirantsDesc') || 'Aspirants in your Assembly constituency',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="5" y="12" width="20" height="13" rx="1.5" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.08)"/>
          <rect x="10" y="18" width="4" height="7" rx="1" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1.2"/>
          <rect x="16" y="18" width="4" height="7" rx="1" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1.2"/>
          <path d="M3 12h24" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M15 4l10 8H5l10-8z" stroke="#22c55e" strokeWidth="1.4" fill="rgba(34,197,94,0.12)" strokeLinejoin="round"/>
        </svg>
      ),
      path: `/user/aspirantslist?type=state_assembly`,
      variant: 'outlined' as const,
      color: 'secondary' as const,
    },
    // Municipal Corporation / Gram Panchayat only render when the aspirant has
    // saved one — a person belongs to exactly one local body, never both.
    ...((user as any)?.municipalCorporationConstituency?.id != null ? [{
      title: t('userDashboard.actions.myMunicipalCorporationAspirants') || 'My Municipal Corporation Aspirants',
      description: t('userDashboard.actions.myMunicipalCorporationAspirantsDesc') || 'Aspirants in your corporation ward',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="4" y="14" width="22" height="12" rx="1.5" stroke="#F5A800" strokeWidth="1.5" fill="rgba(245,168,0,0.08)"/>
          <rect x="8" y="18" width="3" height="4" rx="0.8" fill="rgba(245,168,0,0.3)" stroke="#F5A800" strokeWidth="1.1"/>
          <rect x="13.5" y="17" width="3" height="5" rx="0.8" fill="rgba(245,168,0,0.3)" stroke="#F5A800" strokeWidth="1.1"/>
          <rect x="19" y="18" width="3" height="4" rx="0.8" fill="rgba(245,168,0,0.3)" stroke="#F5A800" strokeWidth="1.1"/>
          <path d="M2 14h26M8 14V9M15 14V6M22 14V9" stroke="#F5A800" strokeWidth="1.3" strokeLinecap="round"/>
          <rect x="12" y="4" width="6" height="4" rx="1" fill="#F5A800" opacity="0.7"/>
        </svg>
      ),
      path: `/user/aspirantslist?type=municipal_corporation`,
      variant: 'outlined' as const,
      color: 'secondary' as const,
    }] : []),
    ...((user as any)?.gramPanchayatConstituency != null ? [{
      title: t('userDashboard.actions.myGramPanchayatAspirants') || 'My Gram Panchayat Aspirants',
      description: t('userDashboard.actions.myGramPanchayatAspirantsDesc') || 'Aspirants in your Gram Panchayat',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M5 26 Q8 16 15 12 Q22 16 25 26" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.08)" strokeLinejoin="round"/>
          <circle cx="15" cy="10" r="3.5" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.15)"/>
          <path d="M10 20c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="3" y1="26" x2="27" y2="26" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      path: `/user/aspirantslist?type=gram_panchayat`,
      variant: 'outlined' as const,
      color: 'secondary' as const,
    }] : []),
    // Registered Citizens tile — temporarily disabled
    // {
    //   title: t('userDashboard.actions.voters') || 'View Voters',
    //   icon: <img src={king1Img} alt="voters" width={30} height={30} />,
    //   path: `/user/voters`,
    //   variant: 'outlined' as const,
    //   color: 'secondary' as const,
    // },
    {
      title: t('userDashboard.actions.registeredAspirants') || 'Registered Aspirants',
      description: t('userDashboard.actions.registeredAspirantsDesc') || 'See all registered aspirants',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="11" cy="10" r="4" stroke="#F5A800" strokeWidth="1.6" fill="rgba(245,168,0,0.12)"/>
          <path d="M3 25c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#F5A800" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="21" cy="10" r="3" stroke="#F5A800" strokeWidth="1.4" fill="rgba(245,168,0,0.08)" opacity="0.6"/>
          <path d="M23 25c0-3.314-2.686-6-6-6" stroke="#F5A800" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
        </svg>
      ),
      path: `/user/registered-aspirants`,
      variant: 'outlined' as const,
      color: 'secondary' as const,
    },
    {
      title: isKannada ? 'ಕಾರ್ಯಕರ್ತರು' : 'Karyakartas',
      description: isKannada
        ? 'ನಮ್ಮ ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ಸಕ್ರಿಯ ನಾಗರಿಕರ ತಂಡವನ್ನು ಸೇರಿಕೊಳ್ಳಿ.'
        : 'Join our team of community volunteers.',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="8" cy="11" r="3" stroke="#253A9A" strokeWidth="1.4" fill="rgba(37,58,154,0.1)"/>
          <path d="M2 24c0-3.314 2.686-6 6-6" stroke="#253A9A" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="15" cy="10" r="3.5" stroke="#253A9A" strokeWidth="1.5" fill="rgba(37,58,154,0.15)"/>
          <path d="M7 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#253A9A" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="22" cy="11" r="3" stroke="#253A9A" strokeWidth="1.4" fill="rgba(37,58,154,0.1)"/>
          <path d="M24 18c3.314 0 6 2.686 6 6" stroke="#253A9A" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      path: '/user/karyakartas',
      variant: 'outlined' as const,
      color: 'secondary' as const,
    },
  ];

  const displayActions = isAspirant ? aspirantActions : actions;

  const handleActionClick = async (action: any) => {
    const disabledForThis = (isAspirantRegistrationComplete && action.path === '/user/aspirants/register') || (action as any).disabled;
    if (disabledForThis) return;

    // The aspirant flow now starts on the standalone Declaration page.
    const target = action.path === '/user/aspirants/register'
      ? '/user/aspirants/declaration'
      : action.path;
    try {
      if (action.path === '/user/aspirants/register' && shouldShowContinue) {
        navigate(target, { state: { resume: true } });
        return;
      }

      navigate(target);
    } catch (err) {
      console.warn('[handleActionClick] error', err);
      navigate(target);
    }
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

// Aspirant registration is complete when role=aspirant and documentStatus=completed
  const isAspirantRegistrationComplete = isAspirant;

  const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
  const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
  const isDark = theme.palette.mode === 'dark';

  // ── Theme-aware colour helpers ──────────────────────────────────────────
  const DARK = theme.palette.background.paper;
  const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;
  const GOLDD = 'rgba(245,168,0,0.45)';
  const BORDER = isDark ? 'rgba(245,168,0,0.20)' : 'rgba(245,168,0,0.35)';

  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const textHigh = isDark ? 'rgba(255,255,255,0.66)' : 'rgba(17,24,39,0.72)';
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.10)';
  const borderFaint = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(17,24,39,0.08)';

const heroBg = isDark
    ? 'radial-gradient(130% 150% at 6% 0%, rgba(200,24,10,0.2) 0%, rgba(10,8,8,1) 55%), radial-gradient(120% 130% at 100% 0%, rgba(37,58,154,0.16) 0%, rgba(10,8,8,1) 55%)'
    : 'linear-gradient(135deg, rgba(200,24,10,0.07) 0%, rgba(245,168,0,0.07) 50%, rgba(37,58,154,0.05) 100%)';
  const gridOverlay = isDark
    ? 'linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)'
    : 'linear-gradient(rgba(17,24,39,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(17,24,39,.02) 1px,transparent 1px)';

  const dialogPaperSx = {
    bgcolor: DARK,
    color: textPrimary,
    borderRadius: 3,
    border: `1px solid ${borderSubtle}`,
    boxShadow: isDark ? '0 18px 44px rgba(0,0,0,0.55)' : '0 18px 44px rgba(0,0,0,0.12)',
  };

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

  // ── Mobile hero (matches the redesign mockup) — centered avatar, welcome
  //    banner, name + verified tick and the registered-citizens count. Only
  //    used on xs screens; desktop keeps the original hero + tile grid below.
  // Warm orange → blackish gradient for the mobile hero card (matches the reference).
  const mobileHeroBg = isDark
    ? 'radial-gradient(135% 125% at 78% -12%, rgba(245,150,25,0.36) 0%, rgba(150,55,10,0.45) 26%, rgba(42,20,10,0.97) 60%, #0b0704 100%)'
    : 'linear-gradient(160deg, #fff4e2 0%, #ffe7c4 48%, #fff9f0 100%)';
  const mobileHero = (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}>
      <Box sx={{
        borderRadius: '20px', overflow: 'hidden', background: mobileHeroBg,
        border: `1px solid ${isDark ? 'rgba(245,140,0,0.45)' : 'rgba(245,168,0,0.3)'}`,
        boxShadow: isDark
          ? '0 0 28px rgba(245,130,0,0.4), 0 0 60px rgba(200,80,0,0.2), 0 12px 40px rgba(0,0,0,0.6)'
          : '0 0 0 1px rgba(245,168,0,0.08), 0 8px 32px rgba(17,24,39,0.07)',
        position: 'relative',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: gridOverlay, backgroundSize: '44px 44px', pointerEvents: 'none' }} />
        <Box sx={{ display: 'flex', height: '4px' }}>
          {[BRAND.red, BRAND.blue, BRAND.brown].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
        </Box>
        <Stack
          spacing={0.375}
          sx={{
            alignItems: "center",
            px: 2.5,
            py: 2,
            position: 'relative',
            zIndex: 1,
            textAlign: 'center'
          }}>
          <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: '1.5rem', color: GOLD, lineHeight: 1.1 }}>
            {isKannada ? 'ದಿ ರಿಯಲ್ ಪ್ರಜಾಕೀಯ' : 'The Real Prajaakeeya'}
          </Typography>
          {!isAspirant && <Box sx={{ fontSize: '1.4rem', lineHeight: 1, mt: 1 }}>👑</Box>}
          <Stack direction="row" spacing={0.6} sx={{
            alignItems: "center"
          }}>
            <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: '1.5rem', color: textPrimary, lineHeight: 1.1 }}>
              {userDisplayName}
            </Typography>
          </Stack>
          {totalVoters != null && (
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.6,
              px: 1.6, py: 0.7, borderRadius: 999, mt: 0.5,
              background: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${BORDER}`,
            }}>
              <Typography component="span" sx={{ fontFamily: FF_HEADING, fontSize: '0.95rem', fontWeight: 800, color: GOLD }}>
                {totalVoters.toLocaleString()}
              </Typography>
              <Typography component="span" sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', fontWeight: 600, color: textHigh }}>
                {t('userDashboard.citizensRegistered', { defaultValue: 'Citizens are registered.' })}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </motion.div>
  );

  // Aspirant-only quick tiles shown on the mobile home above the aspirants
  // list (same actions & icons as the desktop aspirant tiles).
  const aspirantQuickTiles = [
    {
      title: t('userDashboard.actions.meetCitizens') || 'Meet Citizens',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="4" y="8" width="22" height="16" rx="3" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.08)"/>
          <circle cx="11" cy="15" r="3" stroke="#22c55e" strokeWidth="1.4" fill="rgba(34,197,94,0.15)"/>
          <circle cx="19" cy="15" r="3" stroke="#22c55e" strokeWidth="1.4" fill="rgba(34,197,94,0.15)"/>
          <path d="M14 15h2" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      path: '/user/dashboard/posts'
    },
    {
      title: t('userDashboard.actions.videoMeetings') || 'Video Meetings',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="3" y="9" width="18" height="13" rx="2.5" stroke="#253A9A" strokeWidth="1.5" fill="rgba(37,58,154,0.08)"/>
          <path d="M21 13l6-3v10l-6-3v-4z" stroke="#253A9A" strokeWidth="1.4" strokeLinejoin="round" fill="rgba(37,58,154,0.12)"/>
          <circle cx="9" cy="15" r="2" fill="rgba(37,58,154,0.3)" stroke="#253A9A" strokeWidth="1.2"/>
        </svg>
      ),
      path: '/user/dashboard/meetings'
    },
    {
      title: t('userDashboard.actions.chatWithCitizens') || 'Chat with Citizens',
      icon: (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M4 6h22a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-5 4V8a2 2 0 0 1 2-2z" stroke="#F5A800" strokeWidth="1.5" fill="rgba(245,168,0,0.08)" strokeLinejoin="round"/>
          <line x1="9" y1="13" x2="21" y2="13" stroke="#F5A800" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="9" y1="17" x2="17" y2="17" stroke="#F5A800" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      path: `/user/chat/${user?.aspirantId || ''}`
    },
  ];
  const mobileAspirantTiles = (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.5 }}>
      {aspirantQuickTiles.map((action, index) => (
        <Card
          key={action.path}
          onClick={() => navigate(action.path)}
          sx={{
            borderRadius: '16px', cursor: 'pointer',
            background: isDark
              ? 'radial-gradient(ellipse at 60% 0%, rgba(200,80,0,0.12) 0%, rgba(10,6,4,0.98) 55%), #0a0604'
              : 'linear-gradient(150deg, #fffdf7 0%, #fff8e8 100%)',
            border: `1.5px solid ${isDark
              ? (index % 2 === 0 ? 'rgba(245,140,0,0.65)' : 'rgba(80,110,240,0.55)')
              : (index % 2 === 0 ? 'rgba(245,168,0,0.4)' : 'rgba(37,58,154,0.35)')}`,
            boxShadow: isDark
              ? (index % 2 === 0 ? '0 0 14px rgba(245,130,0,0.35)' : '0 0 14px rgba(60,90,240,0.35)')
              : '0 4px 16px rgba(245,168,0,0.07)',
            overflow: 'hidden',
            transition: 'transform 0.2s ease',
            '&:active': { transform: 'scale(0.97)' },
          }}
        >
          <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{
              width: 54, height: 54, borderRadius: '14px',
              background: isDark
                ? 'linear-gradient(145deg, #1a0f04 0%, #100a02 100%)'
                : 'radial-gradient(circle at 30% 30%, rgba(245,168,0,0.22), rgba(245,168,0,0.06))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid rgba(245,168,0,0.35)',
            }}>
              {action.icon}
            </Box>
            <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: isDark ? '#fff' : textPrimary, fontSize: '0.8rem', lineHeight: 1.15, textAlign: 'center' }}>
              {action.title}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const pendingAspirantAlert = user?.role === 'aspirant' && (user as any)?.documentStatus !== 'completed' && !pendingAlertDismissed && (
    <Alert
      severity="warning"
      sx={{
        borderRadius: 2,
        border: `1px solid ${BORDER}`,
        '& .MuiAlert-message': { width: '100%', fontFamily: FF_BODY },
      }}
      action={isSm ? undefined : (
        <Stack direction="row" spacing={1} sx={{
          alignItems: "center"
        }}>
          <Button
            color="inherit"
            size="small"
            variant="outlined"
            onClick={() => navigate('/user/aspirants/declaration', { state: { resume: true } })}
            sx={{ whiteSpace: 'nowrap', fontFamily: FF_HEADING, fontWeight: 700 }}
          >
            {t('userDashboard.actions.continueAspirantRegistration')}
          </Button>
          <IconButton size="small" color="inherit" onClick={() => setPendingAlertDismissed(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}
    >
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: FF_BODY }}>
          {t('userDashboard.actions.pendingAspirantAlert')}
        </Typography>
        {isSm && (
          <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
          }}>
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              fullWidth
              onClick={() => navigate('/user/aspirants/declaration', { state: { resume: true } })}
              sx={{ fontFamily: FF_HEADING, fontWeight: 700 }}
            >
              {t('userDashboard.actions.continueAspirantRegistration')}
            </Button>
            <IconButton size="small" color="inherit" onClick={() => setPendingAlertDismissed(true)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Stack>
    </Alert>
  );

  return (
    <>
      {/* Unified layout: desktop now mirrors the mobile home (full-width).
          The aspirants list (WardCandidateListPage) reflows to a 2–3 column
          grid on larger screens automatically. */}
      <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ fontFamily: FF_BODY, pb: { xs: 2, md: 4 } }}>
        {mobileHero}
        {pendingAspirantAlert}
        {isAspirant && activeLayout !== 'cardover' && mobileAspirantTiles}
{/* Desktop Action Cards Grid */}
        {activeLayout === 'cardover' ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              width: '100%',
              mx: 'auto',
              px: { xs: 1, sm: 0 },
              pb: 4,
            }}
          >
            {displayActions.map((action, index) => {
              const isActionDisabled = (isAspirantRegistrationComplete && action.path === '/user/aspirants/register') || (action as any).disabled;
              return (
                <Box
                  key={action.path}
                  sx={{
                    position: 'sticky',
                    top: { xs: 70 + index * 20, sm: 80 + index * 25 },
                    zIndex: 10 + index,
                    width: '100%',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card
                      onClick={() => handleActionClick(action)}
                      sx={{
                        borderRadius: '20px',
                        background: isDark
                          ? `linear-gradient(145deg, #1A1D24, #12141C)`
                          : '#FFFFFF',
                        border: `1.5px solid ${isDark
                          ? (index % 2 === 0 ? 'rgba(245,140,0,0.65)' : 'rgba(80,110,240,0.55)')
                          : (index % 2 === 0 ? 'rgba(245,168,0,0.4)' : 'rgba(37,58,154,0.35)')}`,
                        boxShadow: isDark
                          ? '0 -8px 24px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.7)'
                          : '0 -4px 16px rgba(0,0,0,0.03), 0 12px 24px rgba(0,0,0,0.08)',
                        cursor: isActionDisabled ? 'default' : 'pointer',
                        opacity: isActionDisabled ? 0.45 : 1,
                        transition: 'transform 0.28s ease',
                        '&:hover': {
                          transform: isActionDisabled ? 'none' : 'translateY(-4px) scale(1.005)',
                        },
                        overflow: 'hidden',
                      }}
                    >
                      <CardContent
                        sx={{
                          p: { xs: 2.5, sm: 3, md: 4 },
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: 'center',
                          gap: { xs: 2.5, sm: 4 },
                          '&:last-child': { pb: { xs: 2.5, sm: 3, md: 4 } },
                        }}
                      >
                        {/* Larger icon container */}
                        <Box
                          sx={{
                            width: { xs: 72, sm: 84, md: 96 },
                            height: { xs: 72, sm: 84, md: 96 },
                            borderRadius: '20px',
                            background: isDark
                              ? 'linear-gradient(145deg, #1a0f04 0%, #100a02 100%)'
                              : 'radial-gradient(circle at 30% 30%, rgba(245,168,0,0.22), rgba(245,168,0,0.06))',
                            color: GOLD,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1.5px solid ${isDark ? 'rgba(245,168,0,0.35)' : 'rgba(245,168,0,0.4)'}`,
                            boxShadow: isDark
                              ? '0 4px 14px rgba(0,0,0,0.4)'
                              : '0 4px 12px rgba(245,168,0,0.1)',
                            flexShrink: 0,
                            '& svg': { fontSize: { xs: 36, sm: 42, md: 48 } },
                            '& img': { width: { xs: 36, sm: 42, md: 48 }, height: { xs: 36, sm: 42, md: 48 } },
                          }}
                        >
                          {action.icon}
                        </Box>

                        {/* Title and brief description */}
                        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                          <Typography
                            sx={{
                              fontFamily: FF_HEADING,
                              fontWeight: 800,
                              color: isDark ? '#fff' : textPrimary,
                              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                              lineHeight: 1.25,
                              mb: 0.75,
                            }}
                          >
                            {action.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: FF_BODY,
                              color: textSecondary,
                              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                              lineHeight: 1.55,
                            }}
                          >
                            {action.description || 'Access details and actions for this feature.'}
                          </Typography>
                        </Box>

                        {/* Proceed button */}
                        <Button
                          variant="contained"
                          sx={{
                            fontFamily: FF_HEADING,
                            fontWeight: 800,
                            fontSize: { xs: '0.78rem', md: '0.82rem' },
                            textTransform: 'none',
                            px: { xs: 3, md: 4 },
                            py: { xs: 0.8, md: 1.1 },
                            borderRadius: '20px',
                            minWidth: { xs: '130px', sm: '160px' },
                            color: '#fff',
                            background: 'linear-gradient(135deg, #dd1f11de 0%, #e02110c2 100%)',
                            boxShadow: '0 4px 14px rgba(200,24,10,0.35)',
                            transition: 'all 0.22s ease',
                            flexShrink: 0,
                            alignSelf: { xs: 'stretch', sm: 'center' },
                            '&:hover': {
                              background: 'linear-gradient(135deg, #e02010 0%, #C8180A 100%)',
                              boxShadow: '0 6px 22px rgba(200,24,10,0.5)',
                            },
                          }}
                        >
                          {t('common.clickHere', { defaultValue: 'Click here' })}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Box>
              );
            })}
          </Box>
        ) : (
          !isSm && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2,
                width: '100%',
                mx: 'auto',
                px: { xs: 1, sm: 0 },
              }}
            >
              {displayActions.map((action, index) => (
                <Box key={action.path} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34, delay: 0.12 + index * 0.05 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Card
                      onClick={() => handleActionClick(action)}
                      sx={{
                        height: '100%',
                        borderRadius: '18px',
                        background: isDark
                          ? `radial-gradient(ellipse at 60% 0%, rgba(200,80,0,0.12) 0%, rgba(10,6,4,0.98) 55%), radial-gradient(ellipse at 10% 90%, rgba(${index % 2 === 0 ? '200,80,0' : '37,58,154'},0.1) 0%, transparent 60%), #0a0604`
                          : 'linear-gradient(150deg, #fffdf7 0%, #fff8e8 100%)',
                        backgroundImage: isDark
                          ? `radial-gradient(circle, rgba(255,180,60,0.13) 1px, transparent 1px), radial-gradient(circle, rgba(255,120,30,0.06) 1px, transparent 1px), radial-gradient(ellipse at 60% 0%, rgba(200,80,0,0.14) 0%, transparent 55%)`
                          : 'none',
                        backgroundSize: isDark ? '48px 48px, 22px 22px, 100% 100%' : 'auto',
                        backgroundPosition: isDark ? '0 0, 11px 11px, 0 0' : '0 0',
                        border: `1.5px solid ${isDark
                          ? (index % 2 === 0 ? 'rgba(245,140,0,0.65)' : 'rgba(80,110,240,0.55)')
                          : (index % 2 === 0 ? 'rgba(245,168,0,0.4)' : 'rgba(37,58,154,0.35)')}`,
                        boxShadow: isDark
                          ? (index % 2 === 0
                            ? '0 0 18px rgba(245,130,0,0.45), 0 0 42px rgba(200,80,0,0.2), inset 0 0 20px rgba(180,60,0,0.07)'
                            : '0 0 18px rgba(60,90,240,0.45), 0 0 42px rgba(37,58,154,0.22), inset 0 0 20px rgba(37,58,154,0.07)')
                          : '0 4px 20px rgba(245,168,0,0.07)',
                        overflow: 'hidden',
                        cursor: (isAspirantRegistrationComplete && action.path === '/user/aspirants/register') ? 'default' : 'pointer',
                        opacity: (isAspirantRegistrationComplete && action.path === '/user/aspirants/register') ? 0.45 : 1,
                        transition: 'transform 0.28s cubic-bezier(.17,.67,.4,1.3), box-shadow 0.3s ease, border-color 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-6px) scale(1.018)',
                          boxShadow: isDark
                            ? (index % 2 === 0
                              ? '0 0 30px rgba(245,140,0,0.65), 0 0 70px rgba(200,80,0,0.3), 0 24px 50px rgba(0,0,0,0.6)'
                              : '0 0 30px rgba(80,110,240,0.65), 0 0 70px rgba(37,58,154,0.35), 0 24px 50px rgba(0,0,0,0.6)')
                            : '0 0 24px rgba(245,168,0,0.2), 0 14px 32px rgba(17,24,39,0.1)',
                          borderColor: isDark
                            ? (index % 2 === 0 ? 'rgba(255,160,0,0.9)' : 'rgba(100,140,255,0.8)')
                            : (index % 2 === 0 ? 'rgba(245,168,0,0.7)' : 'rgba(37,58,154,0.6)'),
                        },
                      }}
                    >
                      {isDark && <Box sx={{
                        height: '3px', background: index % 2 === 0
                          ? 'linear-gradient(90deg, rgba(255,160,0,0) 0%, rgba(255,160,0,0.9) 45%, rgba(255,160,0,0) 100%)'
                          : 'linear-gradient(90deg, rgba(100,140,255,0) 0%, rgba(100,140,255,0.85) 45%, rgba(100,140,255,0) 100%)'
                      }} />}
                      <CardContent sx={{ p: { xs: 2.2, md: 2.8 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.6, height: '100%' }}>
                        <Box sx={{
                          width: 72, height: 72, borderRadius: '20px',
                          background: isDark
                            ? 'linear-gradient(145deg, #1a0f04 0%, #100a02 100%)'
                            : 'radial-gradient(circle at 30% 30%, rgba(245,168,0,0.22), rgba(245,168,0,0.06))',
                          color: GOLD,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `1.5px solid ${isDark ? 'rgba(245,168,0,0.35)' : 'rgba(245,168,0,0.4)'}`,
                          boxShadow: isDark
                            ? `0 0 0 5px rgba(245,140,0,0.08), 0 0 18px rgba(245,130,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)`
                            : `0 0 0 5px rgba(245,168,0,0.1), 0 4px 14px rgba(245,168,0,0.18)`,
                          transition: 'box-shadow 0.28s ease, transform 0.28s ease',
                          '& svg': { fontSize: 30 },
                        }}>
                          {action.icon}
                        </Box>
                        <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: isDark ? '#fff' : textPrimary, fontSize: actionTitleFontSize, lineHeight: 1.2, textAlign: 'center', letterSpacing: '-0.01em', textShadow: isDark ? '0 0 18px rgba(255,255,255,0.25)' : 'none' }}>
                          {action.title}
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{
                            fontFamily: FF_HEADING,
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            textTransform: 'none',
                            mt: 0.25,
                            px: 2.5,
                            py: 0.55,
                            borderRadius: '20px',
                            minWidth: { xs: '130px', md: '225px' },
                            color: '#fff',
                            background: 'linear-gradient(135deg, #dd1f11de 0%, #e02110c2 100%)',
                            boxShadow: '0 4px 14px rgba(200,24,10,0.35)',
                            letterSpacing: '0.02em',
                            transition: 'all 0.22s ease',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #e02010 0%, #C8180A 100%)',
                              boxShadow: '0 6px 22px rgba(200,24,10,0.5)',
                              transform: 'translateY(-1px)',
                            },
                          }}
                        >
                          {t('common.clickHere', { defaultValue: 'Click here' })}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Box>
              ))}
            </Box>
          )
        )}

        <WardCandidateListPage embedded />
      </Stack>
      <Dialog
        open={photoFrameOpen}
        onClose={() => { setPhotoFrameOpen(false); setFramePhoto(null); }}
        fullWidth
        maxWidth="md"
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(6px)', bgcolor: 'rgba(0,0,0,0.45)' } },
          paper: {
            sx: {
              ...dialogPaperSx,
              overflow: 'hidden',
              background: isDark
                ? 'linear-gradient(145deg, rgba(13,16,24,0.98) 0%, rgba(16,10,10,0.98) 100%)'
                : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(252,247,240,0.98) 100%)',
            }
          }
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 }, borderBottom: `1px solid ${borderSubtle}` }}>
          <Stack direction="row" spacing={1.25} sx={{
            alignItems: "center"
          }}>
            <Box sx={{ width: 42, height: 42, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'rgba(245,168,0,0.14)', border: `1px solid ${BORDER}`, color: GOLD }}>
              <AutoAwesomeIcon />
            </Box>
            <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPrimary, fontSize: { xs: '1.05rem', md: '1.25rem' }, flex: 1 }}>
              {t('userDashboard.framePrompt.title', { defaultValue: 'Add Frame' })}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
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

          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              minHeight: { xs: 380, md: 480 },
              p: { xs: 2, md: 3 },
              overflow: 'hidden',
              border: `1px solid ${borderSubtle}`,
              background: selectedPhotoFrame.gradient,
              boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.03)' : 'inset 0 1px 0 rgba(255,255,255,0.85)',
              maxWidth: 480,
              mx: 'auto',
            }}
          >
            {/* Top tricolor bar */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <Box sx={{ bgcolor: BRAND.red }} />
              <Box sx={{ bgcolor: BRAND.blue }} />
              <Box sx={{ bgcolor: BRAND.brown }} />
            </Box>

            <Stack spacing={2} sx={{ position: 'relative' }}>
              {/* Header: Logo + Prajaakeeya, Name below */}
              <Box>
                <Stack direction="row" spacing={1} sx={{
                  alignItems: "center"
                }}>
                  <Box component="img" src={prajakeeyaLogo} alt="logo" sx={{ height: 32 }} />
                  <Typography sx={{
                    fontFamily: FF_HEADING, fontWeight: 900, fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #C8180A 0%, #F5A800 100%)',
                    backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {t('userDashboard.frame.brandName', { defaultValue: 'Prajaakeeya' })}
                  </Typography>
                </Stack>
                <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, color: textSecondary, fontSize: '0.85rem', mt: 0.5, ml: 0.5 }}>
                  {userDisplayName}
                </Typography>
              </Box>

              {/* Photo — click to upload */}
              <Box
                onClick={() => frameFileInputRef.current?.click()}
                sx={{
                  display: 'flex', justifyContent: 'center', pt: 1, cursor: 'pointer',
                }}
              >
                <Box sx={{ position: 'relative', p: 0.8, borderRadius: '50%', background: `linear-gradient(135deg, ${selectedPhotoFrame.accent} 0%, ${GOLD} 100%)`, boxShadow: `0 0 0 6px ${selectedPhotoFrame.accentSoft}` }}>
                  <Avatar
                    src={framePhoto || user?.profilePicture || undefined}
                    sx={{
                      width: { xs: 160, md: 220 },
                      height: { xs: 160, md: 220 },
                      bgcolor: 'rgba(255,255,255,0.92)',
                      color: selectedPhotoFrame.accent,
                      fontFamily: FF_HEADING, fontWeight: 800,
                      fontSize: { xs: '3rem', md: '4rem' },
                      border: '4px solid rgba(255,255,255,0.95)',
                    }}
                  >
                    {userInitials}
                  </Avatar>
                  {/* Camera overlay icon */}
                  <Box sx={{
                    position: 'absolute', bottom: 8, right: 8,
                    width: 36, height: 36, borderRadius: '50%',
                    bgcolor: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center',
                    border: '2px solid rgba(255,255,255,0.8)',
                  }}>
                    <AddAPhotoIcon sx={{ color: '#fff', fontSize: 18 }} />
                  </Box>
                </Box>
              </Box>

              {/* Upload hint */}
              <Typography sx={{ fontFamily: FF_BODY, color: textSecondary, fontSize: '0.8rem', textAlign: 'center' }}>
                {t('userDashboard.framePrompt.tapToUpload', { defaultValue: 'Tap photo to upload from gallery or camera' })}
              </Typography>

              {/* Tagline */}
              <Typography sx={{
                fontFamily: FF_HEADING, fontWeight: 800, color: textPrimary,
                fontSize: { xs: '1.25rem', md: '1.6rem' }, textAlign: 'center', lineHeight: 1.2,
              }}>
                {selectedPhotoFrame.title}
              </Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.6, md: 2.2 }, borderTop: `1px solid ${borderSubtle}`, gap: 1, flexWrap: 'wrap' }}>
          <Button
            onClick={() => { setPhotoFrameOpen(false); setFramePhoto(null); }}
            variant="outlined"
            sx={{ fontFamily: FF_HEADING, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
          >
            {t('common.cancel') || 'Later'}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={downloadPhotoFrame}
            disabled={photoFrameBusy}
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            sx={{
              fontFamily: FF_HEADING,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              borderColor: GOLDD,
              color: textPrimary,
              '&:hover': { borderColor: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
            }}
          >
            {t('userDashboard.framePrompt.download', { defaultValue: 'Download' })}
          </Button>
          <Button
            onClick={sharePhotoFrame}
            disabled={photoFrameBusy}
            variant="contained"
            startIcon={<IosShareIcon />}
            sx={{
              fontFamily: FF_HEADING,
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              color: '#fff',
              background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.yellow} 100%)`,
              boxShadow: '0 10px 24px rgba(200,24,10,0.22)',
              '&:hover': { background: `linear-gradient(135deg, ${BRAND.red2} 0%, #ffbe1a 100%)` },
            }}
          >
            {t('userDashboard.framePrompt.share', { defaultValue: 'Share Now' })}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={photoFrameToast.open} autoHideDuration={3200} onClose={() => setPhotoFrameToast((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={photoFrameToast.severity} onClose={() => setPhotoFrameToast((prev) => ({ ...prev, open: false }))} sx={{ fontFamily: FF_BODY }}>
          {photoFrameToast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserDashboardPage;
