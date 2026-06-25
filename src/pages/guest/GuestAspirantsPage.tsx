import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Avatar, CircularProgress, Stack, useTheme,
  TextField, Chip, Autocomplete, MenuItem,
} from '@mui/material';
import { LocationOn as LocationOnIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../../theme';
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
import { fetchAspirantsByConstituency } from '../../services/aspirantService';
import { useNavigate } from 'react-router-dom';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;

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

const GuestAspirantsPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isKannada = (i18n.language || '').startsWith('kn');
  const navigate = useNavigate();



  // ── Elections ────────────────────────────────────────────────
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<number | ''>('');
  const selectedElection = elections.find((e) => e.id === selectedElectionId) ?? null;
  const isMunicipalElection = selectedElection?.type === 'municipal_corporation';
  const isGramPanchayat = selectedElection?.type === 'gram_panchayat';

  // ── Default flow: Constituencies ─────────────────────────────
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

  // ── Aspirants ────────────────────────────────────────────────
  const [aspirants, setAspirants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  // ── Fetch constituencies / municipalities / GP states on election change ──
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

    // Default: fetch by election type
    setLoadingConstituencies(true);
    setConstituencies([]); setSelectedConstituency(null);
    fetchConstituencies(selected.type)
      .then((resp) => setConstituencies(resp.data?.constituencies ?? []))
      .catch(() => setConstituencies([]))
      .finally(() => setLoadingConstituencies(false));
  }, [selectedElectionId, elections]);

  // ── Municipal: fetch city wards when municipality selected ────
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

  // ── Fetch aspirants when all filters are ready ────────────────
  useEffect(() => {
    const hasGpSelection = isGramPanchayat && selectedGpVillage;
    const hasConstituency = !isGramPanchayat && selectedConstituency;
    if (!selectedElectionId || (!hasConstituency && !hasGpSelection)) {
      setAspirants([]);
      return;
    }
    const constituencyId = hasGpSelection ? Number(selectedGpVillage!.id) : selectedConstituency!.id;
    setLoading(true);
    fetchAspirantsByConstituency(Number(selectedElectionId), constituencyId)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
        setAspirants(list.filter((a: any) => a.status === 'approved' && a.documentStatus === 'completed'));
      })
      .catch(() => setAspirants([]))
      .finally(() => setLoading(false));
  }, [selectedElectionId, selectedConstituency, selectedGpVillage, isGramPanchayat]);

  // ── Theme tokens ─────────────────────────────────────────────
  const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;
  const textPrimary = theme.palette.text.primary;
  const textDim = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(17,24,39,0.42)';
  const cardBg = isDark ? 'linear-gradient(160deg, #1C1010 0%, #130B0B 100%)' : theme.palette.background.paper;
  const cardBorder = isDark ? '1px solid rgba(245,168,0,0.1)' : '1px solid rgba(245,168,0,0.22)';
  const avatarBg = isDark ? '#1C1010' : theme.palette.background.paper;
  const votesValueColor = isDark ? '#ff6a5f' : BRAND.red;

  // ── Derive whether enough filters are selected to show results ─
  const hasGpSelection = isGramPanchayat && !!selectedGpVillage;
  const hasConstituencySelection = !isGramPanchayat && !!selectedConstituency;
  const filtersComplete = !!selectedElectionId && (hasGpSelection || hasConstituencySelection);

  return (
    <Stack spacing={3} sx={{ fontFamily: FF_BODY }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: 'text.primary' }}>
          {t('userDashboard.actions.candidates', { defaultValue: 'View Aspirants' })}
        </Typography>
      </motion.div>
      {/* Row 1: Election + first-level constituency/municipality/GP state+district */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap sx={{
        flexWrap: "wrap"
      }}>
        {/* Election type */}
        <TextField
          select
          label={t('forms.aspirant.electionType', { defaultValue: 'Election Type' })}
          value={selectedElectionId}
          onChange={(e) => setSelectedElectionId(e.target.value ? Number(e.target.value) : '')}
          sx={{ minWidth: { xs: '100%', sm: 240 }, ...filterSx(isDark) }}
          slotProps={{
            select: {
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
            },
          }}
        >
          {elections.map((el) => (
            <MenuItem key={el.id} value={el.id}>{el.name}</MenuItem>
          ))}
        </TextField>

        {/* Gram Panchayat: State + District */}
        {isGramPanchayat && (
          <>
            <Autocomplete
              options={gpStates}
              value={selectedGpState}
              onChange={(_, v) => setSelectedGpState(v)}
              disabled={!selectedElectionId}
              loading={loadingGpStates}
              sx={{ minWidth: { xs: '100%', sm: 220 } }}
              renderInput={(params) => <TextField {...params} label="State" sx={filterSx(isDark)} />}
              slotProps={{
                listbox: { sx: listboxSx(isDark) }
              }}
            />
            <Autocomplete
              options={gpDistricts}
              value={selectedGpDistrict}
              onChange={(_, v) => setSelectedGpDistrict(v)}
              disabled={!selectedGpState}
              loading={loadingGpDistricts}
              sx={{ minWidth: { xs: '100%', sm: 220 } }}
              renderInput={(params) => <TextField {...params} label="District" sx={filterSx(isDark)} />}
              slotProps={{
                listbox: { sx: listboxSx(isDark) }
              }}
            />
          </>
        )}

        {/* Municipal: Corporation + City Ward */}
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
              renderInput={(params) => (
                <TextField {...params} label={t('forms.aspirant.municipality', { defaultValue: 'Corporation / Municipality' })} sx={filterSx(isDark)} />
              )}
              slotProps={{
                listbox: { sx: listboxSx(isDark) }
              }}
            />
            <Autocomplete
              options={cityConstituencies}
              getOptionLabel={(o) => `${o.number ? `${o.number} - ` : ''}${o.name}`}
              value={selectedConstituency}
              onChange={(_, v) => setSelectedConstituency(v)}
              disabled={!selectedMunicipality}
              loading={loadingCityConstituencies}
              sx={{ minWidth: { xs: '100%', sm: 280 } }}
              renderInput={(params) => (
                <TextField {...params} label={t('forms.aspirant.cityCorporationWard', { defaultValue: 'City Corporation Ward' })} sx={filterSx(isDark)} />
              )}
              slotProps={{
                listbox: { sx: listboxSx(isDark) }
              }}
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
            renderInput={(params) => (
              <TextField {...params} label={t('forms.aspirant.constituency', { defaultValue: 'Constituency' })} sx={filterSx(isDark)} />
            )}
            slotProps={{
              listbox: { sx: listboxSx(isDark) }
            }}
          />
        )}
      </Stack>
      {/* Row 2: GP Taluk + Gram + Village */}
      {isGramPanchayat && selectedGpDistrict && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap sx={{
          flexWrap: "wrap"
        }}>
          <Autocomplete
            options={gpTaluks}
            value={selectedGpTaluk}
            onChange={(_, v) => setSelectedGpTaluk(v)}
            disabled={!selectedGpDistrict}
            loading={loadingGpTaluks}
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
            renderInput={(params) => <TextField {...params} label="Taluk" sx={filterSx(isDark)} />}
            slotProps={{
              listbox: { sx: listboxSx(isDark) }
            }}
          />
          <Autocomplete
            options={gpGrams}
            value={selectedGpGram}
            onChange={(_, v) => setSelectedGpGram(v)}
            disabled={!selectedGpTaluk}
            loading={loadingGpGrams}
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
            renderInput={(params) => <TextField {...params} label="Gram Panchayat" sx={filterSx(isDark)} />}
            slotProps={{
              listbox: { sx: listboxSx(isDark) }
            }}
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
            renderInput={(params) => <TextField {...params} label="Village" sx={filterSx(isDark)} />}
            slotProps={{
              listbox: { sx: listboxSx(isDark) }
            }}
          />
        </Stack>
      )}
      {/* Results */}
      {!filtersComplete ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ color: 'text.secondary', fontFamily: FF_BODY, fontWeight: 600 }}>
            {isKannada ? 'ಆಕಾಂಕ್ಷಿಗಳನ್ನು ನೋಡಲು ಮೇಲಿನ ಫಿಲ್ಟರ್ ಆಯ್ಕೆ ಮಾಡಿ' : 'Select the filters above to view aspirants'}
          </Typography>
        </Box>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : aspirants.length === 0 ? (
        <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          {isKannada ? 'ಆಕಾಂಕ್ಷಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No aspirants found'}
        </Typography>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 2, width: '100%',
        }}>
          {aspirants.map((asp: any, idx: number) => (
            <motion.div key={asp._id || asp.id || idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.04, 0.5) }}>
              <Card sx={{
                height: '100%', display: 'flex', flexDirection: 'column',
                borderRadius: '12px', p: 0,
                background: cardBg, border: cardBorder, position: 'relative',
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(17,24,39,0.08)',
                overflow: 'hidden',
                transition: 'transform 0.24s cubic-bezier(.2,.8,.2,1), box-shadow 0.24s ease',
                '&::before': {
                  content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                  background: `linear-gradient(180deg, ${BRAND.red} 0%, ${BRAND.yellow} 55%, ${BRAND.brown} 100%)`,
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.7)' : '0 20px 50px rgba(17,24,39,0.14)',
                },
              }}>
                <CardContent sx={{ flexGrow: 1, p: { xs: '14px', md: '16px' }, pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{
                      p: '2.5px', borderRadius: '50%', flexShrink: 0,
                      background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red2 || BRAND.red} 180deg 270deg, ${BRAND.yellow2 || BRAND.yellow} 270deg 360deg)`,
                    }}>
                      <Avatar
                        src={asp.selfieUrl || asp.recentPhotoUrl || asp.profilePicture || asp.photo || undefined}
                        alt={asp.name}
                        sx={{ width: 56, height: 56, bgcolor: avatarBg, color: GOLD, fontWeight: 700, border: `2px solid ${avatarBg}`, fontSize: '1.25rem' }}
                      >
                        {!(asp.selfieUrl || asp.recentPhotoUrl || asp.profilePicture || asp.photo) ? (asp.name || 'A').charAt(0).toUpperCase() : null}
                      </Avatar>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ minWidth: 0, pr: 1 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.25, color: textPrimary, fontFamily: FF_HEADING }}>
                            {isKannada ? (asp.nameKn || asp.name || 'Aspirant') : (asp.nameEn || asp.name || 'Aspirant')}
                          </Typography>
                          <Box sx={{ mt: 0.25 }}>
                            {asp.education && (
                              <Typography variant="body2" sx={{ color: textDim, fontSize: '0.75rem', lineHeight: 1.1, fontWeight: 600 }}>
                                {asp.education}
                              </Typography>
                            )}
                            {asp.voteCount != null && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: asp.education ? 0.25 : 0.1 }}>
                                <Typography variant="body2" sx={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.78)' : 'rgba(17,24,39,0.62)', fontWeight: 600 }}>
                                  Votes:
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 900, color: votesValueColor, fontFamily: FF_HEADING }}>
                                  {asp.voteCount ?? 0}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                        {asp.party && (
                          <Chip
                            label={asp.party.toLowerCase() !== 'independent' ? asp.party : t('forms.aspirant.defaults.party', { defaultValue: 'Independent' })}
                            size="small"
                            sx={{ borderRadius: '6px', bgcolor: 'rgba(245,168,0,0.12)', color: GOLD, border: '1px solid rgba(245,168,0,0.3)', fontWeight: 700, fontSize: '0.65rem', flexShrink: 0, height: 20 }}
                          />
                        )}
                      </Box>
                      {asp.wardName && (
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.35, color: textDim }}>
                          <LocationOnIcon sx={{ fontSize: 11 }} />
                          {asp.wardName}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      )}
    </Stack>
  );
};

export default GuestAspirantsPage;
