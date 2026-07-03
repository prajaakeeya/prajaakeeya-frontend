import type { AxiosAdapter, AxiosResponse } from 'axios';
import apiClient from '../services/apiClient';
import useAuthStore from '../store/useAuthStore';
import type { AuthUser } from '../types/auth';

const unauthorizedAdapter: AxiosAdapter = async (config) => {
  const response: AxiosResponse = {
    data: { message: 'Unauthorized' },
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  };

  return Promise.reject({
    isAxiosError: true,
    config,
    response,
    toJSON: () => ({}),
  });
};

describe('apiClient legacy 401 handling', () => {
  const originalAdapter = apiClient.defaults.adapter;
  const originalLogout = useAuthStore.getState().logout;

  beforeEach(() => {
    apiClient.defaults.adapter = unauthorizedAdapter;
    delete apiClient.defaults.headers.common.Authorization;
    useAuthStore.setState({
      token: null,
      user: null,
      isAdmin: false,
      isAuthenticated: false,
      logout: vi.fn(() => Promise.resolve()),
    });
  });

  afterAll(() => {
    apiClient.defaults.adapter = originalAdapter;
    delete apiClient.defaults.headers.common.Authorization;
    useAuthStore.setState({
      token: null,
      user: null,
      isAdmin: false,
      isAuthenticated: false,
      logout: originalLogout,
    });
  });

  it('does not hard-logout anonymous guest requests that receive 401', async () => {
    await expect(apiClient.get('/users/voters')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(useAuthStore.getState().logout).not.toHaveBeenCalled();
  });

  it('still logs out authenticated legacy sessions that receive 401', async () => {
    const logout = vi.fn(() => Promise.resolve());
    useAuthStore.setState({
      token: 'jwt-token',
      user: { id: 1, name: 'Asha', role: 'voter' } satisfies AuthUser,
      isAuthenticated: true,
      logout,
    });

    await expect(apiClient.get('/user/dashboard')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
