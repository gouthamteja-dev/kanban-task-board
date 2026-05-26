import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type FilterState } from '../types';

interface UiState {
  darkMode: boolean;
  filters: FilterState;
  toggleDarkMode: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = { search: '', priorities: [], tagIds: [] };

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      darkMode: false,
      filters: defaultFilters,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: 'kanban-ui-store',
      partialize: (s) => ({ darkMode: s.darkMode }),
    }
  )
);
