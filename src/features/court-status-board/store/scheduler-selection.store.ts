import { create } from 'zustand';

export interface SchedulerSelectionState {
  branchId: string | null;
  courtId: string | null;
  courtName: string | null;
  bookingDate: string | null;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
  estimatedPrice: number | null;

  // Actions
  setSelection: (selection: {
    branchId?: string | null;
    courtId: string;
    courtName?: string | null;
    bookingDate?: string | null;
    startTime: string;
    endTime: string;
    durationMinutes?: number;
    estimatedPrice?: number | null;
  }) => void;
  setEstimatedPrice: (price: number | null) => void;
  clearSelection: () => void;
}

export const useSchedulerSelectionStore = create<SchedulerSelectionState>((set) => ({
  branchId: null,
  courtId: null,
  courtName: null,
  bookingDate: null,
  startTime: null,
  endTime: null,
  durationMinutes: 0,
  estimatedPrice: null,

  setSelection: ({
    branchId,
    courtId,
    courtName,
    bookingDate,
    startTime,
    endTime,
    durationMinutes = 0,
    estimatedPrice = null,
  }) =>
    set({
      branchId: branchId ?? null,
      courtId,
      courtName: courtName ?? null,
      bookingDate: bookingDate ?? null,
      startTime,
      endTime,
      durationMinutes,
      estimatedPrice,
    }),

  setEstimatedPrice: (estimatedPrice) => set({ estimatedPrice }),

  clearSelection: () =>
    set({
      branchId: null,
      courtId: null,
      courtName: null,
      bookingDate: null,
      startTime: null,
      endTime: null,
      durationMinutes: 0,
      estimatedPrice: null,
    }),
}));


export const schedulerSelectionStore = useSchedulerSelectionStore;
