// PAGE TEST for AspirantViewDetailsPage — a read-only aspirant profile reached
// at /user/aspirants/:id/view.
//
// What this page does (the parts we test):
//   - Reads the :id route param, calls getAspirantById(Number(id)) on mount, and
//     stores resp.data as `aspirant`. While loading it shows a CircularProgress.
//   - Renders a HERO card (name + party chip), a "Personal Information" section
//     (age/gender/education/occupation/address tiles), an "About me" manifesto
//     card, and (conditionally) social, rating, meetings, visits, SOP & docs.
//   - If the fetch fails / returns nothing it shows an "Aspirant not found"
//     fallback with a "Go Back" button (navigate(-1)).
//
// Setup notes:
//   - i18n is mocked: t() echoes the key. NOTE: this page hard-codes English
//     section titles (it only switches to Kannada when i18n.language startsWith
//     'kn'); our mock keeps language='en', so we assert on the English strings
//     ('Personal Information', 'About me') and on the mocked aspirant data.
//   - useParams() -> { id: '1' }; useNavigate is spied.
//   - aspirantService.getAspirantById is mocked (resp.data shape).

import { renderWithProviders, screen } from './test-utils';
import AspirantViewDetailsPage from '../pages/AspirantViewDetailsPage';
import { getAspirantById } from '../services/aspirantService';

// --- i18n: stable refs; t() returns the KEY (or defaultValue). ---
const t = (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k);
const i18n = { language: 'en', changeLanguage: () => Promise.resolve(), t };
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t, i18n }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// --- Router: spy useNavigate, pin the :id param to '1', keep the rest real. ---
const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...((await orig()) as any),
  useNavigate: () => navigate,
  useParams: () => ({ id: '1' }),
}));

// --- aspirantService: getAspirantById returns a populated aspirant so the
// profile sections render. The spy is created INSIDE the factory (vi.mock is
// hoisted, so no top-level refs are allowed) and read back via vi.mocked(). ---
vi.mock('../services/aspirantService', () => ({
  getAspirantById: vi.fn(() =>
    Promise.resolve({
      data: {
        id: 1,
        name: 'Ravi Kumar',
        party: 'Independent',
        status: 'approved',
        age: 38,
        gender: 'Male',
        education: 'B.E. Civil',
        occupation: 'Engineer',
        address: '5 Lake View, South Ward',
        manifesto: 'Better roads and drainage for the ward.',
        electionName: 'Municipal 2026',
        constituencyName: 'South',
        overallRating: { averageRating: 0, totalRatings: 0, distribution: {} },
        meetings: [],
        visits: [],
      },
    }),
  ),
  listProposals: vi.fn(() => Promise.resolve({ data: [] })),
  createProposal: vi.fn(() => Promise.resolve({ data: {} })),
  supportProposal: vi.fn(() => Promise.resolve({ data: {} })),
  unsupportProposal: vi.fn(() => Promise.resolve({ data: {} })),
  listCandidacies: vi.fn(() => Promise.resolve({ data: [] })),
  removeCandidacy: vi.fn(() => Promise.resolve({ data: {} })),
  declareCandidacy: vi.fn(() => Promise.resolve({ data: {} })),
}));

describe('AspirantViewDetailsPage', () => {
  it('renders the aspirant name after loading', async () => {
    renderWithProviders(<AspirantViewDetailsPage />);
    expect(await screen.findByText('Ravi Kumar')).toBeInTheDocument();
  });

  it('renders the Personal Information section heading', async () => {
    renderWithProviders(<AspirantViewDetailsPage />);
    // Hard-coded English title (language is 'en' in the mock).
    expect(await screen.findByText('Personal Information')).toBeInTheDocument();
  });

  it('shows mapped personal detail tile values', async () => {
    renderWithProviders(<AspirantViewDetailsPage />);
    await screen.findByText('Personal Information');
    // Age tile renders `${age} yrs`; occupation renders as-is.
    expect(screen.getByText('38 yrs')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
  });

  it('renders the manifesto in the About me card', async () => {
    renderWithProviders(<AspirantViewDetailsPage />);
    expect(await screen.findByText('About me')).toBeInTheDocument();
    expect(
      screen.getByText('Better roads and drainage for the ward.'),
    ).toBeInTheDocument();
  });

  it('calls getAspirantById with the numeric route id', async () => {
    renderWithProviders(<AspirantViewDetailsPage />);
    await screen.findByText('Ravi Kumar');
    // useParams id '1' is coerced to Number before the service call.
    expect(vi.mocked(getAspirantById)).toHaveBeenCalledWith(1);
  });
});
