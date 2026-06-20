import axios from 'axios';
import * as Sentry from '@sentry/react';
import useAuthStore from '../store/useAuthStore';

const apiHost = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;
const normalizedHost = apiHost ? String(apiHost).replace(/\/+$/g, '') : '';
const baseURL = normalizedHost ? `${normalizedHost}/api` : '/api';

const apiClient = axios.create({
  baseURL,
  timeout: 60000
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const GENERIC_ERROR_MESSAGE = 'Something went wrong, Please try after sometime';

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    const isNetworkOrTimeout =
      !error.response &&
      (error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        error.message === 'Network Error' ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes('timeout')));
    if (isNetworkOrTimeout) {
      error.message = GENERIC_ERROR_MESSAGE;
    }
    // Report API failures to Sentry for diagnostics. Skip 401 (expected auth
    // expiry → handled above) and other 4xx client errors (validation, not
    // found, etc.) to avoid noise; capture server errors (5xx) and network/
    // timeout failures. Status/method/path are attached as context; request and
    // response bodies are deliberately NOT sent to avoid leaking sensitive data.
    const status = error.response?.status;
    const shouldReport = isNetworkOrTimeout || (typeof status === 'number' && status >= 500);
    if (shouldReport && status !== 401) {
      Sentry.captureException(error, {
        tags: { kind: 'api', status: status ?? 'network' },
        extra: {
          method: error.config?.method,
          url: error.config?.url,
        },
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
