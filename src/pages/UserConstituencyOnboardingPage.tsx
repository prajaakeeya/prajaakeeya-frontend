import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  SkipNext as SkipNextIcon,
  CheckCircle as CheckCircleIcon,
  LocationCity as LocationCityIcon,
  Spa as SpaIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
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
} from "../services/electionService";
import { updateUserConstituencies } from "../services/authService";
import { COOKIE_AUTH } from "../config/authMode";
import useAuthStore from "../store/useAuthStore";
import LanguageSelector from "../components/LanguageSelector";
import { BRAND } from "../theme";
import prajakeeyaLogo from "../assets/images/prajakeeya.webp";

type Municipality = { id: number; name: string; state: string };
type LocalBody = "municipality" | "gram_panchayat" | null;
type StepKey =
  | "lok_sabha"
  | "state_assembly"
  | "local_body"
  | "municipal_corporation"
  | "gram_panchayat";

interface OnboardingAnswers {
  lokSabha?: Constituency;
  stateAssembly?: Constituency;
  municipality?: Municipality;
  cityWard?: Constituency;
  gpState?: string;
  gpDistrict?: string;
  gpTaluk?: string;
  gpGram?: string;
  gpVillage?: GPVillage;
}

const STORAGE_KEY = "__USER_LOCATION_ANSWERS__";
// Set once the user has been through the onboarding wizard — whether they
// filled it in or skipped every step. The App.tsx onboarding guard reads this
// so a user who deliberately skipped all constituencies is let into the app
// instead of being bounced back to the wizard on every /user/* navigation.
export const ONBOARDING_DISMISSED_KEY = "__USER_LOCATION_ONBOARDED__";

const UserConstituencyOnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const fetchProfileFn = useAuthStore((s) => s.fetchProfile);

  // Onboarding is only shown when all four constituency IDs are null.
  // If the user already has at least one set, we skip straight to the dashboard.
  const [checkingProfile, setCheckingProfile] = useState(true);

  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [localBody, setLocalBody] = useState<LocalBody>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProfileFn()
      .catch(() => {
        // Fall through; treat as no profile data and let the user fill it in.
      })
      .finally(() => {
        if (cancelled) return;
        const u = useAuthStore.getState().user;
        const hasAny =
          u != null &&
          (u.lokSabhaConstituency?.id != null ||
            u.stateAssemblyConstituency?.id != null ||
            u.municipalCorporationConstituency?.id != null ||
            u.gramPanchayatConstituency != null);
        if (hasAny) {
          navigate("/user/dashboard", { replace: true });
        } else {
          setCheckingProfile(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Source data ─────────────────────────────────────────
  const [, setElections] = useState<Election[]>([]);
  const [loadingElections, setLoadingElections] = useState(false);

  const [lokSabhaOptions, setLokSabhaOptions] = useState<Constituency[]>([]);
  const [loadingLokSabha, setLoadingLokSabha] = useState(false);
  const [stateAssemblyOptions, setStateAssemblyOptions] = useState<
    Constituency[]
  >([]);
  const [loadingStateAssembly, setLoadingStateAssembly] = useState(false);

  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [cityWards, setCityWards] = useState<Constituency[]>([]);
  const [loadingCityWards, setLoadingCityWards] = useState(false);

  const [gpStates, setGpStates] = useState<string[]>([]);
  const [gpDistricts, setGpDistricts] = useState<string[]>([]);
  const [gpTaluks, setGpTaluks] = useState<string[]>([]);
  const [gpGrams, setGpGrams] = useState<string[]>([]);
  const [gpVillages, setGpVillages] = useState<GPVillage[]>([]);
  const [loadingGpStates, setLoadingGpStates] = useState(false);
  const [loadingGpDistricts, setLoadingGpDistricts] = useState(false);
  const [loadingGpTaluks, setLoadingGpTaluks] = useState(false);
  const [loadingGpGrams, setLoadingGpGrams] = useState(false);
  const [loadingGpVillages, setLoadingGpVillages] = useState(false);

  // ─── Dynamic step list ────────────────────────────────────
  // Always 4 steps total: Lok Sabha → State Assembly → Local Body → (Municipal | Gram Panchayat)
  const steps: StepKey[] = useMemo(() => {
    const fourth: StepKey =
      localBody === "gram_panchayat" ? "gram_panchayat" : "municipal_corporation";
    return ["lok_sabha", "state_assembly", "local_body", fourth];
  }, [localBody]);

  const TOTAL_STEPS = steps.length;
  const currentStep = steps[stepIdx];
  const isLast = stepIdx === TOTAL_STEPS - 1;
  const progress = ((stepIdx + 1) / TOTAL_STEPS) * 100;

  // ─── Load elections once ─────────────────────────────────
  useEffect(() => {
    setLoadingElections(true);
    fetchElections()
      .then((resp) => setElections(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setElections([]))
      .finally(() => setLoadingElections(false));
  }, []);

  // ─── Lazy-fetch options when entering each step ──────────
  useEffect(() => {
    if (currentStep === "lok_sabha" && lokSabhaOptions.length === 0) {
      setLoadingLokSabha(true);
      fetchConstituencies("lok_sabha")
        .then((resp) => setLokSabhaOptions(resp.data?.constituencies ?? []))
        .catch(() => setLokSabhaOptions([]))
        .finally(() => setLoadingLokSabha(false));
    }
    if (currentStep === "state_assembly" && stateAssemblyOptions.length === 0) {
      setLoadingStateAssembly(true);
      fetchConstituencies("state_assembly")
        .then((resp) =>
          setStateAssemblyOptions(resp.data?.constituencies ?? []),
        )
        .catch(() => setStateAssemblyOptions([]))
        .finally(() => setLoadingStateAssembly(false));
    }
    if (currentStep === "municipal_corporation" && municipalities.length === 0) {
      setLoadingMunicipalities(true);
      fetchMunicipalities()
        .then((resp) =>
          setMunicipalities(Array.isArray(resp.data) ? resp.data : []),
        )
        .catch(() => setMunicipalities([]))
        .finally(() => setLoadingMunicipalities(false));
    }
    if (currentStep === "gram_panchayat" && gpStates.length === 0) {
      setLoadingGpStates(true);
      fetchGPStates()
        .then((resp) => setGpStates(Array.isArray(resp.data) ? resp.data : []))
        .catch(() => setGpStates([]))
        .finally(() => setLoadingGpStates(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Municipality → city wards
  useEffect(() => {
    if (!answers.municipality) {
      setCityWards([]);
      return;
    }
    setLoadingCityWards(true);
    fetchConstituenciesByScope(answers.municipality.name)
      .then((resp) => setCityWards(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setCityWards([]))
      .finally(() => setLoadingCityWards(false));
  }, [answers.municipality]);

  // GP cascade
  useEffect(() => {
    if (!answers.gpState) {
      setGpDistricts([]);
      return;
    }
    setLoadingGpDistricts(true);
    fetchGPDistricts(answers.gpState)
      .then((resp) =>
        setGpDistricts(Array.isArray(resp.data) ? resp.data : []),
      )
      .catch(() => setGpDistricts([]))
      .finally(() => setLoadingGpDistricts(false));
  }, [answers.gpState]);

  useEffect(() => {
    if (!answers.gpState || !answers.gpDistrict) {
      setGpTaluks([]);
      return;
    }
    setLoadingGpTaluks(true);
    fetchGPTaluks(answers.gpState, answers.gpDistrict)
      .then((resp) => setGpTaluks(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpTaluks([]))
      .finally(() => setLoadingGpTaluks(false));
  }, [answers.gpState, answers.gpDistrict]);

  useEffect(() => {
    if (!answers.gpState || !answers.gpDistrict || !answers.gpTaluk) {
      setGpGrams([]);
      return;
    }
    setLoadingGpGrams(true);
    fetchGPGrams(answers.gpState, answers.gpDistrict, answers.gpTaluk)
      .then((resp) => setGpGrams(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpGrams([]))
      .finally(() => setLoadingGpGrams(false));
  }, [answers.gpState, answers.gpDistrict, answers.gpTaluk]);

  useEffect(() => {
    if (
      !answers.gpState ||
      !answers.gpDistrict ||
      !answers.gpTaluk ||
      !answers.gpGram
    ) {
      setGpVillages([]);
      return;
    }
    setLoadingGpVillages(true);
    fetchGPVillages(
      answers.gpState,
      answers.gpDistrict,
      answers.gpTaluk,
      answers.gpGram,
    )
      .then((resp) => setGpVillages(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setGpVillages([]))
      .finally(() => setLoadingGpVillages(false));
  }, [answers.gpState, answers.gpDistrict, answers.gpTaluk, answers.gpGram]);

  // ─── Step meta (icon, title, question) ───────────────────
  const stepMeta = (step: StepKey) => {
    switch (step) {
      case "lok_sabha":
        return {
          icon: "📍",
          title: t("pages.constituencyOnboarding.step1Title"),
          question: t("pages.constituencyOnboarding.step1Question"),
        };
      case "state_assembly":
        return {
          icon: "🏛",
          title: t("pages.constituencyOnboarding.step2Title"),
          question: t("pages.constituencyOnboarding.step2Question"),
        };
      case "local_body":
        return {
          icon: "🏛️",
          title: t("pages.constituencyOnboarding.localBodyTitle"),
          question: t("pages.constituencyOnboarding.localBodyQuestion"),
        };
      case "municipal_corporation":
        return {
          icon: "🏙",
          title: t("pages.constituencyOnboarding.step3Title"),
          question: t("pages.constituencyOnboarding.step3Question"),
        };
      case "gram_panchayat":
        return {
          icon: "🌿",
          title: t("pages.constituencyOnboarding.step4Title"),
          question: t("pages.constituencyOnboarding.step4Question"),
        };
    }
  };

  // ─── "has any value" per step ────────────────────────────
  const stepHasAnswer = (): boolean => {
    switch (currentStep) {
      case "lok_sabha":
        return !!answers.lokSabha;
      case "state_assembly":
        return !!answers.stateAssembly;
      case "local_body":
        return !!localBody;
      case "municipal_corporation":
        return !!answers.municipality || !!answers.cityWard;
      case "gram_panchayat":
        return (
          !!answers.gpState ||
          !!answers.gpDistrict ||
          !!answers.gpTaluk ||
          !!answers.gpGram ||
          !!answers.gpVillage
        );
    }
  };

  // ─── Finish / submit ─────────────────────────────────────
  const finish = async (final: OnboardingAnswers) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
      // Mark onboarding as done so the guard lets the user in even if they
      // skipped every step (constituencies still null). Both "skip all" and a
      // completed submit reach finish(), so this covers both exits.
      localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
    } catch {
      // ignore
    }

    const payload = {
      lokSabhaConstituencyId: final.lokSabha?.id ?? null,
      stateAssemblyConstituencyId: final.stateAssembly?.id ?? null,
      municipalCorporationConstituencyId: final.cityWard?.id ?? null,
      gramPanchayatConstituencyId: final.gpVillage?.id
        ? Number(final.gpVillage.id)
        : null,
    };

    const hasAnything =
      payload.lokSabhaConstituencyId != null ||
      payload.stateAssemblyConstituencyId != null ||
      payload.municipalCorporationConstituencyId != null ||
      payload.gramPanchayatConstituencyId != null;

    // In cookie mode there is no client-side token (the httpOnly session cookie
    // authenticates), so DON'T gate the save on `token` — that check would be
    // always-true and silently skip the backend update, leaving the user's
    // selection unsaved. Only the "nothing selected" case skips the save; auth
    // is guaranteed since this page is behind an auth guard.
    const isAuthed = COOKIE_AUTH
      ? useAuthStore.getState().isAuthenticated
      : Boolean(token);
    if (!hasAnything || !isAuthed) {
      navigate("/user/dashboard", { replace: true });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await updateUserConstituencies(payload);
      // Cookie mode: pass '' (no token to pin); legacy mode keeps the token.
      setAuth(COOKIE_AUTH ? '' : (token ?? ''), data);
      // The POST response only carries the constituency IDs, not the nested
      // `municipalCorporationConstituency` / `gramPanchayatConstituency` objects
      // that the dashboard checks to render local-body tiles. Refresh from
      // /auth/me so the user object matches the canonical shape before nav.
      await fetchProfileFn().catch(() => {});
      navigate("/user/dashboard", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t("common.error", { defaultValue: "Failed to save. Please try again." });
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (submitting) return;
    if (!stepHasAnswer()) return;
    if (isLast) void finish(answers);
    else setStepIdx(stepIdx + 1);
  };

  const handleSkip = () => {
    if (submitting) return;
    const next: OnboardingAnswers = { ...answers };
    switch (currentStep) {
      case "lok_sabha":
        delete next.lokSabha;
        break;
      case "state_assembly":
        delete next.stateAssembly;
        break;
      case "local_body":
        // Skipping the local body picker also skips step 4
        setLocalBody(null);
        delete next.municipality;
        delete next.cityWard;
        delete next.gpState;
        delete next.gpDistrict;
        delete next.gpTaluk;
        delete next.gpGram;
        delete next.gpVillage;
        setAnswers(next);
        if (isLast) {
          void finish(next);
        } else {
          // Jump straight to finish — there's no meaningful step 4 without a local body
          void finish(next);
        }
        return;
      case "municipal_corporation":
        delete next.municipality;
        delete next.cityWard;
        break;
      case "gram_panchayat":
        delete next.gpState;
        delete next.gpDistrict;
        delete next.gpTaluk;
        delete next.gpGram;
        delete next.gpVillage;
        break;
    }
    setAnswers(next);
    if (isLast) void finish(next);
    else setStepIdx(stepIdx + 1);
  };

  const handleBack = () => {
    if (stepIdx === 0 || submitting) return;
    setStepIdx(stepIdx - 1);
  };

  const pickLocalBody = (choice: NonNullable<LocalBody>) => {
    if (submitting) return;
    if (localBody !== choice) {
      // changing choice resets the step-4 selections so old data doesn't leak
      setAnswers((p) => ({
        ...p,
        municipality: undefined,
        cityWard: undefined,
        gpState: undefined,
        gpDistrict: undefined,
        gpTaluk: undefined,
        gpGram: undefined,
        gpVillage: undefined,
      }));
    }
    setLocalBody(choice);
    setStepIdx(stepIdx + 1);
  };

  // ─── styling ──────────────────────────────────────────────
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)",
      "& fieldset": {
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(17,24,39,0.18)",
      },
      "&:hover fieldset": { borderColor: "rgba(245,168,0,0.45)" },
      "&.Mui-focused fieldset": {
        borderColor: BRAND.yellow,
        borderWidth: "1.5px",
      },
    },
    "& .MuiInputLabel-root": {
      color: isDark ? "rgba(255,255,255,0.55)" : "rgba(17,24,39,0.62)",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: BRAND.yellow },
    "& .MuiInputBase-input": {
      color: isDark ? "#fff" : "rgba(15,23,42,0.94)",
      fontSize: "1rem",
    },
  };

  const listboxSx = {
    bgcolor: isDark ? "#1a1515" : "#fff",
    "& .MuiAutocomplete-option": {
      color: isDark ? "rgba(255,255,255,0.85)" : "rgba(15,23,42,0.9)",
      fontSize: "0.95rem",
      '&[aria-selected="true"]': {
        bgcolor: isDark ? "rgba(245,168,0,0.18)" : "rgba(245,168,0,0.14)",
      },
      "&.Mui-focused": {
        bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.04)",
      },
    },
  };

  // ─── Local body card renderer ─────────────────────────────
  const renderLocalBodyCard = (
    choice: NonNullable<LocalBody>,
    title: string,
    badge: string,
    IconComp: React.ComponentType<{ sx?: any }>,
    iconBg: string,
    iconBorder: string,
    iconColor: string,
    badgeBg: string,
    badgeColor: string,
  ) => {
    const isSelected = localBody === choice;
    return (
      <Box
        onClick={() => pickLocalBody(choice)}
        sx={{
          cursor: "pointer",
          borderRadius: 2.5,
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          border: isSelected
            ? `1.5px solid ${BRAND.yellow}`
            : `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(17,24,39,0.12)"}`,
          background: isSelected
            ? "linear-gradient(135deg, rgba(245,168,0,0.10) 0%, rgba(224,32,16,0.06) 100%)"
            : isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(17,24,39,0.02)",
          transition: "all 0.18s ease",
          "&:hover": {
            borderColor: BRAND.yellow,
            background:
              "linear-gradient(135deg, rgba(245,168,0,0.10) 0%, rgba(224,32,16,0.06) 100%)",
            "& .lb-arrow": {
              background:
                "linear-gradient(135deg, #F5A800 0%, #E02010 100%)",
              color: "#fff",
              boxShadow: "0 6px 18px rgba(224,32,16,0.35)",
              transform: "scale(1.06)",
            },
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: iconBg,
            border: `1px solid ${iconBorder}`,
            flexShrink: 0,
          }}
        >
          <IconComp sx={{ fontSize: 20, color: iconColor }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
          }}>
            <Typography
              sx={{
                fontSize: { xs: "1rem", sm: "1.1rem" },
                fontWeight: 700,
                color: isDark ? "#fff" : "rgba(17,24,39,0.92)",
              }}
            >
              {title}
            </Typography>
            <Box
              component="span"
              sx={{
                px: 0.8,
                py: 0.2,
                borderRadius: 0.8,
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: badgeColor,
                background: badgeBg,
              }}
            >
              {badge}
            </Box>
          </Stack>
        </Box>
        <Box
          className="lb-arrow"
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isSelected
              ? "linear-gradient(135deg, #F5A800 0%, #E02010 100%)"
              : isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(17,24,39,0.06)",
            color: isSelected
              ? "#fff"
              : isDark
                ? "rgba(255,255,255,0.65)"
                : "rgba(17,24,39,0.6)",
            boxShadow: isSelected
              ? "0 6px 18px rgba(224,32,16,0.35)"
              : "none",
            transition: "all 0.18s ease",
            flexShrink: 0,
          }}
        >
          <ArrowForwardIcon fontSize="small" />
        </Box>
      </Box>
    );
  };

  // ─── per-step fields ─────────────────────────────────────
  const renderStepFields = () => {
    switch (currentStep) {
      case "lok_sabha":
        return (
          <Autocomplete
            options={lokSabhaOptions}
            getOptionLabel={(o) =>
              `${o.number ? `${o.number} - ` : ""}${o.name}`
            }
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={answers.lokSabha ?? null}
            onChange={(_, v) =>
              setAnswers((p) => ({ ...p, lokSabha: v ?? undefined }))
            }
            loading={loadingLokSabha}
            slotProps={{ listbox: { sx: listboxSx } }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("pages.constituencyOnboarding.step1Placeholder")}
                sx={fieldSx}
              />
            )}
          />
        );
      case "state_assembly":
        return (
          <Autocomplete
            options={stateAssemblyOptions}
            getOptionLabel={(o) =>
              `${o.number ? `${o.number} - ` : ""}${o.name}`
            }
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={answers.stateAssembly ?? null}
            onChange={(_, v) =>
              setAnswers((p) => ({ ...p, stateAssembly: v ?? undefined }))
            }
            loading={loadingStateAssembly}
            slotProps={{ listbox: { sx: listboxSx } }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("pages.constituencyOnboarding.step2Placeholder")}
                sx={fieldSx}
              />
            )}
          />
        );
      case "local_body":
        return (
          <Stack spacing={2}>
            {renderLocalBodyCard(
              "municipality",
              t("pages.constituencyOnboarding.localBodyMunicipality"),
              t("pages.constituencyOnboarding.localBodyUrban"),
              LocationCityIcon,
              "linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.10) 100%)",
              "rgba(96,165,250,0.45)",
              "#60a5fa",
              isDark ? "rgba(96,165,250,0.18)" : "rgba(59,130,246,0.14)",
              "#60a5fa",
            )}
            {renderLocalBodyCard(
              "gram_panchayat",
              t("pages.constituencyOnboarding.localBodyGramPanchayat"),
              t("pages.constituencyOnboarding.localBodyRural"),
              SpaIcon,
              "linear-gradient(135deg, rgba(74,222,128,0.18) 0%, rgba(34,197,94,0.10) 100%)",
              "rgba(74,222,128,0.45)",
              "#4ade80",
              isDark ? "rgba(74,222,128,0.18)" : "rgba(34,197,94,0.14)",
              "#22c55e",
            )}
            {/* "Neither applies" divider + skip — for users who belong to
                neither a municipality nor a gram panchayat, or want to skip
                the local body section entirely. */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                pt: 1
              }}>
              <Box
                sx={{
                  flex: 1,
                  height: 1,
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(17,24,39,0.10)",
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: isDark
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(17,24,39,0.5)",
                  textTransform: "uppercase",
                }}
              >
                {t("pages.constituencyOnboarding.localBodyNeitherApplies", {
                  defaultValue: "Neither applies",
                })}
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  height: 1,
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(17,24,39,0.10)",
                }}
              />
            </Stack>
            <Button
              variant="outlined"
              onClick={handleSkip}
              disabled={submitting}
              startIcon={<SkipNextIcon />}
              sx={{
                py: 1.25,
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.95rem",
                borderColor: isDark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(17,24,39,0.2)",
                color: isDark
                  ? "rgba(255,255,255,0.78)"
                  : "rgba(17,24,39,0.75)",
                "&:hover": {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.32)"
                    : "rgba(17,24,39,0.38)",
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(17,24,39,0.04)",
                },
              }}
            >
              {t("pages.constituencyOnboarding.localBodySkipLabel", {
                defaultValue: "Skip — I don't belong to either",
              })}
            </Button>
          </Stack>
        );
      case "municipal_corporation":
        return (
          <Stack spacing={2}>
            <Autocomplete
              options={municipalities}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={answers.municipality ?? null}
              onChange={(_, v) =>
                setAnswers((p) => ({
                  ...p,
                  municipality: v ?? undefined,
                  cityWard: undefined,
                }))
              }
              loading={loadingMunicipalities}
              slotProps={{ listbox: { sx: listboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("pages.constituencyOnboarding.corporationLabel")}
                  sx={fieldSx}
                />
              )}
            />
            <Autocomplete
              options={cityWards}
              getOptionLabel={(o) =>
                `${o.number ? `${o.number} - ` : ""}${o.name}`
              }
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={answers.cityWard ?? null}
              onChange={(_, v) =>
                setAnswers((p) => ({ ...p, cityWard: v ?? undefined }))
              }
              loading={loadingCityWards}
              disabled={!answers.municipality}
              slotProps={{ listbox: { sx: listboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("pages.constituencyOnboarding.wardLabel")}
                  sx={fieldSx}
                />
              )}
            />
          </Stack>
        );
      case "gram_panchayat":
        return (
          <Stack spacing={2}>
            <Autocomplete
              options={gpStates}
              value={answers.gpState ?? null}
              onChange={(_, v) =>
                setAnswers((p) => ({
                  ...p,
                  gpState: v ?? undefined,
                  gpDistrict: undefined,
                  gpTaluk: undefined,
                  gpGram: undefined,
                  gpVillage: undefined,
                }))
              }
              loading={loadingGpStates}
              slotProps={{ listbox: { sx: listboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("pages.constituencyOnboarding.stateLabel")}
                  sx={fieldSx}
                />
              )}
            />
            <Autocomplete
              options={gpDistricts}
              value={answers.gpDistrict ?? null}
              onChange={(_, v) =>
                setAnswers((p) => ({
                  ...p,
                  gpDistrict: v ?? undefined,
                  gpTaluk: undefined,
                  gpGram: undefined,
                  gpVillage: undefined,
                }))
              }
              loading={loadingGpDistricts}
              disabled={!answers.gpState}
              slotProps={{ listbox: { sx: listboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("pages.constituencyOnboarding.districtLabel")}
                  sx={fieldSx}
                />
              )}
            />
            <Autocomplete
              options={gpTaluks}
              value={answers.gpTaluk ?? null}
              onChange={(_, v) =>
                setAnswers((p) => ({
                  ...p,
                  gpTaluk: v ?? undefined,
                  gpGram: undefined,
                  gpVillage: undefined,
                }))
              }
              loading={loadingGpTaluks}
              disabled={!answers.gpDistrict}
              slotProps={{ listbox: { sx: listboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("pages.constituencyOnboarding.talukLabel")}
                  sx={fieldSx}
                />
              )}
            />
            <Autocomplete
              options={gpGrams}
              value={answers.gpGram ?? null}
              onChange={(_, v) =>
                setAnswers((p) => ({
                  ...p,
                  gpGram: v ?? undefined,
                  gpVillage: undefined,
                }))
              }
              loading={loadingGpGrams}
              disabled={!answers.gpTaluk}
              slotProps={{ listbox: { sx: listboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("pages.constituencyOnboarding.gpLabel")}
                  sx={fieldSx}
                />
              )}
            />
            <Autocomplete
              options={gpVillages}
              getOptionLabel={(o) => o.villageName}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={answers.gpVillage ?? null}
              onChange={(_, v) =>
                setAnswers((p) => ({ ...p, gpVillage: v ?? undefined }))
              }
              loading={loadingGpVillages}
              disabled={!answers.gpGram}
              slotProps={{ listbox: { sx: listboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("pages.constituencyOnboarding.villageLabel")}
                  sx={fieldSx}
                />
              )}
            />
          </Stack>
        );
    }
  };

  const anyLoading =
    loadingElections ||
    (currentStep === "lok_sabha" && loadingLokSabha) ||
    (currentStep === "state_assembly" && loadingStateAssembly) ||
    (currentStep === "municipal_corporation" &&
      (loadingMunicipalities || loadingCityWards)) ||
    (currentStep === "gram_panchayat" &&
      (loadingGpStates ||
        loadingGpDistricts ||
        loadingGpTaluks ||
        loadingGpGrams ||
        loadingGpVillages));

  const meta = stepMeta(currentStep);

  if (checkingProfile) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDark
            ? "radial-gradient(ellipse at 50% 0%, #1a0a0a 0%, #0a0505 55%, #000 100%)"
            : "radial-gradient(ellipse at 50% 0%, #fff8ee 0%, #f5efe2 55%, #ece4d2 100%)",
        }}
      >
        <CircularProgress sx={{ color: BRAND.yellow }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: isDark
          ? "radial-gradient(ellipse at 50% 0%, #1a0a0a 0%, #0a0505 55%, #000 100%)"
          : "radial-gradient(ellipse at 50% 0%, #fff8ee 0%, #f5efe2 55%, #ece4d2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 5 },
      }}
    >
      {/* Header strip — logo + brand on the left, language selector on the right */}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 720,
          mb: { xs: 3, sm: 4 }
        }}>
        <Stack direction="row" spacing={1.2} sx={{
          alignItems: "center"
        }}>
          <Box
            component="img"
            src={prajakeeyaLogo}
            alt="Prajaakeeya"
            sx={{ height: 36, objectFit: "contain" }}
          />
          <Typography
            sx={{
              fontFamily: '"Bebas Neue", "Impact", sans-serif',
              fontSize: { xs: "1.05rem", sm: "1.2rem" },
              letterSpacing: "0.08em",
              background:
                "linear-gradient(135deg, #E02010 0%, #FFCB00 45%, #F5A800 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            PRAJAAKEEYA
          </Typography>
        </Stack>
        <LanguageSelector
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: isDark
              ? "rgba(245,168,0,0.4)"
              : "rgba(245,168,0,0.5)",
            color: BRAND.yellow,
            "&:hover": {
              borderColor: BRAND.yellow,
              bgcolor: "rgba(245,168,0,0.08)",
            },
          }}
        />
      </Stack>
      {/* Card */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 720,
          background: isDark
            ? "linear-gradient(160deg, rgba(28,16,16,0.92) 0%, rgba(19,11,11,0.96) 100%)"
            : "rgba(255,255,255,0.92)",
          border: isDark
            ? "1px solid rgba(245,168,0,0.18)"
            : "1px solid rgba(245,168,0,0.32)",
          borderRadius: 4,
          boxShadow: isDark
            ? "0 24px 64px rgba(0,0,0,0.55)"
            : "0 16px 48px rgba(17,24,39,0.10)",
          backdropFilter: "blur(12px)",
          p: { xs: 3, sm: 5 },
        }}
      >
        {/* Step header */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.2
          }}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: BRAND.yellow,
              textTransform: "uppercase",
            }}
          >
            {t("pages.constituencyOnboarding.stepCounter", {
              current: stepIdx + 1,
              total: TOTAL_STEPS,
            })}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: isDark
                ? "rgba(255,255,255,0.45)"
                : "rgba(17,24,39,0.55)",
            }}
          >
            {Math.round(progress)}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mb: 4,
            borderRadius: 2,
            height: 6,
            bgcolor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(17,24,39,0.08)",
            "& .MuiLinearProgress-bar": {
              background:
                "linear-gradient(90deg, #F5A800 0%, #E02010 100%)",
              borderRadius: 2,
            },
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Stack
              direction="row"
              spacing={1.4}
              sx={{
                alignItems: "center",
                mb: 1
              }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  background:
                    "linear-gradient(135deg, rgba(245,168,0,0.18) 0%, rgba(224,32,16,0.12) 100%)",
                  border: "1px solid rgba(245,168,0,0.35)",
                }}
              >
                {currentStep === "local_body" ? (
                  <AccountBalanceIcon
                    sx={{ fontSize: 24, color: BRAND.yellow }}
                  />
                ) : (
                  meta.icon
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.45rem" },
                  fontWeight: 800,
                  color: isDark ? "#fff" : "rgba(17,24,39,0.92)",
                  letterSpacing: "-0.01em",
                }}
              >
                {meta.title}
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                color: isDark
                  ? "rgba(255,255,255,0.65)"
                  : "rgba(17,24,39,0.65)",
                mb: 3,
                lineHeight: 1.55,
              }}
            >
              {meta.question}
            </Typography>

            <Box sx={{ mb: 1.5 }}>{renderStepFields()}</Box>

            {anyLoading && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                  mb: 1
                }}>
                <CircularProgress size={14} sx={{ color: BRAND.yellow }} />
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    color: isDark
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(17,24,39,0.55)",
                  }}
                >
                  {t("pages.constituencyOnboarding.loadingOptions")}
                </Typography>
              </Stack>
            )}

            {submitError && (
              <Typography
                sx={{
                  mt: 2,
                  fontSize: "0.85rem",
                  color: "#f87171",
                  background: "rgba(200,24,10,0.10)",
                  border: "1px solid rgba(200,24,10,0.28)",
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 1,
                }}
              >
                {submitError}
              </Typography>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 4 }}
        >
          {stepIdx > 0 && (
            <Button
              variant="text"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: isDark
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(17,24,39,0.6)",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.95rem",
                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(17,24,39,0.04)",
                },
              }}
            >
              {t("pages.constituencyOnboarding.back")}
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          {currentStep !== "local_body" && (
            <Button
              variant="outlined"
              onClick={handleSkip}
              disabled={submitting}
              startIcon={<SkipNextIcon />}
              sx={{
                py: 1.25,
                px: 3,
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.95rem",
                borderColor: isDark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(17,24,39,0.2)",
                color: isDark
                  ? "rgba(255,255,255,0.75)"
                  : "rgba(17,24,39,0.72)",
                "&:hover": {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.32)"
                    : "rgba(17,24,39,0.38)",
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(17,24,39,0.04)",
                },
              }}
            >
              {t("pages.constituencyOnboarding.skip")}
            </Button>
          )}
          {currentStep !== "local_body" && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!stepHasAnswer() || submitting}
              endIcon={
                submitting ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : isLast ? (
                  <CheckCircleIcon />
                ) : (
                  <ArrowForwardIcon />
                )
              }
              sx={{
                py: 1.25,
                px: 4,
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: "none",
                fontSize: "0.95rem",
                color: "#fff",
                background:
                  "linear-gradient(135deg, #C8180A 0%, #E02010 100%)",
                boxShadow: "0 6px 20px rgba(200,24,10,0.35)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #E02010 0%, #C8180A 100%)",
                  boxShadow: "0 8px 26px rgba(200,24,10,0.5)",
                },
                "&.Mui-disabled": {
                  background: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(17,24,39,0.08)",
                  color: isDark
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(17,24,39,0.35)",
                  boxShadow: "none",
                },
              }}
            >
              {isLast
                ? t("pages.constituencyOnboarding.finish")
                : t("pages.constituencyOnboarding.next")}
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default UserConstituencyOnboardingPage;
