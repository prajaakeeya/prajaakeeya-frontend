// PAGE TEST for the user's profile page (AspirantProfilePage).
//
// NOTE on naming: the user asked for "UserProfilePage", but
// src/pages/UserProfilePage.tsx is EMPTY (0 bytes)
// and is not imported anywhere — App.tsx wires the /user/dashboard/profile route
// to src/pages/aspirant/AspirantProfilePage.tsx instead. An empty module has no
// default export to render, so this suite targets the page that actually backs
// the profile route: AspirantProfilePage. (If UserProfilePage.tsx ever gets
// implemented, point the import below at it.)
//
// What AspirantProfilePage does (the parts we care about for tests):
//   - For a fully-registered aspirant (role === 'aspirant') it fetches the
//     aspirant record (getAspirantById), then renders ProfileCompletionPage +
//     a "My Profile" heading + AspirantProfileTab + a Logout button.
//   - For a non-aspirant it short-circuits and renders ONLY ProfileCompletionPage
//     (the shared profile-completion form) — no fetch.
//   - While the aspirant fetch is in flight it shows a CircularProgress spinner.
//   - Clicking Logout calls the auth store's logout() and navigates to '/'.
//
// Setup notes:
//   - react-i18next mocked with STABLE t/i18n refs (the fetch effect deps don't
//     include t, but stable refs keep render cheap and predictable).
//   - aspirantService mocked — getAspirantById/withdrawMe never hit the network.
//   - The two heavy children (ProfileCompletionPage, AspirantProfileTab) are
//     stubbed to markers so we don't drag in their many services; each has its
//     own coverage elsewhere.
//   - useNavigate spied; useLocation stays real (the page reads pathname).
//   - Auth store seeded per test; logout is a spy we can assert on.

import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
// The empty UserProfilePage.tsx can't be rendered; test the real profile page.
import AspirantProfilePage from '../pages/aspirant/AspirantProfilePage';
import { useAuthStore } from '../store/useAuthStore';
import { getAspirantById } from '../services/aspirantService';

// Stable refs so re-renders never produce new t/i18n identities.
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

// aspirantService — profile fetch + withdraw resolve with valid shapes.
vi.mock('../services/aspirantService', () => ({
  getAspirantById: vi.fn(() =>
    Promise.resolve({
      data: {
        id: 5,
        name: 'Asha Rao',
        createdAt: '2024-01-01T00:00:00.000Z',
        ward: { number: '12', assembly: 'North' },
        documents: [],
        meetings: [],
      },
    }),
  ),
  withdrawMe: vi.fn(() => Promise.resolve({ data: {} })),
}));

// Heavy children — stub to markers (each has its own test coverage).
vi.mock('../pages/ProfileCompletionPage', () => ({
  default: () => <div data-testid="profile-completion" />,
}));
vi.mock('../components/aspirant/AspirantProfileTab', () => ({
  default: () => <div data-testid="aspirant-profile-tab" />,
}));

describe('UserProfilePage (AspirantProfilePage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the profile-completion form for a non-aspirant user', () => {
    // Non-aspirant: page short-circuits to ProfileCompletionPage, no fetch.
    useAuthStore.setState({
      token: 't',
      user: { id: 1, name: 'Asha', role: 'voter' } as any,
      isAuthenticated: true,
      logout: vi.fn(),
    } as any);
    renderWithProviders(<AspirantProfilePage />, { route: '/user/dashboard/profile' });
    expect(screen.getByTestId('profile-completion')).toBeInTheDocument();
    expect(getAspirantById).not.toHaveBeenCalled();
  });

  it('fetches and renders the "My Profile" section for an aspirant', async () => {
    useAuthStore.setState({
      token: 't',
      user: { id: 5, name: 'Asha Rao', role: 'aspirant', aspirantId: 5, documentStatus: 'completed' } as any,
      isAuthenticated: true,
      logout: vi.fn(),
    } as any);
    renderWithProviders(<AspirantProfilePage />, { route: '/user/dashboard/profile' });
    // Fetch fires for the aspirant id.
    await waitFor(() => expect(getAspirantById).toHaveBeenCalledWith(5));
    // "My Profile" heading + the profile tab render once data resolves.
    expect(await screen.findByText('userDashboard.aspirant.tabs.profile')).toBeInTheDocument();
    expect(screen.getByTestId('aspirant-profile-tab')).toBeInTheDocument();
  });

  it('renders a Logout button for the aspirant profile', async () => {
    useAuthStore.setState({
      token: 't',
      user: { id: 5, name: 'Asha Rao', role: 'aspirant', aspirantId: 5, documentStatus: 'completed' } as any,
      isAuthenticated: true,
      logout: vi.fn(),
    } as any);
    renderWithProviders(<AspirantProfilePage />, { route: '/user/dashboard/profile' });
    expect(await screen.findByRole('button', { name: 'common.logout' })).toBeInTheDocument();
  });

  it('logs out and navigates home when Logout is clicked', async () => {
    const logout = vi.fn();
    useAuthStore.setState({
      token: 't',
      user: { id: 5, name: 'Asha Rao', role: 'aspirant', aspirantId: 5, documentStatus: 'completed' } as any,
      isAuthenticated: true,
      logout,
    } as any);
    renderWithProviders(<AspirantProfilePage />, { route: '/user/dashboard/profile' });
    const logoutBtn = await screen.findByRole('button', { name: 'common.logout' });
    fireEvent.click(logoutBtn);
    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/');
  });
});

// The /user/complete-profile route renders the SAME AspirantProfilePage, but
// the component checks `location.pathname.includes('/complete-profile')` and
// hides the "My Profile" section while the aspirant's documents are still
// pending — so on that route they only see the completion form until approved
// (documentStatus === 'completed'). These tests pin that route-specific logic.
describe('AspirantProfilePage on the /user/complete-profile route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows ONLY the completion form for an aspirant whose docs are still pending', () => {
    useAuthStore.setState({
      token: 't',
      user: { id: 5, name: 'Asha Rao', role: 'aspirant', aspirantId: 5, documentStatus: 'pending' } as any,
      isAuthenticated: true,
      logout: vi.fn(),
    } as any);
    renderWithProviders(<AspirantProfilePage />, { route: '/user/complete-profile' });

    // Just the shared completion form — no "My Profile" section/tab here.
    expect(screen.getByTestId('profile-completion')).toBeInTheDocument();
    expect(screen.queryByTestId('aspirant-profile-tab')).not.toBeInTheDocument();
    expect(screen.queryByText('userDashboard.aspirant.tabs.profile')).not.toBeInTheDocument();
    // And no aspirant record is fetched while docs are pending.
    expect(getAspirantById).not.toHaveBeenCalled();
  });

  it('shows the full "My Profile" once the aspirant\'s docs are completed', async () => {
    useAuthStore.setState({
      token: 't',
      user: { id: 5, name: 'Asha Rao', role: 'aspirant', aspirantId: 5, documentStatus: 'completed' } as any,
      isAuthenticated: true,
      logout: vi.fn(),
    } as any);
    renderWithProviders(<AspirantProfilePage />, { route: '/user/complete-profile' });

    // documentStatus 'completed' flips showMyProfile on -> fetch + full profile.
    await waitFor(() => expect(getAspirantById).toHaveBeenCalledWith(5));
    expect(await screen.findByTestId('aspirant-profile-tab')).toBeInTheDocument();
    expect(screen.getByText('userDashboard.aspirant.tabs.profile')).toBeInTheDocument();
  });

  it('shows the completion form for a non-aspirant on the complete-profile route', () => {
    useAuthStore.setState({
      token: 't',
      user: { id: 1, name: 'Asha', role: 'voter' } as any,
      isAuthenticated: true,
      logout: vi.fn(),
    } as any);
    renderWithProviders(<AspirantProfilePage />, { route: '/user/complete-profile' });

    expect(screen.getByTestId('profile-completion')).toBeInTheDocument();
    expect(getAspirantById).not.toHaveBeenCalled();
  });
});
