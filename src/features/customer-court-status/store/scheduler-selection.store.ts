import { create } from 'zustand';
import { SCHEDULER_CONFIG } from '../constants/customer-scheduler.config';

export interface SchedulerSelectionState {
  selectedCourtId: string | null;
  selectedCourtName: string | null;
  selectedSlots: string[];
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
  isSelecting: boolean;

  // Actions
  setSelection: (selection: {
    selectedCourtId: string;
    selectedCourtName?: string | null;
    selectedSlots: string[];
    startTime: string;
    endTime: string;
    durationMinutes?: number;
  }) => void;
  clearSelection: () => void;
  setIsSelecting: (isSelecting: boolean) => void;
}

export const useSchedulerSelectionStore = create<SchedulerSelectionState>((set) => ({
  selectedCourtId: null,
  selectedCourtName: null,
  selectedSlots: [],
  startTime: null,
  endTime: null,
  durationMinutes: 0,
  isSelecting: false,

  setSelection: ({
    selectedCourtId,
    selectedCourtName,
    selectedSlots,
    startTime,
    endTime,
    durationMinutes,
  }) =>
    set({
      selectedCourtId,
      selectedCourtName: selectedCourtName ?? null,
      selectedSlots,
      startTime,
      endTime,
      durationMinutes: durationMinutes ?? selectedSlots.length * SCHEDULER_CONFIG.SLOT_DURATION,
      isSelecting: false,
    }),

  clearSelection: () =>
    set({
      selectedCourtId: null,
      selectedCourtName: null,
      selectedSlots: [],
      startTime: null,
      endTime: null,
      durationMinutes: 0,
      isSelecting: false,
    }),

  setIsSelecting: (isSelecting: boolean) => set({ isSelecting }),
}));

// Single source of truth export
export const schedulerSelectionStore = useSchedulerSelectionStore;

