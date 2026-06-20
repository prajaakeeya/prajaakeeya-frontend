import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
import SopPage from '../pages/SopPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k),
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig() as any),
  useNavigate: () => navigate,
}));

vi.mock('../services/voteService', () => ({
  fetchVotingWindow: vi.fn(() => Promise.resolve({ data: { isVotingAllowed: false } })),
}));

vi.mock('../store/useAuthStore', () => ({
  default: () => ({ user: null }),
}));

describe('SopPage', () => {
  beforeEach(() => {
    navigate.mockClear();
    localStorage.clear();
  });

  it('renders the SOP flow chart', () => {
    renderWithProviders(<SopPage />);
    expect(screen.getByText('pages.landing.sopOverline')).toBeInTheDocument();
  });

  it('shows aspirant list button', () => {
    renderWithProviders(<SopPage />);
    expect(
      screen.getByRole('button', { name: /aspirants list/i }),
    ).toBeInTheDocument();
  });

  it('navigates to dashboard on aspirant list click', () => {
    renderWithProviders(<SopPage />);
    fireEvent.click(
      screen.getByRole('button', { name: /aspirants list/i }),
    );
    expect(navigate).toHaveBeenCalledWith('/user/dashboard');
  });

  it('shows register as aspirant button when user has no aspirantId', () => {
    renderWithProviders(<SopPage />);
    expect(
      screen.getByRole('button', { name: /register as aspirant/i }),
    ).toBeInTheDocument();
  });

  it('navigates to declaration on register aspirant click', () => {
    renderWithProviders(<SopPage />);
    fireEvent.click(
      screen.getByRole('button', { name: /register as aspirant/i }),
    );
    expect(navigate).toHaveBeenCalledWith('/user/aspirants/declaration');
  });

  it('shows back to declaration button when coming from aspirant registration', () => {
    renderWithProviders(<SopPage />, {
      route: '/user/sop',
      state: { from: 'aspirant-registration' },
    });
    expect(
      screen.getByRole('button', { name: /back to declaration/i }),
    ).toBeInTheDocument();
  });

  it('navigates back to declaration on back button click', () => {
    renderWithProviders(<SopPage />, {
      route: '/user/sop',
      state: { from: 'aspirant-registration' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /back to declaration/i }),
    );
    expect(navigate).toHaveBeenCalledWith('/user/aspirants/declaration', { replace: true });
  });
});
