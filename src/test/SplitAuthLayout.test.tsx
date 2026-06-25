// Tests for SplitAuthLayout: a branded two-panel layout wrapper used by the
// auth (login/register) pages. The left panel is branding; the right panel
// renders the page's `children` inside a card.
//
// Notes:
//  - react-i18next is mocked (t() returns the key / defaultValue). The mock's
//    i18n object also provides .t() and .language because the component reads
//    i18n.t('pages.login.footerMotto') and i18n.language directly.
//  - It uses the real useThemeStore (zustand) for the dark/light toggle, plus
//    the real LanguageSelector + AuthFooter children — all render fine in jsdom.
//  - matchMedia is stubbed in setup to return matches:false, so useMediaQuery
//    reports "not mobile" and the desktop left panel renders.

import { renderWithProviders, screen, fireEvent } from './test-utils';
import SplitAuthLayout from '../components/SplitAuthLayout';
import useThemeStore from '../store/useThemeStore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k),
    i18n: {
      language: 'en',
      changeLanguage: () => Promise.resolve(),
      t: (k: string) => k,
    },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

describe('SplitAuthLayout', () => {
  beforeEach(() => {
    // Start each test in a known theme state.
    useThemeStore.setState({ mode: 'light' });
  });

  it('renders its children inside the layout', () => {
    renderWithProviders(
      <SplitAuthLayout>
        <div data-testid="auth-content">Hello form</div>
      </SplitAuthLayout>,
    );
    expect(screen.getByTestId('auth-content')).toBeInTheDocument();
    expect(screen.getByText('Hello form')).toBeInTheDocument();
  });

  it('renders the branding (logo + app name) and theme toggle', () => {
    renderWithProviders(
      <SplitAuthLayout>
        <div>content</div>
      </SplitAuthLayout>,
    );
    // Branding logo image present.
    expect(screen.getByAltText('Prajaakeeya Logo')).toBeInTheDocument();
    // The theme toggle button is labelled by its aria-label (light mode here).
    expect(
      screen.getByRole('button', { name: 'Switch to grey theme' }),
    ).toBeInTheDocument();
  });

  it('renders a card title when provided and no toggle tabs', () => {
    renderWithProviders(
      <SplitAuthLayout cardTitle="Sign in to continue">
        <div>content</div>
      </SplitAuthLayout>,
    );
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
  });

  it('toggles the theme store when the theme button is clicked', () => {
    renderWithProviders(
      <SplitAuthLayout>
        <div>content</div>
      </SplitAuthLayout>,
    );
    expect(useThemeStore.getState().mode).toBe('light');
    
    // Toggle 1: light -> grey
    fireEvent.click(
      screen.getByRole('button', { name: 'Switch to grey theme' }),
    );
    expect(useThemeStore.getState().mode).toBe('grey');

    // Toggle 2: grey -> dark
    fireEvent.click(
      screen.getByRole('button', { name: 'Switch to dark theme' }),
    );
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('renders the Login/Register toggle tabs when onLeftButtonClick is provided', () => {
    renderWithProviders(
      <SplitAuthLayout onLeftButtonClick={vi.fn()}>
        <div>content</div>
      </SplitAuthLayout>,
    );
    // Tab labels come from t('pages.login.title') / t('pages.register.title'),
    // which the i18n mock echoes back as the keys.
    expect(
      screen.getByRole('button', { name: 'pages.login.title' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'pages.register.title' }),
    ).toBeInTheDocument();
  });
});
