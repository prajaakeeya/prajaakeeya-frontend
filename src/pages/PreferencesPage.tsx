import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  Grid,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, TuneRounded as TuneIcon, LockRounded as LockIcon } from '@mui/icons-material';
import usePreferenceStore, { type LayoutVariant } from '../store/usePreferenceStore';
import useThemeStore from '../store/useThemeStore';
import { BRAND } from '../theme';

const FF_HEAD = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";

/* ─── SVG Previews ───────────────────────────────────────────────────── */
interface PreviewProps { active: boolean; isDark: boolean; locked: boolean }

const PreviewReverse: React.FC<PreviewProps> = ({ active, isDark }) => {
  const bg = isDark ? '#1E2224' : '#F1F5F9';
  const c1 = active ? BRAND.red : (isDark ? '#3A3F45' : '#CBD5E1');
  const c2 = active ? BRAND.yellow : (isDark ? '#2A2F35' : '#E2E8F0');
  return (
    <svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="120" height="72" rx="6" fill={bg} />
      {/* Reversed: image right, text left */}
      <rect x="8" y="10" width="50" height="52" rx="4" fill={c2} />
      <rect x="62" y="10" width="50" height="52" rx="4" fill={c1} />
      <rect x="12" y="18" width="30" height="4" rx="2" fill={active ? BRAND.yellow : (isDark ? '#555' : '#94A3B8')} />
      <rect x="12" y="26" width="22" height="3" rx="1.5" fill={isDark ? '#444' : '#CBD5E1'} />
      <rect x="12" y="32" width="26" height="3" rx="1.5" fill={isDark ? '#444' : '#CBD5E1'} />
      <path d="M54 36 L66 36 M62 30 L68 36 L62 42" stroke={active ? BRAND.red : (isDark ? '#555' : '#94A3B8')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const PreviewStraight: React.FC<PreviewProps> = ({ active, isDark }) => {
  const bg = isDark ? '#1E2224' : '#F1F5F9';
  const bar = active ? BRAND.red : (isDark ? '#3A3F45' : '#CBD5E1');
  return (
    <svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="120" height="72" rx="6" fill={bg} />
      <rect x="10" y="8" width="100" height="24" rx="4" fill={bar} />
      <rect x="10" y="38" width="100" height="24" rx="4" fill={active ? BRAND.yellow : (isDark ? '#2A2F35' : '#E2E8F0')} />
      <rect x="16" y="14" width="40" height="4" rx="2" fill={active ? '#fff' : (isDark ? '#555' : '#94A3B8')} />
      <rect x="16" y="21" width="28" height="3" rx="1.5" fill={active ? 'rgba(255,255,255,0.5)' : (isDark ? '#444' : '#CBD5E1')} />
      <rect x="16" y="44" width="40" height="4" rx="2" fill={active ? BRAND.red : (isDark ? '#555' : '#94A3B8')} />
      <rect x="16" y="51" width="28" height="3" rx="1.5" fill={isDark ? '#444' : '#CBD5E1'} />
    </svg>
  );
};

const PreviewCardOver: React.FC<PreviewProps> = ({ active, isDark }) => {
  const bg = isDark ? '#1E2224' : '#F1F5F9';
  const c1 = active ? BRAND.red : (isDark ? '#3A3F45' : '#CBD5E1');
  const c2 = active ? BRAND.yellow : (isDark ? '#2A2F35' : '#E2E8F0');
  return (
    <svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="120" height="72" rx="6" fill={bg} />
      <rect x="15" y="10" width="90" height="30" rx="4" fill={c2} stroke={active ? BRAND.yellow : 'none'} strokeWidth="1" />
      <rect x="15" y="25" width="90" height="35" rx="4" fill={c1} style={{ filter: 'drop-shadow(0 -4px 6px rgba(0,0,0,0.15))' }} />
      <rect x="22" y="35" width="40" height="4" rx="2" fill={active ? '#fff' : (isDark ? '#555' : '#94A3B8')} />
      <rect x="22" y="44" width="24" height="3" rx="1.5" fill={active ? 'rgba(255,255,255,0.5)' : (isDark ? '#444' : '#CBD5E1')} />
    </svg>
  );
};

/* ─── Single Option Card ─────────────────────────────────────────────── */
interface OptionCardProps {
  id: Exclude<LayoutVariant, null>;
  title: string;
  description: string;
  active: boolean;
  onSelect: () => void;
  isDark: boolean;
  accentColor: string;
  badgeLabel: string;
  preview: React.ReactNode;
  index: number;
}

const OptionCard: React.FC<OptionCardProps> = ({
  title, description, active, onSelect, isDark, accentColor, badgeLabel, preview, index,
}) => {
  const border = active
    ? `2px solid ${accentColor}`
    : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)';

  const cardBg = active
    ? isDark ? `linear-gradient(145deg, #1A1D22, #161920)` : `linear-gradient(145deg, #FFFFFF, #F8FAFC)`
    : isDark ? '#161920' : '#FFFFFF';

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ scale: 1.012, transition: { duration: 0.15 } }}
      style={{ height: '100%' }}
    >
      <Box
        onClick={onSelect}
        sx={{
          height: '100%',
          cursor: 'pointer',
          background: cardBg,
          borderRadius: '16px',
          border,
          boxShadow: active
            ? `0 8px 32px ${accentColor}28, 0 2px 8px ${accentColor}18`
            : isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.06)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Active top glow bar */}
        <AnimatePresence>
          {active && (
            <motion.div
              key="glow-bar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`,
                transformOrigin: 'left center',
                zIndex: 2,
              }}
            />
          )}
        </AnimatePresence>

        {/* Preview area */}
        <Box sx={{
          height: 140,
          p: 2,
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {preview}
        </Box>

        {/* Card body */}
        <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Badge row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center',
              px: 1.2, py: 0.4, borderRadius: '20px',
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', fontFamily: FF_HEAD,
              color: accentColor,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}30`,
            }}>
              {badgeLabel}
            </Box>
            {/* Radio dot indicator */}
            <Box sx={{
              width: 20, height: 20, borderRadius: '50%',
              border: `2px solid ${active ? accentColor : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)')}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              <AnimatePresence>
                {active && (
                  <motion.div
                    key="radio-fill"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: accentColor,
                    }}
                  />
                )}
              </AnimatePresence>
            </Box>
          </Box>

          {/* Title */}
          <Typography sx={{
            fontFamily: FF_HEAD, fontWeight: 700, fontSize: '1rem',
            color: active ? accentColor : (isDark ? '#E2E2E3' : '#111827'),
            transition: 'color 0.25s', lineHeight: 1.3,
          }}>
            {title}
          </Typography>

          {/* Description */}
          <Typography sx={{
            fontFamily: FF_BODY, fontSize: '0.8rem',
            color: isDark ? 'rgba(226,226,227,0.5)' : '#6B7280',
            lineHeight: 1.6, flexGrow: 1,
          }}>
            {description}
          </Typography>

          {/* Active pill */}
          <AnimatePresence>
            {active && (
              <motion.div
                key="active-pill"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
              >
                <Box sx={{
                  mt: 1, px: 1.5, py: 0.5, borderRadius: '20px',
                  fontSize: '11px', fontWeight: 700, fontFamily: FF_HEAD,
                  color: '#fff', background: accentColor,
                  display: 'inline-flex', alignItems: 'center', gap: 0.6,
                }}>
                  <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
                  Applied to Home Page
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </motion.div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────── */
const PreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';
  const bg = theme.palette.background.default;

  const { activeLayout, toggleLayout } = usePreferenceStore();
  const hasActive = activeLayout !== null;

  const options: Array<{
    id: Exclude<LayoutVariant, null>;
    title: string;
    description: string;
    accentColor: string;
    badgeLabel: string;
    Preview: React.FC<PreviewProps>;
  }> = [
    {
      id: 'reverse',
      title: 'Reverse Page Appearance',
      description: 'Flips the default left-right layout — imagery and content swap sides throughout the home page.',
      accentColor: BRAND.red,
      badgeLabel: 'Layout',
      Preview: PreviewReverse,
    },
    {
      id: 'straight',
      title: 'Straight Card Layout',
      description: 'Renders feature cards in a full-width vertical stack, each spanning the entire content column.',
      accentColor: BRAND.yellow,
      badgeLabel: 'Grid',
      Preview: PreviewStraight,
    },
    {
      id: 'cardover',
      title: 'Card Over Flow Layout',
      description: 'Allows cards to slide up and stack cleanly over each other as you scroll down, creating a smooth visual overlap transition.',
      accentColor: BRAND.red,
      badgeLabel: 'Scrolling',
      Preview: PreviewCardOver,
    },
  ];

  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh', color: isDark ? '#E2E2E3' : '#111827', overflowX: 'hidden' }}>
      {/* Ambient background grid */}
      <Box sx={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundSize: '40px 40px',
        backgroundImage: isDark
          ? 'linear-gradient(to right,rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.018) 1px,transparent 1px)'
          : 'linear-gradient(to right,rgba(0,0,0,0.025) 1px,transparent 1px),linear-gradient(to bottom,rgba(0,0,0,0.025) 1px,transparent 1px)',
      }} />
      {/* Glow blobs */}
      <Box sx={{ position: 'fixed', top: '-15%', left: '-8%', width: '50vw', height: '50vw', borderRadius: '50%', background: `radial-gradient(circle, ${BRAND.red}12 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: `radial-gradient(circle, ${BRAND.yellow}10 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 0 }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 5, pb: 10 }}>
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <Box
            onClick={() => navigate(-1)}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              cursor: 'pointer', mb: 4, px: 2, py: 1, borderRadius: '8px',
              fontFamily: FF_HEAD, fontWeight: 600, fontSize: '0.875rem',
              color: isDark ? 'rgba(226,226,227,0.7)' : '#4B5563',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
              '&:hover': { color: BRAND.red, borderColor: BRAND.red, background: `${BRAND.red}0D` },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Go Back
          </Box>
        </motion.div>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '12px',
                background: `linear-gradient(135deg, ${BRAND.red}22, ${BRAND.yellow}18)`,
                border: `1.5px solid ${BRAND.red}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TuneIcon sx={{ color: BRAND.red, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="overline" sx={{ fontFamily: FF_HEAD, letterSpacing: 3, color: BRAND.red, fontSize: '0.7rem', display: 'block', lineHeight: 1 }}>
                  Personalisation
                </Typography>
                <Typography variant="h3" sx={{ fontFamily: FF_HEAD, fontWeight: 800, fontSize: { xs: '1.6rem', md: '2.2rem' }, lineHeight: 1.1, mt: 0.5 }}>
                  View Preferences
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontFamily: FF_BODY, color: isDark ? 'rgba(226,226,227,0.55)' : '#6B7280', fontSize: '0.95rem', maxWidth: 580, lineHeight: 1.7, mt: 1 }}>
              Choose one layout style for your home page. Selecting a style instantly updates the appearance — click the active card again to deselect it.
            </Typography>

            {/* Status banner */}
            <AnimatePresence mode="wait">
              {hasActive ? (
                <motion.div key="active-banner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                  <Box sx={{
                    mt: 2.5, display: 'inline-flex', alignItems: 'center', gap: 1.5,
                    px: 2.5, py: 1, borderRadius: '24px',
                    background: `${BRAND.red}14`,
                    border: `1.5px solid ${BRAND.red}30`,
                  }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: BRAND.red, boxShadow: `0 0 8px ${BRAND.red}` }} />
                    <Typography sx={{ fontFamily: FF_HEAD, fontWeight: 700, fontSize: '0.82rem', color: BRAND.red }}>
                      &quot;{options.find(o => o.id === activeLayout)?.title}&quot; is active — click again to deselect
                    </Typography>
                  </Box>
                </motion.div>
              ) : (
                <motion.div key="idle-banner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                  <Box sx={{
                    mt: 2.5, display: 'inline-flex', alignItems: 'center', gap: 1.5,
                    px: 2.5, py: 1, borderRadius: '24px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
                  }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' }} />
                    <Typography sx={{ fontFamily: FF_HEAD, fontWeight: 600, fontSize: '0.82rem', color: isDark ? 'rgba(226,226,227,0.5)' : '#6B7280' }}>
                      No style selected — default layout active
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </motion.div>

        <Divider sx={{ mb: 5, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)' }} />

        {/* Option grid */}
        <Grid container spacing={3}>
          {options.map((opt, i) => {
            const isActive = activeLayout === opt.id;
            return (
              <Grid key={opt.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                <OptionCard
                  id={opt.id}
                  title={opt.title}
                  description={opt.description}
                  active={isActive}
                  onSelect={() => toggleLayout(opt.id)}
                  isDark={isDark}
                  accentColor={opt.accentColor}
                  badgeLabel={opt.badgeLabel}
                  preview={<opt.Preview active={isActive} isDark={isDark} locked={false} />}
                  index={i}
                />
              </Grid>
            );
          })}
        </Grid>

        {/* Info box */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
          <Box sx={{
            mt: 6, p: { xs: 3, md: 4 }, borderRadius: '16px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(30,32,34,0.8), rgba(22,25,28,0.9))'
              : 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(241,245,249,0.95))',
            border: isDark ? `1px solid rgba(200,24,10,0.12)` : `1px solid rgba(200,24,10,0.1)`,
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-start', gap: 2,
          }}>
            <Box sx={{
              width: 40, height: 40, flexShrink: 0, borderRadius: '10px',
              background: `${BRAND.yellow}18`, border: `1px solid ${BRAND.yellow}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.3,
            }}>
              <span style={{ fontSize: 18 }}>💡</span>
            </Box>
            <Box>
              <Typography sx={{ fontFamily: FF_HEAD, fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                One style at a time — click to toggle
              </Typography>
              <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.82rem', color: isDark ? 'rgba(226,226,227,0.55)' : '#6B7280', lineHeight: 1.65 }}>
                Selecting a layout immediately updates the home page. Click any other card to instantly switch layouts, or click the active card a second time to deselect it and return to the default layout. Your choice is saved in local storage and persists across page refreshes.
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PreferencesPage;
