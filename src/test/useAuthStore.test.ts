// UNIT TESTS for the zustand auth store.
// We test the synchronous actions setAuth + clearSession (no network).
// We avoid logout() here because it calls window.location.href = '/'
// (a full navigation jsdom can't perform).
import { useAuthStore } from '../store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset to a clean signed-out state before each test.
    useAuthStore.setState({ token: null, user: null, isAdmin: false, isAuthenticated: false });
    localStorage.clear();
  });

  it('starts signed out', () => {
    const s = useAuthStore.getState();
    expect(s.token).toBeNull();
    expect(s.isAuthenticated).toBe(false);
    expect(s.isAdmin).toBe(false);
  });

  it('setAuth stores the token and marks the session authenticated', () => {
    useAuthStore.getState().setAuth('jwt-token', { name: 'Asha', role: 'voter' } as any);
    const s = useAuthStore.getState();
    expect(s.token).toBe('jwt-token');
    expect(s.isAuthenticated).toBe(true);
    expect(s.isAdmin).toBe(false);
    expect(s.user?.name).toBe('Asha');
  });

  it('setAuth sets isAdmin when role is admin', () => {
    useAuthStore.getState().setAuth('jwt', { name: 'Boss', role: 'admin' } as any);
    expect(useAuthStore.getState().isAdmin).toBe(true);
  });

  it('setAuth normalizes a nested ward object into top-level fields', () => {
    useAuthStore.getState().setAuth('jwt', {
      name: 'Asha',
      role: 'voter',
      ward: { id: 7, number: '12', name: 'North Ward', assembly: 'A1' },
    } as any);
    const u = useAuthStore.getState().user as any;
    expect(u.wardId).toBe(7);
    expect(u.wardNumber).toBe('12');
    expect(u.wardName).toBe('North Ward');
  });

  it('clearSession wipes the in-memory session', () => {
    useAuthStore.getState().setAuth('jwt', { name: 'Asha', role: 'voter' } as any);
    useAuthStore.getState().clearSession();
    const s = useAuthStore.getState();
    expect(s.token).toBeNull();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it('clearSession preserves theme + language keys in localStorage', () => {
    localStorage.setItem('theme-storage', '{"mode":"dark"}');
    localStorage.setItem('i18nextLng', 'kn');
    localStorage.setItem('some-other-key', 'should-be-removed');

    useAuthStore.getState().clearSession();

    expect(localStorage.getItem('theme-storage')).toBe('{"mode":"dark"}');
    expect(localStorage.getItem('i18nextLng')).toBe('kn');
    expect(localStorage.getItem('some-other-key')).toBeNull();
  });
});
