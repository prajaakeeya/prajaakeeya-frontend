import apiClient from './apiClient';
import { AuthUser } from '../types/auth';

export interface AdminLoginPayload {
  phone: string;
}

export interface AdminVerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface RegisterVoterPayload {
  name: string;
  idToken: string;
  phone?: string;
  relativeName?: string;
  epicId?: string;
  gender?: string;
}

export interface RegisterVoterResponse {
  token?: string;
  user: AuthUser;
  ward?: { id: number; name: string };
}

export const GOOGLE_OAUTH_STATE_KEY = 'google_oauth_state';

/**
 * Generates a cryptographically random CSRF token, persists it to
 * sessionStorage so the /auth/callback handler can verify it, and returns it.
 */
const createGoogleOAuthState = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, token);
  return token;
};

/**
 * Returns the backend Google OAuth entry point. The browser should be
 * redirected here; the backend takes care of the full Authorization Code
 * flow and redirects back to the frontend at /auth/callback?token=...&user=...
 *
 * A CSRF `state` token is generated and appended as a query param; the same
 * token is stored in sessionStorage and must be compared against the `state`
 * returned on the callback to mitigate CSRF attacks.
 */
export const getGoogleOAuthUrl = (): string => {
  const raw = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '';
  const host = String(raw).replace(/\/+$/g, '');
  const state = createGoogleOAuthState();
  return `${host}/api/auth/google?state=${encodeURIComponent(state)}`;
};

export const requestAdminOtp = (payload: AdminLoginPayload) => apiClient.post('/auth/admin/login', payload);

export const verifyAdminOtp = async (payload: AdminVerifyOtpPayload) => {
  const { data } = await apiClient.post<{ token: string; user: AuthUser }>('/auth/admin/verify-otp', payload);
  return data;
};

export const adminLoginWithPassword = async (payload: { email: string; password: string }) => {
  const { data } = await apiClient.post<{ token: string; user: AuthUser }>('/auth/admin/login', payload);
  return data;
};

export const fetchProfile = () => apiClient.get<AuthUser>('/auth/me');

// --- Cookie-based auth (COOKIE_AUTH) ---------------------------------------
// These back the httpOnly-cookie flow. They are safe to call regardless of the
// flag, but are only wired into the UI when VITE_COOKIE_AUTH=true.

export interface GoogleExchangeResponse {
  // Present for native/mobile clients that can't use cookies; ignored on web,
  // where the httpOnly `session` cookie set by this call is what authenticates.
  token?: string;
  user: AuthUser;
}

/**
 * Exchanges the single-use, 60-second OAuth `code` (returned on the callback)
 * for a session. On success the backend sets the httpOnly `session` cookie via
 * Set-Cookie; the response body carries the authenticated `user`. The `code` is
 * single-use and short-lived — call this immediately on the callback page and
 * never retry the same code.
 */
export const exchangeGoogleCode = async (code: string, state: string) => {
  const { data } = await apiClient.post<GoogleExchangeResponse>(
    '/auth/google/exchange',
    { code, state }
  );
  return data;
};

/**
 * Asks the backend to rotate the session cookie using the refresh cookie.
 * Used by the apiClient 401 interceptor; rarely called directly.
 */
export const refreshSession = () => apiClient.post('/auth/refresh');

/**
 * Clears the httpOnly session cookie server-side. JavaScript cannot delete an
 * httpOnly cookie, so logout MUST hit this endpoint. Succeeds (200) even when
 * there is no active session.
 */
export const logoutSession = () => apiClient.post('/auth/logout');

export interface UpdateUserConstituenciesPayload {
  lokSabhaConstituencyId?: number | null;
  stateAssemblyConstituencyId?: number | null;
  municipalCorporationConstituencyId?: number | null;
  gramPanchayatConstituencyId?: number | null;
}

export const updateUserConstituencies = (
  payload: UpdateUserConstituenciesPayload
) => apiClient.post<AuthUser>('/users/me/constituencies', payload);

export const registerVoter = async (payload: RegisterVoterPayload) => {
  const { data } = await apiClient.post<RegisterVoterResponse>('/auth/register-voter', payload);
  return data;
};

export interface RegisterVoterByEpicPayload {
  epicNumber: string;
  confirm?: boolean;
  email?: string;
}

// Flexible helper for the two-step EPIC flow used by the UI.
export const registerVoterByEpic = async (payload: RegisterVoterByEpicPayload) => {
  const { data } = await apiClient.post<any>('/auth/register-voter', payload);
  return data;
};

export interface UpdateProfilePayload {
  name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  epicId?: string;
  address?: string;
  wardNumber?: string;
}

export const updateProfile = async (payload: UpdateProfilePayload) => {
  const { data } = await apiClient.put<AuthUser>('/auth/profile', payload);
  return data;
};
