import { useEffect, useState, useCallback } from 'react';
import { IconButton, Badge, SxProps, Theme } from '@mui/material';
import {
  NotificationsNone as BellIcon,
  NotificationsActive as BellActiveIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import { BRAND } from '../theme';
import { getUnreadCount, NOTIFICATIONS_CHANGED_EVENT } from '../services/notificationService';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";

interface NotificationBellProps {
  /** When provided, overrides the live fetched unread count. */
  count?: number;
  /** Destination route. Defaults to `/user/notifications`. */
  to?: string;
  sx?: SxProps<Theme>;
}

export default function NotificationBell({
  count: countOverride,
  to = '/user/notifications',
  sx,
}: NotificationBellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const isDark = mode === 'dark';

  const [liveCount, setLiveCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await getUnreadCount();
      setLiveCount(typeof data?.unreadCount === 'number' ? data.unreadCount : 0);
    } catch {
      // Silent — keep last known count rather than flashing the badge to zero on a transient error
    }
  }, [isAuthenticated]);

  // Fetch on mount and every time the route changes (covers "user just left /notifications").
  useEffect(() => {
    fetchCount();
  }, [fetchCount, location.pathname]);

  // Refresh when the tab regains focus or when another component mutates notifications.
  useEffect(() => {
    const onFocus = () => fetchCount();
    const onChanged = () => fetchCount();
    window.addEventListener('focus', onFocus);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
    };
  }, [fetchCount]);

  const count = countOverride ?? liveCount;
  const accent = isDark ? BRAND.yellow : BRAND.saffron;
  const hasUnread = count > 0;

  return (
    <IconButton
      onClick={() => navigate(to)}
      size="small"
      aria-label={t('notifications.title') || 'Notifications'}
      sx={{
        width: 36,
        height: 36,
        color: accent,
        '&:hover': {
          bgcolor: isDark ? 'rgba(245,168,0,0.10)' : 'rgba(245,168,0,0.12)',
        },
        ...sx,
      }}
    >
      <Badge
        badgeContent={count}
        max={9}
        overlap="circular"
        invisible={!hasUnread}
        sx={{
          '& .MuiBadge-badge': {
            fontFamily: FF_HEADING,
            fontWeight: 800,
            fontSize: '0.62rem',
            minWidth: 16,
            height: 16,
            padding: '0 4px',
            bgcolor: BRAND.red,
            color: '#fff',
            border: `2px solid ${isDark ? '#0e0c0c' : '#fff'}`,
            boxShadow: hasUnread ? '0 0 0 2px rgba(200,24,10,0.25)' : 'none',
          },
        }}
      >
        {hasUnread ? <BellActiveIcon /> : <BellIcon />}
      </Badge>
    </IconButton>
  );
}
