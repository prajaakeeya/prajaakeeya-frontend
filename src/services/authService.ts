import apiClient from './apiClient';
import { AuthUser } from '../types/auth';

export interface EpicLoginPayload {
  epicId: string;
}

export interface RegisterOtpPayload {
  email: string;
}

export interface VerifyRegisterOtpPayload {
  email: string;
  otp: string;
  verificationId?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  verificationId?: string;
}

export interface AdminLoginPayload {
  phone: string;
}

export interface AspirantSendOtpPayload {
  mobileNumber: string;
}

export interface AspirantVerifyOtpPayload {
  mobileNumber: string;
  verificationId: string;
  code: string;
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

export const loginWithEpic = async (payload: EpicLoginPayload) => {
  const { data } = await apiClient.post<{ token?: string; user: AuthUser }>('/auth/login', payload);
  return data;
};

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

export const consumeGoogleOAuthState = (returnedState: string | null): boolean => {
  const expectedState = sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
  sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
  return Boolean(expectedState && returnedState && expectedState === returnedState);
};

export const exchangeGoogleOAuthCode = async (payload: { code: string; state: string }) => {
  const { data } = await apiClient.post<{ token?: string; user: AuthUser }>('/auth/google/exchange', payload);
  return data;
};

export const requestAdminOtp = (payload: AdminLoginPayload) => apiClient.post('/auth/admin/login', payload);

export const requestRegisterOtp = (payload: RegisterOtpPayload) =>
  apiClient.post<{ message: string; verificationId?: string }>('/auth/register/request-otp', payload);

export const verifyRegisterOtp = (payload: VerifyRegisterOtpPayload) =>
  apiClient.post('/auth/register/verify-otp', payload);

export interface SendOtpPayloadUnified {
  email?: string;
  phone?: string;
  purpose?: 'login' | 'register';
}

export interface VerifyOtpPayloadUnified {
  email?: string;
  phone?: string;
  otp: string;
  verificationId?: string;
  purpose?: 'login' | 'register';
}

export const sendOtpUnified = async (payload: SendOtpPayloadUnified) => {
  const { data } = await apiClient.post<{ message: string; verificationId?: string }>('/auth/send-otp', payload);
  return data;
};

export const verifyOtpUnified = async (payload: VerifyOtpPayloadUnified) => {
  const { data } = await apiClient.post<{ token?: string; user: AuthUser }>('/auth/verify-otp', payload);
  return data;
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  const { data } = await apiClient.post<{ token?: string; user: AuthUser }>('/auth/verify-otp', payload);
  return data;
};

export const sendAspirantOtp = async (payload: AspirantSendOtpPayload) => {
  const { data } = await apiClient.post<{ message: string; verificationId: string }>('/auth/aspirant/send-otp', payload);
  return data;
};

export const verifyAspirantLoginOtp = async (payload: AspirantVerifyOtpPayload) => {
  const { data } = await apiClient.post<{ token?: string; user: AuthUser }>('/auth/aspirant/verify-otp', payload);
  return data;
};

export const resendAspirantOtp = async (payload: AspirantSendOtpPayload) => {
  const { data } = await apiClient.post<{ message: string; verificationId: string }>('/auth/aspirant/resend-otp', payload);
  return data;
};

export const verifyAdminOtp = async (payload: AdminVerifyOtpPayload) => {
  const { data } = await apiClient.post<{ token?: string; user: AuthUser }>('/auth/admin/verify-otp', payload);
  return data;
};

export const adminLoginWithPassword = async (payload: { email: string; password: string }) => {
  const { data } = await apiClient.post<{ token?: string; user: AuthUser }>('/auth/admin/login', payload);
  return data;
};

export const fetchProfile = () => apiClient.get<AuthUser>('/auth/me');

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
