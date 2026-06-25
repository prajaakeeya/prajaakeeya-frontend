import { apiClient } from './apiClient';

export const getVotersByWard = (wardNumber: string) =>
  apiClient.get(`/users/ward/${encodeURIComponent(wardNumber)}`);

export const getVoters = (page = 1, limit = 20) =>
  apiClient.get(`/users/voters`, { params: { page, limit } });

export const reportUser = (payload: any) => apiClient.post('/users/report', payload);

// Helper for client-side searching/filtering when backend doesn't provide a search endpoint
export const filterVoters = (voters: any[], q: string) => {
  const query = (q || '').trim();
  if (!query) return voters;
  const lower = query.toLowerCase();
  return voters.filter((v) => {
    const nameEn = (v.nameEn || '').toString().toLowerCase();
    const nameKn = (v.nameKn || '').toString().toLowerCase();
    const name = (v.name || '').toString().toLowerCase();
    const boothEn = (v.psName || '').toString().toLowerCase();
    const boothKn = (v.psNameL1 || '').toString().toLowerCase();
    const epic = (v.epicId || v.voterEpic || v.voter_id || '').toString().toLowerCase();
    const phone = (v.phone || '').toString();

    return (
      nameEn.includes(lower) ||
      nameKn.includes(lower) ||
      name.includes(lower) ||
      boothEn.includes(lower) ||
      boothKn.includes(lower) ||
      epic.includes(lower) ||
      phone.includes(query)
    );
  });
};
