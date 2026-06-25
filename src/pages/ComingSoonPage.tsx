import { useEffect, useMemo } from "react";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { BRAND } from "../theme";
import prajakeeyaLogo from "../assets/images/prajakeeya.webp";
import "./ComingSoonPage.css"; // M-SEC-4: keyframes now live in a real stylesheet

/* ── Floating text particle (Kannada / English word) ─────────────── */
const WORDS = ["ಪ್ರಜಾಕೀಯ", "Prajaakeeya"];

const FloatingWord = ({
  delay,
  x,
  color,
  word,
  fontSize,
}: {
  delay: number;
  x: number;
  color: string;
  word: string;
  fontSize: number;
}) => {
  const controls = useAnimation();

  useEffect(() => {
    const run = async () => {
      await new Promise((r) => setTimeout(r, delay * 1000));
      void controls.start({
        y: [0, -window.innerHeight - 100],
        opacity: [0, 0.5, 0.35, 0],
        x: [
          0,
          Math.sin(delay) * 60,
          Math.cos(delay) * -40,
          Math.sin(delay) * 30,
        ],
        rotate: [0, Math.sin(delay) * 8, Math.cos(delay) * -5, 0],
        transition: {
          duration: 10 + delay * 1.5,
          repeat: Infinity,
          ease: "easeOut",
        },
      });
    };
    void run();
  }, [controls, delay]);

  return (
    <motion.span
      animate={controls}
      style={{
        position: "absolute",
        bottom: -30,
        left: `${x}%`,
        fontSize,
        fontFamily:
          word === "ಪ್ರಜಾಕೀಯ"
            ? '"Noto Sans Kannada", sans-serif'
            : '"Playfair Display", serif',
        fontWeight: 700,
        color,
        opacity: 0,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {word}
    </motion.span>
  );
};

/* ── Glowing ring behind logo ────────────────────────────────────── */
const GlowRing = ({
  radius,
  delay,
  color,
}: {
  radius: number;
  delay: number;
  color: string;
}) => {
  const controls = useAnimation();

  useEffect(() => {
    const run = async () => {
      await new Promise((r) => setTimeout(r, delay * 1000));
      void controls.start({
        scale: [0.8, 1.4],
        opacity: [0.6, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeOut" },
      });
    };
    void run();
  }, [controls, delay]);

  return (
    <motion.div
      animate={controls}
      style={{
        position: "absolute",
        width: radius,
        height: radius,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        opacity: 0,
      }}
    />
  );
};

/* ── Main Coming Soon Page ───────────────────────────────────────── */
const ComingSoonPage = () => {
  const wordColors = [
    BRAND.red,
    BRAND.yellow,
    BRAND.yellow2,
    BRAND.saffron,
    BRAND.red2,
  ];

  const floatingWords = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        delay: Math.random() * 8,
        x: Math.random() * 90 + 5,
        fontSize: 12 + Math.random() * 14,
        color: wordColors[i % wordColors.length],
        word: WORDS[i % WORDS.length],
      })),
    [],
  );

  useEffect(() => {
    document.title = "Prajaakeeya — Coming Soon";
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(ellipse at 50% 20%, #1a0a08 0%, ${BRAND.black} 70%)`,
      }}
    >
      {/* ── Ambient gradient blobs ─────────────────────────────────── */}
      <motion.div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "60vw",
          height: "60vw",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND.saffron}15, transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "-10%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND.red}12, transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* ── Floating words (Kannada & English) ────────────────────── */}
      {floatingWords.map((w) => (
        <FloatingWord key={w.id} {...w} />
      ))}

      {/* ── Logo with glow rings ───────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
        }}
      >
        <GlowRing radius={220} delay={0} color={BRAND.saffron} />
        <GlowRing radius={260} delay={1} color={BRAND.yellow} />
        <GlowRing radius={300} delay={2} color={BRAND.red} />

        {/* Logo with CSS animation — guaranteed to replay on every load */}
        <Box
          component="img"
          src={prajakeeyaLogo}
          alt="Prajaakeeya"
          sx={{
            width: 160,
            height: 160,
            objectFit: "contain",
            position: "relative",
            zIndex: 2,
            animation: "logoSpinZoom 2.5s linear 0.2s both",
          }}
        />

        {/* Soft glow behind logo */}
        <Box
          sx={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND.saffron}40, transparent 70%)`,
            filter: "blur(30px)",
            zIndex: 1,
          }}
        />
      </Box>

      {/* ── "Coming Soon" text (CSS animation) ───────────────────── */}
      <Box sx={{ animation: "fadeSlideUp 0.8s ease-out 0.7s both" }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 800,
            fontSize: { xs: "2.2rem", sm: "3rem", md: "3.8rem" },
            textAlign: "center",
            background: `linear-gradient(135deg, ${BRAND.yellow2}, ${BRAND.saffron}, ${BRAND.red})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mt: 10,
            mb: 2,
          }}
        >
          Coming Soon
        </Typography>
      </Box>

      {/* ── Animated divider (CSS animation) ──────────────────────── */}
      <Box
        sx={{
          marginTop: "32px",
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${BRAND.saffron}, ${BRAND.yellow}, ${BRAND.saffron}, transparent)`,
          animation: "expandDivider 1s ease-out 1.3s both",
        }}
      />

      {/* ── Footer links ──────────────────────────────────────────── */}
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: { xs: 1, sm: 3 },
          px: 2,
          animation: "fadeSlideUp 0.8s ease-out 1.6s both",
        }}
      >
        <MuiLink
          component={Link}
          to="/privacy-policy"
          sx={{
            color: BRAND.yellow,
            fontSize: { xs: "0.68rem", sm: "0.8rem" },
            fontWeight: 600,
            textDecoration: "none",
            opacity: 0.7,
            "&:hover": { opacity: 1, textDecoration: "underline" },
          }}
        >
          Privacy Policy
        </MuiLink>
        <Box
          component="span"
          sx={{ color: BRAND.yellow, fontSize: "0.8rem", opacity: 0.4 }}
        >
          |
        </Box>
        <MuiLink
          component={Link}
          to="/terms-and-conditions"
          sx={{
            color: BRAND.yellow,
            fontSize: { xs: "0.68rem", sm: "0.8rem" },
            fontWeight: 600,
            textDecoration: "none",
            opacity: 0.7,
            "&:hover": { opacity: 1, textDecoration: "underline" },
          }}
        >
          Terms
        </MuiLink>
        <Box
          component="span"
          sx={{ color: BRAND.yellow, fontSize: "0.8rem", opacity: 0.4 }}
        >
          |
        </Box>
        <MuiLink
          component={Link}
          to="/community-guidelines"
          sx={{
            color: BRAND.yellow,
            fontSize: { xs: "0.68rem", sm: "0.8rem" },
            fontWeight: 600,
            textDecoration: "none",
            opacity: 0.7,
            "&:hover": { opacity: 1, textDecoration: "underline" },
          }}
        >
          Community Guidelines
        </MuiLink>
        <Box
          component="span"
          sx={{ color: BRAND.yellow, fontSize: "0.8rem", opacity: 0.4 }}
        >
          |
        </Box>
        <MuiLink
          component={Link}
          to="/child-safety"
          sx={{
            color: BRAND.yellow,
            fontSize: { xs: "0.68rem", sm: "0.8rem" },
            fontWeight: 600,
            textDecoration: "none",
            opacity: 0.7,
            "&:hover": { opacity: 1, textDecoration: "underline" },
          }}
        >
          Child Safety
        </MuiLink>
      </Box>
    </Box>
  );
};

export default ComingSoonPage;
