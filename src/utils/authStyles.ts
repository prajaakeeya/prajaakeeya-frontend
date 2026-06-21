import { Theme } from "@mui/material/styles";

/**
 * Returns the shared MUI `sx` object for auth page text fields.
 * Produces brand-consistent amber focus rings in both dark and light modes.
 */
export const getDarkFieldSx = (isDark: boolean, theme: Theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    color: isDark ? "#fff" : theme.palette.text.primary,
    "& fieldset": {
      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(17,24,39,0.18)",
    },
    "&:hover fieldset": { borderColor: "rgba(245,168,0,0.45)" },
    "&.Mui-focused fieldset": {
      borderColor: "#F5A800",
      borderWidth: "1.5px",
    },
  },
  "& .MuiInputLabel-root": {
    color: isDark ? "rgba(255,255,255,0.55)" : theme.palette.text.secondary,
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#F5A800" },
});

/**
 * Returns `sx` for the "Send OTP / use different" secondary action buttons.
 */
export const getOutlinedActionSx = (isDark: boolean) => ({
  py: 1.3,
  borderRadius: "10px",
  textTransform: "none" as const,
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
  },
});

export const darkFieldSx = (isDark: boolean, _theme: Theme) => ({
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
});
