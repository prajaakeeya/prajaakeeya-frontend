// Tests the "Share App" button in UserLayout (#44).
//
// Two paths: when the Web Share API exists we open the native share sheet;
// otherwise we copy the link to the clipboard and confirm with a snackbar.
//
// i18n is mocked so t() returns the key, so the button's aria-label is
// 'menu.shareApp' and the copied-confirmation is 'menu.shareCopied'.

import { renderWithProviders, screen, fireEvent } from './test-utils';
import UserLayout from '../layouts/UserLayout';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => o?.defaultValue ?? k,
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// NotificationBell fetches an unread count; stub it so nothing hits the network.
vi.mock('../services/notificationService', () => ({
  getUnreadCount: vi.fn(() => Promise.resolve(0)),
  NOTIFICATIONS_CHANGED_EVENT: 'notifications-changed',
}));

const APP_URL = 'https://prajaakeeya.org';

const setNavigatorProp = (prop: string, value: unknown) =>
  Object.defineProperty(navigator, prop, { configurable: true, writable: true, value });

describe('Share App button (#44)', () => {
  it('opens the native share sheet when Web Share is available', () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigatorProp('share', share);

    renderWithProviders(<UserLayout />, { route: '/user/dashboard' });
    fireEvent.click(screen.getByLabelText('menu.shareApp'));

    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: APP_URL }));
  });

  it('copies the link and confirms when Web Share is unavailable', async () => {
    setNavigatorProp('share', undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigatorProp('clipboard', { writeText });

    renderWithProviders(<UserLayout />, { route: '/user/dashboard' });
    fireEvent.click(screen.getByLabelText('menu.shareApp'));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(APP_URL));
    expect(await screen.findByText('menu.shareCopied')).toBeInTheDocument();
  });
});
