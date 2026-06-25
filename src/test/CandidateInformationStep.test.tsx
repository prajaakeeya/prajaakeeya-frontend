// Tests for CandidateInformationStep — the first (and largest) step of the
// aspirant wizard. It collects candidate details and resolves the election +
// constituency from the active tab and the saved auth-store user.
//
// Setup notes:
//  - react-i18next is mocked so t() returns the key (or its defaultValue). Tab
//    labels and many strings use `t('...') || 'English'`, so we assert on the
//    hardcoded English fallbacks where those are the only stable output.
//  - electionService + voteService are mocked: the component fires fetchElections
//    and fetchVotingWindow on mount (plus cascading geography fetches). We resolve
//    them with empty-but-valid shapes so the effects complete without network.
//  - The auth store is seeded with a fake user so storeUser-driven logic runs.
//  - react-hook-form is NOT actually wired up; we pass stub register/watch/etc.
//    Props that mimic its API surface (register returns {name,onChange,onBlur,ref}).

import { renderWithProviders, screen, fireEvent, waitFor } from './test-utils';
import CandidateInformationStep from '../components/aspirant/CandidateInformationStep';
import { useAuthStore } from '../store/useAuthStore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k),
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Election + geography services — every fetch resolves with a valid empty shape.
import { fetchElections } from '../services/electionService';
vi.mock('../services/electionService', () => ({
  fetchElections: vi.fn(() => Promise.resolve({ data: [] })),
  fetchConstituencies: vi.fn(() => Promise.resolve({ data: { constituencies: [] } })),
  fetchMunicipalities: vi.fn(() => Promise.resolve({ data: [] })),
  fetchConstituenciesByScope: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPStates: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPDistricts: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPTaluks: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPGrams: vi.fn(() => Promise.resolve({ data: [] })),
  fetchGPVillages: vi.fn(() => Promise.resolve({ data: [] })),
}));

// Voting-window check on mount — return "not active" so no tab gets blocked.
vi.mock('../services/voteService', () => ({
  fetchVotingWindow: vi.fn(() => Promise.resolve({ data: { isVotingAllowed: false } })),
}));

// ConstituencyPickerDialog is its own tested component; stub it to a marker so
// this test stays focused on CandidateInformationStep.
vi.mock('../components/ConstituencyPickerDialog', () => ({
  default: ({ open }: any) => (open ? <div data-testid="picker-open" /> : null),
}));

// Stub react-hook-form's register so spreading {...register('x')} yields valid
// input props (name + handlers + ref). watch returns empty string by default.
const makeProps = (overrides: Partial<any> = {}): any => ({
  register: (name: string) => ({ name, onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() }),
  errors: {},
  watch: vi.fn(() => ''),
  setValue: vi.fn(),
  trigger: vi.fn(() => Promise.resolve(true)),
  setError: vi.fn(),
  clearErrors: vi.fn(),
  loading: false,
  user: { name: 'Asha Rao', phone: '9876543210' },
  onNext: vi.fn(),
  onBack: vi.fn(),
  ...overrides,
});

describe('CandidateInformationStep', () => {
  beforeEach(() => {
    // Seed a minimal authenticated user so storeUser-driven derivations run.
    useAuthStore.setState({
      token: 'test-token',
      user: { id: 1, role: 'voter', name: 'Asha Rao' } as any,
      isAuthenticated: true,
      isAdmin: false,
    });
  });

  it('renders the form title and fetches elections on mount', async () => {
    renderWithProviders(<CandidateInformationStep {...makeProps()} />);
    expect(screen.getByText('forms.aspirant.formTitle')).toBeInTheDocument();
    await waitFor(() => expect(fetchElections).toHaveBeenCalled());
  });

  it('renders the candidate name field with the user default value', () => {
    renderWithProviders(<CandidateInformationStep {...makeProps()} />);
    const nameField = screen.getByLabelText('forms.aspirant.name');
    expect(nameField).toBeInTheDocument();
    // defaultValue={user?.name} flows into the input.
    expect(nameField).toHaveValue('Asha Rao');
  });

  it('renders the three election-context tabs', () => {
    renderWithProviders(<CandidateInformationStep {...makeProps()} />);
    // Tab labels use `t('...') || 'English'`. Our t() mock returns the KEY
    // (truthy), so the || fallback never fires — assert on the key strings.
    expect(
      screen.getByText('userDashboard.actions.myLokSabhaAspirants'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('userDashboard.actions.myStateAssemblyAspirants'),
    ).toBeInTheDocument();
    // ward_panchayat tab label resolves to the tabWardPanchayat key when the
    // user has neither a municipal nor gram-panchayat constituency saved.
    expect(
      screen.getByText('forms.aspirant.tabWardPanchayat'),
    ).toBeInTheDocument();
  });

  it('shows the Back and Next navigation buttons', () => {
    renderWithProviders(<CandidateInformationStep {...makeProps()} />);
    expect(
      screen.getByRole('button', { name: /forms.aspirant.navigation.back/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /forms.aspirant.navigation.next/ }),
    ).toBeInTheDocument();
  });

  it('calls onBack when Back is clicked', () => {
    const onBack = vi.fn();
    renderWithProviders(<CandidateInformationStep {...makeProps({ onBack })} />);
    fireEvent.click(
      screen.getByRole('button', { name: /forms.aspirant.navigation.back/ }),
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('opens the constituency picker via the Update Profile CTA', () => {
    // With no saved constituency for the active tab, the empty-state CTA renders.
    renderWithProviders(<CandidateInformationStep {...makeProps()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Update Profile' }));
    expect(screen.getByTestId('picker-open')).toBeInTheDocument();
  });
});
