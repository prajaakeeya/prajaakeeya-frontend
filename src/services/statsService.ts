import { apiClient } from './apiClient';

export interface CitizensCount {
  citizens: number;
}

// Public endpoint — total number of registered citizens (voters + aspirants).
// No auth required; safe to call from guest pages.
export const getCitizensCount = () =>
  apiClient.get<CitizensCount>('/stats/citizens');
