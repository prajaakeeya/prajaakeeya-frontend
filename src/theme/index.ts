import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

// ─────────────────────────────────────────────────────────────────────────────
// BRAND COLORS — single source of truth for Prajaakeeya palette.
// Import `BRAND` anywhere you need a brand color that doesn't live in the MUI
// palette (e.g. decorative gradients, logo rings, particle colours).
// ─────────────────────────────────────────────────────────────────────────────
export const BRAND = {
  red: '#C8180A',   // primary brand red
  red2: '#E02010',   // lighter brand red
  yellow: '#F5A800',   // brand gold / yellow
  yellowLight: 'rgb(190,133,7)',  // darker gold for light theme text/icons
  yellow2: '#FFCB00',   // bright accent yellow
  saffron: '#f5550b',   // MUI primary (saffron orange)
  blue: '#253A9A',   // accent blue
  brown: '#6B3A00',   // accent brown
  black: '#0A0808',   // near-black (dark theme base)
  dark: '#110E0E',   // slightly lighter near-black
  green: '#22c55e',
} as const;

// Shared UI radius tokens. Update here to change card roundness app-wide.
export const UI_RADIUS = {
  base: 4,
  card: 12,
} as const;

// Particle / decorative colours (same brand, referenced in SplitAuthLayout)
export const PARTICLE_COLORS = [
  BRAND.red,
  BRAND.yellow,
  '#FFD740',
  BRAND.yellow2,
  BRAND.red2,
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// THEME FACTORY — returns a fully-configured MUI theme for the given mode.
// ─────────────────────────────────────────────────────────────────────────────
export const getTheme = (mode: PaletteMode) =>
  responsiveFontSizes(
    createTheme({
      spacing: 8,
      shape: { borderRadius: UI_RADIUS.base },

      palette: {
        mode,

        /* PRIMARY — saffron / gold */
        primary: {
          main: BRAND.saffron,
          light: BRAND.yellow,
          dark: '#B45309',
          contrastText: mode === 'dark' ? '#FFFFFF' : '#111827',
        },

        /* SECONDARY */
        secondary:
          mode === 'dark'
            ? {
              main: BRAND.yellow,
              light: BRAND.yellow2,
              dark: '#B45309',
              contrastText: BRAND.black,
            }
            : {
              main: '#111827',
              light: '#374151',
              dark: '#020617',
              contrastText: '#FFFFFF',
            },

        /* BACKGROUNDS */
        background:
          mode === 'dark'
            ? { default: BRAND.black, paper: '#150E0E' }
            : { default: '#F8FAFC', paper: '#FFFFFF' },

        /* TEXT */
        text:
          mode === 'dark'
            ? { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.65)' }
            : { primary: '#111827', secondary: '#4B5563' },

        /* DIVIDER */
        divider:
          mode === 'dark'
            ? 'rgba(245,168,0,0.18)'
            : 'rgba(17, 24, 39, 0.10)',

        /* STATUS */
        success: { main: mode === 'dark' ? '#22C55E' : '#15803D' },
        error: { main: mode === 'dark' ? '#EF4444' : '#DC2626' },
        warning: { main: mode === 'dark' ? '#F59E0B' : '#D97706' },
        info: { main: mode === 'dark' ? '#60A5FA' : '#2563EB' },
      },

      // ── Typography ───────────────────────────────────────────────────────
      // Editorial system: a high-contrast serif reserved for the two largest
      // "statement" sizes (h1/h2), then a clean grotesque for every working
      // heading and all body copy. Mixing—rather than setting serif on every
      // heading—is what keeps it from reading as a template.
      typography: {
        fontFamily:
          '"Inter", "Noto Sans Kannada", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

        h1: {
          fontFamily: '"Playfair Display", serif',
          fontWeight: 800,
          fontSize: '2.8rem',
          lineHeight: 1.12,
          letterSpacing: '-0.02em',
        },
        h2: {
          fontFamily: '"Playfair Display", serif',
          fontWeight: 700,
          fontSize: '2.2rem',
          lineHeight: 1.18,
          letterSpacing: '-0.015em',
        },
        h3: {
          fontWeight: 700,
          fontSize: '1.75rem',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
        },
        h4: {
          fontWeight: 700,
          fontSize: '1.4rem',
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
        },
        h5: { fontWeight: 600, fontSize: '1.2rem', letterSpacing: '-0.005em' },
        h6: { fontWeight: 600, fontSize: '1.05rem' },

        subtitle2: {
          fontWeight: 700,
          fontSize: '0.72rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        },

        body1: { fontSize: '1rem', lineHeight: 1.65 },
        body2: { fontSize: '0.875rem', lineHeight: 1.6 },

        button: {
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.01em',
        },
      },

      // ── Component overrides ──────────────────────────────────────────────
      components: {
        /* BUTTONS — solid, single-colour, quiet. No gradient fills and no
           translate-on-hover "float"; the hover just deepens the surface and
           adds a restrained shadow. That one change removes the most obvious
           template tell from every button in the app. */
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: {
              borderRadius: 10,
              padding: '10px 24px',
              minHeight: 44,
              transition:
                'background-color .18s ease, box-shadow .18s ease, border-color .18s ease',
            },
            contained: {
              backgroundImage: 'none',
              backgroundColor: BRAND.red,
              color: '#ffffff',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#A5130A',
                boxShadow: '0 4px 14px rgba(200, 24, 10, 0.28)',
              },
              '&:active': { backgroundColor: '#8E1008' },
            },
            outlined: ({ theme }) => ({
              borderWidth: 1.5,
              borderColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(245,168,0,0.55)'
                  : 'rgba(200,24,10,0.35)',
              color: theme.palette.mode === 'dark' ? BRAND.yellow : BRAND.red,
              '&:hover': {
                borderColor:
                  theme.palette.mode === 'dark' ? BRAND.yellow : BRAND.red,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(245,168,0,0.08)'
                    : 'rgba(200,24,10,0.05)',
              },
            }),
            text: {
              '&:hover': { backgroundColor: 'rgba(200,24,10,0.06)' },
            },
          },
        },

        /* CARDS — flat surface, a single hairline border, and a whisper of
           shadow. Hover shifts the border/shadow instead of lifting the whole
           card off the page. */
        MuiCard: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: ({ theme }) => ({
              borderRadius: UI_RADIUS.card,
              backgroundImage: 'none',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 1px 2px rgba(0,0,0,0.4)'
                  : '0 1px 2px rgba(17,24,39,0.05)',
              transition: 'border-color .2s ease, box-shadow .2s ease',
              '&:hover': {
                borderColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(245,168,0,0.35)'
                    : 'rgba(200,24,10,0.22)',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 6px 22px rgba(0,0,0,0.5)'
                    : '0 6px 22px rgba(17,24,39,0.08)',
              },
            }),
          },
        },

        // Force a single card radius across the app, even when page-level sx sets larger values.
        MuiCssBaseline: {
          styleOverrides: {
            '.MuiCard-root': {
              borderRadius: `${UI_RADIUS.card}px !important`,
            },
          },
        },

        /* APP BAR */
        MuiAppBar: {
          styleOverrides: {
            root: ({ theme }) => ({
              backgroundColor:
                theme.palette.mode === 'dark' ? BRAND.black : '#FFFFFF',
              color:
                theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827',
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 8px 30px rgba(0,0,0,0.45)'
                  : '0 1px 6px rgba(17,24,39,0.08)',
            }),
          },
        },

        /* TEXT FIELD */
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 10,
                '&.Mui-focused fieldset': {
                  borderWidth: 2,
                  borderColor: BRAND.yellow,
                },
              },
            },
          },
        },

        /* CHIPS */
        MuiChip: {
          styleOverrides: {
            root: { borderRadius: 8, fontWeight: 600 },
            filledPrimary: { backgroundColor: '#FEF3C7', color: '#92400E' },
          },
        },

        /* ALERT */
        MuiAlert: {
          styleOverrides: {
            root: { borderRadius: 12 },
          },
        },

        /* DRAWER */
        MuiDrawer: {
          styleOverrides: {
            paper: ({ theme }) => ({
              backgroundColor:
                theme.palette.mode === 'dark' ? '#1C0808' : '#FFFFFF',
              color:
                theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827',
              borderRight:
                theme.palette.mode === 'dark'
                  ? `1px solid rgba(200,24,10,0.25)`
                  : `1px solid rgba(17,24,39,0.12)`,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '4px 0 40px rgba(0,0,0,0.7)'
                  : '4px 0 40px rgba(0,0,0,0.08)',
            }),
          },
        },
      },
    })
  );

// Default export — dark theme (used as fallback / SSR default)
const theme = getTheme('dark');
export default theme;
