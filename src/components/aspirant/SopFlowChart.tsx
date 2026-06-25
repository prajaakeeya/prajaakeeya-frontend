import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
  Button,
  useTheme,
} from '@mui/material';

// ── Dark theme — matches Prajaakeeya HTML design ─────────────────────────────
// Red   = People Involvement      (gradient red)
// Blue  = PR & Others Involvement (gradient blue)
// Brown = PR's Involvement        (dark brown, gold text)

const C = {
  red: { bg: 'linear-gradient(135deg,rgba(200,24,10,.88),rgba(224,32,16,.75))', border: 'rgba(200,24,10,.55)', text: '#fff', shadow: '0 3px 18px rgba(200,24,10,.3)' },
  blue: { bg: 'linear-gradient(135deg,rgba(27,47,122,.92),rgba(37,58,154,.8))', border: 'rgba(37,58,154,.6)', text: '#fff', shadow: '0 3px 18px rgba(27,47,122,.35)' },
  brown: { bg: 'linear-gradient(135deg,rgba(74,40,0,.95),rgba(107,58,0,.85))', border: 'rgba(245,168,0,.28)', text: '#FFCB00', shadow: '0 3px 14px rgba(245,168,0,.08)' },
};
type ColorKey = keyof typeof C;

const GOLD = 'rgba(245,168,0,0.75)';
const GOLDD = 'rgba(245,168,0,0.45)';
const GOLDB = 'rgba(245,168,0,0.82)';
const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;
const DARK = '#08060A';

// ── Primitives ────────────────────────────────────────────────────────────────

// Flow node rectangle
const FNode = ({ label, ck, delay = 0, sx = {} }: {
  label: React.ReactNode; ck: ColorKey; delay?: number; sx?: Record<string, any>;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ filter: 'brightness(1.12)' }}
    viewport={{ once: true, margin: '-16px' }}
    transition={{ duration: 0.35, delay, type: 'spring', stiffness: 280, damping: 24 }}
    style={{ width: '100%', cursor: 'default' }}
  >
    <Box sx={{
      borderRadius: '10px',
      px: { xs: 1.5, sm: 2 }, py: { xs: 1.2, sm: 1.5 },
      background: C[ck].bg,
      border: `1px solid ${C[ck].border}`,
      color: C[ck].text,
      textAlign: 'center',
      fontFamily: FF_BODY,
      fontWeight: 600,
      fontSize: { xs: '11.5px', sm: '14px' },
      lineHeight: 1.45,
      boxShadow: C[ck].shadow,
      ...sx,
    }}>
      {label}
    </Box>
  </motion.div>
);

// Single gold arrow
const Arrow = ({ height = 28 }: { height?: number }) => (
  <motion.div
    initial={{ opacity: 0, scaleY: 0 }}
    whileInView={{ opacity: 1, scaleY: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.22 }}
    style={{ originY: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1px 0', flexShrink: 0 }}
  >
    <Box sx={{ width: '2px', height: `${height}px`, background: `linear-gradient(180deg,${GOLD},${GOLDD})`, borderRadius: '1px' }} />
    <Box sx={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `10px solid ${GOLD}` }} />
  </motion.div>
);

// Animated SVG wrapper for fan/connector lines
const FlowSvg = ({ vb, h, children }: { vb: string; h: number; children: React.ReactNode }) => (
  <motion.svg
    viewBox={vb} style={{ width: '100%', height: h, display: 'block', overflow: 'visible' }}
    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
  >
    {children}
  </motion.svg>
);

// Verdict diamond — CSS rotate(45deg) with pulsing glow
const VerdictDiamond = ({ label }: { label: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.84 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: '-20px' }}
    transition={{ duration: 0.45, type: 'spring', stiffness: 240, damping: 22 }}
    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '6px 0' }}
  >
    <Box sx={{
      width: { xs: 90, sm: 128, md: 148 }, height: { xs: 90, sm: 128, md: 148 },
      background: 'linear-gradient(135deg,rgba(200,24,10,.88),rgba(200,24,10,.62))',
      border: '2.5px solid #C8180A',
      transform: 'rotate(45deg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      '@keyframes dp': {
        '0%,100%': { boxShadow: '0 0 20px rgba(200,24,10,.4)' },
        '50%': { boxShadow: '0 0 48px rgba(245,168,0,.55)' },
      },
      animation: 'dp 2.5s ease-in-out infinite',
    }}>
      <Typography sx={{
        transform: 'rotate(-45deg)',
        fontFamily: FF_HEADING, fontWeight: 800,
        fontSize: { xs: '11px', sm: '14px' },
        color: '#fff', textAlign: 'center', lineHeight: 1.2,
      }}>
        {label}
      </Typography>
    </Box>
  </motion.div>
);

// Result SVG diamond (Positive / Negative) — SVG polygon with glow filter
const ResultDiamondSVG = ({ positive, label, delay = 0 }: { positive: boolean; label: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-16px' }}
    transition={{ duration: 0.4, delay, type: 'spring', stiffness: 260, damping: 20 }}
    style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
  >
    <Box component="svg" viewBox="0 0 200 230" sx={{ width: { xs: 110, sm: 145 }, height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id={positive ? 'gPos' : 'gNeg'} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={positive ? 'rgba(200,24,10,.92)' : 'rgba(220,30,12,.92)'} />
          <stop offset="100%" stopColor="rgba(150,8,0,.72)" />
        </linearGradient>
        <filter id={positive ? 'fPos' : 'fNeg'} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <polygon points="100,12 188,100 100,188 12,100"
        fill={`url(#${positive ? 'gPos' : 'gNeg'})`}
        stroke={positive ? '#C8180A' : '#E02010'} strokeWidth="2.5"
        filter={`url(#${positive ? 'fPos' : 'fNeg'})`} />
      <text x="100" y="93" textAnchor="middle" fontFamily="'Baloo 2',cursive" fontSize="16" fontWeight="800" fill="white">
        {label.split(' ')[0]}
      </text>
      <text x="100" y="113" textAnchor="middle" fontFamily="'Baloo 2',cursive" fontSize="16" fontWeight="800" fill="white">
        {label.split(' ').slice(1).join(' ')}
      </text>
      <line x1="100" y1="188" x2="100" y2="212" stroke={GOLD} strokeWidth="2" />
      <polygon points="93,208 107,208 100,222" fill={GOLD} />
    </Box>
  </motion.div>
);

// Small uppercase eyebrow label inside a node
const NL = ({ children }: { children: React.ReactNode }) => (
  <Box component="span" sx={{
    display: 'block', fontSize: '9px', letterSpacing: '2.5px',
    textTransform: 'uppercase', opacity: 0.5, mb: '2px', fontWeight: 700,
  }}>
    {children}
  </Box>
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface BypassState {
  svgW: number; svgH: number;
  ox: number; oy: number; ex: number; ey: number;
  pipe: number; r: number; mid: number;
}

// ── Main component ────────────────────────────────────────────────────────────

interface SopFlowChartProps {
  sopAgreed: boolean;
  setSopAgreed: (v: boolean) => void;
  onAgree: () => void;
  onCancel?: () => void;
  /** When true, hides the agree-checkbox and proceed button (for view-only pages) */
  hideAgreement?: boolean;
  /** Optional content rendered inside the SOP container, above the bottom color bar */
  signatureSlot?: React.ReactNode;
}

const SopFlowChart = ({ sopAgreed, setSopAgreed, onAgree, onCancel, hideAgreement = false, signatureSlot }: SopFlowChartProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const fc = (key: string) => t(`forms.aspirant.sop.flowChart.${key}`);
  const PL = 54; // pipe-left offset (px) — space for bypass line
  const canvasBg = isDark ? DARK : 'linear-gradient(180deg, #fffdfa 0%, #f9f4ec 100%)';
  const stripBg = isDark ? 'rgba(255,255,255,.018)' : 'rgba(17,24,39,.03)';
  const stripBorder = isDark ? '1px solid rgba(255,255,255,.05)' : '1px solid rgba(17,24,39,.08)';
  const legendText = isDark ? 'rgba(254,253,248,.85)' : 'rgba(15,23,42,.8)';
  const contentText = isDark ? 'rgba(255,255,255,.82)' : 'rgba(15,23,42,.84)';
  const mutedText = isDark ? 'rgba(255,255,255,.62)' : 'rgba(15,23,42,.72)';
  const lineNoteText = isDark ? 'rgba(245,168,0,0.45)' : 'rgba(180,110,0,0.86)';
  const cardSubtleBg = isDark ? 'rgba(255,255,255,.04)' : 'rgba(15,23,42,.04)';
  const cardSubtleBorder = isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(15,23,42,.12)';

  // Bypass SVG — mirrors drawBypass() from the HTML design
  const bypassRef = useRef<HTMLDivElement>(null);
  const ongoingRef = useRef<HTMLDivElement>(null);
  const execRef = useRef<HTMLDivElement>(null);
  const [bypass, setBypass] = useState<BypassState | null>(null);

  useEffect(() => {
    const draw = () => {
      const section = bypassRef.current;
      const ongoing = ongoingRef.current;
      const exec = execRef.current;
      if (!section || !ongoing || !exec) return;
      const sR = section.getBoundingClientRect();
      const oR = ongoing.getBoundingClientRect();
      const eR = exec.getBoundingClientRect();
      const pipe = 30, r = 12;
      const svgW = sR.width + PL;
      const svgH = eR.bottom - sR.top + 20;
      const ox = (oR.left - sR.left) + PL + oR.width / 200;
      const oy = oR.top - sR.top + oR.height / 2;
      const ex = (eR.left - sR.left) + PL;
      const ey = eR.top - sR.top + eR.height / 2;
      setBypass({ svgW, svgH, ox, oy, ex, ey, pipe, r, mid: (oy + ey) / 2 });
    };
    const ro = new ResizeObserver(draw);
    if (bypassRef.current) ro.observe(bypassRef.current);
    const tid = setTimeout(draw, 400);
    window.addEventListener('resize', draw);
    return () => { ro.disconnect(); clearTimeout(tid); window.removeEventListener('resize', draw); };
  }, []);

  return (
    <Box sx={{
      bgcolor: DARK, borderRadius: 2, overflow: 'hidden', position: 'relative',
      background: canvasBg,
      border: isDark ? '1px solid rgba(245,168,0,0.16)' : '1px solid rgba(245,168,0,0.24)',
      boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(17,24,39,0.08)',
    }}>
      {/* Scan line */}
      <Box sx={{
        position: 'absolute', left: 0, right: 0, height: '2px', top: '-2px', zIndex: 100,
        background: 'linear-gradient(90deg,transparent,rgba(245,168,0,.22),transparent)',
        pointerEvents: 'none',
        '@keyframes scanDown': {
          '0%': { top: '-2px', opacity: 0 },
          '4%': { opacity: 1 },
          '96%': { opacity: 0.2 },
          '100%': { top: '100%', opacity: 0 },
        },
        animation: 'scanDown 6s 1s linear infinite',
      }} />
      {/* Top colour bar */}
      <Box sx={{ display: 'flex', height: '5px' }}>
        {['#C8180A', '#F5A800', '#E02010'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
      </Box>
      {/* Legend */}
      <Box sx={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px',
        py: 1.5, px: 2, bgcolor: stripBg,
        borderBottom: stripBorder,
      }}>
        {[
          { c: '#C8180A', label: t('forms.aspirant.sop.legend.people') },
          { c: '#253A9A', label: t('forms.aspirant.sop.legend.prOthers') },
          { c: '#6B3A00', label: t('forms.aspirant.sop.legend.pr') },
        ].map(({ c, label }) => (
          <Box key={c} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: c, borderRadius: '3px', flexShrink: 0 }} />
            <Typography sx={{ fontFamily: FF_BODY, fontSize: '11px', fontWeight: 600, color: legendText }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
      {/* ── Flow ── */}
      <Box sx={{
        maxWidth: 700, mx: 'auto',
        pr: { xs: '10px', sm: '16px' },
        pt: '24px', pb: '40px',
        pl: { xs: `${PL - 8}px`, sm: `${PL}px` },
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 1,
      }}>

        {/* Disclaimer */}
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} style={{ width: '100%' }}>
          <Box sx={{
            borderRadius: '10px', p: { xs: '12px', sm: '13px 16px' }, textAlign: 'center',
            fontSize: { xs: '11px', sm: '13px' }, fontWeight: 600, color: contentText,
            lineHeight: 1.6, fontFamily: FF_BODY,
            bgcolor: isDark ? 'rgba(200,24,10,.07)' : 'rgba(200,24,10,.10)',
            border: isDark ? '1.5px solid rgba(200,24,10,.4)' : '1.5px solid rgba(200,24,10,.48)',
          }}>
            {t('forms.aspirant.sop.disclaimer')}
          </Box>
        </motion.div>

        <Arrow height={28} />

        {/* 1. Connecting with people */}
        <Box sx={{ width: '100%', maxWidth: 280 }}>
          <FNode ck="brown" label={<><NL>Entry Point</NL>{fc('connectingWithPeople')}</>} sx={{ fontWeight: 800 }} />
        </Box>

        {/* Fan 1→5 */}
        <FlowSvg vb="0 0 640 50" h={50}>
          <line x1="320" y1="0" x2="320" y2="15" stroke={GOLD} strokeWidth="1.8" />
          <line x1="46" y1="15" x2="594" y2="15" stroke={GOLDD} strokeWidth="1.8" />
          {[46, 184, 320, 456, 594].map(x => <line key={x} x1={x} y1="15" x2={x} y2="50" stroke={GOLDD} strokeWidth="1.8" />)}
        </FlowSvg>

        {/* 2. Five channels */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-16px' }}
          variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          style={{ display: 'flex', gap: '5px', width: '100%', flexWrap: 'wrap' }}
        >
          {(['technology', 'government', 'publicContact', 'complaintBoxes', 'personalMeetings'] as const).map(ch => (
            <motion.div key={ch}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
              style={{ flex: '1 1 calc(50% - 3px)', minWidth: 0 }}
            >
              <Box sx={{
                borderRadius: '7px', p: { xs: '8px 4px', sm: '9px 4px' }, textAlign: 'center',
                fontSize: { xs: '10px', sm: '11.5px' }, fontWeight: 600, lineHeight: 1.35,
                background: C.blue.bg, border: `1px solid rgba(37,58,154,.55)`, color: '#fff',
                height: '100%',
              }}>
                {fc(`channels.${ch}`)}
              </Box>
            </motion.div>
          ))}
        </motion.div>

        {/* Fan 5→1 */}
        <FlowSvg vb="0 0 640 50" h={50}>
          {[46, 184, 320, 456, 594].map(x => <line key={x} x1={x} y1="0" x2={x} y2="34" stroke={GOLDD} strokeWidth="1.8" />)}
          <line x1="46" y1="34" x2="594" y2="34" stroke="rgba(245,168,0,.38)" strokeWidth="1.8" />
          <line x1="320" y1="34" x2="320" y2="50" stroke={GOLD} strokeWidth="1.8" />
          <polygon points="313,46 327,46 320,50" fill={GOLD} />
        </FlowSvg>

        {/* 3. Pooling */}
        <FNode ck="red" label={fc('pooling')} />
        <Arrow height={28} />

        {/* 4. Segregation */}
        <FNode ck="blue" label={fc('segregation')} />

        {/* Fan 1→4 */}
        <FlowSvg vb="0 0 640 50" h={50}>
          <line x1="320" y1="0" x2="320" y2="15" stroke={GOLD} strokeWidth="1.8" />
          <line x1="78" y1="15" x2="562" y2="15" stroke={GOLDD} strokeWidth="1.8" />
          {[78, 239, 400, 562].map(x => <line key={x} x1={x} y1="15" x2={x} y2="50" stroke={GOLDD} strokeWidth="1.8" />)}
        </FlowSvg>

        {/* 5. Four actions */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-16px' }}
          variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          style={{ display: 'flex', gap: '6px', width: '100%', flexWrap: 'wrap' }}
        >
          {([
            { key: 'administration', ck: 'blue' as ColorKey },
            { key: 'localBodies', ck: 'blue' as ColorKey },
            { key: 'rewards', ck: 'brown' as ColorKey },
          ]).map(({ key, ck }) => (
            <motion.div key={key}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
              style={{ flex: '1 1 calc(50% - 3px)', minWidth: 0 }}
            >
              <Box sx={{
                borderRadius: '7px', p: { xs: '8px 6px', sm: '10px 6px' }, textAlign: 'center',
                fontSize: { xs: '10px', sm: '12px' }, fontWeight: 600, lineHeight: 1.35,
                background: C[ck].bg, border: `1px solid ${C[ck].border}`, color: C[ck].text,
                boxShadow: C[ck].shadow, height: '100%',
              }}>
                {fc(`actions.${key}`)}
              </Box>
            </motion.div>
          ))}
        </motion.div>

        {/* Fan 3→2 (Ongoing / New Projects) */}
        <FlowSvg vb="0 0 640 46" h={46}>
          {[78, 239, 400].map(x => <line key={x} x1={x} y1="0" x2={x} y2="23" stroke={GOLDD} strokeWidth="1.8" />)}
          <line x1="78" y1="23" x2="400" y2="23" stroke="rgba(245,168,0,.35)" strokeWidth="1.8" />
          {[185, 310].map(x => <line key={x} x1={x} y1="23" x2={x} y2="46" stroke={GOLDD} strokeWidth="1.8" />)}
        </FlowSvg>

        {/* ── Bypass section ── */}
        <Box ref={bypassRef} sx={{ position: 'relative', width: '100%' }}>

          {/* Bypass SVG — drawn by useEffect, mirrors HTML drawBypass() */}
          {bypass && (
            <Box
              component="svg"
              viewBox={`0 0 ${bypass.svgW} ${bypass.svgH}`}
              sx={{
                position: 'absolute',
                left: `-${PL}px`,
                top: 0,
                width: bypass.svgW,
                height: bypass.svgH,
                overflow: 'visible',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <line x1={bypass.ox} y1={bypass.oy} x2={bypass.pipe + bypass.r} y2={bypass.oy} stroke={GOLDB} strokeWidth="2" />
              <path d={`M${bypass.pipe + bypass.r},${bypass.oy} Q${bypass.pipe},${bypass.oy} ${bypass.pipe},${bypass.oy + bypass.r}`} fill="none" stroke={GOLDB} strokeWidth="2" />
              <line x1={bypass.pipe} y1={bypass.oy + bypass.r} x2={bypass.pipe} y2={bypass.ey - bypass.r} stroke={GOLDB} strokeWidth="2" strokeDasharray="8 4" />
              <path d={`M${bypass.pipe},${bypass.ey - bypass.r} Q${bypass.pipe},${bypass.ey} ${bypass.pipe + bypass.r},${bypass.ey}`} fill="none" stroke={GOLDB} strokeWidth="2" />
              <line x1={bypass.pipe + bypass.r} y1={bypass.ey} x2={bypass.ex - 4} y2={bypass.ey} stroke={GOLDB} strokeWidth="2" />
              <polygon points={`${bypass.ex - 4},${bypass.ey - 7} ${bypass.ex - 4},${bypass.ey + 7} ${bypass.ex + 8},${bypass.ey}`} fill="rgba(245,168,0,0.92)" />
              <text x={bypass.pipe + 14} y={bypass.mid} fill={lineNoteText} fontSize="8.5" fontFamily="Mukta,sans-serif" fontWeight="700" textAnchor="middle" transform={`rotate(-90,${bypass.pipe + 14},${bypass.mid})`}>
                {fc('projects.ongoing')}
              </text>
            </Box>
          )}

          {/* Ongoing / New Projects row */}
          <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'center', maxWidth: 390, mx: 'auto', width: '100%' }}>
            <Box ref={ongoingRef} sx={{ flex: 1 }}>
              <FNode ck="brown" label={fc('projects.ongoing')} sx={{ fontWeight: 700, fontSize: { xs: '12px', sm: '13.5px' }, px: 1.5, py: 1.1 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FNode ck="brown" label={fc('projects.new')} sx={{ fontWeight: 700, fontSize: { xs: '12px', sm: '13.5px' }, px: 1.5, py: 1.1 }} />
            </Box>
          </Box>

          {/* New → Planning connector */}
          <FlowSvg vb="0 0 640 42" h={42}>
            <line x1="382" y1="0" x2="382" y2="26" stroke={GOLDD} strokeWidth="1.8" />
            <line x1="382" y1="26" x2="320" y2="26" stroke="rgba(245,168,0,.35)" strokeWidth="1.8" />
            <line x1="320" y1="26" x2="320" y2="42" stroke={GOLD} strokeWidth="1.8" />
            <polygon points="313,38 327,38 320,42" fill={GOLD} />
          </FlowSvg>

          {/* 6. Planning */}
          <FNode ck="blue" label={<><NL>Planning Phase</NL>{fc('planning')}</>} />

          {/* Fan 1→4 plans */}
          <FlowSvg vb="0 0 640 42" h={42}>
            <line x1="320" y1="0" x2="320" y2="14" stroke={GOLD} strokeWidth="1.8" />
            <line x1="85" y1="14" x2="555" y2="14" stroke={GOLDD} strokeWidth="1.8" />
            {[85, 243, 400, 555].map(x => <line key={x} x1={x} y1="14" x2={x} y2="42" stroke={GOLDD} strokeWidth="1.8" />)}
          </FlowSvg>

          {/* 7. Plans A–D */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-16px' }}
            variants={{ visible: { transition: { staggerChildren: 0.11 } } }}
            style={{ display: 'flex', gap: '6px', width: '100%' }}
          >
            {[
              {
                label: fc('plans.a'),
                bg: isDark ? 'rgba(27,47,122,.7)' : 'rgba(66,99,196,.22)',
                border: isDark ? 'rgba(37,58,154,.9)' : 'rgba(37,58,154,.55)',
                color: isDark ? '#90b8ff' : '#1f3a8a',
              },
              {
                label: fc('plans.b'),
                bg: isDark ? 'rgba(200,24,10,.45)' : 'rgba(224,32,16,.24)',
                border: isDark ? 'rgba(200,24,10,.7)' : 'rgba(200,24,10,.55)',
                color: isDark ? '#ffaa99' : '#a61b12',
              },
              {
                label: fc('plans.c'),
                bg: isDark ? 'rgba(74,40,0,.85)' : 'rgba(107,58,0,.22)',
                border: isDark ? 'rgba(245,168,0,.4)' : 'rgba(180,110,0,.5)',
                color: isDark ? '#FFCB00' : '#6b3a00',
              },
              {
                label: fc('plans.d'),
                bg: isDark ? 'rgba(10,70,10,.55)' : 'rgba(31,133,45,.24)',
                border: isDark ? 'rgba(30,180,30,.45)' : 'rgba(31,133,45,.5)',
                color: isDark ? '#90e890' : '#176b2a',
              },
            ].map(({ label, bg, border, color }) => (
              <motion.div key={label}
                variants={{ hidden: { opacity: 0, y: 14, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                whileHover={{ filter: 'brightness(1.12)' }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 22 }}
                style={{ flex: 1, minWidth: 0 }}
              >
                <Box sx={{
                  borderRadius: '7px', p: { xs: '8px 4px', sm: '10px 4px' }, textAlign: 'center',
                  fontFamily: FF_HEADING, fontSize: { xs: '12px', sm: '15px' }, fontWeight: 800,
                  background: bg, border: `1px solid ${border}`, color,
                }}>
                  {label}
                </Box>
              </motion.div>
            ))}
          </motion.div>

          {/* Fan 4→1 */}
          <FlowSvg vb="0 0 640 42" h={42}>
            {[85, 243, 400, 555].map(x => <line key={x} x1={x} y1="0" x2={x} y2="26" stroke={GOLDD} strokeWidth="1.8" />)}
            <line x1="85" y1="26" x2="555" y2="26" stroke="rgba(245,168,0,.35)" strokeWidth="1.8" />
            <line x1="320" y1="26" x2="320" y2="42" stroke={GOLD} strokeWidth="1.8" />
            <polygon points="313,38 327,38 320,42" fill={GOLD} />
          </FlowSvg>

          {/* 8. Polling */}
          <FNode ck="brown" label={fc('publicOpinion')} />
          <Arrow height={28} />

          {/* 9. Public Verdict Diamond */}
          <VerdictDiamond label={fc('publicVerdict')} />
          <Arrow height={28} />

          {/* 10. Execution */}
          <Box ref={execRef} sx={{ width: '100%' }}>
            <FNode ck="brown" label={fc('execution')} />
          </Box>

        </Box>{/* end bypass section */}

        <Arrow height={28} />

        {/* 11. Performance Appraisal — pulsing gold */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-16px' }} transition={{ duration: 0.35 }}
          style={{ width: '100%', maxWidth: 300 }}
        >
          <Box sx={{
            borderRadius: '10px', p: { xs: '12px', sm: '12px 16px' }, textAlign: 'center',
            fontFamily: FF_BODY, fontWeight: 600, fontSize: { xs: '11.5px', sm: '14px' }, lineHeight: 1.45,
            background: isDark
              ? 'linear-gradient(135deg,rgba(245,168,0,.15),rgba(255,203,0,.1))'
              : 'linear-gradient(135deg,rgba(245,168,0,.18),rgba(255,203,0,.14))',
            border: isDark ? '1.5px solid rgba(245,168,0,.5)' : '1.5px solid rgba(180,110,0,.4)',
            color: isDark ? '#FFCB00' : '#8a5b00',
            '@keyframes glowPulse': {
              '0%,100%': { boxShadow: '0 2px 18px rgba(245,168,0,.15)' },
              '50%': { boxShadow: '0 2px 36px rgba(245,168,0,.50)' },
            },
            animation: 'glowPulse 3s ease-in-out infinite',
          }}>
            <Box component="span" sx={{ display: 'block', fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', opacity: isDark ? 0.5 : 0.8, mb: '2px', fontWeight: 700, color: isDark ? '#FFCB00' : '#a16b00' }}>
              Evaluation
            </Box>
            {fc('performanceAppraisal')}
          </Box>
        </motion.div>

        {/* Split arrow → Positive / Negative */}
        <FlowSvg vb="0 0 640 54" h={54}>
          <line x1="320" y1="0" x2="320" y2="18" stroke={GOLD} strokeWidth="1.8" />
          <line x1="155" y1="18" x2="484" y2="18" stroke={GOLD} strokeWidth="1.8" />
          <line x1="156" y1="19" x2="156" y2="54" stroke={GOLD} strokeWidth="1.8" />
          <polygon points="149,54 163,54 156,63" fill={GOLD} />
          <line x1="483" y1="19" x2="483" y2="54" stroke={GOLD} strokeWidth="1.8" />
          <polygon points="476,54 490,54 483,63" fill={GOLD} />
        </FlowSvg>

        {/* 12. Positive / Negative result split */}
        <Box sx={{ display: 'flex', gap: { xs: '8px', sm: '14px' }, width: '100%', alignItems: 'flex-start' }}>

          {/* LEFT: Positive */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResultDiamondSVG positive={true} label={fc('positiveResult')} delay={0} />
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.07 }} style={{ width: '100%' }}>
              <Box sx={{
                borderRadius: '8px', p: { xs: '8px 6px', sm: '9px 10px' }, textAlign: 'center',
                fontFamily: FF_HEADING, fontWeight: 900, letterSpacing: '1.2px',
                fontSize: { xs: '12px', sm: '15px' },
                bgcolor: isDark ? 'rgba(20,100,20,.3)' : 'rgba(34,197,94,.2)',
                border: isDark ? '1.5px solid rgba(34,200,34,.55)' : '1.5px solid rgba(34,170,70,.55)',
                color: isDark ? '#7de87d' : '#186534',
              }}>
                {fc('continue')} ✓
              </Box>
            </motion.div>
            <Arrow height={16} />
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.14 }} style={{ width: '100%' }}>
              <Box sx={{
                borderRadius: '8px', p: { xs: '9px', sm: '10px' },
                fontSize: { xs: '10.5px', sm: '12px' }, fontWeight: 400, lineHeight: 1.55,
                color: mutedText, fontFamily: FF_BODY, textAlign: 'center',
                bgcolor: cardSubtleBg, border: cardSubtleBorder,
              }}>
                {fc('positiveAction')}
              </Box>
            </motion.div>
          </Box>

          {/* RIGHT: Negative */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResultDiamondSVG positive={false} label={fc('negativeResult')} delay={0.14} />
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.07 }} style={{ width: '100%' }}>
              <Box sx={{
                borderRadius: '8px', p: { xs: '8px 6px', sm: '9px 10px' }, textAlign: 'center',
                fontFamily: FF_HEADING, fontWeight: 900, letterSpacing: '1.2px',
                fontSize: { xs: '12px', sm: '15px' },
                bgcolor: isDark ? 'rgba(200,24,10,.22)' : 'rgba(224,32,16,.18)',
                border: isDark ? '1.5px solid rgba(200,24,10,.65)' : '1.5px solid rgba(200,24,10,.55)',
                color: isDark ? '#ff8a7a' : '#a61b12',
              }}>
                {fc('corrections')} !
              </Box>
            </motion.div>
            <Arrow height={16} />
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.14 }} style={{ width: '100%' }}>
              <Box sx={{
                borderRadius: '8px', p: { xs: '9px', sm: '10px' },
                fontSize: { xs: '10.5px', sm: '12px' }, fontWeight: 400, lineHeight: 1.55,
                color: mutedText, fontFamily: FF_BODY, textAlign: 'center',
                bgcolor: cardSubtleBg, border: cardSubtleBorder,
              }}>
                {fc('negativeAction')}
              </Box>
            </motion.div>
          </Box>

        </Box>

        <Arrow height={42} />


        {/* 14. Blockchain note */}
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} style={{ width: '100%' }}>
          <Box sx={{
            borderRadius: '10px', p: { xs: '12px', sm: '13px 16px' }, textAlign: 'center',
            fontSize: { xs: '11px', sm: '13px' }, lineHeight: 1.6, fontFamily: FF_BODY, fontWeight: 600,
            background: isDark
              ? 'linear-gradient(135deg,rgba(245,168,0,.1),rgba(200,24,10,.07))'
              : 'linear-gradient(135deg,rgba(245,168,0,.16),rgba(200,24,10,.09))',
            border: isDark ? '1px dashed rgba(245,168,0,.35)' : '1px dashed rgba(245,168,0,.55)',
            color: isDark ? 'rgba(255,255,255,.8)' : 'rgba(15,23,42,.86)',
          }}>
            {fc('blockchainNote')}
          </Box>
        </motion.div>

        {/* 15. Election note */}
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }} style={{ width: '100%' }}>
          <Box sx={{
            borderRadius: '10px', p: { xs: '12px', sm: '14px 18px' }, mt: '20px', textAlign: 'center',
            lineHeight: 1.65, fontFamily: FF_BODY,
            background: isDark
              ? 'linear-gradient(135deg,rgba(200,24,10,.12),rgba(245,168,0,.08))'
              : 'linear-gradient(135deg,rgba(200,24,10,.10),rgba(245,168,0,.12))',
            border: isDark ? '1.5px solid rgba(200,24,10,.45)' : '1.5px solid rgba(200,24,10,.40)',
          }}>
            <Typography sx={{
              fontFamily: FF_HEADING, fontWeight: 700,
              fontSize: { xs: '11.5px', sm: '13.5px' },
              color: isDark ? '#FFCB00' : '#8a3a00',
              lineHeight: 1.65,
            }}>
              {fc('electionNote')}
            </Typography>
          </Box>
        </motion.div>

      </Box>{/* end flow */}
      {/* Optional signature slot — renders inside the SOP container */}
      {signatureSlot && (
        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3, pt: 1 }}>
          {signatureSlot}
        </Box>
      )}
      {/* Bottom colour bar */}
      <Box sx={{ display: 'flex', height: '4px', opacity: 0.4 }}>
        {['#C8180A', '#F5A800', '#E02010'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
      </Box>
      {/* ── Agreement ── */}
      {!hideAgreement && <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, bgcolor: isDark ? 'rgba(255,255,255,.02)' : 'rgba(17,24,39,.02)', borderTop: isDark ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(17,24,39,.08)' }}>
        <Stack spacing={2} sx={{
          alignItems: "center"
        }}>
          <FormControlLabel
            control={
              <Checkbox checked={sopAgreed} onChange={e => setSopAgreed(e.target.checked)}
                sx={{ color: 'rgba(245,168,0,.5)', '&.Mui-checked': { color: '#F5A800' } }} />
            }
            label={
              <Typography sx={{
                fontFamily: FF_BODY, fontSize: { xs: '0.82rem', sm: '0.9rem' }, fontWeight: 600,
                color: sopAgreed ? '#F5A800' : (isDark ? 'rgba(255,255,255,.6)' : 'rgba(15,23,42,.72)'), transition: 'color 0.3s',
              }}>
                {t('forms.aspirant.sop.agreeCheckbox')}
              </Typography>
            }
          />
          <Stack direction="row" spacing={1.5} sx={{
            alignItems: "center"
          }}>
            {onCancel && (
              <Button
                variant="outlined"
                size="large"
                onClick={onCancel}
                sx={{
                  px: 3, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: '0.9rem',
                  fontFamily: FF_BODY, textTransform: 'none',
                  borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.22)',
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.7)',
                  '&:hover': {
                    borderColor: 'rgba(245,168,0,0.45)', color: GOLD,
                    bgcolor: 'rgba(245,168,0,0.06)',
                  },
                }}
              >
                {t('common.home')}
              </Button>
            )}
            <motion.div animate={sopAgreed ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={{ duration: 0.4 }}>
              <Button
                variant="contained" size="large" disabled={!sopAgreed} onClick={onAgree}
                sx={{
                  px: 5, py: 1.5, borderRadius: 2, fontWeight: 800, fontSize: '1rem',
                  fontFamily: FF_BODY, textTransform: 'none',
                  background: sopAgreed ? 'linear-gradient(135deg,#C8180A,#F5A800)' : undefined,
                  boxShadow: sopAgreed ? '0 4px 22px rgba(200,24,10,.45)' : 'none',
                  '&:hover': sopAgreed ? {
                    background: 'linear-gradient(135deg,#F5A800,#C8180A)',
                    boxShadow: '0 6px 30px rgba(245,168,0,.45)',
                    transform: 'translateY(-2px)',
                  } : {},
                  '&.Mui-disabled': {
                    color: isDark ? 'rgba(255,255,255,.3)' : 'rgba(15,23,42,.36)',
                    background: isDark ? 'rgba(255,255,255,.08)' : 'rgba(15,23,42,.12)'
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                {t('forms.aspirant.sop.agreeButton')}
              </Button>
            </motion.div>
          </Stack>
        </Stack>
      </Box>}
    </Box>
  );
};

export default SopFlowChart;
