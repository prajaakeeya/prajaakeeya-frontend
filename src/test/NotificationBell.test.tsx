import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
import NotificationBell from '../components/NotificationBell';
import { useAuthStore } from '../store/useAuthStore';
import { getUnreadCount } from '../services/notificationService';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k),
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../services/notificationService', () => ({
  NOTIFICATIONS_CHANGED_EVENT: 'prajakeeya:notifications-changed',
  getUnreadCount: vi.fn(() => Promise.resolve({ data: { unreadCount: 3 } })),
}));

const mockedGetUnreadCount = vi.mocked(getUnreadCount);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('NotificationBell', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockedGetUnreadCount.mockClear();
    mockedGetUnreadCount.mockResolvedValue({ data: { unreadCount: 3 } } as any);
    // Authenticated by default so the bell fetches the live count.
    useAuthStore.setState({ isAuthenticated: true, token: 'tok' });
  });

  it('renders the notification button with an accessible label', () => {
    renderWithProviders(<NotificationBell />);
    expect(
      screen.getByRole('button', { name: /notifications/i })
    ).toBeInTheDocument();
  });

  it('fetches the unread count on mount and renders it in the badge', async () => {
    renderWithProviders(<NotificationBell />);
    await waitFor(() => expect(mockedGetUnreadCount).toHaveBeenCalled());
    expect(await screen.findByText('3')).toBeInTheDocument();
  });

  it('does not fetch when the user is not authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: false, token: null });
    renderWithProviders(<NotificationBell />);
    // Give effects a chance to run.
    await Promise.resolve();
    expect(mockedGetUnreadCount).not.toHaveBeenCalled();
  });

  it('hides the badge count when an explicit count override of 0 is given', () => {
    renderWithProviders(<NotificationBell count={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows the override count instead of the fetched one', async () => {
    renderWithProviders(<NotificationBell count={5} />);
    expect(await screen.findByText('5')).toBeInTheDocument();
  });

  it('navigates to the notifications route when clicked', () => {
    renderWithProviders(<NotificationBell to="/user/notifications" />);
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/user/notifications');
  });
});
