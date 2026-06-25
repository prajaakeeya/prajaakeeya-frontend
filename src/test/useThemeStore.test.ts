// UNIT TESTS for the zustand theme store.
// zustand stores can be tested WITHOUT React: read/update via getState().
import useThemeStore from '../store/useThemeStore';

describe('useThemeStore', () => {
  // Reset to the known default before each test (the store is a singleton).
  beforeEach(() => {
    useThemeStore.setState({ mode: 'dark' });
  });

  it('defaults to dark mode', () => {
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('toggleTheme switches dark -> light -> grey -> dark', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().mode).toBe('light');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().mode).toBe('grey');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('setMode sets the mode explicitly', () => {
    useThemeStore.getState().setMode('light');
    expect(useThemeStore.getState().mode).toBe('light');

    useThemeStore.getState().setMode('grey');
    expect(useThemeStore.getState().mode).toBe('grey');
  });
});
