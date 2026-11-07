// UNIT TESTS for the zustand theme store.
// zustand stores can be tested WITHOUT React: read/update via getState().
import useThemeStore from '../store/useThemeStore';

describe('useThemeStore', () => {
  // Reset to the known default before each test (the store is a singleton).
  beforeEach(() => {
    useThemeStore.setState({ mode: 'dark' });
  });

  it('defaults to light mode for new visitors', () => {
    expect(useThemeStore.getInitialState().mode).toBe('light');
  });

  it('toggleTheme switches dark -> light -> dark', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().mode).toBe('light');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('setMode sets the mode explicitly', () => {
    useThemeStore.getState().setMode('light');
    expect(useThemeStore.getState().mode).toBe('light');
  });
});
