import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DarkModeRounded, LightModeRounded } from "@mui/icons-material";
import { motion } from "framer-motion";
import { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import prajakeeyaLogo from "../assets/images/prajakeeya.webp";
import authBg from "../assets/images/auth-bg.png";
import AuthFooter from "./AuthFooter";
import LanguageSelector from "./LanguageSelector";
import { BRAND, PARTICLE_COLORS } from "../theme";
import useThemeStore from "../store/useThemeStore";

// ── Static data ───────────────────────────────────────────────────────────────

const SOCIAL_LINKS_BASE = [
  { alt: "Facebook", href: "#" },
  { alt: "X", href: "#" },
  { alt: "YouTube", href: "#" },
  { alt: "Instagram", href: "#" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

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
  const isDark = theme.palette.mode === "dark";
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  // Derive colours from the theme + BRAND constants so both modes look great
  const bg = isDark ? "#0A0808" : "#F3F4F6";
  const cardBg = isDark
    ? "rgba(255,255,255,0.02)"
    : "#1F2937";
  const cardShadow = isDark
    ? "0 24px 64px rgba(0,0,0,0.6)"
    : "0 24px 64px rgba(0,0,0,0.25)";
  const subHeadingColor = isDark
    ? "rgba(255,255,255,0.45)"
    : theme.palette.text.secondary;
  const panelTextDim = isDark
    ? "rgba(255,255,255,0.55)"
    : "rgba(17,24,39,0.55)";
  const panelTextVeryDim = isDark
    ? "rgba(255,255,255,0.22)"
    : "rgba(17,24,39,0.3)";
  const gridColor = isDark ? "rgba(255,255,255,0.014)" : "rgba(17,24,39,0.025)";
  const loaderTrack = isDark ? "rgba(255,255,255,0.07)" : "rgba(17,24,39,0.08)";
  const footerText = isDark ? "rgba(255,255,255,0.65)" : "rgba(17,24,39,0.65)";
  const socialLinks = useMemo(
    () => [
      {
        ...SOCIAL_LINKS_BASE[0],
        src: "https://cdn.simpleicons.org/facebook/1877F2",
      },
      {
        ...SOCIAL_LINKS_BASE[1],
        src: isDark
          ? "https://cdn.simpleicons.org/x/ffffff"
          : "https://cdn.simpleicons.org/x/111827",
      },
      {
        ...SOCIAL_LINKS_BASE[2],
        src: "https://cdn.simpleicons.org/youtube/FF0000",
      },
      {
        ...SOCIAL_LINKS_BASE[3],
        src: "https://cdn.simpleicons.org/instagram/E4405F",
      },
    ],
    [isDark],
  );

  // Stable particle data
  const particles = useMemo(
    () =>
      Array.from({ length: 38 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        color:
          PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        opacity: 0.1 + Math.random() * 0.25,
        duration: 8 + Math.random() * 14,
        delay: Math.random() * 10,
      })),
    [],
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: bg,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Top accent bar ── */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          zIndex: 300,
          display: "flex",
        }}
      >
        <Box sx={{ flex: 1, background: BRAND.red }} />
        <Box sx={{ flex: 1, background: BRAND.yellow }} />
        <Box sx={{ flex: 1, background: BRAND.red2 }} />
      </Box>

      {/* AuthFooter is rendered inside the right panel below the card */}

      {/* ── Bottom accent bar ── */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          zIndex: 300,
          display: "flex",
          opacity: 0.5,
        }}
      >
        <Box sx={{ flex: 1, background: BRAND.red }} />
        <Box sx={{ flex: 1, background: BRAND.yellow }} />
        <Box sx={{ flex: 1, background: BRAND.red2 }} />
      </Box>


      {/* ── Floating particles ── */}
      {particles.map((p) => (
        <Box
          key={p.id}
          component={motion.div as any}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: "-105vh", opacity: [0, p.opacity, p.opacity * 0.6, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.1, 0.9, 1],
          }}
          sx={{
            position: "absolute",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 2,
            bottom: -5,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
          }}
        />
      ))}

      {/* ── Language + Theme toggles ── */}
      <Box
        component={motion.div as any}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: isMobile ? 1.5 : 3,
          py: isMobile ? 1 : 1.2,
          bgcolor: isDark ? "rgba(8,6,10,0.92)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 3 }, alignItems: 'center' }}>
          <Box
            component="img"
            src={prajakeeyaLogo}
            alt="Prajaakeeya"
            onClick={() => navigate('/')}
            sx={{ height: { xs: 28, sm: 36 }, cursor: 'pointer', mr: { xs: 0, sm: 1 } }}
          />
          {[
            { label: 'Home', path: '/' },
            { label: 'About Prajaakeeya', path: '/about' },
            { label: 'Members', path: '/registered-aspirants' },
          ].map((item) => (
            <Typography
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(17,24,39,0.7)',
                transition: 'color 0.2s',
                '&:hover': {
                  color: isDark ? '#FFFFFF' : '#111827',
                }
              }}
            >
              {item.label}
            </Typography>
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            onClick={toggleTheme}
            sx={{
              minWidth: 40,
              width: 40,
              height: 40,
              p: 0,
              borderRadius: 50,
              bgcolor: isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
              color: isDark ? "#F5A800" : "#111827",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(17,24,39,0.12)"}`,
              boxShadow: isDark
                ? "0 2px 10px rgba(0,0,0,0.35)"
                : "0 2px 10px rgba(17,24,39,0.15)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: isDark
                  ? "rgba(255,255,255,0.14)"
                  : "rgba(255,255,255,0.94)",
              },
            }}
            aria-label={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            {isDark ? (
              <LightModeRounded fontSize="small" />
            ) : (
              <DarkModeRounded fontSize="small" />
            )}
          </Button>
          <LanguageSelector
            size="small"
            sx={{
              px: 2,
              py: 0.6,
              fontSize: "0.82rem",
              fontWeight: 700,
              borderRadius: 50,
              bgcolor: BRAND.yellow,
              color: BRAND.black,
              textTransform: "none",
              boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
              transition: "all 0.2s ease",
              "&:hover": { bgcolor: "#d99000" },
            }}
          />
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════
                LEFT PANEL — Image Background (desktop only)
            ══════════════════════════════════════════════════════════════════ */}
      {!isMobile && (
        <Box
          component={motion.div as any}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          sx={{
            width: { md: "52%", lg: "50%" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            zIndex: 3,
            position: "relative",
            flexShrink: 0,
            backgroundImage: `url(${authBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Cinematic gradient overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: isDark
                ? "linear-gradient(to right, rgba(10,8,8,0.1) 0%, rgba(10,8,8,1) 100%)"
                : "linear-gradient(to right, rgba(243,244,246,0.1) 0%, rgba(243,244,246,1) 100%)",
              zIndex: 1,
            }}
          />
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════
                RIGHT PANEL — Auth card
            ══════════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: isMobile ? "70px 20px 16px" : "80px 48px 24px",
          zIndex: 5,
          position: "relative",
          minHeight: isMobile ? "auto" : "100vh",
        }}
      >
        <Box
          component={motion.div as any}
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          sx={{
            width: "100%",
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {topContent && <Box sx={{ mb: 2 }}>{topContent}</Box>}
          <Box
            sx={{
              width: "100%",
              background: cardBg,
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB',
              backdropFilter: "blur(24px)",
              borderRadius: "20px",
              boxShadow: cardShadow,
              overflow: "hidden",
            }}
          >
            {/* Conic accent bar */}
            <Box
              sx={{
                height: 4,
                background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red2} 180deg 270deg, ${BRAND.yellow2} 270deg 360deg)`,
              }}
            />

            {/* Card title (when no tabs) */}
            {!onLeftButtonClick && cardTitle && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 1.5,
                  background: isDark
                    ? "linear-gradient(135deg, rgba(200,24,10,0.25), rgba(245,168,0,0.15))"
                    : "linear-gradient(135deg, rgba(200,24,10,0.08), rgba(245,168,0,0.06))",
                  borderBottom: `1px solid ${isDark ? "rgba(245,168,0,0.2)" : "rgba(200,24,10,0.12)"}`,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    letterSpacing: "0.5px",
                    color: isDark ? "#F5A800" : "#FCD34D",
                  }}
                >
                  {cardTitle}
                </Typography>
                {cardTitle ===
                  t("pages.register.epicTitle", {
                    defaultValue: "Voter / EPIC ID",
                  }) && (
                  <Typography
                    sx={{
                      fontSize: "0.66rem",
                      color: isDark
                        ? "rgba(255,255,255,0.75)"
                        : "rgba(255,255,255,0.75)",
                      mt: 0.5,
                      py: "0px",
                      px: "12px",
                    }}
                  >
                    {t("pages.register.epicNote")}
                  </Typography>
                )}
              </Box>
            )}

            {/* Login / Register toggle */}
            {onLeftButtonClick && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  pt: 3,
                  pb: 0.5,
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.06)",
                    borderRadius: 50,
                    p: 0.5,
                    gap: 0.5,
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {[
                    {
                      label: t("pages.login.title"),
                      active: !reverse,
                      onClick: reverse ? onLeftButtonClick : undefined,
                    },
                    {
                      label: t("pages.register.title"),
                      active: reverse,
                      onClick: !reverse
                        ? () => {
                            onLeftButtonClick?.();
                            onRegisterToggle?.();
                          }
                        : undefined,
                    },
                  ].map((tab) => (
                    <Button
                      key={tab.label}
                      disabled={tab.active}
                      onClick={tab.onClick}
                      sx={{
                        borderRadius: 50,
                        px: 4,
                        py: 1,
                        fontWeight: 700,
                        fontSize: "0.93rem",
                        textTransform: "none",
                        minWidth: 112,
                        transition: "all 0.25s ease",
                        bgcolor: tab.active ? BRAND.red : "transparent",
                        color: tab.active
                          ? "#fff"
                          : isDark
                            ? "rgba(255,255,255,0.45)"
                            : "rgba(255,255,255,0.45)",
                        "&:hover": {
                          bgcolor: tab.active
                            ? BRAND.red2
                            : isDark
                              ? "rgba(255,255,255,0.07)"
                              : "rgba(255,255,255,0.07)",
                        },
                        "&.Mui-disabled": { bgcolor: BRAND.red, color: "#fff" },
                      }}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* Form */}
            <Box
              sx={{
                px: isMobile ? 3 : 5,
                pb: isMobile ? 12 : 5,
                pt: 3,
                maxHeight: "calc(100vh - 180px)",
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(245,168,0,0.3)",
                  borderRadius: "4px",
                },
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>

        {/* Footer - fixed at bottom */}
        {showFooter && (
          <Box
            sx={{
              position: "fixed",
              bottom: 4,
              left: 0,
              right: 0,
              zIndex: 350,
              bgcolor: isDark ? "rgba(8,6,10,0.92)" : "rgba(255,255,255,0.92)",
              backdropFilter: "blur(12px)",
              borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.08)"}`,
            }}
          >
            <AuthFooter />
          </Box>
        )}
      </Box>
    </Box>
  );
}
