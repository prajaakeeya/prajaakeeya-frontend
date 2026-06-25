import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaletteMode } from '@mui/material';

interface ThemeState {
  mode: 'light' | 'dark' | 'grey';
  rainEnabled: boolean;
  toggleTheme: () => void;
  setMode: (mode: 'light' | 'dark' | 'grey') => void;
  toggleRain: () => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      rainEnabled: false,
      toggleTheme: () =>
        set((state) => {
          const nextMode = state.mode === 'dark' ? 'light' : state.mode === 'light' ? 'grey' : 'dark';
          return {
            mode: nextMode,
            rainEnabled: nextMode === 'grey' ? state.rainEnabled : false,
          };
        }),
      setMode: (mode) => set((state) => ({
        mode,
        rainEnabled: mode === 'grey' ? state.rainEnabled : false,
      })),
      toggleRain: () => set((state) => ({ rainEnabled: !state.rainEnabled })),
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ mode: state.mode, rainEnabled: state.rainEnabled }),
    }
  )
);

export default useThemeStore;
