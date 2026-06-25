import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Snackbar,
  Alert,
  Box,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  HowToVote as HowToVoteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { createAspirantSchema } from '../utils/validation';
import { fetchElections as fetchElectionsList, type Election } from '../services/electionService';
import { registerAspirant, type AspirantPayload, getAspirantById } from '../services/aspirantService';
import CandidateInformationStep from '../components/aspirant/CandidateInformationStep';

interface AspirantForm {
  name: string;
  manifesto: string;
  electionId: number | string;
  constituencyId: number | string;
  party?: string;
  age?: number | string;
  education?: string;
  occupation?: string;
  gender?: string;
  phone?: string;
  address?: string;
  instagramLink?: string;
  facebookLink?: string;
  linkedinLink?: string;
  twitterLink?: string;
  whatsappNumber?: string;
  // Detailed candidate responses are captured via the questionnaire `answers` array
}

const AspirantRegistrationPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, fetchProfile } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const SOP_AGREED_KEY = `aspirant_sop_agreed_${user?.id ?? 'guest'}`;
  const DECLARATION_KEY = `aspirant_declaration_${user?.id ?? 'guest'}`;
  const [answers, setAnswers] = useState<string[]>(Array(9).fill(''));
  const [aspirantResp, setAspirantResp] = useState<any | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // The Declaration step (SOP agreement + signature) is its own page now
  // (`/user/aspirants/declaration`). It must be completed before reaching this
  // Candidate Information page. If it isn't — and the user hasn't already
  // registered — send them back to the Declaration page (forwarding any
  // `?type=` query). An existing aspirant editing their details is allowed in.
  const declarationDone = (() => {
    try {
      const sop = localStorage.getItem(SOP_AGREED_KEY) === 'true';
      const raw = localStorage.getItem(DECLARATION_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const agreed = Boolean(parsed?.declarationChecks?.agreed);
      const signed = typeof parsed?.digitalSignature === 'string' && parsed.digitalSignature.trim().length > 0;
      return sop && agreed && signed;
    } catch { return false; }
  })();
  const mustRedirectToDeclaration = !user?.aspirantId && !declarationDone;
  useEffect(() => {
    if (mustRedirectToDeclaration) {
      navigate(`/user/aspirants/declaration${location.search}`, { replace: true });
    }
  }, [mustRedirectToDeclaration, location.search, navigate]);

  // Election type ref for dynamic age validation in yup schema
  const electionsRef = useRef<Election[]>([]);
  const electionIdRef = useRef<number | string>('');
  const aspirantFormSchema = useRef(createAspirantSchema(() => {
    const election = electionsRef.current.find((e) => String(e.id) === String(electionIdRef.current));
    return election?.type ?? '';
  })).current;

  const { register, reset, resetField, setValue, watch, getValues, trigger, setError: setFormError, clearErrors, formState: { errors } } = useForm<AspirantForm>({
    resolver: yupResolver(aspirantFormSchema) as unknown as Resolver<AspirantForm>,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: user?.name || t('forms.aspirant.defaults.name'),
      manifesto: '',
      electionId: '',
      constituencyId: '',
      party: 'Independent',
      age: user?.age?.toString() || '',
      address: (user as any)?.address || '',
      education: '',
      occupation: '',
      gender: user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase() : '',
      phone: user?.phone || '',
      // questionnaire-driven fields are not part of defaultValues
    }
  });

  // Keep election ref in sync for dynamic age validation (synchronous to avoid race conditions)
  const watchedElectionId = watch('electionId');
  electionIdRef.current = watchedElectionId;

  useEffect(() => {
    fetchElectionsList()
      .then((resp) => {
        const data = Array.isArray(resp.data) ? resp.data : [];
        electionsRef.current = data;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      try {
        // Set name
        if (user.name) {
          setValue('name', user.name);
        }
        // Set age from user data
        if (user.age) {
          setValue('age', user.age.toString());
        }
        // Set gender (capitalize first letter to match UI options)
        if (user.gender) {
          const capitalizedGender = user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase();
          setValue('gender', capitalizedGender);
        }
        // Set phone number
        if (user.phone) {
          setValue('phone', user.phone);
        }
        // Set address
        if ((user as any)?.address) {
          setValue('address', (user as any).address);
        }
      } catch (e) {
        console.warn('Failed to populate user data:', e);
      }
    }
  }, [user, setValue]);

  const DRAFT_KEY = `aspirant_registration_draft_${user?.id ?? 'guest'}`;

  useEffect(() => {
    const shouldResume = Boolean((location as any)?.state?.resume);
    if (!shouldResume) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const vals = parsed.values || {};
      Object.keys(vals).forEach((k) => {
        try { setValue(k as any, vals[k]); } catch (e) { /* ignore */ }
      });
      if (Array.isArray(parsed.answers)) setAnswers(parsed.answers);
      // clear resume state so navigating back doesn't re-trigger
      try { if ((location as any).state) (location as any).state.resume = false; } catch (e) { /* ignore */ }
      window.scrollTo(0, 0);
    } catch (e) {
      console.warn('Failed to load aspirant draft', e);
    }
  }, [DRAFT_KEY, location, setValue]);

  const watchedValues = watch();
  useEffect(() => {
    try {
      // L-SEC-2: never persist PII to localStorage. phone + address come from the
      // user's account (defaultValues above) and repopulate on reload, so dropping
      // them from the saved draft loses nothing for the user but keeps them out of
      // a store any XSS can read. The draft only needs the non-sensitive,
      // hand-entered fields.
      const { phone: _phone, address: _address, ...safeValues } = watchedValues;
      const payload = {
        values: safeValues,
        answers,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  }, [watchedValues, answers, DRAFT_KEY]);

  useEffect(() => {
    if (!aspirantResp?.id) return;

    // Only restore if form is empty (avoid overwriting user's current edits)
    const currentAnswers = answers.filter(a => a.trim().length > 0).length;
    if (currentAnswers > 0) return;

    try {
      if (aspirantResp.name) setValue('name', aspirantResp.name);
      if (aspirantResp.party) setValue('party', aspirantResp.party);
      if (aspirantResp.age) setValue('age', aspirantResp.age);
      if (aspirantResp.education) setValue('education', aspirantResp.education);
      if (aspirantResp.occupation) setValue('occupation', aspirantResp.occupation);
      if (aspirantResp.manifesto) setValue('manifesto', aspirantResp.manifesto);
      if (aspirantResp.address) setValue('address', aspirantResp.address);

      const backendAnswers = [
        aspirantResp.identityBackground || '',
        aspirantResp.resignationPledge || '',
        aspirantResp.noHighCommand || '',
        aspirantResp.technicalCompetence || '',
        aspirantResp.transparency || '',
        aspirantResp.emergencyProtocol || '',
        aspirantResp.expertConsultation || '',
        aspirantResp.voterFeedback || '',
        aspirantResp.primaryRule || ''
      ];

      const hasBackendAnswers = backendAnswers.some(a => a.trim().length > 0);
      if (hasBackendAnswers) {
        setAnswers(backendAnswers);
      }
    } catch (e) {
      console.warn('Failed to restore from aspirantResp', e);
    }
  }, [aspirantResp, setValue]);

  // Always scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const handleResetCandidateWritableFields = () => {
    resetField('phone', { defaultValue: user?.phone || '' });
    resetField('gender', {
      defaultValue: user?.gender
        ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase()
        : '',
    });
    resetField('age', { defaultValue: user?.age?.toString() || '' });
    resetField('address', { defaultValue: (user as any)?.address || '' });
    resetField('education', { defaultValue: '' });
    resetField('occupation', { defaultValue: '' });
    resetField('manifesto', { defaultValue: '' });
  };

  const handleNext = async () => {
    const valid = await trigger(['name', 'electionId', 'constituencyId', 'manifesto', 'party', 'age', 'education', 'occupation', 'address']);
    if (!valid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    await handleSubmitRegistration(false);
  };

  // Back returns to the Declaration page (the previous step). Flag the
  // navigation so the Declaration page does NOT auto-skip to Documents even
  // when an aspirant record already exists — the user explicitly went back.
  const handleBack = () => {
    navigate(`/user/aspirants/declaration${location.search}`, { state: { fromRegister: true } });
  };

  const handleHome = () => {
    navigate('/user/dashboard', { replace: true });
  };

  const handleSubmitRegistration = async (finalize = false) => {
    // Use getValues() rather than watchedValues — setValue() commits to RHF state synchronously,
    // but watched values lag by one render. Reading getValues() avoids a first-submit race where
    // constituencyId/electionId (just written by CandidateInformationStep.handleNextClick) hadn't
    // propagated to the watched snapshot.
    const values = getValues();

    setLoading(true);
    setError('');

    if (user?.aspirantId) {
      if (finalize) {
        setSuccessDialogOpen(true);
      } else {
        navigate('/user/aspirants/documents');
      }
      setLoading(false);
      return;
    }

    const payload: AspirantPayload = {
      name: values.name,
      electionId: values.electionId !== undefined && values.electionId !== '' ? Number(values.electionId) : undefined,
      constituencyId: values.constituencyId !== undefined && values.constituencyId !== '' ? Number(values.constituencyId) : undefined,
      party: values.party,
      age: values.age !== undefined && values.age !== null && values.age !== '' ? Number(values.age) : undefined,
      address: values.address,
      education: values.education,
      occupation: values.occupation,
      gender: values.gender,
      phone: values.phone ?? '',
      manifesto: values.manifesto,
      instagramLink: values.instagramLink || null,
      facebookLink: values.facebookLink || null,
      linkedinLink: values.linkedinLink || null,
      twitterLink: values.twitterLink || null,
      whatsappNumber: values.whatsappNumber || null,
      sopAgreed: true,
      identityBackground: answers[0] || '',
      resignationPledge: answers[1] || '',
      noHighCommand: answers[2] || '',
      technicalCompetence: answers[3] || '',
      transparency: answers[4] || '',
      emergencyProtocol: answers[5] || '',
      expertConsultation: answers[6] || '',
      voterFeedback: answers[7] || '',
      primaryRule: answers[8] || ''
    };

    // console.info('Submitting aspirant payload:', payload);

    try {
      const resp = await registerAspirant(payload);
      const data = resp?.data ?? resp;

      setAspirantResp(data);
      try {
        await fetchProfile();
      } catch (e) {
        console.warn('fetchProfile after aspirant register failed', e);
      }
      setOpen(true);
      if (finalize) {
        setSuccessDialogOpen(true);
        try {
          const key = `aspirant_registration_complete_${user?.id ?? 'guest'}`;
          try { localStorage.setItem(key, 'true'); } catch (e) { /* ignore */ }
          try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
        } catch (e) {
          // ignore
        }
      } else {
        navigate('/user/aspirants/documents');
      }
    } catch (err: any) {
      console.error('Aspirant registration error response:', err?.response?.data || err);

      const backendMessage = err?.response?.data?.message || err?.response?.data || err?.message;
      const errorMessage = String(backendMessage || '').toLowerCase();

      if (
        (typeof errorMessage === 'string' && (errorMessage.toLowerCase().includes('user already has an aspirant') || errorMessage.toLowerCase().includes('already has an aspirant') || errorMessage.toLowerCase().includes('already has an aspirant record') || errorMessage.toLowerCase().includes('already has an aspirant'))) ||
        err?.response?.status === 400 && String(err?.response?.data || '').toLowerCase().includes('already')
      ) {
        try {
          await fetchProfile();
          const aspirantId = (user && (user as any).aspirantId) ?? (aspirantResp?.id ?? null);
          const globalUser = (window as unknown as { __user?: { aspirantId?: number | string } }).__user;
          if (!aspirantId && globalUser?.aspirantId) {
            const fallbackId = globalUser.aspirantId;
            if (fallbackId) {
              try {
                const resp = await getAspirantById(Number(fallbackId));
                setAspirantResp(resp?.data ?? resp);
              } catch (e) {
                // ignore
              }
            }
          }

          const updatedAspirantId = (user && (user as any).aspirantId) ?? aspirantResp?.id ?? null;
          if (updatedAspirantId) {
            try {
              const resp = await getAspirantById(Number(updatedAspirantId));
              setAspirantResp(resp?.data ?? resp);
            } catch (e) {
              console.warn('Failed to fetch aspirant after profile refresh', e);
            }
          }

          if (finalize) {
            setSuccessDialogOpen(true);
            try {
              const key = `aspirant_registration_complete_${user?.id ?? 'guest'}`;
              try { localStorage.setItem(key, 'true'); } catch (e) { /* ignore */ }
              try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
            } catch (e) {
              // ignore
            }
          } else {
            navigate('/user/aspirants/documents');
          }
          return;
        } catch (profileErr) {
          console.error('Error refreshing profile after duplicate aspirant error:', profileErr);
        }
      }

      setError(backendMessage || t('forms.aspirant.messages.submitFailed'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // While the declaration guard is redirecting, render nothing to avoid a flash
  // of the candidate form.
  if (mustRedirectToDeclaration) return null;

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1, color: theme.palette.text.primary, fontFamily: "'Baloo 2', sans-serif" }}>
            {t('forms.aspirant.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: "'Baloo 2', sans-serif" }}>
            {t('forms.aspirant.formSubtitle')}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form>
        <CandidateInformationStep
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          trigger={trigger}
          setError={setFormError}
          clearErrors={clearErrors}
          reset={handleResetCandidateWritableFields}
          loading={loading}
          user={user}
          onNext={handleNext}
          onBack={handleBack}
          onCancel={handleHome}
        />
      </form>

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
        onClose={() => {
          setSuccessDialogOpen(false);
          reset();
          navigate('/user/dashboard', { replace: true });
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(6px)',
              background: 'rgba(0,0,0,0.74)',
            },
          },
          paper: {
            sx: {
              bgcolor: theme.palette.mode === 'dark' ? '#0D0F12' : '#FFFFFF',
              color: theme.palette.text.primary,
              borderRadius: '16px',
              overflow: 'hidden',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(245,168,0,0.22)' : '1px solid rgba(245,168,0,0.3)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 20px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset'
                : '0 20px 70px rgba(17,24,39,0.18), 0 0 0 1px rgba(15,23,42,0.04) inset',
              backgroundImage: theme.palette.mode === 'dark'
                ? 'linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)'
                : 'linear-gradient(rgba(17,24,39,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(17,24,39,.02) 1px,transparent 1px)',
              backgroundSize: '44px 44px',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', height: '4px' }}>
          {['#C8180A', '#253A9A', '#6B3A00'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
        </Box>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Box
            sx={{
              width: 78,
              height: 78,
              borderRadius: '50%',
              mx: 'auto',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg,rgba(200,24,10,0.22),rgba(245,168,0,0.16))',
              border: '1.5px solid rgba(245,168,0,0.45)',
              '@keyframes votePulse': {
                '0%,100%': { boxShadow: '0 0 0 0 rgba(245,168,0,0.0), 0 0 22px rgba(200,24,10,0.22)' },
                '50%': { boxShadow: '0 0 0 8px rgba(245,168,0,0.06), 0 0 34px rgba(245,168,0,0.35)' },
              },
              animation: 'votePulse 2.4s ease-in-out infinite',
            }}
          >
            <HowToVoteIcon sx={{ fontSize: 42, color: '#F5A800' }} />
          </Box>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {t('forms.aspirant.successDialog.title')}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2, px: { xs: 3, sm: 5 } }}>
          <Typography variant="body1" sx={{ mb: 1, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.74)' }}>
            {t('forms.aspirant.successDialog.message')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.88)' : 'rgba(15,23,42,0.9)' }}>
            {t('forms.aspirant.successDialog.thanks')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              setSuccessDialogOpen(false);
              reset();
              navigate('/user/dashboard', { replace: true });
            }}
            sx={{
              px: 4,
              fontWeight: 800,
              color: '#fff',
              borderRadius: '10px',
              background: 'linear-gradient(135deg,#C8180A 0%,#F5A800 100%)',
              boxShadow: '0 8px 28px rgba(200,24,10,0.38)',
              '&:hover': {
                background: 'linear-gradient(135deg,#df210f 0%,#ffbe1a 100%)',
                boxShadow: '0 10px 34px rgba(200,24,10,0.52)',
              },
            }}
          >
            {t('common.ok')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AspirantRegistrationPage;
