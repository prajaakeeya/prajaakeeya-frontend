// Tests for DocumentsUploadStep — the document-upload step of the aspirant
// wizard. The DOC_CONFIG list is currently empty (resume/EPIC/photo uploads
// were removed), so this step mainly renders navigation controls plus an
// optional inline LivePhotoCaptureStep when the full set of camera props is
// passed. These tests exercise the simpler navigation-only configuration.
//
// Setup notes:
//  - react-i18next is mocked so t() returns the key (or its defaultValue).
//  - apiClient is mocked: a useEffect calls GET /media/admin/documents on mount;
//    we resolve it with an empty array so the effect completes without network.
//  - The camera props (cameraActive/videoRef/etc.) are left undefined so the
//    inline LivePhotoCaptureStep branch (which needs the webcam) is NOT mounted.

import { renderWithProviders, screen, fireEvent } from './test-utils';
import DocumentsUploadStep from '../components/aspirant/DocumentsUploadStep';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o && o.defaultValue ? o.defaultValue : k),
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// apiClient.get('/media/admin/documents') runs on mount — resolve empty.
vi.mock("../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Minimal valid documents state (all slots empty).
const emptyDocs: any = {
  resume: null,
  epic: null,
  epicBack: null,
  addressProof: null,
  signedAgreement: null,
  photo: null,
  codeOfConduct: null,
  sopEn: null,
  sopKn: null,
};

const makeProps = (overrides: Partial<any> = {}) => ({
  documents: emptyDocs,
  setDocuments: vi.fn(),
  handleFileUpload: vi.fn(() => vi.fn()),
  onBack: vi.fn(),
  onNext: vi.fn(),
  canProceed: true,
  ...overrides,
});

describe('DocumentsUploadStep', () => {
  it('renders without crashing and shows Back and Next buttons', () => {
    renderWithProviders(<DocumentsUploadStep {...makeProps()} />);
    expect(
      screen.getByRole('button', { name: /forms.aspirant.navigation.back/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /forms.aspirant.navigation.next/ }),
    ).toBeInTheDocument();
  });

  it('disables the Next button when canProceed is false', () => {
    renderWithProviders(<DocumentsUploadStep {...makeProps({ canProceed: false })} />);
    expect(
      screen.getByRole('button', { name: /forms.aspirant.navigation.next/ }),
    ).toBeDisabled();
  });

  it('fires onNext when the (enabled) Next button is clicked', () => {
    const onNext = vi.fn();
    renderWithProviders(
      <DocumentsUploadStep {...makeProps({ canProceed: true, onNext })} />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /forms.aspirant.navigation.next/ }),
    );
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('fires onBack when the Back button is clicked', () => {
    const onBack = vi.fn();
    renderWithProviders(<DocumentsUploadStep {...makeProps({ onBack })} />);
    fireEvent.click(
      screen.getByRole('button', { name: /forms.aspirant.navigation.back/ }),
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('uses submitButtonText for the Next button when supplied', () => {
    renderWithProviders(
      <DocumentsUploadStep {...makeProps({ submitButtonText: 'Submit Application' })} />,
    );
    expect(
      screen.getByRole('button', { name: 'Submit Application' }),
    ).toBeInTheDocument();
  });

  it('does not render the Home/cancel button (commented out) even when onCancel is provided', () => {
    renderWithProviders(<DocumentsUploadStep {...makeProps({ onCancel: vi.fn() })} />);
    // The Home button is intentionally commented out; t('common.home') echoes the key in our mock.
    expect(
      screen.queryByRole('button', { name: 'common.home' }),
    ).not.toBeInTheDocument();
  });
});
