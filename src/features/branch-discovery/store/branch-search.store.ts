import { create } from 'zustand';
import type {
  BadmintonBranch,
  BranchAmenityId,
  BranchSortOption,
  CourtSurface,
  TimeSlotCategory,
} from '../types/branch';

interface BranchSearchState {
  // Search parameters
  searchQuery: string;
  selectedDistrict: string;
  selectedDate: string; // YYYY-MM-DD
  selectedTimeSlot: TimeSlotCategory;
  selectedAmenities: BranchAmenityId[];
  selectedCourtSurface: CourtSurface | 'all';
  minPrice: number;
  maxPrice: number;
  onlyOpenNow: boolean;
  sortBy: BranchSortOption;

  // UI state
  viewMode: 'grid' | 'split' | 'map';
  hoveredBranchId: string | null;
  selectedBranchForDetail: BadmintonBranch | null;
  selectedBranchForBooking: BadmintonBranch | null;
  isDetailOpen: boolean;
  isBookingOpen: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedDistrict: (district: string) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTimeSlot: (timeSlot: TimeSlotCategory) => void;
  toggleAmenity: (amenity: BranchAmenityId) => void;
  setSelectedCourtSurface: (surface: CourtSurface | 'all') => void;
  setPriceRange: (min: number, max: number) => void;
  setOnlyOpenNow: (openOnly: boolean) => void;
  setSortBy: (sort: BranchSortOption) => void;
  setViewMode: (mode: 'grid' | 'split' | 'map') => void;
  setHoveredBranchId: (id: string | null) => void;

  openDetailModal: (branch: BadmintonBranch) => void;
  closeDetailModal: () => void;
  openBookingDrawer: (branch: BadmintonBranch) => void;
  closeBookingDrawer: () => void;

  resetFilters: () => void;
}

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const useBranchSearchStore = create<BranchSearchState>((set) => ({
  searchQuery: '',
  selectedDistrict: 'all',
  selectedDate: getTodayDateString(),
  selectedTimeSlot: 'all',
  selectedAmenities: [],
  selectedCourtSurface: 'all',
  minPrice: 50000,
  maxPrice: 300000,
  onlyOpenNow: false,
  sortBy: 'recommended',

  viewMode: 'grid',
  hoveredBranchId: null,
  selectedBranchForDetail: null,
  selectedBranchForBooking: null,
  isDetailOpen: false,
  isBookingOpen: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedDistrict: (selectedDistrict) => set({ selectedDistrict }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedTimeSlot: (selectedTimeSlot) => set({ selectedTimeSlot }),
  toggleAmenity: (amenity) =>
    set((state) => {
      const exists = state.selectedAmenities.includes(amenity);
      return {
        selectedAmenities: exists
          ? state.selectedAmenities.filter((a) => a !== amenity)
          : [...state.selectedAmenities, amenity],
      };
    }),
  setSelectedCourtSurface: (selectedCourtSurface) => set({ selectedCourtSurface }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  setOnlyOpenNow: (onlyOpenNow) => set({ onlyOpenNow }),
  setSortBy: (sortBy) => set({ sortBy }),
  setViewMode: (viewMode) => set({ viewMode }),
  setHoveredBranchId: (hoveredBranchId) => set({ hoveredBranchId }),

  openDetailModal: (branch) => set({ selectedBranchForDetail: branch, isDetailOpen: true }),
  closeDetailModal: () => set({ selectedBranchForDetail: null, isDetailOpen: false }),

  openBookingDrawer: (branch) => set({ selectedBranchForBooking: branch, isBookingOpen: true }),
  closeBookingDrawer: () => set({ selectedBranchForBooking: null, isBookingOpen: false }),

  resetFilters: () =>
    set({
      searchQuery: '',
      selectedDistrict: 'all',
      selectedDate: getTodayDateString(),
      selectedTimeSlot: 'all',
      selectedAmenities: [],
      selectedCourtSurface: 'all',
      minPrice: 50000,
      maxPrice: 300000,
      onlyOpenNow: false,
      sortBy: 'recommended',
    }),
}));
