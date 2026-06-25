import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  useTheme,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
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

  const fireworkShows = useMemo(() => {
    const palette = [
      "#ff4d4d",
      "#F5A800",
      "#22c55e",
      "#60a5fa",
      "#FFCB00",
      "#f472b6",
      "#fb923c",
      "#c084fc",
      "#67e8f9",
      "#4ade80",
    ];
    return Array.from({ length: 8 }, (_, site) => {
      const sparkCount = 14 + (site % 3) * 3;
      const baseColor = palette[site % palette.length];
      return {
        id: site,
        launchX: 8 + ((site * 11.5) % 84),
        peakVh:
          (site < 2 ? 72 : 62) +
          (site >= 3 && site <= 5 ? 10 : 0) +
          ((site * 6.4) % 14),
        delay: (site * 0.55) % 4.4,
        duration: 2.3 + (site % 3) * 0.18,
        rocketColor: baseColor,
        flashColor: palette[(site + 2) % palette.length],
        sparks: Array.from({ length: sparkCount }, (_, spark) => {
          const angle = (spark / sparkCount) * 2 * Math.PI + site * 0.18;
          const radius = 7 + (spark % 4) * 2.4 + (site % 2) * 1.3;
          const fall = 3.5 + (spark % 3) * 1.25;
          return {
            id: `${site}-${spark}`,
            color: palette[(site + spark) % palette.length],
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            endX: Math.cos(angle) * radius * 1.45,
            endY: Math.sin(angle) * radius * 1.45 + fall,
            size: spark % 5 === 0 ? 6 : 4,
            delayOffset: (spark % 4) * 0.015,
          };
        }),
      };
    });
  }, []);

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

  const darkFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(17,24,39,0.03)",
      "& fieldset": {
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(17,24,39,0.18)",
      },
      "&:hover fieldset": {
        borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(17,24,39,0.35)",
      },
      "&.Mui-focused fieldset": { borderColor: "#F5A800" },
      "&.Mui-disabled": {
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(17,24,39,0.02)",
      },
    },
    "& .MuiInputLabel-root": {
      color: isDark ? "rgba(255,255,255,0.45)" : "rgba(17,24,39,0.55)",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#F5A800" },
    "& .MuiInputBase-input": { color: isDark ? "#fff" : "rgba(15,23,42,0.94)" },
    "& .MuiSelect-icon": {
      color: isDark ? "rgba(255,255,255,0.45)" : "rgba(17,24,39,0.55)",
    },
  };

  return (
    <>
      <SplitAuthLayout
        leftTitle={t("pages.register.leftTitle")}
        leftSubtitle={t("pages.register.leftSubtitle")}
        cardTitle={
          step === 1
            ? undefined
            : step === 2
              ? t("pages.register.yourDetails")
              : t("pages.register.selfieVerification")
        }
        topContent={
          <Box
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              component="img"
              src={prajakeeyaLogo}
              alt="Prajaakeeya"
              sx={{ height: { xs: 64, sm: 80 }, objectFit: "contain" }}
            />
            <Typography
              sx={{
                fontFamily: '"Bebas Neue", "Impact", sans-serif',
                fontSize: { xs: "1.4rem", sm: "1.7rem" },
                letterSpacing: "0.08em",
                lineHeight: 1,
                background: isDark
                  ? "linear-gradient(135deg, #E02010 0%, #FFCB00 45%, #F5A800 100%)"
                  : "linear-gradient(135deg, #E02010 0%, #c32d0c 45%, #ff9500 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                paddingBottom: "6px",
              }}
            >
              {t("pages.login.oath.title")}
            </Typography>
          </Box>
        }
      >
        <Box sx={{ width: "100%", maxWidth: 540, mx: "auto" }}>
          {/* Step 1: Google Sign-In */}
          {step === 1 && (
            <Stack spacing={2}>
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 2,
                    bgcolor: "rgba(200,24,10,0.15)",
                    color: "#fca5a5",
                    border: "1px solid rgba(200,24,10,0.3)",
                    "& .MuiAlert-icon": { color: "#f87171" },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Typography
                sx={{
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: isDark
                    ? "rgba(255,255,255,0.88)"
                    : "rgba(17,24,39,0.85)",
                  mb: 2,
                }}
              >
                {t("pages.register.registerWithSocial")}
              </Typography>

              <Box
                sx={{
                  border: `1px solid ${isDark ? "rgba(245,168,0,0.25)" : "rgba(245,168,0,0.4)"}`,
                  borderRadius: 2,
                  p: 2,
                  background: isDark
                    ? "rgba(245,168,0,0.04)"
                    : "rgba(245,168,0,0.04)",
                }}
              >

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={consented}
                      onChange={(e) => setConsented(e.target.checked)}
                      sx={{
                        color: isDark
                          ? "rgba(255,255,255,0.35)"
                          : "rgba(17,24,39,0.35)",
                        "&.Mui-checked": { color: "#F5A800" },
                        py: { xs: 1, sm: 0.25 },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: isDark
                          ? "rgba(255,255,255,0.88)"
                          : "rgba(17,24,39,0.88)",
                        lineHeight: 1.5,
                      }}
                    >
                      {t("pages.register.consentCombined")
                        .split(/(Privacy Policy|Terms)/)
                        .map((part, i) => {
                          if (part === "Privacy Policy") {
                            return (
                              <Box
                                key={i}
                                component="a"
                                href="/privacy-policy"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate("/privacy-policy");
                                }}
                                sx={{
                                  color: "#F5A800",
                                  textDecoration: "underline",
                                }}
                              >
                                {part}
                              </Box>
                            );
                          }
                          if (part === "Terms") {
                            return (
                              <Box
                                key={i}
                                component="a"
                                href="/terms-and-conditions"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate("/terms-and-conditions");
                                }}
                                sx={{
                                  color: "#F5A800",
                                  textDecoration: "underline",
                                }}
                              >
                                {part}
                              </Box>
                            );
                          }
                          return part;
                        })}
                    </Typography>
                  }
                  sx={{
                    alignItems: "flex-start",
                    mx: 0,
                  }}
                />
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleGoogleSignIn}
                disabled={googleLoading || appleLoading || !consented}
                startIcon={
                  googleLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Box
                      component="span"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <svg width="20" height="20" viewBox="0 0 48 48">
                        <path
                          fill="#FFC107"
                          d="M43.6 20.5H42V20H24v8h11.3C33.7 33 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.9 29.3 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.6-.4-3.8-.1-.4-.4-.7-1-.7z"
                        />
                        <path
                          fill="#FF3D00"
                          d="M6.3 15.2l6.6 4.8C14.7 16.5 19 14 24 14c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.9 29.3 5 24 5 16.3 5 9.6 9.2 6.3 15.2z"
                        />
                        <path
                          fill="#4CAF50"
                          d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 36.5 26.8 37.5 24 37.5c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.7 40.8 16.4 45 24 45z"
                        />
                        <path
                          fill="#1976D2"
                          d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2.1 3.7-3.8 4.9l6.2 5.2C42.6 34.5 44 30 44 25c0-1.3-.1-2.6-.4-3.8-.1-.4-.4-.7-1-.7z"
                        />
                      </svg>
                    </Box>
                  )
                }
                sx={{
                  py: 1.3,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.97rem",
                  border: `1.5px solid ${isDark ? "rgba(255,255,255,0.18)" : "rgba(17,24,39,0.15)"}`,
                  color: isDark ? "#fff" : "rgba(17,24,39,0.88)",
                  background: isDark
                    ? "linear-gradient(135deg, #0D0F12 0%, #121415 50%, #13161A 100%)"
                    : "#ffffff",
                  backdropFilter: "blur(4px)",
                  boxShadow: isDark
                    ? "0 4px 18px rgba(0,0,0,0.5)"
                    : "0 2px 10px rgba(17,24,39,0.12)",
                  "&:hover": {
                    border: "1.5px solid #F5A800",
                    background: isDark
                      ? "linear-gradient(135deg, #1E2021 0%, #1E2021 100%)"
                      : "#FFF8F0",
                    boxShadow: isDark
                      ? "0 6px 24px rgba(0,0,0,0.55)"
                      : "0 4px 16px rgba(245,168,0,0.2)",
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-disabled": {
                    border: `1.5px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(17,24,39,0.1)"}`,
                    color: isDark
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(17,24,39,0.35)",
                    background: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(17,24,39,0.04)",
                  },
                }}
              >
                {t("pages.login.socialGoogle")}
              </Button>

              {/* {isAppleDevice && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAppleSignIn}
                  disabled={appleLoading || googleLoading || !consented}
                  startIcon={appleLoading ? <CircularProgress size={20} color="inherit" /> : (
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.02 8.93 8.76c1.28.07 2.17.72 2.92.77.98-.2 1.92-.87 3.01-.79 1.28.1 2.25.6 2.88 1.53-2.64 1.58-2.01 5.05.37 6.02-.48 1.27-.73 1.84-1.37 2.96-.86 1.5-2.08 3-3.69 3.03zM12.05 8.68c-.15-2.23 1.66-4.15 3.74-4.34.27 2.55-2.31 4.45-3.74 4.34z" />
                      </svg>
                    </Box>
                  )}
                  sx={{
                    py: 1.3,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.97rem',
                    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.15)'}`,
                    color: isDark ? '#fff' : 'rgba(17,24,39,0.88)',
                    background: isDark
                      ? 'linear-gradient(135deg, #0D0F12 0%, #1C1212 50%, #2A1A0A 100%)'
                      : '#ffffff',
                    backdropFilter: 'blur(4px)',
                    boxShadow: isDark ? '0 4px 18px rgba(0,0,0,0.5)' : '0 2px 10px rgba(17,24,39,0.12)',
                    '&:hover': {
                      border: '1.5px solid #F5A800',
                      background: isDark
                        ? 'linear-gradient(135deg, #13161A 0%, #251515 50%, #35200A 100%)'
                        : '#FFF8F0',
                      boxShadow: isDark ? '0 6px 24px rgba(0,0,0,0.55)' : '0 4px 16px rgba(245,168,0,0.2)',
                      transform: 'translateY(-1px)',
                    },
                    '&.Mui-disabled': {
                      border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(17,24,39,0.1)'}`,
                      color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.35)',
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(17,24,39,0.04)',
                    },
                  }}
                >
                  {t('pages.login.socialApple')}
                </Button>
              )} */}

              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/guest/dashboard")}
                sx={{
                  mt: 1,
                  py: 0.75,
                  borderRadius: 50,
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  textTransform: "none",
                  border: `1.5px solid ${isDark ? "rgba(245,168,0,0.4)" : "rgba(245,168,0,0.5)"}`,
                  color: "#F5A800",
                  "&:hover": {
                    border: "1.5px solid #F5A800",
                    bgcolor: "rgba(245,168,0,0.08)",
                  },
                }}
              >
                {(() => {
                  const label = t("pages.register.continueAsGuest");
                  const match = label.match(/^(.*?)\s*\((.+)\)\s*$/);
                  const main = match ? match[1] : label;
                  const sub = match ? `(${match[2]})` : "";
                  return (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1 }}>
                      <Box component="span">{main}</Box>
                      {sub && (
                        <Box component="span" sx={{ fontSize: "0.7rem", fontWeight: 500, opacity: 0.85 }}>
                          {sub}
                        </Box>
                      )}
                    </Box>
                  );
                })()}
              </Button>
            </Stack>
          )}

          {/* Step 2: Details Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onDetailsSubmit)}>
              <Stack spacing={2}>
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 2,
                      bgcolor: "rgba(200,24,10,0.15)",
                      color: "#fca5a5",
                      border: "1px solid rgba(200,24,10,0.3)",
                      "& .MuiAlert-icon": { color: "#f87171" },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <TextField
                  label={t("common.fullName")}
                  fullWidth
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={loading}
                  sx={darkFieldSx}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #C8180A 0%, #E02010 100%)",
                    boxShadow: "0 4px 20px rgba(200,24,10,0.4)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #E02010 0%, #C8180A 100%)",
                    },
                    "&.Mui-disabled": {
                      background: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(17,24,39,0.1)",
                      color: isDark
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(17,24,39,0.35)",
                    },
                  }}
                >
                  {t("pages.register.continue")}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setStep(1)}
                  sx={{
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    borderColor: isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(15,23,42,0.22)",
                    color: isDark
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(15,23,42,0.72)",
                    "&:hover": {
                      borderColor: isDark
                        ? "rgba(255,255,255,0.3)"
                        : "rgba(15,23,42,0.35)",
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(15,23,42,0.05)",
                    },
                  }}
                >
                  {t("common.back")}
                </Button>
              </Stack>
            </form>
          )}

          {/* Selfie step removed — registration now shows welcome directly */}
        </Box>
      </SplitAuthLayout>
      {/* Capture modal removed with selfie flow */}
      {/* Celebration Portal */}
      <Portal>
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,
                background: isDark
                  ? "radial-gradient(ellipse at 50% 30%, #1a0505 0%, #0d0000 60%, #000 100%)"
                  : "radial-gradient(ellipse at 50% 30%, #fffaf4 0%, #f9f4eb 60%, #f3ede3 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Fireworks */}
              {fireworkShows.map((show) => (
                <Box
                  key={show.id}
                  sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                >
                  {/* Rocket trail */}
                  <motion.div
                    initial={{ y: 0, opacity: 0, scaleY: 0.3 }}
                    animate={{
                      y: ["0vh", `-${show.peakVh}vh`, `-${show.peakVh}vh`],
                      opacity: [0, 0.9, 0],
                      scaleY: [0.25, 1, 0.2],
                    }}
                    transition={{
                      duration: show.duration,
                      delay: show.delay,
                      repeat: Infinity,
                      times: [0, 0.55, 1],
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: `${show.launchX}vw`,
                      width: 3,
                      height: 80,
                      transform: "translateX(-50%)",
                      transformOrigin: "bottom center",
                      background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${show.rocketColor} 60%, rgba(255,255,255,0.92) 100%)`,
                      borderRadius: 999,
                      filter: "blur(0.25px)",
                      boxShadow: `0 0 18px ${show.rocketColor}`,
                    }}
                  />
                  {/* Rocket head */}
                  <motion.div
                    initial={{ y: 0, opacity: 0, scale: 0.55 }}
                    animate={{
                      y: ["0vh", `-${show.peakVh}vh`, `-${show.peakVh}vh`],
                      opacity: [0, 1, 0],
                      scale: [0.55, 1, 0],
                    }}
                    transition={{
                      duration: show.duration,
                      delay: show.delay,
                      repeat: Infinity,
                      times: [0, 0.55, 0.72],
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: `${show.launchX}vw`,
                      width: 8,
                      height: 16,
                      transform: "translateX(-50%)",
                      borderRadius: 999,
                      background: `linear-gradient(180deg, #fff 0%, ${show.rocketColor} 45%, ${show.flashColor} 100%)`,
                      boxShadow: `0 0 18px ${show.rocketColor}, 0 0 30px ${show.flashColor}`,
                    }}
                  />
                  {/* Flash */}
                  <motion.div
                    initial={{ y: 0, opacity: 0, scale: 0.2 }}
                    animate={{
                      y: [
                        "0vh",
                        `-${show.peakVh}vh`,
                        `-${show.peakVh}vh`,
                        `-${show.peakVh}vh`,
                      ],
                      opacity: [0, 0, 0.95, 0],
                      scale: [0.2, 0.2, 1.35, 2.2],
                    }}
                    transition={{
                      duration: show.duration,
                      delay: show.delay,
                      repeat: Infinity,
                      times: [0, 0.54, 0.62, 0.8],
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: `${show.launchX}vw`,
                      width: 16,
                      height: 16,
                      transform: "translateX(-50%)",
                      borderRadius: "50%",
                      background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, ${show.flashColor} 35%, rgba(255,255,255,0) 72%)`,
                      filter: "blur(0.4px)",
                    }}
                  />
                  {/* Sparks */}
                  {show.sparks.map((spark) => (
                    <motion.div
                      key={spark.id}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
                      animate={{
                        x: ["0vw", "0vw", `${spark.x}vw`, `${spark.endX}vw`],
                        y: [
                          "0vh",
                          `-${show.peakVh}vh`,
                          `calc(-${show.peakVh}vh + ${spark.y}vw)`,
                          `calc(-${show.peakVh}vh + ${spark.endY}vw)`,
                        ],
                        opacity: [0, 0, 1, 0],
                        scale: [0.2, 0.2, 1, 0.25],
                      }}
                      transition={{
                        duration: show.duration,
                        delay: show.delay + spark.delayOffset,
                        repeat: Infinity,
                        times: [0, 0.54, 0.7, 1],
                        ease: "easeOut",
                      }}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: `${show.launchX}vw`,
                        width: spark.size,
                        height: spark.size,
                        transform: "translateX(-50%)",
                        borderRadius: "50%",
                        background: spark.color,
                        boxShadow: `0 0 10px 3px ${spark.color}`,
                      }}
                    />
                  ))}
                </Box>
              ))}

              {/* Pulsing glow */}
              <motion.div
                animate={{ scale: [1, 1.18, 1] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  width: "55vw",
                  height: "55vw",
                  maxWidth: 480,
                  maxHeight: 480,
                  borderRadius: "50%",
                  background: isDark
                    ? "radial-gradient(circle, rgba(200,24,10,0.18) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(245,168,0,0.2) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              {/* Welcome heading */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.55 }}
              >
                <Box sx={{ textAlign: "center", mb: 3, px: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 600,
                      fontSize: { xs: "0.95rem", sm: "1.1rem" },
                      color: isDark
                        ? "rgba(255,255,255,0.55)"
                        : "rgba(15,23,42,0.5)",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      mb: 0.5,
                    }}
                  >
                    {t("pages.register.welcomeTo")}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 900,
                      fontSize: { xs: "1.1rem", sm: "1.3rem" },
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      background:
                        "linear-gradient(135deg, #E02010 0%, #FFCB00 45%, #F5A800 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      display: "block",
                      mb: 0.3,
                    }}
                  >
                    {isKannada ? "ದಿ ರಿಯಲ್" : "THE REAL"}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 900,
                      fontSize: { xs: "2rem", sm: "2.8rem" },
                      lineHeight: 1,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background:
                        "linear-gradient(135deg, #E02010 0%, #FFCB00 45%, #F5A800 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      display: "block",
                    }}
                  >
                    {isKannada ? "ಪ್ರಜಾಕೀಯ" : "PRAJAAKEEYA"}
                  </Typography>
                </Box>
              </motion.div>

              {/* Word-by-word oath text */}
              <Box sx={{ maxWidth: 560, px: 3, mb: 1.5, textAlign: "center" }}>
                <Typography
                  component="p"
                  sx={{
                    fontSize: { xs: "1.2rem", sm: "1.35rem" },
                    fontWeight: 900,
                    fontFamily: "'Baloo 2', sans-serif",
                    color: "#F5A800",
                    lineHeight: 1.5,
                  }}
                >
                  {t("pages.login.oath.para4")
                    .split(" ")
                    .map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ delay: 0.6 + i * 0.07, duration: 0.4 }}
                        style={{ display: "inline-block", marginRight: 5 }}
                      >
                        {word}
                      </motion.span>
                    ))}
                </Typography>
              </Box>

              {/* Welcome highlight */}
              <Box sx={{ maxWidth: 560, px: 3, mb: 2.5, textAlign: "center" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.2, duration: 0.5 }}
                >
                  <Typography
                    component="p"
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.35rem" },
                      fontWeight: 900,
                      fontFamily: "'Baloo 2', sans-serif",
                      lineHeight: 1.5,
                      color: "#F5A800",
                    }}
                  >
                    {t("pages.register.welcomeHighlight", {
                      defaultValue:
                        "Welcome to the revolutionary voters who have decided to take responsibility.",
                    })}
                  </Typography>
                </motion.div>
              </Box>

              {/* Continue button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.2, duration: 0.45, type: "spring" }}
              >
                <Button
                  variant="contained"
                  size="large"
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
                  sx={{
                    px: 5,
                    py: 1.5,
                    borderRadius: 4,
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    fontFamily: "'Baloo 2', sans-serif",
                    textTransform: "none",
                    color: "#fff",
                    background:
                      "linear-gradient(135deg, #C8180A 0%, #E02010 100%)",
                    boxShadow: "0 6px 32px rgba(200,24,10,0.55)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #E02010 0%, #C8180A 100%)",
                      boxShadow: "0 8px 40px rgba(200,24,10,0.7)",
                    },
                  }}
                >
                  {t("pages.register.continueButton")}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
};

export default UserRegisterPage;
