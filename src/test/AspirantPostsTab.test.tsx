// COMPONENT TEST for AspirantPostsTab.
//
// Renders a list of "direct meet" posts. Covers:
//   - loading state, empty state, populated list
//   - "Create Direct meet post" button -> setDirectMeetOpen(true)
//   - refresh button -> fetchAspirantPosts()
//   - delete -> calls apiClient.delete, then refetches and shows a success snackbar
//
// apiClient (default export) is mocked so the delete never hits the network.

import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
import AspirantPostsTab from '../components/aspirant/AspirantPostsTab';
import { apiClient } from '../services/apiClient';

// --- Mock i18n: t() returns the key (or defaultValue). ---
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k),
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// --- Mock the apiClient default export so delete() doesn't hit a real backend. ---
vi.mock('../services/apiClient', () => ({
  apiClient: { delete: vi.fn(() => Promise.resolve({ data: {} })) },
}));

const samplePost = {
  id: 101,
  location: 'Community Hall',
  startTime: 4102444800000, // year ~2100
  attendingCount: 5,
};

// Helper to render with default props; overrides let each test tweak just what it needs.
function setup(overrides: Record<string, unknown> = {}) {
  const props = {
    posts: [] as any[],
    postsLoading: false,
    fetchAspirantPosts: vi.fn(() => Promise.resolve()),
    setDirectMeetOpen: vi.fn(),
    aspirantId: 9,
    ...overrides,
  };
  renderWithProviders(<AspirantPostsTab {...(props as any)} />);
  return props;
}

describe('AspirantPostsTab', () => {
  it('shows the loading message while posts are loading', () => {
    setup({ postsLoading: true });
    expect(screen.getByText('userDashboard.aspirant.loadingPosts')).toBeInTheDocument();
  });

  it('shows the empty state when there are no posts', () => {
    setup({ posts: [] });
    expect(screen.getByText('userDashboard.noPosts')).toBeInTheDocument();
  });

  it('renders a post with its location and attending count', () => {
    setup({ posts: [samplePost] });
    expect(screen.getByText('Community Hall')).toBeInTheDocument();
    // The count (5) and the "Attending" label key share one <span>, so the label
    // text is "broken up". Use a substring match (exact: false) to find that span.
    const attendingLabel = screen.getByText('userDashboard.aspirant.attending', { exact: false });
    expect(attendingLabel).toBeInTheDocument();
    expect(attendingLabel.textContent).toContain('5');
    expect(screen.queryByText('userDashboard.noPosts')).not.toBeInTheDocument();
  });

  it('opens the create-post dialog via the Create button', () => {
    const props = setup();
    fireEvent.click(
      screen.getByRole('button', { name: 'userDashboard.aspirant.createDirectPost' })
    );
    expect(props.setDirectMeetOpen).toHaveBeenCalledWith(true);
  });

  it('refetches posts when the refresh button is clicked', () => {
    const props = setup();
    // aria-label resolves to the i18n key in our mock.
    fireEvent.click(screen.getByRole('button', { name: 'userDashboard.aspirant.refreshPostsAria' }));
    expect(props.fetchAspirantPosts).toHaveBeenCalledTimes(1);
  });

  it('deletes a post: calls apiClient.delete, refetches, and shows a success message', async () => {
    const props = setup({ posts: [samplePost] });

    fireEvent.click(screen.getByRole('button', { name: 'userDashboard.aspirant.deletePostAria' }));

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/aspirants/9/visits/101');
    });
    expect(props.fetchAspirantPosts).toHaveBeenCalled();
    // Success snackbar text (resolves to the i18n key).
    expect(await screen.findByText('userDashboard.aspirant.postDeleted')).toBeInTheDocument();
  });
});
