import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
import AdminLoginPage from '../pages/AdminLoginPage';
import { useAuthStore } from '../store/useAuthStore';

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

const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...(await (orig() as any)),
  useNavigate: () => navigate,
}));

vi.mock('../services/authService', () => ({
  adminLoginWithPassword: vi.fn(() =>
    Promise.resolve({ token: 'mock-token', user: { id: 1, name: 'Admin', role: 'admin' } }),
  ),
}));

vi.mock('../config/appMode', () => ({
  isMockMode: false,
}));

describe('AdminLoginPage', () => {
  beforeEach(() => {
    navigate.mockClear();
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false } as any);
  });

  it('renders the admin login form', () => {
    renderWithProviders(<AdminLoginPage />);
    expect(screen.getByText('adminLogin.login')).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderWithProviders(<AdminLoginPage />);
    expect(screen.getByLabelText('adminLogin.emailLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('adminLogin.passwordLabel')).toBeInTheDocument();
  });

  it('shows validation error for empty form submission', async () => {
    renderWithProviders(<AdminLoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'adminLogin.login' }));
    await waitFor(() => {
      expect(screen.getAllByText('validation.required').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('calls adminLoginWithPassword on valid submission', async () => {
    renderWithProviders(<AdminLoginPage />);
    fireEvent.change(screen.getByLabelText('adminLogin.emailLabel'), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByLabelText('adminLogin.passwordLabel'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'adminLogin.login' }));
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/admin/users', { replace: true });
    });
  });

  it('navigates to admin users page on successful login', async () => {
    renderWithProviders(<AdminLoginPage />);
    fireEvent.change(screen.getByLabelText('adminLogin.emailLabel'), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByLabelText('adminLogin.passwordLabel'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'adminLogin.login' }));
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/admin/users', { replace: true });
    });
  });

  it('renders the theme toggle button', () => {
    renderWithProviders(<AdminLoginPage />);
    // The IconButton's accessible name is its aria-label ("Toggle theme"); the
    // "Switch to…" text lives on the Tooltip, which is not the button's name.
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });
});
