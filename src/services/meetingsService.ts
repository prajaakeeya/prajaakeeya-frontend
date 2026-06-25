import { apiClient } from './apiClient';

export interface Meeting {
  id: number;
  createdAt: string;
  updatedAt: string;
  wardId: number;
  title: string;
  description: string;
  meetingLink: string;
  scheduledAt: string;
  createdById: number;
  isActive: boolean;
  ward: {
    id: number;
    number: string;
    name: string;
    state: string;
    parliamentary: string;
    assembly: string;
    zone: string;
  };
  createdBy: {
    id: number;
    name: string;
    role: string;
  };
}

export const meetingsService = {
  getMeetings: async (params?: { wardNumber?: string; isActive?: boolean }) => {
    const resp = await apiClient.get('/admin/meetings', { params });
    return resp.data as Meeting[];
  },

  createMeeting: async (data: {
    wardId: number;
    title: string;
    description: string;
    meetingLink: string;
    scheduledAt: number;
  }) => {
    const resp = await apiClient.post('/admin/meetings', data);
    return resp.data;
  },

  updateMeeting: async (id: number, data: Partial<{
    title: string;
    description: string;
    meetingLink: string;
    scheduledAt: number;
    isActive: boolean;
  }>) => {
    const resp = await apiClient.patch(`/admin/meetings/${id}`, data);
    return resp.data;
  },

  deleteMeeting: async (id: number) => {
    const resp = await apiClient.delete(`/admin/meetings/${id}`);
    return resp.data;
  }
};

export default meetingsService;