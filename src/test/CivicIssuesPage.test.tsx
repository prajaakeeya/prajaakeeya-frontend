// PAGE TEST for CivicIssuesPage — lists civic-issue categories the user can
// "raise a hand" (report) for, organised under 3 tabs (MP / MLA / Ward·Panchayat).
//
// What this page does (the parts we care about):
//   - Renders a header (t('civicIssues.title')) and the 3-tab selector.
//   - On mount it fetches elections + (when a constituency is resolvable) issues.
//   - Clicking a tab switches activeTab.
//   - A "Solutions (SOP)" button at the bottom navigates to /user/sop.
//
// Setup notes:
//   - react-i18next mocked: t() returns the KEY (or its defaultValue). Tab
//     labels and several strings use defaultValue, so we assert on those.
//   - civicIssuesService.getIssuesByElectionAndConstituency returns the SHAPE the
//     page consumes ({ categories, issues, totalHandRaises }).
//   - electionService is fully mocked (empty-but-valid shapes).
//   - useNavigate spied; useLocation stays real (MemoryRouter supplies it).
//   - Auth store seeded with a user that has saved constituencies so a tab can
//     resolve a constituency id without throwing.

import { renderWithProviders, screen, fireEvent } from './test-utils';
import CivicIssuesPage from '../pages/CivicIssuesPage';
import { useAuthStore } from '../store/useAuthStore';

// IMPORTANT: `t` and `i18n` must be STABLE references across renders. This page
// has a `fetchData = useCallback(..., [..., t])` that runs in an effect keyed on
// the callback identity. If useTranslation() returned a fresh `t` every render,
// fetchData's identity would change every render and the effect would loop
// forever. Defining them once at module scope keeps them stable.
const stableT = (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k);
const stableI18n = { language: 'en', changeLanguage: () => Promise.resolve() };
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: stableT, i18n: stableI18n }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Mock framer-motion to plain passthrough elements. The page wraps lots of
// content in <motion.div>/<AnimatePresence>; in jsdom the real library adds
// animation timers that can keep the render busy. Passthroughs strip all that
// and just render children, keeping the test deterministic and fast.
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: () =>
        ({ children, ...rest }: any) => {
          // Drop framer-only props so React doesn't warn about unknown attrs.
          const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = rest;
          return <div {...domProps}>{children}</div>;
        },
    },
  ),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig() as any),
  useNavigate: () => navigate,
}));

// civicIssues service — issues fetch returns the exact shape the page reads
// (data.categories / data.issues / data.totalHandRaises).
vi.mock('../services/civicIssuesService', () => ({
  getIssuesByElectionAndConstituency: vi.fn(() =>
    Promise.resolve({
      categories: [{ name: 'Roads', count: 3, isRaised: false }],
      issues: [],
      totalHandRaises: 3,
    }),
  ),
  raiseHandForCategoryByElectionConstituency: vi.fn(() => Promise.resolve({})),
}));

// electionService — all fetches resolve to valid empty shapes.
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

describe('CivicIssuesPage', () => {
  beforeEach(() => {
    // User with saved constituencies for each type so tabs can resolve an id.
    useAuthStore.setState({
      token: 't',
      user: {
        id: 1,
        name: 'Asha',
        role: 'voter',
        lokSabhaConstituency: { id: 10, name: 'LS One', number: '1', state: 'KA' },
        stateAssemblyConstituency: { id: 20, name: 'SA One', number: '2', state: 'KA' },
        municipalCorporationConstituency: { id: 30, name: 'Ward One', number: '3', state: 'KA' },
      } as any,
      isAuthenticated: true,
    } as any);
  });

  it('renders the page title', () => {
    renderWithProviders(<CivicIssuesPage />, { route: '/user/civic-issues' });
    expect(screen.getByText('civicIssues.title')).toBeInTheDocument();
  });

  it('renders the three tab labels (MP / MLA / Ward·Panchayat)', () => {
    renderWithProviders(<CivicIssuesPage />, { route: '/user/civic-issues' });
    // Tab labels come from t('...', { defaultValue }) — our mock returns the
    // defaultValue when provided.
    expect(screen.getByText('MP Constituency')).toBeInTheDocument();
    expect(screen.getByText('MLA Constituency')).toBeInTheDocument();
    expect(screen.getByText('Ward / Panchayat')).toBeInTheDocument();
  });

  it('renders the "Solutions (SOP)" proceed button', () => {
    renderWithProviders(<CivicIssuesPage />, { route: '/user/civic-issues' });
    // Hardcoded English (non-Kannada branch).
    expect(
      screen.getByRole('button', { name: 'Solutions (SOP)' }),
    ).toBeInTheDocument();
  });

  it('navigates to /user/sop when the proceed button is clicked', () => {
    renderWithProviders(<CivicIssuesPage />, { route: '/user/civic-issues' });
    fireEvent.click(screen.getByRole('button', { name: 'Solutions (SOP)' }));
    expect(navigate).toHaveBeenCalledWith('/user/sop');
  });

  it('switches the active tab when the MLA tab is clicked (smoke)', () => {
    renderWithProviders(<CivicIssuesPage />, { route: '/user/civic-issues' });
    // Clicking the MLA tab should not throw and keeps the page rendered.
    fireEvent.click(screen.getByText('MLA Constituency'));
    expect(screen.getByText('civicIssues.title')).toBeInTheDocument();
  });
});
