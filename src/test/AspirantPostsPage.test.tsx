// PAGE TEST for AspirantPostsPage — backs the /user/dashboard/posts route.
// It loads the aspirant profile + their "visits"/posts on mount, renders the
// AspirantPostsTab, and provides a "Direct Meet" dialog that posts a visit.
//
// Setup notes:
//   - i18n mocked with stable refs; t() returns the key (or defaultValue).
//   - react-router-dom: useNavigate spied; rest real.
//   - aspirantService mocked (getAspirantById / getAspirantVisits /
//     postAspirantVisit) — no network.
//   - AspirantPostsTab is stubbed to a marker that also exposes a button to
//     open the dialog (the tab has its own test coverage).
//   - Auth store seeded with an aspirant user.

import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
import AspirantPostsPage from '../pages/aspirant/AspirantPostsPage';
import { useAuthStore } from '../store/useAuthStore';
import { getAspirantById, getAspirantVisits, postAspirantVisit } from '../services/aspirantService';

const t = (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k);
const i18n = { language: 'en', changeLanguage: () => Promise.resolve(), t };
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t, i18n }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...(await (orig() as any)),
  useNavigate: () => navigate,
}));

vi.mock('../services/aspirantService', () => ({
  getAspirantById: vi.fn(),
  getAspirantVisits: vi.fn(),
  postAspirantVisit: vi.fn(),
}));

// Stub the (separately-tested) tab; expose a button to open the dialog so we
// can exercise the page's own Direct Meet flow.
vi.mock('../components/aspirant/AspirantPostsTab', () => ({
  default: ({ setDirectMeetOpen }: any) => (
    <div>
      <div data-testid="posts-tab" />
      <button onClick={() => setDirectMeetOpen(true)}>open-dm</button>
    </div>
  ),
}));

describe('AspirantPostsPage (/user/dashboard/posts)', () => {
  beforeEach(() => {
    vi.mocked(getAspirantById).mockResolvedValue({ data: { id: 42, name: 'Asha Rao' } } as any);
    vi.mocked(getAspirantVisits).mockResolvedValue({ data: [] } as any);
    vi.mocked(postAspirantVisit).mockResolvedValue({ data: {} } as any);
    // Seed an aspirant user (aspirantId 42 takes priority over id 7).
    useAuthStore.setState({
      token: 't',
      user: { id: 7, aspirantId: 42, name: 'Asha Rao', role: 'aspirant' } as any,
      isAuthenticated: true,
    } as any);
  });

  it('fetches the profile + visits and renders the Posts heading and tab', async () => {
    renderWithProviders(<AspirantPostsPage />, { route: '/user/dashboard/posts' });
    await waitFor(() => expect(getAspirantById).toHaveBeenCalledWith(42));
    expect(getAspirantVisits).toHaveBeenCalledWith(42);
    expect(await screen.findByText('userDashboard.aspirant.tabs.posts')).toBeInTheDocument();
    expect(screen.getByTestId('posts-tab')).toBeInTheDocument();
  });

  it('shows the "no profile" warning when the profile data is empty', async () => {
    vi.mocked(getAspirantById).mockResolvedValue({ data: null } as any);
    renderWithProviders(<AspirantPostsPage />, { route: '/user/dashboard/posts' });
    expect(await screen.findByText('userDashboard.aspirant.noProfile')).toBeInTheDocument();
  });

  it('redirects to /register when there is no logged-in user', async () => {
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false } as any);
    renderWithProviders(<AspirantPostsPage />, { route: '/user/dashboard/posts' });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/register'));
    expect(getAspirantById).not.toHaveBeenCalled();
  });

  it('opens the Direct Meet dialog and posts a visit', async () => {
    renderWithProviders(<AspirantPostsPage />, { route: '/user/dashboard/posts' });
    // Wait for load, then open the dialog via the stubbed tab's button.
    fireEvent.click(await screen.findByRole('button', { name: 'open-dm' }));

    // Dialog title appears.
    expect(await screen.findByText('userDashboard.aspirant.createDirectPost')).toBeInTheDocument();

    // Fill the location and submit.
    fireEvent.change(screen.getByLabelText('userDashboard.aspirant.dmLocation'), {
      target: { value: 'Central Park' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'userDashboard.aspirant.post' }));

    // The visit is posted for the loaded aspirant (id 42).
    await waitFor(() =>
      expect(postAspirantVisit).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ location: 'Central Park' }),
      ),
    );
  });
});
