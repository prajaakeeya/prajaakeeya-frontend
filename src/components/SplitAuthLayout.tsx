import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DarkModeRounded, LightModeRounded } from "@mui/icons-material";
import { motion } from "framer-motion";
import { ReactNode, useMemo, ElementType } from "react";
import { useTranslation } from "react-i18next";
import prajakeeyaLogo from "../assets/images/prajakeeya.webp";
import AuthFooter from "./AuthFooter";
import LanguageSelector from "./LanguageSelector";
import { BRAND, PARTICLE_COLORS } from "../theme";
import useThemeStore from "../store/useThemeStore";


// ── Types ─────────────────────────────────────────────────────────────────────

interface SplitAuthLayoutProps {
  leftTitle?: string;
  leftSubtitle?: string;
  onLeftButtonClick?: () => void;
  reverse?: boolean;
  children: ReactNode;
  topContent?: ReactNode;
  onRegisterToggle?: () => void;
  cardTitle?: string;
  showFooter?: boolean;
  underCardContent?: ReactNode;
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
  underCardContent,
}: SplitAuthLayoutProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { i18n, t } = useTranslation();

  // Derive colours from the theme + BRAND constants so both modes look great
  const bg = isDark ? BRAND.black : "#F3F0EB";
  const cardBg = isDark
    ? "linear-gradient(160deg, #1C1212 0%, #150E0E 100%)"
    : "linear-gradient(160deg, #FFFFFF 0%, #FFF8F0 100%)";
  const cardShadow = isDark
    ? "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(200,24,10,0.25), inset 0 1px 0 rgba(255,255,255,0.06)"
    : "0 24px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(200,24,10,0.12), inset 0 1px 0 rgba(255,255,255,0.8)";

  const panelTextDim = isDark
    ? "rgba(255,255,255,0.55)"
    : "rgba(17,24,39,0.55)";
  const panelTextVeryDim = isDark
    ? "rgba(255,255,255,0.22)"
    : "rgba(17,24,39,0.3)";
  const gridColor = isDark ? "rgba(255,255,255,0.014)" : "rgba(17,24,39,0.025)";
  const loaderTrack = isDark ? "rgba(255,255,255,0.07)" : "rgba(17,24,39,0.08)";
  const footerText = isDark ? "rgba(255,255,255,0.65)" : "rgba(17,24,39,0.65)";
  

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
        height: "100vh",
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
        component={motion.div as ElementType}
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
          component={motion.div as ElementType}
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
        component={motion.div as ElementType}
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
        <Box sx={{ width: 40 }} />
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

      {/* ── Scrollable Content Wrapper ── */}
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          overflowY: "auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          position: "relative",
          zIndex: 3,
          pb: { xs: "120px", md: "80px" },
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════
                  LEFT PANEL — Branding (desktop only)
              ══════════════════════════════════════════════════════════════════ */}
        {!isMobile && (
          <Box
            component={motion.div as ElementType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            sx={{
              width: { md: "52%", lg: "50%" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pt: "20px",
              pb: "60px",
              minHeight: "100vh",
            zIndex: 3,
            position: "relative",
            flexShrink: 0,
          }}
        >
          {/* Status row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: 400,
              px: 2,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "9.5px",
                fontWeight: 600,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: panelTextVeryDim,
              }}
            >
              Prajaakeeya
            </Typography>
            <Box
              component={motion.div as ElementType}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: BRAND.yellow,
                boxShadow: `0 0 8px ${BRAND.yellow}`,
              }}
            />
          </Box>

          {/* Logo ring */}
          <Box
            component={motion.div as ElementType}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Box
              sx={{
                width: 174,
                height: 174,
                borderRadius: "38px",
                background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red2} 180deg 270deg, ${BRAND.yellow2} 270deg 360deg)`,
                padding: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "35px",
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 0 40px rgba(245,168,0,0.2), inset 0 0 20px rgba(200,24,10,0.1)",
                }}
              >
                <motion.img
                  src={prajakeeyaLogo}
                  alt="Prajaakeeya Logo"
                  animate={{
                    filter: [
                      "drop-shadow(0 0 14px rgba(245,168,0,0.4))",
                      "drop-shadow(0 0 28px rgba(245,168,0,0.8)) drop-shadow(0 0 50px rgba(200,24,10,0.3))",
                      "drop-shadow(0 0 14px rgba(245,168,0,0.4))",
                    ],
                  }}
                  transition={{
                    duration: 3.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  style={{
                    width: 152,
                    height: 152,
                    borderRadius: "32px",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* App name */}
          <Box
            component={motion.div as ElementType}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 2.75,
              gap: 0,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Baloo 2", cursive',
                fontSize: "44px",
                fontWeight: 900,
                letterSpacing: "2px",
                lineHeight: 1.17,
                background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.yellow2} 45%, ${BRAND.yellow} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 12px rgba(245,168,0,0.35))",
              }}
            >
              ಪ್ರಜಾಕೀಯ
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Tiro Kannada", serif',
                fontSize: "20px",
                color: panelTextDim,
                letterSpacing: "3px",
              }}
            >
              Prajaakeeya
            </Typography>
          </Box>

          {/* Divider with fist */}
          <Box
            component={motion.div as ElementType}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            sx={{ display: "flex", alignItems: "center", gap: 1.25, mt: 1.75 }}
          >
            <Box
              sx={{
                width: 60,
                height: "1.5px",
                background: `linear-gradient(90deg, transparent, ${BRAND.red})`,
              }}
            />
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.yellow})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                boxShadow: `0 0 12px rgba(245,168,0,0.4)`,
              }}
            >
              ✊
            </Box>
            <Box
              sx={{
                width: 60,
                height: "1.5px",
                background: `linear-gradient(90deg, ${BRAND.yellow}, transparent)`,
              }}
            />
          </Box>

          {/* Loader + footer */}
          <Box
            component={motion.div as ElementType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            sx={{
              width: "100%",
              maxWidth: 400,
              px: 2.5,
              mt: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            {/* Loader bar */}
            <Box
              sx={{
                width: "100%",
                height: "2.5px",
                background: loaderTrack,
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Box
                component={motion.div as ElementType}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, delay: 1, ease: [0.4, 0, 0.2, 1] }}
                sx={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.yellow2}, ${BRAND.red2})`,
                  borderRadius: 1,
                  boxShadow: "0 0 10px rgba(245,168,0,0.5)",
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: i18n.language?.startsWith("kn") ? "13px" : "10px",
                color: footerText,
                letterSpacing: i18n.language?.startsWith("kn")
                  ? "1.5px"
                  : "2.2px",
                textTransform: i18n.language?.startsWith("kn")
                  ? "none"
                  : "uppercase",
                fontWeight: i18n.language?.startsWith("kn") ? 500 : 300,
                fontFamily: i18n.language?.startsWith("kn")
                  ? '"Tiro Kannada", serif'
                  : "inherit",
              }}
            >
              {i18n.t("pages.login.footerMotto")}
            </Typography>

            {/* Social links */}
            {/* <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                            {socialLinks.map(s => (
                                <Box key={s.alt} component="a" href={s.href} target="_blank" rel="noopener noreferrer"
                                    sx={{ display: 'flex', opacity: 0.75, transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }}>
                                    <Box component="img" src={s.src} alt={s.alt} sx={{ width: 20, height: 20 }} />
                                </Box>
                            ))}
                        </Box> */}
          </Box>
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
          p: isMobile ? "65px 20px 100px" : "70px 48px 100px",
          zIndex: 5,
          position: "relative",
          minHeight: "100vh",
        }}
      >
        <Box
          component={motion.div as ElementType}
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          sx={{
            width: "100%",
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            mt: "2vh",
            mb: "auto",
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
                pb: 5,
                pt: 3,
              }}
            >
              {children}
            </Box>
          </Box>
          {underCardContent && (
            <Box sx={{ width: "100%", mt: 2.5 }}>
              {underCardContent}
            </Box>
          )}
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
  );
}
