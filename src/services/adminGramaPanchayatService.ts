import { apiClient } from './apiClient';

export interface GramaPanchayat {
  srNo: number | string;
  state: string;
  district: string;
  taluk: string;
  gpName: string;
  villageName: string;
  villageCode: string;
  population: string;
}

export interface GramaPanchayatFilters {
  state?: string;
  district?: string;
  taluk?: string;
  gpName?: string;
}

export interface VillageResult {
  id: string;
  villageName: string;
  villageCode: string;
  population: string;
}

const adminGramaPanchayatService = {
  getVillages: (params: Required<Pick<GramaPanchayatFilters, 'state' | 'district' | 'taluk' | 'gpName'>>) =>
    apiClient.get<VillageResult[]>('/grama-panchayat/villages', { params }),
  create: (data: Omit<GramaPanchayat, 'srNo'>) =>
    apiClient.post<GramaPanchayat>('/admin/grama-panchayat', data),
  update: (id: number | string, data: Partial<Omit<GramaPanchayat, 'srNo'>>) =>
    apiClient.patch<GramaPanchayat>(`/admin/grama-panchayat/${id}`, data),
  delete: (id: number | string) =>
    apiClient.delete<{ message: string }>(`/admin/grama-panchayat/${id}`),
};

export default adminGramaPanchayatService;
