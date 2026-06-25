import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Layout variants for the home page appearance.
 *  - 'reverse'  → images swap sides (right-to-left order)
 *  - 'straight' → both image cards stack full-width vertically
 *  - 'left'     → content anchored to the left with a red accent strip
 *  - 'right'    → content anchored to the right with a gold accent strip
 *  - null       → default layout (no override)
 */
export type LayoutVariant = 'reverse' | 'straight' | 'cardover' | null;

interface PreferenceState {
  activeLayout: LayoutVariant;
  /** Select a layout. Calling with the currently-active layout deselects it (back to null). */
  setActiveLayout: (layout: LayoutVariant) => void;
  /** Toggle: if already active → null, else → the given layout. */
  toggleLayout: (layout: Exclude<LayoutVariant, null>) => void;
}

const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set, get) => ({
      activeLayout: null,

      setActiveLayout: (layout) => set({ activeLayout: layout }),

      toggleLayout: (layout) =>
        set({ activeLayout: get().activeLayout === layout ? null : layout }),
    }),
    {
      name: 'preference-storage',
      partialize: (state) => ({ activeLayout: state.activeLayout }),
    }
  )
);

export default usePreferenceStore;
