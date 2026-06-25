import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from '@mui/material/Portal';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Stack,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Autocomplete,
  MenuItem,
  useTheme,
  Fab,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Send as SendIcon,
  Forum as ForumIcon,
  Videocam as VideocamIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  CalendarMonth as CalendarIcon,
  Place as PlaceIcon,
  Groups as GroupsIcon,
  OpenInNew as OpenInNewIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOffAlt as ThumbUpOffAltIcon,
  HowToVote as HowToVoteIcon,
  // ReportProblem as ReportProblemIcon, // unused — Public Issue button commented out
  // Home as HomeIcon, // unused — Home button commented out
  Star as StarIcon,
  StarHalf as StarHalfIcon,
  StarBorder as StarBorderIcon,
  Language as LanguageIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  InfoOutlined as InfoOutlinedIcon,
  AccountBalance as ParliamentIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import googleMeetImg from '../assets/images/googl-meet.webp';
import zoomImg from '../assets/images/zoom.webp';
import { fetchAspirantsByConstituency, respondVisit, respondMeeting, getAspirantVisits, rateAspirantMeeting, rateAspirantVisit, rateAspirantContact } from '../services/aspirantService';
import {
  fetchElections,
  fetchConstituencies,
  fetchMunicipalities,
  fetchConstituenciesByScope,
  fetchConstituencyStats,
  fetchGPStates,
  fetchGPDistricts,
  fetchGPTaluks,
  fetchGPGrams,
  fetchGPVillages,
  type Election,
  type Constituency,
  type GPVillage,
  type ConstituencyStats,
} from '../services/electionService';
import { fetchVotingWindow, submitVote, fetchMyVote } from '../services/voteService';
import { getAspirantMessages, postUserChatMessage, AspirantChatMessageDto } from '../services/aspirantChatService';
import useAuthStore from '../store/useAuthStore';
import apiClient from '../services/apiClient';
import CloseIcon from '@mui/icons-material/Close';
import capitolInactiveImg from '../assets/images/capitol.png';
import capitolActiveImg from '../assets/images/capitol1.webp';
import { BRAND } from '../theme';
import SopAgreementCard from '../components/aspirant/SopAgreementCard';
import { safeUrl } from '../utils/safeUrl';

interface Candidate {
  id: number;
  name: string;
  party: string;
  wardName?: string;
  wardNo?: number;
  manifesto: string;
  recentPhotoUrl?: string | null;
  selfieUrl?: string | null;
  age?: number;
  gender?: string;
  education?: string;
  occupation?: string;
  address?: string;
  status?: string | string[];
  phone?: string;
  whatsappNumber?: string;
  sopUrl?: string | null;
  sopKannadaUrl?: string | null;
  allowPhone?: boolean;
  allowWhatsapp?: boolean;
  allowChat?: boolean;
  canRateContact?: boolean;
  isContactRated?: boolean;
  contactedAt?: number | null;
  contactRating?: { averageRating: number; totalRatings: number; distribution?: Record<string, number> };
}

const getPlatformIcon = (platform?: string | null, size = 18, variant: 'default' | 'white' = 'default') => {
  const imgStyle: React.CSSProperties = { width: size, height: size, objectFit: 'contain', flexShrink: 0 };
  const isWhite = variant === 'white';
  switch (platform) {
    case 'google_meet':
      if (isWhite) return <img src={googleMeetImg} alt="Google Meet" style={{ ...imgStyle, filter: 'brightness(0) invert(1)' }} />;
      return <img src={googleMeetImg} alt="Google Meet" style={imgStyle} />;
    case 'zoom':
      if (isWhite) return <img src={zoomImg} alt="Zoom" style={{ ...imgStyle, filter: 'brightness(0) invert(1)' }} />;
      return <img src={zoomImg} alt="Zoom" style={imgStyle} />;
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          {!isWhite && (
            <defs>
              <radialGradient id="ig-ward-grad" cx="30%" cy="107%" r="150%">
                <stop offset="0%" stopColor="#fdf497" />
                <stop offset="5%" stopColor="#fdf497" />
                <stop offset="45%" stopColor="#fd5949" />
                <stop offset="60%" stopColor="#d6249f" />
                <stop offset="90%" stopColor="#285AEB" />
              </radialGradient>
            </defs>
          )}
          {!isWhite && <circle cx="12" cy="12" r="11" fill="url(#ig-ward-grad)" />}
          <rect x="6" y="6" width="12" height="12" rx="3.5" ry="3.5" stroke="white" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" fill="none" />
          <circle cx="16" cy="8" r="0.9" fill="white" />
        </svg>
      );
    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          {!isWhite && <circle cx="12" cy="12" r="12" fill="#1877F2" />}
          <path d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10H15.5L15.2 12.5H13V19H10.5V12.5H9V10H10.5V8.5C10.5 6.6 11.6 5.5 13.5 5.5H15.5V8Z" fill="white" />
        </svg>
      );
    case 'others':
      return <LanguageIcon sx={{ fontSize: size, color: isWhite ? '#fff' : '#888', flexShrink: 0 }} />;
    default:
      return <VideocamIcon sx={{ fontSize: size, color: isWhite ? '#fff' : '#888', flexShrink: 0 }} />;
  }
};

const getPlatformButtonStyle = (platform?: string | null) => {
  switch (platform) {
    case 'google_meet':
      return { background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.red2} 100%)`, '&:hover': { background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.red} 100%)` } };
    case 'zoom':
      return { background: 'linear-gradient(135deg, #2D8CFF 0%, #0B5CFF 100%)', '&:hover': { background: 'linear-gradient(135deg, #0B5CFF 0%, #2D8CFF 100%)' } };
    case 'instagram':
      return { background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', '&:hover': { background: 'linear-gradient(135deg, #bc1888 0%, #cc2366 25%, #dc2743 50%, #e6683c 75%, #f09433 100%)' } };
    case 'facebook':
      return { background: '#1877F2', '&:hover': { background: '#0d65d9' } };
    default:
      return { background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.red2} 100%)`, '&:hover': { background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.red} 100%)` } };
  }
};

const PLATFORM_TEXT_KEYS: Record<string, string> = {
  google_meet: 'pages.wardCandidates.platformGoogleMeet',
  zoom: 'pages.wardCandidates.platformZoom',
  instagram: 'pages.wardCandidates.platformInstagram',
  facebook: 'pages.wardCandidates.platformFacebook',
};

type MeetingTimeStatus = 'live' | 'past' | 'upcoming';
// A meeting/visit is "live" while now sits between its start and end time;
// "past" only AFTER the end time (not merely after it started — that was the
// bug that showed an in-progress meeting as "Past Meeting"); otherwise
// "upcoming". Demo cards and missing start times always read as "upcoming".
const getMeetingTimeStatus = (
  startMs: number | null,
  endMs: number | null,
  nowMs: number,
  isDemo: boolean,
): MeetingTimeStatus => {
  if (isDemo || startMs == null) return 'upcoming';
  if (nowMs < startMs) return 'upcoming';
  const end = endMs ?? startMs + 3600000; // 1h fallback window when no end time
  return nowMs <= end ? 'live' : 'past';
};

// Helper: check if a candidate is the backend-provided demo aspirant
const isDemoCandidate = (c: any): boolean => Boolean(c?.isDemo);

const FILTER_STORAGE_KEY = 'wardCandidateFilters';

interface WardCandidateListPageProps {
  /** When rendered inside another page (e.g. the mobile dashboard home),
   *  hide the top Home / Public Issue buttons row and the "Aspirants" page
   *  header so the host page can supply its own hero. The standalone
   *  /user/aspirantslist route renders with embedded=false and is unchanged. */
  embedded?: boolean;
}

const WardCandidateListPage = ({ embedded = false }: WardCandidateListPageProps = {}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [demoSopOpen, setDemoSopOpen] = useState(false);
  const [sopCandidate, setSopCandidate] = useState<Candidate | null>(null);

  // When the SOP dialog opens we push a sentinel history entry so the browser
  // / Android back button just closes the dialog instead of leaving the
  // aspirants list (which previously dropped users on /user/dashboard).
  useEffect(() => {
    const dialogOpen = Boolean(sopCandidate) || demoSopOpen;
    if (!dialogOpen) return;
    const sentinel = { __sopDialog: true };
    window.history.pushState(sentinel, '');
    const onPop = () => {
      setSopCandidate(null);
      setDemoSopOpen(false);
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // If we leave the dialog state by other means (cross button, backdrop),
      // pop the sentinel back off so the user's history isn't polluted.
      if (window.history.state && (window.history.state as any).__sopDialog) {
        window.history.back();
      }
    };
  }, [sopCandidate, demoSopOpen]);
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const [votePercentages, setVotePercentages] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeAspirant, setActiveAspirant] = useState<Candidate | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatText, setChatText] = useState('');
  const [aspirantPopupOpen, setAspirantPopupOpen] = useState(false);
  const [aspirantMeetings, setAspirantMeetings] = useState<Record<number, any[]>>({});
  const [aspirantVisits, setAspirantVisits] = useState<Record<number, any[]>>({});
  const [now, setNow] = useState(Date.now());
  // Ratings state: meetingId/visitId → rating value (1=bad,2=average,3=good,4=excellent)
  const [meetingRatings, setMeetingRatings] = useState<Record<number, number>>({});
  const [contactRatings, setContactRatings] = useState<Record<number, number>>({});
  const [visitRatings, setVisitRatings] = useState<Record<number, number>>({});
  // Overall/activity ratings from API
  const [candidateOverallRatings, setCandidateOverallRatings] = useState<Record<number, { averageRating: number; totalRatings: number }>>({});
  const { user } = useAuthStore();

  // ── localStorage helpers for persisting per-user attended visit IDs ──
  const getLikedKey = () => `visit_liked_${user?.id ?? 'guest'}`;
  const getStoredLiked = (): Set<number> => {
    try {
      const raw = localStorage.getItem(getLikedKey());
      return raw ? new Set<number>(JSON.parse(raw)) : new Set<number>();
    } catch { return new Set<number>(); }
  };
  const storeLiked = (ids: Set<number>) => {
    try { localStorage.setItem(getLikedKey(), JSON.stringify([...ids])); } catch { /* ignore */ }
  };
  const mergeStoredLiked = (visits: any[]): any[] => {
    const liked = getStoredLiked();
    if (liked.size === 0) return visits;
    return visits.map((v: any) => ({ ...v, liked: v.liked ?? liked.has(Number(v.id)) }));
  };
  // Meeting likes (local-only) stored per-user
  const getMeetingLikedKey = () => `meeting_liked_${user?.id ?? 'guest'}`;
  const getStoredMeetingLiked = (): Set<number> => {
    try {
      const raw = localStorage.getItem(getMeetingLikedKey());
      return raw ? new Set<number>(JSON.parse(raw)) : new Set<number>();
    } catch { return new Set<number>(); }
  };
  const storeMeetingLiked = (ids: Set<number>) => {
    try { localStorage.setItem(getMeetingLikedKey(), JSON.stringify([...ids])); } catch { /* ignore */ }
  };
  const mergeStoredMeetingLiked = (meetings: any[]): any[] => {
    const liked = getStoredMeetingLiked();
    if (liked.size === 0) return meetings;
    return meetings.map((m: any) => ({ ...m, liked: m.liked ?? liked.has(Number(m.id)) }));
  };

  // ── Rating localStorage helpers ──────────────────────────────────────
  const getMeetingRatingKey = (meetingId: number) => `meeting_rating_${user?.id ?? 'guest'}_${meetingId}`;
  const getVisitRatingKey = (visitId: number) => `visit_rating_${user?.id ?? 'guest'}_${visitId}`;
  const getStoredMeetingRating = (meetingId: number): number => {
    try { return parseInt(localStorage.getItem(getMeetingRatingKey(meetingId)) || '0', 10) || 0; } catch { return 0; }
  };
  const getStoredVisitRating = (visitId: number): number => {
    try { return parseInt(localStorage.getItem(getVisitRatingKey(visitId)) || '0', 10) || 0; } catch { return 0; }
  };
  const getContactRatingKey = (aspirantId: number) => `contact_rating_${user?.id ?? 'guest'}_${aspirantId}`;
  const getStoredContactRating = (aspirantId: number): number => {
    try { return parseInt(localStorage.getItem(getContactRatingKey(aspirantId)) || '0', 10) || 0; } catch { return 0; }
  };

  // Helper to optimistically update rating distribution in a meetings/visits map
  const applyRatingToMap = (
    prev: Record<number, any[]>,
    itemId: number,
    newRating: number,
    previousRating: number,
  ): Record<number, any[]> => {
    const next: Record<number, any[]> = {};
    for (const [cid, items] of Object.entries(prev)) {
      const idx = (items as any[]).findIndex((item: any) => item.id === itemId);
      if (idx === -1) { next[Number(cid)] = items; continue; }
      const item = { ...(items as any[])[idx] };
      const dist: Record<string, number> = { ...((item.rating?.distribution) ?? {}) };
      let total: number = item.rating?.totalRatings ?? 0;
      if (previousRating > 0) {
        dist[String(previousRating)] = Math.max(0, (dist[String(previousRating)] || 0) - 1);
        total = Math.max(0, total - 1);
      }
      dist[String(newRating)] = (dist[String(newRating)] || 0) + 1;
      total += 1;
      let sum = 0;
      for (let i = 1; i <= 5; i++) sum += (dist[String(i)] || 0) * i;
      item.rating = { ...(item.rating ?? {}), distribution: dist, totalRatings: total, averageRating: total > 0 ? sum / total : 0 };
      const arr = [...(items as any[])];
      arr[idx] = item;
      next[Number(cid)] = arr;
    }
    return next;
  };

  const handleRateMeeting = async (meetingId: number, rating: number) => {
    const previousRating = getStoredMeetingRating(meetingId);
    localStorage.setItem(getMeetingRatingKey(meetingId), String(rating));
    setMeetingRatings(prev => ({ ...prev, [meetingId]: rating }));
    // Optimistically update distribution so percentages show immediately
    setAspirantMeetings(prev => applyRatingToMap(prev, meetingId, rating, previousRating));
    // Skip API call for demo meetings
    if (meetingId <= 0) return;
    try {
      const resp = await rateAspirantMeeting(meetingId, { rating });
      const confirmed = resp?.data?.rating ?? rating;
      localStorage.setItem(getMeetingRatingKey(meetingId), String(confirmed));
      setMeetingRatings(prev => ({ ...prev, [meetingId]: confirmed }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit rating';
      setErrorMsg(msg);
      setErrorOpen(true);
    }
  };
  const handleRateVisit = async (visitId: number, rating: number) => {
    const previousRating = getStoredVisitRating(visitId);
    localStorage.setItem(getVisitRatingKey(visitId), String(rating));
    setVisitRatings(prev => ({ ...prev, [visitId]: rating }));
    // Optimistically update distribution so percentages show immediately
    setAspirantVisits(prev => applyRatingToMap(prev, visitId, rating, previousRating));
    // Skip API call for demo visits
    if (visitId <= 0) return;
    try {
      const resp = await rateAspirantVisit(visitId, { rating });
      const confirmed = resp?.data?.rating ?? rating;
      localStorage.setItem(getVisitRatingKey(visitId), String(confirmed));
      setVisitRatings(prev => ({ ...prev, [visitId]: confirmed }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit rating';
      setErrorMsg(msg);
      setErrorOpen(true);
    }
  };

  const handleRateContact = async (aspirantId: number, rating: number) => {
    // Optimistic: persist locally and reflect on the card immediately.
    localStorage.setItem(getContactRatingKey(aspirantId), String(rating));
    setContactRatings(prev => ({ ...prev, [aspirantId]: rating }));
    setCandidates(prev => prev.map(c => {
      if (c.id !== aspirantId) return c;
      const dist: Record<string, number> = { ...((c.contactRating?.distribution) ?? {}) };
      dist[String(rating)] = (dist[String(rating)] || 0) + 1;
      const total = (c.contactRating?.totalRatings ?? 0) + 1;
      let sum = 0;
      for (let i = 1; i <= 5; i++) sum += (dist[String(i)] || 0) * i;
      return { ...c, isContactRated: true, canRateContact: false, contactRating: { distribution: dist, totalRatings: total, averageRating: total > 0 ? sum / total : 0 } };
    }));
    // Reflect the new rating in the header's overall rating immediately (no refresh).
    setCandidateOverallRatings(prev => {
      const cur = prev[aspirantId] ?? { averageRating: 0, totalRatings: 0 };
      const newTotal = cur.totalRatings + 1;
      const newSum = cur.averageRating * cur.totalRatings + rating;
      return { ...prev, [aspirantId]: { averageRating: newSum / newTotal, totalRatings: newTotal } };
    });
    if (aspirantId <= 0) return;
    try {
      await rateAspirantContact(aspirantId, { rating });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit rating';
      setErrorMsg(msg);
      setErrorOpen(true);
    }
  };

  // Rating config (1=bad, 2=average, 3=good, 4=very good, 5=excellent)
  const RATING_OPTIONS = [
    { value: 1, label: 'Bad',       emoji: '👎', color: '#ef4444', bg: 'rgba(239,68,68,0.18)',   border: 'rgba(239,68,68,0.45)'   },
    { value: 2, label: 'Average',   emoji: '😐', color: '#f59e0b', bg: 'rgba(245,158,11,0.18)',  border: 'rgba(245,158,11,0.45)'  },
    { value: 3, label: 'Good',      emoji: '👍', color: '#10b981', bg: 'rgba(16,185,129,0.18)',  border: 'rgba(16,185,129,0.45)'  },
    { value: 4, label: 'Very Good', emoji: '😄', color: '#06b6d4', bg: 'rgba(6,182,212,0.18)',   border: 'rgba(6,182,212,0.45)'   },
    { value: 5, label: 'Excellent', emoji: '🔥', color: '#818cf8', bg: 'rgba(129,140,248,0.18)', border: 'rgba(129,140,248,0.45)' },
  ] as const;

  // Render 5 star icons for a given average (supports half stars)
  const renderStars = (avg: number, size = 13) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (avg >= i) {
        stars.push(<StarIcon key={i} sx={{ fontSize: size, color: BRAND.yellow }} />);
      } else if (avg >= i - 0.5) {
        stars.push(<StarHalfIcon key={i} sx={{ fontSize: size, color: BRAND.yellow }} />);
      } else {
        stars.push(<StarBorderIcon key={i} sx={{ fontSize: size, color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' }} />);
      }
    }
    return stars;
  };

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  // helper to parse startTime / scheduledAt values from API (supports number, numeric string, or null)
  const parseTime = (val: any): number | null => {
    if (val == null) return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      if (/^\d+$/.test(val)) return parseInt(val, 10);
      const ts = Date.parse(val);
      return isNaN(ts) ? null : ts;
    }
    return null;
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const isKannada = i18n.language.startsWith('kn');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [posting, setPosting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [voteThankOpen, setVoteThankOpen] = useState(false);
  const [votedForName, setVotedForName] = useState<string | null>(null);
  const [aspirantStatus, setAspirantStatus] = useState<string | null>(null);

  // Read sessionStorage on first render — set by uploadCapturedPhoto before setAuth triggers redirect.
  // This ensures the overlay is visible from frame 0, with zero flicker.
  const [showCelebration, setShowCelebration] = useState(() => {
    const flag = sessionStorage.getItem('show_celebration');
    if (flag) { sessionStorage.removeItem('show_celebration'); return true; }
    return false;
  });

  // Election & Constituency filter state
  const [elections, setElections] = useState<Election[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string; state: string }[]>([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<{ id: number; name: string; state: string } | null>(null);
  const [cityConstituencies, setCityConstituencies] = useState<Constituency[]>([]);
  const [loadingCityConstituencies, setLoadingCityConstituencies] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState<number | ''>('');
  const [selectedConstituency, setSelectedConstituency] = useState<Constituency | null>(null);
  const [loadingConstituencies, setLoadingConstituencies] = useState(false);
  const selectedElection = elections.find((e) => e.id === selectedElectionId) ?? null;
  const isMunicipalElection = selectedElection?.type === 'municipal_corporation';
  const isGramPanchayat = selectedElection?.type === 'gram_panchayat';

  // ── 3-tab selector replaces the legacy filter dropdowns. Each tab maps to
  // one election type and auto-loads aspirants for the user's saved
  // constituency for that type. The original filter UI is kept in place below
  // but gated by `!isAutoTypeMode` (which is now always false, since either
  // the URL `?type=` deep-link or the tab selector sets `autoElectionType`).
  // Tabs only render when the user arrives without a `?type=` param (e.g.
  // from /user/sop "My Area Aspirants"); dashboard tiles deep-link with
  // `?type=` and skip the tab UI entirely.
  type AspirantTab = 'mp' | 'mla' | 'ward_panchayat';
  const tabToElectionType = (tab: AspirantTab): string => {
    if (tab === 'mp') return 'lok_sabha';
    if (tab === 'mla') return 'state_assembly';
    // ward_panchayat tab — pick whichever local body the user has saved.
    if ((user as any)?.municipalCorporationConstituency?.id != null) return 'municipal_corporation';
    if ((user as any)?.gramPanchayatConstituency != null) return 'gram_panchayat';
    return 'municipal_corporation';
  };
  const urlType = searchParams.get('type');
  const showTabSelector = !urlType;
  const initialTabFromUrl: AspirantTab = (() => {
    if (urlType === 'lok_sabha') return 'mp';
    if (urlType === 'state_assembly') return 'mla';
    if (urlType === 'municipal_corporation' || urlType === 'gram_panchayat') return 'ward_panchayat';
    return 'mp';
  })();
  // Persist the selected tab (sessionStorage) so navigating away — e.g. to the
  // chat page — and coming back keeps the same tab instead of resetting to MP.
  // Only applies in tab-selector mode; a `?type=` deep-link always wins.
  const [activeTab, setActiveTab] = useState<AspirantTab>(() => {
    if (urlType) return initialTabFromUrl;
    try {
      const saved = sessionStorage.getItem('wardlist_active_tab');
      if (saved === 'mp' || saved === 'mla' || saved === 'ward_panchayat') return saved;
    } catch { /* ignore */ }
    return initialTabFromUrl;
  });
  useEffect(() => {
    if (urlType) return;
    try { sessionStorage.setItem('wardlist_active_tab', activeTab); } catch { /* ignore */ }
  }, [activeTab, urlType]);
  const autoElectionType = urlType ?? tabToElectionType(activeTab);
  // Path passed to the aspirant-register page — carries the current election
  // type so the CandidateInformationStep can pre-select the matching tab.
  const registerPath = autoElectionType
    ? `/user/aspirants/declaration?type=${encodeURIComponent(autoElectionType)}`
    : '/user/aspirants/declaration';
  const autoUserConstituencyId = (() => {
    if (!user) return null;
    switch (autoElectionType) {
      case 'lok_sabha':
        return user.lokSabhaConstituency?.id ?? null;
      case 'state_assembly':
        return user.stateAssemblyConstituency?.id ?? null;
      case 'municipal_corporation':
        return user.municipalCorporationConstituency?.id ?? null;
      case 'gram_panchayat':
        // GP villages are identified by `srNo` on the nested object.
        return user.gramPanchayatConstituency?.srNo ?? null;
      default:
        return null;
    }
  })();
  // True whenever the URL pins us to a specific election type (regardless of
  // whether the user has the matching constituency saved).
  const isAutoTypeMode = Boolean(autoElectionType);
  // True only when we have both the type AND the user's stored ID — i.e. we can
  // skip the filter UI and load aspirants directly.
  const autoFilterMode = Boolean(autoElectionType && autoUserConstituencyId);
  // True when ?type= is present but the user hasn't saved that constituency.
  const missingConstituencyForType = isAutoTypeMode && !autoUserConstituencyId;

  // Friendly label for the missing-constituency message — falls back to the
  // raw election type if no translation key matches.
  const autoTypeLabelKey = (() => {
    switch (autoElectionType) {
      case 'lok_sabha':
        return 'pages.constituencyOnboarding.step1Title';
      case 'state_assembly':
        return 'pages.constituencyOnboarding.step2Title';
      case 'municipal_corporation':
        return 'pages.constituencyOnboarding.step3Title';
      case 'gram_panchayat':
        return 'pages.constituencyOnboarding.step4Title';
      default:
        return '';
    }
  })();

  // ── Gram Panchayat filter state ──
  const [gpStates, setGpStates] = useState<string[]>([]);
  const [gpDistricts, setGpDistricts] = useState<string[]>([]);
  const [gpTaluks, setGpTaluks] = useState<string[]>([]);
  const [gpGrams, setGpGrams] = useState<string[]>([]);
  const [gpVillages, setGpVillages] = useState<GPVillage[]>([]);
  const [selectedGpState, setSelectedGpState] = useState<string | null>(null);
  const [selectedGpDistrict, setSelectedGpDistrict] = useState<string | null>(null);
  const [selectedGpTaluk, setSelectedGpTaluk] = useState<string | null>(null);
  const [selectedGpGram, setSelectedGpGram] = useState<string | null>(null);
  const [selectedGpVillage, setSelectedGpVillage] = useState<GPVillage | null>(null);
  const [loadingGpStates, setLoadingGpStates] = useState(false);
  const [loadingGpDistricts, setLoadingGpDistricts] = useState(false);
  const [loadingGpTaluks, setLoadingGpTaluks] = useState(false);
  const [loadingGpGrams, setLoadingGpGrams] = useState(false);
  const [loadingGpVillages, setLoadingGpVillages] = useState(false);

  const [showAspirantPrompt, setShowAspirantPrompt] = useState(false);
  const [votingWindowActive, setVotingWindowActive] = useState(false);
  // The election type of the currently-open voting window, if any. Used to
  // gate aspirant registration only for the matching election (so a Lok Sabha
  // voting window doesn't block State Assembly registrations and vice versa).
  const [blockedElectionType, setBlockedElectionType] = useState<string | null>(null);
  const registrationBlocked = blockedElectionType != null && blockedElectionType === autoElectionType;
  const filtersRestoredRef = useRef(false);

  // Save filter selections to sessionStorage so they persist across navigation
  useEffect(() => {
    if (!filtersRestoredRef.current) return; // don't save during restore phase
    const filters: Record<string, unknown> = {};
    if (selectedElectionId) filters.electionId = selectedElectionId;
    if (selectedConstituency) filters.constituency = selectedConstituency;
    if (selectedMunicipality) filters.municipality = selectedMunicipality;
    if (selectedGpState) filters.gpState = selectedGpState;
    if (selectedGpDistrict) filters.gpDistrict = selectedGpDistrict;
    if (selectedGpTaluk) filters.gpTaluk = selectedGpTaluk;
    if (selectedGpGram) filters.gpGram = selectedGpGram;
    if (selectedGpVillage) filters.gpVillage = selectedGpVillage;
    sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [selectedElectionId, selectedConstituency, selectedMunicipality, selectedGpState, selectedGpDistrict, selectedGpTaluk, selectedGpGram, selectedGpVillage]);
  const [votingWindow, setVotingWindow] = useState<{ startTime: number; endTime: number; description?: string; isActive?: boolean; electionName?: string; electionId?: number } | null>(null);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [constituencyStats, setConstituencyStats] = useState<ConstituencyStats | null>(null);

  const isVotingActiveForThisElection =
    votingWindowActive &&
    votingWindow?.isActive === true &&
    votingWindow?.electionId != null &&
    selectedElectionId !== '' &&
    Number(votingWindow.electionId) === Number(selectedElectionId);

  useEffect(() => {
    const flag = sessionStorage.getItem('showAspirantPrompt');
    if (flag) {
      sessionStorage.removeItem('showAspirantPrompt');
      setShowAspirantPrompt(true);
    }
  }, []);

  // Check if user has already voted for this ward
  useEffect(() => {
    if (!user?.wardId) return;
    fetchMyVote(user.wardId)
      .then((resp) => {
        if (resp?.data?.aspirantId) {
          setHasVoted(true);
          setVotedForName(resp.data?.aspirantName || null);
        }
      })
      .catch((err) => {
        // if 400 with message 'Vote already cast for this ward', mark as voted
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err?.message || '';
        if (status === 400 && /vote already cast/i.test(msg)) {
          setHasVoted(true);
        }
      });
  }, [user?.wardId]);

  // If the auth/me endpoint already indicates the user has voted, reflect that in local state
  useEffect(() => {
    if (user?.hasVoted) {
      setHasVoted(true);
    }
  }, [user?.hasVoted]);

  const confettiItems = useMemo(() => Array.from({ length: 55 }, (_, i) => ({
    id: i,
    x: (i * 1.87 + 0.9) % 100,
    color: ['#C8180A', '#F5A800', '#22c55e', '#3b82f6', '#FFCB00', '#ec4899', '#a78bfa', '#fff'][i % 8],
    size: 5 + (i % 7) * 1.6,
    round: i % 3 === 0,
    delay: (i * 0.042) % 2.4,
    duration: 2.2 + (i % 5) * 0.5,
  })), []);

  // ── theme-aware color tokens ──────────────────────────────────────────
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const textDim = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(17,24,39,0.42)';
  const textFaint = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(17,24,39,0.52)';
  const cardBg = isDark ? 'linear-gradient(160deg, #1A1C1D 0%, #13161A 100%)' : theme.palette.background.paper;
  const panelBg = isDark ? 'linear-gradient(160deg, #1A1C1D 0%, #13161A 100%)' : theme.palette.background.paper;
  const dialogBg = isDark ? 'linear-gradient(160deg, #1A1C1D 0%, #13161A 100%)' : theme.palette.background.paper;
  const insetBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.04)';
  const insetBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(17,24,39,0.10)';
  const cardBorder = isDark ? '1px solid rgba(245,168,0,0.1)' : '1px solid rgba(245,168,0,0.22)';
  const panelBorder = isDark ? '1px solid rgba(245,168,0,0.2)' : '1px solid rgba(245,168,0,0.30)';
  const dividerBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(17,24,39,0.08)';
  const avatarBg = isDark ? '#1C1010' : theme.palette.background.paper;
  const outlinedBtnBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(17,24,39,0.22)';
  const outlinedBtnColor = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(17,24,39,0.70)';
  const outlinedBtnHoverBorder = isDark ? 'rgba(255,255,255,0.30)' : 'rgba(17,24,39,0.38)';
  const outlinedBtnHoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(17,24,39,0.05)';
  const disabledBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)';
  const disabledColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.28)';
  const votesLabelColor = isDark ? 'rgba(255,255,255,0.78)' : 'rgba(17,24,39,0.62)';
  const votesValueColor = isDark ? '#ff6a5f' : BRAND.red;

  // Detect if user has a pending (incomplete) aspirant registration
  const hasPendingRegistration = (() => {
    // User has aspirantId but status is pending (either voter or aspirant role)
    if (user?.aspirantId && aspirantStatus === 'pending') return true;
    // Check localStorage draft for in-progress registration (not yet submitted step 3)
    try {
      const draftKey = `aspirant_registration_draft_${user?.id ?? 'guest'}`;
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.activeStep === 'number' && parsed.activeStep > 0) return true;
      }
    } catch (_) { /* ignore */ }
    return false;
  })();

  const handleNavigateToRegistration = () => {
    navigate(registerPath, { state: { resume: true } });
  };

  const handleToggleAttend = async (aspirantId: number, visitId: number) => {
    if (!user) {
      setErrorMsg('Please login to mark attendance');
      setErrorOpen(true);
      return;
    }
    const prev = { ...aspirantVisits };
    const visits = prev[aspirantId] || [];
    const updated = visits.map((v: any) => {
      if (v.id === visitId) {
        const liked = !v.liked;
        const attendingCount = (Number(v.attendingCount) || 0) + (liked ? 1 : -1);
        return { ...v, liked, attendingCount };
      }
      return v;
    });
    // Optimistic update
    setAspirantVisits({ ...prev, [aspirantId]: updated });
    // Skip API call for demo visits
    if (visitId <= 0) return;
    const toggled = updated.find((v: any) => v.id === visitId);
    try {
      await respondVisit(visitId, { attending: !!toggled?.liked });
      // Persist liked state in localStorage so it survives page refresh
      const likedIds = getStoredLiked();
      if (toggled?.liked) { likedIds.add(visitId); } else { likedIds.delete(visitId); }
      storeLiked(likedIds);
      // Re-fetch from server for authoritative count, merging our stored liked state
      try {
        const fresh = await getAspirantVisits(aspirantId);
        const merged = mergeStoredLiked(fresh?.data || []);
        setAspirantVisits((current) => ({ ...current, [aspirantId]: merged }));
      } catch { /* keep optimistic state if re-fetch fails */ }
    } catch (err: any) {
      setAspirantVisits(prev);
      setErrorMsg(err?.response?.data?.message || 'Failed to update attendance');
      setErrorOpen(true);
    }
  };

  // Track aspirant interaction on chat/meeting/phone/direct meet.
  const trackInteraction = async (aspirantId: number, endpoint = '/users/track/chat', timestamp?: number) => {
    // Skip tracking for demo aspirant
    if (aspirantId <= 0) return false;
    try {
      // Phone/WhatsApp tracking passes the click time (epoch ms); the backend
      // stores it as phoneCallAt and makes the voter eligible to rate this
      // aspirant's contact.
      const body: { aspirantId: number; timestamp?: number } = { aspirantId };
      if (timestamp != null) body.timestamp = timestamp;
      const resp = await apiClient.post(endpoint, body);
      const apiUser = resp?.data?.user ?? resp?.data ?? null;
      if (apiUser) {
        const current = useAuthStore.getState().user as any;
        const merged = { ...(current || {}), ...apiUser };
        // Update auth store user with returned flags so UI (Vote button) updates
        (useAuthStore as any).setState({ user: merged });
      }
      return true;
    } catch (e) {
      // ignore tracking failures
      // console.warn('[track] failed', e);
      return false;
    }
  };

  // Derive aspirant status from the already-fetched candidates list (avoids extra API call)
  useEffect(() => {
    if (!user?.aspirantId) {
      setAspirantStatus(null);
      return;
    }
    const match = candidates.find((c) => c.id === user.aspirantId);
    const s = match?.status;
    setAspirantStatus(typeof s === 'string' ? s : Array.isArray(s) ? s[0] : null);
  }, [user?.aspirantId, candidates]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatMessages]);

  // Show aspirant registration popup only after registration (not login)
  useEffect(() => {
    const fromRegistration = searchParams.get('fromRegistration') === 'true';
    if (fromRegistration && user && (user.role !== 'aspirant' || aspirantStatus === 'pending')) {
      setAspirantPopupOpen(true);
      searchParams.delete('firstLogin');
      searchParams.delete('fromRegistration');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, user, aspirantStatus]);

  // Poll chat messages for the open dialog so participants see new messages
  useEffect(() => {
    if (!chatOpen || !activeAspirant) return;
    let mounted = true;
    const fetchLoop = async () => {
      try {
        const resp = await getAspirantMessages(activeAspirant.id, 1, 50);
        const data = (resp.data?.data ?? resp.data) as AspirantChatMessageDto[];
        data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        if (!mounted) return;
        setChatMessages(data || []);
      } catch (e) {
        // ignore polling errors
      }
    };
    // initial load
    void fetchLoop();
    const id = setInterval(fetchLoop, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, [chatOpen, activeAspirant]);

  // When arriving from a notification deep-link (e.g. ?electionId=2&aspirantId=5),
  // translate electionId → type once elections have loaded so the existing tab logic
  // picks the right list. The aspirantId param is consumed by the scroll effect below.
  useEffect(() => {
    const eidParam = searchParams.get('electionId');
    if (!eidParam || urlType || elections.length === 0) return;
    const eid = Number(eidParam);
    if (!Number.isFinite(eid)) return;
    const election = elections.find((e) => e.id === eid);
    if (!election?.type) return;
    const next = new URLSearchParams(searchParams);
    next.set('type', election.type);
    next.delete('electionId');
    setSearchParams(next, { replace: true });
  }, [searchParams, urlType, elections, setSearchParams]);

  // Scroll to a specific aspirant card after candidates render (from ?aspirantId=…).
  // The param is then stripped so subsequent re-renders don't re-scroll.
  useEffect(() => {
    const aidParam = searchParams.get('aspirantId');
    if (!aidParam) return;
    const aid = Number(aidParam);
    if (!Number.isFinite(aid)) return;
    if (!candidates.some((c) => c.id === aid)) return;
    const el = document.getElementById(`aspirant-card-${aid}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const next = new URLSearchParams(searchParams);
    next.delete('aspirantId');
    setSearchParams(next, { replace: true });
  }, [candidates, searchParams, setSearchParams]);

  // Returning from the chat page: scroll back to the aspirant card the user
  // opened chat from (set in sessionStorage on click) instead of jumping to top.
  // NOTE: no clearable cleanup here — under React StrictMode the effect runs
  // twice and a cleanup would cancel the scroll; we instead fire uncancelled
  // deferred scrolls (harmless if the element is gone) so it survives.
  useEffect(() => {
    if (loading) return;
    let raw: string | null = null;
    try { raw = sessionStorage.getItem('wardlist_return_aspirant'); } catch { /* ignore */ }
    if (!raw) return;
    const aid = Number(raw);
    if (!Number.isFinite(aid) || !candidates.some((c) => c.id === aid)) return;
    if (!document.getElementById(`aspirant-card-${aid}`)) return;
    // NOTE: no clearable cleanup and we DON'T clear the sessionStorage flag here.
    // Under React StrictMode the effect runs twice; clearing the flag (or the
    // timers) on the first pass would leave the second pass with nothing to do,
    // so the scroll would never happen in dev. We instead fire uncancelled,
    // self-stopping nudges and clear the flag only once the card has settled.
    // Re-align repeatedly over ~2s so the scroll survives late layout shifts —
    // avatars/manifesto images load after the cards mount and push the target
    // card down, so a single early scrollIntoView lands short (near the top).
    let lastTop = Number.NaN;
    let settled = false;
    const align = () => {
      if (settled) return;
      const el = document.getElementById(`aspirant-card-${aid}`);
      if (!el) return;
      el.scrollIntoView({ block: 'center' });
      const top = Math.round(el.getBoundingClientRect().top);
      // Once the card's viewport position holds steady between two passes,
      // layout has settled — stop nudging and drop the flag so a later
      // genuine remount won't re-trigger this scroll.
      if (Math.abs(top - lastTop) <= 2) {
        settled = true;
        try { sessionStorage.removeItem('wardlist_return_aspirant'); } catch { /* ignore */ }
      }
      lastTop = top;
    };
    requestAnimationFrame(align);
    [80, 180, 320, 500, 750, 1100, 1600, 2100].forEach((delay) => {
      window.setTimeout(align, delay);
    });
    // Safety net: ensure the flag is cleared even if the position never fully
    // stabilises, so it can't leak into an unrelated future visit.
    window.setTimeout(() => {
      try { sessionStorage.removeItem('wardlist_return_aspirant'); } catch { /* ignore */ }
    }, 2500);
  }, [candidates, loading]);

  // Fetch elections on mount & restore saved election filter
  useEffect(() => {
    fetchElections()
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setElections(data);
        // Restore saved election filter
        try {
          const saved = sessionStorage.getItem(FILTER_STORAGE_KEY);
          if (saved) {
            const filters = JSON.parse(saved);
            if (filters.electionId && data.some((e: any) => e.id === filters.electionId)) {
              setSelectedElectionId(filters.electionId);
            } else {
              filtersRestoredRef.current = true;
            }
          } else {
            filtersRestoredRef.current = true;
          }
        } catch {
          filtersRestoredRef.current = true;
        }
      })
      .catch((err) => console.error('Failed to fetch elections:', err));
  }, []);

  // Fetch current voting window on mount so banner shows immediately (before filters)
  useEffect(() => {
    let mounted = true;
    const loadWindow = async () => {
      try {
        const windowResp = await fetchVotingWindow();
        if (!mounted) return;
        const isVotingAllowed = windowResp?.data?.isVotingAllowed;
        setVotingWindowActive(Boolean(isVotingAllowed));
        const w = windowResp?.data?.window;
        if (w) setVotingWindow({ startTime: w.startTime, endTime: w.endTime, description: w.description, isActive: Boolean(w.isActive), electionName: (windowResp as any)?.data?.window?.election?.name ?? '', electionId: (w as any)?.electionId ?? (w as any)?.election?.id });
        setBlockedElectionType(isVotingAllowed && w?.isActive ? (w as any)?.election?.type ?? null : null);
      } catch (e) {
        // ignore
      }
    };
    void loadWindow();
    return () => { mounted = false; };
  }, []);

  // Helper to read saved filters from sessionStorage
  const getSavedFilters = useCallback(() => {
    try {
      const saved = sessionStorage.getItem(FILTER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }, []);

  // Reset all GP state helper
  const resetGpState = () => {
    setGpStates([]); setGpDistricts([]); setGpTaluks([]); setGpGrams([]); setGpVillages([]);
    setSelectedGpState(null); setSelectedGpDistrict(null); setSelectedGpTaluk(null);
    setSelectedGpGram(null); setSelectedGpVillage(null);
  };

  // Fetch constituencies or municipalities when election type changes
  useEffect(() => {
    if (!selectedElectionId) {
      setConstituencies([]);
      setSelectedConstituency(null);
      setMunicipalities([]);
      setSelectedMunicipality(null);
      setCityConstituencies([]);
      resetGpState();
      setCandidates([]);
      return;
    }
    const selected = elections.find((e) => e.id === selectedElectionId);
    if (!selected) return;

    // Clear constituency, GP village, and candidates immediately so loadAspirants
    // won't fire with the previous constituency ID for the new election type
    setSelectedConstituency(null);
    setSelectedGpVillage(null);
    setCandidates([]);

    // gram panchayat flow: fetch GP states
    if (selected.type === 'gram_panchayat') {
      setConstituencies([]);
      setMunicipalities([]); setSelectedMunicipality(null); setCityConstituencies([]);
      resetGpState();
      setLoadingGpStates(true);
      fetchGPStates()
        .then((resp) => {
          const data = Array.isArray(resp.data) ? resp.data : [];
          setGpStates(data);
          const saved = getSavedFilters();
          if (saved?.gpState && data.includes(saved.gpState)) {
            setSelectedGpState(saved.gpState);
          } else {
            filtersRestoredRef.current = true;
          }
        })
        .catch((err) => console.error('Failed to fetch GP states:', err))
        .finally(() => setLoadingGpStates(false));
      return;
    }

    // Reset GP state for non-GP elections
    resetGpState();

    // municipal corporation flow: fetch municipalities list
    if (selected.type === 'municipal_corporation') {
      setLoadingMunicipalities(true);
      setMunicipalities([]);
      setSelectedMunicipality(null);
      setCityConstituencies([]);
      setSelectedConstituency(null);
      fetchMunicipalities()
        .then((resp) => {
          const data = Array.isArray(resp.data) ? resp.data : [];
          setMunicipalities(data);
          const saved = getSavedFilters();
          if (saved?.municipality && data.some((m: any) => m.id === saved.municipality.id)) {
            setSelectedMunicipality(saved.municipality);
          } else {
            filtersRestoredRef.current = true;
          }
        })
        .catch((err) => console.error('Failed to fetch municipalities:', err))
        .finally(() => setLoadingMunicipalities(false));
      return;
    }

    // default flow: fetch constituencies by election type
    setLoadingConstituencies(true);
    setConstituencies([]);
    setSelectedConstituency(null);

    fetchConstituencies(selected.type)
      .then((resp) => {
        const data = resp.data?.constituencies ?? [];
        setConstituencies(data);
        const saved = getSavedFilters();
        if (saved?.constituency && data.some((c: Constituency) => c.id === saved.constituency.id)) {
          setSelectedConstituency(saved.constituency);
        }
        filtersRestoredRef.current = true;
      })
      .catch((err) => console.error('Failed to fetch constituencies:', err))
      .finally(() => setLoadingConstituencies(false));
  }, [selectedElectionId, elections, getSavedFilters]);

  // When a municipality is selected, fetch city corporation wards (constituencies by scope)
  useEffect(() => {
    if (!selectedMunicipality) {
      setCityConstituencies([]);
      setSelectedConstituency(null);
      setCandidates([]);
      return;
    }
    setLoadingCityConstituencies(true);
    setCityConstituencies([]);
    setSelectedConstituency(null);
    setCandidates([]);
    fetchConstituenciesByScope(selectedMunicipality.name)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setCityConstituencies(data);
        const saved = getSavedFilters();
        if (saved?.constituency && data.some((c: any) => c.id === saved.constituency.id)) {
          setSelectedConstituency(saved.constituency);
        }
        filtersRestoredRef.current = true;
      })
      .catch((err) => console.error('Failed to fetch city constituencies:', err))
      .finally(() => setLoadingCityConstituencies(false));
  }, [selectedMunicipality, getSavedFilters]);

  // ── Gram Panchayat cascading fetches ──
  useEffect(() => {
    if (!selectedGpState) {
      setGpDistricts([]); setSelectedGpDistrict(null);
      setGpTaluks([]); setSelectedGpTaluk(null);
      setGpGrams([]); setSelectedGpGram(null);
      setGpVillages([]); setSelectedGpVillage(null);
      setCandidates([]);
      return;
    }
    setLoadingGpDistricts(true);
    setGpDistricts([]); setSelectedGpDistrict(null);
    setGpTaluks([]); setSelectedGpTaluk(null);
    setGpGrams([]); setSelectedGpGram(null);
    setGpVillages([]); setSelectedGpVillage(null);
    setCandidates([]);
    fetchGPDistricts(selectedGpState)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setGpDistricts(data);
        const saved = getSavedFilters();
        if (saved?.gpDistrict && data.includes(saved.gpDistrict)) {
          setSelectedGpDistrict(saved.gpDistrict);
        }
      })
      .catch((err) => console.error('Failed to fetch GP districts:', err))
      .finally(() => setLoadingGpDistricts(false));
  }, [selectedGpState, getSavedFilters]);

  useEffect(() => {
    if (!selectedGpState || !selectedGpDistrict) {
      setGpTaluks([]); setSelectedGpTaluk(null);
      setGpGrams([]); setSelectedGpGram(null);
      setGpVillages([]); setSelectedGpVillage(null);
      setCandidates([]);
      return;
    }
    setLoadingGpTaluks(true);
    setGpTaluks([]); setSelectedGpTaluk(null);
    setGpGrams([]); setSelectedGpGram(null);
    setGpVillages([]); setSelectedGpVillage(null);
    setCandidates([]);
    fetchGPTaluks(selectedGpState, selectedGpDistrict)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setGpTaluks(data);
        const saved = getSavedFilters();
        if (saved?.gpTaluk && data.includes(saved.gpTaluk)) {
          setSelectedGpTaluk(saved.gpTaluk);
        }
      })
      .catch((err) => console.error('Failed to fetch GP taluks:', err))
      .finally(() => setLoadingGpTaluks(false));
  }, [selectedGpState, selectedGpDistrict, getSavedFilters]);

  useEffect(() => {
    if (!selectedGpState || !selectedGpDistrict || !selectedGpTaluk) {
      setGpGrams([]); setSelectedGpGram(null);
      setGpVillages([]); setSelectedGpVillage(null);
      setCandidates([]);
      return;
    }
    setLoadingGpGrams(true);
    setGpGrams([]); setSelectedGpGram(null);
    setGpVillages([]); setSelectedGpVillage(null);
    setCandidates([]);
    fetchGPGrams(selectedGpState, selectedGpDistrict, selectedGpTaluk)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setGpGrams(data);
        const saved = getSavedFilters();
        if (saved?.gpGram && data.includes(saved.gpGram)) {
          setSelectedGpGram(saved.gpGram);
        }
      })
      .catch((err) => console.error('Failed to fetch GP grams:', err))
      .finally(() => setLoadingGpGrams(false));
  }, [selectedGpState, selectedGpDistrict, selectedGpTaluk, getSavedFilters]);

  useEffect(() => {
    if (!selectedGpState || !selectedGpDistrict || !selectedGpTaluk || !selectedGpGram) {
      setGpVillages([]); setSelectedGpVillage(null);
      setCandidates([]);
      return;
    }
    setLoadingGpVillages(true);
    setGpVillages([]); setSelectedGpVillage(null);
    setCandidates([]);
    fetchGPVillages(selectedGpState, selectedGpDistrict, selectedGpTaluk, selectedGpGram)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setGpVillages(data);
        const saved = getSavedFilters();
        if (saved?.gpVillage && data.some((v: GPVillage) => v.id === saved.gpVillage.id)) {
          setSelectedGpVillage(saved.gpVillage);
        }
        filtersRestoredRef.current = true;
      })
      .catch((err) => console.error('Failed to fetch GP villages:', err))
      .finally(() => setLoadingGpVillages(false));
  }, [selectedGpState, selectedGpDistrict, selectedGpTaluk, selectedGpGram, getSavedFilters]);

  // Tracks the election type the auto-load effect has already handled, so it
  // re-fires when the user navigates between dashboard tiles (different ?type=).
  const lastAutoLoadedTypeRef = useRef<string | null>(null);
  // Params of the load currently in flight. On mount, two effects (the auto-load
  // effect and the selectedConstituency effect) request the SAME election+
  // constituency back-to-back; this collapses those into a single network call.
  // A later, intentional refresh (e.g. after voting) runs once this clears.
  const inFlightLoadRef = useRef<string | null>(null);
  // Same idea for the constituency stats fetch, which the same mount burst
  // would otherwise request multiple times for the identical election+constituency.
  // `inFlightStatsRef` dedupes concurrent identical fetches; `latestStatsKeyRef`
  // tracks the most-recently-requested key so the result is applied to state
  // even when an effect re-run skipped (deduped) its own fetch.
  const inFlightStatsRef = useRef<string | null>(null);
  const latestStatsKeyRef = useRef<string | null>(null);

  // Load aspirants – called only when both election AND constituency/GP village are set
  const loadAspirants = useCallback(async (electionId: number, constituencyId: number) => {
      const loadKey = `${electionId}:${constituencyId}`;
      if (inFlightLoadRef.current === loadKey) return; // identical fetch already running
      inFlightLoadRef.current = loadKey;
      try {
        setLoading(true);
        // Clear stale cards so the list area shows the loader (not the previous
        // tab's aspirants) while the new constituency's data is fetched.
        setCandidates([]);
        const { data } = await fetchAspirantsByConstituency(electionId, constituencyId, useAuthStore.getState().user?.id);
        const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
        const approved = list.filter((c: any) => c.status === 'approved' && c.documentStatus === 'completed');
        // Sort order:
        //  1. Highest overall rating first.
        //  2. Ties keep the API's incoming order (newest first) via the index
        //     fallback, which also makes the sort stable.
        const sortedApproved = approved
          .map((c: any, index: number) => ({ c, index }))
          .sort((a: any, b: any) => {
            const ra = Number(a.c.overallRating?.averageRating) || 0;
            const rb = Number(b.c.overallRating?.averageRating) || 0;
            if (rb !== ra) return rb - ra;
            return a.index - b.index;
          })
          .map((entry: any) => entry.c);
        setCandidates(sortedApproved);
        // Extract vote counts and percentages from inline fields
        const counts: Record<number, number> = {};
        const percentages: Record<number, number> = {};
        list.forEach((c: any) => {
          if (c.voteCount != null) counts[c.id] = Number(c.voteCount);
          if (c.votePercentage != null) percentages[c.id] = Number(c.votePercentage);
        });
        setVoteCounts(counts);
        setVotePercentages(percentages);
        // Extract meetings and visits from inline data (per aspirant)
        const meetingsMap: Record<number, any[]> = {};
        const visitsMap: Record<number, any[]> = {};
        list.forEach((c: any) => {
          if (Array.isArray(c.meetings)) {
            const normalizedMeetings = c.meetings.map((m: any) => ({
              ...m,
              scheduledAt: parseTime(m?.startTime ?? m?.scheduledAt ?? null),
              endTime: parseTime(m?.endTime ?? null),
            }));
            meetingsMap[c.id] = mergeStoredMeetingLiked(normalizedMeetings);
          }
          if (Array.isArray(c.visits)) visitsMap[c.id] = mergeStoredLiked(c.visits);
        });
        setAspirantMeetings(meetingsMap);
        setAspirantVisits(visitsMap);
        // Store per-meeting, per-visit, and overall ratings from API response
        const overallMap: Record<number, { averageRating: number; totalRatings: number }> = {};
        list.forEach((c: any) => {
          if (c.overallRating) overallMap[c.id] = c.overallRating;
        });
        setCandidateOverallRatings(overallMap);
        // Restore persisted meeting ratings from localStorage
        const restoredMeetingRatings: Record<number, number> = {};
        Object.values(meetingsMap).flat().forEach((m: any) => {
          const stored = parseInt(localStorage.getItem(`meeting_rating_${useAuthStore.getState().user?.id ?? 'guest'}_${m.id}`) || '0', 10);
          if (stored > 0) restoredMeetingRatings[m.id] = stored;
        });
        if (Object.keys(restoredMeetingRatings).length > 0) setMeetingRatings(restoredMeetingRatings);
        // Restore persisted visit ratings from localStorage
        const restoredVisitRatings: Record<number, number> = {};
        Object.values(visitsMap).flat().forEach((v: any) => {
          const stored = parseInt(localStorage.getItem(`visit_rating_${useAuthStore.getState().user?.id ?? 'guest'}_${v.id}`) || '0', 10);
          if (stored > 0) restoredVisitRatings[v.id] = stored;
        });
        if (Object.keys(restoredVisitRatings).length > 0) setVisitRatings(restoredVisitRatings);
        // fetch voting window and disable registration if voting is active
        try {
          const windowResp = await fetchVotingWindow();
          const isVotingAllowed = windowResp?.data?.isVotingAllowed;
          setVotingWindowActive(Boolean(isVotingAllowed));
          const w = windowResp?.data?.window;
          if (w) setVotingWindow({ startTime: w.startTime, endTime: w.endTime, description: w.description, isActive: Boolean(w.isActive), electionName: (windowResp as any)?.data?.window?.election?.name ?? '', electionId: (w as any)?.electionId ?? (w as any)?.election?.id });
          setBlockedElectionType(isVotingAllowed && w?.isActive ? (w as any)?.election?.type ?? null : null);
        } catch (e) {
          // ignore voting window errors
        }
      } catch (error) {
        setCandidates([]);
      } finally {
        setLoading(false);
        inFlightLoadRef.current = null;
      }
  }, []);

  // Auto-load aspirants when arriving from a dashboard tile with ?type=<election_type>.
  // Re-fires whenever the URL ?type= changes so navigating between tiles
  // (e.g. state_assembly → municipal_corporation) loads the right data and
  // clears any stale selections from the previous type.
  useEffect(() => {
    // A ?electionId= deep-link (e.g. a meeting notification) is rewritten to
    // ?type= by the conversion effect above. Until that runs, urlType is null
    // and autoElectionType falls back to the stale saved tab — bail out so we
    // don't fetch the wrong election type first and have it race the correct
    // load that fires once the URL is normalized.
    if (searchParams.get('electionId') && !urlType) return;
    if (!autoFilterMode) return;
    if (lastAutoLoadedTypeRef.current === autoElectionType) return;
    if (!elections.length || !autoUserConstituencyId) return;
    const election = elections.find((e) => e.type === autoElectionType);
    if (!election) return;

    // Clear stale per-election state so the context strip and results don't
    // briefly show data from the previously-loaded tile.
    setSelectedConstituency(null);
    setSelectedGpVillage(null);
    setSelectedMunicipality(null);
    setConstituencies([]);
    setCityConstituencies([]);
    setCandidates([]);

    // Purge the cross-election-type filter cache. Otherwise a constituency
    // saved during a previous tile visit (e.g. state_assembly → Aland) gets
    // restored here by ID and shows the wrong name in the context strip.
    try {
      sessionStorage.removeItem(FILTER_STORAGE_KEY);
    } catch {
      // ignore
    }
    // Suppress the saved-filter restoration in the existing election-change
    // effect — we already know what to load from the user's profile.
    filtersRestoredRef.current = true;

    lastAutoLoadedTypeRef.current = autoElectionType;
    setSelectedElectionId(election.id);
    void loadAspirants(election.id, autoUserConstituencyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFilterMode, elections, autoUserConstituencyId, autoElectionType, loadAspirants]);

  // When the active tab/type has no saved constituency (e.g. the user switched
  // to the State Assembly tab but never set their MLA constituency), there is
  // nothing to load — only the "Update Profile" prompt should show. The
  // auto-load effect above bails early here (autoFilterMode is false), so it
  // never clears the previous tab's results. Clear them ourselves so a stale
  // aspirant list isn't shown beneath the prompt.
  useEffect(() => {
    if (!missingConstituencyForType) return;
    setCandidates([]);
    setConstituencyStats(null);
    setSelectedConstituency(null);
  }, [missingConstituencyForType]);

  // In auto mode, resolve the context-strip name directly from the nested
  // constituency object on /auth/me — it already carries id + name + parent
  // metadata, so we don't need to wait for `constituencies` to load or hit
  // /elections/<type>/constituencies a second time just to look up a name.
  useEffect(() => {
    if (!autoFilterMode || !autoUserConstituencyId) return;
    if (autoElectionType === 'municipal_corporation' || autoElectionType === 'gram_panchayat') return;
    if (selectedConstituency?.id === autoUserConstituencyId) return;
    const nested =
      autoElectionType === 'lok_sabha'
        ? (user as any)?.lokSabhaConstituency
        : autoElectionType === 'state_assembly'
          ? (user as any)?.stateAssemblyConstituency
          : null;
    if (nested?.id === autoUserConstituencyId && nested?.name) {
      setSelectedConstituency(nested as Constituency);
      return;
    }
    // Fallback: if /auth/me hasn't delivered the nested object yet, fall back
    // to the already-loaded constituencies list.
    if (!constituencies.length) return;
    const match = constituencies.find((c) => c.id === autoUserConstituencyId);
    if (match) setSelectedConstituency(match);
  }, [autoFilterMode, autoUserConstituencyId, autoElectionType, constituencies, selectedConstituency, user]);

  // Municipal corporation & gram panchayat auto-mode name resolution — same
  // idea, sourced from the nested object on /auth/me.
  useEffect(() => {
    if (!autoFilterMode || !autoUserConstituencyId) return;
    if (
      autoElectionType !== 'municipal_corporation' &&
      autoElectionType !== 'gram_panchayat'
    ) return;
    if (autoElectionType === 'municipal_corporation' && selectedConstituency?.id === autoUserConstituencyId) return;
    if (autoElectionType === 'gram_panchayat' && selectedGpVillage?.id === String(autoUserConstituencyId)) return;

    const nested =
      autoElectionType === 'municipal_corporation'
        ? (user as any)?.municipalCorporationConstituency
        : (user as any)?.gramPanchayatConstituency;
    if (!nested) return;

    if (autoElectionType === 'municipal_corporation') {
      if (nested.id !== autoUserConstituencyId) return;
      setSelectedConstituency(nested as Constituency);
    } else {
      // GP nested object uses `srNo` + `villageName` (no `id`/`name`).
      if (nested.srNo !== autoUserConstituencyId) return;
      setSelectedGpVillage({
        id: String(nested.srNo),
        villageName: nested.villageName ?? '',
        villageCode: '',
        population: '',
      });
    }
  }, [autoFilterMode, autoElectionType, autoUserConstituencyId, selectedConstituency, selectedGpVillage, user]);

  // Fetch aspirants only when constituency changes (election change resets constituency to null first)
  useEffect(() => {
    if (selectedConstituency && selectedElectionId && !isGramPanchayat) {
      void loadAspirants(Number(selectedElectionId), selectedConstituency.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConstituency, loadAspirants]);

  // Fetch voter + aspirant counts for the active election/constituency
  useEffect(() => {
    const eId = selectedElectionId ? Number(selectedElectionId) : null;
    const cId = isGramPanchayat
      ? (selectedGpVillage ? Number(selectedGpVillage.id) : null)
      : (selectedConstituency ? selectedConstituency.id : null);
    if (!eId || !cId) {
      setConstituencyStats(null);
      latestStatsKeyRef.current = null;
      return;
    }
    const statsKey = `${eId}:${cId}`;
    latestStatsKeyRef.current = statsKey;
    // Skip launching a duplicate request — the in-flight one will apply its
    // result below (guarded by latestStatsKeyRef, not a per-run cancel flag).
    if (inFlightStatsRef.current === statsKey) return;
    inFlightStatsRef.current = statsKey;
    fetchConstituencyStats(eId, cId)
      .then(({ data }) => { if (latestStatsKeyRef.current === statsKey) setConstituencyStats(data); })
      .catch(() => { if (latestStatsKeyRef.current === statsKey) setConstituencyStats(null); })
      .finally(() => { inFlightStatsRef.current = null; });
  }, [selectedElectionId, selectedConstituency, selectedGpVillage, isGramPanchayat]);

  // Fetch aspirants for Gram Panchayat only when GP village changes
  useEffect(() => {
    if (selectedGpVillage && selectedElectionId && isGramPanchayat) {
      void loadAspirants(Number(selectedElectionId), Number(selectedGpVillage.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGpVillage, loadAspirants]);

  // Show/hide scroll-to-top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tick every second for countdown timer
  useEffect(() => {
    const hasMeetings = Object.values(aspirantMeetings).some(m => m.length > 0);
    if (!hasMeetings) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [aspirantMeetings]);

  return (
    <>
      {/* Home & Public Issue buttons commented out per request.
          (Previously: hidden when embedded in the dashboard, which provides
          its own navigation — hero + bottom nav.) */}
      {/*
      {!embedded && (
      <Box
        sx={{
          px: 2,
          py: 1.5,
          mb: { xs: 2, sm: 3 },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/user/dashboard')}
            sx={{
              flex: 1,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1, sm: 1.25 },
              background: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`,
              boxShadow: '0 4px 18px rgba(239,68,68,0.4)',
              '&:hover': {
                background: `linear-gradient(135deg, #dc2626 0%, #ef4444 100%)`,
                boxShadow: '0 6px 24px rgba(239,68,68,0.5)',
              },
            }}
          >
            {t('common.home', { defaultValue: 'Home' })}
          </Button>

          {(() => {
            // In auto-mode (dashboard tile deep-link) the user's constituency
            // comes from /auth/me — selectedMunicipality and the GP cascade
            // are never populated, so the original check hid the button on
            // municipal/GP tiles. Relax the gate when autoFilterMode is on.
            const allFiltersSelected = autoFilterMode
              ? !!autoUserConstituencyId && !!selectedElectionId
              : isGramPanchayat
                ? !!(selectedElectionId && selectedGpState && selectedGpDistrict && selectedGpTaluk && selectedGpGram && selectedGpVillage)
                : isMunicipalElection
                  ? !!(selectedElectionId && selectedMunicipality && selectedConstituency)
                  : !!(selectedElectionId && selectedConstituency);

            if (!allFiltersSelected) return null;

            return (
              <Button
                variant="contained"
                startIcon={<ReportProblemIcon />}
                onClick={() => {
                  navigate('/user/civic-issues', {
                    state: {
                      electionId: selectedElectionId,
                      electionName: elections.find((e) => e.id === selectedElectionId)?.name,
                      constituencyId: isGramPanchayat ? Number(selectedGpVillage?.id) : selectedConstituency?.id,
                      constituencyName: isGramPanchayat ? selectedGpVillage?.villageName : selectedConstituency?.name,
                      ...(isGramPanchayat && {
                        gpState: selectedGpState,
                        gpDistrict: selectedGpDistrict,
                        gpTaluk: selectedGpTaluk,
                        gpGram: selectedGpGram,
                        gpVillageId: selectedGpVillage?.id,
                        gpVillageName: selectedGpVillage?.villageName,
                      }),
                    },
                  });
                }}
                sx={{
                  flex: 1,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '0.65rem', sm: '0.78rem' },
                  px: { xs: 1.2, sm: 1.6 },
                  py: { xs: 0.8, sm: 1 },
                  background: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`,
                  boxShadow: '0 4px 18px rgba(239,68,68,0.4)',
                  '&:hover': {
                    background: `linear-gradient(135deg, #dc2626 0%, #ef4444 100%)`,
                    boxShadow: '0 6px 24px rgba(239,68,68,0.5)',
                  },
                }}
              >
                {t('pages.wardCandidates.reportCivicIssue') || 'Public Issue'}
              </Button>
            );
          })()}
        </Stack>
      </Box>
      )}
      */}
      <Stack className="ward-candidates-page" spacing={3}>
        {/* Voting window notification (temporarily disabled) */}
        {/* {false && votingWindow && (
          <Box sx={{
            p: { xs: 1.5, sm: 2 }, borderRadius: '12px',
            background: isDark ? 'rgba(37,58,154,0.12)' : 'rgba(37,58,154,0.06)',
            border: `1px solid ${isDark ? 'rgba(37,58,154,0.28)' : 'rgba(37,58,154,0.18)'}`,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <HowToVoteIcon sx={{ color: BRAND.blue, fontSize: 28 }} />
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: textPrimary }}>
                {t('pages.wardCandidates.votingWindowTitle')}
              </Typography>
              {votingWindow.electionName && (
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: textPrimary, mt: 0.3 }}>
                  {votingWindow.electionName}
                </Typography>
              )}
              {votingWindow.description && (
                <Typography sx={{ fontSize: '0.82rem', color: textFaint, mt: 0.3 }}>
                  {votingWindow.description}
                </Typography>
              )}
              <Typography sx={{ fontSize: '0.82rem', color: textFaint, mt: 0.4 }}>
                {(() => {
                  try {
                    const s = new Date(Number(votingWindow.startTime));
                    const e = new Date(Number(votingWindow.endTime));
                    const startStr = `${s.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric' })} at ${s.toLocaleTimeString(i18n.language, { hour: 'numeric', minute: '2-digit' })}`;
                    const endStr = `${e.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', year: 'numeric' })} at ${e.toLocaleTimeString(i18n.language, { hour: 'numeric', minute: '2-digit' })}`;
                    return t('pages.wardCandidates.votingWindowDates', { start: startStr, end: endStr });
                  } catch (e) {
                    return '';
                  }
                })()}
              </Typography>
              {votingWindowActive && (
                <Typography sx={{ fontSize: '0.76rem', color: isDark ? 'rgba(245,168,0,0.85)' : BRAND.yellowLight, fontWeight: 600, mt: 0.5 }}>
                  {t('pages.wardCandidates.votingEligibility')}
                </Typography>
              )}
            </Box>
          </Box>
        )} */}

        {/* Page header (hidden when a voting window is present so the banner appears directly above filters, and when embedded in the dashboard which has its own hero) */}
        {!embedded && !votingWindow && (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'center', md: 'center' },
              justifyContent: "space-between"
            }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: textPrimary, fontFamily: '"Baloo 2", cursive', letterSpacing: '-0.5px' }}>
                {t('pages.wardCandidates.title') || 'Aspirants'}
              </Typography>
              <Typography variant="body2" sx={{ color: textFaint, mb: 1.5 }}>
                {t('pages.wardCandidates.subtitle') || 'Meet the aspirants running for your constituency'}
              </Typography>
            </Box>
          </Stack>
        )}

        {/* 3-tab selector — drives `activeTab` which in turn sets the
            effective `autoElectionType`. Only renders when the page is
            visited without a `?type=` deep-link (e.g. coming from /user/sop
            "My Area Aspirants"). Dashboard tiles pass `?type=` and skip the
            tab UI entirely. Styled to match the Civic Issues page tabs. */}
        {showTabSelector && (
        <Box sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2.5,
          borderRadius: 3,
          border: `1px solid ${isDark ? 'rgba(245,168,0,0.18)' : 'rgba(245,168,0,0.28)'}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(17,24,39,0.02)',
        }}>
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }}>
            {(() => {
              const hasMunicipal = (user as any)?.municipalCorporationConstituency?.id != null;
              const hasGp = (user as any)?.gramPanchayatConstituency != null;
              const wardTabLabel = hasMunicipal
                ? (t('userDashboard.actions.myMunicipalCorporationAspirants') || 'My Municipal Aspirants')
                : hasGp
                  ? (t('userDashboard.actions.myGramPanchayatAspirants') || 'My Gram Panchayat Aspirants')
                  : (t('pages.wardCandidates.tabWardPanchayat') || 'My Ward / Panchayat Aspirants');
              const wardTabIcon = PlaceIcon;
              const tabs: { key: AspirantTab; label: string; Icon: typeof ParliamentIcon; inactiveImg?: string; activeImg?: string }[] = [
                { key: 'mp', label: t('userDashboard.actions.myLokSabhaAspirants') || 'My Lok Sabha Aspirants', Icon: ParliamentIcon },
                { key: 'mla', label: t('userDashboard.actions.myStateAssemblyAspirants') || 'My State Assembly Aspirants', Icon: GavelIcon, inactiveImg: capitolInactiveImg, activeImg: capitolActiveImg },
                { key: 'ward_panchayat', label: wardTabLabel, Icon: wardTabIcon },
              ];
              return tabs.map(({ key, label, Icon, inactiveImg, activeImg }) => {
                const isActive = activeTab === key;
                const imgSrc = isActive ? activeImg : inactiveImg;
                return (
                  <Box
                    key={key}
                    onClick={() => setActiveTab(key)}
                    sx={{
                      flex: 1,
                      cursor: 'pointer',
                      px: { xs: 1, sm: 1.5 },
                      py: { xs: 1.4, sm: 1.6 },
                      borderRadius: 2,
                      border: isActive
                        ? '1.5px solid rgba(245,168,0,0.55)'
                        : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)'}`,
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(245,168,0,0.95) 0%, rgba(224,32,16,0.85) 100%)'
                        : isDark
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(17,24,39,0.02)',
                      color: isActive ? '#fff' : isDark ? 'rgba(255,255,255,0.78)' : 'rgba(17,24,39,0.78)',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.4,
                      textAlign: 'center',
                      minWidth: 0,
                      '&:hover': isActive
                        ? {}
                        : {
                            borderColor: 'rgba(245,168,0,0.45)',
                            background: isDark ? 'rgba(245,168,0,0.06)' : 'rgba(245,168,0,0.06)',
                          },
                    }}
                  >
                    {imgSrc ? (
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={label}
                        sx={{
                          width: { xs: 26, sm: 30 },
                          height: { xs: 26, sm: 30 },
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <Icon
                        sx={{
                          fontSize: { xs: 24, sm: 26 },
                          color: isActive ? '#fff' : BRAND.yellow,
                        }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontFamily: '"Baloo 2", cursive',
                        fontWeight: 700,
                        fontSize: { xs: '0.78rem', sm: '0.88rem' },
                        lineHeight: 1.15,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              });
            })()}
          </Stack>
        </Box>
        )}

        {/* Legacy filter UI — preserved but never renders now that the tab
            selector above always sets `autoElectionType`. */}
        {!isAutoTypeMode && (
        <>
        {/* GP / Village not found help message - mobile: above filters */}
        {isGramPanchayat && (
          <Typography variant="body2" sx={{ display: { xs: 'block', sm: 'none' }, color: isDark ? 'rgb(245, 168, 0)' : 'red', fontStyle: 'italic', mb: 0.5 }}>
            {t('civicIssues.gpVillageNotFound')}
          </Typography>
        )}

        {/* Election Type & Constituency Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
          <TextField
            select
            label={t('forms.aspirant.electionType', { defaultValue: 'Election Type' })}
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value ? Number(e.target.value) : '')}
            sx={{
              flex: 1, minWidth: 0,
              '& .MuiOutlinedInput-root': {
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
                '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
                '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
              },
              '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
              '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
              '& .MuiSelect-select': { color: isDark ? '#fff' : 'rgba(15,23,42,0.9)' },
            }}
            slotProps={{ select: {
              MenuProps: {
                slotProps: {
                  paper: {
                    sx: {
                      bgcolor: isDark ? '#1a1515' : '#ffffff',
                      '& .MuiMenuItem-root': { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.85)' },
                      '& .MuiMenuItem-root:hover': { bgcolor: isDark ? 'rgba(245,168,0,0.08)' : 'rgba(245,168,0,0.1)' },
                      '& .MuiMenuItem-root.Mui-selected': { bgcolor: isDark ? 'rgba(245,168,0,0.15)' : 'rgba(245,168,0,0.2)', color: BRAND.yellow },
                    },
                  },
                },
              },
            } }}
          >
            {elections.map((el) => (
              <MenuItem key={el.id} value={el.id}>{el.name}</MenuItem>
            ))}
          </TextField>

          {isGramPanchayat ? (
            <>
              <Autocomplete
                options={gpStates}
                value={selectedGpState}
                onChange={(_, value) => setSelectedGpState(value)}
                disabled={!selectedElectionId}
                loading={loadingGpStates}
                sx={{ flex: 1, minWidth: 0 }}
                slotProps={{ listbox: { sx: { bgcolor: isDark ? '#1a1515' : '#fff' } } }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="State"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
                        '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
                      },
                      '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
                    }}
                  />
                )}
              />
              <Autocomplete
                options={gpDistricts}
                value={selectedGpDistrict}
                onChange={(_, value) => setSelectedGpDistrict(value)}
                disabled={!selectedGpState}
                loading={loadingGpDistricts}
                sx={{ flex: 1, minWidth: 0 }}
                slotProps={{ listbox: { sx: { bgcolor: isDark ? '#1a1515' : '#fff' } } }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="District"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
                        '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
                      },
                      '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
                    }}
                  />
                )}
              />
            </>
          ) : isMunicipalElection ? (
            <>
              <Autocomplete
                options={municipalities}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedMunicipality}
                onChange={(_, value) => setSelectedMunicipality(value)}
                disabled={!selectedElectionId}
                loading={loadingMunicipalities}
                sx={{ flex: 1, minWidth: 0 }}
                slotProps={{ listbox: { sx: { bgcolor: isDark ? '#1a1515' : '#fff' } } }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('forms.aspirant.municipality', { defaultValue: 'Corporation / Municipality' })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
                        '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
                      },
                      '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
                    }}
                  />
                )}
              />

              <Autocomplete
                options={cityConstituencies}
                getOptionLabel={(option) => `${option.number ? `${option.number} - ` : ''}${option.name}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedConstituency}
                onChange={(_, value) => setSelectedConstituency(value)}
                disabled={!selectedMunicipality}
                loading={loadingCityConstituencies}
                sx={{ flex: 1, minWidth: 0 }}
                slotProps={{ listbox: { sx: { bgcolor: isDark ? '#1a1515' : '#fff' } } }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('forms.aspirant.cityCorporationWard', { defaultValue: 'City Corporation Ward' })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
                        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
                        '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
                      },
                      '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
                    }}
                  />
                )}
              />
            </>
          ) : (
            <Autocomplete
              options={constituencies}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedConstituency}
              onChange={(_, value) => setSelectedConstituency(value)}
              disabled={!selectedElectionId}
              loading={loadingConstituencies}
              sx={{
                flex: 1, minWidth: 0,
                '& .MuiAutocomplete-popupIndicator': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(17,24,39,0.55)' },
                '& .MuiAutocomplete-clearIndicator': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(17,24,39,0.55)' },
              }}
              slotProps={{ listbox: {
                sx: {
                  bgcolor: isDark ? '#1a1515' : '#fff',
                  '& .MuiAutocomplete-option': {
                    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.9)',
                    '&[aria-selected="true"]': { bgcolor: isDark ? 'rgba(245,168,0,0.15)' : 'rgba(245,168,0,0.1)' },
                    '&.Mui-focused': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.04)' },
                  },
                },
              } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('forms.aspirant.constituency', { defaultValue: 'Constituency' })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
                      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
                      '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
                    },
                    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
                  }}
                />
              )}
            />
          )}
        </Stack>

        {/* Gram Panchayat second row: Taluk, Gram, Village */}
        {isGramPanchayat && selectedGpDistrict && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', flexWrap: 'nowrap' }}>
            <Autocomplete
              options={gpTaluks}
              value={selectedGpTaluk}
              onChange={(_, value) => setSelectedGpTaluk(value)}
              disabled={!selectedGpDistrict}
              loading={loadingGpTaluks}
              sx={{ flex: 1, minWidth: 0 }}
              slotProps={{ listbox: { sx: { bgcolor: isDark ? '#1a1515' : '#fff' } } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Taluk"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
                      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
                      '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
                    },
                    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
                  }}
                />
              )}
            />
            <Autocomplete
              options={gpGrams}
              value={selectedGpGram}
              onChange={(_, value) => setSelectedGpGram(value)}
              disabled={!selectedGpTaluk}
              loading={loadingGpGrams}
              sx={{ flex: 1, minWidth: 0 }}
              slotProps={{ listbox: { sx: { bgcolor: isDark ? '#1a1515' : '#fff' } } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Gram Panchayat"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
                      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
                      '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
                    },
                    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
                  }}
                />
              )}
            />
            <Autocomplete
              options={gpVillages}
              getOptionLabel={(option) => option.villageName}
              value={selectedGpVillage}
              onChange={(_, value) => setSelectedGpVillage(value)}
              disabled={!selectedGpGram}
              loading={loadingGpVillages}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              sx={{ flex: 1, minWidth: 0 }}
              slotProps={{ listbox: { sx: { bgcolor: isDark ? '#1a1515' : '#fff' } } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Village"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
                      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
                      '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
                    },
                    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
                  }}
                />
              )}
            />
          </Stack>
        )}

        {/* GP / Village not found help message - desktop: below filters */}
        {isGramPanchayat && (
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: isDark ? 'rgb(245, 168, 0)' : 'red', fontStyle: 'italic', mt: 0.5 }}>
            {t('civicIssues.gpVillageNotFound')}
          </Typography>
        )}
        </>
        )}

        {/* "Update your profile" empty state — shown when the dashboard tile
            deep-linked us to an election type but the user hasn't saved their
            constituency for it yet. */}
        {missingConstituencyForType && (
          <Box
            sx={{
              mt: { xs: 1, sm: 1.5 },
              mb: { xs: 2, sm: 2 },
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              textAlign: 'center',
              border: `1px solid ${isDark ? 'rgba(245,168,0,0.28)' : 'rgba(245,168,0,0.42)'}`,
              background: isDark
                ? 'linear-gradient(135deg, rgba(245,168,0,0.08) 0%, rgba(224,32,16,0.04) 100%)'
                : 'linear-gradient(135deg, rgba(245,168,0,0.10) 0%, rgba(224,32,16,0.04) 100%)',
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '1.05rem', sm: '1.2rem' },
                fontWeight: 800,
                color: isDark ? '#fff' : 'rgba(17,24,39,0.92)',
                mb: 1,
              }}
            >
              {t('pages.wardCandidates.missingConstituencyTitle', {
                defaultValue: 'Set your {{type}} to see aspirants',
                type: autoTypeLabelKey
                  ? t(autoTypeLabelKey, { defaultValue: 'constituency' })
                  : 'constituency',
              })}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(17,24,39,0.7)',
                mb: 2.5,
                maxWidth: 480,
                mx: 'auto',
                lineHeight: 1.55,
              }}
            >
              {t('pages.wardCandidates.missingConstituencyBody', {
                defaultValue:
                  'Update your {{type}} in your profile to see aspirants in your area.',
                type: autoTypeLabelKey
                  ? t(autoTypeLabelKey, { defaultValue: 'constituency' })
                  : 'constituency',
              })}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/user/complete-profile')}
              sx={{
                py: 1.1,
                px: 3.5,
                borderRadius: 2,
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '0.95rem',
                color: '#fff',
                background:
                  'linear-gradient(135deg, #C8180A 0%, #E02010 100%)',
                boxShadow: '0 6px 20px rgba(200,24,10,0.35)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #E02010 0%, #C8180A 100%)',
                  boxShadow: '0 8px 26px rgba(200,24,10,0.5)',
                },
              }}
            >
              {t('pages.wardCandidates.updateProfileCta', {
                defaultValue: 'Update Profile',
              })}
            </Button>
          </Box>
        )}

        {/* Context strip — shows the currently active election + constituency.
            Stacks vertically on mobile so a long election name (e.g.
            "Municipal Corporation (Corporator)") doesn't squeeze the ward
            name into an awkward 3-line wrap. */}
        {selectedElection && !missingConstituencyForType && (selectedConstituency || selectedGpVillage || selectedMunicipality) && (
          <Box
            sx={{
              mt: { xs: 0.5, sm: 1 },
              mb: { xs: 1, sm: 1.5 },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1, sm: 1.25 },
              borderRadius: 2,
              border: `1px solid ${isDark ? 'rgba(245,168,0,0.25)' : 'rgba(245,168,0,0.4)'}`,
              background: isDark
                ? 'linear-gradient(135deg, rgba(245,168,0,0.06) 0%, rgba(224,32,16,0.04) 100%)'
                : 'linear-gradient(135deg, rgba(245,168,0,0.08) 0%, rgba(224,32,16,0.04) 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 0.75, sm: 1 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 0.75, sm: 1.5 },
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: BRAND.yellow,
                  px: 0.9,
                  py: 0.3,
                  borderRadius: 1,
                  border: `1px solid ${BRAND.yellow}`,
                  lineHeight: 1.2,
                  alignSelf: 'flex-start',
                  maxWidth: '100%',
                }}
              >
                {selectedElection.name}
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '0.95rem', sm: '0.95rem' },
                  fontWeight: 700,
                  color: isDark ? '#fff' : 'rgba(17,24,39,0.92)',
                  lineHeight: 1.3,
                  flex: 1,
                  minWidth: 0,
                  wordBreak: 'break-word',
                }}
              >
                {isGramPanchayat
                  ? selectedGpVillage?.villageName
                  : isMunicipalElection
                    ? selectedConstituency
                      ? `${selectedMunicipality?.name ?? ''}${selectedMunicipality?.name && selectedConstituency ? ' · ' : ''}${selectedConstituency.number ? `${selectedConstituency.number} - ` : ''}${selectedConstituency.name}`
                      : selectedMunicipality?.name
                    : selectedConstituency
                      ? `${selectedConstituency.number ? `${selectedConstituency.number} - ` : ''}${selectedConstituency.name}`
                      : ''}
              </Typography>
            </Box>
            {constituencyStats && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: { xs: 0.75, sm: 1 },
                  pt: { xs: 0.5, sm: 0.25 },
                  borderTop: `1px dashed ${isDark ? 'rgba(245,168,0,0.18)' : 'rgba(245,168,0,0.35)'}`,
                  mt: { xs: 0.25, sm: 0.25 },
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1,
                    py: 0.5,
                    borderRadius: 999,
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
                    border: `1px solid ${isDark ? 'rgba(245,168,0,0.25)' : 'rgba(245,168,0,0.3)'}`,
                  }}
                >
                  <GroupsIcon sx={{ fontSize: '1rem', color: BRAND.yellow }} />
                  <Typography sx={{ fontSize: '0.78rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(17,24,39,0.65)', fontWeight: 600 }}>
                    {t('userDashboard.cards.voters', { defaultValue: 'Registered Citizens' })}:
                  </Typography>
                  <Typography sx={{ fontSize: '0.88rem', color: isDark ? '#fff' : 'rgba(17,24,39,0.92)', fontWeight: 800 }}>
                    {constituencyStats.totalVoters.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1,
                    py: 0.5,
                    borderRadius: 999,
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
                    border: `1px solid ${isDark ? 'rgba(224,32,16,0.3)' : 'rgba(224,32,16,0.3)'}`,
                  }}
                >
                  <HowToVoteIcon sx={{ fontSize: '1rem', color: '#e02010' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(17,24,39,0.65)', fontWeight: 600 }}>
                    {t('userDashboard.cards.aspirants', { defaultValue: 'Aspirants' })}:
                  </Typography>
                  <Typography sx={{ fontSize: '0.88rem', color: isDark ? '#fff' : 'rgba(17,24,39,0.92)', fontWeight: 800 }}>
                    {constituencyStats.totalAspirants.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* If server reports user has voted AND the active voting window is for
            this tab's election, show a green notice. Scoped by electionId so
            voting on Lok Sabha doesn't surface the message under MLA, etc. */}
        {(user?.hasVoted || hasVoted) && isVotingActiveForThisElection && (
          <Box sx={{ my: 2 }}>
            <Typography sx={{ color: 'success.main', fontWeight: 700, textAlign: { xs: 'center', md: 'left' } }}>
              {isKannada ? 'ನೀವು ಈಗಾಗಲೇ ಮತ ಚಲಾಯಿಸಿದ್ದೀರಿ' : 'You have already voted'}
            </Typography>
          </Box>
        )}

        {/* Inline loader — keeps the tabs / constituency header visible above
            while only the list area below shows a spinner during a tab switch. */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "320px"
            }}>
            <CircularProgress sx={{ color: BRAND.red }} />
          </Box>
        )}

        {/* "No candidates yet" + "Register as aspirant" — shown when only demo is present */}
        {!loading && candidates.length > 0 && candidates.every(c => isDemoCandidate(c)) && user && (user.role !== 'aspirant' || aspirantStatus === 'pending') && (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2.5}
            sx={{
              alignItems: "stretch",
              width: '100%'
            }}>
            {/* No candidates yet card */}
            <Box sx={{
              flex: 1, p: 3, borderRadius: '16px', textAlign: 'center',
              background: panelBg,
              border: dividerBorder,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(17,24,39,0.08)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', mb: 0.75, color: textPrimary, fontFamily: '"Baloo 2", cursive' }}>
                {t('pages.wardCandidates.noAspirantsTitle')}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: textFaint, mb: 1 }}>
                {t('pages.wardCandidates.noAspirantsDescription')}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#e05820', fontStyle: 'italic', fontWeight: 600 }}>
                {t('pages.wardCandidates.demoAspirantNotice')}
              </Typography>
            </Box>
            {/* Register as aspirant card - hidden when voting is open for THIS election type */}
            {!registrationBlocked && (
              <Box sx={{
                flex: 1, p: 3, borderRadius: '16px',
                background: panelBg,
                border: panelBorder,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(17,24,39,0.08)',
              }}>
                <Stack spacing={2}>
                  <Typography sx={{ color: GOLD, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.55 }}>
                    {hasPendingRegistration
                      ? t('pages.wardCandidates.pendingApprovalTitle')
                      : t('pages.wardCandidates.registerQuestion')}
                  </Typography>
                  <Typography sx={{ color: textSecondary, fontSize: '0.85rem', lineHeight: 1.65 }}>
                    {hasPendingRegistration
                      ? t('pages.wardCandidates.pendingApprovalDescription')
                      : t('pages.wardCandidates.registerDescription')}
                  </Typography>
                  {(
                    <Button
                      variant="contained"
                      onClick={() => hasPendingRegistration ? handleNavigateToRegistration() : navigate(registerPath)}
                      sx={{
                        alignSelf: { xs: 'stretch', sm: 'flex-start' }, fontWeight: 700, borderRadius: '8px', textTransform: 'none',
                        color: '#fff', background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.red2} 100%)`,
                        boxShadow: '0 4px 18px rgba(200,24,10,0.4)',
                        '&:hover': { background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.red} 100%)` }
                      }}
                    >
                      {hasPendingRegistration ? t('pages.wardCandidates.continueRegistration') : t('pages.wardCandidates.yesRegister')}
                    </Button>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        )}

        {candidates.length > 0 && candidates.every(c => isDemoCandidate(c)) && (!user || (user.role === 'aspirant' && aspirantStatus !== 'pending')) && (
          <Box sx={{
            width: '100%', p: 4, borderRadius: '16px', textAlign: 'center',
            background: panelBg,
            border: dividerBorder,
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(17,24,39,0.08)',
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', mb: 0.75, color: textPrimary, fontFamily: '"Baloo 2", cursive' }}>
              {t('pages.wardCandidates.noAspirantsTitle')}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: textFaint, mb: 1 }}>
              {t('pages.wardCandidates.noAspirantsDescription')}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#e05820', fontStyle: 'italic', fontWeight: 600 }}>
              {t('pages.wardCandidates.demoAspirantNotice')}
            </Typography>
          </Box>
        )}

        {candidates.length > 0 && (
          <Alert
            severity="info"
            icon={<InfoOutlinedIcon fontSize="small" sx={{ color: isDark ? '#FFCB00' : '#dc2626' }} />}
            sx={{
              borderRadius: '10px',
              mb: 2,
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
              '& .MuiAlert-message': { fontSize: '0.85rem' },
            }}
          >
            {t('pages.wardCandidates.profileDisclaimer')}
          </Alert>
        )}

        {candidates.length > 0 && (
          <Box
            sx={{
              mb: 0,
              pb: 0,
              width: '100%',
              mx: 'auto',
              px: { xs: 1, sm: 0 },
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {candidates.map((candidate) => (
              <Box key={candidate.id} id={`aspirant-card-${candidate.id}`}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    p: 0,
                    width: { xs: '100%', sm: 'auto' },
                    background: cardBg,
                    border: cardBorder,
                    position: 'relative',
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(17,24,39,0.08)',
                    overflow: 'hidden',
                    transition: 'transform 0.24s cubic-bezier(.2,.8,.2,1), box-shadow 0.24s ease, border-color 0.24s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: `linear-gradient(180deg, ${BRAND.red} 0%, ${BRAND.yellow} 55%, ${BRAND.brown} 100%)`,
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.7)' : '0 20px 50px rgba(17,24,39,0.14)',
                      borderColor: 'rgba(245,168,0,0.28)',
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: { xs: '14px', md: '16px' }, pb: '8px !important' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                      {/* Avatar */}
                      <Box sx={{
                        p: '2.5px', borderRadius: '50%', flexShrink: 0,
                        background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red2} 180deg 270deg, ${BRAND.yellow2} 270deg 360deg)`,
                      }}>
                        <Avatar
                          src={candidate.selfieUrl || candidate.recentPhotoUrl || undefined}
                          alt={candidate.name}
                          sx={{ width: 56, height: 56, bgcolor: avatarBg, color: GOLD, fontWeight: 700, border: `2px solid ${avatarBg}`, fontSize: '1.25rem' }}
                        >
                          {!(candidate.selfieUrl || candidate.recentPhotoUrl) ? (candidate.name || 'U').charAt(0) : null}
                        </Avatar>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ minWidth: 0, pr: 1 }}>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.25, color: textPrimary, fontFamily: '"Baloo 2", cursive' }}>
                                {candidate.name}
                              </Typography>

                              <Box sx={{ mt: 0.25 }}>
                                {candidate.education && (
                                  <Typography variant="body2" sx={{ color: textDim, fontSize: '0.75rem', lineHeight: 1.1, fontWeight: 600 }}>
                                    {candidate.education}
                                  </Typography>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: candidate.education ? 0.25 : 0.1 }}>
                                  {/* <Typography variant="body2" sx={{ fontSize: '0.72rem', color: votesLabelColor, fontWeight: 600 }}>
                                    Vote:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 900, color: votesValueColor, fontFamily: '"Baloo 2", cursive' }}>
                                    {votePercentages[candidate.id] ?? 0}%
                                  </Typography> */}
                                </Box>
                                {(() => {
                                  // Always show the overall rating, even when there are
                                  // no ratings yet (empty stars + "0.0 (0 ratings)").
                                  const or = candidateOverallRatings[candidate.id] ?? { averageRating: 0, totalRatings: 0 };
                                  return (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>{renderStars(or.averageRating, 11)}</Box>
                                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: BRAND.yellow, lineHeight: 1 }}>
                                        {or.averageRating.toFixed(1)}
                                      </Typography>
                                      <Typography sx={{ fontSize: '0.6rem', color: textFaint, lineHeight: 1 }}>
                                        ({or.totalRatings} {or.totalRatings === 1 ? 'rating' : 'ratings'})
                                      </Typography>
                                    </Box>
                                  );
                                })()}
                              </Box>
                            </Box>

                            <Stack
                              spacing={1}
                              sx={{
                                alignItems: "flex-end",
                                flexShrink: 0
                              }}>
                              <Chip
                                label={(() => {
                                  const INDEPENDENT_VARIANTS = ['independent', 'ಸ್ವತಂತ್ರ'];
                                  const isIndependent = !candidate.party || INDEPENDENT_VARIANTS.includes(candidate.party.toLowerCase().trim());
                                  return isIndependent ? t('forms.aspirant.defaults.party') : candidate.party;
                                })()}
                                size="small"
                                sx={{ borderRadius: '6px', bgcolor: 'rgba(245,168,0,0.12)', color: GOLD, border: '1px solid rgba(245,168,0,0.3)', fontWeight: 700, fontSize: '0.65rem', flexShrink: 0, height: 20 }}
                              />

                              {isDemoCandidate(candidate) && (
                                <Chip label="DEMO" size="small" sx={{ borderRadius: '6px', bgcolor: 'rgba(200,24,10,0.15)', color: BRAND.red, border: `1px solid ${BRAND.red}`, fontWeight: 800, fontSize: '0.6rem', height: 20 }} />
                              )}
                              <Button
                                size="small"
                                onClick={() => {
                                  // Remember which card we left from so we scroll
                                  // back to it when the user returns from the
                                  // aspirant details page (same as the Chat button).
                                  try { sessionStorage.setItem('wardlist_return_aspirant', String(candidate.id)); } catch { /* ignore */ }
                                  navigate(`/user/aspirants/${candidate.id}/view`, { state: { candidate } });
                                }}
                                sx={{
                                  px: 0.68, py: 0.68, minWidth: 82, borderRadius: 1.5, minHeight: 25,
                                  textTransform: 'none', fontWeight: 700, fontSize: '0.55rem', lineHeight: 1,
                                  background: 'rgba(245,168,0,0.12)', color: GOLD, border: '1px solid rgb(245, 167, 0)',
                                  '&:hover': { bgcolor: 'rgba(245,168,0,0.12)', color: GOLD, border: `1px solid ${GOLD}` }
                                }}
                                variant="outlined"
                              >
                                {t('pages.wardCandidates.viewManifesto') || 'View Details'}
                              </Button>
                            </Stack>
                          </Box>

                          {candidate.wardName && (
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.35, color: textDim }}>
                              <LocationOnIcon sx={{ fontSize: 11 }} />
                              {candidate.wardName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    {/* Divider after profile */}
                    <Box sx={{ height: '1px', my: 1, background: 'linear-gradient(90deg, transparent, rgba(245,168,0,0.25), transparent)' }} />

                    {/* Video Meet Section — all meetings */}
                    {(() => {
                      const isDemo = isDemoCandidate(candidate);
                      const visibleMeetings = (aspirantMeetings[candidate.id] ?? []).filter((m: any) => {
                        if (isDemo) return true; // Demo: always show all meetings
                        const et = m.endTime ?? null;
                        const mTs = m.scheduledAt ? Number(m.scheduledAt) : NaN;
                        const mD = !isNaN(mTs) ? new Date(mTs > 1e12 ? mTs : mTs * 1000) : null;
                        const sAt = mD && !isNaN(mD.getTime()) ? mD : null;
                        let endMs: number | null = null;
                        if (et != null && !isNaN(Number(et))) { const n = Number(et); endMs = n > 1e12 ? n : n * 1000; }
                        else if (sAt) { endMs = sAt.getTime() + 3600000; }
                        return !endMs || now <= endMs + 86400000;
                      });
                      if (!visibleMeetings.length) return null;
                      return (
                        <>
                          <Box sx={{ mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <VideocamIcon sx={{ fontSize: 16, color: GOLD }} />
                              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: textPrimary }}>
                                {t('pages.wardCandidates.videoMeetTitle')}
                              </Typography>
                            </Box>
                            {visibleMeetings.map((meeting: any, mIdx: number) => {
                              const _mTs = meeting.scheduledAt ? Number(meeting.scheduledAt) : NaN;
                              const _md = !isNaN(_mTs) ? new Date(_mTs > 1e12 ? _mTs : _mTs * 1000) : null;
                              const scheduledAt = _md && !isNaN(_md.getTime()) ? _md : null;
                              const meetEndMs = (() => {
                                const et = meeting.endTime ?? null;
                                if (et != null && !isNaN(Number(et))) { const n = Number(et); return n > 1e12 ? n : n * 1000; }
                                return scheduledAt ? scheduledAt.getTime() + 3600000 : null;
                              })();
                              const meetingStatus = getMeetingTimeStatus(scheduledAt ? scheduledAt.getTime() : null, meetEndMs, now, isDemo);
                              return (
                                <Box key={meeting.id || mIdx} sx={{ mb: mIdx < visibleMeetings.length - 1 ? 1 : 0, p: 1, borderRadius: '8px', bgcolor: insetBg, border: `1px solid ${BRAND.red}` }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8, mb: 0.2, flexWrap: 'nowrap' }}>
                                        <Box sx={{ flexShrink: 0, mt: '2px' }}>{getPlatformIcon(meeting.platform, 18)}</Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: textPrimary, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                          {t('pages.wardCandidates.meetDefaultTitle')}
                                        </Typography>
                                      </Box>
                                      {scheduledAt && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                              <CalendarIcon sx={{ fontSize: 13, color: isDark ? '#fff' : textPrimary }} />
                                              <Typography variant="caption" sx={{ color: isDark ? '#fff' : textPrimary, fontSize: '0.7rem', fontWeight: 700 }}>
                                                {scheduledAt.toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' })}
                                              </Typography>
                                            </Box>
                                            <Chip
                                              size="small"
                                              label={meetingStatus === 'live' ? 'Live' : meetingStatus === 'past' ? 'Past Meeting' : 'Upcoming Meeting'}
                                              sx={{
                                                height: 16,
                                                fontSize: '0.55rem',
                                                fontWeight: 600,
                                                borderRadius: '6px',
                                                flexShrink: 0,
                                                background: meetingStatus === 'live'
                                                  ? 'rgba(239,68,68,0.18)'
                                                  : meetingStatus === 'past'
                                                    ? 'rgba(251,146,60,0.15)'
                                                    : 'rgba(34,197,94,0.15)',
                                                color: meetingStatus === 'live' ? '#ef4444' : meetingStatus === 'past' ? '#fb923c' : '#22c55e',
                                                boxShadow: 'none',
                                                border: meetingStatus === 'live'
                                                  ? '1px solid rgba(239,68,68,0.45)'
                                                  : meetingStatus === 'past'
                                                    ? '1px solid rgba(251,146,60,0.35)'
                                                    : '1px solid rgba(34,197,94,0.35)',
                                                '& .MuiChip-label': { px: 0.8 }
                                              }}
                                            />
                                          </Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, ml: 0.3 }}>
                                            <Typography variant="caption" sx={{ color: isDark ? '#fff' : textPrimary, fontSize: '0.65rem', fontWeight: 600 }}>
                                              {(() => {
                                                const startStr = scheduledAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                                                let endDate: Date;
                                                const et = meeting.endTime ?? null;
                                                if (et != null && !isNaN(Number(et))) {
                                                  const etNum = Number(et);
                                                  endDate = new Date(etNum > 1e12 ? etNum : etNum * 1000);
                                                } else {
                                                  endDate = new Date(scheduledAt.getTime() + 3600000);
                                                }
                                                return `${startStr} - ${endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                                              })()}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(17,24,39,0.65)', fontSize: '0.63rem', fontWeight: 600, px: 0.5, py: 0.2, borderRadius: '4px', bgcolor: isDark ? 'rgba(245,168,0,0.15)' : 'rgba(245,168,0,0.1)' }}>
                                              {(() => { const h = scheduledAt.getHours(); return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'; })()}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      )}
                                    </Box>
                                    {/* Like button */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                      <Button
                                        size="small"
                                        disabled={!isDemoCandidate(candidate) && !!meetEndMs && now > meetEndMs}
                                        onClick={() => {
                                          const mId = Number(meeting.id);
                                          const willLike = !meeting.liked;
                                          if (mId > 0 && !isDemoCandidate(candidate)) void respondMeeting(mId, { attending: willLike }).catch(() => {});
                                          const keySet = getStoredMeetingLiked();
                                          const newSet = new Set(keySet);
                                          if (willLike) newSet.add(mId); else newSet.delete(mId);
                                          storeMeetingLiked(newSet);
                                          setAspirantMeetings(prev => {
                                            const copy = { ...prev };
                                            copy[candidate.id] = (copy[candidate.id] || []).map((mm: any) =>
                                              mm.id === meeting.id ? { ...mm, liked: willLike, attendingCount: (Number(mm.attendingCount || 0) + (willLike ? 1 : -1)) } : mm
                                            );
                                            return copy;
                                          });
                                        }}
                                        sx={{ color: isDark ? '#fff' : textPrimary, textTransform: 'none', fontSize: '0.7rem', fontWeight: 700, minWidth: 0, px: 0.5 }}
                                      >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {meeting.liked ? <ThumbUpIcon sx={{ fontSize: 14 }} /> : <ThumbUpOffAltIcon sx={{ fontSize: 14 }} />}
                                            <Box component="span" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{Number(meeting.attendingCount || meeting.likeCount || 0)}</Box>
                                          </Box>
                                          <Typography variant="caption" sx={{ fontSize: '0.64rem', mt: 0.25, color: textFaint }}>{t('pages.wardCandidates.attending', { defaultValue: 'Attending' }).replace(/\s*\(?\s*\{\{[^}]+\}\}\s*\)?/g, '')}</Typography>
                                        </Box>
                                      </Button>
                                    </Box>
                                  </Box>
                                  {/* Meeting aggregate rating */}
                                  {meeting.rating?.totalRatings > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>{renderStars(meeting.rating.averageRating, 13)}</Box>
                                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.yellow, lineHeight: 1 }}>{Number(meeting.rating.averageRating).toFixed(1)}</Typography>
                                      <Typography sx={{ fontSize: '0.63rem', color: textFaint, lineHeight: 1 }}>({meeting.rating.totalRatings} {meeting.rating.totalRatings === 1 ? 'rating' : 'ratings'})</Typography>
                                    </Box>
                                  )}
                                  {/* Join button */}
                                  {meeting.meetingLink && (
                                    <Button
                                      variant="contained" size="small" fullWidth
                                      disabled={!isDemoCandidate(candidate) && !!meetEndMs && now > meetEndMs}
                                      startIcon={<Box sx={{ display: 'flex', alignItems: 'center' }}>{getPlatformIcon(meeting.platform, 25, (!isDemoCandidate(candidate) && !!meetEndMs && now > meetEndMs) ? 'default' : (meeting.platform === 'instagram' || meeting.platform === 'facebook') ? 'white' : 'default')}</Box>}
                                      endIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
                                      sx={{ mt: 1.2, height: 34, borderRadius: '8px', textTransform: 'none', fontWeight: 800, color: '#fff', fontSize: '0.74rem', ...getPlatformButtonStyle(meeting.platform), '&.Mui-disabled': { background: 'rgba(120,120,120,0.25)', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.6)', '& .MuiSvgIcon-root': { color: isDark ? 'rgba(255,255,255,0.35)' : '#1976d2' } } }}
                                      onClick={() => {
                                        void trackInteraction(candidate.id);
                                        const raw = meeting.meetingLink;
                                        const prefixed = raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
                                        // C-SEC-4: meetingLink is aspirant-supplied — never navigate to a
                                        // script-capable scheme. safeUrl returns null for those; bail out.
                                        const link = safeUrl(prefixed);
                                        if (!link) return;
                                        // iOS standalone PWA / wrapped WebView silently no-ops window.open('_blank'),
                                        // which is why Instagram (and other) meeting links rendered blank on iOS while
                                        // working on Android. Same-window navigation lets iOS hand the universal link
                                        // to the native IG / FB / Zoom / Meet app.
                                        const isStandalone =
                                          window.matchMedia?.('(display-mode: standalone)').matches ||
                                          (navigator as any).standalone === true ||
                                          !!(window as any).ReactNativeWebView;
                                        if (isStandalone) window.location.href = link;
                                        else window.open(link, '_blank', 'noopener');
                                      }}
                                    >
                                      {!isDemoCandidate(candidate) && !!meetEndMs && now > meetEndMs ? 'Meeting Ended' : (meeting.platform && PLATFORM_TEXT_KEYS[meeting.platform] ? t(PLATFORM_TEXT_KEYS[meeting.platform]) : t('pages.wardCandidates.joinVideoMeeting'))}
                                    </Button>
                                  )}
                                  {/* Rating info message — show when meeting ended but rating window hasn't opened yet */}
                                  {(() => {
                                    if (isDemoCandidate(candidate)) return null;
                                    const meetingEnded = !!meetEndMs && now > meetEndMs;
                                    if (!meetingEnded || !scheduledAt) return null;
                                    const nextDay = new Date(scheduledAt);
                                    nextDay.setDate(nextDay.getDate() + 1);
                                    nextDay.setHours(10, 0, 0, 0);
                                    const ratingStart = nextDay.getTime();
                                    nextDay.setHours(22, 0, 0, 0);
                                    const ratingEnd = nextDay.getTime();
                                    if (now >= ratingStart && now <= ratingEnd) return null; // rating window is open, don't show message
                                    if (now > ratingEnd) return null; // rating window already passed
                                    const ratingDate = new Date(ratingStart).toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' });
                                    return (
                                      <Typography sx={{ fontSize: '0.7rem', color: GOLD, fontWeight: 600, mt: 0.8, textAlign: 'center' }}>
                                        {t('pages.wardCandidates.ratingWindowInfo', { defaultValue: 'Meeting ended. Ratings open tomorrow from 10 AM to 10 PM.' })}
                                      </Typography>
                                    );
                                  })()}
                                  {/* Rating widget — for demo: always visible; for real: enabled 10 AM on meeting day to 10 PM next day */}
                                  {(() => {
                                    const isDemo = isDemoCandidate(candidate);
                                    if (!isDemo && !scheduledAt) return null;
                                    // Rating window: next day after meeting, 10 AM to 10 PM
                                    let ratingWindowStart: number | null = null;
                                    let ratingWindowEnd: number | null = null;
                                    if (scheduledAt) {
                                      const nextDay = new Date(scheduledAt);
                                      nextDay.setDate(nextDay.getDate() + 1);
                                      nextDay.setHours(10, 0, 0, 0);
                                      ratingWindowStart = nextDay.getTime();
                                      nextDay.setHours(22, 0, 0, 0);
                                      ratingWindowEnd = nextDay.getTime();
                                    }
                                    const withinRatingWindow = ratingWindowStart != null && ratingWindowEnd != null && now >= ratingWindowStart && now <= ratingWindowEnd;
                                    if (!isDemo && !withinRatingWindow) {
                                      // Outside 10 AM–10 PM: only show if user already rated
                                      const storedRating = meetingRatings[meeting.id] ?? getStoredMeetingRating(meeting.id);
                                      if (storedRating < 1) return null;
                                    }
                                    const currentRating = meetingRatings[meeting.id] ?? getStoredMeetingRating(meeting.id);
                                    if (!isDemo) {
                                      if (!withinRatingWindow && currentRating < 1) return null;
                                      if (withinRatingWindow && meeting.isRated === true && currentRating < 1) return null;
                                    }
                                    const windowExpired = !isDemo && !withinRatingWindow;
                                    const showMeetingButtons = !windowExpired && currentRating < 1 && meeting.isRated !== true;
                                    return (
                                      <Box sx={{ mt: 1.2, mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.9 }}>
                                          <Box component="span" sx={{ color: '#10b981', fontSize: '0.8rem', lineHeight: 1 }}>⚡</Box>
                                          <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: GOLD, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                            {showMeetingButtons ? 'Rate this Meeting' : "Supporter's Rating"}
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
                                          {RATING_OPTIONS.map(opt => {
                                            const isSelected = currentRating === opt.value;
                                            const breakdown = (meeting as any).rating?.distribution ?? null;
                                            const totalB: number = (meeting as any).rating?.totalRatings ?? 0;
                                            const pct = breakdown && totalB > 0 ? Math.round(((breakdown[String(opt.value)] || 0) / totalB) * 100) : null;
                                            const r = 22;
                                            const circ = 2 * Math.PI * r;
                                            const dashOffset = circ - (circ * (pct ?? (isSelected ? 100 : 0)) / 100);
                                            const hoverAnim = ({ 1: 'rShake 0.35s ease infinite', 2: 'rNod 0.55s ease-in-out infinite', 3: 'rTada 0.75s ease-in-out infinite', 4: 'rHeartBeat 0.45s ease-in-out infinite', 5: 'rFireDance 0.4s ease-in-out infinite' } as Record<number, string>)[opt.value];
                                            return (
                                              <Box
                                                key={opt.value}
                                                onClick={showMeetingButtons ? () => handleRateMeeting(Number(meeting.id), opt.value) : undefined}
                                                sx={{
                                                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4,
                                                  cursor: showMeetingButtons ? 'pointer' : 'default',
                                                  transition: 'transform 0.2s ease',
                                                  opacity: !showMeetingButtons && !isSelected ? 0.45 : 1,
                                                  userSelect: 'none',
                                                  ...(showMeetingButtons && {
                                                    '&:hover': { transform: 'translateY(-5px) scale(1.06)' },
                                                    '&:hover .ri-ring': { filter: `drop-shadow(0 0 9px ${opt.color})`, transition: 'filter 0.2s ease' },
                                                    '&:hover .ri-emoji': { animation: `${hoverAnim} !important` },
                                                  }),
                                                }}
                                              >
                                                <Box sx={{ position: 'relative', width: 50, height: 50 }}>
                                                  <svg width="50" height="50" style={{ position: 'absolute', top: 0, left: 0 }}>
                                                    <circle cx="25" cy="25" r={r} fill={isSelected ? opt.bg : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')} stroke={isSelected ? opt.color : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')} strokeWidth="1.5" />
                                                  </svg>
                                                  <Box component="span" className="ri-ring" sx={{ position: 'absolute', top: 0, left: 0, display: 'block', lineHeight: 0, transition: 'filter 0.2s ease' }}>
                                                    <svg width="50" height="50" style={{ display: 'block', transform: 'rotate(-90deg)' }}>
                                                      <circle
                                                        cx="25" cy="25" r={r}
                                                        fill="none"
                                                        stroke={opt.color}
                                                        strokeWidth="3"
                                                        strokeDasharray={circ}
                                                        strokeDashoffset={dashOffset}
                                                        strokeLinecap="round"
                                                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                                      />
                                                    </svg>
                                                  </Box>
                                                  <Box
                                                    className="ri-emoji"
                                                    sx={{
                                                      position: 'absolute', inset: 0,
                                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                      fontSize: '1.25rem', lineHeight: 1,
                                                      '@keyframes emojiFloat': { '0%, 100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-2px) scale(1.1)' } },
                                                      '@keyframes emojiPulse': { '0%, 100%': { transform: 'scale(1.1)' }, '50%': { transform: 'scale(1.28)' } },
                                                      '@keyframes rShake': { '0%, 100%': { transform: 'translateX(0) rotate(0deg)' }, '20%': { transform: 'translateX(-4px) rotate(-10deg)' }, '40%': { transform: 'translateX(4px) rotate(10deg)' }, '60%': { transform: 'translateX(-3px) rotate(-6deg)' }, '80%': { transform: 'translateX(3px) rotate(6deg)' } },
                                                      '@keyframes rNod': { '0%, 100%': { transform: 'translateY(0) scale(1.1)' }, '50%': { transform: 'translateY(-5px) scale(1.25)' } },
                                                      '@keyframes rTada': { '0%': { transform: 'scale(1)' }, '10%, 20%': { transform: 'scale(0.85) rotate(-10deg)' }, '30%, 50%, 70%, 90%': { transform: 'scale(1.3) rotate(10deg)' }, '40%, 60%, 80%': { transform: 'scale(1.3) rotate(-10deg)' }, '100%': { transform: 'scale(1) rotate(0deg)' } },
                                                      '@keyframes rHeartBeat': { '0%': { transform: 'scale(1)' }, '14%': { transform: 'scale(1.35)' }, '28%': { transform: 'scale(1)' }, '42%': { transform: 'scale(1.35)' }, '70%': { transform: 'scale(1)' } },
                                                      '@keyframes rFireDance': { '0%, 100%': { transform: 'scale(1.1) rotate(0deg)' }, '20%': { transform: 'scale(1.4) rotate(-12deg) translateY(-3px)' }, '40%': { transform: 'scale(1.15) rotate(12deg)' }, '60%': { transform: 'scale(1.4) rotate(-8deg) translateY(-3px)' }, '80%': { transform: 'scale(1.15) rotate(8deg)' } },
                                                      animation: isSelected ? 'emojiPulse 0.8s ease-in-out infinite' : 'emojiFloat 3s ease-in-out infinite',
                                                      animationDelay: `${opt.value * 0.18}s`,
                                                    }}
                                                  >
                                                    {opt.emoji}
                                                  </Box>
                                                </Box>
                                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: isSelected ? opt.color : textPrimary, lineHeight: 1, minHeight: '0.8rem' }}>
                                                  {pct !== null ? `${pct}%` : ''}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.4rem', fontWeight: 800, color: isSelected ? opt.color : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'), letterSpacing: '0.03em', textAlign: 'center', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                                                  {opt.label.toUpperCase()}
                                                </Typography>
                                              </Box>
                                            );
                                          })}
                                        </Box>
                                        {(() => {
                                          const totalB: number = (meeting as any).rating?.totalRatings ?? 0;
                                          if (totalB === 0) return null;
                                          return (
                                            <Typography sx={{ fontSize: '0.52rem', color: textFaint, textAlign: 'center', mt: 0.7, letterSpacing: '0.05em', fontWeight: 700 }}>
                                              TOTAL RESPONDENTS: {totalB}
                                            </Typography>
                                          );
                                        })()}
                                      </Box>
                                    );
                                  })()}
                                </Box>
                              );
                            })}
                          </Box>
                          {/* Divider after video meet */}
                          <Box sx={{ height: '1px', my: 1, background: 'linear-gradient(90deg, transparent, rgba(245,168,0,0.25), transparent)' }} />
                        </>
                      );
                    })()}

                    {/* Direct Meets Section — from aspirant visits API */}
                    {aspirantVisits[candidate.id] && aspirantVisits[candidate.id].filter((v: any) => {
                      if (isDemoCandidate(candidate)) return true; // Demo: always show all visits
                      const raw = v.startTime ?? v.scheduledAt ?? v.createdAt ?? null;
                      if (!raw) return true;
                      const num = Number(raw);
                      const date = new Date(num > 1e12 ? num : num * 1000);
                      return (Date.now() - date.getTime()) < 24 * 60 * 60 * 1000;
                    }).length > 0 && (
                      <>
                        <Box sx={{ mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <GroupsIcon sx={{ fontSize: 16, color: GOLD }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: textPrimary }}>
                              {t('pages.wardCandidates.directMeetTitle')}
                            </Typography>
                          </Box>
                          {aspirantVisits[candidate.id].filter((v: any) => {
                            if (isDemoCandidate(candidate)) return true; // Demo: always show all visits
                            const raw = v.startTime ?? v.scheduledAt ?? v.createdAt ?? null;
                            if (!raw) return true;
                            const num = Number(raw);
                            const date = new Date(num > 1e12 ? num : num * 1000);
                            return (Date.now() - date.getTime()) < 24 * 60 * 60 * 1000;
                          }).map((visit: any, idx: number) => {
                            const startRaw = visit.startTime ?? visit.scheduledAt ?? null;
                            const endRaw = visit.endTime ?? null;
                            const startNum = startRaw ? Number(startRaw) : NaN;
                            const endNum = endRaw ? Number(endRaw) : NaN;
                            const startDate = !isNaN(startNum) ? new Date(startNum > 1e12 ? startNum : startNum * 1000) : null;
                            const endDate = !isNaN(endNum) ? new Date(endNum > 1e12 ? endNum : endNum * 1000) : null;
                            const visitStatus = getMeetingTimeStatus(startDate ? startDate.getTime() : null, endDate ? endDate.getTime() : null, now, isDemoCandidate(candidate));
                            // C-SEC-4: googleMapsLink is aspirant-supplied — sanitize before rendering as an href.
                            const mapsLink = safeUrl(visit.googleMapsLink) ?? (/^https?:\/\//i.test(visit.location || '') ? visit.location : null);
                            return (
                              <Box key={visit.id || idx} sx={{ mb: 1, p: 1, borderRadius: '8px', bgcolor: insetBg, border: `1px solid ${BRAND.red}`, position: 'relative' }}>
                                <Button
                                  size="small"
                                  disabled={!isDemoCandidate(candidate) && (() => { const ms = endDate ? endDate.getTime() : startDate ? startDate.getTime() + 3600000 : null; return !!ms && now > ms; })()}
                                  onClick={() => handleToggleAttend(candidate.id, visit.id)}
                                  sx={{ position: 'absolute', top: 4, right: 4, color: isDark ? '#fff' : textPrimary, textTransform: 'none', fontSize: '0.65rem', fontWeight: 700, minWidth: 0, px: 0.5, py: 0.2 }}
                                >
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {visit.liked ? <ThumbUpIcon sx={{ fontSize: 14 }} /> : <ThumbUpOffAltIcon sx={{ fontSize: 14 }} />}
                                      <Box component="span" sx={{ fontWeight: 700, fontSize: '0.88rem' }}>{Number(visit.attendingCount || 0)}</Box>
                                    </Box>
                                    <Typography variant="caption" sx={{ fontSize: '0.64rem', mt: 0.2, color: textFaint }}>{t('pages.wardCandidates.attending', { defaultValue: 'Attending' }).replace(/\s*\(?\s*\{\{[^}]+\}\}\s*\)?/g, '')}</Typography>
                                  </Box>
                                </Button>
                                {/* Title/date/location — padded right to clear the absolute attending button */}
                                <Box sx={{ pr: 5 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word', mb: 0.4 }}>{t('pages.wardCandidates.directMeetDefaultTitle')}</Typography>
                                {(startDate || endDate) && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexWrap: 'wrap' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                        <CalendarIcon sx={{ fontSize: 12, color: isDark ? '#fff' : textPrimary }} />
                                        <Typography variant="caption" sx={{ color: isDark ? '#fff' : textPrimary, fontSize: '0.7rem', fontWeight: 700 }}>
                                          {startDate ? startDate.toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
                                        </Typography>
                                      </Box>
                                      {startDate && (
                                        <Chip
                                          size="small"
                                          label={visitStatus === 'live' ? 'Live' : visitStatus === 'past' ? 'Past Meeting' : 'Upcoming Meeting'}
                                          sx={{
                                            height: 16,
                                            fontSize: '0.55rem',
                                            fontWeight: 600,
                                            borderRadius: '6px',
                                            flexShrink: 0,
                                            background: visitStatus === 'live'
                                              ? 'rgba(239,68,68,0.18)'
                                              : visitStatus === 'past'
                                                ? 'rgba(251,146,60,0.15)'
                                                : 'rgba(34,197,94,0.15)',
                                            color: visitStatus === 'live' ? '#ef4444' : visitStatus === 'past' ? '#fb923c' : '#22c55e',
                                            boxShadow: 'none',
                                            border: visitStatus === 'live'
                                              ? '1px solid rgba(239,68,68,0.45)'
                                              : visitStatus === 'past'
                                                ? '1px solid rgba(251,146,60,0.35)'
                                                : '1px solid rgba(34,197,94,0.35)',
                                            '& .MuiChip-label': { px: 0.8 }
                                          }}
                                        />
                                      )}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, ml: 0.3 }}>
                                      <Typography variant="caption" sx={{ color: isDark ? '#fff' : textPrimary, fontSize: '0.65rem', fontWeight: 600 }}>
                                        {startDate ? startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}{startDate && (endDate ? ` - ${endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}` : ` - ${new Date((startDate).getTime() + 3600000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(17,24,39,0.65)', fontSize: '0.63rem', fontWeight: 600, px: 0.5, py: 0.2, borderRadius: '4px', bgcolor: isDark ? 'rgba(245,168,0,0.15)' : 'rgba(245,168,0,0.1)' }}>
                                        {(() => {
                                          const hour = startDate ? startDate.getHours() : 0;
                                          if (hour < 12) return 'Morning';
                                          if (hour < 17) return 'Afternoon';
                                          return 'Evening';
                                        })()}
                                      </Typography>
                                    </Box>
                                  </Box>
                                )}
                                {(visit.location || visit.googleMapsLink) && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                    <PlaceIcon sx={{ fontSize: 13, color: isDark ? '#fff' : textPrimary, fontWeight: 700 }} />
                                    {mapsLink ? (
                                      visit.location ? (
                                        <Typography
                                          variant="caption"
                                          component="a"
                                          href={mapsLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          sx={{ color: isDark ? '#fff' : textPrimary, fontSize: '0.72rem', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
                                        >
                                          {visit.location}
                                        </Typography>
                                      ) : (
                                        <Typography
                                          variant="caption"
                                          component="a"
                                          href={mapsLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          sx={{ color: isDark ? '#fff' : textPrimary, fontSize: '0.72rem', textDecoration: 'underline', cursor: 'pointer' }}
                                        >
                                          {t('pages.wardCandidates.openInMaps')}
                                        </Typography>
                                      )
                                    ) : (
                                      <Typography variant="caption" sx={{ color: isDark ? '#fff' : textPrimary, fontSize: '0.72rem', fontWeight: 700 }}>
                                        {visit.location}
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                                </Box>{/* end pr:5 wrapper */}
                                {/* Visit aggregate rating from API */}
                                {visit.rating?.totalRatings > 0 && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>{renderStars(visit.rating.averageRating, 13)}</Box>
                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.yellow, lineHeight: 1 }}>
                                      {Number(visit.rating.averageRating).toFixed(1)}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.63rem', color: textFaint, lineHeight: 1 }}>
                                      ({visit.rating.totalRatings} {visit.rating.totalRatings === 1 ? 'rating' : 'ratings'})
                                    </Typography>
                                  </Box>
                                )}
                                {/* Rating info message — show when visit ended but rating window hasn't opened yet */}
                                {(() => {
                                  if (isDemoCandidate(candidate)) return null;
                                  const visitEndMs = endDate ? endDate.getTime() : startDate ? startDate.getTime() + 3600000 : null;
                                  const visitEnded = !!visitEndMs && now > visitEndMs;
                                  const visitStart = startDate ?? endDate ?? null;
                                  if (!visitEnded || !visitStart) return null;
                                  const nextDay = new Date(visitStart);
                                  nextDay.setDate(nextDay.getDate() + 1);
                                  nextDay.setHours(10, 0, 0, 0);
                                  const ratingStart = nextDay.getTime();
                                  nextDay.setHours(22, 0, 0, 0);
                                  const ratingEnd = nextDay.getTime();
                                  if (now >= ratingStart && now <= ratingEnd) return null;
                                  if (now > ratingEnd) return null;
                                  const ratingDate = new Date(ratingStart).toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric' });
                                  return (
                                    <Typography sx={{ fontSize: '0.7rem', color: GOLD, fontWeight: 600, mt: 0.8, textAlign: 'center' }}>
                                      {t('pages.wardCandidates.ratingWindowInfoMeet', { defaultValue: 'Meet ended. Ratings open tomorrow from 10 AM to 10 PM.' })}
                                    </Typography>
                                  );
                                })()}
                                {/* Rating widget — for demo: always visible; for real: enabled next day 10 AM–10 PM */}
                                {(() => {
                                  const isDemo = isDemoCandidate(candidate);
                                  const visitStartDate = startDate ?? endDate ?? null;
                                  if (!isDemo && !visitStartDate) return null;
                                  // Rating window: next day after visit, 10 AM to 10 PM
                                  let ratingWindowStart: number | null = null;
                                  let ratingWindowEnd: number | null = null;
                                  if (visitStartDate) {
                                    const nextDay = new Date(visitStartDate);
                                    nextDay.setDate(nextDay.getDate() + 1);
                                    nextDay.setHours(10, 0, 0, 0);
                                    ratingWindowStart = nextDay.getTime();
                                    nextDay.setHours(22, 0, 0, 0);
                                    ratingWindowEnd = nextDay.getTime();
                                  }
                                  const withinRatingWindow = ratingWindowStart != null && ratingWindowEnd != null && now >= ratingWindowStart && now <= ratingWindowEnd;
                                  if (!isDemo && !withinRatingWindow) {
                                    const storedRating = visitRatings[visit.id] ?? getStoredVisitRating(visit.id);
                                    if (storedRating < 1) return null;
                                  }
                                  const currentRating = visitRatings[visit.id] ?? getStoredVisitRating(visit.id);
                                  if (!isDemo) {
                                    if (!withinRatingWindow && currentRating < 1) return null;
                                    if (withinRatingWindow && visit.isRated === true && currentRating < 1) return null;
                                  }
                                  const visitWindowExpired = !isDemo && !withinRatingWindow;
                                  const showVisitButtons = !visitWindowExpired && currentRating < 1 && visit.isRated !== true;
                                  return (
                                    <Box sx={{ mt: 1.2, pt: 1, borderTop: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.9 }}>
                                        <Box component="span" sx={{ color: '#10b981', fontSize: '0.8rem', lineHeight: 1 }}>⚡</Box>
                                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: GOLD, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                          {showVisitButtons ? 'Rate this Meet' : "Supporter's Rating"}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
                                        {RATING_OPTIONS.map(opt => {
                                          const isSelected = currentRating === opt.value;
                                          const breakdown = (visit as any).rating?.distribution ?? null;
                                          const totalB: number = (visit as any).rating?.totalRatings ?? 0;
                                          const pct = breakdown && totalB > 0 ? Math.round(((breakdown[String(opt.value)] || 0) / totalB) * 100) : null;
                                          const r = 22;
                                          const circ = 2 * Math.PI * r;
                                          const dashOffset = circ - (circ * (pct ?? (isSelected ? 100 : 0)) / 100);
                                          const hoverAnim = ({ 1: 'rShake 0.35s ease infinite', 2: 'rNod 0.55s ease-in-out infinite', 3: 'rTada 0.75s ease-in-out infinite', 4: 'rHeartBeat 0.45s ease-in-out infinite', 5: 'rFireDance 0.4s ease-in-out infinite' } as Record<number, string>)[opt.value];
                                          return (
                                            <Box
                                              key={opt.value}
                                              onClick={showVisitButtons ? () => handleRateVisit(Number(visit.id), opt.value) : undefined}
                                              sx={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4,
                                                cursor: showVisitButtons ? 'pointer' : 'default',
                                                transition: 'transform 0.2s ease',
                                                opacity: !showVisitButtons && !isSelected ? 0.45 : 1,
                                                userSelect: 'none',
                                                ...(showVisitButtons && {
                                                  '&:hover': { transform: 'translateY(-5px) scale(1.06)' },
                                                  '&:hover .ri-ring': { filter: `drop-shadow(0 0 9px ${opt.color})`, transition: 'filter 0.2s ease' },
                                                  '&:hover .ri-emoji': { animation: `${hoverAnim} !important` },
                                                }),
                                              }}
                                            >
                                              <Box sx={{ position: 'relative', width: 50, height: 50 }}>
                                                <svg width="50" height="50" style={{ position: 'absolute', top: 0, left: 0 }}>
                                                  <circle cx="25" cy="25" r={r} fill={isSelected ? opt.bg : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')} stroke={isSelected ? opt.color : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')} strokeWidth="1.5" />
                                                </svg>
                                                <Box component="span" className="ri-ring" sx={{ position: 'absolute', top: 0, left: 0, display: 'block', lineHeight: 0, transition: 'filter 0.2s ease' }}>
                                                  <svg width="50" height="50" style={{ display: 'block', transform: 'rotate(-90deg)' }}>
                                                    <circle
                                                      cx="25" cy="25" r={r}
                                                      fill="none"
                                                      stroke={opt.color}
                                                      strokeWidth="3"
                                                      strokeDasharray={circ}
                                                      strokeDashoffset={dashOffset}
                                                      strokeLinecap="round"
                                                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                                    />
                                                  </svg>
                                                </Box>
                                                <Box
                                                  className="ri-emoji"
                                                  sx={{
                                                    position: 'absolute', inset: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.25rem', lineHeight: 1,
                                                    '@keyframes emojiFloat': { '0%, 100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-2px) scale(1.1)' } },
                                                    '@keyframes emojiPulse': { '0%, 100%': { transform: 'scale(1.1)' }, '50%': { transform: 'scale(1.28)' } },
                                                    '@keyframes rShake': { '0%, 100%': { transform: 'translateX(0) rotate(0deg)' }, '20%': { transform: 'translateX(-4px) rotate(-10deg)' }, '40%': { transform: 'translateX(4px) rotate(10deg)' }, '60%': { transform: 'translateX(-3px) rotate(-6deg)' }, '80%': { transform: 'translateX(3px) rotate(6deg)' } },
                                                    '@keyframes rNod': { '0%, 100%': { transform: 'translateY(0) scale(1.1)' }, '50%': { transform: 'translateY(-5px) scale(1.25)' } },
                                                    '@keyframes rTada': { '0%': { transform: 'scale(1)' }, '10%, 20%': { transform: 'scale(0.85) rotate(-10deg)' }, '30%, 50%, 70%, 90%': { transform: 'scale(1.3) rotate(10deg)' }, '40%, 60%, 80%': { transform: 'scale(1.3) rotate(-10deg)' }, '100%': { transform: 'scale(1) rotate(0deg)' } },
                                                    '@keyframes rHeartBeat': { '0%': { transform: 'scale(1)' }, '14%': { transform: 'scale(1.35)' }, '28%': { transform: 'scale(1)' }, '42%': { transform: 'scale(1.35)' }, '70%': { transform: 'scale(1)' } },
                                                    '@keyframes rFireDance': { '0%, 100%': { transform: 'scale(1.1) rotate(0deg)' }, '20%': { transform: 'scale(1.4) rotate(-12deg) translateY(-3px)' }, '40%': { transform: 'scale(1.15) rotate(12deg)' }, '60%': { transform: 'scale(1.4) rotate(-8deg) translateY(-3px)' }, '80%': { transform: 'scale(1.15) rotate(8deg)' } },
                                                    animation: isSelected ? 'emojiPulse 0.8s ease-in-out infinite' : 'emojiFloat 3s ease-in-out infinite',
                                                    animationDelay: `${opt.value * 0.18}s`,
                                                  }}
                                                >
                                                  {opt.emoji}
                                                </Box>
                                              </Box>
                                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: isSelected ? opt.color : textPrimary, lineHeight: 1, minHeight: '0.8rem' }}>
                                                {pct !== null ? `${pct}%` : ''}
                                              </Typography>
                                              <Typography sx={{ fontSize: '0.4rem', fontWeight: 800, color: isSelected ? opt.color : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'), letterSpacing: '0.03em', textAlign: 'center', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                                                {opt.label.toUpperCase()}
                                              </Typography>
                                            </Box>
                                          );
                                        })}
                                      </Box>
                                      {(() => {
                                        const totalB: number = (visit as any).rating?.totalRatings ?? 0;
                                        if (totalB === 0) return null;
                                        return (
                                          <Typography sx={{ fontSize: '0.52rem', color: textFaint, textAlign: 'center', mt: 0.7, letterSpacing: '0.05em', fontWeight: 700 }}>
                                            TOTAL RESPONDENTS: {totalB}
                                          </Typography>
                                        );
                                      })()}
                                    </Box>
                                  );
                                })()}
                              </Box>
                            );
                          })}
                        </Box>
                        {/* Divider after direct meets */}
                        <Box sx={{ height: '1px', my: 1, background: 'linear-gradient(90deg, transparent, rgba(245,168,0,0.25), transparent)' }} />
                      </>
                    )}

                    {/* WhatsApp & Phone & Chat Section — hidden for demo */}
                    {!isDemoCandidate(candidate) && (candidate.allowWhatsapp || candidate.allowPhone || candidate.allowChat) && (
                      <>
                        {((candidate.allowWhatsapp && candidate.whatsappNumber) || (candidate.allowPhone && candidate.phone)) && (
                          <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                            {candidate.allowWhatsapp && candidate.whatsappNumber && (
                              <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  minHeight: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 700,
                                  background: '#25D366', color: '#fff', border: '1px solid rgba(37,211,102,0.12)',
                                  fontSize: '0.72rem',
                                  '&:hover': { background: '#1fa851' },
                                }}
                                onClick={() => {
                                  const _contactTs = Date.now();
                                  void trackInteraction(candidate.id, '/users/track/phone-call', _contactTs).then((ok) => {
                                    // Reflect the new contact state immediately so the
                                    // rating-window message appears without a refetch.
                                    if (ok) setCandidates((prev) => prev.map((c) => c.id === candidate.id ? { ...c, canRateContact: true, isContactRated: false, contactedAt: _contactTs } : c));
                                  });
                                  const digits = candidate.whatsappNumber!.replace(/[^0-9]/g, '');
                                  // wa.me requires full international format. PWA path (window.location.href)
                                  // strictly rejects numbers without a country code; browser path is forgiving.
                                  const num = digits.length === 10 ? `91${digits}` : digits;
                                  const url = `https://wa.me/${num}`;
                                  // iOS standalone PWAs silently no-op window.open('_blank'),
                                  // breaking the wa.me universal-link handoff to WhatsApp.
                                  const isStandalone =
                                    window.matchMedia?.('(display-mode: standalone)').matches ||
                                    (navigator as any).standalone === true;
                                  if (isStandalone) window.location.href = url;
                                  else window.open(url, '_blank', 'noopener');
                                }}
                              >
                                WhatsApp
                              </Button>
                            )}
                            {candidate.allowPhone && candidate.phone && (
                              <Button
                                size="small"
                                fullWidth
                                startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
                                onClick={() => {
                                  const _contactTs = Date.now();
                                  void trackInteraction(candidate.id, '/users/track/phone-call', _contactTs).then((ok) => {
                                    // Reflect the new contact state immediately so the
                                    // rating-window message appears without a refetch.
                                    if (ok) setCandidates((prev) => prev.map((c) => c.id === candidate.id ? { ...c, canRateContact: true, isContactRated: false, contactedAt: _contactTs } : c));
                                  });
                                  window.open(`tel:${candidate.phone}`, '_self');
                                }}
                                sx={{
                                  px: 1.25, py: 0.45, minWidth: 84, minHeight: 40, borderRadius: 1.2,
                                  textTransform: 'none', fontWeight: 700, fontSize: '0.68rem',
                                  background: GOLD, color: '#fff', border: '1px solid rgba(245,168,0,0.3)',
                                  '&:hover': { bgcolor: '#FFD700', background: '#FFD700', color: '#111', border: '1px solid #FFD700' }
                                }}
                                variant="outlined"
                              >
                                {t('pages.wardCandidates.phoneCall')}
                              </Button>
                            )}
                          </Box>
                        )}
                        {/* Chat Button — hidden for own profile, shown only if allowChat */}
                        {candidate.allowChat && user?.aspirantId !== candidate.id && (
                          <Box sx={{ mt: 1 }}>
                            <Button
                              variant="contained"
                              size="small"
                              fullWidth
                              startIcon={<ForumIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                minHeight: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 700,
                                color: '#fff', background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.red2} 100%)`,
                                fontSize: '0.72rem',
                                '&:hover': { background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.red} 100%)` },
                              }}
                              onClick={() => {
                                const _contactTs = Date.now();
                                // Reflect the new contact state synchronously, BEFORE we
                                // navigate away — gating this on the async track result
                                // would never apply, because navigate() unmounts the list
                                // before the promise resolves. (WhatsApp/Phone don't
                                // navigate, so they can wait for the result.) This makes
                                // the rating-window message appear when the user returns.
                                setCandidates((prev) => prev.map((c) => c.id === candidate.id ? { ...c, canRateContact: true, isContactRated: false, contactedAt: _contactTs } : c));
                                // Track the chat interaction, AND reuse the phone-call
                                // tracking endpoint so the backend persists the contact
                                // (contactedAt / canRateContact) and the rating window
                                // survives a refetch — same path WhatsApp/Phone already use.
                                void trackInteraction(candidate.id, '/users/track/chat', _contactTs);
                                void trackInteraction(candidate.id, '/users/track/phone-call', _contactTs);
                                // Remember which card we left from so we can scroll back
                                // to it when the user returns from the chat page.
                                try { sessionStorage.setItem('wardlist_return_aspirant', String(candidate.id)); } catch { /* ignore */ }
                                navigate(`/user/chat/${candidate.id}`, { state: { candidate } });
                              }}
                            >
                              {t('pages.wardCandidates.joinInterview')}
                            </Button>
                          </Box>
                        )}
                        {/* Contact prompt / rating-window message — shown when phone,
                            WhatsApp or Chat is enabled. Once the voter has contacted
                            (canRateContact), the eligibility prompt is replaced by the
                            rating-window info. Window = next day after contact, 10 AM–10 PM
                            (same calculation as meeting ratings). Hidden once rated. */}
                        {(!!candidate.phone || !!candidate.whatsappNumber || (candidate.allowChat && user?.aspirantId !== candidate.id)) && (() => {
                          const helperSx = { mt: 0.6, fontFamily: '"Baloo 2", cursive', fontSize: '0.72rem', lineHeight: 1.4, color: isDark ? '#FFCB00' : '#412323', textAlign: 'center' as const };
                          const currentRating = contactRatings[candidate.id] ?? getStoredContactRating(candidate.id);
                          const rated = candidate.isContactRated || currentRating > 0;

                          // Rating window: next day after contact, 10:00–22:00 (same as meetings).
                          let ratingStart: number | null = null;
                          let ratingEnd: number | null = null;
                          if (candidate.contactedAt) {
                            const d = new Date(Number(candidate.contactedAt));
                            d.setDate(d.getDate() + 1);
                            d.setHours(10, 0, 0, 0);
                            ratingStart = d.getTime();
                            d.setHours(22, 0, 0, 0);
                            ratingEnd = d.getTime();
                          }
                          const contacted = candidate.canRateContact || rated || candidate.contactedAt != null;
                          const beforeWindow = ratingStart != null && now < ratingStart;
                          const afterWindow = ratingEnd != null && now > ratingEnd;

                          // Never contacted → eligibility prompt.
                          if (!contacted) {
                            return (
                              <Typography sx={helperSx}>
                                {t('pages.wardCandidates.eligibilityHelper', { defaultValue: 'Contact via WhatsApp, Phone or Chat to Evaluate & Rate' })}
                              </Typography>
                            );
                          }

                          // After the rating window closes → restart the cycle:
                          // show the contact-eligibility prompt again (rated or not),
                          // so the voter can contact via WhatsApp/Phone and rate next time.
                          if (afterWindow) {
                            return (
                              <Typography sx={helperSx}>
                                {t('pages.wardCandidates.eligibilityHelper', { defaultValue: 'Contact via WhatsApp, Phone or Chat to Evaluate & Rate' })}
                              </Typography>
                            );
                          }

                          // Contacted but the window hasn't opened yet → info message.
                          if (beforeWindow) {
                            return (
                              <Typography sx={helperSx}>
                                {t('pages.wardCandidates.contactRatingWindowInfo', { defaultValue: 'Rating will open from tomorrow 10 AM to 10 PM.' })}
                              </Typography>
                            );
                          }

                          // Within the window (or contactedAt missing) → rating widget,
                          // clickable until rated, read-only once rated.
                          const showContactButtons = !rated;
                          return (
                            <Box sx={{ mt: 1.2, mb: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, mb: 0.9 }}>
                                <Box component="span" sx={{ color: '#10b981', fontSize: '0.8rem', lineHeight: 1 }}>⚡</Box>
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: isDark ? GOLD : '#412323', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                  {showContactButtons
                                    ? t('pages.wardCandidates.rateContact', { defaultValue: 'Rate this Contact' })
                                    : t('pages.wardCandidates.contactRated', { defaultValue: 'Contact Rating' })}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
                                {RATING_OPTIONS.map(opt => {
                                  const isSelected = currentRating === opt.value;
                                  const breakdown = candidate.contactRating?.distribution ?? null;
                                  const totalB: number = candidate.contactRating?.totalRatings ?? 0;
                                  const pct = breakdown && totalB > 0 ? Math.round(((breakdown[String(opt.value)] || 0) / totalB) * 100) : null;
                                  const r = 22;
                                  const circ = 2 * Math.PI * r;
                                  const dashOffset = circ - (circ * (pct ?? (isSelected ? 100 : 0)) / 100);
                                  const hoverAnim = ({ 1: 'rShake 0.35s ease infinite', 2: 'rNod 0.55s ease-in-out infinite', 3: 'rTada 0.75s ease-in-out infinite', 4: 'rHeartBeat 0.45s ease-in-out infinite', 5: 'rFireDance 0.4s ease-in-out infinite' } as Record<number, string>)[opt.value];
                                  return (
                                    <Box
                                      key={opt.value}
                                      onClick={showContactButtons ? () => handleRateContact(candidate.id, opt.value) : undefined}
                                      sx={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4,
                                        cursor: showContactButtons ? 'pointer' : 'default',
                                        transition: 'transform 0.2s ease',
                                        opacity: !showContactButtons && !isSelected ? 0.45 : 1,
                                        userSelect: 'none',
                                        ...(showContactButtons && {
                                          '&:hover': { transform: 'translateY(-5px) scale(1.06)' },
                                          '&:hover .ri-ring': { filter: `drop-shadow(0 0 9px ${opt.color})`, transition: 'filter 0.2s ease' },
                                          '&:hover .ri-emoji': { animation: `${hoverAnim} !important` },
                                        }),
                                      }}
                                    >
                                      <Box sx={{ position: 'relative', width: 50, height: 50 }}>
                                        <svg width="50" height="50" style={{ position: 'absolute', top: 0, left: 0 }}>
                                          <circle cx="25" cy="25" r={r} fill={isSelected ? opt.bg : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')} stroke={isSelected ? opt.color : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')} strokeWidth="1.5" />
                                        </svg>
                                        <Box component="span" className="ri-ring" sx={{ position: 'absolute', top: 0, left: 0, display: 'block', lineHeight: 0, transition: 'filter 0.2s ease' }}>
                                          <svg width="50" height="50" style={{ display: 'block', transform: 'rotate(-90deg)' }}>
                                            <circle
                                              cx="25" cy="25" r={r}
                                              fill="none"
                                              stroke={opt.color}
                                              strokeWidth="3"
                                              strokeDasharray={circ}
                                              strokeDashoffset={dashOffset}
                                              strokeLinecap="round"
                                              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                            />
                                          </svg>
                                        </Box>
                                        <Box
                                          className="ri-emoji"
                                          sx={{
                                            position: 'absolute', inset: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.25rem', lineHeight: 1,
                                            '@keyframes emojiFloat': { '0%, 100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-2px) scale(1.1)' } },
                                            '@keyframes emojiPulse': { '0%, 100%': { transform: 'scale(1.1)' }, '50%': { transform: 'scale(1.28)' } },
                                            '@keyframes rShake': { '0%, 100%': { transform: 'translateX(0) rotate(0deg)' }, '20%': { transform: 'translateX(-4px) rotate(-10deg)' }, '40%': { transform: 'translateX(4px) rotate(10deg)' }, '60%': { transform: 'translateX(-3px) rotate(-6deg)' }, '80%': { transform: 'translateX(3px) rotate(6deg)' } },
                                            '@keyframes rNod': { '0%, 100%': { transform: 'translateY(0) scale(1.1)' }, '50%': { transform: 'translateY(-5px) scale(1.25)' } },
                                            '@keyframes rTada': { '0%': { transform: 'scale(1)' }, '10%, 20%': { transform: 'scale(0.85) rotate(-10deg)' }, '30%, 50%, 70%, 90%': { transform: 'scale(1.3) rotate(10deg)' }, '40%, 60%, 80%': { transform: 'scale(1.3) rotate(-10deg)' }, '100%': { transform: 'scale(1) rotate(0deg)' } },
                                            '@keyframes rHeartBeat': { '0%': { transform: 'scale(1)' }, '14%': { transform: 'scale(1.35)' }, '28%': { transform: 'scale(1)' }, '42%': { transform: 'scale(1.35)' }, '70%': { transform: 'scale(1)' } },
                                            '@keyframes rFireDance': { '0%, 100%': { transform: 'scale(1.1) rotate(0deg)' }, '20%': { transform: 'scale(1.4) rotate(-12deg) translateY(-3px)' }, '40%': { transform: 'scale(1.15) rotate(12deg)' }, '60%': { transform: 'scale(1.4) rotate(-8deg) translateY(-3px)' }, '80%': { transform: 'scale(1.15) rotate(8deg)' } },
                                            animation: isSelected ? 'emojiPulse 0.8s ease-in-out infinite' : 'emojiFloat 3s ease-in-out infinite',
                                            animationDelay: `${opt.value * 0.18}s`,
                                          }}
                                        >
                                          {opt.emoji}
                                        </Box>
                                      </Box>
                                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: isSelected ? opt.color : textPrimary, lineHeight: 1, minHeight: '0.8rem' }}>
                                        {pct !== null ? `${pct}%` : ''}
                                      </Typography>
                                      <Typography sx={{ fontSize: '0.4rem', fontWeight: 800, color: isSelected ? opt.color : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'), letterSpacing: '0.03em', textAlign: 'center', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                                        {opt.label.toUpperCase()}
                                      </Typography>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Box>
                          );
                        })()}
                        {/* Divider after contact buttons */}
                        <Box sx={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(245,168,0,0.25), transparent)' }} />
                      </>
                    )}
                  </CardContent>

                  {/* View Details Footer */}
                  <CardActions sx={{ px: { xs: 1.5, md: 2 }, pb: 1.2, pt: 0.75 }}>
                    <Stack spacing={1} sx={{ width: '100%' }}>
                      {(() => {
                        const isDemo = isDemoCandidate(candidate);
                        const isInteractionEligible = !!((user as any)?.isChat || (user as any)?.isMeeting || (user as any)?.isPhoneCall);
                        const voteDisabled = !isVotingActiveForThisElection || !isInteractionEligible;
                        const finalDisabled = isDemo || voteDisabled || hasVoted || Boolean(user?.hasVoted);
                        return (
                          <Box sx={{ width: '100%' }}>
                            {/* Signed SOP button */}
                            {(isDemoCandidate(candidate) || candidate.sopUrl || candidate.sopKannadaUrl) && (
                              <Box sx={{ mb: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isDemoCandidate(candidate)) setDemoSopOpen(true);
                                    else setSopCandidate(candidate);
                                  }}
                                  sx={{
                                    height: 34,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    color: isDark ? '#fff' : textPrimary,
                                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.12)',
                                    fontSize: { xs: '0.72rem', sm: '0.8rem' },
                                  }}
                                >
                                  {t('pages.wardCandidates.signedSOP') || 'Signed SOP'}
                                </Button>
                              </Box>
                            )}

                            {/* Polling / vote button — only rendered while the voting window is
                                open for this election. When the window is closed the button is
                                hidden entirely. While open it shows in a disabled state for demo
                                candidates, ineligible users (no chat/meeting/phone call), or after
                                voting — clicking the disabled button surfaces the eligibility /
                                thank-you dialog so the user knows why they can't vote. */}
                            {isVotingActiveForThisElection && (
                              <Box
                                sx={{ width: '100%' }}
                                onClick={finalDisabled ? () => {
                                  (document.activeElement as HTMLElement | null)?.blur();
                                  if ((hasVoted || user?.hasVoted)) {
                                    setVoteThankOpen(true);
                                  } else {
                                    setEligibilityDialogOpen(true);
                                  }
                                } : undefined}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  fullWidth
                                  startIcon={<HowToVoteIcon />}
                                  disabled={finalDisabled || posting}
                                  sx={{
                                    height: 34, borderRadius: '8px', textTransform: 'none', fontWeight: 700,
                                    color: '#fff', background: `linear-gradient(135deg, ${BRAND.green} 0%, #16a34a 100%)`,
                                    boxShadow: '0 3px 10px rgba(37,58,154,0.4)',
                                    fontSize: { xs: '0.72rem', sm: isKannada ? '0.68rem' : '0.8rem' },
                                    '&:hover': { background: `linear-gradient(135deg, #16a34a 0%, ${BRAND.green} 100%)`, boxShadow: '0 5px 16px rgba(37,58,154,0.6)' },
                                    '&.Mui-disabled': { background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.12)', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(17,24,39,0.38)', boxShadow: 'none' },
                                  }}
                                  onClick={!finalDisabled ? async (e) => {
                                    // Release focus before the thank-you dialog opens, otherwise
                                    // the dialog sets aria-hidden on #root while this button is
                                    // still focused (accessibility warning).
                                    (e.currentTarget as HTMLElement).blur();
                                    try {
                                      setPosting(true);
                                      // Send only aspirantId as requested by API
                                      await apiClient.post('/vote', { aspirantId: candidate.id });
                                      setHasVoted(true);
                                      const cId = isGramPanchayat && selectedGpVillage ? Number(selectedGpVillage.id) : selectedConstituency?.id;
                                      if (selectedElectionId && cId) void loadAspirants(Number(selectedElectionId), cId);
                                      setVotedForName(candidate.name || null);
                                      setVoteThankOpen(true);
                                    } catch (err: any) {
                                      const msg = err?.response?.data?.message || err?.message || 'Failed to submit vote';
                                      setErrorMsg(msg);
                                      setErrorOpen(true);
                                    } finally {
                                      setPosting(false);
                                    }
                                  } : undefined}
                                >
                                  {t('pages.wardCandidates.vote') || 'Polling'}
                                </Button>
                              </Box>
                            )}
                          </Box>
                        );
                      })()}
                    </Stack>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}

        {/* Register as aspirant banner below the candidate list — hide when only demo is showing (top section already has it) */}
        {candidates.some(c => !isDemoCandidate(c)) && user && user.role !== 'aspirant' && !user.aspirantId && !registrationBlocked && (
          <Box sx={{
            width: '100%', p: 3, borderRadius: '16px',
            background: panelBg,
            border: panelBorder,
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(17,24,39,0.08)',
            display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, justifyContent: 'space-between',
          }}>
            <Box>
              <Typography sx={{ color: GOLD, fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                {hasPendingRegistration
                  ? (t('pages.wardCandidates.registrationPendingTitle') || 'Your registration is pending.')
                  : (t('pages.wardCandidates.aspirantRegistrationTitle') || 'Want to represent your ward?')}
              </Typography>
              <Typography sx={{ color: textFaint, fontSize: '0.82rem', lineHeight: 1.55 }}>
                {hasPendingRegistration
                  ? (t('pages.wardCandidates.registrationPendingDescription') || 'Complete document uploads to proceed with your application.')
                  : (t('pages.wardCandidates.aspirantRegistrationDescription') || 'Register as an aspirant to connect with voters')}
              </Typography>
            </Box>
            {(
              <Button
                variant="contained"
                onClick={() => hasPendingRegistration ? handleNavigateToRegistration() : navigate(registerPath)}
                disabled={registrationBlocked}
                sx={{
                  flexShrink: 0, fontWeight: 700, borderRadius: '8px', textTransform: 'none', whiteSpace: 'nowrap',
                  alignSelf: { xs: 'stretch', sm: 'auto' },
                  color: '#fff', background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.red2} 100%)`,
                  boxShadow: '0 4px 18px rgba(200,24,10,0.4)',
                  '&:hover': { background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.red} 100%)` }
                }}
              >
                {hasPendingRegistration ? (t('pages.wardCandidates.continueRegistration') || 'Continue Registration') : (t('pages.wardCandidates.register') || 'Register as Aspirant')}
              </Button>
            )}
          </Box>
        )}

        {/* ── Voting Eligibility Dialog ── */}
        <Dialog
          open={eligibilityDialogOpen}
          onClose={() => setEligibilityDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: {
            sx: {
              background: dialogBg,
              border: `1px solid rgba(245,168,0,0.18)`,
              borderRadius: '20px',
              boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.85)' : '0 24px 80px rgba(17,24,39,0.18)',
              overflow: 'hidden',
            },
          } }}
        >
          <Box sx={{ height: 4, background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red2} 180deg 270deg, ${BRAND.yellow2} 270deg 360deg)` }} />
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HowToVoteIcon sx={{ color: GOLD, fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: textPrimary, fontFamily: '"Baloo 2", cursive' }}>
                {t('pages.wardCandidates.votingWindowTitle') || 'Voting Eligibility'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setEligibilityDialogOpen(false)}>
              <CloseIcon sx={{ fontSize: 18, color: textSecondary }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 3, pb: 3, pt: 0 }}>
            {(() => {
              const isEligible = !!((user as any)?.isChat || (user as any)?.isMeeting || (user as any)?.isPhoneCall);
              return (
                <>
                  {isEligible && !votingWindowActive ? (
                    <Box sx={{ p: '12px 14px', mb: 2, borderRadius: '10px', background: isDark ? 'rgba(245,168,0,0.07)' : 'rgba(245,168,0,0.1)', border: '1px solid rgba(245,168,0,0.28)' }}>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: GOLD, mb: 0.4 }}>
                         {t('pages.wardCandidates.votingEligibilityEnabled')}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: textSecondary, lineHeight: 1.55 }}>
                       {t('pages.wardCandidates.votingEligibilityDescription')}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '0.85rem', color: textSecondary, mb: 2, lineHeight: 1.6 }}>
                      {t('pages.wardCandidates.votingEligibility')}
                    </Typography>
                  )}
                  <Stack spacing={1.2}>
                    {[
                      { label: t('pages.wardCandidates.chat') || 'Chatted with an aspirant', met: !!((user as any)?.isChat) },
                      { label: t('pages.wardCandidates.videoMeetTitle') || 'Video meeting with an aspirant', met: !!((user as any)?.isMeeting) },
                      { label: t('pages.wardCandidates.phoneCall') || 'Phone call with an aspirant', met: !!((user as any)?.isPhoneCall) },
                    ].map(({ label, met }) => (
                      <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: '8px 12px', borderRadius: '8px', background: met ? (isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.1)') : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(17,24,39,0.04)'), border: `1px solid ${met ? 'rgba(34,197,94,0.25)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.1)')}` }}>
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, bgcolor: met ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.14)') }}>
                          <Typography sx={{ fontSize: '0.7rem', color: met ? '#fff' : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(17,24,39,0.4)'), fontWeight: 700 }}>{met ? '✓' : '✗'}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.82rem', color: met ? (isDark ? '#86efac' : '#15803d') : textSecondary, fontWeight: met ? 600 : 400 }}>{label}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </>
              );
            })()}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setEligibilityDialogOpen(false)}
              sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none', color: '#fff', background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.red2} 100%)`, boxShadow: '0 4px 14px rgba(200,24,10,0.35)', '&:hover': { background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.red} 100%)` } }}
            >
              {t('common.ok') || 'OK'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Thank-you dialog after voting */}
        <Dialog
          open={voteThankOpen}
          onClose={() => setVoteThankOpen(false)}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: {
            sx: {
              borderRadius: 4,
              overflow: 'visible',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #1e1e2e 0%, #2a2a3e 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8f8ff 100%)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            }
          } }}
        >
          {/* Thumb icon floating above dialog */}
          <Box sx={{
            position: 'absolute',
            top: -36,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${BRAND.green} 0%, #16a34a 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px rgba(34,197,94,0.45)`,
            zIndex: 10,
            border: '4px solid',
            borderColor: theme.palette.mode === 'dark' ? '#1e1e2e' : '#ffffff',
          }}>
            <Box component="img" src="/images/vote.png" alt="vote" sx={{ width: 48, height: 48, objectFit: 'contain' }} />
          </Box>

          <DialogContent sx={{ pt: 6, pb: 2, px: 3, textAlign: 'center' }}>
            {/* Decorative top bar */}
            <Box sx={{
              width: 48,
              height: 4,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.yellow})`,
              mx: 'auto',
              mb: 2.5,
            }} />

            <Typography sx={{
              fontWeight: 700,
              fontSize: '1.05rem',
              lineHeight: 1.55,
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.92)' : 'rgba(17,24,39,0.88)',
              mb: 2.5,
            }}>
              {t('pages.voting.successTitle', { defaultValue: 'Thank you for being responsible citizens and participating in the voting process.' })}
            </Typography>

            {votedForName && (
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1,
                borderRadius: 50,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(34,197,94,0.08)'
                  : 'rgba(34,197,94,0.08)',
                border: `1.5px solid`,
                borderColor: 'rgba(34,197,94,0.35)',
              }}>
                <HowToVoteIcon sx={{ fontSize: 18, color: BRAND.green }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.97rem', color: '#16a34a' }}>
                  {`${t('pages.voting.votedForLabel', { defaultValue: 'Voted For:' })} ${votedForName}`}
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 1 }}>
            <Button
              onClick={() => setVoteThankOpen(false)}
              variant="contained"
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1,
                borderRadius: 50,
                background: `linear-gradient(135deg, ${BRAND.green} 0%, #16a34a 100%)`,
                boxShadow: '0 4px 14px rgba(16,185,129,0.18)',
                color: '#fff',
                '&:hover': { background: `linear-gradient(135deg, #16a34a 0%, ${BRAND.green} 100%)` },
              }}
            >
              {t('pages.voting.close') || 'Close'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={chatOpen} onClose={() => setChatOpen(false)} fullWidth maxWidth="md">
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {activeAspirant?.name || 'Interview'}
            <IconButton onClick={() => setChatOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} sx={{
                alignItems: "center"
              }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ForumIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{activeAspirant?.name}</Typography>
                  <Typography variant="body2" sx={{
                    color: "text.secondary"
                  }}>Interview room</Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack spacing={2} sx={{ maxHeight: 520, overflowY: 'auto', pr: 1 }}>
                {chatLoading && <Typography variant="body2">Loading messages...</Typography>}
                {chatMessages.map((m) => {
                  const isMe = m.userId === user?.id;
                  return (
                    <Stack
                      key={m.id}
                      direction="row"
                      spacing={2}
                      sx={{
                        alignItems: "flex-start",
                        justifyContent: isMe ? 'flex-end' : 'flex-start'
                      }}>
                      {!isMe && (
                        <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main' }}>{(m.user?.name || 'U').charAt(0)}</Avatar>
                      )}
                      <Box
                        sx={{
                          bgcolor: isMe ? 'primary.main' : 'grey.100',
                          color: isMe ? '#fff' : 'text.primary',
                          px: 2.5,
                          py: 1.75,
                          borderRadius: 2,
                          maxWidth: '75%'
                        }}
                      >
                        {!isMe && (
                          <Stack direction="row" spacing={1} sx={{
                            alignItems: "center"
                          }}>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
                              {m.user?.name}
                            </Typography>
                            {m.user?.role === 'aspirant' && (
                              <Chip size="small" label="Aspirant" sx={{ bgcolor: '#FFF7ED', color: '#F97316', fontWeight: 600, fontSize: '0.6rem', height: 20, borderRadius: 6 }} />
                            )}
                          </Stack>
                        )}
                        <Typography variant="body2">{m.content}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                          {new Date(m.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })}
                <div ref={messagesEndRef} />
              </Stack>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 2, py: 2 }}>
            <TextField
              fullWidth
              placeholder={t('pages.wardCandidates.chatPlaceholder') || 'Write a question...'}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!chatText.trim() || !activeAspirant) return;
                  setPosting(true);
                  try {
                    const resp = await postUserChatMessage(activeAspirant.id, { content: chatText.trim() });
                    const m = resp.data as AspirantChatMessageDto;
                    setChatMessages((prev) => [...prev, m]);
                    setChatText('');
                    setSuccessOpen(true);
                    try { void trackInteraction(activeAspirant.id); } catch (_) { /* noop */ }
                  } catch (err: any) {
                    setErrorMsg(err?.response?.data?.message || 'Failed to send message');
                    setErrorOpen(true);
                  } finally {
                    setPosting(false);
                  }
                }
              }}
              slotProps={{
                htmlInput: {
                  autoCorrect: 'off',
                  autoCapitalize: 'off',
                  spellCheck: false,
                  autoComplete: 'off'
                }
              }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={async () => {
                if (!chatText.trim() || !activeAspirant) return;
                setPosting(true);
                try {
                  const resp = await postUserChatMessage(activeAspirant.id, { content: chatText.trim() });
                  const m = resp.data as AspirantChatMessageDto;
                  setChatMessages((prev) => [...prev, m]);
                  setChatText('');
                  setSuccessOpen(true);
                  try { void trackInteraction(activeAspirant.id); } catch (_) { /* noop */ }
                } catch (err: any) {
                  setErrorMsg(err?.response?.data?.message || 'Failed to send message');
                  setErrorOpen(true);
                } finally {
                  setPosting(false);
                }
              }}
              disabled={posting}
            >
              {t('discussion.send') || 'Send'}
            </Button>
          </DialogActions>

          <Snackbar open={successOpen} autoHideDuration={2500} onClose={() => setSuccessOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert severity="success" onClose={() => setSuccessOpen(false)}>Message posted</Alert>
          </Snackbar>
          <Snackbar open={errorOpen} autoHideDuration={3500} onClose={() => setErrorOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert severity="error" onClose={() => setErrorOpen(false)}>{errorMsg}</Alert>
          </Snackbar>
        </Dialog>

        {/* Post-Registration Role Choice Popup */}
        <Dialog
          open={aspirantPopupOpen}
          onClose={() => setAspirantPopupOpen(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{ paper: {
            sx: {
              background: dialogBg,
              border: `1px solid rgba(245,168,0,0.18)`,
              borderRadius: '20px',
              boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.85)' : '0 24px 80px rgba(17,24,39,0.18)',
              overflow: 'hidden',
            },
          } }}
        >
          {/* Conic accent bar */}
          <Box sx={{ height: 4, background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red2} 180deg 270deg, ${BRAND.yellow2} 270deg 360deg)` }} />

          <DialogContent sx={{ px: 3, pt: 3, pb: 3 }}>
            <Stack spacing={2.5}>
              {/* Option 1: Public Servant */}
              <Box sx={{
                p: '16px', borderRadius: '14px',
                background: insetBg,
                border: insetBorder,
                textAlign: 'center',
              }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: textPrimary, mb: 0.5, lineHeight: 1.5 }}>
                  {t('postRegistration.publicServantQuestion', { defaultValue: 'Are you willing to become a Public Servant?' })}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: textSecondary, mb: 1.5, lineHeight: 1.5 }}>
                  {t('postRegistration.publicServantDesc', { defaultValue: 'Connect with voters, share your vision, and participate in ward discussions.' })}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setAspirantPopupOpen(false);
                    handleNavigateToRegistration();
                  }}
                  sx={{
                    py: 1.1, borderRadius: '8px', fontWeight: 700, textTransform: 'none', fontSize: '0.95rem', color: '#fff',
                    background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.red2} 100%)`,
                    boxShadow: '0 4px 18px rgba(200,24,10,0.45)',
                    '&:hover': { background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.red} 100%)`, boxShadow: '0 6px 24px rgba(200,24,10,0.6)' },
                  }}
                >
                  {t('common.yes', { defaultValue: 'Yes' })}
                </Button>
              </Box>

              {/* Option 2: Responsible Voter */}
              <Box sx={{
                p: '16px', borderRadius: '14px',
                background: insetBg,
                border: insetBorder,
                textAlign: 'center',
              }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: textPrimary, mb: 0.5, lineHeight: 1.5 }}>
                  {t('postRegistration.responsibleVoterQuestion', { defaultValue: 'I will stay as a Responsible Voter' })}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: textSecondary, mb: 1.5, lineHeight: 1.5 }}>
                  {t('postRegistration.responsibleVoterDesc', { defaultValue: 'Continue as a voter and support the candidates in your ward.' })}
                </Typography>
                <Button
                  fullWidth
                  onClick={() => setAspirantPopupOpen(false)}
                  sx={{
                    py: 1.1, borderRadius: '8px', fontWeight: 600, textTransform: 'none', fontSize: '0.95rem',
                    border: `1px solid ${outlinedBtnBorder}`, color: outlinedBtnColor,
                    '&:hover': { borderColor: outlinedBtnHoverBorder, bgcolor: outlinedBtnHoverBg, color: textPrimary },
                  }}
                >
                  {t('common.yes', { defaultValue: 'Yes' })}
                </Button>
              </Box>
            </Stack>
          </DialogContent>
        </Dialog>

        {/* ── Post-registration Celebration Overlay ──────────────────── */}
        {/* Intentionally dark-themed: full-screen immersive celebration */}
        <Portal>
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.6 } }}
                style={{
                  position: 'fixed', inset: 0, zIndex: 9999,
                  background: 'radial-gradient(ellipse at 50% 15%, #2a1008 0%, #13161A 55%, #0d0505 100%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', overflow: 'hidden', padding: '24px',
                }}
              >
                {/* Confetti */}
                {confettiItems.map((p) => (
                  <motion.div
                    key={p.id}
                    style={{
                      position: 'absolute', top: -28, left: `${p.x}%`,
                      width: p.size, height: p.size,
                      borderRadius: p.round ? '50%' : 3,
                      backgroundColor: p.color, pointerEvents: 'none',
                    }}
                    animate={{ y: '115vh', rotate: [0, 480 + p.id * 9], opacity: [1, 0.85, 0.3, 0] }}
                    transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn', repeat: Infinity, repeatDelay: 0.8 }}
                  />
                ))}

                {/* Background glow pulse */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.22, 0.1] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', width: 600, height: 600, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(200,24,10,0.5) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Content card */}
                <motion.div
                  initial={{ scale: 0.84, opacity: 0, y: 48 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  style={{ width: '100%', maxWidth: 580, zIndex: 1, textAlign: 'center' }}
                >
                  {/* Rotating conic ring + fist emoji */}
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
                      style={{
                        width: 110, height: 110, borderRadius: '50%',
                        background: 'conic-gradient(#C8180A 0deg, #F5A800 90deg, #22c55e 180deg, #3b82f6 270deg, #C8180A 360deg)',
                        padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', bgcolor: '#0D0F12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.3 }}
                          style={{ fontSize: 56, lineHeight: 1 }}
                        >
                          ✊
                        </motion.div>
                      </Box>
                    </motion.div>
                  </Box>

                  {/* Welcome heading */}
                  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
                    <Typography sx={{ fontFamily: '"Baloo 2", cursive', fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.85rem' }, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>
                      {t('pages.pledge.welcome', { defaultValue: 'Welcome,' })}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Baloo 2", cursive', fontWeight: 900, fontSize: { xs: '2rem', sm: '2.7rem' }, color: '#fff', lineHeight: 1.05, mb: 2 }}>
                      {(user as any)?.name || 'Citizen'}
                    </Typography>
                    <Box sx={{ width: 88, height: 3, mx: 'auto', mb: 3, borderRadius: 99, background: 'linear-gradient(90deg, #C8180A, #F5A800, #FFCB00, #F5A800, #C8180A)', boxShadow: '0 0 18px rgba(245,168,0,0.7)' }} />
                  </motion.div>

                  {/* Para 4 — word-by-word blur reveal */}
                  <Box sx={{ px: { xs: 1.5, sm: 3 }, py: 2.5, mb: 2, borderRadius: '18px', background: 'rgba(245,168,0,0.07)', border: '1px solid rgba(245,168,0,0.22)', backdropFilter: 'blur(10px)' }}>
                    <Typography component="div" sx={{ fontFamily: '"Baloo 2", cursive', fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.22rem' }, lineHeight: 1.65, color: '#F5A800' }}>
                      {t('pages.login.oath.para4')
                        .split(' ').map((word, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.45, delay: 0.7 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            style={{ display: 'inline-block', marginRight: '0.3em' }}
                          >
                            {word}
                          </motion.span>
                        ))}
                    </Typography>
                  </Box>

                  {/* Para 5 — word-by-word blur reveal */}
                  <Box sx={{ px: { xs: 1.5, sm: 3 }, py: 2.5, mb: 3.5, borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <Typography component="div" sx={{ fontFamily: '"Baloo 2", cursive', fontWeight: 700, fontSize: { xs: '0.92rem', sm: '1.05rem' }, lineHeight: 1.75, color: 'rgba(255,255,255,0.88)' }}>
                      {t('pages.login.oath.para5')
                        .split(' ').map((word, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.45, delay: 1.55 + i * 0.065, ease: [0.22, 1, 0.36, 1] }}
                            style={{ display: 'inline-block', marginRight: '0.3em' }}
                          >
                            {word}
                          </motion.span>
                        ))}
                    </Typography>
                  </Box>

                  {/* Continue button */}
                  <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 1.5 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => {
                        setShowCelebration(false);
                        if (user && (user.role !== 'aspirant' || aspirantStatus === 'pending')) {
                          setTimeout(() => setAspirantPopupOpen(true), 400);
                        }
                      }}
                      sx={{
                        px: 5, py: 1.5, borderRadius: 3, fontWeight: 800,
                        fontFamily: '"Baloo 2", cursive', fontSize: '1.05rem',
                        textTransform: 'none', color: '#fff',
                        background: 'linear-gradient(135deg, #C8180A 0%, #E02010 100%)',
                        boxShadow: '0 6px 30px rgba(200,24,10,0.55)',
                        '&:hover': { background: 'linear-gradient(135deg, #E02010 0%, #C8180A 100%)', boxShadow: '0 8px 38px rgba(200,24,10,0.7)', transform: 'translateY(-2px)' },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {t('pages.celebration.continue', { defaultValue: 'Continue →' })}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Portal>
      </Stack>
      {/* Aspirant prompt — shown when arriving from welcome/celebration flow */}
      <Portal>
        <AnimatePresence>
          {showAspirantPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 1500,
                background: 'rgba(10,8,8,0.88)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 32 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 16 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 22 }}
                style={{
                  background: isDark ? 'linear-gradient(160deg, #1C1010 0%, #130A0A 100%)' : '#FFFFFF',
                  border: '1px solid rgba(245,168,0,0.18)',
                  borderRadius: '20px',
                  padding: '28px 24px 24px',
                  maxWidth: '420px',
                  width: '100%',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,24,10,0.08)',
                }}
              >
                <Stack spacing={2}>
                  {/* Option 1: Public Servant */}
                  <Box sx={{
                    p: '16px', borderRadius: '14px',
                    background: insetBg,
                    border: insetBorder,
                    textAlign: 'center',
                  }}>
                    <Typography sx={{
                      fontFamily: "'Baloo 2', sans-serif", fontWeight: 800,
                      color: textPrimary, mb: 1.5, lineHeight: 1.4,
                      fontSize: { xs: '1rem', sm: '1.05rem' },
                    }}>
                      {t('postRegistration.publicServantQuestion')}
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => {
                        setShowAspirantPrompt(false);
                        navigate(registerPath);
                      }}
                      sx={{
                        py: 1.2, px: 4, borderRadius: 3, fontWeight: 700, fontSize: '1rem',
                        fontFamily: "'Baloo 2', sans-serif", textTransform: 'none', color: '#fff',
                        background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                        boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
                        '&:hover': { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', boxShadow: '0 6px 28px rgba(34,197,94,0.55)' },
                      }}
                    >
                      {t('common.proceed', { defaultValue: 'Proceed' })}
                    </Button>
                  </Box>

                  {/* Option 2: Responsible Voter */}
                  <Box sx={{
                    p: '16px', borderRadius: '14px',
                    background: insetBg,
                    border: insetBorder,
                    textAlign: 'center',
                  }}>
                    <Typography sx={{
                      fontFamily: "'Baloo 2', sans-serif", fontWeight: 800,
                      color: textPrimary, mb: 1.5, lineHeight: 1.4,
                      fontSize: { xs: '1rem', sm: '1.05rem' },
                    }}>
                      {t('postRegistration.responsibleVoterQuestion')}
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setShowAspirantPrompt(false)}
                      sx={{
                        py: 1.2, px: 4, borderRadius: 3, fontWeight: 700, fontSize: '1rem',
                        fontFamily: "'Baloo 2', sans-serif", textTransform: 'none', color: '#fff',
                        background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.red2} 100%)`,
                        boxShadow: '0 4px 20px rgba(200,24,10,0.45)',
                        '&:hover': { background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.red} 100%)`, boxShadow: '0 6px 28px rgba(200,24,10,0.6)' },
                      }}
                    >
                      {t('common.proceed', { defaultValue: 'Proceed' })}
                    </Button>
                  </Box>
                </Stack>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
      {/* Scroll-to-top FAB — raised on mobile so it clears the bottom nav */}
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 'calc(82px + env(safe-area-inset-bottom))', sm: 28 },
          right: 20,
          zIndex: 1200,
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.85)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: showScrollTop ? 'auto' : 'none',
        }}
      >
        <Fab
          size="medium"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="scroll to top"
          sx={{
            background: 'linear-gradient(135deg, #f87444 0%, #fbbf24 100%)',
            color: '#fff',
            boxShadow: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #fbbf24 0%, #f87444 100%)',
              boxShadow: 'none',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Box>
      {/* Demo aspirant SOP popup */}
      <SopAgreementCard
        sopAgreed
        hidePill
        name="Prajaakeeya Demo Aspirant"
        sopAgreedAt={new Date().toISOString()}
        open={demoSopOpen}
        onClose={() => setDemoSopOpen(false)}
        isKannada={(i18n.language || '').startsWith('kn')}
      />
      {/* Real aspirant SOP popup — opens the signed-agreement card inline so
          users stay on the candidate list instead of navigating to a viewer. */}
      <SopAgreementCard
        sopAgreed
        hidePill
        name={sopCandidate?.name ?? ''}
        sopAgreedAt={(sopCandidate as any)?.sopAgreedAt}
        open={Boolean(sopCandidate)}
        onClose={() => setSopCandidate(null)}
        isKannada={(i18n.language || '').startsWith('kn')}
      />
    </>
  );
};

export default WardCandidateListPage;
