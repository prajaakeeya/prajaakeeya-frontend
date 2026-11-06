import { createTheme, alpha } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

// ─────────────────────────────────────────────────────────────────────────────
// BRAND — the Prajaakeeya palette. Derived from the Karnataka flag colours in
// the logo, tuned for legibility: red is the single action colour, amber is a
// small accent, everything else is warm neutral.
// Keys are kept stable because ~30 files reference them.
// ─────────────────────────────────────────────────────────────────────────────
export const BRAND = {
  red: '#B42318',        // primary action (crimson)
  red2: '#D92D20',       // primary, lighter
  yellow: '#E8A10A',     // amber accent
  yellowLight: '#B54708',// amber for text/icons on light surfaces
  yellow2: '#FDB022',    // amber, lighter
  saffron: '#B42318',    // legacy alias → primary
  blue: '#1E3A8A',       // info accent
  brown: '#7A2E0E',
  black: '#0C0A09',      // dark-mode canvas
  dark: '#1C1917',       // dark-mode surface
  green: '#079455',
} as const;

// Warm neutral ramp (stone). Use via theme.palette.grey or directly here.
export const NEUTRAL = {
  0: '#FFFFFF',
  25: '#FCFCFB',
  50: '#FAFAF9',
  100: '#F5F5F4',
  200: '#E7E5E4',
  300: '#D6D3D1',
  400: '#A8A29E',
  500: '#78716C',
  600: '#57534E',
  700: '#44403C',
  800: '#292524',
  900: '#1C1917',
  950: '#0C0A09',
} as const;

export const FONT_FAMILY =
  '"Inter", "Noto Sans Kannada", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const UI_RADIUS = {
  base: 8,
  card: 12,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// THEME FACTORY
// ─────────────────────────────────────────────────────────────────────────────
export const getTheme = (mode: PaletteMode) => {
  const dark = mode === 'dark';
  const border = dark ? NEUTRAL[800] : NEUTRAL[200];
  const primaryMain = dark ? '#F04438' : BRAND.red;

  return createTheme({
    spacing: 8,
    // Base unit for numeric sx radii (borderRadius: 2 → 8px). Component
    // radii below are set explicitly in px via UI_RADIUS.
    shape: { borderRadius: 4 },

    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: dark ? '#F97066' : BRAND.red2,
        dark: dark ? '#D92D20' : '#912018',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: dark ? BRAND.yellow2 : BRAND.yellowLight,
        light: BRAND.yellow2,
        dark: '#93370D',
        contrastText: dark ? NEUTRAL[950] : '#FFFFFF',
      },
      grey: NEUTRAL,
      background: dark
        ? { default: NEUTRAL[950], paper: NEUTRAL[900] }
        : { default: NEUTRAL[0], paper: NEUTRAL[0] },
      text: dark
        ? { primary: NEUTRAL[50], secondary: NEUTRAL[400], disabled: NEUTRAL[600] }
        : { primary: NEUTRAL[900], secondary: NEUTRAL[600], disabled: NEUTRAL[400] },
      divider: border,
      success: { main: dark ? '#47CD89' : BRAND.green },
      error: { main: dark ? '#F97066' : '#D92D20' },
      warning: { main: dark ? '#FDB022' : '#DC6803' },
      info: { main: dark ? '#53B1FD' : '#1570EF' },
      action: {
        hover: dark ? alpha(NEUTRAL[50], 0.06) : alpha(NEUTRAL[900], 0.04),
        selected: alpha(primaryMain, dark ? 0.16 : 0.08),
      },
    },

    typography: {
      fontFamily: FONT_FAMILY,
      h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.15, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
      h3: { fontWeight: 650, fontSize: '1.625rem', lineHeight: 1.25, letterSpacing: '-0.015em' },
      h4: { fontWeight: 650, fontSize: '1.375rem', lineHeight: 1.3, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
      h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.45 },
      subtitle1: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.5 },
      subtitle2: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.5 },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.55 },
      caption: { fontSize: '0.75rem', lineHeight: 1.5 },
      overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { fontFeatureSettings: '"cv11", "ss01"', textRendering: 'optimizeLegibility' },
          // Normalise the many page-level radius overrides to one card radius.
          '.MuiCard-root': { borderRadius: `${UI_RADIUS.card}px !important` },
          '::selection': { background: alpha(primaryMain, 0.18) },
        },
      },

      MuiButtonBase: { defaultProps: { disableRipple: false } },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: UI_RADIUS.base,
            padding: '8px 16px',
            minHeight: 40,
            fontSize: '0.9375rem',
            transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease',
            '&:focus-visible': { outline: `2px solid ${alpha(primaryMain, 0.5)}`, outlineOffset: 2 },
          },
          sizeSmall: { minHeight: 32, padding: '4px 12px', fontSize: '0.8125rem' },
          sizeLarge: { minHeight: 48, padding: '12px 22px', fontSize: '1rem' },
          contained: { backgroundImage: 'none', boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
          outlined: {
            borderColor: dark ? NEUTRAL[700] : NEUTRAL[300],
            color: dark ? NEUTRAL[50] : NEUTRAL[900],
            backgroundColor: dark ? 'transparent' : NEUTRAL[0],
            '&:hover': {
              borderColor: dark ? NEUTRAL[600] : NEUTRAL[400],
              backgroundColor: dark ? alpha(NEUTRAL[50], 0.04) : NEUTRAL[50],
            },
          },
          text: { '&:hover': { backgroundColor: dark ? alpha(NEUTRAL[50], 0.06) : alpha(NEUTRAL[900], 0.04) } },
        },
      },

      MuiIconButton: {
        styleOverrides: { root: { borderRadius: UI_RADIUS.base } },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: border },
          elevation1: {
            boxShadow: dark
              ? `0 0 0 1px ${border}`
              : `0 0 0 1px ${border}, 0 1px 2px ${alpha(NEUTRAL[900], 0.04)}`,
          },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: UI_RADIUS.card,
            border: `1px solid ${border}`,
            boxShadow: dark ? 'none' : `0 1px 2px ${alpha(NEUTRAL[900], 0.04)}`,
          },
        },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: {
            backgroundColor: dark ? alpha(NEUTRAL[950], 0.85) : alpha(NEUTRAL[0], 0.85),
            backdropFilter: 'saturate(180%) blur(12px)',
            color: dark ? NEUTRAL[50] : NEUTRAL[900],
            borderBottom: `1px solid ${border}`,
            boxShadow: 'none',
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: UI_RADIUS.base,
            backgroundColor: dark ? NEUTRAL[900] : NEUTRAL[0],
            '& .MuiOutlinedInput-notchedOutline': { borderColor: dark ? NEUTRAL[700] : NEUTRAL[300] },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: dark ? NEUTRAL[600] : NEUTRAL[400] },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryMain,
              borderWidth: 1,
              boxShadow: `0 0 0 3px ${alpha(primaryMain, 0.15)}`,
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 500 },
          filledPrimary: {
            backgroundColor: alpha(primaryMain, dark ? 0.18 : 0.08),
            color: dark ? '#FDA29B' : '#912018',
          },
        },
      },

      MuiAlert: {
        styleOverrides: { root: { borderRadius: UI_RADIUS.base, alignItems: 'center' } },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: UI_RADIUS.card,
            border: dark ? `1px solid ${border}` : 'none',
            boxShadow: `0 24px 48px -12px ${alpha(NEUTRAL[950], dark ? 0.6 : 0.18)}`,
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: UI_RADIUS.base,
            border: `1px solid ${border}`,
            boxShadow: `0 12px 24px -6px ${alpha(NEUTRAL[950], dark ? 0.5 : 0.1)}`,
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: NEUTRAL[900], fontSize: '0.75rem', fontWeight: 500, borderRadius: 6 },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: dark ? NEUTRAL[950] : NEUTRAL[0],
            color: dark ? NEUTRAL[50] : NEUTRAL[900],
            borderColor: border,
            boxShadow: 'none',
          },
        },
      },

      MuiDivider: { styleOverrides: { root: { borderColor: border } } },

      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: border },
          head: {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: dark ? NEUTRAL[400] : NEUTRAL[600],
            backgroundColor: dark ? NEUTRAL[900] : NEUTRAL[50],
          },
        },
      },

      MuiTab: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } },
      },

      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 999 }, bar: { borderRadius: 999 } },
      },
    },
  });
};

const theme = getTheme('light');
export default theme;
