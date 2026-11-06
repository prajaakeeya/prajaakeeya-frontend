import { useEffect, useState, useCallback } from 'react';
import { IconButton, Badge, SxProps, Theme } from '@mui/material';
import {
  NotificationsNone as BellIcon,
  NotificationsActive as BellActiveIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { getUnreadCount, NOTIFICATIONS_CHANGED_EVENT } from '../services/notificationService';

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
  const { isAuthenticated } = useAuthStore();

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
  const hasUnread = count > 0;

  return (
    <IconButton
      onClick={() => navigate(to)}
      aria-label={t('notifications.title') || 'Notifications'}
      sx={{ color: 'text.secondary', ...sx }}
    >
      <Badge
        badgeContent={count}
        max={9}
        color="primary"
        invisible={!hasUnread}
        sx={{
          '& .MuiBadge-badge': {
            fontWeight: 700, fontSize: '0.625rem', minWidth: 16, height: 16, px: 0.5,
            border: 2, borderColor: 'background.paper',
          },
        }}
      >
        {hasUnread ? <BellActiveIcon fontSize="small" /> : <BellIcon fontSize="small" />}
      </Badge>
    </IconButton>
  );
}
