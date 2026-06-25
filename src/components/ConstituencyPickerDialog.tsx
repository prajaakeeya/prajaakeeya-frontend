import { useEffect, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import {
  fetchConstituencies,
  fetchMunicipalities,
  fetchConstituenciesByScope,
  fetchGPStates,
  fetchGPDistricts,
  fetchGPTaluks,
  fetchGPGrams,
  fetchGPVillages,
  type Constituency,
  type GPVillage,
} from '../services/electionService';
import { updateUserConstituencies } from '../services/authService';
import useAuthStore from '../store/useAuthStore';
import { COOKIE_AUTH } from '../config/authMode';
import { BRAND } from '../theme';

type Municipality = { id: number; name: string; state: string };
type LocalBody = 'municipality' | 'gram_panchayat' | null;

interface Props {
  open: boolean;
  onClose: () => void;
  // Fired after a successful save — parent can refresh derived state.
  onSaved?: () => void;
}

// Self-contained dialog with all four constituency cascades. Pre-fills from
// the auth-store user (nested objects on /auth/me), saves via
// updateUserConstituencies, then refreshes the auth store so callers see the
// new values without a second fetch.
const ConstituencyPickerDialog: React.FC<Props> = ({ open, onClose, onSaved }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user, token, setAuth, fetchProfile } = useAuthStore();

  // Lok Sabha / State Assembly options + selections
  const [lokSabhaOptions, setLokSabhaOptions] = useState<Constituency[]>([]);
  const [stateAssemblyOptions, setStateAssemblyOptions] = useState<Constituency[]>([]);
  const [lokSabha, setLokSabha] = useState<Constituency | null>(null);
  const [stateAssembly, setStateAssembly] = useState<Constituency | null>(null);
  const [loadingLs, setLoadingLs] = useState(false);
  const [loadingSa, setLoadingSa] = useState(false);

  // Local body (municipality vs GP)
  const [localBody, setLocalBody] = useState<LocalBody>(null);

  // Municipality cascade
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [cityWards, setCityWards] = useState<Constituency[]>([]);
  const [selectedCityWard, setSelectedCityWard] = useState<Constituency | null>(null);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingCityWards, setLoadingCityWards] = useState(false);

  // GP cascade
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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)',
      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)' },
      '&:hover fieldset': { borderColor: 'rgba(245,168,0,0.45)' },
      '&.Mui-focused fieldset': { borderColor: BRAND.yellow, borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)' },
    '& .MuiInputLabel-root.Mui-focused': { color: BRAND.yellow },
  };

  // ── On open: load options + pre-fill from current user ────────────────
  useEffect(() => {
    if (!open) return;
    setError(null);

    // Lok Sabha + State Assembly flat lists
    setLoadingLs(true);
    fetchConstituencies('lok_sabha')
      .then((resp) => setLokSabhaOptions(resp.data?.constituencies ?? []))
      .catch(() => setLokSabhaOptions([]))
      .finally(() => setLoadingLs(false));
    setLoadingSa(true);
    fetchConstituencies('state_assembly')
      .then((resp) => setStateAssemblyOptions(resp.data?.constituencies ?? []))
      .catch(() => setStateAssemblyOptions([]))
      .finally(() => setLoadingSa(false));

    // Municipalities list (used regardless — local body switch shows it)
    setLoadingMunicipalities(true);
    fetchMunicipalities()
      .then((resp) => setMunicipalities(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setMunicipalities([]))
      .finally(() => setLoadingMunicipalities(false));

    // GP states list
    setLoadingGpStates(true);
    fetchGPStates()
      .then((resp) => setGpStates(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpStates([]))
      .finally(() => setLoadingGpStates(false));

    // Pre-select local body based on what the user has saved.
    const u = user as any;
    if (u?.municipalCorporationConstituency?.id != null) setLocalBody('municipality');
    else if (u?.gramPanchayatConstituency != null) setLocalBody('gram_panchayat');
    else setLocalBody(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reactive pre-fill — runs once per open per field, then steps aside so
  // user edits stick. Without the one-shot refs, picking a new option would
  // trip the effect again and snap the autocomplete back to the saved id.
  const u = user as any;
  const savedLokSabhaId = u?.lokSabhaConstituency?.id ?? null;
  const savedStateAssemblyId = u?.stateAssemblyConstituency?.id ?? null;
  const savedMunicipal = u?.municipalCorporationConstituency ?? null;
  const savedGp = u?.gramPanchayatConstituency ?? null;

  const lokSabhaResolvedRef = useRef(false);
  const stateAssemblyResolvedRef = useRef(false);
  const municipalResolvedRef = useRef(false);
  const gpResolvedRef = useRef(false);

  // Reset the one-shot refs whenever the dialog opens, so reopening
  // re-applies the latest saved values.
  useEffect(() => {
    if (open) {
      lokSabhaResolvedRef.current = false;
      stateAssemblyResolvedRef.current = false;
      municipalResolvedRef.current = false;
      gpResolvedRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (lokSabhaResolvedRef.current) return;
    if (savedLokSabhaId == null || lokSabhaOptions.length === 0) return;
    const m = lokSabhaOptions.find((c) => c.id === savedLokSabhaId);
    if (m) {
      setLokSabha(m);
      lokSabhaResolvedRef.current = true;
    }
  }, [lokSabhaOptions, savedLokSabhaId]);

  useEffect(() => {
    if (stateAssemblyResolvedRef.current) return;
    if (savedStateAssemblyId == null || stateAssemblyOptions.length === 0) return;
    const m = stateAssemblyOptions.find((c) => c.id === savedStateAssemblyId);
    if (m) {
      setStateAssembly(m);
      stateAssemblyResolvedRef.current = true;
    }
  }, [stateAssemblyOptions, savedStateAssemblyId]);

  // Pre-select municipality from saved municipal object
  useEffect(() => {
    if (municipalResolvedRef.current) return;
    if (!savedMunicipal || !municipalities.length) return;
    const munName = savedMunicipal.municipality as string | undefined;
    if (!munName) return;
    const norm = (s: string) => s.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
    const m = municipalities.find((x) => norm(x.name) === norm(munName));
    if (m) {
      municipalResolvedRef.current = true;
      setSelectedMunicipality(m);
      setCityWards([savedMunicipal as Constituency]);
      setSelectedCityWard(savedMunicipal as Constituency);
    }
  }, [municipalities, savedMunicipal]);

  // Pre-select GP from saved GP nested object (srNo + villageName + parents)
  useEffect(() => {
    if (gpResolvedRef.current) return;
    if (!savedGp || !savedGp.srNo) return;
    gpResolvedRef.current = true;
    if (savedGp.state) setSelectedGpState(savedGp.state);
    if (savedGp.district) setSelectedGpDistrict(savedGp.district);
    if (savedGp.taluk) setSelectedGpTaluk(savedGp.taluk);
    if (savedGp.gpName) setSelectedGpGram(savedGp.gpName);
    if (savedGp.villageName) {
      const synth: GPVillage = {
        id: String(savedGp.srNo),
        villageName: savedGp.villageName,
        villageCode: '',
        population: '',
      };
      setGpVillages([synth]);
      setSelectedGpVillage(synth);
    }
  }, [savedGp]);

  // ── Cascading fetches ─────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedMunicipality) return;
    setLoadingCityWards(true);
    fetchConstituenciesByScope(selectedMunicipality.name)
      .then((resp) => setCityWards(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setCityWards([]))
      .finally(() => setLoadingCityWards(false));
  }, [selectedMunicipality]);

  useEffect(() => {
    if (!selectedGpState) {
      setGpDistricts([]);
      return;
    }
    setLoadingGpDistricts(true);
    fetchGPDistricts(selectedGpState)
      .then((resp) => setGpDistricts(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpDistricts([]))
      .finally(() => setLoadingGpDistricts(false));
  }, [selectedGpState]);

  useEffect(() => {
    if (!selectedGpState || !selectedGpDistrict) {
      setGpTaluks([]);
      return;
    }
    setLoadingGpTaluks(true);
    fetchGPTaluks(selectedGpState, selectedGpDistrict)
      .then((resp) => setGpTaluks(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpTaluks([]))
      .finally(() => setLoadingGpTaluks(false));
  }, [selectedGpState, selectedGpDistrict]);

  useEffect(() => {
    if (!selectedGpState || !selectedGpDistrict || !selectedGpTaluk) {
      setGpGrams([]);
      return;
    }
    setLoadingGpGrams(true);
    fetchGPGrams(selectedGpState, selectedGpDistrict, selectedGpTaluk)
      .then((resp) => setGpGrams(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpGrams([]))
      .finally(() => setLoadingGpGrams(false));
  }, [selectedGpState, selectedGpDistrict, selectedGpTaluk]);

  useEffect(() => {
    if (!selectedGpState || !selectedGpDistrict || !selectedGpTaluk || !selectedGpGram) {
      return;
    }
    setLoadingGpVillages(true);
    fetchGPVillages(selectedGpState, selectedGpDistrict, selectedGpTaluk, selectedGpGram)
      .then((resp) => setGpVillages(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpVillages([]))
      .finally(() => setLoadingGpVillages(false));
  }, [selectedGpState, selectedGpDistrict, selectedGpTaluk, selectedGpGram]);

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Cookie mode has no client-side token (the httpOnly cookie authenticates),
    // so gate on authentication, not `token` — otherwise the save silently
    // returns and the user's constituency change is never persisted.
    const isAuthed = COOKIE_AUTH ? useAuthStore.getState().isAuthenticated : Boolean(token);
    if (!isAuthed) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        lokSabhaConstituencyId: lokSabha?.id ?? null,
        stateAssemblyConstituencyId: stateAssembly?.id ?? null,
        municipalCorporationConstituencyId:
          localBody === 'municipality' ? (selectedCityWard?.id ?? null) : null,
        gramPanchayatConstituencyId:
          localBody === 'gram_panchayat' && selectedGpVillage?.id
            ? Number(selectedGpVillage.id)
            : null,
      };
      const { data } = await updateUserConstituencies(payload);
      setAuth(COOKIE_AUTH ? '' : (token ?? ''), data);
      // Belt-and-suspenders: re-pull /auth/me so nested objects reflect
      // exactly what the backend returns on next reads.
      fetchProfile?.().catch(() => {});
      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          t('common.error', { defaultValue: 'Failed to save.' }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: {
        sx: {
          bgcolor: isDark ? '#0d0b0b' : '#fffdfa',
          border: `1px solid ${isDark ? 'rgba(245,168,0,0.18)' : 'rgba(245,168,0,0.28)'}`,
          borderRadius: 3,
        },
      } }}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: '"Baloo 2", cursive',
        fontWeight: 800,
        fontSize: '1.1rem',
        color: isDark ? '#fff' : 'rgba(15,23,42,0.94)',
        pb: 1,
      }}>
        {t('pages.constituencyOnboarding.dialogTitle', { defaultValue: 'Update your constituencies' })}
        <IconButton onClick={onClose} disabled={submitting} size="small" sx={{ color: 'inherit' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.08)' }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: BRAND.yellow, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.6 }}>
              {t('profile.lokSabhaConstituency', { defaultValue: 'Lok Sabha Constituency' })}
            </Typography>
            <Autocomplete
              options={lokSabhaOptions}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={lokSabha}
              onChange={(_, v) => setLokSabha(v)}
              loading={loadingLs}
              renderInput={(params) => <TextField {...params} placeholder={t('common.select') || 'Select'} sx={fieldSx} />}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: BRAND.yellow, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.6 }}>
              {t('profile.stateAssemblyConstituency', { defaultValue: 'State Assembly Constituency' })}
            </Typography>
            <Autocomplete
              options={stateAssemblyOptions}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={stateAssembly}
              onChange={(_, v) => setStateAssembly(v)}
              loading={loadingSa}
              renderInput={(params) => <TextField {...params} placeholder={t('common.select') || 'Select'} sx={fieldSx} />}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: BRAND.yellow, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.6 }}>
              {t('pages.constituencyOnboarding.localBodyTitle', { defaultValue: 'Local Body' })}
            </Typography>
            <TextField
              select
              fullWidth
              slotProps={{ select: { native: true } }}
              value={localBody ?? ''}
              onChange={(e) => {
                const v = e.target.value as LocalBody | '';
                setLocalBody(v === '' ? null : (v as LocalBody));
              }}
              sx={fieldSx}
            >
              <option value="">{t('common.select') || 'Select'}</option>
              <option value="municipality">
                {t('pages.constituencyOnboarding.localBodyMunicipality', { defaultValue: 'Municipality' })}
              </option>
              <option value="gram_panchayat">
                {t('pages.constituencyOnboarding.localBodyGp', { defaultValue: 'Gram Panchayat' })}
              </option>
            </TextField>
          </Box>

          {localBody === 'municipality' && (
            <Stack spacing={1.5}>
              <Autocomplete
                options={municipalities}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={selectedMunicipality}
                onChange={(_, v) => {
                  setSelectedMunicipality(v);
                  setSelectedCityWard(null);
                }}
                loading={loadingMunicipalities}
                renderInput={(params) => (
                  <TextField {...params} label={t('forms.aspirant.municipality', { defaultValue: 'Corporation / Municipality' })} sx={fieldSx} />
                )}
              />
              <Autocomplete
                options={cityWards}
                getOptionLabel={(o) => `${o.number ? `${o.number} - ` : ''}${o.name}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={selectedCityWard}
                onChange={(_, v) => setSelectedCityWard(v)}
                disabled={!selectedMunicipality}
                loading={loadingCityWards}
                renderInput={(params) => (
                  <TextField {...params} label={t('pages.constituencyOnboarding.wardLabel', { defaultValue: 'City Corporation Ward' })} sx={fieldSx} />
                )}
              />
            </Stack>
          )}

          {localBody === 'gram_panchayat' && (
            <Stack spacing={1.5}>
              <Autocomplete
                options={gpStates}
                value={selectedGpState}
                onChange={(_, v) => {
                  setSelectedGpState(v);
                  setSelectedGpDistrict(null);
                  setSelectedGpTaluk(null);
                  setSelectedGpGram(null);
                  setSelectedGpVillage(null);
                }}
                loading={loadingGpStates}
                renderInput={(params) => <TextField {...params} label="State" sx={fieldSx} />}
              />
              <Autocomplete
                options={gpDistricts}
                value={selectedGpDistrict}
                onChange={(_, v) => {
                  setSelectedGpDistrict(v);
                  setSelectedGpTaluk(null);
                  setSelectedGpGram(null);
                  setSelectedGpVillage(null);
                }}
                disabled={!selectedGpState}
                loading={loadingGpDistricts}
                renderInput={(params) => <TextField {...params} label="District" sx={fieldSx} />}
              />
              <Autocomplete
                options={gpTaluks}
                value={selectedGpTaluk}
                onChange={(_, v) => {
                  setSelectedGpTaluk(v);
                  setSelectedGpGram(null);
                  setSelectedGpVillage(null);
                }}
                disabled={!selectedGpDistrict}
                loading={loadingGpTaluks}
                renderInput={(params) => <TextField {...params} label="Taluk" sx={fieldSx} />}
              />
              <Autocomplete
                options={gpGrams}
                value={selectedGpGram}
                onChange={(_, v) => {
                  setSelectedGpGram(v);
                  setSelectedGpVillage(null);
                }}
                disabled={!selectedGpTaluk}
                loading={loadingGpGrams}
                renderInput={(params) => <TextField {...params} label="Gram Panchayat" sx={fieldSx} />}
              />
              <Autocomplete
                options={gpVillages}
                getOptionLabel={(o) => o.villageName}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={selectedGpVillage}
                onChange={(_, v) => setSelectedGpVillage(v)}
                disabled={!selectedGpGram}
                loading={loadingGpVillages}
                renderInput={(params) => <TextField {...params} label="Village" sx={fieldSx} />}
              />
            </Stack>
          )}

          {error && (
            <Typography sx={{ color: 'rgba(255,80,80,0.95)', fontSize: '0.85rem' }}>
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)', textTransform: 'none' }}>
          {t('common.cancel') || 'Cancel'}
        </Button>
        <Button
          onClick={handleSave}
          disabled={submitting}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #F5A800 0%, #E02010 100%)',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            '&:hover': { background: 'linear-gradient(135deg, #F5A800 0%, #C0180A 100%)' },
            '&.Mui-disabled': { opacity: 0.6, color: '#fff' },
          }}
        >
          {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : (t('common.save') || 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConstituencyPickerDialog;
