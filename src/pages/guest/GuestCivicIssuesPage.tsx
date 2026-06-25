import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress, Stack, useTheme,
  TextField, Chip, Autocomplete, MenuItem,
} from '@mui/material';
import {
  ReportProblem as ReportProblemIcon,
  Security as ShieldIcon,
  Park as ParkIcon,
  Favorite as FavoriteIcon,
  Build as BuildIcon,
  FlashOn as FlashOnIcon,
  Apartment as BuildingIcon,
  AccountBalance as BridgeIcon,
  MoreHoriz as MoreHorizIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../../theme';
import { getIssuesByElectionAndConstituency } from '../../services/civicIssuesService';
import { useNavigate } from 'react-router-dom';
import {
  fetchElections,
  fetchConstituencies,
  fetchMunicipalities,
  fetchConstituenciesByScope,
  fetchGPStates,
  fetchGPDistricts,
  fetchGPTaluks,
  fetchGPGrams,
  fetchGPVillages,
  type Election,
  type Constituency,
  type GPVillage,
} from '../../services/electionService';
import roadMapImg from '../../assets/images/road-map.webp';
import architectImg from '../../assets/images/architect.webp';
import wasteImg from '../../assets/images/waste.webp';
import waterTapImg from '../../assets/images/water-tap.webp';
import garbageImg from '../../assets/images/garbage.webp';
import streetLightImg from '../../assets/images/street-light.webp';
import savePlanetImg from '../../assets/images/save-the-planet.webp';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";

interface IssueCategory {
  name: string;
  nameKn?: string;
  count: number;
}

const filterSx = (isDark: boolean) => ({
  '& .MuiOutlinedInput-root': {
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
    '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
  '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
  '& .MuiSelect-select': { color: isDark ? '#fff' : 'rgba(15,23,42,0.9)' },
});

const listboxSx = (isDark: boolean) => ({
  bgcolor: isDark ? '#1a1515' : '#fff',
  '& .MuiAutocomplete-option': {
    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.9)',
    '&[aria-selected="true"]': { bgcolor: isDark ? 'rgba(245,168,0,0.15)' : 'rgba(245,168,0,0.1)' },
    '&.Mui-focused': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.04)' },
  },
});

const GuestCivicIssuesPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isKannada = (i18n.language || '').startsWith('kn');
  const navigate = useNavigate();



  const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;
  const BG = theme.palette.background.paper;
  const borderFaint = isDark ? 'rgba(245,168,0,0.18)' : 'rgba(245,168,0,0.28)';
  const textPrimary = theme.palette.text.primary;
  const textDim = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(17,24,39,0.46)';

  // ── Elections ────────────────────────────────────────────────
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | ''>('');
  const selectedElection = elections.find((e) => e.id === selectedElectionId) ?? null;
  const isMunicipalElection = selectedElection?.type === 'municipal_corporation';
  const isGramPanchayat = selectedElection?.type === 'gram_panchayat';

  // ── Default: Constituencies ──────────────────────────────────
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [loadingConstituencies, setLoadingConstituencies] = useState(false);
  const [selectedConstituency, setSelectedConstituency] = useState<Constituency | null>(null);

  // ── Municipal flow ───────────────────────────────────────────
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string; state: string }[]>([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<{ id: number; name: string; state: string } | null>(null);
  const [cityConstituencies, setCityConstituencies] = useState<Constituency[]>([]);
  const [loadingCityConstituencies, setLoadingCityConstituencies] = useState(false);

  // ── Gram Panchayat flow ──────────────────────────────────────
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

  // ── Issues ───────────────────────────────────────────────────
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const STATIC_CATEGORIES: IssueCategory[] = [
    { name: 'Jobs issues', nameKn: 'ಉದ್ಯೋಗ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Health issues', nameKn: 'ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Education issues', nameKn: 'ಶಿಕ್ಷಣ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Roads issues', nameKn: 'ರಸ್ತೆ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Water issues', nameKn: 'ನೀರಿನ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Sewage issues', nameKn: 'ಒಳಚರಂಡಿ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Garbage issues', nameKn: 'ಕಸದ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Street Lights issues', nameKn: 'ಬೀದಿ ದೀಪಗಳ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Safety issues', nameKn: 'ಭದ್ರತಾ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Parks issues', nameKn: 'ಉದ್ಯಾನವನಗಳ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Construction issues', nameKn: 'ನಿರ್ಮಾಣ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Electricity issues', nameKn: 'ವಿದ್ಯುತ್ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Environment issues', nameKn: 'ಪರಿಸರ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Government Services issues', nameKn: 'ಸರ್ಕಾರಿ ಸೇವೆಗಳ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'Public Infrastructure issues', nameKn: 'ಸಾರ್ವಜನಿಕ ಮೂಲಸೌಕರ್ಯ ಸಮಸ್ಯೆಗಳು', count: 0 },
    { name: 'others', nameKn: 'ಇತರೆ ಸಮಸ್ಯೆಗಳು', count: 0 },
  ];

  const resetGpState = () => {
    setGpStates([]); setGpDistricts([]); setGpTaluks([]); setGpGrams([]); setGpVillages([]);
    setSelectedGpState(null); setSelectedGpDistrict(null); setSelectedGpTaluk(null);
    setSelectedGpGram(null); setSelectedGpVillage(null);
  };

  // ── Fetch elections on mount ─────────────────────────────────
  useEffect(() => {
    fetchElections()
      .then((resp) => setElections(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setElections([]));
  }, []);

  // ── Election change: fetch second-level options ───────────────
  useEffect(() => {
    if (!selectedElectionId) {
      setConstituencies([]); setSelectedConstituency(null);
      setMunicipalities([]); setSelectedMunicipality(null);
      setCityConstituencies([]);
      resetGpState();
      return;
    }
    const selected = elections.find((e) => e.id === selectedElectionId);
    if (!selected) return;

    if (selected.type === 'gram_panchayat') {
      setConstituencies([]); setSelectedConstituency(null);
      setMunicipalities([]); setSelectedMunicipality(null); setCityConstituencies([]);
      resetGpState();
      setLoadingGpStates(true);
      fetchGPStates()
        .then((resp) => setGpStates(Array.isArray(resp.data) ? resp.data : []))
        .catch(() => setGpStates([]))
        .finally(() => setLoadingGpStates(false));
      return;
    }

    resetGpState();

    if (selected.type === 'municipal_corporation') {
      setLoadingMunicipalities(true);
      setMunicipalities([]); setSelectedMunicipality(null);
      setCityConstituencies([]); setSelectedConstituency(null);
      fetchMunicipalities()
        .then((resp) => setMunicipalities(Array.isArray(resp.data) ? resp.data : []))
        .catch(() => setMunicipalities([]))
        .finally(() => setLoadingMunicipalities(false));
      return;
    }

    setLoadingConstituencies(true);
    setConstituencies([]); setSelectedConstituency(null);
    fetchConstituencies(selected.type)
      .then((resp) => setConstituencies(resp.data?.constituencies ?? []))
      .catch(() => setConstituencies([]))
      .finally(() => setLoadingConstituencies(false));
  }, [selectedElectionId, elections]);

  // ── Municipal: city wards on municipality change ──────────────
  useEffect(() => {
    if (!selectedMunicipality) { setCityConstituencies([]); setSelectedConstituency(null); return; }
    setLoadingCityConstituencies(true);
    setCityConstituencies([]); setSelectedConstituency(null);
    fetchConstituenciesByScope(selectedMunicipality.name)
      .then((resp) => setCityConstituencies(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setCityConstituencies([]))
      .finally(() => setLoadingCityConstituencies(false));
  }, [selectedMunicipality]);

  // ── GP cascading ─────────────────────────────────────────────
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
      .then((resp) => setGpDistricts(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpDistricts([]))
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
      .then((resp) => setGpTaluks(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpTaluks([]))
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
      .then((resp) => setGpGrams(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpGrams([]))
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
      .then((resp) => setGpVillages(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpVillages([]))
      .finally(() => setLoadingGpVillages(false));
  }, [selectedGpState, selectedGpDistrict, selectedGpTaluk, selectedGpGram]);

  // ── Fetch issues when filters complete ───────────────────────
  useEffect(() => {
    const hasGpSelection = isGramPanchayat && selectedGpVillage;
    const hasConstituency = !isGramPanchayat && selectedConstituency;
    if (!selectedElectionId || (!hasConstituency && !hasGpSelection)) {
      setCategories([]);
      return;
    }
    const constituencyId = hasGpSelection ? Number(selectedGpVillage!.id) : selectedConstituency!.id;
    setLoading(true);
    getIssuesByElectionAndConstituency(Number(selectedElectionId), constituencyId)
      .then(({ categories: cats }) => setCategories(cats || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, [selectedElectionId, selectedConstituency, selectedGpVillage, isGramPanchayat]);

  const filtersComplete = !!selectedElectionId && (
    (isGramPanchayat && !!selectedGpVillage) ||
    (!isGramPanchayat && !!selectedConstituency)
  );

  const getIcon = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('construction')) return { imgSrc: architectImg, color: '#FF6B6B' };
    if (n.includes('road')) return { imgSrc: roadMapImg, color: '#FF6B6B' };
    if (n.includes('water')) return { imgSrc: waterTapImg, color: '#4FC3F7' };
    if (n.includes('sew') || n.includes('drain') || n.includes('pipe')) return { imgSrc: wasteImg, color: '#00BFA6' };
    if (n.includes('garbage') || n.includes('trash') || n.includes('waste')) return { imgSrc: garbageImg, color: '#9CCC65' };
    if (n.includes('street') || n.includes('light')) return { imgSrc: streetLightImg, color: '#FFD54F' };
    if (n.includes('job') || n.includes('employ') || n.includes('work')) return { Icon: WorkIcon, color: '#A78BFA' };
    if (n.includes('safety') || n.includes('safe')) return { Icon: ShieldIcon, color: '#FF8A65' };
    if (n.includes('park') || n.includes('tree')) return { Icon: ParkIcon, color: '#66BB6A' };
    if (n.includes('health') || n.includes('hospital')) return { Icon: FavoriteIcon, color: '#FF6B81' };
    if (n.includes('hammer') || n.includes('build')) return { Icon: BuildIcon, color: '#FF7043' };
    if (n.includes('electric') || n.includes('power')) return { Icon: FlashOnIcon, color: '#FFD54F' };
    if (n.includes('environment') || n.includes('eco')) return { imgSrc: savePlanetImg, color: '#8BC34A' };
    if (n.includes('government') || n.includes('service')) return { Icon: BuildingIcon, color: '#90CAF9' };
    if (n.includes('infrastructure') || n.includes('bridge')) return { Icon: BridgeIcon, color: '#8D6E63' };
    if (n.includes('other')) return { Icon: MoreHorizIcon, color: '#BDBDBD' };
    return { Icon: ReportProblemIcon, color: GOLD };
  };

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', px: { xs: 1, sm: 0 } }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
        <Box sx={{
          bgcolor: BG, borderRadius: 3, border: `1px solid ${borderFaint}`, overflow: 'hidden',
          boxShadow: isDark ? '0 14px 32px rgba(0,0,0,0.32)' : '0 4px 14px rgba(17,24,39,0.06)',
          mb: 3,
        }}>
          <Box sx={{ display: 'flex', height: '4px' }}>
            {[BRAND.red, BRAND.blue, BRAND.brown].map(c => (
              <Box key={c} sx={{ flex: 1, bgcolor: c }} />
            ))}
          </Box>
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: '12px',
              background: 'linear-gradient(135deg,rgba(200,24,10,.22),rgba(37,58,154,.18))',
              border: '1.5px solid rgba(245,168,0,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ReportProblemIcon sx={{ color: GOLD, fontSize: 26 }} />
            </Box>
            <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.4rem' }, color: textPrimary, lineHeight: 1.1 }}>
              {t('civicIssues.title', { defaultValue: 'Public Issues' })}
            </Typography>
          </Box>
        </Box>
      </motion.div>
      {/* Row 1: Election + first-level filters */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        useFlexGap
        sx={{
          flexWrap: "wrap",
          mb: 2
        }}>
        <TextField
          select
          label={t('forms.aspirant.electionType', { defaultValue: 'Election Type' })}
          value={selectedElectionId}
          onChange={(e) => setSelectedElectionId(e.target.value ? Number(e.target.value) : '')}
          sx={{ minWidth: { xs: '100%', sm: 240 }, ...filterSx(isDark) }}
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

        {/* GP: State + District */}
        {isGramPanchayat && (
          <>
            <Autocomplete
              options={gpStates}
              value={selectedGpState}
              onChange={(_, v) => setSelectedGpState(v)}
              disabled={!selectedElectionId}
              loading={loadingGpStates}
              sx={{ minWidth: { xs: '100%', sm: 220 } }}
              slotProps={{ listbox: { sx: listboxSx(isDark) } }}
              renderInput={(params) => <TextField {...params} label="State" sx={filterSx(isDark)} />}
            />
            <Autocomplete
              options={gpDistricts}
              value={selectedGpDistrict}
              onChange={(_, v) => setSelectedGpDistrict(v)}
              disabled={!selectedGpState}
              loading={loadingGpDistricts}
              sx={{ minWidth: { xs: '100%', sm: 220 } }}
              slotProps={{ listbox: { sx: listboxSx(isDark) } }}
              renderInput={(params) => <TextField {...params} label="District" sx={filterSx(isDark)} />}
            />
          </>
        )}

        {/* Municipal: Corporation + Ward */}
        {isMunicipalElection && (
          <>
            <Autocomplete
              options={municipalities}
              getOptionLabel={(o) => o.name}
              value={selectedMunicipality}
              onChange={(_, v) => setSelectedMunicipality(v)}
              disabled={!selectedElectionId}
              loading={loadingMunicipalities}
              sx={{ minWidth: { xs: '100%', sm: 280 } }}
              slotProps={{ listbox: { sx: listboxSx(isDark) } }}
              renderInput={(params) => (
                <TextField {...params} label={t('forms.aspirant.municipality', { defaultValue: 'Corporation / Municipality' })} sx={filterSx(isDark)} />
              )}
            />
            <Autocomplete
              options={cityConstituencies}
              getOptionLabel={(o) => `${o.number ? `${o.number} - ` : ''}${o.name}`}
              value={selectedConstituency}
              onChange={(_, v) => setSelectedConstituency(v)}
              disabled={!selectedMunicipality}
              loading={loadingCityConstituencies}
              sx={{ minWidth: { xs: '100%', sm: 280 } }}
              slotProps={{ listbox: { sx: listboxSx(isDark) } }}
              renderInput={(params) => (
                <TextField {...params} label={t('forms.aspirant.cityCorporationWard', { defaultValue: 'City Corporation Ward' })} sx={filterSx(isDark)} />
              )}
            />
          </>
        )}

        {/* Default: Constituency */}
        {!isGramPanchayat && !isMunicipalElection && selectedElectionId && (
          <Autocomplete
            options={constituencies}
            getOptionLabel={(o) => o.name}
            value={selectedConstituency}
            onChange={(_, v) => setSelectedConstituency(v)}
            disabled={!selectedElectionId}
            loading={loadingConstituencies}
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
            slotProps={{ listbox: { sx: listboxSx(isDark) } }}
            renderInput={(params) => (
              <TextField {...params} label={t('forms.aspirant.constituency', { defaultValue: 'Constituency' })} sx={filterSx(isDark)} />
            )}
          />
        )}
      </Stack>
      {/* Row 2: GP Taluk + Gram + Village */}
      {isGramPanchayat && selectedGpDistrict && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          useFlexGap
          sx={{
            flexWrap: "wrap",
            mb: 2
          }}>
          <Autocomplete
            options={gpTaluks}
            value={selectedGpTaluk}
            onChange={(_, v) => setSelectedGpTaluk(v)}
            disabled={!selectedGpDistrict}
            loading={loadingGpTaluks}
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
            slotProps={{ listbox: { sx: listboxSx(isDark) } }}
            renderInput={(params) => <TextField {...params} label="Taluk" sx={filterSx(isDark)} />}
          />
          <Autocomplete
            options={gpGrams}
            value={selectedGpGram}
            onChange={(_, v) => setSelectedGpGram(v)}
            disabled={!selectedGpTaluk}
            loading={loadingGpGrams}
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
            slotProps={{ listbox: { sx: listboxSx(isDark) } }}
            renderInput={(params) => <TextField {...params} label="Gram Panchayat" sx={filterSx(isDark)} />}
          />
          <Autocomplete
            options={gpVillages}
            getOptionLabel={(o) => o.villageName}
            value={selectedGpVillage}
            onChange={(_, v) => setSelectedGpVillage(v)}
            disabled={!selectedGpGram}
            loading={loadingGpVillages}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
            slotProps={{ listbox: { sx: listboxSx(isDark) } }}
            renderInput={(params) => <TextField {...params} label="Village" sx={filterSx(isDark)} />}
          />
        </Stack>
      )}
      {/* Results */}
      {!filtersComplete ? (
        <Box>
          <Typography sx={{ fontFamily: FF_BODY, fontWeight: 700, fontSize: '0.9rem', color: textDim, mb: 2, textAlign: 'center' }}>
            {isKannada ? 'ಫಿಲ್ಟರ್ ಆಯ್ಕೆ ಮಾಡಿ ನಿಮ್ಮ ಪ್ರದೇಶದ ಸಮಸ್ಯೆಗಳನ್ನು ನೋಡಿ' : 'Select a constituency above to view issue counts in your area'}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
            {STATIC_CATEGORIES.map((cat, idx) => {
              const iconResult = getIcon(cat.name);
              const IssueIcon = (iconResult as any).Icon ?? ReportProblemIcon;
              const issueColor = iconResult.color;
              const imgSrc = (iconResult as any).imgSrc as string | undefined;
              const displayName = isKannada && cat.nameKn ? cat.nameKn : cat.name;
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                >
                  <Box sx={{
                    p: 1.8, borderRadius: 2.5, bgcolor: BG,
                    border: `1px solid ${borderFaint}`,
                    boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.22)' : '0 2px 8px rgba(17,24,39,0.05)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                    textAlign: 'center',
                  }}>
                    <Box sx={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(17,24,39,0.04)',
                      border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(17,24,39,0.08)'}`,
                      display: 'grid', placeItems: 'center',
                    }}>
                      {imgSrc ? (
                        <Box component="img" src={imgSrc} alt={cat.name} sx={{ width: 26, height: 26, objectFit: 'contain', opacity: 0.75 }} />
                      ) : (
                        <IssueIcon sx={{ color: issueColor, fontSize: 22, opacity: 0.8 }} />
                      )}
                    </Box>
                    <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.82rem', color: textPrimary, lineHeight: 1.3 }}>
                      {displayName}
                    </Typography>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        </Box>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: GOLD }} />
        </Box>
      ) : categories.length === 0 ? (
        <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary', fontFamily: FF_BODY }}>
          {isKannada ? 'ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No civic issues found'}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {[...categories].sort((a, b) => b.count - a.count).map((cat, idx) => {
            const iconResult = getIcon(cat.name);
            const IssueIcon = (iconResult as any).Icon ?? ReportProblemIcon;
            const issueColor = iconResult.color;
            const imgSrc = (iconResult as any).imgSrc as string | undefined;
            const displayName = isKannada && cat.nameKn ? cat.nameKn : cat.name;

            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: idx * 0.03 }}
              >
                <Card sx={{
                  borderRadius: 2.5, bgcolor: BG, border: `1px solid ${borderFaint}`,
                  boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.28)' : '0 2px 8px rgba(17,24,39,0.05)',
                  overflow: 'hidden',
                }}>
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{ width: '4px', flexShrink: 0, bgcolor: idx % 3 === 0 ? BRAND.red : idx % 3 === 1 ? BRAND.blue : BRAND.brown }} />
                    <CardContent sx={{ flex: 1, py: 2, px: { xs: 2, sm: 2.5 }, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, overflow: 'hidden' }}>
                          <Box sx={{ width: 28, height: 28, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            {imgSrc ? (
                              <Box component="img" src={imgSrc} alt={cat.name} sx={{ width: 24, height: 24, objectFit: 'contain', filter: isDark ? 'drop-shadow(0 0 6px rgba(0,0,0,0.6))' : 'none' }} />
                            ) : (
                              <IssueIcon sx={{ color: issueColor, fontSize: 22, filter: `drop-shadow(0 0 8px ${issueColor}33)` }} />
                            )}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{
                              fontFamily: FF_HEADING, fontWeight: 800,
                              fontSize: { xs: '0.98rem', sm: '1.06rem' },
                              color: textPrimary, mb: 0.3,
                              whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word', display: 'block',
                            }}>
                              {displayName}
                            </Typography>
                            <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.78rem', color: textDim }}>
                              {t('civicIssues.handRaise', { count: cat.count, defaultValue: `${cat.count} hand raises` })}
                            </Typography>
                          </Box>
                        </Box>

                        <Chip
                          size="small"
                          label={cat.count}
                          sx={{
                            fontFamily: FF_HEADING, fontWeight: 800, fontSize: '0.85rem',
                            bgcolor: cat.count > 0 ? 'rgba(245,168,0,0.12)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.06)'),
                            color: cat.count > 0 ? GOLD : textDim,
                            border: `1px solid ${cat.count > 0 ? 'rgba(245,168,0,0.3)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(17,24,39,0.1)')}`,
                            minWidth: 36, height: 28,
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              </motion.div>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default GuestCivicIssuesPage;
