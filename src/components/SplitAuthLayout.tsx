import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DarkModeRounded, LightModeRounded, CloudRounded } from "@mui/icons-material";
import RainEffect from "./RainEffect";
import { motion } from "framer-motion";
import { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import prajakeeyaLogo from "../assets/images/prajakeeya.webp";
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
  const { mode: storeMode, toggleTheme, rainEnabled, toggleRain } = useThemeStore();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { i18n, t } = useTranslation();

  // Derive colours from the theme + BRAND constants so both modes look great
  const bg = storeMode === "grey" ? "rgb(242, 241, 230)" : isDark ? BRAND.black : "#F3F0EB";
  const cardBg = storeMode === "grey"
    ? "#FFFFFF"
    : isDark
      ? "#1E2021"
      : "linear-gradient(160deg, #FFFFFF 0%, #FFF8F0 100%)";
  const cardShadow = isDark
    ? "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(200,24,10,0.25), inset 0 1px 0 rgba(255,255,255,0.06)"
    : "0 24px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(200,24,10,0.12), inset 0 1px 0 rgba(255,255,255,0.8)";
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

      {/* ── Diagonal split background ── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-200px",
            left: "-200px",
            width: "700px",
            height: "700px",
            background: BRAND.red,
            transform: "rotate(-35deg)",
            transformOrigin: "top left",
            opacity: 0.07,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-200px",
            right: "-200px",
            width: "700px",
            height: "700px",
            background: BRAND.yellow,
            transform: "rotate(-35deg)",
            transformOrigin: "bottom right",
            opacity: 0.05,
          }}
        />
      </Box>

      {/* ── Subtle grid ── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* ── Radial center glow ── */}
      <Box
        component={motion.div as any}
        animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
        sx={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,168,0,0.14) 0%, rgba(200,24,10,0.06) 40%, transparent 70%)",
          top: isMobile ? "28%" : "46%",
          left: isMobile ? "50%" : "26%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

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
          bgcolor: isDark ? "rgba(18,20,21,0.92)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component="img"
            src={prajakeeyaLogo}
            alt="Prajaakeeya Logo"
            sx={{ height: 32, objectFit: "contain", borderRadius: "6px" }}
          />
          <Typography
            sx={{
              fontFamily: '"Baloo 2", cursive',
              fontSize: "18px",
              fontWeight: 800,
              color: isDark ? "#FFE566" : BRAND.red,
              display: { xs: "none", sm: "block" }
            }}
          >
            ಪ್ರಜಾಕೀಯ
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {storeMode === 'grey' && (
            <Button
              size="small"
              onClick={toggleRain}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                p: 0,
                borderRadius: 50,
                bgcolor: '#4E535C',
                color: rainEnabled ? '#AECAE8' : '#9CA3AF',
                border: `1.5px solid ${rainEnabled ? '#C0C6CF' : '#626873'}`,
                boxShadow: rainEnabled ? '0 0 10px rgba(192,198,207,0.4)' : 'none',
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: '#5A606A' },
              }}
              title="Toggle Rain Effect"
            >
              <span style={{ fontSize: '18px' }}>🌧️</span>
            </Button>
          )}
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
              color: storeMode === 'light' ? '#111827' : storeMode === 'grey' ? '#9CA3AF' : '#F5A800',
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
              storeMode === 'dark'
                ? 'Switch to light theme'
                : storeMode === 'light'
                ? 'Switch to grey theme'
                : 'Switch to dark theme'
            }
          >
            {storeMode === 'dark' ? (
              <DarkModeRounded fontSize="small" />
            ) : storeMode === 'light' ? (
              <LightModeRounded fontSize="small" />
            ) : (
              <CloudRounded fontSize="small" />
            )}
          </Button>
          <LanguageSelector
            size="small"
            sx={{
              px: 2,
              py: 0.6,
              fontSize: "0.82rem",
              fontWeight: 700,
              borderRadius: 1,
              bgcolor: "transparent",
              color: isDark ? "#F5A800" : "#BE8507",
              border: `1.5px solid #F5A800`,
              fontFamily: '"Sora", sans-serif',
              textTransform: "none",
              transition: "all 0.2s ease",
              "&:hover": { bgcolor: "rgba(245, 168, 0, 0.08)" },
            }}
          />
        </Box>
      </Box>

      {/* Left panel removed to center auth card */}

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
                    color: isDark ? "#F5A800" : BRAND.red,
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
                        : "rgba(17,24,39,0.74)",
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
                      : "rgba(17,24,39,0.05)",
                    borderRadius: 50,
                    p: 0.5,
                    gap: 0.5,
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,39,0.10)"}`,
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
                            : "rgba(17,24,39,0.5)",
                        "&:hover": {
                          bgcolor: tab.active
                            ? BRAND.red2
                            : isDark
                              ? "rgba(255,255,255,0.07)"
                              : "rgba(17,24,39,0.05)",
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
            width: "100%",
          }}
        >
          <AuthFooter />
        </Box>
      )}
      {storeMode === 'grey' && rainEnabled && <RainEffect />}
    </Box>
  );
}
