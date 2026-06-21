import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '../types/auth';
import { fetchProfile } from '../services/authService';
import { getWardById } from '../services/wardService';
import { isMockMode } from '../config/appMode';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setAuth: (token: string | null | undefined, user: AuthUser) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

const normalizeAuthUser = (user: AuthUser): AuthUser => ({
  ...user,
  aspirantWardNumber: user.aspirantWardNumber,
  wardId: user.ward?.id ?? user.wardId,
  wardNumber: user.ward?.number ?? user.wardNumber,
  wardName: user.ward?.name ?? user.wardName,
  assembly: user.ward?.assembly ?? user.assembly,
  ward: user.ward ?? {
    id: user.wardId,
    number: user.wardNumber,
    name: user.wardName,
    assembly: user.assembly,
    parliamentary: user.parliamentary,
    state: user.state,
  },
});

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAdmin: false,
      isAuthenticated: false,
      setAuth: (token, user) => {
        // Normalize user to ensure ward fields are available whether API returns nested `ward` or top-level wardName/wardNumber
        const normalizedUser = normalizeAuthUser(user);

        set({ token: token ?? null, user: normalizedUser, isAdmin: normalizedUser.role === 'admin', isAuthenticated: true });
      },
      // Clear the current session (in-memory state + persisted localStorage)
      // WITHOUT triggering a full-page reload. Use this when you need to drop
      // a previous user's cached data before attaching a new session — e.g.
      // at the end of a fresh OAuth sign-up on a device where someone else
      // was previously logged in.
      clearSession: () => {
        set({ token: null, user: null, isAdmin: false, isAuthenticated: false });
        const preserveKeys = ['theme-storage', 'i18nextLng'];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('civic_raised_')) preserveKeys.push(key);
        }
        const preserved: Record<string, string> = {};
        preserveKeys.forEach(key => {
          const val = localStorage.getItem(key);
          if (val !== null) preserved[key] = val;
        });
        localStorage.clear();
        Object.entries(preserved).forEach(([key, val]) => localStorage.setItem(key, val));
      },
      logout: async () => {
        // Remove this device's FCM push token FIRST — while the JWT is still
        // valid — and AWAIT it so the backend DELETE actually completes (and
        // FCM's deleteToken runs) before we wipe auth and hard-reload. Capped at
        // 3s so a slow/unreachable API can't block logout. (Dynamic import
        // avoids a circular dependency with apiClient.)
        try {
          const push = await import('../services/pushNotifications');
          await Promise.race([
            push.disablePushNotifications(),
            new Promise((resolve) => setTimeout(resolve, 3000)),
          ]);
        } catch {
          /* best-effort — backend also self-prunes stale tokens */
        }
        set({ token: null, user: null, isAdmin: false, isAuthenticated: false });
        // Clear all localStorage except theme, language, and civic raised state
        const preserveKeys = ['theme-storage', 'i18nextLng'];
        // Preserve all civic_raised_* keys so hand-raise history survives logout
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('civic_raised_')) preserveKeys.push(key);
        }
        const preserved: Record<string, string> = {};
        preserveKeys.forEach(key => {
          const val = localStorage.getItem(key);
          if (val !== null) preserved[key] = val;
        });
        localStorage.clear();
        Object.entries(preserved).forEach(([key, val]) => localStorage.setItem(key, val));
        // Hard refresh to ensure latest build is loaded (clears SW cache)
        window.location.href = '/';
      },
      fetchProfile: async () => {
        const state = get();
        if (!state.token && !state.user) return;
        if (isMockMode) {
          if (state.user) {
            set({ isAdmin: state.user.role === 'admin', isAuthenticated: true });
          }
          return;
        }
        try {
          const response = await fetchProfile();
          const apiUser = response.data;
          // Normalize nested ward object into top-level fields if present
          const normalizedUser: AuthUser = {
            ...apiUser,
            aspirantId: apiUser.aspirantId,
            wardId: apiUser.ward?.id ?? apiUser.wardId,
            wardNumber: apiUser.ward?.number ?? apiUser.wardNumber,
            wardName: apiUser.ward?.name ?? apiUser.wardName,
            assembly: apiUser.ward?.assembly ?? apiUser.assembly
          };
          // If API returned only wardId, fetch ward details to populate wardNumber/wardName/assembly
          if ((normalizedUser.wardNumber === undefined || normalizedUser.wardName === undefined) && normalizedUser.wardId) {
            try {
              const wardResp = await getWardById(normalizedUser.wardId as number);
              const wardData = (wardResp.data ?? null) as Partial<NonNullable<AuthUser['ward']>> | null;
              if (wardData) {
                normalizedUser.wardNumber = normalizedUser.wardNumber ?? wardData.number;
                normalizedUser.wardName = normalizedUser.wardName ?? wardData.name;
                normalizedUser.assembly = normalizedUser.assembly ?? wardData.assembly;
                normalizedUser.parliamentary = normalizedUser.parliamentary ?? wardData.parliamentary;
                normalizedUser.state = normalizedUser.state ?? wardData.state;
              }
            } catch (error) {
              console.warn('[auth] fetch ward by id failed', error);
            }
          }
          set({ user: normalizedUser, isAdmin: normalizedUser.role === 'admin', isAuthenticated: true });
        } catch (err) {
          console.warn('[auth] fetchProfile failed', err);
        }
      }
    }),
    {
      name: 'auth-storage',
      version: 2,
      partialize: (state) => ({ user: state.user }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<AuthState> | undefined;
        return { user: state?.user ?? null };
      },
      onRehydrateStorage: () => (state) => {
        // Never trust persisted auth data for access control. The user object is
        // kept only so App can attempt a cookie-backed /auth/me refresh.
        if (state) {
          state.token = null;
          state.isAuthenticated = false;
          state.isAdmin = false;
        }
      }
    }
  )
);

export default useAuthStore;
