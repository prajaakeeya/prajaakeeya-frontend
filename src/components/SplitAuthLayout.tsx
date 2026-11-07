import { Box, Button, Paper, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import prajakeeyaLogo from "../assets/images/prajakeeya.webp";
import AuthFooter from "./AuthFooter";
import PublicTopBar from "./PublicTopBar";

interface SplitAuthLayoutProps {
  leftTitle?: string;
  leftSubtitle?: string;
  leftButtonText?: string;
  onLeftButtonClick?: () => void;
  reverse?: boolean;
  children: ReactNode;
  topContent?: ReactNode;
  onRegisterToggle?: () => void;
  cardTitle?: string;
  showFooter?: boolean;
}

/** Brand panel on the left (desktop), auth card on the right. */
export default function SplitAuthLayout({
  reverse = false,
  children,
  topContent,
  onLeftButtonClick,
  onRegisterToggle,
  cardTitle,
  showFooter = true,
}: SplitAuthLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  const tabs = [
    { label: t("pages.login.title"), active: !reverse, onClick: reverse ? onLeftButtonClick : undefined },
    {
      label: t("pages.register.title"),
      active: reverse,
      onClick: !reverse ? () => { onLeftButtonClick?.(); onRegisterToggle?.(); } : undefined,
    },
  ];

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <PublicTopBar />

      <Box sx={{ flex: 1, display: "flex", pt: "64px" }}>
        {/* ── Brand panel (desktop) ── */}
        {!isMobile && (
          <Box
            sx={{
              width: "46%", flexShrink: 0,
              display: "flex", flexDirection: "column", justifyContent: "center",
              px: { md: 6, lg: 10 }, py: 6,
              bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100",
              borderRight: 1, borderColor: "divider",
            }}
          >
            <Box
              component="img"
              src={prajakeeyaLogo}
              alt="Prajaakeeya Logo"
              sx={{ width: 88, height: 88, borderRadius: 5, mb: 4 }}
            />
            <Typography variant="h1" sx={{ fontFamily: '"Noto Sans Kannada", inherit', fontSize: "3rem", lineHeight: 1.2 }}>
              ಪ್ರಜಾಕೀಯ
            </Typography>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.2em", mt: 0.5 }}>
              Prajaakeeya
            </Typography>
            <Box sx={{ width: 40, height: 3, bgcolor: "primary.main", borderRadius: 4, my: 4 }} />
            <Typography sx={{ color: "text.secondary", fontSize: "1.0625rem", maxWidth: 380 }}>
              {t("pages.login.footerMotto")}
            </Typography>
          </Box>
        )}

        {/* ── Auth card ── */}
        <Box
          sx={{
            flex: 1, minWidth: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            px: { xs: 2, sm: 4 }, py: { xs: 4, md: 6 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 440 }}>
            {topContent && <Box sx={{ mb: 3 }}>{topContent}</Box>}

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              {!onLeftButtonClick && cardTitle && (
                <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3 }}>
                  <Typography variant="h5" component="h2">{cardTitle}</Typography>
                  {cardTitle === t("pages.register.epicTitle", { defaultValue: "Voter / EPIC ID" }) && (
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                      {t("pages.register.epicNote")}
                    </Typography>
                  )}
                </Box>
              )}

              {onLeftButtonClick && (
                <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3 }}>
                  <Stack
                    direction="row"
                    sx={{ p: 0.5, borderRadius: 4, bgcolor: "action.hover", border: 1, borderColor: "divider" }}
                  >
                    {tabs.map((tab) => (
                      <Button
                        key={tab.label}
                        fullWidth
                        disabled={tab.active}
                        onClick={tab.onClick}
                        sx={{
                          minHeight: 36, borderRadius: 3, color: "text.secondary",
                          "&.Mui-disabled": {
                            color: "text.primary", bgcolor: "background.paper",
                            boxShadow: `0 1px 2px ${theme.palette.divider}`,
                          },
                        }}
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              )}

              <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3, pb: 4 }}>{children}</Box>
            </Paper>
          </Box>

          {showFooter && <Box sx={{ mt: 4 }}><AuthFooter /></Box>}
        </Box>
      </Box>
    </Box>
  );
}
