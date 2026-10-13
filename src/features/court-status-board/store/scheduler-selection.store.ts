import { create } from 'zustand';

export interface SchedulerSelectionState {
  branchId: string | null;
  courtId: string | null;
  courtName: string | null;
  bookingDate: string | null;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;

  // Actions
  setSelection: (selection: {
    branchId?: string | null;
    courtId: string;
    courtName?: string | null;
    bookingDate?: string | null;
    startTime: string;
    endTime: string;
    durationMinutes?: number;
  }) => void;
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

  setSelection: ({
    branchId,
    courtId,
    courtName,
    bookingDate,
    startTime,
    endTime,
    durationMinutes = 0,
  }) =>
    set({
      branchId: branchId ?? null,
      courtId,
      courtName: courtName ?? null,
      bookingDate: bookingDate ?? null,
      startTime,
      endTime,
      durationMinutes,
    }),

  clearSelection: () =>
    set({
      branchId: null,
      courtId: null,
      courtName: null,
      bookingDate: null,
      startTime: null,
      endTime: null,
      durationMinutes: 0,
    }),
}));

export const schedulerSelectionStore = useSchedulerSelectionStore;
