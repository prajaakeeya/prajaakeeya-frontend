import { apiClient } from './apiClient';

export interface Parliamentary {
  id: number;
  name: string;
  state: string;
  createdAt: number;
  updatedAt: number;
}

const adminParliamentaryService = {
  // Only provide create/update/delete on admin endpoint; listing is not available/needed
  create: (data: { name: string; state: string }) => apiClient.post<Parliamentary>('/admin/parliamentary', data),
  update: (id: number, data: Partial<{ name: string; state: string }>) =>
    apiClient.patch<Parliamentary>(`/admin/parliamentary/${id}`, data),
  delete: (id: number) => apiClient.delete<{ message: string }>(`/admin/parliamentary/${id}`),
};

export default adminParliamentaryService;
