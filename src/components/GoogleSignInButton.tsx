import { Box, Button, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const GoogleSvg = () => (
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
);

interface GoogleSignInButtonProps {
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * Unified Google Sign-In button used on Login and Register pages.
 */
export default function GoogleSignInButton({
  loading = false,
  disabled = false,
  onClick,
}: GoogleSignInButtonProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { t } = useTranslation();

  return (
    <Button
      type="button"
      variant="outlined"
      size="large"
      fullWidth
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={
        loading ? (
          <CircularProgress size={18} color="inherit" />
        ) : (
          <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
            <GoogleSvg />
          </Box>
        )
      }
      sx={{
        py: 1.3,
        borderRadius: "10px",
        textTransform: "none",
        fontWeight: 700,
        fontSize: "0.97rem",
        border: `1.5px solid ${isDark ? "rgba(255,255,255,0.18)" : "rgba(17,24,39,0.2)"}`,
        color: isDark ? "rgba(255,255,255,0.85)" : "rgba(17,24,39,0.85)",
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(4px)",
        "&:hover": {
          border: "1.5px solid #F5A800",
          background: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,1)",
        },
        "&.Mui-disabled": {
          opacity: 0.45,
        },
      }}
    >
      {loading ? t("common.loading") : t("pages.login.socialGoogle")}
    </Button>
  );
}
