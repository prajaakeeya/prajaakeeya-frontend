import { apiClient } from './apiClient';

export interface WardInput {
  number: string;
  name: string;
  state: string;
  category: string;
  municipality: string;
  parliamentary?: string;
  assembly?: string;
}

export const createWard = (payload: WardInput) => apiClient.post('/admin/wards', payload);
export const getWards = (state?: string, parliamentary?: string, assembly?: string) =>
  apiClient.get('/wards/list', { params: { ...(state && { state }), ...(parliamentary && { parliamentary }), ...(assembly && { assembly }) } });
export const getWardById = (wardId: number) => apiClient.get(`/wards/${wardId}`);
export const fetchAllWards = () => apiClient.get<Ward[]>('/wards');
export const updateWardTelegramLink = (wardId: number, telegramGroupLink: string) =>
  apiClient.put(`/wards/${wardId}/telegram-link`, { telegramGroupLink });
export const deleteWardTelegramLink = (wardId: number) =>
  apiClient.delete(`/wards/${wardId}/telegram-link`);

export interface Ward {
  id: number;
  number: string;
  name: string;
  state: string;
  zone: string;
  parliamentary: string;
  assembly: string;
  category?: string | null;
  telegramGroupLink: string | null;
}
