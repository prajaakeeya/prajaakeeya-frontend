// Tests the response interceptor's 401 handling in apiClient.
//
// Regression guard for #47 ("Continue as guest" bounced to home): a 401 must
// only force a logout when a session token actually exists. A guest (no token)
// hitting an auth-protected endpoint also gets a 401, and logout() hard-reloads
// to "/", which is what produced the bounce.
//
// We mock the auth store so we can flip `token` and spy on logout(), then call
// the interceptor's rejection handler directly — no network, no jsdom reload.

import { describe, it, expect, vi, beforeEach } from 'vitest';

const logout = vi.fn();
let token: string | null = null;

vi.mock('../store/useAuthStore', () => ({
  default: { getState: () => ({ token, logout }) },
}));

import apiClient from '../services/apiClient';

// The response interceptor's (fulfilled, rejected) pair — rejected is our logic.
const { rejected } = (apiClient.interceptors.response as unknown as {
  handlers: { rejected: (e: unknown) => Promise<never> }[];
}).handlers[0];

describe('apiClient 401 handling', () => {
  beforeEach(() => logout.mockClear());

  it('logs out on 401 when a session token exists (expired/revoked session)', async () => {
    token = 'a-token';
    await expect(rejected({ response: { status: 401 } })).rejects.toBeDefined();
    expect(logout).toHaveBeenCalledOnce();
  });

  it('does NOT log out on 401 for a guest with no token (#47)', async () => {
    token = null;
    await expect(rejected({ response: { status: 401 } })).rejects.toBeDefined();
    expect(logout).not.toHaveBeenCalled();
  });
});
