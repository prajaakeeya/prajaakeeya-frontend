import { apiClient } from './apiClient';

export interface AdminElection {
  id: number;
  type: string;
  name: string;
  scope: string | null;
  createdAt: number;
  updatedAt: number;
}

const adminElectionsService = {
  getAll: () => apiClient.get<AdminElection[]>('/elections'),

  create: (data: { type: string; name: string }) =>
    apiClient.post<AdminElection>('/admin/elections', data),

  update: (id: number, data: Partial<{ type: string; name: string }>) =>
    apiClient.patch<AdminElection>(`/admin/elections/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/admin/elections/${id}`),
};

export default adminElectionsService;
