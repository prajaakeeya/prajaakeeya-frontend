/**
 * KattePage.tsx
 *
 * Katte (ಕಟ್ಟೆ) — Prajaakeeya's civic discussion forum.
 *
 * A Reddit-style platform where Citizens and Karyakartas discuss
 * government schemes, local issues, elections, and more.
 * Threads that cross 1,00,000 interest can be escalated to a petition.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
  Fade,
  IconButton,
  useTheme,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import CloseIcon from '@mui/icons-material/Close';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import {
  KatteThread,
  KatteCategory,
  KatteAuthor,
  KATTE_CATEGORIES,
  PETITION_THRESHOLD,
  CreateKatteThreadPayload,
  getDiscussions,
  createDiscussion,
  voteDiscussion,
  expressInterest,
  getUserVotes,
  getUserInterests,
  formatInterest,
  formatRelativeTime,
} from '../services/katteService';
import { BRAND } from '../theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";

const ALL_CATEGORIES: { value: KatteCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Topics' },
  { value: 'government', label: 'Government' },
  { value: 'local', label: 'Local Issues' },
  { value: 'elections', label: 'Elections' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'social', label: 'Social' },
  { value: 'environment', label: 'Environment' },
];

// ─── Role Badge ───────────────────────────────────────────────────────────────

const RoleBadge: React.FC<{ role: 'citizen' | 'karyakarta' }> = ({ role }) => {
  const isKaryakarta = role === 'karyakarta';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.4,
        px: 1,
        py: 0.25,
        borderRadius: 99,
        fontSize: '0.68rem',
        fontWeight: 800,
        fontFamily: FF_HEADING,
        letterSpacing: '0.04em',
        bgcolor: isKaryakarta
          ? 'rgba(245,168,0,0.15)'
          : 'rgba(34,197,94,0.12)',
        color: isKaryakarta ? '#D97706' : '#16A34A',
        border: `1px solid ${isKaryakarta ? 'rgba(245,168,0,0.35)' : 'rgba(34,197,94,0.3)'}`,
        flexShrink: 0,
      }}
    >
      {isKaryakarta ? '🏛' : '🗳'}&nbsp;{isKaryakarta ? 'Karyakarta' : 'Citizen'}
    </Box>
  );
};

// ─── Category Chip ────────────────────────────────────────────────────────────

const CategoryBadge: React.FC<{ category: KatteCategory }> = ({ category }) => {
  const meta = KATTE_CATEGORIES[category];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1,
        py: 0.2,
        borderRadius: 99,
        fontSize: '0.65rem',
        fontWeight: 700,
        fontFamily: FF_HEADING,
        color: meta.color,
        bgcolor: `${meta.color}18`,
        border: `1px solid ${meta.color}40`,
        letterSpacing: '0.03em',
        flexShrink: 0,
      }}
    >
      {meta.label}
    </Box>
  );
};

// ─── Petition Banner ──────────────────────────────────────────────────────────

const PetitionBanner: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1,
      borderRadius: 1.5,
      background: 'linear-gradient(90deg, rgba(200,24,10,0.15) 0%, rgba(245,168,0,0.12) 100%)',
      border: '1px solid rgba(245,168,0,0.4)',
      animation: 'petitionPulse 2.5s ease-in-out infinite',
    }}
  >
    <EmojiEventsRoundedIcon sx={{ color: '#F5A800', fontSize: 20 }} />
    <Typography
      sx={{
        fontFamily: FF_HEADING,
        fontWeight: 800,
        fontSize: '0.78rem',
        color: '#F5A800',
        flex: 1,
      }}
    >
      🔥 TRENDING — Over 1,00,000 people are interested!
    </Typography>
    <Button
      size="small"
      variant="contained"
      startIcon={<GavelRoundedIcon />}
      sx={{
        fontFamily: FF_HEADING,
        fontWeight: 800,
        fontSize: '0.7rem',
        px: 1.5,
        py: 0.5,
        minHeight: 'unset',
        bgcolor: BRAND.red,
        color: '#fff',
        boxShadow: '0 2px 10px rgba(200,24,10,0.35)',
        '&:hover': { bgcolor: BRAND.red2, transform: 'translateY(-1px)' },
      }}
    >
      File Petition
    </Button>
  </Box>
);

// ─── Thread Card ──────────────────────────────────────────────────────────────

interface ThreadCardProps {
  thread: KatteThread;
  userVote: 'up' | 'down' | null;
  isInterested: boolean;
  onVote: (id: string, dir: 'up' | 'down') => void;
  onInterest: (id: string) => void;
  isGuest: boolean;
}

const ThreadCard: React.FC<ThreadCardProps> = ({
  thread,
  userVote,
  isInterested,
  onVote,
  onInterest,
  isGuest,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isPetitionable = thread.interest >= PETITION_THRESHOLD;

  const cardBorder = isPetitionable
    ? '1.5px solid rgba(245,168,0,0.5)'
    : isDark
    ? '1px solid rgba(255,255,255,0.06)'
    : '1px solid rgba(0,0,0,0.07)';

  const cardShadow = isPetitionable
    ? isDark
      ? '0 0 24px rgba(245,168,0,0.18), 0 6px 20px rgba(0,0,0,0.5)'
      : '0 0 20px rgba(245,168,0,0.15), 0 6px 16px rgba(0,0,0,0.06)'
    : isDark
    ? '0 4px 16px rgba(0,0,0,0.4)'
    : '0 2px 12px rgba(0,0,0,0.04)';

  return (
    <Fade in timeout={350}>
      <Box
        sx={{
          bgcolor: isDark ? '#13161A' : '#fff',
          borderRadius: 2,
          border: cardBorder,
          boxShadow: cardShadow,
          overflow: 'hidden',
          transition: 'all 0.22s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isPetitionable
              ? isDark
                ? '0 0 32px rgba(245,168,0,0.25), 0 10px 28px rgba(0,0,0,0.6)'
                : '0 0 28px rgba(245,168,0,0.2), 0 10px 24px rgba(0,0,0,0.08)'
              : isDark
              ? '0 8px 28px rgba(0,0,0,0.55)'
              : '0 8px 24px rgba(0,0,0,0.08)',
          },
        }}
      >
        {/* Gold top accent for petition threads */}
        {isPetitionable && (
          <Box
            sx={{
              height: 3,
              background: 'linear-gradient(90deg, #C8180A 0%, #F5A800 50%, #C8180A 100%)',
              backgroundSize: '200% 100%',
              animation: 'goldSlide 2s linear infinite',
            }}
          />
        )}

        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          {/* Author row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5, flexWrap: 'wrap' }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: thread.author.role === 'karyakarta'
                  ? 'rgba(245,168,0,0.2)'
                  : 'rgba(200,24,10,0.15)',
                color: thread.author.role === 'karyakarta' ? '#D97706' : BRAND.red,
                fontFamily: FF_HEADING,
                fontWeight: 800,
                fontSize: '0.9rem',
                border: `1.5px solid ${thread.author.role === 'karyakarta' ? 'rgba(245,168,0,0.35)' : 'rgba(200,24,10,0.25)'}`,
              }}
            >
              {thread.author.avatarInitial}
            </Avatar>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: FF_HEADING,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: isDark ? '#E2E2E3' : '#111827',
                }}
              >
                {thread.author.name}
              </Typography>
              <RoleBadge role={thread.author.role} />
              <Typography
                sx={{
                  fontFamily: FF_BODY,
                  fontSize: '0.72rem',
                  color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.4)',
                  ml: 'auto',
                }}
              >
                {formatRelativeTime(thread.createdAt)}
              </Typography>
            </Box>
          </Box>

          {/* Category + tags */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2, flexWrap: 'wrap' }}>
            <CategoryBadge category={thread.category} />
            {thread.tags?.slice(0, 2).map((tag) => (
              <Box
                key={tag}
                component="span"
                sx={{
                  fontSize: '0.62rem',
                  fontFamily: FF_HEADING,
                  color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  px: 0.8,
                  py: 0.15,
                  borderRadius: 99,
                }}
              >
                #{tag}
              </Box>
            ))}
          </Box>

          {/* Title */}
          <Typography
            sx={{
              fontFamily: FF_HEADING,
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.08rem' },
              lineHeight: 1.4,
              color: isDark ? '#E2E2E3' : '#111827',
              mb: 1,
            }}
          >
            {thread.title}
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              fontFamily: FF_BODY,
              fontSize: '0.875rem',
              lineHeight: 1.65,
              color: isDark ? 'rgba(226,226,227,0.7)' : '#4B5563',
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {thread.description}
          </Typography>

          {/* Petition banner */}
          {isPetitionable && (
            <Box sx={{ mb: 2 }}>
              <PetitionBanner />
            </Box>
          )}

          {/* Action row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
              flexWrap: 'wrap',
              pt: 1.5,
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            }}
          >
            {/* Upvote */}
            <Tooltip title={isGuest ? 'Login to vote' : 'Upvote'}>
              <Box
                component="button"
                onClick={() => !isGuest && onVote(thread.id, 'up')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1.2,
                  py: 0.5,
                  border: `1.5px solid ${userVote === 'up' ? '#C8180A' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 99,
                  bgcolor: userVote === 'up' ? 'rgba(200,24,10,0.12)' : 'transparent',
                  color: userVote === 'up' ? BRAND.red : isDark ? 'rgba(255,255,255,0.55)' : '#6B7280',
                  cursor: isGuest ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: FF_HEADING,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  '&:hover': isGuest ? {} : {
                    bgcolor: 'rgba(200,24,10,0.1)',
                    borderColor: BRAND.red,
                    color: BRAND.red,
                  },
                }}
              >
                <ThumbUpAltRoundedIcon sx={{ fontSize: 16 }} />
                {thread.upvotes.toLocaleString('en-IN')}
              </Box>
            </Tooltip>

            {/* Downvote */}
            <Tooltip title={isGuest ? 'Login to vote' : 'Downvote'}>
              <Box
                component="button"
                onClick={() => !isGuest && onVote(thread.id, 'down')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1.2,
                  py: 0.5,
                  border: `1.5px solid ${userVote === 'down' ? '#253A9A' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 99,
                  bgcolor: userVote === 'down' ? 'rgba(37,58,154,0.12)' : 'transparent',
                  color: userVote === 'down' ? '#253A9A' : isDark ? 'rgba(255,255,255,0.55)' : '#6B7280',
                  cursor: isGuest ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: FF_HEADING,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  '&:hover': isGuest ? {} : {
                    bgcolor: 'rgba(37,58,154,0.1)',
                    borderColor: '#253A9A',
                    color: '#253A9A',
                  },
                }}
              >
                <ThumbDownAltRoundedIcon sx={{ fontSize: 16 }} />
                {thread.downvotes.toLocaleString('en-IN')}
              </Box>
            </Tooltip>

            {/* Interest */}
            <Tooltip title={isGuest ? 'Login to mark interest' : isInterested ? 'Remove interest' : 'I\'m interested'}>
              <Box
                component="button"
                onClick={() => !isGuest && onInterest(thread.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1.2,
                  py: 0.5,
                  border: `1.5px solid ${isInterested ? 'rgba(245,168,0,0.5)' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 99,
                  bgcolor: isInterested ? 'rgba(245,168,0,0.12)' : 'transparent',
                  color: isInterested ? '#D97706' : isDark ? 'rgba(255,255,255,0.55)' : '#6B7280',
                  cursor: isGuest ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: FF_HEADING,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  '&:hover': isGuest ? {} : {
                    bgcolor: 'rgba(245,168,0,0.1)',
                    borderColor: '#F5A800',
                    color: '#D97706',
                  },
                }}
              >
                {isInterested ? (
                  <FavoriteRoundedIcon sx={{ fontSize: 16, color: '#F5A800' }} />
                ) : (
                  <FavoriteBorderRoundedIcon sx={{ fontSize: 16 }} />
                )}
                {formatInterest(thread.interest)}
                {thread.interest >= PETITION_THRESHOLD && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.6rem',
                      color: '#F5A800',
                      fontWeight: 800,
                      ml: 0.2,
                    }}
                  >
                    ✦
                  </Box>
                )}
              </Box>
            </Tooltip>

            {/* Comments */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1.2,
                py: 0.5,
                color: isDark ? 'rgba(255,255,255,0.38)' : '#9CA3AF',
                fontFamily: FF_HEADING,
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 15 }} />
              {thread.commentCount} comments
            </Box>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

// ─── Create Discussion Dialog ─────────────────────────────────────────────────

interface CreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateKatteThreadPayload) => void;
}

const CreateDiscussionDialog: React.FC<CreateDialogProps> = ({ open, onClose, onSubmit }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<KatteCategory>('government');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleSubmit = () => {
    const errs: typeof errors = {};
    if (!title.trim() || title.trim().length < 10)
      errs.title = 'Title must be at least 10 characters';
    if (!description.trim() || description.trim().length < 30)
      errs.description = 'Description must be at least 30 characters';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit({ title: title.trim(), description: description.trim(), category });
    setTitle('');
    setDescription('');
    setCategory('government');
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: isDark ? '#13161A' : '#fff',
          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
          borderRadius: 2.5,
          boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.7)' : '0 24px 60px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Gold accent top */}
      <Box sx={{ height: 3, background: 'linear-gradient(90deg, #C8180A 0%, #F5A800 100%)' }} />

      <DialogTitle
        sx={{
          fontFamily: FF_HEADING,
          fontWeight: 800,
          fontSize: '1.15rem',
          color: isDark ? '#E2E2E3' : '#111827',
          pb: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'rgba(200,24,10,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '16px' }}>🪨</span>
          </Box>
          Start a Katte Discussion
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        <Typography
          sx={{
            fontFamily: FF_BODY,
            fontSize: '0.82rem',
            color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280',
            mb: 2.5,
          }}
        >
          Share your perspective on a government decision, local issue, or civic matter. Both Citizens and Karyakartas can participate.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontFamily: FF_HEADING, fontWeight: 700 }}>Topic Category</InputLabel>
            <Select
              value={category}
              label="Topic Category"
              onChange={(e) => setCategory(e.target.value as KatteCategory)}
              sx={{ fontFamily: FF_HEADING, fontWeight: 600 }}
            >
              {Object.entries(KATTE_CATEGORIES).map(([key, meta]) => (
                <MenuItem key={key} value={key} sx={{ fontFamily: FF_HEADING }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: meta.color,
                        flexShrink: 0,
                      }}
                    />
                    {meta.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Discussion Title"
            placeholder="What do you want to discuss? (min. 10 characters)"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 180 } }}
            sx={{ '& label': { fontFamily: FF_HEADING, fontWeight: 700 } }}
          />

          <TextField
            label="Your Perspective"
            placeholder="Share your thoughts, concerns, or observations... (min. 30 characters)"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })); }}
            error={!!errors.description}
            helperText={errors.description || `${description.length} characters`}
            fullWidth
            multiline
            minRows={4}
            maxRows={10}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
            sx={{ '& label': { fontFamily: FF_HEADING, fontWeight: 700 } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            fontFamily: FF_HEADING,
            fontWeight: 700,
            borderRadius: 99,
            px: 2.5,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            fontFamily: FF_HEADING,
            fontWeight: 800,
            borderRadius: 99,
            px: 3,
            bgcolor: BRAND.red,
            '&:hover': { bgcolor: BRAND.red2 },
          }}
        >
          Post Discussion
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── KattePage ────────────────────────────────────────────────────────────────

const KattePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const isGuest = !isAuthenticated;
  const authorRole: 'citizen' | 'karyakarta' =
    user?.role === 'aspirant' ? 'karyakarta' : 'citizen';

  const [threads, setThreads] = useState<KatteThread[]>([]);
  const [activeCategory, setActiveCategory] = useState<KatteCategory | 'all'>('all');
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [userInterests, setUserInterests] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'info' }>({
    open: false,
    msg: '',
    severity: 'success',
  });

  // Load data
  useEffect(() => {
    setThreads(getDiscussions(activeCategory));
    setUserVotes(getUserVotes());
    setUserInterests(getUserInterests());
  }, [activeCategory]);

  const handleVote = useCallback(
    (id: string, dir: 'up' | 'down') => {
      const result = voteDiscussion(id, dir);
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...result.thread, isPetitionable: result.thread.interest >= PETITION_THRESHOLD } : t))
      );
      setUserVotes((prev) => ({ ...prev, [id]: result.userVote }));
    },
    []
  );

  const handleInterest = useCallback((id: string) => {
    const result = expressInterest(id);
    const thread = result.thread;
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...thread, isPetitionable: thread.interest >= PETITION_THRESHOLD } : t))
    );
    setUserInterests((prev) => ({ ...prev, [id]: result.isInterested }));

    // If just crossed petition threshold, show snackbar
    if (result.isInterested && thread.interest >= PETITION_THRESHOLD) {
      setSnack({ open: true, msg: '🔥 This discussion has crossed 1,00,000 interest! It can now be filed as a petition.', severity: 'info' });
    }
  }, []);

  const handleCreate = useCallback(
    (payload: CreateKatteThreadPayload) => {
      const author: KatteAuthor = {
        id: user?.id ?? 0,
        name: user?.name ?? 'You',
        role: authorRole,
        avatarInitial: (user?.name ?? 'Y').charAt(0).toUpperCase(),
      };
      const thread = createDiscussion(payload, author);
      setThreads((prev) => [thread, ...prev]);
      setSnack({ open: true, msg: '✅ Your discussion has been posted to Katte!', severity: 'success' });
    },
    [user, authorRole]
  );

  // Petition count
  const petitionCount = threads.filter((t) => t.interest >= PETITION_THRESHOLD).length;

  const CSS = `
    @keyframes petitionPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(245, 168, 0, 0); }
      50% { box-shadow: 0 0 0 4px rgba(245, 168, 0, 0.18); }
    }
    @keyframes goldSlide {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
  `;

  return (
    <Box>
      <style>{CSS}</style>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 2.5,
          background: isDark
            ? 'radial-gradient(ellipse at top left, rgba(200,24,10,0.18) 0%, rgba(13,15,18,1) 60%), radial-gradient(ellipse at bottom right, rgba(245,168,0,0.1) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at top left, rgba(200,24,10,0.08) 0%, rgba(248,250,252,1) 60%), radial-gradient(ellipse at bottom right, rgba(245,168,0,0.06) 0%, transparent 60%)',
          border: isDark ? '1px solid rgba(200,24,10,0.2)' : '1px solid rgba(200,24,10,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid texture */}
        {isDark && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        )}

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Katte label */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(200,24,10,0.2) 0%, rgba(245,168,0,0.15) 100%)',
                border: `1px solid ${isDark ? 'rgba(245,168,0,0.3)' : 'rgba(200,24,10,0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
              }}
            >
              🪨
            </Box>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  fontFamily: FF_HEADING,
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  color: BRAND.red,
                  lineHeight: 1,
                  display: 'block',
                  fontSize: '0.68rem',
                }}
              >
                ಕಟ್ಟೆ · THE PUBLIC SQUARE
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: FF_HEADING,
                  fontWeight: 800,
                  color: isDark ? '#E2E2E3' : '#111827',
                  lineHeight: 1.15,
                  mt: 0.2,
                }}
              >
                Katte — Civic Discussions
              </Typography>
            </Box>
          </Box>

          <Typography
            sx={{
              fontFamily: FF_BODY,
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: isDark ? 'rgba(226,226,227,0.7)' : '#4B5563',
              mb: 2.5,
              maxWidth: '100%',
            }}
          >
            <strong style={{ fontFamily: FF_HEADING, color: isDark ? '#E2E2E3' : '#111827' }}>
              Katte
            </strong>{' '}
            is the village gathering place — brought digital. Citizens and Karyakartas
            come together here to debate government decisions, raise local concerns, and
            shape public opinion. When a discussion crosses{' '}
            <strong style={{ color: '#F5A800' }}>1,00,000 interest</strong>, it can be
            escalated as a formal petition.
          </Typography>

          {/* Stats row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 }, flexWrap: 'wrap', mb: 2.5 }}>
            {[
              { label: 'Discussions', value: threads.length },
              { label: 'Petitionable', value: petitionCount, highlight: petitionCount > 0 },
              { label: 'Roles', value: '2 — Citizens & Karyakartas', isText: true },
            ].map((stat) => (
              <Box key={stat.label} sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                <Typography
                  sx={{
                    fontFamily: FF_HEADING,
                    fontWeight: 800,
                    fontSize: stat.isText ? '0.75rem' : '1.3rem',
                    color: (stat as any).highlight ? '#F5A800' : BRAND.red,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FF_HEADING,
                    fontSize: '0.72rem',
                    color: isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF',
                    fontWeight: 600,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Action row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {!isGuest && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                id="katte-create-discussion-btn"
                onClick={() => setCreateOpen(true)}
                sx={{
                  fontFamily: FF_HEADING,
                  fontWeight: 800,
                  borderRadius: 99,
                  px: 3,
                  py: 1,
                  bgcolor: BRAND.red,
                  boxShadow: '0 4px 16px rgba(200,24,10,0.3)',
                  '&:hover': {
                    bgcolor: BRAND.red2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(200,24,10,0.45)',
                  },
                }}
              >
                Start a Discussion
              </Button>
            )}

            {isGuest && (
              <Alert
                severity="info"
                sx={{
                  fontFamily: FF_BODY,
                  fontSize: '0.82rem',
                  py: 0.5,
                  borderRadius: 2,
                }}
              >
                <strong>Login</strong> to post discussions, vote, and mark interest.
              </Alert>
            )}

            {/* Role legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              <RoleBadge role="citizen" />
              <RoleBadge role="karyakarta" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Category Filter ──────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <FilterListRoundedIcon
          sx={{
            fontSize: 18,
            color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
            mr: 0.5,
          }}
        />
        {ALL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value;
          const color =
            cat.value === 'all'
              ? BRAND.red
              : KATTE_CATEGORIES[cat.value as KatteCategory]?.color ?? BRAND.red;
          return (
            <Chip
              key={cat.value}
              label={cat.label}
              clickable
              onClick={() => setActiveCategory(cat.value as KatteCategory | 'all')}
              sx={{
                fontFamily: FF_HEADING,
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: 99,
                height: 32,
                bgcolor: isActive ? `${color}18` : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                color: isActive ? color : isDark ? 'rgba(255,255,255,0.55)' : '#6B7280',
                border: `1.5px solid ${isActive ? `${color}50` : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: `${color}14`,
                  borderColor: `${color}45`,
                  color: color,
                },
              }}
            />
          );
        })}
      </Box>

      {/* ── Thread List ──────────────────────────────────────────────────── */}
      {threads.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            color: isDark ? 'rgba(255,255,255,0.3)' : '#D1D5DB',
          }}
        >
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>🪨</Typography>
          <Typography
            sx={{
              fontFamily: FF_HEADING,
              fontWeight: 700,
              fontSize: '1.1rem',
              color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
            }}
          >
            No discussions yet in this category
          </Typography>
          {!isGuest && (
            <Button
              variant="outlined"
              onClick={() => setCreateOpen(true)}
              sx={{ mt: 2, fontFamily: FF_HEADING, fontWeight: 700, borderRadius: 99 }}
            >
              Be the first to start one
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              userVote={userVotes[thread.id] ?? null}
              isInterested={userInterests[thread.id] ?? false}
              onVote={handleVote}
              onInterest={handleInterest}
              isGuest={isGuest}
            />
          ))}
        </Box>
      )}

      {/* ── Create Dialog ────────────────────────────────────────────────── */}
      <CreateDiscussionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {/* ── Snackbar ─────────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{ fontFamily: FF_BODY, fontSize: '0.85rem', borderRadius: 2 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KattePage;
