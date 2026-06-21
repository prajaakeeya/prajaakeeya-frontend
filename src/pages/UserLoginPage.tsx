import { useState, useEffect, ReactNode } from "react";
import {
  TextField,
  Button,
  Stack,
  Alert,
  Box,
  CircularProgress,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import prajakeeyaLogo from "../assets/images/prajakeeya.webp";
import SplitAuthLayout from "../components/SplitAuthLayout";
import GoogleSignInButton from "../components/GoogleSignInButton";
import OtpInput from "../components/OtpInput";
import { useOtp } from "../hooks/useOtp";
import { darkFieldSx } from "../utils/authStyles";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import {
  sendOtpUnified,
  verifyOtpUnified,
  getGoogleOAuthUrl,
} from "../services/authService";

const UserLoginPage = () => {
  const { t } = useTranslation();
  const { setAuth, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [error, setError] = useState<ReactNode>("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [loginMethod, setLoginMethod] = useState<"google" | "phone" | "email">(
    "google",
  );
  const [identifier, setIdentifier] = useState(() => {
    return searchParams.get("identifier") || "";
  });
  const [otpSent, setOtpSent] = useState(false);
  const [verificationId, setVerificationId] = useState("");

  const onVerifyOtp = async (otpCode: string) => {
    setError("");
    setLoading(true);
    try {
      let token, user;

      if (loginMethod === "phone") {
        const response = await verifyOtpUnified({
          phone: identifier,
          verificationId,
          otp: otpCode,
          purpose: "login",
        });
        token = response.token;
        user = response.user;
      } else {
        const response = await verifyOtpUnified({
          email: identifier,
          verificationId,
          otp: otpCode,
          purpose: "login",
        });
        token = response.token;
        user = response.user;
      }

      if (user) {
        clearSession();
        setRedirecting(true);
        setAuth(token, user);
        navigate("/user/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const apiMessage =
        apiError?.response?.data?.message ||
        apiError?.response?.data?.error ||
        apiError?.message;
      setError(apiMessage || t("pages.login.otpVerifyFailed"));
      setRedirecting(false);
    } finally {
      setLoading(false);
    }
  };

  const { otp, otpValues, otpRefs, handleOtpChange, handleOtpKeyDown, handleOtpPaste, resetOtp } =
    useOtp(onVerifyOtp);

  const isInWebView =
    typeof window !== "undefined" &&
    (/ReactNative/i.test(navigator.userAgent || "") ||
      (window as any).isPrajaakeeyaApp);

  const onGoogleSignIn = () => {
    setError("");
    // In React Native WebView, delegate to native layer (it will open the same URL in an in-app browser)
    if (isInWebView && /ReactNative/i.test(navigator.userAgent || "")) {
      (window as any).ReactNativeWebView?.postMessage(
        JSON.stringify({ type: "GOOGLE_SIGN_IN", url: getGoogleOAuthUrl() }),
      );
      return;
    }
    setGoogleLoading(true);
    // Clear any stale auth before starting the OAuth flow
    clearSession();
    // Use replace() (not href=) so the login page is REPLACED in history rather
    // than stacked. Combined with the callback's navigate(..., { replace: true }),
    // the whole OAuth round-trip leaves nothing on the back stack — so after sign-in,
    // Back / pressing login again can't re-enter the Google sign-in flow.
    window.location.replace(getGoogleOAuthUrl());
  };

  const onRequestOtp = async () => {
    setError("");
    const isPhone = /^\d{10}$/.test(identifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isPhone && !isEmail) {
      setError(t("validation.identifierInvalid"));
      return;
    }

    setLoading(true);

    try {
      if (isPhone) {
        const response = await sendOtpUnified({ phone: identifier, purpose: "login" });
        setLoginMethod("phone");
        if (response.verificationId) setVerificationId(response.verificationId);
      } else {
        const response = await sendOtpUnified({ email: identifier, purpose: "login" });
        setLoginMethod("email");
        if (response.verificationId) setVerificationId(response.verificationId);
      }
      setOtpSent(true);
      setOtpTimer(60);
    } catch (err: unknown) {
      const apiError = err as {
        response?: { status?: number; data?: { message?: string; error?: string } };
        message?: string;
      };
      const apiMessage =
        apiError?.response?.data?.message ||
        apiError?.response?.data?.error ||
        apiError?.message;
      if (apiError?.response?.status === 404) {
        setError(
          <>
            {t("pages.login.userNotRegistered")}{" "}
            <span
              onClick={() => navigate(`/register?identifier=${encodeURIComponent(identifier)}`)}
              style={{
                textDecoration: "underline",
                color: "#F5A800",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {t("pages.login.clickHereToRegister")}
            </span>
          </>
        );
      } else {
        setError(apiMessage || t("pages.login.otpSendFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (otpTimer <= 0) return;
    const timer = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimer]);

  if (redirecting) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%)",
          zIndex: 1300,
        }}
      >
        <CircularProgress />
      </div>
    );
  }


  return (
    <SplitAuthLayout
      leftTitle={t("pages.login.leftTitle")}
      leftSubtitle={t("pages.login.leftSubtitle")}
      cardTitle={t("pages.login.title")}
      underCardContent={
        !otpSent && (
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate("/guest/dashboard")}
            sx={{
              py: 1,
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.88rem",
              textTransform: "uppercase",
              border: `1.5px solid ${isDark ? "rgba(245,168,0,0.4)" : "rgba(245,168,0,0.5)"}`,
              color: "#F5A800",
              "&:hover": {
                border: "1.5px solid #F5A800",
                bgcolor: "rgba(245,168,0,0.08)",
              },
            }}
          >
            {t("pages.login.continueAsGuest")}
          </Button>
        )
      }
      topContent={
        <Box
          sx={{
            textAlign: "center",
            display: { xs: "flex", md: "none" },
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
            }}
          >
            {t("pages.login.oath.title")}
          </Typography>
        </Box>
      }
    >
      <Box sx={{ width: "100%" }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 3,
              bgcolor: "rgba(200,24,10,0.12)",
              color: "#fca5a5",
              border: "1px solid rgba(200,24,10,0.3)",
              "& .MuiAlert-icon": { color: "#f87171" },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Unified Login Options */}
        <Stack spacing={2.5}>
          {/* Google Sign In + Divider */}
          {!otpSent && (
            <>
              <GoogleSignInButton
                loading={googleLoading}
                disabled={loading}
                onClick={onGoogleSignIn}
              />

              {/* Email / Phone Divider */}
              <Divider
                sx={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)" }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    px: 1,
                    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)",
                  }}
                >
                  {t("pages.login.otpDivider")}
                </Typography>
              </Divider>
            </>
          )}

          {/* OTP Form */}
          {!otpSent ? (
            <>
              <TextField
                fullWidth
                label={t("pages.login.identifierLabel")}
                placeholder={t("pages.login.identifierPlaceholder")}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                sx={darkFieldSx(isDark, theme)}
              />
              <Button
                variant="outlined"
                fullWidth
                disabled={loading || identifier.length < 5}
                onClick={onRequestOtp}
                sx={{
                  py: 1.3,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.97rem",
                  borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(17,24,39,0.18)",
                  color: isDark ? "#FFFFFF" : "#111827",
                  bgcolor: isDark ? "rgba(255,255,255,0.03)" : "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(17,24,39,0.35)",
                    bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(17,24,39,0.03)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  t("pages.login.sendOtp")
                )}
              </Button>
            </>
          ) : (
            <>
              <OtpInput
                otpValues={otpValues}
                otpRefs={otpRefs}
                onChange={handleOtpChange}
                onKeyDown={handleOtpKeyDown}
                onPaste={handleOtpPaste}
                disabled={loading}
                label={t("pages.login.enterOtp")}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isDark ? "rgba(255,255,255,0.7)" : "text.secondary",
                  }}
                >
                  {otpTimer > 0
                    ? t("pages.login.resendInSeconds", { seconds: otpTimer })
                    : t("pages.login.didntReceiveCode")}
                </Typography>
                <Button
                  variant="text"
                  disabled={otpTimer > 0 || loading}
                  onClick={onRequestOtp}
                  sx={{
                    textTransform: "none",
                    color: "#F5A800",
                    fontWeight: 600,
                  }}
                >
                  {t("pages.login.resendOtp")}
                </Button>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                disabled={loading || otp.length !== 4}
                onClick={() => onVerifyOtp(otp)}
                sx={{
                  py: 1.3,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.97rem",
                  borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(17,24,39,0.18)",
                  color: isDark ? "#FFFFFF" : "#111827",
                  bgcolor: isDark ? "rgba(255,255,255,0.03)" : "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(17,24,39,0.35)",
                    bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(17,24,39,0.03)",
                  },
                  "&.Mui-disabled": {
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,39,0.08)",
                    color: isDark ? "rgba(255,255,255,0.25)" : "rgba(17,24,39,0.35)",
                    bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(17,24,39,0.02)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  t("pages.login.verifyOtp")
                )}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setOtpSent(false);
                  resetOtp();
                  setError("");
                }}
                disabled={loading}
                sx={{
                  py: 1,
                  borderRadius: "10px",
                  textTransform: "none",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.2)",
                  color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                }}
              >
                {t("pages.login.changeIdentifier")}
              </Button>
            </>
          )}
        </Stack>

        {/* Bottom actions — always visible */}
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Divider
            sx={{
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(17,24,39,0.1)",
            }}
          />

          <Typography
            sx={{
              textAlign: "center",
              fontSize: "0.82rem",
              color: isDark ? "rgba(255,255,255,0.35)" : "rgba(17,24,39,0.62)",
            }}
          >
            {t("pages.login.noAccount")}{" "}
            <Box
              component="span"
              onClick={() => {
                if (!otpSent) navigate("/oath");
              }}
              sx={{
                color: "#F5A800",
                fontWeight: 600,
                cursor: otpSent ? "not-allowed" : "pointer",
                opacity: otpSent ? 0.5 : 1,
                "&:hover": { textDecoration: otpSent ? "none" : "underline" },
              }}
            >
              {t("pages.login.signUp")}
            </Box>
          </Typography>
        </Stack>
      </Box>
    </SplitAuthLayout>
  );
};

export default UserLoginPage;
