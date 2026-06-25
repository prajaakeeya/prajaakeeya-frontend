import apiClient from './apiClient';
import { AuthUser } from '../types/auth';
import { COOKIE_AUTH } from '../config/authMode';

export interface AspirantChatMessageDto {
  id: number;
  content: string;
  userId: number;
  aspirantId: number;
  createdAt: string;
  updatedAt: string;
  user?: AuthUser | { id: number; name?: string; role?: 'admin' | 'voter' | 'aspirant' };
  aspirant?: { id: number; name?: string; party?: string };
  ward?: { id: number; number?: string; name?: string };
}

export const getAspirantMessages = (aspirantId: number, page = 1, limit = 50) =>
  apiClient.get<{ data: AspirantChatMessageDto[]; meta: any }>(`/aspirants/${aspirantId}/chat/messages`, {
    params: { page, limit }
  });

// ── Live SSE stream for an aspirant chat room ─────────────────────────────
const API_HOST = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${API_HOST ? String(API_HOST).replace(/\/+$/g, '') : ''}/api`;

export interface ChatStreamHandlers {
  onCreated?: (msg: AspirantChatMessageDto) => void;
  onDeleted?: (id: number) => void;
}

/**
 * Subscribe to the live Server-Sent Events stream for an aspirant chat room.
 * EventSource can't send headers, so the JWT goes in the query string (the
 * backend's SSE guard reads it there). Returns the EventSource — call `.close()`
 * to unsubscribe — or `null` when SSE isn't available.
 */
export function subscribeToAspirantChat(
  aspirantId: number,
  token: string,
  handlers: ChatStreamHandlers,
): EventSource | null {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return null;
  // Cookie mode: EventSource can't set headers, but it DOES send cookies when
  // withCredentials is true — so authenticate via the httpOnly session cookie
  // and drop the ?token= query param (which also avoids the URL-leak issue,
  // audit H-SEC-1). Legacy mode still needs a token in the query string.
  if (!COOKIE_AUTH && !token) return null;
  const url = COOKIE_AUTH
    ? `${API_BASE}/aspirants/${aspirantId}/chat/stream`
    : `${API_BASE}/aspirants/${aspirantId}/chat/stream?token=${encodeURIComponent(token)}`;
  const es = new EventSource(url, COOKIE_AUTH ? { withCredentials: true } : undefined);
  es.onerror = (e) => console.warn('[chat-sse] connection error / closed (auto-retry)', e);
  es.addEventListener('message.created', (e) => {
    try { handlers.onCreated?.(JSON.parse((e as MessageEvent).data)); } catch { /* ignore */ }
  });
  es.addEventListener('message.deleted', (e) => {
    try {
      const d = JSON.parse((e as MessageEvent).data);
      if (d && d.id != null) handlers.onDeleted?.(Number(d.id));
    } catch { /* ignore */ }
  });
  // 'ping' heartbeats are ignored.
  return es;
}

export const getWardMessages = (wardNumber: string | number, page = 1, limit = 50) =>
  apiClient.get<{ data: AspirantChatMessageDto[]; meta: any }>(`/aspirant-discussion/ward/${wardNumber}/messages`, {
    params: { page, limit }
  });

export const deleteAspirantMessage = (messageId: number) =>
  apiClient.delete<{ message: string }>(`/aspirant-discussion/messages/${messageId}`);

export const postAspirantMessage = (aspirantId: number, payload: { content: string }) =>
  // Use aspirant-discussion endpoint for aspirant-originated messages
  apiClient.post<AspirantChatMessageDto>(`/aspirant-discussion/aspirant/${aspirantId}/messages`, payload);

// For regular users posting to an aspirant's public chat room use the aspirant chat endpoint
export const postUserChatMessage = (aspirantId: number, payload: { content: string }) =>
  apiClient.post<AspirantChatMessageDto>(`/aspirants/${aspirantId}/chat/messages`, payload);

export default { getAspirantMessages, getWardMessages, postAspirantMessage, deleteAspirantMessage };
