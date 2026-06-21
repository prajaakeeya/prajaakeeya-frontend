import { Box, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";

interface OtpInputProps {
  otpValues: string[];
  otpRefs: React.RefObject<HTMLInputElement>[];
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * Reusable 4-box OTP input component.
 * All logic (state, handlers) should come from the `useOtp` hook.
 */
export default function OtpInput({
  otpValues,
  otpRefs,
  onChange,
  onKeyDown,
  onPaste,
  disabled = false,
  label = "Enter OTP",
}: OtpInputProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ mb: 1 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: isDark ? "rgba(255,255,255,0.7)" : "rgba(17,24,39,0.7)",
          mb: 1.5,
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}>
        {otpValues.map((val, idx) => (
          <TextField
            key={idx}
            inputRef={otpRefs[idx]}
            value={val}
            onChange={(e) => onChange(idx, e.target.value)}
            onKeyDown={(e) => onKeyDown(idx, e as React.KeyboardEvent<HTMLInputElement>)}
            onPaste={idx === 0 ? onPaste : undefined}
            disabled={disabled}
            inputProps={{
              style: {
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: "bold",
                padding: "10px",
              },
              maxLength: 1,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            sx={{
              width: "56px",
              height: "56px",
              "& .MuiOutlinedInput-root": {
                height: "100%",
                borderRadius: "8px",
                color: isDark ? "#FFFFFF" : "#111827",
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
                "& fieldset": {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(17,24,39,0.18)",
                  borderWidth: "1.5px",
                },
                "&:hover fieldset": { borderColor: "#F5A800" },
                "&.Mui-focused fieldset": { borderColor: "#F5A800" },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
