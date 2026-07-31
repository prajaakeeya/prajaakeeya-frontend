// Tests for OfflineBanner: shows a warning banner only while the browser is
// offline, driven by navigator.onLine plus window 'online'/'offline' events.
//
// IMPORTANT MUI GOTCHA: <Collapse> keeps its children MOUNTED even when
// collapsed — it just hides them visually. So we CANNOT assert the text is
// absent from the DOM. Instead we check the Collapse wrapper's state class:
//   collapsed/hidden -> 'MuiCollapse-hidden'
//   expanded         -> 'MuiCollapse-entered'
// These classes are toggled in JS (not CSS), so they're deterministic in jsdom.
import { renderWithProviders, screen, act, waitFor } from './test-utils';
import OfflineBanner from '../components/OfflineBanner';
import { vi } from 'vitest';

const OFFLINE_TEXT = 'common.offlineMessage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, o?: any) => o?.defaultValue ?? k }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

function collapseEl(container: HTMLElement) {
  return container.querySelector('.MuiCollapse-root') as HTMLElement;
}

describe('OfflineBanner', () => {
  beforeEach(() => {
    // Default each test to "online" so the banner starts collapsed.
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  it('always renders the offline message text (Collapse keeps it mounted)', () => {
    renderWithProviders(<OfflineBanner />);
    expect(screen.getByText(OFFLINE_TEXT)).toBeInTheDocument();
  });

  it('is collapsed (hidden) when the browser is online', () => {
    const { container } = renderWithProviders(<OfflineBanner />);
    expect(collapseEl(container)).toHaveClass('MuiCollapse-hidden');
  });

  it('is expanded when mounted while offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const { container } = renderWithProviders(<OfflineBanner />);
    expect(collapseEl(container)).not.toHaveClass('MuiCollapse-hidden');
  });

  it('expands when an "offline" event fires', async () => {
    const { container } = renderWithProviders(<OfflineBanner />);
    expect(collapseEl(container)).toHaveClass('MuiCollapse-hidden');

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // Collapse animates open; wait until the hidden class is gone.
    await waitFor(() => expect(collapseEl(container)).not.toHaveClass('MuiCollapse-hidden'));
  });

  it('collapses again when an "online" event fires', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const { container } = renderWithProviders(<OfflineBanner />);
    expect(collapseEl(container)).not.toHaveClass('MuiCollapse-hidden');

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    // Collapse animates closed; wait until the hidden class returns.
    await waitFor(() => expect(collapseEl(container)).toHaveClass('MuiCollapse-hidden'));
  });
});
