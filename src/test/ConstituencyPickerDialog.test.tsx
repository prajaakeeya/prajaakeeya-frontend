// Tests for ConstituencyPickerDialog: a MUI Dialog that lets a user pick their
// Lok Sabha / State Assembly / local-body constituencies and save them.
//
// Key things this test sets up:
//  - react-i18next is mocked so t() returns the key (or its defaultValue).
//  - Both services it imports (electionService, authService) are mocked so the
//    component never hits the network. Each fetch resolves with a plausible
//    { data: ... } shape matching the real return types.
//  - The auth store is seeded with a token + user via setState in beforeEach so
//    `handleSave` has a token to work with.
//
// Note: MUI Dialog renders its contents into a portal on document.body, so we
// query with `screen` (which searches the whole document), not a container.

import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
import ConstituencyPickerDialog from '../components/ConstituencyPickerDialog';
import { useAuthStore } from '../store/useAuthStore';

// i18n: t() echoes the key, or the provided defaultValue when present.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k),
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Mock the election service — every fetch resolves with an empty-but-valid shape
// so the on-open effects complete without throwing.
vi.mock('../services/electionService', () => ({
  fetchConstituencies: vi.fn(() =>
    Promise.resolve({ data: { constituencies: [] } }),
  ),
  fetchMunicipalities: vi.fn(() => Promise.resolve({ data: [] })),
  fetchConstituenciesByScope: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPStates: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPDistricts: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPTaluks: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPGrams: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPVillages: vi.fn(() => Promise.resolve({ data: [] })),
}));

// Mock the auth service — updateUserConstituencies returns the saved user.
import { updateUserConstituencies } from '../services/authService';
vi.mock('../services/authService', () => ({
  updateUserConstituencies: vi.fn(() =>
    Promise.resolve({ data: { id: 1, role: 'voter' } }),
  ),
}));

describe('ConstituencyPickerDialog', () => {
  beforeEach(() => {
    // Seed a minimal authenticated session so handleSave has a token + user.
    useAuthStore.setState({
      token: 'test-token',
      user: { id: 1, role: 'voter' } as any,
      isAuthenticated: true,
      isAdmin: false,
    });
  });

  it('renders nothing visible when closed', () => {
    renderWithProviders(
      <ConstituencyPickerDialog open={false} onClose={vi.fn()} />,
    );
    // Dialog is closed -> title text should not be in the document.
    expect(
      screen.queryByText('Update your constituencies'),
    ).not.toBeInTheDocument();
  });

  it('renders the title and the constituency field labels when open', () => {
    renderWithProviders(
      <ConstituencyPickerDialog open={true} onClose={vi.fn()} />,
    );
    expect(screen.getByText('Update your constituencies')).toBeInTheDocument();
    expect(screen.getByText('Lok Sabha Constituency')).toBeInTheDocument();
    expect(screen.getByText('State Assembly Constituency')).toBeInTheDocument();
    expect(screen.getByText('Local Body')).toBeInTheDocument();
  });

  // The Cancel/Save buttons call t('common.cancel') / t('common.save') WITHOUT
  // a defaultValue, so under the i18n mock their labels are the raw keys.
  it('shows Cancel and Save action buttons', () => {
    renderWithProviders(
      <ConstituencyPickerDialog open={true} onClose={vi.fn()} />,
    );
    expect(
      screen.getByRole('button', { name: 'common.cancel' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'common.save' }),
    ).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <ConstituencyPickerDialog open={true} onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('saves via the service and fires onSaved + onClose on Save', async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    renderWithProviders(
      <ConstituencyPickerDialog
        open={true}
        onClose={onClose}
        onSaved={onSaved}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));

    // handleSave awaits the service then calls onSaved() and onClose().
    await waitFor(() => expect(updateUserConstituencies).toHaveBeenCalled());
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });
});
