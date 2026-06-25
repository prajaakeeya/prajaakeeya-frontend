import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  ReportProblem as ReportProblemIcon,
  PanTool as HandRaiseIcon,
  CheckCircle as CheckCircleIcon,
  Security as ShieldIcon,
  Park as ParkIcon,
  Favorite as FavoriteIcon,
  Build as BuildIcon,
  FlashOn as FlashOnIcon,
  Apartment as BuildingIcon,
  AccountBalance as BridgeIcon,
  Gavel as MLAIcon,
  LocationOn as WardPinIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
// Reuse BridgeIcon (AccountBalance) for the MP tab — same Parliament-pillar glyph.
const MPIcon = BridgeIcon;
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import {
  getIssuesByElectionAndConstituency,
  raiseHandForCategoryByElectionConstituency,
  IssueCategory,
  CivicIssue,
} from '../services/civicIssuesService';
import {
  fetchElections, fetchConstituencies, fetchMunicipalities, fetchConstituenciesByScope,
  fetchGPStates, fetchGPDistricts, fetchGPTaluks, fetchGPGrams, fetchGPVillages,
  type Election, type Constituency, type GPVillage,
} from '../services/electionService';
import { BRAND } from '../theme';
import roadMapImg from '../assets/images/road-map.webp';
import architectImg from '../assets/images/architect.webp';
import wasteImg from '../assets/images/waste.webp';
import waterTapImg from '../assets/images/water-tap.webp';
import garbageImg from '../assets/images/garbage.webp';
import streetLightImg from '../assets/images/street-light.webp';
import savePlanetImg from '../assets/images/save-the-planet.webp';
import capitolInactiveImg from '../assets/images/capitol.png';
import capitolActiveImg from '../assets/images/capitol1.webp';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";

const CivicIssuesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t, i18n } = useTranslation();
  const isKannada = (i18n.language || '').startsWith('kn');
  const { user } = useAuthStore();

  // Get filters from location state (passed from WardCandidateListPage)
  const filterElectionId = (location.state as any)?.electionId ?? null;
  const filterElectionName = (location.state as any)?.electionName ?? null;
  const filterConstituencyId = (location.state as any)?.constituencyId ?? null;
  const filterConstituencyName = (location.state as any)?.constituencyName ?? null;

  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [totalHandRaises, setTotalHandRaises] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Elections and constituencies state
  const [elections, setElections] = useState<Election[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [loadingConstituencies, setLoadingConstituencies] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState<number | ''>('');
  const [selectedElectionType, setSelectedElectionType] = useState<string>('');
  const [selectedConstituency, setSelectedConstituency] = useState<Constituency | null>(null);

  // Municipalities state (for municipal_corporation elections)
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string; state: string }[]>([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<{ id: number; name: string; state: string } | null>(null);

  // Gram Panchayat state
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

  const resetGpState = () => {
    setGpStates([]); setGpDistricts([]); setGpTaluks([]); setGpGrams([]); setGpVillages([]);
    setSelectedGpState(null); setSelectedGpDistrict(null); setSelectedGpTaluk(null);
    setSelectedGpGram(null); setSelectedGpVillage(null);
  };

  const isGramPanchayat = selectedElectionType === 'gram_panchayat';

  // Map election type → the user's saved constituency ID on /auth/me.
  const userConstituencyIdForType = (type?: string): number | null => {
    if (!type || !user) return null;
    switch (type) {
      case 'lok_sabha':
        return (user as any).lokSabhaConstituency?.id ?? null;
      case 'state_assembly':
        return (user as any).stateAssemblyConstituency?.id ?? null;
      case 'municipal_corporation':
        return (user as any).municipalCorporationConstituency?.id ?? null;
      case 'gram_panchayat':
        return (user as any).gramPanchayatConstituency?.srNo ?? null;
      default:
        return null;
    }
  };

  // Only election types where the user has a saved constituency are offered —
  // e.g. a user with `gramPanchayatConstituencyId: null` won't see Gram
  // Panchayat in the Election Type dropdown.
  const availableElections = elections.filter(
    (el) => userConstituencyIdForType(el.type) != null,
  );

  // The Civic Issues page is structured as 3 tabs:
  //   • mp             → Lok Sabha
  //   • mla            → State Assembly
  //   • ward_panchayat → Municipal Corporation (urban) OR Gram Panchayat
  //                       (rural) — whichever the user has saved.
  type CivicTab = 'mp' | 'mla' | 'ward_panchayat';
  const tabToElectionType = (tab: CivicTab): string | null => {
    if (tab === 'mp') return 'lok_sabha';
    if (tab === 'mla') return 'state_assembly';
    if ((user as any)?.municipalCorporationConstituency?.id != null) return 'municipal_corporation';
    if ((user as any)?.gramPanchayatConstituency != null) return 'gram_panchayat';
    return null;
  };
  const [activeTab, setActiveTab] = useState<CivicTab>('mp');
  // The page can arrive with a deep-link election filter (from the aspirants
  // list "Public Issue" button). That filter must only drive the tab it points
  // to — once the user manually switches tabs, it should be ignored so each tab
  // shows (and reports against) its own election. This flag flips on the first
  // manual tab change; the deep-link's own auto-selection does NOT set it.
  const [userSwitchedTab, setUserSwitchedTab] = useState(false);
  const useDeepLinkFilter = Boolean(filterElectionId && filterConstituencyId && !userSwitchedTab);

  const [raisingCat, setRaisingCat] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' | 'info' }>({ open: false, msg: '', severity: 'success' });

  // Colours
  const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;
  const BG = theme.palette.background.paper;
  const borderFaint = isDark ? 'rgba(245,168,0,0.18)' : 'rgba(245,168,0,0.28)';
  const textPrimary = theme.palette.text.primary;
  const textMid = isDark ? 'rgba(255,255,255,0.64)' : 'rgba(17,24,39,0.65)';
  const textDim = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(17,24,39,0.46)';

  // If the user arrived via the "Public Issue" button on the aspirants list,
  // location.state carries filterElectionId. Map that election type back to
  // the matching tab so the right one is highlighted and the right value
  // cards render — without the user having to re-click.
  useEffect(() => {
    if (!filterElectionId || !elections.length) return;
    const election = elections.find((e) => e.id === filterElectionId);
    if (!election) return;
    if (election.type === 'lok_sabha') setActiveTab('mp');
    else if (election.type === 'state_assembly') setActiveTab('mla');
    else if (
      election.type === 'municipal_corporation' ||
      election.type === 'gram_panchayat'
    ) setActiveTab('ward_panchayat');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterElectionId, elections]);

  // Map active tab → election (id + type). Re-fires whenever the tab or the
  // user's saved IDs change so the right election context drives fetchData.
  useEffect(() => {
    const wantedType = tabToElectionType(activeTab);
    if (!wantedType) {
      setSelectedElectionType('');
      setSelectedElectionId('');
      return;
    }
    const matched = elections.find((e) => e.type === wantedType);
    setSelectedElectionType(wantedType);
    setSelectedElectionId(matched ? matched.id : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, elections, user]);

  // Params of the issues request currently in flight, to dedupe identical calls.
  const inFlightIssuesRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    // Resolve the election + constituency we'd fetch for. Deep-link filter from
    // WardCandidateListPage wins; otherwise pair the picked election with the
    // user's saved constituency for that type.
    let eId: number | null = null;
    let cId: number | null = null;
    if (useDeepLinkFilter) {
      eId = Number(filterElectionId);
      cId = Number(filterConstituencyId);
    } else {
      const userConstId = userConstituencyIdForType(selectedElectionType);
      if (selectedElectionId && userConstId != null) {
        eId = Number(selectedElectionId);
        cId = userConstId;
      }
    }

    // Nothing picked yet.
    if (eId == null || cId == null) {
      setCategories([]);
      setIssues([]);
      setTotalHandRaises(null);
      return;
    }

    // Collapse duplicate concurrent requests for the identical params (the same
    // issues call fires more than once while selection state settles on mount).
    // The in-flight request still applies its result — no result is dropped.
    const key = `${eId}:${cId}:${user?.id ?? ''}`;
    if (inFlightIssuesRef.current === key) return;
    inFlightIssuesRef.current = key;
    try {
      setLoading(true);
      setFetchError('');
      const data = await getIssuesByElectionAndConstituency(eId, cId, user?.id);
      setCategories(data.categories);
      setIssues(data.issues);
      setTotalHandRaises(data.totalHandRaises ?? null);
    } catch (err: any) {
      setFetchError(err?.response?.data?.message || err?.message || t('civicIssues.failedToLoad'));
    } finally {
      setLoading(false);
      inFlightIssuesRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useDeepLinkFilter, filterElectionId, filterConstituencyId, selectedElectionId, selectedElectionType, user, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch elections on mount
  useEffect(() => {
    let mounted = true;
    fetchElections()
      .then((resp) => {
        if (!mounted) return;
        const data = Array.isArray(resp.data) ? resp.data : [];
        setElections(data);
        // If filters from WardCandidateListPage, pre-select election
        if (filterElectionId) {
          const matching = data.find((e) => e.id === filterElectionId);
          if (matching) {
            setSelectedElectionId(matching.id);
            setSelectedElectionType(matching.type);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch elections:', err));
    return () => { mounted = false; };
  }, [filterElectionId]);

  // Fetch constituencies when election type changes
  useEffect(() => {
    if (!selectedElectionType) {
      setConstituencies([]);
      setSelectedConstituency(null);
      resetGpState();
      return;
    }

    // gram panchayat flow: fetch GP states instead of constituencies
    if (selectedElectionType === 'gram_panchayat') {
      setConstituencies([]); setSelectedConstituency(null);
      setMunicipalities([]); setSelectedMunicipality(null);
      resetGpState();
      setLoadingGpStates(true);
      fetchGPStates()
        .then((resp) => {
          const data = Array.isArray(resp.data) ? resp.data : [];
          setGpStates(data);
        })
        .catch((err) => console.error('Failed to fetch GP states:', err))
        .finally(() => setLoadingGpStates(false));
      return;
    }

    // Reset GP state for non-GP elections
    resetGpState();

    const selected = elections.find((e) => e.type === selectedElectionType);
    if (!selected) return;

    setLoadingConstituencies(true);
    setConstituencies([]);
    fetchConstituencies(selected.type)
      .then((resp) => {
        const data = resp.data?.constituencies ?? [];
        setConstituencies(data);
        // If filters from WardCandidateListPage, pre-select constituency.
        // Only apply the deep-link filter to the election it was meant for —
        // constituency IDs are NOT unique across election types, so matching a
        // Lok Sabha `filterConstituencyId` against the State Assembly list (or
        // vice-versa) would resolve to the wrong constituency. The per-tab
        // profile effect supplies the correct value for the other tabs.
        if (filterConstituencyId && filterElectionId === selected.id) {
          const matching = data.find((c) => c.id === filterConstituencyId);
          if (matching) {
            setSelectedConstituency(matching);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch constituencies:', err))
      .finally(() => setLoadingConstituencies(false));
  }, [selectedElectionType, filterConstituencyId, filterElectionId, elections]);

  // Fetch municipalities when election type is municipal_corporation
  useEffect(() => {
    if (selectedElectionType !== 'municipal_corporation') {
      setMunicipalities([]);
      setSelectedMunicipality(null);
      return;
    }
    setLoadingMunicipalities(true);
    fetchMunicipalities('Karnataka')
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setMunicipalities(data);
      })
      .catch((err) => console.error('Failed to fetch municipalities:', err))
      .finally(() => setLoadingMunicipalities(false));
  }, [selectedElectionType]);

  // Fetch constituencies when municipality is selected (for municipal_corporation)
  useEffect(() => {
    if (!selectedMunicipality) {
      setConstituencies([]);
      setSelectedConstituency(null);
      return;
    }
    setLoadingConstituencies(true);
    fetchConstituenciesByScope(selectedMunicipality.name)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setConstituencies(data);
      })
      .catch((err) => console.error('Failed to fetch constituencies by scope:', err))
      .finally(() => setLoadingConstituencies(false));
  }, [selectedMunicipality]);

  // ── Gram Panchayat cascading fetches ──
  useEffect(() => {
    if (!selectedGpState) {
      setGpDistricts([]); setSelectedGpDistrict(null);
      setGpTaluks([]); setSelectedGpTaluk(null);
      setGpGrams([]); setSelectedGpGram(null);
      setGpVillages([]); setSelectedGpVillage(null);
      return;
    }
    setLoadingGpDistricts(true);
    setGpDistricts([]); setSelectedGpDistrict(null);
    setGpTaluks([]); setSelectedGpTaluk(null);
    setGpGrams([]); setSelectedGpGram(null);
    setGpVillages([]); setSelectedGpVillage(null);
    fetchGPDistricts(selectedGpState)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setGpDistricts(data);
      })
      .catch((err) => console.error('Failed to fetch GP districts:', err))
      .finally(() => setLoadingGpDistricts(false));
  }, [selectedGpState]);

  useEffect(() => {
    if (!selectedGpState || !selectedGpDistrict) {
      setGpTaluks([]); setSelectedGpTaluk(null);
      setGpGrams([]); setSelectedGpGram(null);
      setGpVillages([]); setSelectedGpVillage(null);
      return;
    }
    setLoadingGpTaluks(true);
    setGpTaluks([]); setSelectedGpTaluk(null);
    setGpGrams([]); setSelectedGpGram(null);
    setGpVillages([]); setSelectedGpVillage(null);
    fetchGPTaluks(selectedGpState, selectedGpDistrict)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setGpTaluks(data);
      })
      .catch((err) => console.error('Failed to fetch GP taluks:', err))
      .finally(() => setLoadingGpTaluks(false));
  }, [selectedGpState, selectedGpDistrict]);

  useEffect(() => {
    if (!selectedGpState || !selectedGpDistrict || !selectedGpTaluk) {
      setGpGrams([]); setSelectedGpGram(null);
      setGpVillages([]); setSelectedGpVillage(null);
      return;
    }
    setLoadingGpGrams(true);
    setGpGrams([]); setSelectedGpGram(null);
    setGpVillages([]); setSelectedGpVillage(null);
    fetchGPGrams(selectedGpState, selectedGpDistrict, selectedGpTaluk)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setGpGrams(data);
      })
      .catch((err) => console.error('Failed to fetch GP grams:', err))
      .finally(() => setLoadingGpGrams(false));
  }, [selectedGpState, selectedGpDistrict, selectedGpTaluk]);

  useEffect(() => {
    if (!selectedGpState || !selectedGpDistrict || !selectedGpTaluk || !selectedGpGram) {
      setGpVillages([]); setSelectedGpVillage(null);
      return;
    }
    setLoadingGpVillages(true);
    setGpVillages([]); setSelectedGpVillage(null);
    fetchGPVillages(selectedGpState, selectedGpDistrict, selectedGpTaluk, selectedGpGram)
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        setGpVillages(data);
      })
      .catch((err) => console.error('Failed to fetch GP villages:', err))
      .finally(() => setLoadingGpVillages(false));
  }, [selectedGpState, selectedGpDistrict, selectedGpTaluk, selectedGpGram]);

  // Fetch issues whenever the user picks a new election type (the constituency
  // ID is now derived from /auth/me, not selected manually).
  useEffect(() => {
    if (selectedElectionId && selectedElectionType && !filterElectionId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElectionId, selectedElectionType, filterElectionId]);

  // Resolve the user's constituency name for display (chip / sub-header).
  // /auth/me now returns the full nested constituency object for each type, so
  // we can short-circuit the resolution without an extra fetch. GP nested
  // uses `srNo` + `villageName` (no id/name), so we synthesize a Constituency
  // shape from those fields.
  useEffect(() => {
    if (!selectedElectionType) {
      setSelectedConstituency(null);
      return;
    }
    const userId = userConstituencyIdForType(selectedElectionType);
    if (userId == null) {
      setSelectedConstituency(null);
      return;
    }
    const u = user as any;
    const nested =
      selectedElectionType === 'lok_sabha' ? u?.lokSabhaConstituency :
      selectedElectionType === 'state_assembly' ? u?.stateAssemblyConstituency :
      selectedElectionType === 'municipal_corporation' ? u?.municipalCorporationConstituency :
      selectedElectionType === 'gram_panchayat' ? u?.gramPanchayatConstituency :
      null;
    if (nested) {
      if (selectedElectionType === 'gram_panchayat') {
        setSelectedConstituency({
          id: nested.srNo,
          name: nested.villageName ?? '',
          state: nested.state ?? '',
        } as Constituency);
      } else {
        setSelectedConstituency(nested as Constituency);
      }
      return;
    }
    setSelectedConstituency(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElectionType, user]);

  const handleRaise = async (category: IssueCategory) => {
    const userConstId = userConstituencyIdForType(selectedElectionType);
    const hasContext = useDeepLinkFilter || (selectedElectionId && userConstId != null);
    if (!hasContext || category.isRaised) return;
    try {
      setRaisingCat(category.name);
      if (useDeepLinkFilter) {
        await raiseHandForCategoryByElectionConstituency(filterElectionId, filterConstituencyId, category.name);
      } else if (selectedElectionId && userConstId != null) {
        await raiseHandForCategoryByElectionConstituency(Number(selectedElectionId), userConstId, category.name);
      }
      // Pick display name according to current language (Kannada when active)
      const display = (i18n.language || '').toLowerCase().startsWith('kn') && (category as any).nameKn ? (category as any).nameKn : category.name;
      setSnack({ open: true, msg: t('civicIssues.reportedSuccess', { category: display }), severity: 'success' });
      // Update only the raised category in local state instead of refetching everything
      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat.name === category.name ? { ...cat, count: cat.count + 1, isRaised: true } : cat
        )
      );
      setTotalHandRaises(prev => (prev == null ? 1 : prev + 1));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('civicIssues.failedToReport');
      setSnack({ open: true, msg, severity: 'error' });
    } finally {
      setRaisingCat(null);
    }
  };

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', px: { xs: 1, sm: 0 } }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
        <Box sx={{
          bgcolor: BG,
          borderRadius: 3,
          border: `1px solid ${borderFaint}`,
          overflow: 'hidden',
          boxShadow: isDark ? '0 14px 32px rgba(0,0,0,0.32)' : '0 4px 14px rgba(17,24,39,0.06)',
          mb: 3,
        }}>
          {/* Tri-colour bar */}
          <Box sx={{ display: 'flex', height: '4px' }}>
            {[BRAND.red, BRAND.blue, BRAND.brown].map(c => (
              <Box key={c} sx={{ flex: 1, bgcolor: c }} />
            ))}
          </Box>

          <Box sx={{
            px: { xs: 2.5, sm: 4 },
            py: 3,
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Box sx={{
                width: 52, height: 52, borderRadius: '12px',
                background: 'linear-gradient(135deg,rgba(200,24,10,.22),rgba(37,58,154,.18))',
                border: '1.5px solid rgba(245,168,0,.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ReportProblemIcon sx={{ color: GOLD, fontSize: 26 }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.4rem' }, color: textPrimary, lineHeight: 1.1 }}>
                  {t('civicIssues.title')}
                </Typography>
                {/* Election + constituency sub-line removed — the same info is
                    already shown by the tab-section's value cards below, so it
                    was rendering twice on /user/civic-issues. */}
                {/* {filterElectionName && filterConstituencyName ? (
                  <Box>
                    <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.9rem', color: isDark ? '#fff' : 'text.primary', mt: 0.5, fontWeight: 800 }}>
                      {filterElectionName}
                    </Typography>
                    <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', mt: 0.3, fontWeight: 600 }}>
                      {t('civicIssues.constituency')}: {filterConstituencyName}
                    </Typography>
                  </Box>
                ) : (selectedElectionId && selectedConstituency) ? (
                  <Box>
                    <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.9rem', color: isDark ? '#fff' : 'text.primary', mt: 0.5, fontWeight: 800 }}>
                      {elections.find((e) => e.id === selectedElectionId)?.name}
                    </Typography>
                    {selectedElectionType === 'municipal_corporation' && selectedMunicipality ? (
                      <>
                        <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', mt: 0.3, fontWeight: 600 }}>
                          {t('civicIssues.municipality', { defaultValue: 'Municipality' })}: {selectedMunicipality.name}
                        </Typography>
                        <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', mt: 0.2, fontWeight: 600 }}>
                          {t('civicIssues.ward', { defaultValue: 'Ward' })}: {selectedConstituency?.number} - {selectedConstituency?.name}
                        </Typography>
                      </>
                    ) : (
                      <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', mt: 0.3, fontWeight: 600 }}>
                        {t('civicIssues.constituency')}: {selectedConstituency.name}
                      </Typography>
                    )}
                  </Box>
                ) : null} */}
              </Box>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* ── 3-Tab selector (MP / MLA / Ward·Panchayat) — always shown so the
            user can switch tabs even after deep-linking from the aspirants
            list. The arriving filterElectionId is mapped to the right tab
            automatically by the effect above. */}
      {(
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay: 0.1 }}>
          <Box sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2.5,
            borderRadius: 3,
            border: `1px solid ${borderFaint}`,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(17,24,39,0.02)',
          }}>
            <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }}>
              {(
                [
                  { key: 'mp' as const, label: t('civicIssues.tabMp', { defaultValue: 'MP Constituency' }), Icon: MPIcon, inactiveImg: undefined as string | undefined, activeImg: undefined as string | undefined },
                  // MLA: use capitol1.png when inactive and capitol.png when
                  // active so both states show the building image rather than
                  // the Gavel SvgIcon.
                  { key: 'mla' as const, label: t('civicIssues.tabMla', { defaultValue: 'MLA Constituency' }), Icon: MLAIcon, inactiveImg: capitolInactiveImg, activeImg: capitolActiveImg },
                  { key: 'ward_panchayat' as const, label: t('civicIssues.tabWardPanchayat', { defaultValue: 'Ward / Panchayat' }), Icon: WardPinIcon, inactiveImg: undefined as string | undefined, activeImg: undefined as string | undefined },
                ]
              ).map(({ key, label, Icon, inactiveImg, activeImg }) => {
                const isActive = activeTab === key;
                const imgSrc = isActive ? activeImg : inactiveImg;
                return (
                  <Box
                    key={key}
                    onClick={() => { setActiveTab(key); setUserSwitchedTab(true); }}
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
                        fontFamily: FF_HEADING,
                        fontWeight: 700,
                        fontSize: { xs: '0.78rem', sm: '0.88rem' },
                        lineHeight: 1.15,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>

            {/* Constituency value display (read-only, sourced from /auth/me) */}
            {(() => {
              const wantedType = tabToElectionType(activeTab);
              const userConstId = userConstituencyIdForType(wantedType ?? undefined);
              // Empty state — user hasn't saved a constituency for this tab.
              if (!wantedType || userConstId == null) {
                return (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      border: `1px dashed ${isDark ? 'rgba(245,168,0,0.35)' : 'rgba(245,168,0,0.45)'}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.9rem', color: textMid, mb: 1 }}>
                      {t('civicIssues.constituencyNotSet', {
                        defaultValue: 'No constituency saved for this category. Update your profile to see issues here.',
                      })}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/user/complete-profile')}
                      sx={{
                        borderColor: BRAND.yellow,
                        color: BRAND.yellow,
                        fontWeight: 700,
                        textTransform: 'none',
                      }}
                    >
                      {t('civicIssues.updateProfile', { defaultValue: 'Update Profile' })}
                    </Button>
                  </Box>
                );
              }

              // Render the resolved constituency name when available.
              const isMunicipal = wantedType === 'municipal_corporation';
              const municipalityName = isMunicipal
                ? ((selectedConstituency as any)?.municipality as string | undefined)
                : undefined;
              return (
                <Stack spacing={1.2} sx={{ mt: 2 }}>
                  {isMunicipal && municipalityName && (
                    <Box
                      sx={{
                        p: { xs: 1.25, sm: 1.5 },
                        borderRadius: 2,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.10)'}`,
                      }}
                    >
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.10em', color: BRAND.yellow, textTransform: 'uppercase', mb: 0.3 }}>
                        {t('civicIssues.municipality', { defaultValue: 'Municipality' })}
                      </Typography>
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.95rem', fontWeight: 700, color: textPrimary, wordBreak: 'break-word' }}>
                        {municipalityName}
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      p: { xs: 1.25, sm: 1.5 },
                      borderRadius: 2,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.10)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.2,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.10em', color: BRAND.yellow, textTransform: 'uppercase', mb: 0.3 }}>
                        {isMunicipal
                          ? t('civicIssues.ward', { defaultValue: 'Ward' })
                          : wantedType === 'gram_panchayat'
                            ? t('civicIssues.village', { defaultValue: 'Village' })
                            : t('civicIssues.constituency', { defaultValue: 'Constituency' })}
                      </Typography>
                      <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.95rem', fontWeight: 700, color: textPrimary, wordBreak: 'break-word' }}>
                        {selectedConstituency
                          ? `${selectedConstituency.number ? `${selectedConstituency.number} - ` : ''}${selectedConstituency.name}`
                          : `#${userConstId}`}
                      </Typography>
                    </Box>
                    {totalHandRaises != null && (
                      <Box sx={{ flexShrink: 0, textAlign: 'center' }}>
                        <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: textMid, lineHeight: 1.1 }}>
                          {t('civicIssues.totalReported', { defaultValue: 'Total Reported' })}
                        </Typography>
                        <Typography sx={{ fontFamily: FF_HEADING, fontSize: '1.15rem', fontWeight: 800, color: GOLD, lineHeight: 1.1, mt: 0.2 }}>
                          {totalHandRaises}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>
              );
            })()}
          </Box>
        </motion.div>
      )}

      {/* ── Issues List ────────────────────────────────────────────────────── */}
      {!loading && !fetchError && issues.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: '1.1rem', color: textPrimary, mb: 2 }}>
              {t('civicIssues.reportedIssues', { defaultValue: 'Reported Issues' })} ({issues.length})
            </Typography>
            <Stack spacing={1.5}>
              <AnimatePresence>
                {issues.map((issue, idx) => {
                  const createdDate = new Date(issue.createdAt);
                  const displayName = (i18n.language || '').toLowerCase().startsWith('kn') ? issue.description : issue.title;
                  return (
                    <motion.div
                      key={issue.id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                    >
                      <Card sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(17,24,39,0.02)',
                        border: `1px solid ${borderFaint}`,
                        boxShadow: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.04)',
                          borderColor: GOLD,
                        },
                      }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: '50%',
                            bgcolor: isDark ? 'rgba(245,168,0,0.1)' : 'rgba(245,168,0,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <ReportProblemIcon sx={{ color: GOLD, fontSize: 20 }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: textPrimary, mb: 0.3 }}>
                              {displayName}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: textDim, lineHeight: 1.4 }}>
                              {issue.description !== issue.title ? issue.description : ''}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: textDim, mt: 0.5 }}>
                              {createdDate.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Stack>
          </Box>
        </motion.div>
      )}

      {/* ── Category list ─────────────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: GOLD }} />
        </Box>
      ) : fetchError ? (
        <Box sx={{ bgcolor: BG, borderRadius: 3, border: `1px solid ${borderFaint}`, py: 6, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: FF_BODY, color: '#C8180A', fontWeight: 700, mb: 1 }}>{t('civicIssues.error')}</Typography>
          <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.88rem', color: textMid }}>{fetchError}</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          <AnimatePresence>
            {[...categories].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)).map((cat, idx) => {
              const isRaised = cat.isRaised ?? false;  // Use isRaised from API response
              const isRaising = raisingCat === cat.name;
              // pick an icon + color based on the category name (case-insensitive match)
              // use the API `name` (English) for logic keys; display may use `nameKn` when Kannada is active
              const nameLower = (cat.name || '').toLowerCase();
              const displayName = (i18n.language || '').toLowerCase().startsWith('kn') && (cat as any).nameKn ? (cat as any).nameKn : cat.name;
              const getIcon = () => {
                if (nameLower.includes('construction') || nameLower === 'construction') return { imgSrc: architectImg, color: '#FF6B6B' }; // Construction → architect image
                if (nameLower.includes('roads') || nameLower === 'roads' || nameLower.includes('road')) return { imgSrc: roadMapImg, color: '#FF6B6B' }; // Roads → use road-map image
                if (nameLower.includes('water')) return { imgSrc: waterTapImg, color: '#4FC3F7' }; // Water → water-tap image
                if (nameLower.includes('sew') || nameLower.includes('sewage') || nameLower.includes('drain') || nameLower.includes('pipe')) return { imgSrc: wasteImg, color: '#00BFA6' }; // Sewage → waste image
                if (nameLower.includes('garbage') || nameLower.includes('trash') || nameLower.includes('waste')) return { imgSrc: garbageImg, color: '#9CCC65' }; // Garbage → waste image
                if (nameLower.includes('street') || nameLower.includes('light') || nameLower.includes('street lights')) return { imgSrc: streetLightImg, color: '#FFD54F' }; // Street Lights → street-light image
                if (nameLower.includes('safety') || nameLower.includes('safe') || nameLower.includes('shield')) return { Icon: ShieldIcon, color: '#FF8A65' }; // Safety → shield-alert
                if (nameLower.includes('park') || nameLower.includes('parks') || nameLower.includes('tree')) return { Icon: ParkIcon, color: '#66BB6A' }; // Parks → tree-pine
                if (nameLower.includes('health') || nameLower.includes('hospital') || nameLower.includes('clinic')) return { Icon: FavoriteIcon, color: '#FF6B81' }; // Health → heart-pulse
                if (nameLower === 'construction' || nameLower.includes('hammer') || nameLower.includes('build')) return { Icon: BuildIcon, color: '#FF7043' }; // Construction → hammer
                if (nameLower.includes('electric') || nameLower.includes('power') || nameLower.includes('zap')) return { Icon: FlashOnIcon, color: '#FFD54F' }; // Electricity → zap
                if (nameLower.includes('environment') || nameLower.includes('env') || nameLower.includes('eco') || nameLower.includes('leaf')) return { imgSrc: savePlanetImg, color: '#8BC34A' }; // Environment → save-the-planet image
                if (nameLower.includes('government') || nameLower.includes('gov') || nameLower.includes('service') || nameLower.includes('services')) return { Icon: BuildingIcon, color: '#90CAF9' }; // Government Services → building-2
                if (nameLower.includes('public infrastructure') || nameLower.includes('infrastructure') || nameLower.includes('bridge')) return { Icon: BridgeIcon, color: '#8D6E63' }; // Public Infrastructure → bridge
                if (nameLower.includes('others') || nameLower.includes('other') || nameLower.trim() === '') return { Icon: MoreHorizIcon, color: '#BDBDBD' }; // Others → more-horizontal
                return { Icon: ReportProblemIcon, color: GOLD };
              };
              const iconResult = getIcon();
              const IssueIcon = iconResult.Icon ?? ReportProblemIcon;
              const issueColor = iconResult.color;
              const imgSrc = (iconResult as any).imgSrc as string | undefined;
              // always allow the display name to wrap so long names don't overflow on small screens

              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.28, delay: idx * 0.03 }}
                >
                  <Card
                    sx={{
                      borderRadius: 2.5,
                      bgcolor: BG,
                      border: `1px solid ${borderFaint}`,
                      boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.28)' : '0 2px 8px rgba(17,24,39,0.05)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ display: 'flex' }}>
                      {/* Left accent bar */}
                      <Box sx={{ width: '4px', flexShrink: 0, bgcolor: idx % 3 === 0 ? BRAND.red : idx % 3 === 1 ? BRAND.blue : BRAND.brown }} />
                      <CardContent sx={{ flex: 1, py: 2, px: { xs: 2, sm: 2.5 }, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                          {/* Category name + count */}
                          <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, overflow: 'hidden' }}>
                            <Box sx={{ width: 28, height: 28, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              {imgSrc ? (
                                <Box component="img" src={imgSrc} alt="road" sx={{ width: 24, height: 24, objectFit: 'contain', filter: isDark ? 'drop-shadow(0 0 6px rgba(0,0,0,0.6))' : 'none' }} />
                              ) : (
                                <IssueIcon sx={{ color: issueColor, fontSize: 22, filter: `drop-shadow(0 0 8px ${issueColor}33)` }} />
                              )}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{
                                fontFamily: FF_HEADING, fontWeight: 800,
                                fontSize: { xs: '0.98rem', sm: '1.06rem' },
                                color: textPrimary, mb: 0.3,
                                whiteSpace: 'normal',
                                overflowWrap: 'anywhere',
                                wordBreak: 'break-word',
                                display: 'block'
                              }}>
                                {displayName}
                              </Typography>
                              <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.78rem', color: textDim }}>
                                {t('civicIssues.handRaise', { count: cat.count })}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Report / Raised button */}
                          <Box sx={{ flexShrink: 0, mt: { xs: 1, sm: 0 } }}>
                            {isRaised ? (
                              <Button
                                disabled
                                size="small"
                                startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  fontFamily: FF_HEADING, fontWeight: 700, textTransform: 'none',
                                  borderRadius: 2, fontSize: '0.82rem',
                                  color: isDark ? 'rgba(76,175,80,0.85)' : '#388e3c',
                                  borderColor: isDark ? 'rgba(76,175,80,0.35)' : 'rgba(76,175,80,0.5)',
                                  '&.Mui-disabled': {
                                    color: isDark ? 'rgba(76,175,80,0.85)' : '#388e3c',
                                    borderColor: isDark ? 'rgba(76,175,80,0.35)' : 'rgba(76,175,80,0.5)',
                                  },
                                }}
                                variant="outlined"
                              >
                                {t('civicIssues.reportedBtn', { defaultValue: 'Reported' })}
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                disabled={isRaising}
                                onClick={() => handleRaise(cat)}
                                startIcon={isRaising ? <CircularProgress size={14} sx={{ color: GOLD }} /> : <HandRaiseIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  fontFamily: FF_HEADING, fontWeight: 700, textTransform: 'none',
                                  borderRadius: 2, fontSize: '0.82rem',
                                  borderColor: 'rgba(245,168,0,0.45)',
                                  color: GOLD,
                                  '&:hover': { bgcolor: 'rgba(245,168,0,0.08)', borderColor: GOLD },
                                }}
                                variant="outlined"
                              >
                                {t('common.yes', { defaultValue: 'Yes' })}
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Stack>
      )}

      {/* Proceed button */}
      <Box sx={{ mt: 3 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate('/user/sop')}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 700,
            fontFamily: FF_BODY,
            py: 1.5,
            fontSize: '0.95rem',
            color: '#fff',
            background: 'linear-gradient(135deg, #C8180A 0%, #F5A800 100%)',
            boxShadow: '0 6px 24px rgba(200,24,10,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #df210f 0%, #ffbe1a 100%)',
              boxShadow: '0 8px 30px rgba(200,24,10,0.55)',
            },
          }}
        >
          {isKannada ? 'ಪರಿಹಾರ (SOP)' : 'Solutions (SOP)'}
        </Button>
      </Box>
    </Box>
  );
};

export default CivicIssuesPage;
