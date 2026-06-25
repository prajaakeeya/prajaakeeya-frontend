import { apiClient } from './apiClient';

export interface UnreadCountResponse {
  unreadCount: number;
}

export type NotificationType =
  | 'chat_message'
  | 'voting_window'
  | 'civic_issue'
  | 'new_aspirant'
  | 'meeting'
  | 'visit'
  | 'announcement'
  | (string & NonNullable<unknown>); // allow future server-side types without breaking the build

export interface ApiNotification {
  id: number;
  createdAt: number;
  updatedAt: number;
  userId: number;
  type: NotificationType;
  title: string;
  body: string | null;
  aspirantId: number | null;
  aspirantName: string | null;
  electionId: number | null;
  constituencyId: number | null;
  constituencyName: string | null;
  meetingId: number | null;
  visitId: number | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: number | null;
}

export interface NotificationsListResponse {
  data: ApiNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface MarkAllReadResponse {
  updated: number;
}

export interface DeleteNotificationResponse {
  deleted: number;
}

/** Broadcast event name fired after any notification mutation so listeners (e.g. the header bell) can refresh. */
export const NOTIFICATIONS_CHANGED_EVENT = 'prajakeeya:notifications-changed';

/** Dispatch the cross-component refresh signal. */
export const emitNotificationsChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
  }
};

export const getUnreadCount = () =>
  apiClient.get<UnreadCountResponse>('/notifications/unread-count');

export const listNotifications = (params: ListNotificationsParams = {}) =>
  apiClient.get<NotificationsListResponse>('/notifications', { params });

export const markNotificationRead = (id: number) =>
  apiClient.post<ApiNotification>(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  apiClient.post<MarkAllReadResponse>('/notifications/read-all');

export const deleteNotification = (id: number) =>
  apiClient.delete<DeleteNotificationResponse>(`/notifications/${id}`);

export const clearAllNotifications = () =>
  apiClient.delete<DeleteNotificationResponse>('/notifications');

// ── Web push (FCM) device tokens ──────────────────────────────────────────
export const registerDeviceToken = (token: string, platform?: string) =>
  apiClient.post('/notifications/device-token', { token, platform });

export const unregisterDeviceToken = (token: string) =>
  apiClient.delete('/notifications/device-token', { data: { token } });
