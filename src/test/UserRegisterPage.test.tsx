// PAGE TEST for UserRegisterPage — backs the /register route.
// Step 1 (default) is a Google sign-up card: a consent checkbox gates the
// Google button, plus a "Continue as Guest" shortcut. Registration itself is
// delegated to Google OAuth (getGoogleOAuthUrl), so we assert the wiring rather
// than a full account creation.
//
// Setup notes:
//   - i18n mocked with stable refs; t() returns the key (English path).
//   - react-router-dom: useNavigate spied; useSearchParams stays real (the
//     ?celebrate effect no-ops on a plain /register URL).
//   - authService.getGoogleOAuthUrl mocked.
//   - SplitAuthLayout (the heavy shared shell, tested separately) is stubbed to
//     just render its content, keeping this test focused and fast.

import { renderWithProviders, screen, fireEvent } from './test-utils';
import UserRegisterPage from '../pages/UserRegisterPage';
import { getGoogleOAuthUrl } from '../services/authService';

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

vi.mock('../services/authService', () => ({
  getGoogleOAuthUrl: vi.fn(() => 'http://oauth.test/google'),
}));

vi.mock('../components/SplitAuthLayout', () => ({
  default: ({ children, topContent, cardTitle, underCardContent }: any) => (
    <div>
      {topContent}
      {cardTitle && <h1>{cardTitle}</h1>}
      {children}
      {underCardContent}
    </div>
  ),
}));

describe('UserRegisterPage (/register)', () => {
  it('renders the Google sign-up prompt, consent checkbox, and Continue-as-Guest', () => {
    renderWithProviders(<UserRegisterPage />, { route: '/register' });
    expect(screen.getByText('pages.register.registerWithSocial')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'pages.login.socialGoogle' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'pages.register.continueAsGuest' })).toBeInTheDocument();
  });

  it('keeps the Google button disabled until consent is given', () => {
    renderWithProviders(<UserRegisterPage />, { route: '/register' });
    const google = screen.getByRole('button', { name: 'pages.login.socialGoogle' });
    expect(google).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox')); // tick consent
    expect(google).toBeEnabled();
  });

  it('starts Google OAuth once consent is given', () => {
    // Drive the in-app WebView branch so the handler posts a message instead of
    // doing a real page navigation (which jsdom can't perform). Either way the
    // OAuth URL is built via getGoogleOAuthUrl, which is what we assert.
    const postMessage = vi.fn();
    (window as any).ReactNativeWebView = { postMessage };
    Object.defineProperty(navigator, 'userAgent', { value: 'ReactNative', configurable: true });
    try {
      renderWithProviders(<UserRegisterPage />, { route: '/register' });
      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByRole('button', { name: 'pages.login.socialGoogle' }));
      expect(getGoogleOAuthUrl).toHaveBeenCalled();
      expect(postMessage).toHaveBeenCalled();
    } finally {
      delete (window as any).ReactNativeWebView;
      Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (jsdom)', configurable: true });
    }
  });

  it('navigates to the guest dashboard when "Continue as Guest" is clicked', () => {
    renderWithProviders(<UserRegisterPage />, { route: '/register' });
    fireEvent.click(screen.getByRole('button', { name: 'pages.register.continueAsGuest' }));
    expect(navigate).toHaveBeenCalledWith('/guest/dashboard');
  });
});
