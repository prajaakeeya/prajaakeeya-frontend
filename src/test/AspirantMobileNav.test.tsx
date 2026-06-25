// COMPONENT TEST for AspirantMobileNav.
//
// This is the mobile hamburger menu: a header card (ward info) plus a list of
// navigation items. Clicking an item calls navigate(item.path). When the
// aspirant is NOT approved, the interactive tabs (meetings/chat/posts) are hidden.

import { renderWithProviders, screen, fireEvent } from './test-utils';
import AspirantMobileNav from '../components/aspirant/AspirantMobileNav';
import { useAuthStore } from '../store/useAuthStore';

// --- Mock i18n: t() returns the key (or defaultValue). ---
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k),
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Spy on useNavigate; keep the rest of react-router-dom real.
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const aspirantProfile = { wardNumber: 12, assembly: 'Hebbal' };

describe('AspirantMobileNav', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Seed the real zustand auth store so useAuthStore() returns a user.
    useAuthStore.setState({ user: { id: 1, name: 'Asha' } as any });
  });

  it('renders the dashboard title and the ward summary', () => {
    renderWithProviders(<AspirantMobileNav aspirantProfile={aspirantProfile} />);
    // Title comes back as the i18n key.
    expect(screen.getByText('userDashboard.aspirant.title')).toBeInTheDocument();
    // Ward line is hardcoded: "Ward {n} • {assembly}".
    expect(screen.getByText(/Ward 12/)).toBeInTheDocument();
    expect(screen.getByText(/Hebbal/)).toBeInTheDocument();
  });

  it('always shows the always-available actions (Vote / Voters / Discussions / Profile)', () => {
    // Even for an unapproved aspirant these top-level actions are never filtered out.
    renderWithProviders(<AspirantMobileNav aspirantProfile={aspirantProfile} isApproved={false} />);
    expect(screen.getByText('userDashboard.actions.vote')).toBeInTheDocument();
    expect(screen.getByText('userDashboard.actions.voters')).toBeInTheDocument();
    expect(screen.getByText('userDashboard.actions.discussions')).toBeInTheDocument();
    expect(screen.getByText('userDashboard.aspirant.tabs.profile')).toBeInTheDocument();
  });

  it('navigates to the item path when a menu item is clicked', () => {
    renderWithProviders(<AspirantMobileNav aspirantProfile={aspirantProfile} isApproved />);
    // Click "Vote Now" -> should navigate to /user/vote.
    fireEvent.click(screen.getByText('userDashboard.actions.vote'));
    expect(mockNavigate).toHaveBeenCalledWith('/user/vote');
  });

  it('hides interactive tabs (chat/posts/meetings) when the aspirant is NOT approved', () => {
    renderWithProviders(
      <AspirantMobileNav aspirantProfile={aspirantProfile} isApproved={false} />
    );
    // These tabs are filtered out for unapproved aspirants.
    expect(screen.queryByText('userDashboard.aspirant.tabs.chat')).not.toBeInTheDocument();
    expect(screen.queryByText('userDashboard.aspirant.tabs.posts')).not.toBeInTheDocument();
    expect(screen.queryByText('userDashboard.aspirant.tabs.meetings')).not.toBeInTheDocument();
  });

  it('shows interactive tabs when the aspirant IS approved', () => {
    renderWithProviders(<AspirantMobileNav aspirantProfile={aspirantProfile} isApproved />);
    expect(screen.getByText('userDashboard.aspirant.tabs.chat')).toBeInTheDocument();
    expect(screen.getByText('userDashboard.aspirant.tabs.posts')).toBeInTheDocument();
    expect(screen.getByText('userDashboard.aspirant.tabs.meetings')).toBeInTheDocument();

    // And clicking one navigates to its path.
    fireEvent.click(screen.getByText('userDashboard.aspirant.tabs.chat'));
    expect(mockNavigate).toHaveBeenCalledWith('/user/dashboard/chat');
  });
});
