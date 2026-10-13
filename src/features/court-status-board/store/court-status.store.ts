import { create } from 'zustand';
import dayjs from '@/lib/dayjs';
import type { BookingItem } from '../types/booking';
import type { SlotSelectionRange } from '../types/common';
import { SCHEDULER_CONFIG } from '../constants/scheduler';
import { useBranchSearchStore } from '@/features/branch-discovery/store/branch-search.store';

export interface CreateDialogInitialValues {
  branchId?: string;
  courtId?: string;
  courtName?: string;
  date?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
}

interface CourtStatusState {
  selectedDate: string;
  selectedBranch: string;
  selectedCourtGroup: string;
  selectedCourt: string | null;
  selectedBooking: BookingItem | null;
  editingBooking: BookingItem | null;
  zoomLevel: number;
  scrollPosition: { x: number; y: number };
  slotInterval: number;
  activeSelection: SlotSelectionRange | null;

  isCreateDialogOpen: boolean;
  isDetailDrawerOpen: boolean;
  createDialogDefaultValues: CreateDialogInitialValues | null;

  // Actions
  setSelectedDate: (date: string) => void;
  setSelectedBranch: (branchId: string) => void;
  setSelectedCourtGroup: (groupId: string) => void;
  setSelectedCourt: (courtId: string | null) => void;
  setSelectedBooking: (booking: BookingItem | null) => void;
  setZoomLevel: (zoom: number) => void;
  setScrollPosition: (pos: { x: number; y: number }) => void;
  setSlotInterval: (interval: number) => void;
  setActiveSelection: (selection: SlotSelectionRange | null) => void;
  clearActiveSelection: () => void;
  openCreateDialog: (initialValues?: CreateDialogInitialValues) => void;
  closeCreateDialog: () => void;
  openEditDialog: (booking: BookingItem) => void;
  openDetailDrawer: (booking: BookingItem) => void;
  closeDetailDrawer: () => void;
  reset: () => void;
}

const getInitialCourtStatusDate = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlDate = params.get('date');
    if (urlDate && dayjs(urlDate, 'YYYY-MM-DD', true).isValid()) {
      return urlDate;
    }
  }
  const branchSearchDate = useBranchSearchStore.getState().selectedDate;
  if (branchSearchDate && dayjs(branchSearchDate).isValid()) {
    return branchSearchDate;
  }
  return dayjs().format('YYYY-MM-DD');
};

const getInitialCourtStatusBranch = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlBranch = params.get('branchId');
    if (urlBranch) {
      return urlBranch;
    }
  }
  return '';
};

const DEFAULT_GROUP = 'all';

export const useCourtStatusStore = create<CourtStatusState>((set) => ({
  selectedDate: getInitialCourtStatusDate(),
  selectedBranch: getInitialCourtStatusBranch(),
  selectedCourtGroup: DEFAULT_GROUP,
  selectedCourt: null,
  selectedBooking: null,
  editingBooking: null,
  zoomLevel: 1.0,
  scrollPosition: { x: 0, y: 0 },
  slotInterval: SCHEDULER_CONFIG.DEFAULT_INTERVAL_MINUTES,
  activeSelection: null,

  isCreateDialogOpen: false,
  isDetailDrawerOpen: false,
  createDialogDefaultValues: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedBranch: (branchId) => set({ selectedBranch: branchId }),
  setSelectedCourtGroup: (groupId) => set({ selectedCourtGroup: groupId }),
  setSelectedCourt: (courtId) => set({ selectedCourt: courtId }),
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),
  setZoomLevel: (zoom) =>
    set({
      zoomLevel: Math.max(0.65, Math.min(1.6, zoom)),
    }),
  setScrollPosition: (pos) => set({ scrollPosition: pos }),
  setSlotInterval: (interval) => set({ slotInterval: interval }),
  setActiveSelection: (selection) => set({ activeSelection: selection }),
  clearActiveSelection: () => set({ activeSelection: null }),

  openCreateDialog: (initialValues) =>
    set((state) => ({
      isCreateDialogOpen: true,
      editingBooking: null,
      createDialogDefaultValues: initialValues
        ? {
            ...initialValues,
            branchId: initialValues.branchId ?? state.selectedBranch,
            date: initialValues.date ?? initialValues.bookingDate ?? state.selectedDate,
            bookingDate: initialValues.bookingDate ?? initialValues.date ?? state.selectedDate,
          }
        : {
            branchId: state.selectedBranch,
            date: state.selectedDate,
            bookingDate: state.selectedDate,
          },
    })),

  closeCreateDialog: () =>
    set({
      isCreateDialogOpen: false,
      editingBooking: null,
      createDialogDefaultValues: null,
    }),

  openEditDialog: (booking) =>
    set({
      isCreateDialogOpen: true,
      editingBooking: booking,
      createDialogDefaultValues: null,
    }),

  openDetailDrawer: (booking) =>
    set({
      selectedBooking: booking,
      isDetailDrawerOpen: true,
    }),

  closeDetailDrawer: () =>
    set({
      isDetailDrawerOpen: false,
      selectedBooking: null,
    }),

  reset: () =>
    set({
      selectedDate: dayjs().format('YYYY-MM-DD'),
      selectedBranch: '',
      selectedCourtGroup: DEFAULT_GROUP,
      selectedCourt: null,
      selectedBooking: null,
      editingBooking: null,
      zoomLevel: 1.0,
      scrollPosition: { x: 0, y: 0 },
      slotInterval: SCHEDULER_CONFIG.DEFAULT_INTERVAL_MINUTES,
      activeSelection: null,
      isCreateDialogOpen: false,
      isDetailDrawerOpen: false,
      createDialogDefaultValues: null,
    }),
}));
