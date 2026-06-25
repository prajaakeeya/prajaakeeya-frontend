import { createTheme, responsiveFontSizes } from "@mui/material/styles";

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
  saffron: '#C8180A',   // rebranded to rich brand red to align with the Stitch design
  blue: '#253A9A',   // accent blue
  brown: '#6B3A00',   // accent brown
  black: '#0D0F12',   // near-black (dark theme base)
  dark: '#13161A',   // slightly lighter near-black (dark theme cards/paper)
  green: '#22c55e',
} as const;

// Shared UI radius tokens. Update here to change card roundness app-wide.
export const UI_RADIUS = {
  base: 4,
  card: 8, // Soft base: 8px (0.5rem) for cards/containers as per DESIGN.md
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
export const getTheme = (mode: 'light' | 'dark' | 'grey') =>
  responsiveFontSizes(
    createTheme({
      spacing: 8,
      shape: { borderRadius: UI_RADIUS.base },

      palette: {
        mode: mode === 'grey' ? 'light' : mode,

        /* PRIMARY — rich brand red */
        primary: {
          main: BRAND.red,
          light: BRAND.red2,
          dark: '#93000A',
          contrastText: '#FFFFFF',
        },

        /* SECONDARY — brand gold/yellow */
        secondary:
          mode === 'dark'
            ? {
              main: BRAND.yellow,
              light: BRAND.yellow2,
              dark: '#B45309',
              contrastText: BRAND.black,
            }
            : {
              main: BRAND.yellowLight,
              light: BRAND.yellow,
              dark: '#6B3A00',
              contrastText: '#FFFFFF',
            },

        /* BACKGROUNDS */
        background:
          mode === 'grey'
            ? { default: 'rgb(242, 241, 230)', paper: 'rgb(250, 249, 243)' }
            : mode === 'dark'
              ? { default: '#0D0F12', paper: '#13161A' }
              : { default: '#F8FAFC', paper: '#FFFFFF' },

        /* TEXT */
        text:
          mode === 'dark'
            ? { primary: '#E2E2E3', secondary: 'rgba(226,226,227,0.7)' }
            : { primary: '#111827', secondary: '#4B5563' },

        /* DIVIDER — 10% white lines in dark, subtle grey in light */
        divider:
          mode === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(17, 24, 39, 0.08)',

        /* STATUS */
        success: { main: mode === 'dark' ? '#E9C349' : '#15803D' }, // Gilt/Gold for success state in dark mode
        error: { main: mode === 'dark' ? '#FFB4AB' : '#DC2626' }, // Crimson/Light red for error in dark mode
        warning: { main: mode === 'dark' ? '#F5A800' : '#D97706' },
        info: { main: mode === 'dark' ? '#60A5FA' : '#2563EB' },
      },

      // ── Typography ───────────────────────────────────────────────────────
      // Heming is used for headings/buttons, Geist for body/text.
      typography: {
        fontFamily:
          '"Geist Variable", "Geist", "Noto Sans Kannada", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

        h1: {
          fontFamily: '"Heming", "Geist Variable", "Geist", sans-serif',
          fontWeight: 800,
          fontSize: '2.8rem',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
        },
        h2: {
          fontFamily: '"Heming", "Geist Variable", "Geist", sans-serif',
          fontWeight: 700,
          fontSize: '2.25rem',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        },
        h3: {
          fontFamily: '"Heming", "Geist Variable", "Geist", sans-serif',
          fontWeight: 600,
          fontSize: '1.9rem',
          letterSpacing: '-0.02em',
        },
        h4: {
          fontFamily: '"Heming", "Geist Variable", "Geist", sans-serif',
          fontWeight: 600,
          fontSize: '1.55rem',
          letterSpacing: '-0.01em',
        },
        h5: { 
          fontFamily: '"Heming", "Geist Variable", "Geist", sans-serif', 
          fontWeight: 600, 
          fontSize: '1.25rem' 
        },
        h6: { 
          fontFamily: '"Heming", "Geist Variable", "Geist", sans-serif', 
          fontWeight: 600, 
          fontSize: '1.1rem' 
        },

        body1: { fontSize: '1rem', lineHeight: 1.7 },
        body2: { fontSize: '0.875rem', lineHeight: 1.6 },

        button: {
          fontFamily: '"Heming", "Geist Variable", "Geist", sans-serif',
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.03em',
        },
      },

      // ── Component overrides ──────────────────────────────────────────────
      components: {
        /* BUTTONS */
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 4, // Soft: 4px base border radius for standard elements as per DESIGN.md
              padding: '10px 26px',
              minHeight: 44,
              transition: 'all 0.25s ease',
            },
            contained: {
              backgroundColor: BRAND.red,
              color: '#FFFFFF',
              backgroundImage: 'none', // Remove previous orange/saffron gradient
              boxShadow: '0 4px 12px rgba(200, 24, 10, 0.2)',
              '&:hover': {
                backgroundColor: BRAND.red2,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(200, 24, 10, 0.35)',
              },
            },
            outlined: ({ theme }) => ({
              borderWidth: 1.5,
              borderColor: BRAND.yellow,
              color: theme.palette.mode === 'dark' ? BRAND.yellow : BRAND.yellowLight,
              '&:hover': {
                borderWidth: 1.5,
                borderColor: theme.palette.mode === 'dark' ? BRAND.yellow2 : BRAND.yellow,
                color: theme.palette.mode === 'dark' ? BRAND.yellow2 : BRAND.yellowLight,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 168, 0, 0.08)' : 'rgba(190, 133, 7, 0.08)',
                transform: 'translateY(-1px)',
              },
            }),
          },
        },

        /* CARDS */
        MuiCard: {
          styleOverrides: {
            root: ({ theme }) => ({
              borderRadius: UI_RADIUS.card,
              border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 6px 20px rgba(0,0,0,0.55)'
                  : '0 6px 20px rgba(17, 24, 39, 0.04)',
              transition: 'all 0.25s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(200, 24, 10, 0.3)' : 'rgba(200, 24, 10, 0.15)',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 14px 36px rgba(0,0,0,0.75)'
                    : '0 14px 36px rgba(17, 24, 39, 0.08)',
              },
            }),
          },
        },

        // Force consistent card radius across the app, even when page-level sx sets larger values.
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
                theme.palette.mode === 'dark' ? '#0D0F12' : '#FFFFFF',
              color:
                theme.palette.mode === 'dark' ? '#E2E2E3' : '#111827',
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 8px 30px rgba(0,0,0,0.5)'
                  : '0 1px 6px rgba(17,24,39,0.05)',
              borderBottom: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.06)',
            }),
          },
        },

        /* TEXT FIELD */
        MuiTextField: {
          styleOverrides: {
            root: ({ theme }) => ({
              '& .MuiOutlinedInput-root': {
                borderRadius: 4, // Soft: 4px base border radius for input fields as per DESIGN.md
                transition: 'all 0.2s ease-in-out',
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 3px ${theme.palette.mode === 'dark' ? 'rgba(200, 24, 10, 0.2)' : 'rgba(200, 24, 10, 0.15)'}`,
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 1.5,
                  borderColor: BRAND.red,
                },
              },
            }),
          },
        },

        /* CHIPS */
        MuiChip: {
          styleOverrides: {
            root: { 
              borderRadius: 4, 
              fontWeight: 600,
              fontFamily: '"Heming", "Geist Variable", "Geist", sans-serif',
            },
          },
          variants: [
            {
              props: { variant: 'filled', color: 'primary' },
              style: { 
                backgroundColor: 'rgba(200, 24, 10, 0.15)', 
                color: BRAND.red 
              },
            },
            {
              props: { variant: 'filled', color: 'secondary' },
              style: { 
                backgroundColor: 'rgba(245, 168, 0, 0.15)', 
                color: BRAND.yellow 
              },
            },
          ],
        },

        /* ALERT */
        MuiAlert: {
          styleOverrides: {
            root: { borderRadius: 8 },
          },
        },

        /* DRAWER */
        MuiDrawer: {
          styleOverrides: {
            paper: ({ theme }) => ({
              backgroundColor:
                theme.palette.mode === 'dark' ? '#13161A' : '#FFFFFF',
              color:
                theme.palette.mode === 'dark' ? '#E2E2E3' : '#111827',
              borderRight:
                theme.palette.mode === 'dark'
                  ? `1px solid rgba(200,24,10,0.2)`
                  : `1px solid rgba(17,24,39,0.12)`,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '4px 0 40px rgba(0,0,0,0.6)'
                  : '4px 0 40px rgba(0,0,0,0.06)',
            }),
          },
        },
      },
    })
  );

// Default export — dark theme (used as fallback / SSR default)
const theme = getTheme('dark');
export default theme;
