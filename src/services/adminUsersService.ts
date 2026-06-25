import { apiClient } from './apiClient';

export type UserStatus = 'active' | 'blocked' | 'pending';

export interface AdminUser {
  id: number;
  name: string;
  email?: string | null;
  role: string;
  epicId?: string | null;
  wardName?: string | null;
  wardNumber?: string | null;
  corporationName?: string | null;
  profilePicture?: string | null;
  isBlocked?: boolean;
}

export const adminUsersService = {
  getUsers: async (params?: { page?: number; pageSize?: number; search?: string; status?: string; wardNumber?: string }) => {
    const resp = await apiClient.get('/admin/users', { params });
    const payload = resp.data;

    // Normalize to consistent shape used by UI. Support two backend shapes:
    // 1) Array of users
    // 2) { data: [...], total: N }
    const normalize = (item: any): AdminUser => ({
      id: item.id,
      name: item.name ?? item.nameEn ?? item.nameKn ?? '',
      email: item.email ?? null,
      role: item.role,
      epicId: item.epicId ?? item.voterEpic ?? null,
      wardName: item.wardName ?? item.ward?.name ?? null,
      wardNumber: item.ward?.number ?? null,
      corporationName: item.corporationName ?? item.corporationNameL1 ?? null,
      isBlocked: Boolean(item.isBlocked)
    });

    if (Array.isArray(payload)) {
      return payload.map(normalize) as AdminUser[];
    }

    if (payload && Array.isArray(payload.data)) {
      return { data: payload.data.map(normalize), total: Number(payload.total ?? payload.count ?? payload.data.length) };
    }

    return [] as AdminUser[];
  },

  getVoters: async (params?: { page?: number; limit?: number; search?: string }) => {
    const resp = await apiClient.get<{ data: AdminUser[]; total: number; totalUsers: number; page: number; limit: number; totalPages: number }>(
      '/users/voters', { params }
    );
    return resp.data;
  },

  createUser: async (data: { epicNumber: string; phone: string; role: string }) => {
    const resp = await apiClient.post('/admin/users', data);
    return resp.data;
  },

  updateUser: async (id: number, data: Partial<{
    name: string;
    relativeName: string;
    epicId: string;
    gender: string;
    wardId?: number;
    role: string;
    isBlocked: boolean;
  }>) => {
    const resp = await apiClient.patch(`/admin/users/${id}`, data);
    return resp.data;
  },

  blockUser: async (id: number) => {
    const resp = await apiClient.patch(`/admin/users/${id}/block`);
    return resp.data;
  },

  unblockUser: async (id: number) => {
    const resp = await apiClient.patch(`/admin/users/${id}/unblock`);
    return resp.data;
  },

  deleteUser: async (id: number) => {
    const resp = await apiClient.delete(`/admin/users/${id}`);
    return resp.data;
  }
,

  getUser: async (id: number) => {
    const resp = await apiClient.get(`/admin/users/${id}`);
    const item = resp.data;
    if (!item) return null;
    return {
      id: item.id,
      name: item.name ?? item.nameEn ?? item.nameKn ?? '',
      role: item.role,
      epicId: item.epicId ?? item.voterEpic ?? null,
      wardName: item.wardName ?? item.ward?.name ?? null,
      wardNumber: item.ward?.number ?? null,
      corporationName: item.corporationName ?? item.corporationNameL1 ?? null,
      isBlocked: Boolean(item.isBlocked),
      raw: item
    } as any;
  }
};

export default adminUsersService;
