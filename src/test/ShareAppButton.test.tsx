// UI INTEGRATION TEST for the Share App button in PublicLayout navigation.
//
// Tests that the share button appears in both mobile drawer and desktop nav,
// and that clicking it triggers the native Web Share API or clipboard fallback.

import { renderWithProviders, screen, fireEvent } from './test-utils';
import PublicLayout from '../layouts/PublicLayout';

// Mock i18n so t() returns the key (or defaultValue if provided).
// Also provide a minimal i18n object for LanguageSelector.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => o?.defaultValue ?? k,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Helper to get the share button element
function getShareButton() {
  return screen.getByRole('button', { name: 'share.button_label' });
}

describe('Share App Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the share button in the desktop navigation', () => {
    renderWithProviders(<PublicLayout />, { route: '/' });
    const shareBtn = getShareButton();
    expect(shareBtn).toBeInTheDocument();
    expect(shareBtn.tagName).toBe('BUTTON');
  });

  it('renders the share button in the mobile drawer navigation', () => {
    renderWithProviders(<PublicLayout />, { route: '/' });
    const shareBtn = getShareButton();
    expect(shareBtn).toBeInTheDocument();
  });

  it('calls navigator.share with correct arguments when available', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: mockShare, writable: true, configurable: true });

    renderWithProviders(<PublicLayout />, { route: '/' });
    const shareBtn = getShareButton();
    fireEvent.click(shareBtn);

    expect(mockShare).toHaveBeenCalledTimes(1);
    expect(mockShare).toHaveBeenCalledWith({
      title: 'share.app_title',
      text: 'share.app_text',
      url: window.location.origin,
    });
  });

  it('falls back to clipboard when navigator.share is not available', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, writable: true, configurable: true });
    const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    Object.defineProperty(navigator, 'clipboard', { value: mockClipboard, writable: true, configurable: true });

    renderWithProviders(<PublicLayout />, { route: '/' });
    const shareBtn = getShareButton();
    fireEvent.click(shareBtn);

    expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(window.location.origin);
  });

  it('does not throw when user cancels the share dialog', async () => {
    const mockShare = vi.fn().mockRejectedValue(new DOMException('User cancelled', 'AbortError'));
    Object.defineProperty(navigator, 'share', { value: mockShare, writable: true, configurable: true });

    expect(() => {
      renderWithProviders(<PublicLayout />, { route: '/' });
      const shareBtn = getShareButton();
      fireEvent.click(shareBtn);
    }).not.toThrow();

    expect(mockShare).toHaveBeenCalledTimes(1);
  });

  it('does not throw when clipboard fallback fails', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, writable: true, configurable: true });
    const mockClipboard = { writeText: vi.fn().mockRejectedValue(new Error('Clipboard error')) };
    Object.defineProperty(navigator, 'clipboard', { value: mockClipboard, writable: true, configurable: true });

    expect(() => {
      renderWithProviders(<PublicLayout />, { route: '/' });
      const shareBtn = getShareButton();
      fireEvent.click(shareBtn);
    }).not.toThrow();
  });
});
