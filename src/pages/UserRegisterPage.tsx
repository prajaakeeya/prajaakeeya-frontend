import React, { useEffect, useState } from "react";
import Portal from "@mui/material/Portal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  TextField,
  Button,
  Stack,
  Alert,
  Box,
  CircularProgress,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Fade,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getGoogleOAuthUrl } from "../services/authService";
import { COOKIE_AUTH } from "../config/authMode";
import useAuthStore from "../store/useAuthStore";
import * as yup from "yup";
import SplitAuthLayout from "../components/SplitAuthLayout";
import prajakeeyaLogo from "../assets/images/prajakeeya.webp";
interface RegisterForm {
  name: string;
}

const UserRegisterPage = () => {
  const { t, i18n } = useTranslation();
  const isKannada = (i18n.language || "").startsWith("kn");
  const { setAuth, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<{
    token: string;
    user: any;
  } | null>(null);
  const [consented, setConsented] = useState(false);
  const [firebaseIdToken, setFirebaseIdToken] = useState<string | null>(null);

  const schema = yup.object({
    name: yup.string().required(t("validation.required")).min(2),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
    defaultValues: { name: "" },
  });

  const isInWebView =
    typeof window !== "undefined" &&
    /ReactNative/i.test(navigator.userAgent || "");
  const isAppleDevice =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
  // If the OAuth callback detected a freshly-created account, it redirects
  // here with ?celebrate=1 and stashes the token+user in sessionStorage.
  // Show the celebration screen; the Continue button will finalize auth.
  useEffect(() => {
    if (searchParams.get("celebrate") !== "1") return;
    const stored = sessionStorage.getItem("__PENDING_AUTH__");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      // In cookie mode there is no token (the httpOnly session cookie was
      // already set by the exchange), so require only `user`; legacy mode still
      // carries the JWT and both must be present.
      const hasValidPending = COOKIE_AUTH
        ? Boolean(parsed?.user)
        : Boolean(parsed?.token && parsed?.user);
      if (hasValidPending) {
        setPendingAuth(parsed);
        setShowCelebration(true);
      }
    } catch {
      // ignore parse errors
    }
    sessionStorage.removeItem("__PENDING_AUTH__");
    const next = new URLSearchParams(searchParams);
    next.delete("celebrate");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Pre-fill form if redirected from Google auth bridge (new user flow)
  useEffect(() => {
    const stored = sessionStorage.getItem("__GOOGLE_AUTH__");
    if (stored) {
      try {
        const googleUser = JSON.parse(stored);
        if (googleUser.name) setValue("name", googleUser.name);
        if (googleUser.idToken) setFirebaseIdToken(googleUser.idToken);
        setStep(2);
      } catch (e) {
        // ignore parse errors
      }
      sessionStorage.removeItem("__GOOGLE_AUTH__");
    }
  }, [setValue]);

  // Handle Google Sign-In — redirect to backend OAuth entry point.
  // Backend handles consent + user creation, then redirects to
  // /auth/callback?token=...&user=... where we finalize the session.
  const handleGoogleSignIn = () => {
    setError("");
    if (isInWebView) {
      (window as any).ReactNativeWebView?.postMessage(
        JSON.stringify({ type: "GOOGLE_SIGN_IN", url: getGoogleOAuthUrl() }),
      );
      return;
    }
    setGoogleLoading(true);
    // Mark that this OAuth flow started from the Register page so the
    // callback can show the celebration screen for fresh signups.
    sessionStorage.setItem("__FROM_REGISTER__", "1");
    // replace() (not href=) so the register page is REPLACED in history, not
    // stacked — so after sign-in, Back can't re-enter the Google sign-in flow.
    window.location.replace(getGoogleOAuthUrl());
  };

  // Apple sign-in is disabled pending native backend integration.
  const handleAppleSignIn = () => {
    setError("Apple sign-in is temporarily unavailable.");
  };

  // Details form (step 2) is no longer reachable under the backend OAuth flow
  // — user creation happens server-side during the OAuth callback. Kept as a
  // no-op to preserve the existing UI shell until the step-2 code path is
  // removed.
  const onDetailsSubmit = async (_values: RegisterForm) => {
    setError("Registration flow has moved to Google sign-in.");
  };

  // Splits "Continue as Guest (Read only)" into a main label and a hint.
  const guestLabel = t("pages.register.continueAsGuest");
  const guestMatch = guestLabel.match(/^(.*?)\s*\((.+)\)\s*$/);

  const legalLink = (part: string, to: string, key: number) => (
    <Box
      key={key}
      component="a"
      href={to}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(to);
      }}
      sx={{ color: "primary.main", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}
    >
      {part}
    </Box>
  );

  return (
    <>
      <SplitAuthLayout
        leftTitle={t("pages.register.leftTitle")}
        leftSubtitle={t("pages.register.leftSubtitle")}
        cardTitle={step === 1 ? undefined : t("pages.register.yourDetails")}
      >
        {step === 1 && (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h5" component="h1">{t("pages.login.oath.title")}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {t("pages.register.registerWithSocial")}
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <FormControlLabel
              control={
                <Checkbox
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  sx={{ mt: -0.75 }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("pages.register.consentCombined")
                    .split(/(Privacy Policy|Terms)/)
                    .map((part, i) =>
                      part === "Privacy Policy"
                        ? legalLink(part, "/privacy-policy", i)
                        : part === "Terms"
                          ? legalLink(part, "/terms-and-conditions", i)
                          : part,
                    )}
                </Typography>
              }
              sx={{
                alignItems: "flex-start", mx: 0, p: 1.5, pr: 2, borderRadius: 4,
                border: 1, borderColor: consented ? "primary.main" : "divider",
                bgcolor: consented ? "action.selected" : "transparent",
                transition: "border-color 120ms ease, background-color 120ms ease",
              }}
            />

            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={googleLoading || appleLoading || !consented}
              startIcon={
                googleLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 33 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.9 29.3 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.6-.4-3.8-.1-.4-.4-.7-1-.7z" />
                    <path fill="#FF3D00" d="M6.3 15.2l6.6 4.8C14.7 16.5 19 14 24 14c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.9 29.3 5 24 5 16.3 5 9.6 9.2 6.3 15.2z" />
                    <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 36.5 26.8 37.5 24 37.5c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.7 40.8 16.4 45 24 45z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2.1 3.7-3.8 4.9l6.2 5.2C42.6 34.5 44 30 44 25c0-1.3-.1-2.6-.4-3.8-.1-.4-.4-.7-1-.7z" />
                  </svg>
                )
              }
            >
              {t("pages.login.socialGoogle")}
            </Button>

            <Divider sx={{ color: "text.disabled", fontSize: "0.75rem" }}>{t("common.or", { defaultValue: "or" })}</Divider>

            <Button
              variant="text"
              fullWidth
              onClick={() => navigate("/guest/dashboard")}
              aria-label={guestLabel}
              sx={{ color: "text.secondary", flexDirection: "column", lineHeight: 1.3 }}
            >
              <Box component="span" sx={{ color: "text.primary" }}>{guestMatch ? guestMatch[1] : guestLabel}</Box>
              {guestMatch && (
                <Box component="span" sx={{ fontSize: "0.75rem", fontWeight: 500 }}>{guestMatch[2]}</Box>
              )}
            </Button>
          </Stack>
        )}

        {/* Step 2: details form (kept as a shell; registration happens via OAuth) */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onDetailsSubmit)}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label={t("common.fullName")}
                fullWidth
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {t("pages.register.continue")}
              </Button>
              <Button variant="text" fullWidth onClick={() => setStep(1)} sx={{ color: "text.secondary" }}>
                {t("common.back")}
              </Button>
            </Stack>
          </form>
        )}
      </SplitAuthLayout>

      {/* Welcome screen for freshly created accounts */}
      <Portal>
        <Fade in={showCelebration} unmountOnExit>
          <Box
            role="dialog"
            aria-modal="true"
            sx={{
              position: "fixed", inset: 0, zIndex: (th) => th.zIndex.modal + 1,
              bgcolor: "background.default",
              display: "flex", alignItems: "center", justifyContent: "center", p: 3,
            }}
          >
            <Stack alignItems="center" spacing={3} sx={{ maxWidth: 520, textAlign: "center" }}>
              <Box component="img" src={prajakeeyaLogo} alt="" sx={{ width: 72, height: 72, borderRadius: 3 }} />
              <Box>
                <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.16em" }}>
                  {t("pages.register.welcomeTo")}
                </Typography>
                <Typography variant="h2" component="h1" sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}>
                  {isKannada ? "ದಿ ರಿಯಲ್ ಪ್ರಜಾಕೀಯ" : "The Real Prajaakeeya"}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "1.125rem", fontWeight: 600 }}>{t("pages.login.oath.para4")}</Typography>
              <Typography sx={{ color: "text.secondary" }}>
                {t("pages.register.welcomeHighlight", {
                  defaultValue: "Welcome to the revolutionary voters who have decided to take responsibility.",
                })}
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{ px: 5 }}
                onClick={() => {
                  setShowCelebration(false);
                  if (pendingAuth) {
                    // Drop any previous user's cached data on this device
                    // (localStorage + in-memory store) before attaching the
                    // new session. Uses clearSession instead of logout()
                    // to avoid the full-page reload that logout() triggers,
                    // which would re-show the index.html preloader.
                    clearSession();
                    setAuth(pendingAuth.token, pendingAuth.user);
                    // New users land on the constituency onboarding wizard
                    // before reaching the dashboard.
                    navigate("/onboarding/location", { replace: true });
                  }
                }}
              >
                {t("pages.register.continueButton")}
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Portal>
    </>
  );
};

export default UserRegisterPage;
