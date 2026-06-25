import { apiClient } from './apiClient';

export const getStates = () => apiClient.get<string[]>('/geography/states');

export const getParliamentary = (state?: string) =>
  apiClient.get<string[]>('/geography/parliamentary', {
    params: state ? { state } : {}
  });

export const getAssembly = (state?: string, parliamentary?: string) =>
  apiClient.get<string[]>('/geography/assembly', {
    params: { ...(state && { state }), ...(parliamentary && { parliamentary }) }
  });

export const getDistricts = (state: string) =>
  apiClient.get<string[]>('/grama-panchayat/districts', { params: { state } });

export const getTaluks = (state: string, district: string) =>
  apiClient.get<string[]>('/grama-panchayat/taluks', { params: { state, district } });

export const getGPs = (state: string, district: string, taluk: string) =>
  apiClient.get<string[]>('/grama-panchayat/gps', { params: { state, district, taluk } });

export default { getStates, getParliamentary, getAssembly, getDistricts, getTaluks, getGPs };
