import { apiClient } from './apiClient';

export interface VotePayload {
  wardId: number;
  aspirantId: number;
}

export interface VotingWindow {
  id: number;
  createdAt: number;
  updatedAt: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  description: string;
  electionId?: number;
  election?: {
    id: number;
    type: string;
    name: string;
    scope?: string | null;
  };
}

export interface VotingWindowResponse {
  window: VotingWindow;
  isVotingAllowed: boolean;
  currentTime: number;
}

const submitVote = (payload: VotePayload) => apiClient.post<{ message?: string; verificationId?: string }>('/vote', payload);
const verifyVote = (payload: VotePayload & { otp: string; verificationId?: string }) => apiClient.post('/vote/verify', payload);
const fetchWardResults = (wardId: number) => apiClient.get(`/vote/ward/${wardId}`);
const fetchMyVote = (wardId: number) => apiClient.get(`/vote/me/${wardId}`);
const fetchVotingWindow = () => apiClient.get<VotingWindowResponse>('/vote/voting-window');

export { submitVote, verifyVote, fetchWardResults, fetchMyVote, fetchVotingWindow };
