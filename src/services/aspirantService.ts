import apiClient from './apiClient';

export interface AspirantPayload {
  name: string;
  party?: string;
  manifesto?: string;
  wardNumber?: string;
  electionId?: number;
  constituencyId?: number;
  age?: number;
  education?: string;
  occupation?: string;
  address?: string;
  gender?: string;
  phone?: string;
  meetingLink?: string | null;
  instagramLink?: string | null;
  facebookLink?: string | null;
  linkedinLink?: string | null;
  twitterLink?: string | null;
  whatsappNumber?: string | null;
  sopAgreed?: boolean;
}

export const registerAspirant = (payload: AspirantPayload) => apiClient.post('/aspirants', payload);
export const declareCandidacy = (aspirantId: number, electionId: number, constituencyId: number) =>
  apiClient.patch(`/aspirants/${aspirantId}/candidacy`, { electionId, constituencyId });

export interface AspirantCandidacy {
  id: number;
  aspirantId: number;
  electionId: number;
  constituencyId: number;
  wardId: number | null;
  electionName: string | null;
  electionType: string | null;
  constituencyName: string | null;
}

export const listCandidacies = (aspirantId: number) =>
  apiClient.get<AspirantCandidacy[]>(`/aspirants/${aspirantId}/candidacies`);
export const removeCandidacy = (candidacyId: number) =>
  apiClient.delete(`/aspirants/candidacies/${candidacyId}`);

export interface AspirantProposal {
  id: number;
  aspirantId: number;
  title: string;
  details: string;
  createdAt: number;
  updatedAt: number;
  supportCount: number;
  isSupportedByMe: boolean;
}

export const listProposals = (aspirantId: number) =>
  apiClient.get<AspirantProposal[]>(`/aspirants/${aspirantId}/proposals`);
export const createProposal = (aspirantId: number, title: string, details: string) =>
  apiClient.post(`/aspirants/${aspirantId}/proposals`, { title, details });
export const supportProposal = (proposalId: number) =>
  apiClient.post(`/aspirants/proposals/${proposalId}/support`);
export const unsupportProposal = (proposalId: number) =>
  apiClient.delete(`/aspirants/proposals/${proposalId}/support`);
export const getAllAspirants = (page = 1, limit = 20, search?: string) =>
  apiClient.get<{ data: AdminAspirant[]; total: number; page: number; limit: number; totalPages: number }>(
    '/aspirants/all', { params: { page, limit, ...(search ? { search } : {}) } }
  );

export interface AdminAspirant {
  id: number;
  userId: number;
  name: string;
  party: string;
  selfieUrl: string | null;
  electionId: number;
  electionName: string;
  constituencyId: number;
  constituencyName: string;
  isBlocked?: boolean;
}
export const verifyAspirantRegistration = (verificationId: string, code: string) => 
  apiClient.post('/aspirants/verify-registration', { verificationId, code });
export const resendAspirantRegistrationOtp = () => 
  apiClient.post<{ verificationId: string; message: string }>('/aspirants/resend-otp', {});
export const fetchWardAspirantsByNumber = (wardNumber: string) => apiClient.get(`/aspirants/ward/${wardNumber}`);
export const fetchAspirantsByConstituency = (electionId: number, constituencyId: number, userId?: number) =>
  apiClient.get('/aspirants/by-constituency', { params: { electionId, constituencyId, ...(userId ? { userId } : {}) } });
export const fetchWardAspirants = (wardId: number) => apiClient.get(`/aspirants/ward/${wardId}`);
export const fetchAspirant = (id: number) => apiClient.get(`/aspirants/${id}`);
export const approveAspirant = (id: number) => apiClient.patch(`/aspirants/${id}/approve`, {});
export const getAspirantById = (id: number) => apiClient.get(`/aspirants/${id}`);
export const withdrawAspirant = (id: number) => apiClient.delete(`/aspirants/${id}`);
// Withdraw the currently authenticated aspirant (uses the /aspirants/me endpoint)
export const withdrawMe = () => apiClient.delete('/aspirants/me');
export const verifyAspirantDocument = (
  aspirantId: number,
  documentType: string,
  payload?: { status?: string; rejectionReason?: string }
) =>
  apiClient.patch(
    `/media/aspirant/${aspirantId}/document/${documentType}/verify`,
    payload ?? { status: 'verified' }
  );


// Create a ward-level meeting so it appears across aspirants in the ward
export const postWardMeeting = (payload: { title: string; description?: string | null; meetingLink?: string | null; scheduledAt?: number | null }) =>
  apiClient.post('/aspirant-ward-meetings', payload);

// Get ward-level meetings visible to the current authenticated user
export const getMyWardMeetings = () => apiClient.get('/aspirant-ward-meetings/my');

// Aspirant-level meeting management (use aspirant-specific endpoints instead of ward-level)
export const postAspirantMeeting = (aspirantId: number, payload: { meetingLink?: string | null; scheduledAt?: number; title?: string | null; description?: string | null; location?: string | null }) =>
  apiClient.post(`/aspirants/${aspirantId}/meeting`, payload);

export const deleteAspirantMeeting = (aspirantId: number, meetingId: number) =>
  apiClient.delete(`/aspirants/${aspirantId}/meetings/${meetingId}`);

// Complete an aspirant meeting by adding notes and marking it completed.
// Backend uses the singular 'meeting' path: POST /aspirants/{id}/meeting/{meetingId}/complete
export const postAspirantMeetingComplete = (aspirantId: number, meetingId: number, payload: { notes?: string }) =>
  apiClient.post(`/aspirants/${aspirantId}/meeting/${meetingId}/complete`, payload);

// Backwards-compatible alias (in case other parts of the app call the plural path)
export const postAspirantMeetingComplete_Plural = (aspirantId: number, meetingId: number, payload: { notes?: string }) =>
  apiClient.post(`/aspirants/${aspirantId}/meetings/${meetingId}/complete`, payload);

export const postAspirantVisit = (id: number, payload: { scheduledAt?: number; title?: string | null; description?: string | null; location?: string | null; googleMapsLink?: string | null }) =>
  apiClient.post(`/aspirants/${id}/visits`, payload);

export const getAspirantVisits = (id: number) => apiClient.get(`/aspirants/${id}/visits`);

export const respondVisit = (visitId: number, payload: { attending: boolean }) => apiClient.post(`/aspirants/visits/${visitId}/respond`, payload);
export const respondMeeting = (meetingId: number, payload: { attending: boolean }) => apiClient.post(`/aspirants/meetings/${meetingId}/respond`, payload);
export const postAspirantVisitNote = (id: number, visitId: number, payload: { note: string }) =>
  apiClient.post(`/aspirants/${id}/visits/${visitId}/notes`, payload);
// New: complete a ward-level meeting by id (adds notes, marks completed)
export const postWardMeetingComplete = (meetingId: number, payload: { notes?: string }) =>
  apiClient.post(`/aspirant-ward-meetings/${meetingId}/complete`, payload);

// NOTE: ward-level meeting completion wrapper removed — use aspirant-level `postAspirantMeetingComplete`
export const bookAspirant = (id: number, payload: { message: string; preferredAt?: number | null }) =>
  apiClient.post(`/aspirants/${id}/book`, payload);
export const getAspirantBookings = (id: number) => apiClient.get(`/aspirants/${id}/bookings`);
export const updateBookingStatus = (aspirantId: number, bookingId: number, status: 'accepted' | 'rejected') =>
  apiClient.patch(`/aspirants/${aspirantId}/bookings/${bookingId}`, { status });

export const respondBooking = (aspirantId: number, bookingId: number, payload: { status: 'accepted' | 'rejected'; scheduledAt?: number | null }) =>
  apiClient.post(`/aspirants/${aspirantId}/bookings/${bookingId}/respond`, payload);

// New: bulk set meeting for aspirants
export const setAspirantsMeeting = (payload: { aspirantIds: number[]; meetingLink?: string | null; scheduledAt?: number | null; startTime?: number | null; endTime?: number | null; title?: string | null; description?: string | null; platform?: string | null }) =>
  apiClient.post('/aspirants/meeting', payload);

// Get aspirant's meetings
export const getAspirantMeetings = (aspirantId: number) => apiClient.get(`/aspirants/${aspirantId}/meeting`);

// Bulk delete meetings by IDs
export const deleteAspirantsMeeting = (payload: { meetingIds: number[] }) => apiClient.delete('/aspirants/meeting', { data: payload });

// Rate an aspirant meeting (1=bad, 2=average, 3=good, 4=excellent)
export const rateAspirantMeeting = (meetingId: number, payload: { rating: number }) =>
  apiClient.post(`/aspirants/meetings/${meetingId}/rate`, payload);

// Rate an aspirant visit/direct-meet (1=bad, 2=average, 3=good, 4=excellent)
export const rateAspirantVisit = (visitId: number, payload: { rating: number }) =>
  apiClient.post(`/aspirants/visits/${visitId}/rate`, payload);

// Rate an aspirant's contact (phone/WhatsApp). 1=bad … 5=excellent.
export const rateAspirantContact = (aspirantId: number, payload: { rating: number }) =>
  apiClient.post(`/aspirants/${aspirantId}/contact/rate`, payload);
