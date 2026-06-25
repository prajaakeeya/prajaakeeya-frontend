import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Divider,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  NotificationsNone as BellIcon,
  HowToVote as VoteIcon,
  Campaign as CampaignIcon,
  ReportProblem as IssueIcon,
  PersonAddAlt as AspirantIcon,
  ChatBubbleOutlined as ChatIcon,
  EventAvailable as MeetingIcon,
  DoneAll as DoneAllIcon,
  DeleteOutlined as DeleteIcon,
  DeleteSweepOutlined as ClearAllIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BRAND } from '../theme';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  emitNotificationsChanged,
  ApiNotification,
} from '../services/notificationService';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;

type Kind = 'vote' | 'issue' | 'aspirant' | 'announcement' | 'chat' | 'meeting';
type Bucket = 'today' | 'yesterday' | 'earlier';

interface UiNotification {
  id: number;
  kind: Kind;
  title: string;
  body?: string;
  time: string;
  bucket: Bucket;
  read: boolean;
  href?: string;
}

const typeToKind = (type: string): Kind => {
  switch (type) {
    case 'voting_window':
      return 'vote';
    case 'civic_issue':
      return 'issue';
    case 'new_aspirant':
      return 'aspirant';
    case 'chat_message':
      return 'chat';
    case 'meeting':
    case 'visit':
    case 'visit_started':
      return 'meeting';
    case 'announcement':
    default:
      return 'announcement';
  }
};

const electionNameToTypeSlug = (electionName: string): string | undefined => {
  // Strip parenthetical (e.g., "Lok Sabha (MP)" → "Lok Sabha"), lowercase, snake_case.
  const base = electionName.replace(/\(.*?\)/g, '').trim().toLowerCase();
  if (!base) return undefined;
  return base.replace(/\s+/g, '_');
};

const hrefFor = (n: ApiNotification): string | undefined => {
  switch (n.type) {
    case 'voting_window': {
      const electionName = (n.metadata?.electionName as string | undefined) ?? undefined;
      const slug = electionName ? electionNameToTypeSlug(electionName) : undefined;
      return slug ? `/user/aspirantslist?type=${slug}` : '/user/aspirantslist';
    }
    case 'civic_issue':
      return '/user/civic-issues';
    case 'new_aspirant':
      return n.aspirantId ? `/user/aspirants/${n.aspirantId}/view` : '/user/aspirantslist';
    case 'chat_message':
      return n.aspirantId ? `/user/chat/${n.aspirantId}` : undefined;
    case 'meeting':
      return '/user/dashboard/meetings';
    case 'aspirant_meeting':
    case 'aspirant_visit':
    case 'visit_started':
    case 'meeting_started':
    case 'meeting_reminder': {
      const params = new URLSearchParams();
      if (n.electionId != null) params.set('electionId', String(n.electionId));
      if (n.aspirantId != null) params.set('aspirantId', String(n.aspirantId));
      const qs = params.toString();
      return qs ? `/user/aspirantslist?${qs}` : '/user/aspirantslist';
    }
    default:
      return undefined;
  }
};

const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const bucketFor = (ts: number): Bucket => {
  const today = startOfDay(Date.now());
  const yesterday = today - 24 * 60 * 60 * 1000;
  const day = startOfDay(ts);
  if (day === today) return 'today';
  if (day === yesterday) return 'yesterday';
  return 'earlier';
};

const relativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24 && bucketFor(ts) === 'today') return `${hrs}h ago`;
  const date = new Date(ts);
  const dateStr = date.toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  if (bucketFor(ts) === 'yesterday') return `Yesterday, ${dateStr}`;
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const toUiNotification = (n: ApiNotification): UiNotification => ({
  id: n.id,
  kind: typeToKind(n.type),
  title: n.title,
  body: n.body ?? undefined,
  time: relativeTime(n.createdAt),
  bucket: bucketFor(n.createdAt),
  read: n.isRead,
  href: hrefFor(n),
});

export default function NotificationsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useTranslation();

  const [items, setItems] = useState<UiNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accent = isDark ? BRAND.yellow : BRAND.saffron;
  const textPrimary = theme.palette.text.primary;
  const subText = isDark ? 'rgba(255,255,255,0.62)' : 'rgba(17,24,39,0.6)';
  const borderFaint = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(17,24,39,0.10)';

  const KIND_META: Record<Kind, { icon: React.ReactNode; tint: string; label: string }> = {
    vote: {
      icon: <VoteIcon fontSize="small" />,
      tint: BRAND.blue,
      label: t('notifications.kinds.vote') || 'Voting',
    },
    issue: {
      icon: <IssueIcon fontSize="small" />,
      tint: BRAND.red,
      label: t('notifications.kinds.issue') || 'Public Issue',
    },
    aspirant: {
      icon: <AspirantIcon fontSize="small" />,
      tint: BRAND.brown,
      label: t('notifications.kinds.aspirant') || 'Aspirant',
    },
    announcement: {
      icon: <CampaignIcon fontSize="small" />,
      tint: BRAND.saffron,
      label: t('notifications.kinds.announcement') || 'Announcement',
    },
    chat: {
      icon: <ChatIcon fontSize="small" />,
      tint: BRAND.blue,
      label: t('notifications.kinds.chat') || 'Chat',
    },
    meeting: {
      icon: <MeetingIcon fontSize="small" />,
      tint: BRAND.brown,
      label: t('notifications.kinds.meeting') || 'Meeting',
    },
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listNotifications({ page: 1, limit: 50 });
      const ui = (data?.data ?? []).map(toUiNotification);
      setItems(ui);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const visible = useMemo(
    () => (filter === 'unread' ? items.filter((n) => !n.read) : items),
    [items, filter],
  );

  const grouped = useMemo(() => {
    const map: Record<Bucket, UiNotification[]> = { today: [], yesterday: [], earlier: [] };
    for (const n of visible) map[n.bucket].push(n);
    return map;
  }, [visible]);

  const handleMarkAll = async () => {
    const previouslyUnread = items.filter((n) => !n.read);
    if (previouslyUnread.length === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
      emitNotificationsChanged();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to mark all as read.');
      setItems((prev) =>
        prev.map((n) =>
          previouslyUnread.some((u) => u.id === n.id) ? { ...n, read: false } : n,
        ),
      );
    }
  };

  const handleClearAll = async () => {
    if (items.length === 0) return;
    const snapshot = items;
    setItems([]);
    try {
      await clearAllNotifications();
      emitNotificationsChanged();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to clear notifications.');
      setItems(snapshot);
    }
  };

  const handleDelete = async (id: number) => {
    const snapshot = items;
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotification(id);
      emitNotificationsChanged();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to delete notification.');
      setItems(snapshot);
    }
  };

  const handleClickItem = (n: UiNotification) => {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      markNotificationRead(n.id)
        .then(() => emitNotificationsChanged())
        .catch(() => {
          // Non-critical — keep the optimistic state; the next fetch will reconcile.
        });
    }
    if (n.href) navigate(n.href);
  };

  const sectionLabel = (b: Bucket) =>
    b === 'today'
      ? t('notifications.sections.today') || 'Today'
      : b === 'yesterday'
        ? t('notifications.sections.yesterday') || 'Yesterday'
        : t('notifications.sections.earlier') || 'Earlier';

  return (
    <Stack spacing={3} sx={{ pb: { xs: 4, md: 6 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1.4, sm: 2 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPrimary, lineHeight: 1.1 }}
              >
                {t('notifications.title') || 'Notifications'}
              </Typography>
            </Box>
          </Box>

        </Box>
      </motion.div>

      {/* Filter tabs + Mark all read */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 1 }}
      >
        <ToggleButtonGroup
          value={filter}
          exclusive
          size="small"
          onChange={(_, v) => v && setFilter(v)}
          sx={{
            p: 0.5,
            gap: 0.5,
            borderRadius: 50,
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.04)',
            border: `1px solid ${borderFaint}`,
            backdropFilter: 'blur(6px)',
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              borderRadius: '999px !important',
              mx: 0,
            },
            '& .MuiToggleButton-root': {
              fontFamily: FF_BODY,
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              color: subText,
              px: 2.2,
              py: 0.6,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: isDark ? 'rgba(245,168,0,0.08)' : 'rgba(245,168,0,0.08)',
                color: accent,
              },
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, rgba(245,168,0,0.95) 0%, rgba(224,32,16,0.85) 100%)',
                color: '#fff',
                boxShadow: '0 4px 12px -2px rgba(245,168,0,0.45)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(245,168,0,1) 0%, rgba(224,32,16,0.95) 100%)',
                  color: '#fff',
                },
              },
            },
          }}
        >
          <ToggleButton value="all">
            {t('notifications.tabs.all') || 'All'} ({items.length})
          </ToggleButton>
          <ToggleButton value="unread">
            {t('notifications.tabs.unread') || 'Unread'} ({unreadCount})
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            disabled={unreadCount === 0 || loading}
            startIcon={<DoneAllIcon sx={{ fontSize: 18 }} />}
            onClick={handleMarkAll}
            sx={{
              fontFamily: FF_BODY,
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              py: 0.7,
              color: accent,
              border: `1px solid ${isDark ? 'rgba(245,168,0,0.28)' : 'rgba(245,168,0,0.35)'}`,
              background: isDark ? 'rgba(245,168,0,0.06)' : 'rgba(245,168,0,0.05)',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: accent,
                background: isDark ? 'rgba(245,168,0,0.14)' : 'rgba(245,168,0,0.12)',
                boxShadow: '0 4px 12px -3px rgba(245,168,0,0.35)',
              },
              '&.Mui-disabled': {
                color: subText,
                borderColor: borderFaint,
                background: 'transparent',
              },
            }}
          >
            {t('notifications.markAllRead') || 'Mark all read'}
          </Button>
          <Button
            size="small"
            disabled={items.length === 0 || loading}
            startIcon={<ClearAllIcon sx={{ fontSize: 18 }} />}
            onClick={handleClearAll}
            sx={{
              fontFamily: FF_BODY,
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              py: 0.7,
              color: accent,
              border: `1px solid ${isDark ? 'rgba(245,168,0,0.28)' : 'rgba(245,168,0,0.35)'}`,
              background: isDark ? 'rgba(245,168,0,0.06)' : 'rgba(245,168,0,0.05)',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: accent,
                background: isDark ? 'rgba(245,168,0,0.14)' : 'rgba(245,168,0,0.12)',
                boxShadow: '0 4px 12px -3px rgba(245,168,0,0.35)',
              },
              '&.Mui-disabled': {
                color: subText,
                borderColor: borderFaint,
                background: 'transparent',
              },
            }}
          >
            {t('notifications.clearAll') || 'Clear all'}
          </Button>
        </Stack>
      </Stack>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ fontFamily: FF_BODY }}>
          {error}
        </Alert>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Stack spacing={1.2}>
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={92}
              sx={{ borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : undefined }}
            />
          ))}
        </Stack>
      )}

      {/* Empty state */}
      {!loading && !error && visible.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 6, md: 9 },
            border: `1px dashed ${borderFaint}`,
            borderRadius: 4,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(17,24,39,0.02)',
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 1.6,
              bgcolor: isDark ? 'rgba(245,168,0,0.14)' : 'rgba(245,168,0,0.15)',
              color: accent,
              border: `1px solid rgba(245,168,0,0.36)`,
            }}
          >
            <BellIcon />
          </Avatar>
          <Typography
            sx={{ fontFamily: FF_HEADING, fontWeight: 800, color: textPrimary, fontSize: '1.05rem' }}
          >
            {filter === 'unread'
              ? t('notifications.emptyUnreadTitle') || 'No unread notifications'
              : t('notifications.emptyTitle') || "You're all caught up"}
          </Typography>
          <Typography sx={{ fontFamily: FF_BODY, color: subText, mt: 0.5 }}>
            {t('notifications.emptyBody') || 'New activity will show up here.'}
          </Typography>
        </Box>
      )}

      {/* Grouped list */}
      {!loading &&
        !error &&
        (['today', 'yesterday', 'earlier'] as Bucket[]).map((bucket) => {
          const list = grouped[bucket];
          if (!list || list.length === 0) return null;
          return (
            <Box key={bucket}>
              <Typography
                sx={{
                  fontFamily: FF_BODY,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  color: subText,
                  mb: 1,
                }}
              >
                {sectionLabel(bucket)}
              </Typography>

              <Stack spacing={1.2}>
                {list.map((n) => {
                  const meta = KIND_META[n.kind];
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Box
                        onClick={() => handleClickItem(n)}
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          gap: 1.4,
                          p: { xs: 1.4, sm: 1.8 },
                          borderRadius: 3,
                          cursor: 'pointer',
                          border: `1px solid ${
                            !n.read
                              ? isDark
                                ? 'rgba(245,168,0,0.32)'
                                : 'rgba(245,168,0,0.42)'
                              : borderFaint
                          }`,
                          background: !n.read
                            ? isDark
                              ? 'linear-gradient(135deg, rgba(245,168,0,0.08), rgba(200,24,10,0.05))'
                              : 'linear-gradient(135deg, rgba(245,168,0,0.08), rgba(200,24,10,0.04))'
                            : isDark
                              ? 'rgba(255,255,255,0.02)'
                              : '#fff',
                          transition:
                            'transform .15s ease, box-shadow .15s ease, border-color .15s ease',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            borderColor: accent,
                            boxShadow: isDark
                              ? '0 10px 24px rgba(0,0,0,0.35)'
                              : '0 8px 22px rgba(17,24,39,0.08)',
                          },
                        }}
                      >
                        <Tooltip title={t('notifications.delete') || 'Delete'}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(n.id);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 28,
                              height: 28,
                              color: subText,
                              opacity: 0.7,
                              '&:hover': {
                                opacity: 1,
                                color: BRAND.red,
                                bgcolor: isDark ? 'rgba(200,24,10,0.10)' : 'rgba(200,24,10,0.08)',
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Avatar
                          sx={{
                            width: 42,
                            height: 42,
                            flexShrink: 0,
                            bgcolor: isDark ? `${meta.tint}22` : `${meta.tint}1f`,
                            color: meta.tint,
                            border: `1px solid ${meta.tint}55`,
                          }}
                        >
                          {meta.icon}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0, pr: 4.5 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.8,
                              flexWrap: 'wrap',
                              mb: 0.3,
                            }}
                          >
                            <Chip
                              size="small"
                              label={meta.label}
                              sx={{
                                height: 18,
                                fontFamily: FF_BODY,
                                fontWeight: 700,
                                fontSize: '0.62rem',
                                letterSpacing: '.04em',
                                textTransform: 'uppercase',
                                bgcolor: `${meta.tint}1a`,
                                color: meta.tint,
                                border: `1px solid ${meta.tint}55`,
                              }}
                            />
                            <Typography
                              sx={{
                                fontFamily: FF_BODY,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: subText,
                              }}
                            >
                              • {n.time}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontFamily: FF_BODY,
                              fontWeight: n.read ? 600 : 800,
                              fontSize: '0.95rem',
                              lineHeight: 1.3,
                              color: textPrimary,
                            }}
                          >
                            {n.title}
                          </Typography>
                          {n.body && (
                            <Typography
                              sx={{
                                fontFamily: FF_BODY,
                                fontSize: '0.84rem',
                                color: subText,
                                mt: 0.4,
                                lineHeight: 1.4,
                              }}
                            >
                              {n.body}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </motion.div>
                  );
                })}
              </Stack>
            </Box>
          );
        })}

      {!loading && !error && items.length > 0 && (
        <Divider sx={{ borderColor: borderFaint, opacity: 0.6 }}>
          <Typography
            sx={{
              fontFamily: FF_BODY,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: subText,
              px: 1,
            }}
          >
            {t('notifications.endOfList') || "You're all caught up"}
          </Typography>
        </Divider>
      )}
    </Stack>
  );
}
