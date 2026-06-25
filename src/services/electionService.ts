import { apiClient } from './apiClient';

export interface Election {
  id: number;
  type: string;
  name: string;
  scope: string | null;
}

export interface Constituency {
  id: number;
  name: string;
  number?: string;
  state: string;
  category?: string;
}

export const fetchElections = () =>
  apiClient.get<Election[]>('/elections');

export const fetchConstituencies = (electionType: string) =>
  apiClient.get<{ election: Election; constituencies: Constituency[] }>(
    `/elections/${encodeURIComponent(electionType)}/constituencies`
  );

export const fetchMunicipalities = (state = 'Karnataka') =>
  apiClient.get<{ id: number; name: string; state: string }[]>(
    `/elections/municipalities?state=${encodeURIComponent(state)}`
  );

export const fetchConstituenciesByScope = (scope: string) =>
  apiClient.get<Constituency[]>(
    `/elections/constituencies/by-scope?scope=${encodeURIComponent(scope)}`
  );

export interface ConstituencyStats {
  electionId: number;
  constituencyId: number;
  electionType: string;
  electionName: string;
  constituencyName: string;
  totalVoters: number;
  totalAspirants: number;
}

export const fetchConstituencyStats = (electionId: number, constituencyId: number) =>
  apiClient.get<ConstituencyStats>('/stats/constituency', {
    params: { electionId, constituencyId },
  });

// ── Grama Panchayat APIs ──────────────────────────────────────────────
export const fetchGPStates = () =>
  apiClient.get<string[]>('/grama-panchayat/states');

export const fetchGPDistricts = (state: string) =>
  apiClient.get<string[]>(`/grama-panchayat/districts?state=${encodeURIComponent(state)}`);

export const fetchGPTaluks = (state: string, district: string) =>
  apiClient.get<string[]>(
    `/grama-panchayat/taluks?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
  );

export const fetchGPGrams = (state: string, district: string, taluk: string) =>
  apiClient.get<string[]>(
    `/grama-panchayat/gps?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&taluk=${encodeURIComponent(taluk)}`
  );

export interface GPVillage {
  id: string;
  villageName: string;
  villageCode: string;
  population: string;
}

export const fetchGPVillages = (state: string, district: string, taluk: string, gpName: string) =>
  apiClient.get<GPVillage[]>(
    `/grama-panchayat/villages?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&taluk=${encodeURIComponent(taluk)}&gpName=${encodeURIComponent(gpName)}`
  );
