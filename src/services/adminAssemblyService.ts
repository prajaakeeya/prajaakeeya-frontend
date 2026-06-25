import { apiClient } from './apiClient';

export interface Assembly {
  id: number;
  name: string;
  state: string;
  parliamentary: string;
  createdAt: number;
  updatedAt: number;
}

const adminAssemblyService = {
  create: (data: { name: string; state: string; parliamentary: string }) =>
    apiClient.post<Assembly>('/admin/assembly', data),
  update: (id: number, data: Partial<{ name: string; state: string; parliamentary: string }>) =>
    apiClient.patch<Assembly>(`/admin/assembly/${id}`, data),
  delete: (id: number) => apiClient.delete<{ message: string }>(`/admin/assembly/${id}`),
};

export default adminAssemblyService;
