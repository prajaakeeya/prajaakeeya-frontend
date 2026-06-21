// PAGE TEST for HomePage — backs the public landing route ("/"). It renders the
// "no entry / the owner" narrative and a primary CTA that sends visitors into
// the oath flow. The page had no coverage before this; these tests pin down the
// content rendering and the CTA navigation.
//
// Setup notes:
//   - i18n mocked with stable refs; t() returns the key so we assert on keys.
//   - react-router-dom: useNavigate spied; MemoryRouter (via renderWithProviders)
//     stays real.
//   - useThemeStore stays real (it has its own unit test and works under jsdom).

import { renderWithProviders, screen, fireEvent } from './test-utils';
import HomePage from '../pages/HomePage';

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

describe('HomePage (/)', () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  it('renders the landing narrative and the primary CTA', () => {
    renderWithProviders(<HomePage />, { route: '/' });

    expect(screen.getByText('pages.landing.homePage.noEntryBadge')).toBeInTheDocument();
    expect(screen.getByText('pages.landing.homePage.ownerLabel')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /pages\.landing\.homePage\.proceed/i }),
    ).toBeInTheDocument();
  });

  it('exposes a single semantic <h1> for the page', () => {
    renderWithProviders(<HomePage />, { route: '/' });
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('sends the visitor to the oath flow when the CTA is clicked', () => {
    renderWithProviders(<HomePage />, { route: '/' });

    fireEvent.click(
      screen.getByRole('button', { name: /pages\.landing\.homePage\.proceed/i }),
    );

    expect(navigate).toHaveBeenCalledWith('/oath');
  });
});
