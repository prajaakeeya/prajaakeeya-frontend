import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const apiHost = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;
const normalizedHost = apiHost ? String(apiHost).replace(/\/+$/g, '') : '';
const baseURL = normalizedHost ? `${normalizedHost}/api` : '/api';

const apiClient = axios.create({
  baseURL,
  timeout: 60000,
  withCredentials: true
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
    return Promise.reject(error);
  }
);

export default apiClient;
