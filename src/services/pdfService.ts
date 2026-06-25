import { apiClient } from './apiClient';

export const getExtractionStatus = () => apiClient.get('/admin/dashboard');
