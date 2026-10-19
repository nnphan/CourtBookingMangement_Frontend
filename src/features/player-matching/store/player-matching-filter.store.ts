import { create } from 'zustand';
import type {
  PlayerMatchGenderPreference,
  PlayerMatchSort,
  PlayerMatchSkillLevel,
} from '../types/player-matching.types';

export interface PlayerMatchingFilterState {
  keyword: string;
  matchDate?: string;
  startTime?: string;
  endTime?: string;
  skillLevel?: PlayerMatchSkillLevel;
  genderPreference?: PlayerMatchGenderPreference;
  city: string;
  district: string;
  sortBy: PlayerMatchSort;
  page: number;
  pageSize: number;
  setKeyword: (keyword: string) => void;
  setMatchDate: (matchDate?: string) => void;
  setStartTime: (startTime?: string) => void;
  setEndTime: (endTime?: string) => void;
  setSkillLevel: (skillLevel?: PlayerMatchSkillLevel) => void;
  setGenderPreference: (genderPreference?: PlayerMatchGenderPreference) => void;
  setCity: (city: string) => void;
  setDistrict: (district: string) => void;
  setSortBy: (sortBy: PlayerMatchSort) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

const initialState = {
  keyword: '',
  matchDate: undefined,
  startTime: undefined,
  endTime: undefined,
  skillLevel: undefined,
  genderPreference: undefined,
  city: '',
  district: '',
  sortBy: 'latest' as const,
  page: 1,
  pageSize: 9,
};

export const usePlayerMatchingFilterStore = create<PlayerMatchingFilterState>((set) => ({
  ...initialState,
  setKeyword: (keyword) => set({ keyword, page: 1 }),
  setMatchDate: (matchDate) => set({ matchDate, page: 1 }),
  setStartTime: (startTime) => set({ startTime, page: 1 }),
  setEndTime: (endTime) => set({ endTime, page: 1 }),
  setSkillLevel: (skillLevel) => set({ skillLevel, page: 1 }),
  setGenderPreference: (genderPreference) => set({ genderPreference, page: 1 }),
  setCity: (city) => set({ city, district: '', page: 1 }),
  setDistrict: (district) => set({ district, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set(initialState),
}));
