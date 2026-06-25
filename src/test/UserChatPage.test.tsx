// PAGE TEST for UserChatPage — the 1:1 "Interview room" chat between a user and
// an aspirant.
//
// What this page does (the parts we care about for tests):
//   - Reads the :aspirantId route param; on mount it fetches the message thread
//     (getAspirantMessages).
//   - Renders a header (Aspirant chip + "Interview room"), a scrollable message
//     list, a TextField for typing, and a Send button.
//   - Typing text + clicking Send calls postUserChatMessage and appends the
//     returned message to the list.
//   - It subscribes to a live SSE stream (subscribeToAspirantChat) for realtime
//     message create/delete, with a 30s fallback poll (getAspirantMessages) in
//     case the stream drops. Polled calls pass no options, so they silently
//     no-op on errors.
//
// Setup notes:
//   - react-i18next is mocked with STABLE module-level t/i18n refs so the
//     fetchMessages useCallback (which doesn't depend on t, but the page reads
//     t in render) stays referentially stable and effects don't loop.
//   - aspirantChatService is fully mocked — no network.
//   - useParams returns { aspirantId: '1' }; useNavigate is spied; the rest of
//     react-router-dom (incl. useLocation) stays real.
//   - scrollIntoView is stubbed (jsdom has no layout) since the page scrolls to
//     the bottom after load/send.

import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
import UserChatPage from '../pages/UserChatPage';
import { useAuthStore } from '../store/useAuthStore';
import { getAspirantMessages, postUserChatMessage } from '../services/aspirantChatService';

// Stable refs so re-renders never produce new t/i18n identities.
const t = (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k);
const i18n = { language: 'en', changeLanguage: () => Promise.resolve(), t };
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t, i18n }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Spy useNavigate + pin the route param to aspirantId '1'. Keep useLocation
// (and the rest of the router) real so the page's location.state read works.
const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig() as any),
  useNavigate: () => navigate,
  useParams: () => ({ aspirantId: '1' }),
}));

// Chat service — message list + send resolve with valid shapes.
// subscribeToAspirantChat opens a live SSE (EventSource) stream in the real
// page; we stub it to return an EventSource-like object exposing close(), which
// the page calls on cleanup. (jsdom has no EventSource, so this must be mocked.)
vi.mock('../services/aspirantChatService', () => ({
  getAspirantMessages: vi.fn(() => Promise.resolve({ data: { data: [] } })),
  postUserChatMessage: vi.fn(() =>
    Promise.resolve({
      data: {
        id: 99,
        content: 'Hello aspirant',
        userId: 1,
        aspirantId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: 1, name: 'Asha', role: 'voter' },
      },
    }),
  ),
  subscribeToAspirantChat: vi.fn(() => ({ close: vi.fn() })),
}));

describe('UserChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom has no scrollIntoView; the page calls it after load/send.
    (Element.prototype as any).scrollIntoView = vi.fn();
    // Seed a signed-in voter; the page reads `user` for message ownership.
    useAuthStore.setState({
      token: 't',
      user: { id: 1, name: 'Asha', role: 'voter', wardId: 1, wardNumber: '12', wardName: 'North' } as any,
      isAuthenticated: true,
    } as any);
  });

  it('renders the chat header (Aspirant chip + Interview room label)', () => {
    renderWithProviders(<UserChatPage />, { route: '/user/chat/1' });
    // t() returns the key; both header strings use `t(...) || fallback`, and
    // since t() is truthy the fallback never fires — assert on the keys.
    expect(screen.getByText('discussion.labels.aspirant')).toBeInTheDocument();
    expect(screen.getByText('discussion.roomLabel')).toBeInTheDocument();
  });

  it('renders the message input and Send button', () => {
    renderWithProviders(<UserChatPage />, { route: '/user/chat/1' });
    expect(screen.getByPlaceholderText('discussion.placeholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'discussion.send' })).toBeInTheDocument();
  });

  it('loads the message thread on mount', async () => {
    renderWithProviders(<UserChatPage />, { route: '/user/chat/1' });
    // On mount it fetches messages for aspirant id 1.
    await waitFor(() => expect(getAspirantMessages).toHaveBeenCalledWith(1, 1, 50));
  });

  it('sends a typed message via postUserChatMessage', async () => {
    renderWithProviders(<UserChatPage />, { route: '/user/chat/1' });
    const input = screen.getByPlaceholderText('discussion.placeholder');
    fireEvent.change(input, { target: { value: 'Hello aspirant' } });
    fireEvent.click(screen.getByRole('button', { name: 'discussion.send' }));
    await waitFor(() =>
      expect(postUserChatMessage).toHaveBeenCalledWith(1, { content: 'Hello aspirant' }),
    );
    // The returned message should now appear in the thread.
    expect(await screen.findByText('Hello aspirant')).toBeInTheDocument();
  });

  it('does not send when the input is empty (Send is a no-op)', () => {
    renderWithProviders(<UserChatPage />, { route: '/user/chat/1' });
    fireEvent.click(screen.getByRole('button', { name: 'discussion.send' }));
    // handleSend bails on empty/whitespace text before calling the service.
    expect(postUserChatMessage).not.toHaveBeenCalled();
  });
});
