import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import DeclarationStep from '../components/aspirant/DeclarationStep';

/**
 * Standalone Declaration page — step 0 of aspirant registration, split out from
 * AspirantRegistrationPage into its own route (`/user/aspirants/declaration`).
 * The user agrees to the SOP + declaration and signs here, then continues to the
 * Candidate Information page (`/user/aspirants/register`). Declaration values are
 * persisted to localStorage so navigating to /user/sop (and back) keeps them.
 */
const AspirantDeclarationPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const SOP_AGREED_KEY = `aspirant_sop_agreed_${user?.id ?? 'guest'}`;
  const DECLARATION_KEY = `aspirant_declaration_${user?.id ?? 'guest'}`;

  const [sopAgreed, setSopAgreed] = useState<boolean>(() => {
    try { return localStorage.getItem(SOP_AGREED_KEY) === 'true'; } catch { return false; }
  });
  const [declarationChecks, setDeclarationChecks] = useState<{ agreed: boolean }>(() => {
    try {
      const raw = localStorage.getItem(DECLARATION_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return { agreed: Boolean(parsed?.declarationChecks?.agreed) };
    } catch { return { agreed: false }; }
  });
  const [digitalSignature, setDigitalSignature] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(DECLARATION_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return typeof parsed?.digitalSignature === 'string' ? parsed.digitalSignature : '';
    } catch { return ''; }
  });

  // An already-registered aspirant only needs to finish documents — skip the
  // declaration and send them straight to the Documents page. EXCEPT when the
  // user explicitly came back here from the Candidate Information page (Back
  // button), in which case they want to review the declaration — don't bounce.
  const cameFromRegister = Boolean((location.state as any)?.fromRegister);
  const hasSkippedToDocsRef = useRef(false);
  useEffect(() => {
    if (user?.aspirantId && !cameFromRegister && !hasSkippedToDocsRef.current) {
      hasSkippedToDocsRef.current = true;
      navigate('/user/aspirants/documents', { replace: true });
    }
  }, [user?.aspirantId, cameFromRegister, navigate]);

  // Re-read sopAgreed when returning from /user/sop
  useEffect(() => {
    try { setSopAgreed(localStorage.getItem(SOP_AGREED_KEY) === 'true'); } catch { /* ignore */ }
  }, [location.key, SOP_AGREED_KEY]);

  const handleSopAgreedChange = (v: boolean) => {
    setSopAgreed(v);
    try {
      if (v) localStorage.setItem(SOP_AGREED_KEY, 'true');
      else localStorage.removeItem(SOP_AGREED_KEY);
    } catch { /* ignore */ }
  };

  // Persist declaration fields so the /user/sop round-trip doesn't reset them
  useEffect(() => {
    try {
      localStorage.setItem(DECLARATION_KEY, JSON.stringify({ digitalSignature, declarationChecks }));
    } catch { /* ignore */ }
  }, [digitalSignature, declarationChecks, DECLARATION_KEY]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const canProceed =
    declarationChecks.agreed &&
    digitalSignature.trim().length > 0 &&
    sopAgreed;

  const handleContinue = () => {
    // Forward any `?type=` query (e.g. from "Register as Aspirant" on a specific
    // election tab) to the Candidate Information page so it opens on that tab.
    // Pass `resume: true` so the register page restores any draft the user had
    // already typed — otherwise going Declaration → Register wipes fields like
    // education/occupation/about that aren't backed by the user profile.
    navigate(`/user/aspirants/register${location.search}`, { state: { resume: true } });
  };

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

      <DeclarationStep
        sopAgreed={sopAgreed}
        setSopAgreed={handleSopAgreedChange}
        onSopClick={() => navigate('/user/sop', { state: { from: 'aspirant-registration' } })}
        declarationChecks={declarationChecks}
        setDeclarationChecks={setDeclarationChecks}
        digitalSignature={digitalSignature}
        setDigitalSignature={setDigitalSignature}
        canProceed={canProceed}
        loading={false}
        onBack={() => navigate(-1)}
        onSubmit={handleContinue}
        onCancel={() => navigate('/user/dashboard', { replace: true })}
      />
    </Stack>
  );
};

export default AspirantDeclarationPage;
