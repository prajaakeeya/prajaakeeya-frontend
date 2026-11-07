// Tests for Preloader: renders null, removes the splash inside a ReactNative
// WebView, and exports dismissPreloader() which removes the #preloader element.
import { render } from './test-utils';
import Preloader, { dismissPreloader } from '../components/Preloader';

describe('Preloader', () => {
  beforeEach(() => {
    // Recreate the host DOM nodes Preloader expects (normally from index.html).
    document.body.innerHTML =
      '<div id="preloader"></div>';
    // Ensure a non-ReactNative userAgent by default.
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (jsdom)',
      configurable: true,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders nothing itself (returns null)', () => {
    const { container } = render(<Preloader />);
    // The component's own render output is empty.
    expect(container).toBeEmptyDOMElement();
  });

  it('removes the #preloader element entirely in a ReactNative WebView', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'MyApp ReactNative/1.0',
      configurable: true,
    });
    render(<Preloader />);
    expect(document.getElementById('preloader')).toBeNull();
  });

  describe('dismissPreloader', () => {
    it('adds the exit class and then removes the preloader', () => {
      vi.useFakeTimers();
      try {
        dismissPreloader();
        const el = document.getElementById('preloader');
        expect(el).not.toBeNull();
        expect(el!.classList.contains('exit')).toBe(true);

        // After the 750ms timeout the element is removed from the DOM.
        vi.advanceTimersByTime(750);
        expect(document.getElementById('preloader')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('is a no-op when there is no preloader element', () => {
      document.body.innerHTML = '';
      // Should not throw when the element is absent.
      expect(() => dismissPreloader()).not.toThrow();
    });
  });
});
