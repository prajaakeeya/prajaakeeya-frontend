import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  CircularProgress,
  useTheme,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // needed by the commented-out Back button below
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GavelIcon from '@mui/icons-material/Gavel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { BRAND } from '../../theme';

// ── Theme constants — sourced from central BRAND palette ──────────────────
const GOLD = BRAND.yellow;                    // '#F5A800'
const GOLDD = 'rgba(245,168,0,0.45)';
const DARK = BRAND.black;                     // '#0A0808'
const DARK2 = 'rgba(255,255,255,0.03)';
const BORDER = 'rgba(245,168,0,0.18)';
const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;



// ── Types ──────────────────────────────────────────────────────────────────
export interface DeclarationChecks {
  agreed: boolean;
}

interface Props {
  sopAgreed: boolean;
  setSopAgreed: (v: boolean) => void;
  onSopClick: () => void;
  declarationChecks: DeclarationChecks;
  setDeclarationChecks: React.Dispatch<React.SetStateAction<DeclarationChecks>>;
  digitalSignature: string;
  setDigitalSignature: (v: string) => void;
  canProceed: boolean;
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────
const DeclarationStep = ({
  sopAgreed, setSopAgreed, onSopClick,
  declarationChecks, setDeclarationChecks,
  digitalSignature, setDigitalSignature,
  canProceed, loading,
  onSubmit,
}: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? DARK : 'linear-gradient(180deg,#fffdfa 0%,#f9f4ec 100%)';
  const borderColor = isDark ? BORDER : 'rgba(245,168,0,0.24)';
  const textPrimary = isDark ? '#fff' : 'rgba(15,23,42,0.94)';
  const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.62)';
  const cardSubtleBg = isDark ? DARK2 : 'rgba(15,23,42,0.04)';
  const cardSubtleBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.12)';
  const fieldBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.2)';
  const fieldBg = isDark ? DARK2 : 'rgba(255,255,255,0.86)';


  return (
    <Box sx={{ position: 'relative' }}>
      {/* ── Main card ──────────────────────────────────────────────────── */}
      <Box sx={{
        bgcolor: DARK, borderRadius: 2, overflow: 'hidden',
        background: cardBg,
        border: `1px solid ${borderColor}`,
        boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(17,24,39,0.08)',
        transition: 'opacity 0.3s',
      }}>

        {/* Top colour bar */}
        <Box sx={{ display: 'flex', height: '5px' }}>
          {['#C8180A', '#F5A800', '#E02010'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
        </Box>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Box sx={{
            px: { xs: 2.5, sm: 4 }, pt: 3.5, pb: 2.5,
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg,rgba(200,24,10,.25),rgba(245,168,0,.18))',
              border: `1.5px solid rgba(245,168,0,.35)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GavelIcon sx={{ color: GOLD, fontSize: 28 }} />
            </Box>
            <Box>
              <Typography sx={{
                fontFamily: FF_HEADING, fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.35rem' },
                color: textPrimary, lineHeight: 1.2,
              }}>
                {t('forms.aspirant.declaration.title')}
              </Typography>
              <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.82rem', color: textSecondary, mt: '2px' }}>
                {t('forms.aspirant.declaration.subtitle')}
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* ── Declaration text ── */}
        <Box sx={{ px: { xs: 2, sm: 4 }, pt: 3, pb: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Box sx={{
              borderRadius: '10px',
              px: { xs: 1.5, sm: 2 }, py: { xs: 1.5, sm: 2 },
              background: cardSubtleBg,
              border: `1.5px solid ${cardSubtleBorder}`,
            }}>
              <Typography sx={{
                fontFamily: FF_BODY, fontSize: { xs: '0.8rem', sm: '0.88rem' }, fontWeight: 500,
                lineHeight: 1.7,
                color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.82)',
              }}>
                {t('forms.aspirant.declaration.checkbox.agreed')}
              </Typography>

              <Typography sx={{
                fontFamily: FF_BODY, fontSize: { xs: '0.8rem', sm: '0.88rem' }, fontWeight: 500,
                lineHeight: 1.7,
                mt: 1.5,
                color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.82)',
              }}>
                {t('forms.aspirant.declaration.checkbox.agreed1')}
              </Typography>
               <Typography sx={{
                fontFamily: FF_BODY, fontSize: { xs: '0.8rem', sm: '0.88rem' }, fontWeight: 500,
                lineHeight: 1.7,
                mt: 1.5,
                color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.82)',
              }}>
                {t('forms.aspirant.declaration.checkbox.agreed2')}
              </Typography>
            </Box>

            {/* ── Agree checkbox ── */}
            <Box sx={{
              mt: 2,
              borderRadius: '10px',
              px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.5 },
              background: declarationChecks.agreed ? 'rgba(30,160,30,0.08)' : cardSubtleBg,
              border: `1.5px solid ${declarationChecks.agreed ? 'rgba(34,200,34,0.4)' : cardSubtleBorder}`,
              transition: 'all 0.25s ease',
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={declarationChecks.agreed}
                    onChange={e => setDeclarationChecks({ agreed: e.target.checked })}
                    sx={{
                      color: GOLDD,
                      '&.Mui-checked': { color: '#4caf50' },
                    }}
                  />
                }
                label={
                  <Typography sx={{
                    fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.92rem',
                    color: declarationChecks.agreed
                      ? '#4caf50'
                      : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.78)'),
                    transition: 'color 0.2s',
                  }}>
                    {t('forms.aspirant.declaration.checkbox.agreeLabel')}
                  </Typography>
                }
              />
            </Box>
          </motion.div>
        </Box>

        {/* ── Divider ── */}
        <Box sx={{ mx: { xs: 2, sm: 4 }, my: 2.5, height: '1px', background: `linear-gradient(90deg, transparent, ${GOLDD}, transparent)` }} />

        {/* ── Signature / Place / Date ── */}
        <Box sx={{ px: { xs: 2, sm: 4 }, pb: 3 }}>
          {/* <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.82rem', color: textSecondary, letterSpacing: '2px', textTransform: 'uppercase', mb: 2 }}>
            Name
          </Typography> */}

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                md: 5
              }}>
              <TextField
                fullWidth
                label={t('forms.aspirant.declaration.signature.label')}
                placeholder={t('forms.aspirant.declaration.signature.placeholder')}
                value={digitalSignature}
                onChange={e => setDigitalSignature(e.target.value)}
                helperText={t('forms.aspirant.declaration.signature.placeholder')}
                slotProps={{
                  inputLabel: { sx: { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.62)', fontFamily: FF_BODY } },
                  htmlInput: { style: { fontFamily: FF_BODY, color: isDark ? '#fff' : 'rgba(15,23,42,0.92)', fontStyle: digitalSignature ? 'italic' : 'normal' } },
                  formHelperText: { sx: { color: GOLDD, fontFamily: FF_BODY, fontSize: '0.72rem' } }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: fieldBg,
                    '& fieldset': { borderColor: fieldBorder },
                    '&:hover fieldset': { borderColor: GOLDD },
                    '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: '1.5px' },
                  },
                }} />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <Box
                sx={{
                  height: 56,
                  px: 1.75,
                  borderRadius: '4px',
                  display: 'flex', alignItems: 'center', gap: 1.25,
                  background: sopAgreed
                    ? (isDark ? 'rgba(43,180,104,0.10)' : 'rgba(43,180,104,0.12)')
                    : fieldBg,
                  border: `1.5px solid ${sopAgreed
                    ? 'rgba(43,180,104,0.45)'
                    : (isDark ? 'rgba(245,168,0,0.4)' : 'rgba(245,168,0,0.5)')}`,
                  transition: 'all 0.2s',
                }}
              >
                <Checkbox
                  checked={sopAgreed}
                  onChange={e => setSopAgreed(e.target.checked)}
                  icon={<CheckBoxOutlineBlankIcon sx={{ color: GOLD, fontSize: 24 }} />}
                  checkedIcon={<CheckBoxIcon sx={{ color: '#2fbf71', fontSize: 24 }} />}
                  sx={{ p: 0 }}
                  slotProps={{
                    input: {
                      'aria-label': t('forms.aspirant.declaration.sopAgreeLabel') || 'I have read and agree to the SOP',
                    }
                  }}
                />
                <Box
                  component="button"
                  type="button"
                  onClick={onSopClick}
                  aria-label={t('forms.aspirant.declaration.sopAgreeHint') || 'Tap to view SOP'}
                  sx={{
                    all: 'unset',
                    cursor: 'pointer',
                    flex: 1, minWidth: 0,
                    textAlign: 'left',
                  }}
                >
                  <Typography sx={{
                    fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.15,
                    color: sopAgreed ? '#2fbf71' : (isDark ? '#fff' : 'rgba(15,23,42,0.92)'),
                  }}>
                    {sopAgreed
                      ? (t('forms.aspirant.declaration.sopAgreed') || 'SOP Agreed')
                      : (t('forms.aspirant.declaration.sopAgree') || 'Agree to SOP')}
                  </Typography>
                  <Typography sx={{
                    fontFamily: FF_BODY, fontSize: '0.7rem', mt: '2px',
                    color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.6)',
                  }}>
                    {sopAgreed
                      ? (t('forms.aspirant.declaration.sopAgreedHint') || 'Tap to review again')
                      : (t('forms.aspirant.declaration.sopAgreeHint') || 'Tap to view & accept SOP')}
                  </Typography>
                </Box>
                <Box
                  component="button"
                  type="button"
                  onClick={onSopClick}
                  aria-label={sopAgreed
                    ? (t('forms.aspirant.declaration.sopAgreedHint') || 'Review SOP')
                    : (t('forms.aspirant.declaration.sopAgreeHint') || 'View SOP')}
                  sx={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: '6px',
                    transition: 'background 0.18s',
                    '&:hover': {
                      background: sopAgreed
                        ? (isDark ? 'rgba(43,180,104,0.18)' : 'rgba(43,180,104,0.2)')
                        : (isDark ? 'rgba(245,168,0,0.14)' : 'rgba(245,168,0,0.18)'),
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${sopAgreed ? 'rgba(43,180,104,0.7)' : GOLD}`,
                      outlineOffset: '1px',
                    },
                  }}
                >
                  <OpenInNewIcon sx={{
                    fontSize: 18,
                    color: sopAgreed ? 'rgba(43,180,104,0.9)' : GOLD,
                  }} />
                </Box>
              </Box>
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 3
              }}>
              <TextField
                fullWidth
                label={t('forms.aspirant.declaration.signature.date')}
                value={new Date().toLocaleDateString()}
                disabled
                slotProps={{
                  inputLabel: { sx: { color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.68)', fontFamily: FF_BODY } },
                  htmlInput: { style: { fontFamily: FF_BODY, color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.78)' } }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.04)',
                    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.16)' },
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.68)',
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.78)',
                    WebkitTextFillColor: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.78)',
                  },
                }} />
            </Grid>
          </Grid>
        </Box>

        {/* ── Proceed bar ── */}
        <Box sx={{
          px: { xs: 2, sm: 4 }, py: 2.5,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(17,24,39,0.02)',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap',
        }}>

          {/* Completion hint */}
          <Typography sx={{
            fontFamily: FF_BODY, fontSize: '0.78rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.6)',
            display: { xs: 'none', sm: 'block' },
          }}>
            {canProceed
              ? (t('forms.aspirant.declaration.footer') || '✓ Declaration confirmed — ready to proceed')
              : (t('forms.aspirant.declaration.instruction') || 'Agree to declaration & SOP, provide signature to continue')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
            {/* Home & Back buttons — commented out per request. To restore: uncomment
                this block, re-add `onBack, onCancel` to the props destructure above,
                and uncomment the ArrowBackIcon import near the top.
            {onCancel && (
              <Box sx={{ flex: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onCancel}
                  sx={{
                    height: 44,
                    fontFamily: FF_BODY, fontWeight: 600, textTransform: 'none', borderRadius: '8px',
                    borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.22)',
                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.6)',
                    '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.06)' },
                    px: 1.5,
                  }}
                >
                  {t('common.home')}
                </Button>
              </Box>
            )}

            <Box sx={{ flex: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{
                  height: 44,
                  fontFamily: FF_BODY, fontWeight: 600, textTransform: 'none', borderRadius: '8px',
                  borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.22)',
                  color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.74)',
                  '&:hover': {
                    borderColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.38)',
                    color: isDark ? '#fff' : 'rgba(15,23,42,0.95)',
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'
                  },
                  px: 1.5,
                }}
              >
                {t('forms.aspirant.navigation.back')}
              </Button>
            </Box>
            */}

            <Box sx={{ flex: 1 }}>
              <motion.div animate={canProceed ? { scale: [1, 1.04, 1] } : { scale: 1 }} transition={{ duration: 0.4 }}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!canProceed || loading}
                  startIcon={loading
                    ? <CircularProgress size={18} sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)' }} />
                    : <VerifiedUserIcon />}
                  onClick={onSubmit}
                  sx={{
                    height: 44,
                    fontFamily: FF_HEADING, fontWeight: 800, textTransform: 'none',
                    borderRadius: '8px',
                    background: canProceed ? 'linear-gradient(135deg,#C8180A,#F5A800)' : undefined,
                    boxShadow: canProceed ? '0 4px 22px rgba(200,24,10,0.4)' : 'none',
                    '&:hover': canProceed ? {
                      background: 'linear-gradient(135deg,#F5A800,#C8180A)',
                      boxShadow: '0 6px 30px rgba(245,168,0,0.4)',
                      transform: 'translateY(-2px)',
                    } : {},
                    '&.Mui-disabled': {
                      color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.36)',
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.12)'
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  {loading ? t('common.submitting') : t('forms.aspirant.navigation.next')}
                </Button>
              </motion.div>
            </Box>
          </Box>
        </Box>

        {/* Bottom colour bar */}
        <Box sx={{ display: 'flex', height: '4px', opacity: 0.4 }}>
          {['#C8180A', '#F5A800', '#E02010'].map(c => <Box key={c} sx={{ flex: 1, bgcolor: c }} />)}
        </Box>

      </Box>
    </Box>
  );
};

export default DeclarationStep;
