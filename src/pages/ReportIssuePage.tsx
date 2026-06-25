import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ReportProblem as ReportProblemIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { createIssue } from '../services/civicIssuesService';
import { BRAND } from '../theme';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;
const DESC_MAX = 1000;

const ISSUE_CATEGORIES = [
  'Road Issue',
  'Electricity Issue',
  'Garbage Issue',
  'Drainage Issue',
  'Traffic Issue',
  'Pollution Issue',
  'Safety Issue',
  'Public Service Issue',
  'Others',
];

const ReportIssuePage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const wardNumber = user?.wardNumber ?? user?.wardId ?? '';

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Colours
  const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;
  const GOLDD = 'rgba(245,168,0,0.45)';
  const BG = theme.palette.background.paper;
  const borderFaint = isDark ? 'rgba(245,168,0,0.18)' : 'rgba(245,168,0,0.28)';
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.10)';
  const textPrimary = theme.palette.text.primary;
  const textMid = isDark ? 'rgba(255,255,255,0.64)' : 'rgba(17,24,39,0.65)';
  const textDim = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(17,24,39,0.46)';

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedCategories.length === 0) {
      setError('Please select at least one issue category.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe the issue.');
      return;
    }
    if (description.trim().length < 15) {
      setError('Description must be at least 15 characters.');
      return;
    }

    const title = selectedCategories.join(', ');
    setSubmitting(true);
    try {
      await createIssue(wardNumber, { title, description });
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────────────
  if (done) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', px: { xs: 1, sm: 0 } }}>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.42 }}>
          <Box sx={{
            bgcolor: BG, borderRadius: 3, border: `1px solid ${borderFaint}`,
            overflow: 'hidden',
            boxShadow: isDark ? '0 14px 32px rgba(0,0,0,0.32)' : '0 4px 14px rgba(17,24,39,0.06)',
          }}>
            <Box sx={{ display: 'flex', height: '4px' }}>
              {[BRAND.red, BRAND.blue, BRAND.brown].map(c => (
                <Box key={c} sx={{ flex: 1, bgcolor: c }} />
              ))}
            </Box>
            <Box sx={{ p: { xs: 4, sm: 5 }, textAlign: 'center' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}>
                <CheckCircleIcon sx={{ fontSize: 68, color: '#22c55e', mb: 2 }} />
              </motion.div>
              <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: '1.35rem', color: textPrimary, mb: 0.8 }}>
                Issue Reported!
              </Typography>
              <Typography sx={{ fontFamily: FF_BODY, color: textMid, mb: 3.5, lineHeight: 1.65 }}>
                Your civic issue has been recorded. Ward representatives will review and address it.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{
                justifyContent: "center"
              }}>
                <Button
                  variant="outlined"
                  onClick={() => { setDone(false); setSelectedCategories([]); setDescription(''); }}
                  sx={{
                    fontFamily: FF_HEADING, fontWeight: 700, borderRadius: 2, textTransform: 'none',
                    borderColor: GOLDD, color: GOLD,
                    '&:hover': { bgcolor: 'rgba(245,168,0,0.06)', borderColor: GOLD },
                  }}
                >
                  Report Another
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/user/civic-issues')}
                  sx={{
                    fontFamily: FF_HEADING, fontWeight: 700, borderRadius: 2, textTransform: 'none',
                    background: `linear-gradient(135deg,${BRAND.red} 0%,${BRAND.yellow} 100%)`,
                    color: '#fff',
                    '&:hover': { background: `linear-gradient(135deg,#e01c0c 0%,#ffb800 100%)` },
                  }}
                >
                  View All Issues
                </Button>
              </Stack>
            </Box>
          </Box>
        </motion.div>
      </Box>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', px: { xs: 1, sm: 0 } }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Box sx={{
          bgcolor: BG, borderRadius: 3, border: `1px solid ${borderFaint}`,
          overflow: 'hidden',
          boxShadow: isDark ? '0 14px 32px rgba(0,0,0,0.32)' : '0 4px 14px rgba(17,24,39,0.06)',
        }}>
          {/* Tri-colour bar */}
          <Box sx={{ display: 'flex', height: '4px' }}>
            {[BRAND.red, BRAND.blue, BRAND.brown].map(c => (
              <Box key={c} sx={{ flex: 1, bgcolor: c }} />
            ))}
          </Box>

          {/* Header */}
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3, borderBottom: `1px solid ${borderSubtle}`, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
            <Box sx={{
              width: 50, height: 50, borderRadius: '12px',
              background: 'linear-gradient(135deg,rgba(200,24,10,.22),rgba(37,58,154,.18))',
              border: '1.5px solid rgba(245,168,0,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ReportProblemIcon sx={{ color: GOLD, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: { xs: '1.12rem', sm: '1.3rem' }, color: textPrimary, lineHeight: 1.15 }}>
                Report a Public Issue
              </Typography>
              <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.84rem', color: textMid, mt: 0.2 }}>
                Describe the problem clearly so ward representatives can act on it.
              </Typography>
            </Box>

            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/user/civic-issues')}
              sx={{
                fontFamily: FF_HEADING, fontWeight: 700, textTransform: 'none',
                color: textMid, '&:hover': { color: GOLD },
              }}
            >
              Back to Issues
            </Button>
          </Box>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ px: { xs: 2.5, sm: 4 }, py: 3.5 }}
          >
            <Stack spacing={3}>
              {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ fontFamily: FF_BODY }}>
                  {error}
                </Alert>
              )}

              {/* Issue Category */}
              <Box>
                <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, color: textPrimary, mb: 1.2, fontSize: '0.92rem' }}>
                  Issue Category <Box component="span" sx={{ color: BRAND.red }}>*</Box>
                  <Box component="span" sx={{ fontWeight: 400, color: textDim, fontSize: '0.78rem', ml: 1 }}>(select all that apply)</Box>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {ISSUE_CATEGORIES.map(cat => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <Chip
                        key={cat}
                        label={cat}
                        onClick={() => !submitting && toggleCategory(cat)}
                        sx={{
                          fontFamily: FF_BODY, fontWeight: active ? 700 : 500,
                          fontSize: '0.83rem',
                          cursor: submitting ? 'default' : 'pointer',
                          bgcolor: active
                            ? `linear-gradient(135deg,${BRAND.red},${BRAND.yellow})`
                            : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.06)',
                          background: active
                            ? `linear-gradient(135deg,${BRAND.red} 0%,${BRAND.yellow} 100%)`
                            : undefined,
                          color: active ? '#fff' : textMid,
                          border: `1.5px solid ${active ? 'transparent' : borderSubtle}`,
                          boxShadow: active ? '0 2px 10px rgba(200,24,10,0.28)' : 'none',
                          transition: 'all 0.18s ease',
                          '&:hover': {
                            background: active
                              ? `linear-gradient(135deg,#e01c0c 0%,#ffb800 100%)`
                              : isDark ? 'rgba(245,168,0,0.10)' : 'rgba(245,168,0,0.10)',
                            borderColor: active ? 'transparent' : GOLDD,
                          },
                          '& .MuiChip-label': { px: 1.4 },
                        }}
                      />
                    );
                  })}
                </Box>
                {selectedCategories.length > 0 && (
                  <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.74rem', color: textDim, mt: 0.8 }}>
                    Selected: {selectedCategories.join(', ')}
                  </Typography>
                )}
              </Box>

              {/* Description */}
              <Box>
                <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, color: textPrimary, mb: 0.8, fontSize: '0.92rem' }}>
                  Description <Box component="span" sx={{ color: BRAND.red }}>*</Box>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="Provide details about the issue — location, frequency, impact on residents, and any previous complaints raised."
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, DESC_MAX))}
                  disabled={submitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: FF_BODY, borderRadius: 2,
                      '& fieldset': { borderColor: borderSubtle },
                      '&:hover fieldset': { borderColor: GOLDD },
                      '&.Mui-focused fieldset': { borderColor: GOLD },
                    },
                    '& .MuiInputBase-input': { fontFamily: FF_BODY },
                  }}
                  slotProps={{
                    htmlInput: { maxLength: DESC_MAX }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.4 }}>
                  <Typography sx={{ fontFamily: FF_HEADING, fontSize: '0.72rem', color: description.length >= DESC_MAX ? BRAND.red : textDim }}>
                    {description.length}/{DESC_MAX}
                  </Typography>
                </Box>
              </Box>

              {/* Submitting progress */}
              {submitting && (
                <LinearProgress
                  sx={{
                    borderRadius: 1, height: 3,
                    '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg,${BRAND.red},${BRAND.yellow})` },
                    bgcolor: borderSubtle,
                  }}
                />
              )}

              {/* Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{
                justifyContent: "flex-end"
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/user/civic-issues')}
                  disabled={submitting}
                  sx={{
                    fontFamily: FF_HEADING, fontWeight: 700, borderRadius: 2, textTransform: 'none',
                    borderColor: borderSubtle, color: textMid,
                    '&:hover': { borderColor: GOLDD, color: GOLD, bgcolor: 'rgba(245,168,0,0.04)' },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={submitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SendIcon />}
                  disabled={submitting || selectedCategories.length === 0 || !description.trim()}
                  sx={{
                    fontFamily: FF_HEADING, fontWeight: 800, borderRadius: 2, textTransform: 'none',
                    px: 3, py: 1.1,
                    background: `linear-gradient(135deg,${BRAND.red} 0%,${BRAND.yellow} 100%)`,
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(200,24,10,0.3)',
                    '&:hover': { background: `linear-gradient(135deg,#e01c0c 0%,#ffb800 100%)`, boxShadow: '0 6px 24px rgba(200,24,10,0.5)' },
                    '&.Mui-disabled': {
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.10)',
                      color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(17,24,39,0.35)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit Issue'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ReportIssuePage;
