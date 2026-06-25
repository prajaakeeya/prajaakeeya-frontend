import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Link,
} from "@mui/material";
import {
  InfoOutlined,
  GavelOutlined,
  VerifiedUserOutlined,
  PersonOutlined,
  HowToVoteOutlined,
  GroupOutlined,
  WarningOutlined,
  BlockOutlined,
  ArticleOutlined,
  DoneOutlined,
  BalanceOutlined,
  SecurityOutlined,
  PublicOutlined,
  UpdateOutlined,
  MailOutlined,
  AssignmentOutlined,
} from "@mui/icons-material";
import { DarkModeRounded, LightModeRounded, CloudRounded } from "@mui/icons-material";
import RainEffect from "../components/RainEffect";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import prajakeeyaLogo from "../assets/images/prajakeeya.webp";
import { BRAND } from "../theme";
import useThemeStore from "../store/useThemeStore";
import LanguageSelector from "../components/LanguageSelector";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BulletItem {
  text: string;
  sub?: string[];
}

interface TermsSection {
  id: string;
  title: string;
  icon: React.ReactElement;
  subsections?: {
    title: string;
    icon?: React.ReactElement;
    paragraphs?: string[];
    bullets?: BulletItem[];
  }[];
  paragraphs?: string[];
  bullets?: BulletItem[];
}

// ─── Data factory (needs `t` at render time) ──────────────────────────────────

function buildSections(t: TFunction): TermsSection[] {
  const p = "termsAndConditions.sections";
  return [
    {
      id: "1",
      title: t(`${p}.s1.title`),
      icon: <InfoOutlined />,
      paragraphs: [t(`${p}.s1.p1`)],
    },
    {
      id: "2",
      title: t(`${p}.s2.title`),
      icon: <ArticleOutlined />,
      paragraphs: [t(`${p}.s2.p1`)],
      bullets: [
        { text: t(`${p}.s2.b1`) },
        { text: t(`${p}.s2.b2`) },
        { text: t(`${p}.s2.b3`) },
        { text: t(`${p}.s2.b4`) },
        { text: t(`${p}.s2.b5`) },
        { text: t(`${p}.s2.b6`) },
      ],
    },
    {
      id: "3",
      title: t(`${p}.s3.title`),
      icon: <VerifiedUserOutlined />,
      paragraphs: [t(`${p}.s3.p1`)],
      bullets: [
        { text: t(`${p}.s3.b1`) },
        { text: t(`${p}.s3.b2`) },
        { text: t(`${p}.s3.b3`) },
        { text: t(`${p}.s3.b4`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s3.p2`)] }],
    },
    {
      id: "4",
      title: t(`${p}.s4.title`),
      icon: <PersonOutlined />,
      bullets: [
        { text: t(`${p}.s4.b1`) },
        { text: t(`${p}.s4.b2`) },
        { text: t(`${p}.s4.b3`) },
        { text: t(`${p}.s4.b4`) },
        { text: t(`${p}.s4.b5`) },
        { text: t(`${p}.s4.b6`) },
      ],
    },
    {
      id: "5",
      title: t(`${p}.s5.title`),
      icon: <PublicOutlined />,
      paragraphs: [t(`${p}.s5.p1`), t(`${p}.s5.p2`)],
      bullets: [
        { text: t(`${p}.s5.b1`) },
        { text: t(`${p}.s5.b2`) },
        { text: t(`${p}.s5.b3`) },
        { text: t(`${p}.s5.b4`) },
        { text: t(`${p}.s5.b5`) },
        { text: t(`${p}.s5.b6`) },
        { text: t(`${p}.s5.b7`) },
        { text: t(`${p}.s5.b8`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s5.p3`)] }],
    },
    {
      id: "6",
      title: t(`${p}.s6.title`),
      icon: <BalanceOutlined />,
      bullets: [
        { text: t(`${p}.s6.b1`) },
        { text: t(`${p}.s6.b2`) },
        { text: t(`${p}.s6.b3`) },
        { text: t(`${p}.s6.b4`) },
        { text: t(`${p}.s6.b5`) },
        { text: t(`${p}.s6.b6`) },
      ],
    },
    {
      id: "7",
      title: t(`${p}.s7.title`),
      icon: <GroupOutlined />,
      paragraphs: [t(`${p}.s7.p1`)],
      subsections: [
        {
          title: t(`${p}.s7.sub1.title`),
          bullets: [
            { text: t(`${p}.s7.sub1.b1`) },
            { text: t(`${p}.s7.sub1.b2`) },
            { text: t(`${p}.s7.sub1.b3`) },
            { text: t(`${p}.s7.sub1.b4`) },
            { text: t(`${p}.s7.sub1.b5`) },
          ],
        },
        {
          title: t(`${p}.s7.sub2.title`),
          bullets: [
            { text: t(`${p}.s7.sub2.b1`) },
            { text: t(`${p}.s7.sub2.b2`) },
            { text: t(`${p}.s7.sub2.b3`) },
            { text: t(`${p}.s7.sub2.b4`) },
            { text: t(`${p}.s7.sub2.b5`) },
            { text: t(`${p}.s7.sub2.b6`) },
            { text: t(`${p}.s7.sub2.b7`) },
            { text: t(`${p}.s7.sub2.b8`) },
            { text: t(`${p}.s7.sub2.b9`) },
            { text: t(`${p}.s7.sub2.b10`) },
          ],
        },
      ],
    },
    {
      id: "8",
      title: t(`${p}.s8.title`),
      icon: <PersonOutlined />,
      paragraphs: [t(`${p}.s8.p1`)],
      bullets: [
        { text: t(`${p}.s8.b1`) },
        { text: t(`${p}.s8.b2`) },
        { text: t(`${p}.s8.b3`) },
        { text: t(`${p}.s8.b4`) },
        { text: t(`${p}.s8.b5`) },
        { text: t(`${p}.s8.b6`) },
        { text: t(`${p}.s8.b7`) },
      ],
    },
    {
      id: "9",
      title: t(`${p}.s9.title`),
      icon: <WarningOutlined />,
      paragraphs: [t(`${p}.s9.p1`), t(`${p}.s9.p2`)],
      bullets: [
        { text: t(`${p}.s9.b1`) },
        { text: t(`${p}.s9.b2`) },
        { text: t(`${p}.s9.b3`) },
        { text: t(`${p}.s9.b4`) },
        { text: t(`${p}.s9.b5`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s9.p3`)] }],
    },
    {
      id: "10",
      title: t(`${p}.s10.title`),
      icon: <ArticleOutlined />,
      subsections: [
        {
          title: t(`${p}.s10.sub1.title`),
          bullets: [
            { text: t(`${p}.s10.sub1.b1`) },
            { text: t(`${p}.s10.sub1.b2`) },
            { text: t(`${p}.s10.sub1.b3`) },
          ],
        },
        {
          title: t(`${p}.s10.sub2.title`),
          bullets: [
            { text: t(`${p}.s10.sub2.b1`) },
            { text: t(`${p}.s10.sub2.b2`) },
            { text: t(`${p}.s10.sub2.b3`) },
          ],
        },
      ],
    },
    {
      id: "11",
      title: t(`${p}.s11.title`),
      icon: <HowToVoteOutlined />,
      bullets: [
        { text: t(`${p}.s11.b1`) },
        { text: t(`${p}.s11.b2`) },
        { text: t(`${p}.s11.b3`) },
        { text: t(`${p}.s11.b4`) },
        { text: t(`${p}.s11.b5`) },
        { text: t(`${p}.s11.b6`) },
        { text: t(`${p}.s11.b7`) },
      ],
    },
    {
      id: "12",
      title: t(`${p}.s12.title`),
      icon: <SecurityOutlined />,
      paragraphs: [t(`${p}.s12.p1`)],
      bullets: [
        { text: t(`${p}.s12.b1`) },
        { text: t(`${p}.s12.b2`) },
        { text: t(`${p}.s12.b3`) },
        { text: t(`${p}.s12.b4`) },
        { text: t(`${p}.s12.b5`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s12.p2`)] }],
    },
    {
      id: "13",
      title: t(`${p}.s13.title`),
      icon: <BlockOutlined />,
      paragraphs: [t(`${p}.s13.p1`)],
      bullets: [
        { text: t(`${p}.s13.b1`) },
        { text: t(`${p}.s13.b2`) },
        { text: t(`${p}.s13.b3`) },
        { text: t(`${p}.s13.b4`) },
        { text: t(`${p}.s13.b5`) },
        { text: t(`${p}.s13.b6`) },
      ],
      subsections: [{ title: "", paragraphs: [t(`${p}.s13.p2`)] }],
    },
    {
      id: "14",
      title: t(`${p}.s14.title`),
      icon: <GavelOutlined />,
      paragraphs: [t(`${p}.s14.p1`)],
      bullets: [
        { text: t(`${p}.s14.b1`) },
        { text: t(`${p}.s14.b2`) },
        { text: t(`${p}.s14.b3`) },
        { text: t(`${p}.s14.b4`) },
        { text: t(`${p}.s14.b5`) },
        { text: t(`${p}.s14.b6`) },
      ],
    },
    {
      id: "15",
      title: t(`${p}.s15.title`),
      icon: <AssignmentOutlined />,
      paragraphs: [t(`${p}.s15.p1`)],
      bullets: [
        { text: t(`${p}.s15.b1`) },
        { text: t(`${p}.s15.b2`) },
        { text: t(`${p}.s15.b3`) },
        { text: t(`${p}.s15.b4`) },
        { text: t(`${p}.s15.b5`) },
        { text: t(`${p}.s15.b6`) },
      ],
    },
    {
      id: "16",
      title: t(`${p}.s16.title`),
      icon: <SecurityOutlined />,
      paragraphs: [t(`${p}.s16.p1`)],
    },
    {
      id: "17",
      title: t(`${p}.s17.title`),
      icon: <PublicOutlined />,
      paragraphs: [t(`${p}.s17.p1`)],
    },
    {
      id: "18",
      title: t(`${p}.s18.title`),
      icon: <UpdateOutlined />,
      paragraphs: [t(`${p}.s18.p1`)],
    },
    {
      id: "19",
      title: t(`${p}.s19.title`),
      icon: <ArticleOutlined />,
      paragraphs: [t(`${p}.s19.p1`)],
    },
    {
      id: "20",
      title: t(`${p}.s20.title`),
      icon: <DoneOutlined />,
      paragraphs: [t(`${p}.s20.p1`)],
    },
    {
      id: "21",
      title: t(`${p}.s21.title`),
      icon: <BlockOutlined />,
      paragraphs: [t(`${p}.s21.p1`)],
    },
    {
      id: "22",
      title: t(`${p}.s22.title`),
      icon: <BalanceOutlined />,
      paragraphs: [t(`${p}.s22.p1`)],
    },
    {
      id: "23",
      title: t(`${p}.s23.title`),
      icon: <MailOutlined />,
      paragraphs: [t(`${p}.s23.p1`)],
      bullets: [{ text: t(`${p}.s23.b1`) }, { text: t(`${p}.s23.b2`) }],
      subsections: [{ title: "", paragraphs: [t(`${p}.s23.p2`)] }],
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BulletList({
  items,
  isDark,
}: {
  items: BulletItem[];
  isDark: boolean;
}) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <Box key={i} component="li" sx={{ mb: item.sub ? 0.5 : 0.25 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box
              component="span"
              sx={{
                mt: "7px",
                flexShrink: 0,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.yellow})`,
                boxShadow: `0 0 6px ${BRAND.yellow}55`,
              }}
            />
            <Typography
              sx={{
                fontSize: "0.92rem",
                lineHeight: 1.75,
                color: isDark
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(17,24,39,0.85)",
              }}
            >
              {item.text}
            </Typography>
          </Box>
          {item.sub && (
            <Box
              component="ul"
              sx={{ m: 0, pl: 3.5, listStyle: "none", mt: 0.5 }}
            >
              {item.sub.map((s, j) => (
                <Box
                  key={j}
                  component="li"
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    mb: 0.25,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      mt: "8px",
                      flexShrink: 0,
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: isDark ? "rgba(245,168,0,0.6)" : BRAND.yellow,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.87rem",
                      lineHeight: 1.7,
                      color: isDark
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(17,24,39,0.7)",
                    }}
                  >
                    {s}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TermsAndConditionsPage() {
  const { mode, toggleTheme, rainEnabled, toggleRain } = useThemeStore();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  // theme-derived tokens
  const pageBg = mode === "grey" ? "#202225" : isDark ? BRAND.black : "#F3F0EB";
  const cardBg = mode === "grey"
    ? "linear-gradient(160deg,#282a2d 0%,#202225 100%)"
    : isDark
      ? "linear-gradient(160deg,#1C1212 0%,#13161A 100%)"
      : "linear-gradient(160deg,#FFFFFF 0%,#FFF8F0 100%)";
  const cardShadow = isDark
    ? "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,24,10,0.2)"
    : "0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(200,24,10,0.1)";
  const headerBg = mode === "grey" ? "rgba(32,34,37,0.85)" : isDark ? "rgba(10,8,8,0.85)" : "rgba(243,240,235,0.92)";
  const bodyText = isDark ? "rgba(255,255,255,0.75)" : "rgba(17,24,39,0.78)";
  const dimText = isDark ? "rgba(255,255,255,0.4)" : "rgba(17,24,39,0.5)";

  // Build sections from translations (re-computed when language changes)
  const sections = useMemo(() => buildSections(t), [t]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: pageBg,
        position: "relative",
        pb: 8,
      }}
    >
      {/* ── Top accent stripe ── */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          zIndex: 500,
          display: "flex",
        }}
      >
        <Box sx={{ flex: 1, background: BRAND.red }} />
        <Box sx={{ flex: 1, background: BRAND.yellow }} />
        <Box sx={{ flex: 1, background: BRAND.red2 }} />
      </Box>

      {/* ── Bottom accent stripe ── */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 500,
          display: "flex",
          opacity: 0.5,
        }}
      >
        <Box sx={{ flex: 1, background: BRAND.red }} />
        <Box sx={{ flex: 1, background: BRAND.yellow }} />
        <Box sx={{ flex: 1, background: BRAND.red2 }} />
      </Box>

      {/* ── Sticky header ── */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 4,
          left: 0,
          right: 0,
          zIndex: 400,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          background: headerBg,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.08)"}`,
          px: isMobile ? 2 : 4,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo + name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
          }}
          onClick={() => navigate("/oath")}
        >
          <Box
            sx={{
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              borderRadius: "12px",
              background: `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red2} 180deg 270deg, ${BRAND.yellow2} 270deg 360deg)`,
              padding: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "10px",
                background: pageBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={prajakeeyaLogo}
                alt={t("termsAndConditions.header.logoAlt")}
                sx={{
                  width: isMobile ? 34 : 42,
                  height: isMobile ? 34 : 42,
                  borderRadius: "8px",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: '"Baloo 2", cursive',
                fontSize: isMobile ? "1.15rem" : "1.45rem",
                fontWeight: 900,
                lineHeight: 1.1,
                background: `linear-gradient(135deg, ${BRAND.red2} 0%, ${BRAND.yellow2} 45%, ${BRAND.yellow} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("termsAndConditions.header.appName")}
            </Typography>
            {!isMobile && (
              <Typography
                sx={{
                  fontFamily: '"Tiro Kannada", serif',
                  fontSize: "0.75rem",
                  color: dimText,
                  letterSpacing: "2px",
                }}
              >
                {t("termsAndConditions.header.appNameKn")}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Toggles */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {mode === 'grey' && (
            <Button
              size="small"
              onClick={toggleRain}
              sx={{
                minWidth: 38,
                width: 38,
                height: 38,
                p: 0,
                borderRadius: "50%",
                bgcolor: '#4E535C',
                color: rainEnabled ? '#AECAE8' : '#9CA3AF',
                border: `1.5px solid ${rainEnabled ? '#C0C6CF' : '#626873'}`,
                boxShadow: rainEnabled ? '0 2px 8px rgba(192,198,207,0.3)' : '0 2px 8px rgba(0,0,0,0.12)',
                mr: 1,
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
              minWidth: 38,
              width: 38,
              height: 38,
              p: 0,
              borderRadius: "50%",
              bgcolor: isDark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
              color: mode === 'light' ? '#111827' : mode === 'grey' ? '#9CA3AF' : BRAND.yellow,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(17,24,39,0.12)"}`,
              boxShadow: isDark
                ? "0 2px 8px rgba(0,0,0,0.35)"
                : "0 2px 8px rgba(17,24,39,0.12)",
              "&:hover": {
                bgcolor: isDark ? "rgba(255,255,255,0.14)" : "#f5f5f5",
              },
            }}
            aria-label={t("termsAndConditions.header.themeToggleLabel")}
          >
            {mode === 'dark' ? (
              <DarkModeRounded fontSize="small" />
            ) : mode === 'light' ? (
              <LightModeRounded fontSize="small" />
            ) : (
              <CloudRounded fontSize="small" />
            )}
          </Button>
          <LanguageSelector
            size="small"
            sx={{
              px: 1.75,
              py: 0.5,
              fontSize: "0.78rem",
              fontWeight: 700,
              borderRadius: 50,
              bgcolor: BRAND.yellow,
              color: BRAND.black,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              "&:hover": { bgcolor: "#d99000" },
            }}
          />
        </Box>
      </Box>

      {/* ── Hero banner: title + meta ── */}
      <Box
        component={motion.div as any}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        sx={{
          maxWidth: 860,
          mt: isMobile ? 3 : 4,
          mb: 3,
          mx: "auto",
          px: isMobile ? 2 : 4,
        }}
      >
        <Box
          sx={{
            background: cardBg,
            boxShadow: cardShadow,
            borderRadius: "20px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Top bar accent */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              zIndex: 10,
              background: `linear-gradient(90deg, ${BRAND.red} 0%, ${BRAND.yellow} 50%, ${BRAND.red2} 100%)`,
            }}
          />

          {/* Content */}
          <Box sx={{ pt: 4, pb: 3, px: isMobile ? 2.5 : 4 }}>
            <Typography
              sx={{
                fontSize: isMobile ? "1.75rem" : "2.5rem",
                fontWeight: 900,
                marginBottom: 1,
                background: `${BRAND.red}`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("termsAndConditions.hero.title")}
            </Typography>
            <Typography
              sx={{
                fontSize: isMobile ? "0.95rem" : "1.15rem",
                fontWeight: 700,
                color: isDark ? "rgba(245,168,0,0.85)" : BRAND.red2,
                marginBottom: 2,
              }}
            >
              {t("termsAndConditions.hero.association")}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.87rem",
                color: dimText,
                letterSpacing: "1px",
              }}
            >
              {t("termsAndConditions.hero.effectiveDate")}
            </Typography>
          </Box>

          {/* Intro text */}
          <Box sx={{ px: isMobile ? 2.5 : 4, pb: 4, pt: 2 }}>
            <Divider
              sx={{
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(17,24,39,0.08)",
                mb: 2.5,
              }}
            />
            <Typography
              sx={{
                fontSize: "0.95rem",
                color: bodyText,
                lineHeight: 1.8,
                mb: 1.5,
              }}
            >
              {t("termsAndConditions.hero.intro")}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.95rem",
                color: bodyText,
                lineHeight: 1.8,
              }}
            >
              {t("termsAndConditions.hero.affiliation")}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Policy sections ── */}
      <Box sx={{ maxWidth: 860, mx: "auto", px: isMobile ? 2 : 4, mb: 3 }}>
        {sections.map((section) => (
          <Box
            key={section.id}
            component={motion.div as any}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            sx={{
              mb: 2.5,
              background: cardBg,
              boxShadow: cardShadow,
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* Section header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: isMobile ? 2.5 : 4,
                py: 1.75,
                background: isDark
                  ? "linear-gradient(135deg, rgba(200,24,10,0.18), rgba(245,168,0,0.1))"
                  : "linear-gradient(135deg, rgba(200,24,10,0.07), rgba(245,168,0,0.05))",
                borderBottom: `1px solid ${isDark ? "rgba(245,168,0,0.15)" : "rgba(200,24,10,0.1)"}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  flexShrink: 0,
                  background: isDark
                    ? "rgba(245,168,0,0.12)"
                    : "rgba(200,24,10,0.08)",
                  color: isDark ? BRAND.yellow : BRAND.red,
                  "& svg": { fontSize: "1.25rem" },
                }}
              >
                {section.icon}
              </Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: isMobile ? "0.97rem" : "1.05rem",
                  color: isDark ? BRAND.yellow : BRAND.red,
                  letterSpacing: "0.2px",
                }}
              >
                {section.title}
              </Typography>
            </Box>

            {/* Section body */}
            <Box sx={{ px: isMobile ? 2.5 : 4, py: 2.5 }}>
              {section.paragraphs?.map((p, i) => (
                <Typography
                  key={i}
                  sx={{
                    fontSize: "0.92rem",
                    color: bodyText,
                    lineHeight: 1.8,
                    mb: 1,
                  }}
                >
                  {p}
                </Typography>
              ))}
              {section.bullets && (
                <Box sx={{ mt: 0.5, mb: 1 }}>
                  <BulletList items={section.bullets} isDark={isDark} />
                </Box>
              )}

              {section.subsections?.map((sub, si) => (
                <Box key={si} sx={{ mt: sub.title ? 2 : 1 }}>
                  {sub.title && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1.25,
                        pb: 0.75,
                        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.07)"}`,
                      }}
                    >
                      {sub.icon && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 30,
                            height: 30,
                            borderRadius: "8px",
                            flexShrink: 0,
                            background: isDark
                              ? "rgba(245,168,0,0.1)"
                              : "rgba(200,24,10,0.07)",
                            color: isDark ? BRAND.yellow : BRAND.red,
                            "& svg": { fontSize: "1rem" },
                          }}
                        >
                          {sub.icon}
                        </Box>
                      )}
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: isDark
                            ? "rgba(255,255,255,0.9)"
                            : "rgba(17,24,39,0.9)",
                        }}
                      >
                        {sub.title}
                      </Typography>
                    </Box>
                  )}
                  {sub.paragraphs?.map((p, pi) => (
                    <Typography
                      key={pi}
                      sx={{
                        fontSize: "0.92rem",
                        color: bodyText,
                        lineHeight: 1.8,
                        mb: 1,
                      }}
                    >
                      {p}
                    </Typography>
                  ))}
                  {sub.bullets && (
                    <Box sx={{ mt: 0.5, mb: 0.5 }}>
                      <BulletList items={sub.bullets} isDark={isDark} />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Footer note ── */}
      <Box
        component={motion.div as any}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        sx={{
          maxWidth: 860,
          mx: "auto",
          px: isMobile ? 2 : 4,
          mt: 3,
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.87rem",
            color: dimText,
            lineHeight: 1.7,
          }}
        >
          {t("termsAndConditions.footer.copyright")}
        </Typography>
      </Box>
      {mode === 'grey' && rainEnabled && <RainEffect />}
    </Box>
  );
}
