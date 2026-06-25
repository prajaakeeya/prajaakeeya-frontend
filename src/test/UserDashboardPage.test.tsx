// PAGE TEST for UserDashboardPage — the logged-in user's home grid of action
// tiles (Registered Aspirants, Public Issues, My Lok Sabha Aspirants, Register
// as Aspirant, How Prajakeeya Works, etc.) plus a hero banner.
//
// What this page does (the parts we care about for tests):
//   - On mount it resolves the ward name (fetchAllWards when user.wardName is
//     missing) and the total registered-voters count (getVoters), and reads
//     localStorage for a saved aspirant-registration draft.
//   - Renders a responsive layout: on small screens (isSm) it shows a mobile
//     hero + the embedded WardCandidateListPage; on desktop it shows the hero
//     banner + a grid of clickable action tiles. The test harness's matchMedia
//     stub reports matches:false, so the DESKTOP layout renders and the heavy
//     embedded list is NOT mounted.
//   - Clicking a tile navigates (Register-as-Aspirant routes to the standalone
//     Declaration page).
//
// Setup notes:
//   - react-i18next mocked with STABLE t/i18n refs (the page builds memoized
//     action arrays that read t; stable refs keep those memos sane).
//   - wardService.fetchAllWards + voterService.getVoters fully mocked — no net.
//   - apiClient default export mocked (the page imports it for the photo-frame
//     image fetch path; never exercised here but mocked for safety).
//   - WardCandidateListPage is stubbed (it's a huge child with its own tests);
//     it only renders in the mobile branch, but we stub it so nothing heavy can
//     accidentally mount.
//   - useNavigate spied; useLocation stays real (the page reads location.state).
//   - Auth store seeded with a plain voter (role !== aspirant) so the default
//     (non-aspirant) action set renders.

import { renderWithProviders, screen } from './test-utils';
import UserDashboardPage from '../pages/UserDashboardPage';
import useAuthStore from '../store/useAuthStore';

// Stable refs avoid new t/i18n identities re-triggering the memoized tile arrays.
const t = (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k);
const i18n = { language: 'en', changeLanguage: () => Promise.resolve(), t };
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t, i18n }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Spy useNavigate; keep useLocation + the rest of the router real.
const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig() as any),
  useNavigate: () => navigate,
}));

// Ward + voter services — resolve with valid shapes so on-mount effects settle.
vi.mock('../services/wardService', () => ({
  fetchAllWards: vi.fn(() => Promise.resolve({ data: [] })),
}));
vi.mock('../services/voterService', () => ({
  getVoters: vi.fn(() => Promise.resolve({ data: { totalUsers: 1234 } })),
}));

// apiClient default export — imported directly for the photo-frame image path.
vi.mock('../services/apiClient', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// The embedded aspirants list is a large component with its own test suite;
// stub it to a marker so it can never mount heavy logic here.
vi.mock('../pages/WardCandidateListPage', () => ({
  default: () => <div data-testid="ward-candidate-list" />,
}));

describe('UserDashboardPage', () => {
  beforeEach(() => {
    // Plain voter (not a completed aspirant) → default action tiles render.
    useAuthStore.setState({
      token: 't',
      user: {
        id: 1,
        name: 'Asha Rao',
        role: 'voter',
        wardId: 1,
        wardNumber: '12',
        wardName: 'North',
      } as any,
      isAuthenticated: true,
    } as any);
  });

  it('renders the desktop hero banner heading', () => {
    renderWithProviders(<UserDashboardPage />, { route: '/user/dashboard' });
    // Non-aspirant hero shows the English brand line ("The Real Prajaakeeya")
    // since i18n.language is 'en'.
    expect(screen.getByText('The Real Prajaakeeya')).toBeInTheDocument();
  });

  it('renders the embedded aspirants list (WardCandidateListPage)', () => {
    renderWithProviders(<UserDashboardPage />, { route: '/user/dashboard' });
    // The dashboard now renders the aspirants list for every screen size; the
    // old desktop action-tile grid was removed and those nav items moved to the
    // shared header (UserLayout). The list child is stubbed to a marker.
    expect(screen.getByTestId('ward-candidate-list')).toBeInTheDocument();
  });

  it('shows the registered-voters count fetched from getVoters', async () => {
    renderWithProviders(<UserDashboardPage />, { route: '/user/dashboard' });
    // 1234 -> "1,234" via toLocaleString.
    expect(await screen.findByText('1,234')).toBeInTheDocument();
  });

  it('renders the action tiles on desktop', () => {
    renderWithProviders(<UserDashboardPage />, { route: '/user/dashboard' });
    expect(screen.getByText('userDashboard.actions.registeredAspirants')).toBeInTheDocument();
    expect(screen.getByText('userDashboard.actions.civicIssues')).toBeInTheDocument();
    expect(screen.getByText('userDashboard.actions.howUPPWorks')).toBeInTheDocument();
  });
});
