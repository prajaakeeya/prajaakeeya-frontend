import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import MuiSwitch from '@mui/material/Switch';

const BigSwitch = styled(MuiSwitch)({
    width: 44,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 3,
        color: '#fff',
        '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#3dbd4e',
                opacity: 1,
                border: '2px solid #2ea83e',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        width: 18,
        height: 18,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.6)',
        background: 'radial-gradient(circle at 35% 35%, #ffffff, #d8d8d8)',
    },
    '& .MuiSwitch-track': {
        borderRadius: 24,
        backgroundColor: '#d32f2f',
        border: '2px solid #b71c1c',
        opacity: 1,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.25)',
    },
});
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Stack,
    Alert,
    CircularProgress,
    MenuItem,
    Avatar,
    Grid,
    Snackbar,
    IconButton,
    Menu,
    useTheme,
    InputAdornment,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
} from '@mui/material';
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

type Municipality = { id: number; name: string; state: string };
import { BRAND } from '../theme';
import {
    Person as PersonIcon,
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon,
    Logout as LogoutIcon,
    DeleteForever as DeleteForeverIcon,
    Warning as WarningIcon,
    AutoAwesome as AutoAwesomeIcon,
    WhatsApp as WhatsAppIcon,
    Phone as PhoneIcon,
    Forum as ForumIcon,
} from '@mui/icons-material';
import { Edit as EditIcon, Instagram as InstagramIcon, Facebook as FacebookIcon, LinkedIn as LinkedInIcon, X as XIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuthStore from '../store/useAuthStore';
import apiClient from '../services/apiClient';
import { uploadProfilePicture } from '../services/mediaService';
import { isProfileComplete } from '../utils/profileUtils';
import useSnackbar from '../hooks/useSnackbar';
import SelfieLivenessCapture from '../components/SelfieLivenessCapture';

interface ProfileForm {
    name: string;
    age?: number;
    gender?: string;
    education?: string;
    occupation?: string;
    phone?: string;
    address?: string;
    manifesto?: string;
    instagramLink?: string;
    facebookLink?: string;
    linkedinLink?: string;
    twitterLink?: string;
    whatsappNumber?: string;
}

const ProfileCompletionPage = ({ hideLogout }: { hideLogout?: boolean } = {}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, fetchProfile, logout } = useAuthStore();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const { message, open, severity, showMessage, close } = useSnackbar();
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [livenessOpen, setLivenessOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [photoMenuAnchor, setPhotoMenuAnchor] = useState<HTMLElement | null>(null);

    const [aspirantDocStatus, setAspirantDocStatus] = useState<string | null>(null);
    const isAspirant = user?.role === 'aspirant' && aspirantDocStatus === 'completed';
    const [contactWhatsapp, setContactWhatsapp] = useState(false);
    const [contactPhoneCall, setContactPhoneCall] = useState(false);
    const [contactChat, setContactChat] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Constituency selections — flat lists for Lok Sabha + State Assembly,
    // cascading flows for Municipal Corporation (Municipality → Ward) and
    // Gram Panchayat (State → District → Taluk → GP → Village). The leaf IDs
    // are what get sent to /users/me; the cascades are only there so the user
    // can re-pick (we can't reverse-resolve the parents from a single saved id).
    const [lokSabhaOptions, setLokSabhaOptions] = useState<Constituency[]>([]);
    const [stateAssemblyOptions, setStateAssemblyOptions] = useState<Constituency[]>([]);
    const [lokSabhaConstituency, setLokSabhaConstituency] = useState<Constituency | null>(null);
    const [stateAssemblyConstituency, setStateAssemblyConstituency] = useState<Constituency | null>(null);
    const [loadingConstituencies, setLoadingConstituencies] = useState(false);

    // Municipal cascade
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
    const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
    const [cityWards, setCityWards] = useState<Constituency[]>([]);
    const [loadingCityWards, setLoadingCityWards] = useState(false);
    const [selectedCityWard, setSelectedCityWard] = useState<Constituency | null>(null);

    // Gram Panchayat cascade
    const [gpStates, setGpStates] = useState<string[]>([]);
    const [gpDistricts, setGpDistricts] = useState<string[]>([]);
    const [gpTaluks, setGpTaluks] = useState<string[]>([]);
    const [gpGrams, setGpGrams] = useState<string[]>([]);
    const [gpVillages, setGpVillages] = useState<GPVillage[]>([]);
    const [loadingGp, setLoadingGp] = useState(false);
    const [selectedGpState, setSelectedGpState] = useState<string | null>(null);
    const [selectedGpDistrict, setSelectedGpDistrict] = useState<string | null>(null);
    const [selectedGpTaluk, setSelectedGpTaluk] = useState<string | null>(null);
    const [selectedGpGram, setSelectedGpGram] = useState<string | null>(null);
    const [selectedGpVillage, setSelectedGpVillage] = useState<GPVillage | null>(null);

    // Local body choice — a person lives in either a municipality (urban) OR
    // a gram panchayat (rural), never both, so we only let them edit one side.
    const [localBody, setLocalBody] = useState<'municipality' | 'gram_panchayat' | null>(null);

    // Raw IDs from /auth/me — preserved if the user doesn't touch the cascade
    // so saving doesn't accidentally clear an existing value.
    const initialIdsRef = useRef<{
        lokSabha?: number | null;
        stateAssembly?: number | null;
        municipal?: number | null;
        gramPanchayat?: number | null;
    }>({});
    // Full saved municipal corp object from /auth/me — has the parent
    // `municipality` name we need to pre-select the municipality dropdown
    // without doing an extra wards-list fetch + ID lookup.
    const initialMunicipalRef = useRef<any | null>(null);

    // Form validation schema
    const schema = useMemo(() => yup.object({
        name: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
        age: yup.number().transform((v, o) => (o === '' ? undefined : v)).optional(),
        gender: yup.string().optional(),
        education: yup.string().optional(),
        occupation: yup.string().optional(),
        phone: yup.string().optional().test(
            'phone-format',
            'validation.phone',
            (value) => !value || value.trim() === '' || /^[6-9]\d{9}$/.test(value)
        ),
        address: yup.string().optional(),
        manifesto: yup.string().optional(),
        instagramLink: yup.string().optional(),
        facebookLink: yup.string().optional(),
        linkedinLink: yup.string().optional(),
    }), []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm<ProfileForm>({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            name: user?.name || ''
        }
    });
    const watchedGender = watch('gender');
    const watchedPhone = watch('phone');
    const watchedWhatsappNumber = watch('whatsappNumber');
    const { ref: phoneInputRef, ...phoneRegisterProps } = register('phone');

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                setError(t('profile.fileTooLarge', { defaultValue: 'Upload Failed. File is too large. Please upload a file under 20MB.' }));
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleLivenessCaptured = (file: File) => {
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        setLivenessOpen(false);
    };

    // Update name when user data changes — skip for aspirants as their name comes from /aspirants/{id}
    useEffect(() => {
        if (user && user.role !== 'aspirant') {
            setValue('name', user.name || '');
        }
    }, [user, setValue]);

    // On mount, fetch profile — aspirants get extra data from /aspirants/{id}
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setInitialLoading(true);

                // Always fetch /auth/me to get base user data (including aspirantId)
                const meResp = await apiClient.get('/auth/me');
                const me = meResp?.data;
                if (me) {
                    setValue('name', me.name || me.nameEn || me.nameKn || '');
                    setPhotoPreview(me.profilePicture || null);
                    initialIdsRef.current = {
                        lokSabha: me.lokSabhaConstituency?.id ?? null,
                        stateAssembly: me.stateAssemblyConstituency?.id ?? null,
                        municipal: me.municipalCorporationConstituency?.id ?? null,
                        // GP uses `srNo` rather than `id` as the village identifier.
                        gramPanchayat: me.gramPanchayatConstituency?.srNo ?? null,
                    };
                    initialMunicipalRef.current = me.municipalCorporationConstituency ?? null;
                    // Pre-select the local body type from whichever side is
                    // saved (a user can only have one — municipality OR GP).
                    if (me.municipalCorporationConstituency != null) {
                        setLocalBody('municipality');
                    } else if (me.gramPanchayatConstituency != null) {
                        setLocalBody('gram_panchayat');
                    }
                }

                // Refresh the auth store in parallel
                if (fetchProfile) {
                    fetchProfile().catch(() => {});
                }

                // If aspirant, fetch detailed data from /aspirants/{id}
                const aspirantId = me?.aspirantId;
                if (me?.role === 'aspirant' && aspirantId) {
                    const aspirantResp = await apiClient.get(`/aspirants/${aspirantId}`);
                    const a = aspirantResp?.data;
                    if (a) {
                        if (a.name) setValue('name', a.name);
                        if (a.age != null) setValue('age', a.age);
                        if (a.gender) setValue('gender', a.gender);
                        if (a.education) setValue('education', a.education);
                        if (a.occupation) setValue('occupation', a.occupation);
                        if (a.phone) setValue('phone', a.phone);
                        if (a.address) setValue('address', a.address);
                        if (a.manifesto) setValue('manifesto', a.manifesto);
                        if (a.instagramLink) setValue('instagramLink', a.instagramLink);
                        if (a.facebookLink) setValue('facebookLink', a.facebookLink);
                        if (a.linkedinLink) setValue('linkedinLink', a.linkedinLink);
                        if (a.twitterLink) setValue('twitterLink', a.twitterLink);
                        if (a.whatsappNumber) setValue('whatsappNumber', a.whatsappNumber);
                        // Load contact permissions from aspirant data
                        if (a.allowWhatsapp != null) setContactWhatsapp(a.allowWhatsapp);
                        if (a.allowPhone != null) setContactPhoneCall(a.allowPhone);
                        if (a.allowChat != null) setContactChat(a.allowChat);
                        if (a.documentStatus) setAspirantDocStatus(a.documentStatus);
                    }
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
            } finally {
                setInitialLoading(false);
            }
        };

        loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch the flat lists for Lok Sabha + State Assembly once on mount.
    // Municipal Corporation & Gram Panchayat use cascading dropdowns below.
    useEffect(() => {
        let cancelled = false;
        setLoadingConstituencies(true);
        Promise.all([
            fetchConstituencies('lok_sabha').catch(() => ({ data: { constituencies: [] } as any })),
            fetchConstituencies('state_assembly').catch(() => ({ data: { constituencies: [] } as any })),
        ])
            .then(([ls, sa]) => {
                if (cancelled) return;
                setLokSabhaOptions(ls?.data?.constituencies ?? []);
                setStateAssemblyOptions(sa?.data?.constituencies ?? []);
            })
            .finally(() => {
                if (!cancelled) setLoadingConstituencies(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Pre-select Lok Sabha / State Assembly reactively. Reading from the auth
    // store user avoids the race where the options fetch finished before
    // /auth/me populated initialIdsRef.current — symptom: dropdowns showed
    // their label but no value even though /auth/me had the ID.
    // One-shot refs ensure the pre-fill runs only until the saved value is
    // applied; otherwise the effect re-runs on every user pick and snaps the
    // dropdown back to the saved ID.
    const lokSabhaIdFromUser = (user as any)?.lokSabhaConstituency?.id as number | null | undefined;
    const stateAssemblyIdFromUser = (user as any)?.stateAssemblyConstituency?.id as number | null | undefined;
    const lokSabhaResolvedRef = useRef(false);
    const stateAssemblyResolvedRef = useRef(false);
    useEffect(() => {
        if (lokSabhaResolvedRef.current) return;
        if (lokSabhaIdFromUser == null) return;
        if (lokSabhaOptions.length === 0) return;
        const m = lokSabhaOptions.find((c) => c.id === lokSabhaIdFromUser);
        if (m) {
            setLokSabhaConstituency(m);
            lokSabhaResolvedRef.current = true;
        }
    }, [lokSabhaOptions, lokSabhaIdFromUser]);
    useEffect(() => {
        if (stateAssemblyResolvedRef.current) return;
        if (stateAssemblyIdFromUser == null) return;
        if (stateAssemblyOptions.length === 0) return;
        const m = stateAssemblyOptions.find((c) => c.id === stateAssemblyIdFromUser);
        if (m) {
            setStateAssemblyConstituency(m);
            stateAssemblyResolvedRef.current = true;
        }
    }, [stateAssemblyOptions, stateAssemblyIdFromUser]);

    // Municipality list — loaded on mount so the dropdown is ready to use.
    useEffect(() => {
        let cancelled = false;
        setLoadingMunicipalities(true);
        fetchMunicipalities()
            .then((resp) => {
                if (cancelled) return;
                setMunicipalities(Array.isArray(resp.data) ? resp.data : []);
            })
            .catch(() => {
                if (!cancelled) setMunicipalities([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingMunicipalities(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Wards for the currently selected municipality.
    useEffect(() => {
        if (!selectedMunicipality) {
            setCityWards([]);
            return;
        }
        let cancelled = false;
        setLoadingCityWards(true);
        fetchConstituenciesByScope(selectedMunicipality.name)
            .then((resp) => {
                if (cancelled) return;
                setCityWards(Array.isArray(resp.data) ? resp.data : []);
            })
            .catch(() => {
                if (!cancelled) setCityWards([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingCityWards(false);
            });
        return () => {
            cancelled = true;
        };
    }, [selectedMunicipality]);

    // Pre-fill the Municipal Corporation cascade from the saved nested object
    // on /auth/me — it already carries `municipality`, `name`, `number`, etc.,
    // so we can resolve without an extra wards-list fetch. Read from the auth
    // store user (reactive) rather than initialMunicipalRef so the effect
    // re-runs when /auth/me lands after the municipalities list does.
    const savedMunicipal =
        (initialMunicipalRef.current as any) ??
        ((user as any)?.municipalCorporationConstituency as any) ??
        null;
    const municipalResolvedRef = useRef(false);
    useEffect(() => {
        if (municipalResolvedRef.current) return;
        if (selectedMunicipality || selectedCityWard) return;
        if (!savedMunicipal || savedMunicipal.id == null) return;
        if (!municipalities.length) return;
        const munName = savedMunicipal.municipality as string | undefined;
        if (!munName) return;

        const norm = (s: string) =>
            s.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
        const munObj = municipalities.find((m) => norm(m.name) === norm(munName));
        if (!munObj) return;

        municipalResolvedRef.current = true;
        setSelectedMunicipality(munObj);
        // The scoped-fetch effect on `selectedMunicipality` will load the full
        // wards list; meanwhile seed the dropdown with the saved ward so it
        // displays immediately.
        setCityWards([savedMunicipal as Constituency]);
        setSelectedCityWard(savedMunicipal as Constituency);
    }, [municipalities, selectedMunicipality, selectedCityWard, savedMunicipal]);

    // Gram Panchayat cascade — load states up front; the rest cascade on demand.
    useEffect(() => {
        let cancelled = false;
        setLoadingGp(true);
        fetchGPStates()
            .then((resp) => {
                if (cancelled) return;
                setGpStates(Array.isArray(resp.data) ? resp.data : []);
            })
            .catch(() => {
                if (!cancelled) setGpStates([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingGp(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!selectedGpState) {
            setGpDistricts([]);
            return;
        }
        setLoadingGp(true);
        fetchGPDistricts(selectedGpState)
            .then((resp) => setGpDistricts(Array.isArray(resp.data) ? resp.data : []))
            .catch(() => setGpDistricts([]))
            .finally(() => setLoadingGp(false));
    }, [selectedGpState]);

    useEffect(() => {
        if (!selectedGpState || !selectedGpDistrict) {
            setGpTaluks([]);
            return;
        }
        setLoadingGp(true);
        fetchGPTaluks(selectedGpState, selectedGpDistrict)
            .then((resp) => setGpTaluks(Array.isArray(resp.data) ? resp.data : []))
            .catch(() => setGpTaluks([]))
            .finally(() => setLoadingGp(false));
    }, [selectedGpState, selectedGpDistrict]);

    useEffect(() => {
        if (!selectedGpState || !selectedGpDistrict || !selectedGpTaluk) {
            setGpGrams([]);
            return;
        }
        setLoadingGp(true);
        fetchGPGrams(selectedGpState, selectedGpDistrict, selectedGpTaluk)
            .then((resp) => setGpGrams(Array.isArray(resp.data) ? resp.data : []))
            .catch(() => setGpGrams([]))
            .finally(() => setLoadingGp(false));
    }, [selectedGpState, selectedGpDistrict, selectedGpTaluk]);

    useEffect(() => {
        if (
            !selectedGpState ||
            !selectedGpDistrict ||
            !selectedGpTaluk ||
            !selectedGpGram
        ) {
            setGpVillages([]);
            return;
        }
        setLoadingGp(true);
        fetchGPVillages(selectedGpState, selectedGpDistrict, selectedGpTaluk, selectedGpGram)
            .then((resp) => setGpVillages(Array.isArray(resp.data) ? resp.data : []))
            .catch(() => setGpVillages([]))
            .finally(() => setLoadingGp(false));
    }, [selectedGpState, selectedGpDistrict, selectedGpTaluk, selectedGpGram]);

    // Pre-fill the Gram Panchayat cascade from the saved nested object on
    // /auth/me. The GP nested shape carries the full hierarchy
    // (state/district/taluk/gpName + srNo + villageName), so we seed each
    // upper-level string directly. The existing cascade effects fetch the
    // list for the next level, and the village picker waits for its options
    // to load, then matches by villageName (or srNo as fallback).
    const gpResolvedRef = useRef(false);
    const savedGp = (user as any)?.gramPanchayatConstituency ?? null;
    useEffect(() => {
        if (gpResolvedRef.current) return;
        if (!savedGp || !savedGp.srNo) return;
        gpResolvedRef.current = true;
        if (savedGp.state) setSelectedGpState(savedGp.state);
        if (savedGp.district) setSelectedGpDistrict(savedGp.district);
        if (savedGp.taluk) setSelectedGpTaluk(savedGp.taluk);
        if (savedGp.gpName) setSelectedGpGram(savedGp.gpName);
    }, [savedGp]);
    // Once the villages list arrives for the saved GP, select the matching
    // village so the Village dropdown renders the saved name.
    useEffect(() => {
        if (!savedGp || selectedGpVillage) return;
        if (!gpVillages.length) return;
        const match = gpVillages.find(
            (v) => v.villageName === savedGp.villageName || v.id === String(savedGp.srNo),
        );
        if (match) setSelectedGpVillage(match);
    }, [gpVillages, savedGp, selectedGpVillage]);

    // Delete profile picture
    const handleDeletePhoto = async () => {
        setPhotoMenuAnchor(null);
        try {
            await apiClient.delete('/media/profile-picture');
            setPhotoFile(null);
            setPhotoPreview(null);
            await fetchProfile();
            showMessage('Profile picture deleted successfully', 'success');
        } catch {
            setPhotoFile(null);
            setPhotoPreview(null);
            showMessage('Failed to delete photo', 'error');
        }
    };

    // Build the constituency payload. A user lives in either a Municipality
    // OR a Gram Panchayat — not both. The local-body picker decides which
    // side gets updated; the other is explicitly nulled so stale data doesn't
    // linger.
    const buildConstituencyPayload = () => {
        const base = {
            lokSabhaConstituencyId: lokSabhaConstituency?.id ?? null,
            stateAssemblyConstituencyId: stateAssemblyConstituency?.id ?? null,
        };
        if (localBody === 'municipality') {
            return {
                ...base,
                municipalCorporationConstituencyId:
                    selectedCityWard?.id ?? initialIdsRef.current.municipal ?? null,
                gramPanchayatConstituencyId: null,
            };
        }
        if (localBody === 'gram_panchayat') {
            return {
                ...base,
                municipalCorporationConstituencyId: null,
                gramPanchayatConstituencyId: selectedGpVillage?.id
                    ? Number(selectedGpVillage.id)
                    : (initialIdsRef.current.gramPanchayat ?? null),
            };
        }
        // No local body picked — preserve whatever was already saved.
        return {
            ...base,
            municipalCorporationConstituencyId: initialIdsRef.current.municipal ?? null,
            gramPanchayatConstituencyId: initialIdsRef.current.gramPanchayat ?? null,
        };
    };

    // Form submission
    const onSubmit = async (data: ProfileForm) => {

        setLoading(true);
        setError('');

        try {
            // Upload photo first if new photo is provided
            if (photoFile) {
                await uploadProfilePicture(photoFile);
            }

            // Update profile
            if (isAspirant && user?.aspirantId) {
                await apiClient.patch(`/aspirants/${user.aspirantId}`, {
                    ...(data.age !== undefined && { age: data.age }),
                    ...(data.gender && { gender: data.gender }),
                    ...(data.education && { education: data.education }),
                    ...(data.occupation && { occupation: data.occupation }),
                    phone: data.phone ?? '',
                    ...(data.address && { address: data.address }),
                    ...(data.manifesto && { manifesto: data.manifesto }),
                    ...(data.instagramLink && { instagramLink: data.instagramLink }),
                    ...(data.facebookLink && { facebookLink: data.facebookLink }),
                    ...(data.linkedinLink && { linkedinLink: data.linkedinLink }),
                    ...(data.twitterLink && { twitterLink: data.twitterLink }),
                    whatsappNumber: data.whatsappNumber ?? '',
                });

                // Save contact permissions via dedicated endpoint
                await apiClient.patch(`/aspirants/${user.aspirantId}/permissions`, {
                    allowWhatsapp: contactWhatsapp,
                    allowPhone: contactPhoneCall,
                    allowChat: contactChat,
                });
            } else {
                await apiClient.put('/users/me', {
                    name: data.name,
                    ...buildConstituencyPayload(),
                });
            }

            // For both aspirants and non-aspirants, the constituency IDs live on
            // the user record, so send them via /users/me. (Aspirants already
            // hit the aspirant PATCH above; this is a separate, additive call.)
            if (isAspirant) {
                await apiClient.put('/users/me', buildConstituencyPayload());
            }

            // Refresh profile to get updated data
            await fetchProfile();

            // Show success message
            setError('');
            showMessage('Profile updated successfully!', 'success');

            // Clear only the pending file, keep the preview visible
            setPhotoFile(null);

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                navigate('/user/dashboard', { replace: true });
            }, 1000);
        } catch (err: any) {
            const status = err?.response?.status;
            const errorMsg = (status === 413 || status === 502)
                ? t('profile.fileTooLarge', { defaultValue: 'Upload Failed. File is too large. Please upload a file under 2MB.' })
                : (err?.response?.data?.message || err?.message || 'Failed to update profile');
            setError(errorMsg);
            showMessage(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Auto-save a contact preference the moment its switch is toggled, instead
    // of waiting for the full profile submit. Optimistic: reflect the new value
    // immediately, PATCH the permissions endpoint, and revert if it fails. The
    // payload always carries all three flags, so toggling one never clobbers the
    // other two.
    const handleContactToggle = async (field: 'whatsapp' | 'phone' | 'chat', value: boolean) => {
        const prev = { whatsapp: contactWhatsapp, phone: contactPhoneCall, chat: contactChat };
        const next = { ...prev, [field]: value };

        // Optimistic UI.
        setContactWhatsapp(next.whatsapp);
        setContactPhoneCall(next.phone);
        setContactChat(next.chat);

        // Only fully-registered aspirants have a permissions record to persist to.
        if (!user?.aspirantId) return;

        try {
            await apiClient.patch(`/aspirants/${user.aspirantId}/permissions`, {
                allowWhatsapp: next.whatsapp,
                allowPhone: next.phone,
                allowChat: next.chat,
            });
        } catch (err: any) {
            // Revert the optimistic change on failure.
            setContactWhatsapp(prev.whatsapp);
            setContactPhoneCall(prev.phone);
            setContactChat(prev.chat);
            showMessage(
                err?.response?.data?.message ||
                    t('profile.permissionSaveFailed', { defaultValue: 'Failed to save preference. Please try again.' }),
                'error',
            );
        }
    };

    if (!user || initialLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'transparent'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Stack spacing={{ xs: 2, sm: 4 }} sx={{ bgcolor: 'background.default', minHeight: '65vh', p: 0, pb: { xs: 4, sm: 0 } }}>
            {/* Page Header */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.05 }}>
                    {t('profile.completeProfile') || 'My Profile'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280', fontSize: '1rem' }}>
                    {t('profile.subtitle') || 'View and update your profile information'}
                </Typography>
            </Box>
            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            <Card sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${isDark ? 'rgba(245,168,0,0.18)' : 'rgba(245,168,0,0.3)'}`,
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 12px 40px rgba(17,24,39,0.12)',
            }}>
                <CardContent sx={{ pt: 2, pb: '16px !important', px: { xs: 1.5, sm: 2.5 } }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2}>
                            {/* Avatar */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                        src={photoPreview || user?.profilePicture || undefined}
                                        sx={{
                                            width: { xs: 72, sm: 88 },
                                            height: { xs: 72, sm: 88 },
                                            border: `3px solid ${isDark ? '#1a1f2e' : '#ffffff'}`,
                                        }}
                                    >
                                        <PersonIcon sx={{ fontSize: 50 }} />
                                    </Avatar>
                                    {!isAspirant && (
                                    <IconButton
                                        aria-label={t('profile.editPhoto') || 'Edit photo'}
                                        onClick={(e) => setPhotoMenuAnchor(e.currentTarget)}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 2,
                                            right: 2,
                                            width: 28,
                                            height: 28,
                                            bgcolor: isDark ? '#1a1f2e' : '#fff',
                                            border: `2px solid ${BRAND.yellow}`,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                            '&:hover': { bgcolor: isDark ? '#252a3a' : '#f5f5f5' },
                                        }}
                                    >
                                        <EditIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                    )}
                                </Box>

                                {!isAspirant && (<>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    id="profile-photo-upload"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                                <Menu
                                    anchorEl={photoMenuAnchor}
                                    open={Boolean(photoMenuAnchor)}
                                    onClose={() => setPhotoMenuAnchor(null)}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                                    sx={{
                                        '& .MuiMenu-paper': { minWidth: 140 },
                                        '& .MuiMenuItem-root': { py: 0.5, px: 1, fontSize: '0.8rem', minHeight: 'auto' }
                                    }}
                                    slotProps={{ list: { sx: { py: 0.25 } } }}
                                >
                                    <MenuItem sx={{ py: 0.5, px: 1, fontSize: '0.8rem' }} onClick={() => { setLivenessOpen(true); setPhotoMenuAnchor(null); }}>
                                        {t('profile.takePhoto') || 'Take Photo'}
                                    </MenuItem>
                                    <MenuItem sx={{ py: 0.5, px: 1, fontSize: '0.8rem' }} onClick={() => { fileInputRef.current?.click(); setPhotoMenuAnchor(null); }}>
                                        {t('profile.uploadPhoto') || 'Upload Photo'}
                                    </MenuItem>
                                    {(photoPreview || user?.profilePicture) && (
                                        <MenuItem sx={{ py: 0.5, px: 1, fontSize: '0.8rem', color: 'error.main' }} onClick={handleDeletePhoto}>
                                            {t('profile.deletePhoto') || 'Delete Photo'}
                                        </MenuItem>
                                    )}
                                </Menu>
                                </>)}

                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1.2, color: 'text.primary' }}>
                                    {t('profile.profilePhoto') || 'Profile Photo'}
                                </Typography>

                                {photoFile && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "success.main",
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}>
                                        <CheckCircleIcon sx={{ fontSize: 14 }} /> {photoFile.name}
                                    </Typography>
                                )}
                            </Box>

                            {/* Form Fields */}
                            <Grid container spacing={2} sx={{
                                pl: { xs: 0, sm: 0 }, pr: { xs: 1.5, sm: 0 },
                                '& .MuiGrid-item': { pl: { xs: 1, sm: 2 } },
                                '& .MuiTextField-root': { boxSizing: 'border-box', width: '100%' },
                                '& .MuiInputLabel-root': { color: isDark ? '#fff' : '#000' },
                                '& .MuiInputLabel-root.Mui-focused': { color: isDark ? '#fff' : '#000' },
                                '& .MuiInputLabel-root.Mui-disabled': { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' },
                                '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(245,168,0,0.4)' : 'rgba(200,130,0,0.45)' },
                                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(245,168,0,0.7)' : 'rgba(200,130,0,0.75)' },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#F5A800' : '#c88200' },
                                '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(245,168,0,0.2)' : 'rgba(200,130,0,0.2)' },
                            }}>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={t('profile.fullName') || 'Full Name'}
                                        {...register('name')}
                                        error={!!errors.name}
                                        helperText={isAspirant ? (t('profile.nameReadOnly') || 'Name cannot be changed for aspirants') : errors.name?.message}
                                        slotProps={{ input: { readOnly: isAspirant } }}
                                        disabled={isAspirant}
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={t('profile.email') || 'Email'}
                                        value={user?.email || '-'}
                                        slotProps={{ input: { readOnly: true } }}
                                        disabled
                                    />
                                </Grid>
                                {/* Aspirant-only fields */}
                                {isAspirant && (<>
                                    <Grid size={6}>
                                        <TextField
                                            fullWidth size="small"
                                            label={t('profile.age')}
                                            type="number"
                                            {...register('age')}
                                            error={!!errors.age}
                                            helperText={errors.age?.message}
                                            slotProps={{
                                                htmlInput: { min: 18, max: 120 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={6}>
                                        <TextField
                                            fullWidth size="small" select
                                            label={t('profile.gender')}
                                            value={watchedGender || ''}
                                            {...register('gender')}
                                            error={!!errors.gender}
                                            helperText={errors.gender?.message}
                                        >
                                            <MenuItem value="Male">{t('profile.male')}</MenuItem>
                                            <MenuItem value="Female">{t('profile.female')}</MenuItem>
                                            <MenuItem value="Other">{t('profile.other')}</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid size={6}>
                                        <TextField fullWidth size="small" label={t('pages.candidateDetails.labels.education')} {...register('education')} />
                                    </Grid>
                                    <Grid size={6}>
                                        <TextField fullWidth size="small" label={t('pages.candidateDetails.labels.occupation')} {...register('occupation')} />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6
                                        }}>
                                        <TextField
                                            fullWidth size="small" label={t('profile.mobileNumber')}
                                            placeholder={t('profile.mobileNumberPlaceholder')}
                                            {...phoneRegisterProps}
                                            inputRef={phoneInputRef}
                                            error={!!errors.phone}
                                            helperText={errors.phone ? t(errors.phone.message || 'validation.phone') : undefined}
                                            slotProps={{ input: {
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ mr: 0.5 }}>
                                                        <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                    </InputAdornment>
                                                )
                                            } }}
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6
                                        }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={t('forms.aspirant.whatsappNumber')}
                                            {...register('whatsappNumber')}
                                            placeholder={t('profile.whatsappPlaceholder')}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start" sx={{ mr: 0.5 }}>
                                                            <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
                                                        </InputAdornment>
                                                    )
                                                },

                                                htmlInput: { maxLength: 10, inputMode: 'tel' as const }
                                            }} />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6
                                        }}>
                                        <TextField fullWidth size="small" label={t('forms.aspirant.instagramLink')} {...register('instagramLink')} placeholder="https://instagram.com/yourprofile"
                                            slotProps={{ input: {
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ mr: 0.5 }}>
                                                        <InstagramIcon fontSize="small" sx={{ color: '#E1306C' }} />
                                                    </InputAdornment>
                                                )
                                            } }}
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6
                                        }}>
                                        <TextField fullWidth size="small" label={t('forms.aspirant.facebookLink')} {...register('facebookLink')} placeholder="https://facebook.com/yourprofile"
                                            slotProps={{ input: {
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ mr: 0.5 }}>
                                                        <FacebookIcon fontSize="small" sx={{ color: '#1877F2' }} />
                                                    </InputAdornment>
                                                )
                                            } }}
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6
                                        }}>
                                        <TextField fullWidth size="small" label={t('forms.aspirant.linkedinLink')} {...register('linkedinLink')} placeholder="https://linkedin.com/in/yourprofile"
                                            slotProps={{ input: {
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ mr: 0.5 }}>
                                                        <LinkedInIcon fontSize="small" sx={{ color: '#0A66C2' }} />
                                                    </InputAdornment>
                                                )
                                            } }}
                                        />
                                    </Grid>
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6
                                        }}>
                                        <TextField fullWidth size="small" label={t('forms.aspirant.twitterLink')} {...register('twitterLink')} placeholder="https://twitter.com/yourprofile"
                                            slotProps={{ input: {
                                                startAdornment: (
                                                    <InputAdornment position="start" sx={{ mr: 0.5 }}>
                                                        <XIcon fontSize="small" sx={{ color: isDark ? '#fff' : '#000' }} />
                                                    </InputAdornment>
                                                )
                                            } }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label={t('pages.candidateDetails.labels.address')} {...register('address')} multiline rows={2} />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField fullWidth size="small" label={t('pages.candidateDetails.labels.about')} {...register('manifesto')} multiline rows={3} />
                                    </Grid>
                                    <Grid size={12}>
                                        <Box sx={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.18)'}`, borderRadius: 2, overflow: 'hidden' }}>
                                            <Box sx={{ px: 2, py: 1, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary' }}>
                                                    {t('profile.contactPreferences')}
                                                </Typography>
                                            </Box>
                                            {/* WhatsApp Row */}
                                            <Box sx={{ px: 2, py: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'rgba(37,211,102,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <WhatsAppIcon sx={{ fontSize: 20, color: '#25D366' }} />
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{t('profile.whatsapp')}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3, display: 'block' }}>
                                                            {t('profile.whatsappDesc')}
                                                        </Typography>
                                                        {watchedWhatsappNumber && (
                                                            <Typography variant="caption" sx={{ color: '#25D366', fontWeight: 600, lineHeight: 1.3, display: 'block' }}>
                                                                {watchedWhatsappNumber}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <BigSwitch
                                                    checked={contactWhatsapp}
                                                    onChange={(e) => handleContactToggle('whatsapp', e.target.checked)}
                                                />
                                            </Box>
                                            <Divider />
                                            {/* Phone Call Row */}
                                            <Box sx={{ px: 2, py: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <PhoneIcon sx={{ fontSize: 20, color: 'text.primary' }} />
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{t('profile.phoneCall')}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3, display: 'block' }}>
                                                            {t('profile.phoneCallDesc')}
                                                        </Typography>
                                                        {watchedPhone && (
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.3, display: 'block' }}>
                                                                {watchedPhone}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <BigSwitch
                                                    checked={contactPhoneCall}
                                                    onChange={(e) => handleContactToggle('phone', e.target.checked)}
                                                />
                                            </Box>
                                            <Divider />
                                            {/* Chat Row */}
                                            <Box sx={{ px: 2, py: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <ForumIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{t('profile.chat')}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3, display: 'block' }}>
                                                            {t('profile.chatDesc')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <BigSwitch
                                                    checked={contactChat}
                                                    onChange={(e) => handleContactToggle('chat', e.target.checked)}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </>)}

                                {/* Age — commented out */}
                                {/* <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={`${t('profile.age') || 'Age'} *`}
                                        type="number"
                                        {...register('age')}
                                        error={!!errors.age}
                                        helperText={errors.age?.message}
                                        inputProps={{ min: 18, max: 120 }}
                                    />
                                </Grid> */}
                                {/* Gender — commented out */}
                                {/* <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label={`${t('profile.gender') || 'Gender'} *`}
                                        {...register('gender')}
                                        value={watchedGender || ''}
                                        error={!!errors.gender}
                                        helperText={errors.gender?.message}
                                    >
                                        <MenuItem value="male">{t('profile.male') || 'Male'}</MenuItem>
                                        <MenuItem value="female">{t('profile.female') || 'Female'}</MenuItem>
                                        <MenuItem value="other">{t('profile.other') || 'Other'}</MenuItem>
                                    </TextField>
                                </Grid> */}
                                {/* Phone Number — commented out */}
                                {/* <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={isAspirant ? `${t('profile.mobileNumber') || 'Mobile Number'} *` : (t('profile.mobileNumber') || 'Mobile Number')}
                                        {...register('phone')}
                                        error={!!errors.phone}
                                        helperText={errors.phone?.message}
                                    />
                                </Grid> */}
                                {/* Voter ID — hidden */}
                                {/* <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('userRegister.epicId') || 'VOTER ID'}
                                        value={user?.epicId || user?.voterEpic || '-'}
                                        slotProps={{ input: {
                                            readOnly: true
                                        } }}
                                        disabled
                                    />
                                </Grid> */}
                                {/* Corporation — commented out */}
                                {/* <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('userDashboard.details.corporation') || 'Corporation'}
                                        value={`Bangalore - ${(user as any)?.corporationName ?? '-'}`}
                                        slotProps={{ input: {
                                            readOnly: true
                                        } }}
                                        disabled
                                    />
                                </Grid> */}
                                {/* Booth Name — hidden */}
                                {/* <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('userDashboard.details.booth') || 'Booth Name'}
                                        value={(user as any)?.psName || '-'}
                                        slotProps={{ input: {
                                            readOnly: true
                                        } }}
                                        disabled
                                    />
                                </Grid> */}

                                {/* Constituencies section */}
                                <Grid size={12}>
                                    <Typography
                                        sx={{
                                            mt: 1,
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.08em',
                                            color: '#F5A800',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {t('profile.myConstituencies') || 'My Constituencies'}
                                    </Typography>
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <Autocomplete
                                        fullWidth
                                        size="small"
                                        options={lokSabhaOptions}
                                        getOptionLabel={(o) =>
                                            `${o.number ? `${o.number} - ` : ''}${o.name}`
                                        }
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        value={lokSabhaConstituency}
                                        onChange={(_, v) => setLokSabhaConstituency(v)}
                                        loading={loadingConstituencies}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('profile.lokSabhaConstituency') || 'Lok Sabha Constituency'}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <Autocomplete
                                        fullWidth
                                        size="small"
                                        options={stateAssemblyOptions}
                                        getOptionLabel={(o) =>
                                            `${o.number ? `${o.number} - ` : ''}${o.name}`
                                        }
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        value={stateAssemblyConstituency}
                                        onChange={(_, v) => setStateAssemblyConstituency(v)}
                                        loading={loadingConstituencies}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('profile.stateAssemblyConstituency') || 'State Assembly Constituency'}
                                            />
                                        )}
                                    />
                                </Grid>
                                {/* Local Body picker — a person lives in either
                                    a Municipality (urban) OR a Gram Panchayat
                                    (rural), so only one of the two cascades is
                                    shown at a time. */}
                                <Grid size={12}>
                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            mb: 1,
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.06em',
                                            color: isDark
                                                ? 'rgba(255,255,255,0.55)'
                                                : 'rgba(17,24,39,0.55)',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {t('pages.constituencyOnboarding.localBodyTitle') || 'Local Body'}
                                    </Typography>
                                    <TextField
                                        select
                                        size="small"
                                        fullWidth
                                        value={localBody ?? ''}
                                        onChange={(e) => {
                                            const v = e.target.value as 'municipality' | 'gram_panchayat' | '';
                                            const next = v === '' ? null : v;
                                            setLocalBody(next);
                                            // Clear the *other* side's selection so it can't accidentally save.
                                            if (next === 'municipality') {
                                                setSelectedGpState(null);
                                                setSelectedGpDistrict(null);
                                                setSelectedGpTaluk(null);
                                                setSelectedGpGram(null);
                                                setSelectedGpVillage(null);
                                            } else if (next === 'gram_panchayat') {
                                                setSelectedMunicipality(null);
                                                setSelectedCityWard(null);
                                            }
                                        }}
                                    >
                                        <MenuItem value="municipality">
                                            {t('pages.constituencyOnboarding.localBodyMunicipality') || 'Municipality'}
                                        </MenuItem>
                                        <MenuItem value="gram_panchayat">
                                            {t('pages.constituencyOnboarding.localBodyGramPanchayat') || 'Gram Panchayat'}
                                        </MenuItem>
                                    </TextField>
                                </Grid>

                                {/* Municipal Corporation cascade: Municipality → Ward */}
                                {localBody === 'municipality' && (<>
                                <Grid size={12}>
                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.06em',
                                            color: isDark
                                                ? 'rgba(255,255,255,0.55)'
                                                : 'rgba(17,24,39,0.55)',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {t('profile.municipalCorporationConstituency') || 'Municipal Corporation / Ward'}
                                        {initialIdsRef.current.municipal != null && !selectedCityWard && (
                                            <Box
                                                component="span"
                                                sx={{
                                                    ml: 1,
                                                    color: '#F5A800',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    letterSpacing: 'normal',
                                                }}
                                            >
                                                · {t('profile.currentlySaved', { defaultValue: 'Currently saved — re-pick to change' })}
                                            </Box>
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <Autocomplete
                                        fullWidth
                                        size="small"
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
                                            <TextField
                                                {...params}
                                                label={t('pages.constituencyOnboarding.corporationLabel') || 'Corporation / Municipality'}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <Autocomplete
                                        fullWidth
                                        size="small"
                                        options={cityWards}
                                        getOptionLabel={(o) =>
                                            `${o.number ? `${o.number} - ` : ''}${o.name}`
                                        }
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        value={selectedCityWard}
                                        onChange={(_, v) => setSelectedCityWard(v)}
                                        loading={loadingCityWards}
                                        disabled={!selectedMunicipality}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('pages.constituencyOnboarding.wardLabel') || 'City Corporation Ward'}
                                            />
                                        )}
                                    />
                                </Grid>
                                </>)}

                                {/* Gram Panchayat cascade: State → District → Taluk → GP → Village */}
                                {localBody === 'gram_panchayat' && (<>
                                <Grid size={12}>
                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.06em',
                                            color: isDark
                                                ? 'rgba(255,255,255,0.55)'
                                                : 'rgba(17,24,39,0.55)',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {t('profile.gramPanchayatConstituency') || 'Gram Panchayat'}
                                        {initialIdsRef.current.gramPanchayat != null && !selectedGpVillage && (
                                            <Box
                                                component="span"
                                                sx={{
                                                    ml: 1,
                                                    color: '#F5A800',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    letterSpacing: 'normal',
                                                }}
                                            >
                                                · {t('profile.currentlySaved', { defaultValue: 'Currently saved — re-pick to change' })}
                                            </Box>
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <Autocomplete
                                        fullWidth
                                        size="small"
                                        options={gpStates}
                                        value={selectedGpState}
                                        onChange={(_, v) => {
                                            setSelectedGpState(v);
                                            setSelectedGpDistrict(null);
                                            setSelectedGpTaluk(null);
                                            setSelectedGpGram(null);
                                            setSelectedGpVillage(null);
                                        }}
                                        loading={loadingGp}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('pages.constituencyOnboarding.stateLabel') || 'State'}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <Autocomplete
                                        fullWidth
                                        size="small"
                                        options={gpDistricts}
                                        value={selectedGpDistrict}
                                        onChange={(_, v) => {
                                            setSelectedGpDistrict(v);
                                            setSelectedGpTaluk(null);
                                            setSelectedGpGram(null);
                                            setSelectedGpVillage(null);
                                        }}
                                        loading={loadingGp}
                                        disabled={!selectedGpState}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('pages.constituencyOnboarding.districtLabel') || 'District'}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <Autocomplete
                                        fullWidth
                                        size="small"
                                        options={gpTaluks}
                                        value={selectedGpTaluk}
                                        onChange={(_, v) => {
                                            setSelectedGpTaluk(v);
                                            setSelectedGpGram(null);
                                            setSelectedGpVillage(null);
                                        }}
                                        loading={loadingGp}
                                        disabled={!selectedGpDistrict}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('pages.constituencyOnboarding.talukLabel') || 'Taluk'}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <Autocomplete
                                        fullWidth
                                        size="small"
                                        options={gpGrams}
                                        value={selectedGpGram}
                                        onChange={(_, v) => {
                                            setSelectedGpGram(v);
                                            setSelectedGpVillage(null);
                                        }}
                                        loading={loadingGp}
                                        disabled={!selectedGpTaluk}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('pages.constituencyOnboarding.gpLabel') || 'Gram Panchayat'}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
                                    <Autocomplete
                                        fullWidth
                                        size="small"
                                        options={gpVillages}
                                        getOptionLabel={(o) => o.villageName}
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        value={selectedGpVillage}
                                        onChange={(_, v) => setSelectedGpVillage(v)}
                                        loading={loadingGp}
                                        disabled={!selectedGpGram}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('pages.constituencyOnboarding.villageLabel') || 'Village'}
                                            />
                                        )}
                                    />
                                </Grid>
                                </>)}
                            </Grid>

                            {/* Submit Button (placed in Grid so widths align with inputs) */}
                            <Grid container>
                                <Grid size={12}>
                                    <Box sx={{ mt: 1 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                            sx={{ boxSizing: 'border-box' }}
                                        >
                                            {loading ? (t('profile.saving') || 'Saving...') : (t('profile.saveProfile') || 'Update Profile')}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
            {/* Add Photo Frame */}
            {/* <Button
                variant="outlined"
                fullWidth
                startIcon={<AutoAwesomeIcon />}
                onClick={() => navigate('/user/dashboard', { state: { openPhotoFrame: true } })}
                sx={{
                    borderRadius: 50,
                    fontWeight: 700,
                    textTransform: 'none',
                    py: 1.4,
                    borderColor: 'rgba(245,168,0,0.4)',
                    color: 'text.primary',
                    '&:hover': { borderColor: '#F5A800', bgcolor: 'rgba(245,168,0,0.08)' },
                }}
            >
                {t('userDashboard.framePrompt.title', { defaultValue: 'Add Frame' })}
            </Button> */}
            {/* Mobile-only Logout button below card */}
            <Box sx={{ display: hideLogout ? 'none' : { xs: 'flex', sm: 'none' }, justifyContent: 'center', mt: 1 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={() => { logout(); navigate('/'); }}
                    sx={{
                        borderRadius: 50,
                        fontWeight: 700,
                        textTransform: 'none',
                        borderColor: 'rgba(245,168,0,0.4)',
                        color: 'text.secondary',
                        px: 3,
                        '&:hover': { borderColor: 'error.main', color: 'error.main', bgcolor: 'rgba(200,24,10,0.06)' },
                    }}
                >
                    {t('common.logout') || 'Logout'}
                </Button>
            </Box>
            {/* Delete Account button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{
                        borderRadius: 50,
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 3,
                        borderColor: 'rgba(211,47,47,0.4)',
                        color: 'error.main',
                        '&:hover': { borderColor: 'error.main', bgcolor: 'rgba(211,47,47,0.06)' },
                    }}
                >
                    {t('common.deleteMyAccount') || 'Delete My Account'}
                </Button>
            </Box>
            {/* Support contact line — hidden when embedded in the aspirant
                "My Profile" view (hideLogout); that view renders it at the very
                bottom, after its own logout button, instead. */}
            {!hideLogout && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 4 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '0.85rem' }}>
                        {t('profile.supportLine', { defaultValue: 'Facing an issue? Reach us at ' })}
                        <Box
                            component="a"
                            href="mailto:support@prajaakeeya.org"
                            sx={{ color: '#F5A800', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                            support@prajaakeeya.org
                        </Box>
                    </Typography>
                </Box>
            )}
            {/* Delete Account Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                    <WarningIcon color="error" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {isAspirant ? (t('common.withdrawAspirantTitle') || 'Withdraw Aspirant Registration') : (t('common.deleteAccountTitle') || 'Delete Account')}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {isAspirant ? (
                        <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                            {t('common.withdrawAspirantMessage') || 'Please withdraw your aspirant registration before deleting your account. You can withdraw below.'}
                        </Typography>
                    ) : (
                        <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                            {t('common.deleteAccountConfirm') || 'Are you sure you want to permanently delete your account? This action cannot be undone. All your data will be removed.'}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => {
                            setDeleteDialogOpen(false);
                            // For aspirants, the close button doubles as "take me to
                            // the Withdraw action" — scroll it into view on the page.
                            if (isAspirant) {
                                setTimeout(() => {
                                    document
                                        .getElementById('withdraw-application')
                                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                            }
                        }}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        {t('common.cancel') || 'Cancel'}
                    </Button>
                    {!isAspirant && (
                        <Button
                            variant="contained"
                            color="error"
                            disabled={deleteLoading}
                            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
                            onClick={async () => {
                                setDeleteLoading(true);
                                try {
                                    await apiClient.delete('/users/me');
                                    logout();
                                    navigate('/');
                                } catch (err: any) {
                                    showMessage(err?.response?.data?.message || 'Failed to delete account', 'error');
                                } finally {
                                    setDeleteLoading(false);
                                    setDeleteDialogOpen(false);
                                }
                            }}
                            size="small"
                            sx={{ textTransform: 'none', fontWeight: 700, py: 0.6 }}
                        >
                            {deleteLoading ? (t('common.deleting') || 'Deleting...') : (t('common.delete') || 'Delete')}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
            {/* Liveness Camera Modal */}
            {livenessOpen && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.88)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        p: 2
                    }}
                >
                    <Box sx={{ maxWidth: 480, width: '100%' }}>
                        <SelfieLivenessCapture
                            onCaptured={handleLivenessCaptured}
                            onError={(msg) => { setError(msg); setLivenessOpen(false); }}
                        />
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={() => setLivenessOpen(false)}
                                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}
            {/* Success/Error Snackbar */}
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={close}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={close} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </Stack>
    );
};

export default ProfileCompletionPage;
