import { apiClient } from './apiClient';

export interface Municipality {
  id: number;
  name: string;
  state: string;
  createdAt: number;
  updatedAt: number;
}

const adminMunicipalityService = {
  getAll: (state?: string) =>
    apiClient.get<Municipality[]>('/admin/municipalities', { params: state ? { state } : undefined }),
  create: (data: { name: string; state: string }) =>
    apiClient.post<Municipality>('/admin/municipalities', data),
  update: (id: number, data: Partial<{ name: string; state: string }>) =>
    apiClient.patch<Municipality>(`/admin/municipalities/${id}`, data),
  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/admin/municipalities/${id}`),
};

export default adminMunicipalityService;
