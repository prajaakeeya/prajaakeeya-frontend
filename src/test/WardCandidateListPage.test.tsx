// PAGE TEST for WardCandidateListPage — the "Aspirants" list a voter browses.
//
// This is a very large page (3-tab selector, election/constituency filters,
// chat/meeting/visit dialogs). The tests here are deliberately modest: render +
// key headings/labels + one safe navigation interaction, with EVERY service
// mocked so nothing hits the network.
//
// What we rely on:
//   - The page header (t('pages.wardCandidates.title')) renders only when NOT
//     embedded AND there is no active voting window. We mock fetchVotingWindow to
//     return no window, so the header shows.
//   - The 3-tab selector renders when there is no `?type=` query param (default
//     route '/'), so the MP / MLA / Ward·Panchayat tab labels appear.
//
// Setup notes:
//   - react-i18next mocked: t() returns the KEY (or defaultValue). The title uses
//     `t('...') || 'Aspirants'`; since the KEY is truthy we assert on the KEY.
//   - useNavigate spied; useSearchParams stays real (MemoryRouter supplies it).
//   - aspirantService / electionService / voteService / aspirantChatService and
//     the apiClient default export are all mocked.
//   - Auth store seeded with a voter that has saved constituencies.

import { renderWithProviders, screen, fireEvent } from './test-utils';
import WardCandidateListPage from '../pages/WardCandidateListPage';
import useAuthStore from '../store/useAuthStore';

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

// aspirantService — list fetch returns only a backend "demo" aspirant. The page
// treats a list of only-demo candidates as "no real aspirants yet" and renders
// its empty-state card (noAspirantsTitle). Demo aspirants must also be approved +
// document-complete to pass the page's filter. Everything else no-ops.
vi.mock('../services/aspirantService', () => ({
  fetchAspirantsByConstituency: vi.fn(() =>
    Promise.resolve({
      data: [
        {
          id: -1,
          name: 'Demo Aspirant',
          party: 'Independent',
          manifesto: 'Demo',
          isDemo: true,
          status: 'approved',
          documentStatus: 'completed',
        },
      ],
    }),
  ),
  respondVisit: vi.fn(() => Promise.resolve({ data: {} })),
  respondMeeting: vi.fn(() => Promise.resolve({ data: {} })),
  getAspirantVisits: vi.fn(() => Promise.resolve({ data: [] })),
  rateAspirantMeeting: vi.fn(() => Promise.resolve({ data: {} })),
  rateAspirantVisit: vi.fn(() => Promise.resolve({ data: {} })),
}));

// electionService — fetchElections returns the election types the user has
// constituencies for (so the active MP tab can resolve a lok_sabha election and
// trigger loadAspirants). Other geography fetches resolve to empty shapes.
vi.mock('../services/electionService', () => ({
  fetchElections: vi.fn(() =>
    Promise.resolve({
      data: [
        { id: 1, type: 'lok_sabha', name: 'Lok Sabha 2024', scope: null },
        { id: 2, type: 'state_assembly', name: 'State Assembly 2023', scope: null },
        { id: 3, type: 'municipal_corporation', name: 'BBMP 2024', scope: null },
      ],
    }),
  ),
  fetchConstituencies: vi.fn(() => Promise.resolve({ data: { constituencies: [] } })),
  fetchMunicipalities: vi.fn(() => Promise.resolve({ data: [] })),
  fetchConstituenciesByScope: vi.fn(() => Promise.resolve({ data: [] })),
  fetchConstituencyStats: vi.fn(() => Promise.resolve({ data: null })),
  fetchGPStates: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPDistricts: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPTaluks: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPGrams: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPVillages: vi.fn(() => Promise.resolve({ data: [] })),
}));

// voteService — no active voting window (so the page header renders) and no vote.
vi.mock('../services/voteService', () => ({
  fetchVotingWindow: vi.fn(() => Promise.resolve({ data: { isVotingAllowed: false } })),
  submitVote: vi.fn(() => Promise.resolve({ data: {} })),
  fetchMyVote: vi.fn(() => Promise.resolve({ data: {} })),
}));

// chat service — message fetch returns an empty list.
vi.mock('../services/aspirantChatService', () => ({
  getAspirantMessages: vi.fn(() => Promise.resolve({ data: [] })),
  postUserChatMessage: vi.fn(() => Promise.resolve({ data: {} })),
}));

// apiClient default export — used by trackInteraction; mock so it never posts.
vi.mock('../services/apiClient', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

describe('WardCandidateListPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: 't',
      user: {
        id: 1,
        name: 'Asha',
        role: 'voter',
        wardId: 1,
        lokSabhaConstituency: { id: 10, name: 'LS One' },
        stateAssemblyConstituency: { id: 20, name: 'SA One' },
        municipalCorporationConstituency: { id: 30, name: 'Ward One' },
      } as any,
      isAuthenticated: true,
    } as any);
  });

  it('renders the page header title', () => {
    renderWithProviders(<WardCandidateListPage />, { route: '/' });
    // No voting window + not embedded => header shows; t() returns the KEY.
    expect(screen.getByText('pages.wardCandidates.title')).toBeInTheDocument();
  });

  it('renders the page subtitle', () => {
    renderWithProviders(<WardCandidateListPage />, { route: '/' });
    expect(screen.getByText('pages.wardCandidates.subtitle')).toBeInTheDocument();
  });

  it('renders the 3-tab selector labels when there is no ?type= deep-link', () => {
    renderWithProviders(<WardCandidateListPage />, { route: '/' });
    // Tab labels use `t('...') || 'English'`; the KEY is truthy so assert on keys.
    expect(
      screen.getByText('userDashboard.actions.myLokSabhaAspirants'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('userDashboard.actions.myStateAssemblyAspirants'),
    ).toBeInTheDocument();
  });

  it('shows the empty-state when only a demo aspirant is returned', async () => {
    renderWithProviders(<WardCandidateListPage />, { route: '/' });
    // The list fetch resolves with a single demo aspirant, so the page shows its
    // "no real aspirants yet" empty-state card. Generous timeout for the async
    // on-mount fetch chain (elections -> loadAspirants) — raised to 8s so it
    // doesn't flake under heavy parallel suite load (passes alone at 3s, but the
    // full 277-test run can starve this chain past 3s).
    expect(
      await screen.findByText('pages.wardCandidates.noAspirantsTitle', {}, { timeout: 15000 }),
    ).toBeInTheDocument();
  });

  it('switches the active tab when the MLA tab is clicked (smoke)', () => {
    renderWithProviders(<WardCandidateListPage />, { route: '/' });
    // Clicking a tab should not throw; the page stays rendered.
    fireEvent.click(screen.getByText('userDashboard.actions.myStateAssemblyAspirants'));
    expect(screen.getByText('pages.wardCandidates.title')).toBeInTheDocument();
  });
});
