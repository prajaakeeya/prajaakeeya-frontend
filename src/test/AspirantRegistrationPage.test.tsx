// PAGE TEST for AspirantRegistrationPage — the "Candidate Information" step of
// the aspirant wizard. It renders a header + the CandidateInformationStep form.
//
// Important page behaviour:
//   - A guard redirects to /user/aspirants/declaration unless the user already
//     has an aspirantId OR has completed the declaration in localStorage. So to
//     see the form, we seed a user WITH an aspirantId (an existing aspirant is
//     allowed to edit). When aspirantId is missing, the page redirects (and
//     renders null) — we test that path too.
//   - The page renders <CandidateInformationStep/>, which fetches elections +
//     voting window on mount and uses a ConstituencyPickerDialog.
//
// Setup notes:
//   - react-i18next mocked: t() returns the KEY (or defaultValue).
//   - electionService / voteService / aspirantService fully mocked (empty-but-
//     valid shapes) so no network calls fire.
//   - ConstituencyPickerDialog is stubbed (its own test exists) to keep this
//     focused on the page.
//   - useNavigate spied; rest of react-router-dom stays real.
//   - Auth store seeded per test.

import { renderWithProviders, screen, waitFor } from './test-utils';
import AspirantRegistrationPage from '../pages/AspirantRegistrationPage';
import { useAuthStore } from '../store/useAuthStore';
import { fetchElections } from '../services/electionService';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k),
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig() as any),
  useNavigate: () => navigate,
}));

// Election + geography services — every fetch resolves with a valid empty shape.
vi.mock('../services/electionService', () => ({
  fetchElections: vi.fn(() => Promise.resolve({ data: [] })),
  fetchConstituencies: vi.fn(() => Promise.resolve({ data: { constituencies: [] } })),
  fetchMunicipalities: vi.fn(() => Promise.resolve({ data: [] })),
  fetchConstituenciesByScope: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPStates: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPDistricts: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPTaluks: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPGrams: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPVillages: vi.fn(() => Promise.resolve({ data: [] })),
}));

// Voting-window check on mount (used by CandidateInformationStep) — "not active".
vi.mock('../services/voteService', () => ({
  fetchVotingWindow: vi.fn(() => Promise.resolve({ data: { isVotingAllowed: false } })),
}));

// aspirantService — register/get resolve with a minimal aspirant record.
vi.mock('../services/aspirantService', () => ({
  registerAspirant: vi.fn(() => Promise.resolve({ data: { id: 5 } })),
  getAspirantById: vi.fn(() => Promise.resolve({ data: { id: 5 } })),
}));

// ConstituencyPickerDialog is its own tested component; stub to a marker.
vi.mock('../components/ConstituencyPickerDialog', () => ({
  default: ({ open }: any) => (open ? <div data-testid="picker-open" /> : null),
}));

describe('AspirantRegistrationPage', () => {
  beforeEach(() => {
    // Existing aspirant (aspirantId set) so the declaration guard lets us in
    // and the candidate form renders instead of redirecting.
    useAuthStore.setState({
      token: 't',
      user: {
        id: 1,
        name: 'Asha Rao',
        role: 'aspirant',
        aspirantId: 5,
        phone: '9876543210',
      } as any,
      isAuthenticated: true,
      fetchProfile: vi.fn(() => Promise.resolve()),
    } as any);
  });

  it('renders the page header title and subtitle', () => {
    renderWithProviders(<AspirantRegistrationPage />);
    expect(screen.getByText('forms.aspirant.title')).toBeInTheDocument();
    expect(screen.getByText('forms.aspirant.formSubtitle')).toBeInTheDocument();
  });

  it('fetches elections on mount', async () => {
    renderWithProviders(<AspirantRegistrationPage />);
    await waitFor(() => expect(fetchElections).toHaveBeenCalled());
  });

  it('renders the embedded CandidateInformationStep form', () => {
    renderWithProviders(<AspirantRegistrationPage />);
    // CandidateInformationStep renders its own form title.
    expect(screen.getByText('forms.aspirant.formTitle')).toBeInTheDocument();
    // The candidate name field is prefilled from the user.
    const nameField = screen.getByLabelText('forms.aspirant.name');
    expect(nameField).toHaveValue('Asha Rao');
  });

  it('redirects to the declaration page when the user has no aspirantId and no declaration', () => {
    // No aspirantId + empty localStorage => the declaration guard kicks in.
    useAuthStore.setState({
      token: 't',
      user: { id: 2, name: 'Guest', role: 'voter' } as any,
      isAuthenticated: true,
      fetchProfile: vi.fn(() => Promise.resolve()),
    } as any);
    renderWithProviders(<AspirantRegistrationPage />);
    // The page renders null and navigates away (replace) to the declaration page.
    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining('/user/aspirants/declaration'),
      { replace: true },
    );
    // Header should NOT be shown in the redirecting state.
    expect(screen.queryByText('forms.aspirant.title')).not.toBeInTheDocument();
  });
});
