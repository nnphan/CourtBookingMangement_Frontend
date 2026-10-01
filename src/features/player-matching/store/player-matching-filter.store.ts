import { create } from 'zustand';

export interface PlayerMatchingFilterState {
  search: string;
  date?: string;
  branchId?: string;
  skillLevel?: string;
  gender?: string;
  availableSlots?: number;

  setSearch: (search: string) => void;
  setDate: (date?: string) => void;
  setBranch: (branchId?: string) => void;
  setSkillLevel: (skillLevel?: string) => void;
  setGender: (gender?: string) => void;
  setAvailableSlots: (slots?: number) => void;
  resetFilters: () => void;
}

const initialState = {
  search: '',
  date: undefined,
  branchId: undefined,
  skillLevel: 'All',
  gender: 'All',
  availableSlots: undefined,
};

export const usePlayerMatchingFilterStore = create<PlayerMatchingFilterState>((set) => ({
  ...initialState,

  setSearch: (search) => set({ search }),
  setDate: (date) => set({ date }),
  setBranch: (branchId) => set({ branchId }),
  setSkillLevel: (skillLevel) => set({ skillLevel }),
  setGender: (gender) => set({ gender }),
  setAvailableSlots: (availableSlots) => set({ availableSlots }),
  resetFilters: () => set(initialState),
}));
