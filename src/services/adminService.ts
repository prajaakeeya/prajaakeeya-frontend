import { apiClient } from './apiClient';

export interface VotingWindowPayload {
  startTime: number;
  endTime: number;
  description?: string;
}

const createVotingWindow = async (payload: VotingWindowPayload) => {
  const resp = await apiClient.post('/admin/voting-window', payload);
  return resp.data;
};

const getVotingWindows = async () => {
  const resp = await apiClient.get('/admin/voting-windows');
  return resp.data;
};

export default {
  createVotingWindow
  , getVotingWindows
};
