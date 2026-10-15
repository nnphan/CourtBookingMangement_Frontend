import { create } from 'zustand';
import type { CourtScheduleItemDto } from '../types/court-status.types';
import type { CourtSelection } from '../utils/time-slot.utils';
import { buildSelectedRange } from '../utils/time-slot.utils';

export interface SchedulerSelectionStore {
  selection: CourtSelection | null;
  isDragging: boolean;
  dragCourtId: string | null;
  dragCourtName: string | null;
  dragStartSlot: string | null;

  // Actions
  setSelection: (selection: CourtSelection | null) => void;
  clearSelection: () => void;
  startDrag: (courtId: string, courtName: string, slot: string, date: string) => void;
  updateDrag: (
    courtId: string,
    slot: string,
    timelineHours: string[],
    bookings: CourtScheduleItemDto[],
    date: string,
  ) => void;
  endDrag: () => void;
  toggleOrExtendSlot: (
    courtId: string,
    courtName: string,
    slot: string,
    date: string,
    timelineHours: string[],
    bookings: CourtScheduleItemDto[],
  ) => void;
}

export const useCourtSchedulerSelectionStore = create<SchedulerSelectionStore>((set, get) => ({
  selection: null,
  isDragging: false,
  dragCourtId: null,
  dragCourtName: null,
  dragStartSlot: null,

  setSelection: (selection) => set({ selection }),

  clearSelection: () =>
    set({
      selection: null,
      isDragging: false,
      dragCourtId: null,
      dragCourtName: null,
      dragStartSlot: null,
    }),

  startDrag: (courtId, courtName, slot, date) => {
    const singleRange = buildSelectedRange(
      courtId,
      courtName,
      date,
      slot,
      slot,
      [slot],
      [],
    );

    set({
      isDragging: true,
      dragCourtId: courtId,
      dragCourtName: courtName,
      dragStartSlot: slot,
      selection: singleRange,
    });
  },

  updateDrag: (courtId, slot, timelineHours, bookings, date) => {
    const { isDragging, dragCourtId, dragCourtName, dragStartSlot } = get();
    if (!isDragging || dragCourtId !== courtId || !dragStartSlot || !dragCourtName) {
      return;
    }

    const range = buildSelectedRange(
      courtId,
      dragCourtName,
      date,
      dragStartSlot,
      slot,
      timelineHours,
      bookings,
    );

    if (range) {
      set({ selection: range });
    }
  },

  endDrag: () => {
    set({
      isDragging: false,
      dragCourtId: null,
      dragCourtName: null,
      dragStartSlot: null,
    });
  },

  toggleOrExtendSlot: (courtId, courtName, slot, date, timelineHours, bookings) => {
    const { selection } = get();

    // CASE 1: No selection or clicked on another court -> Select single slot
    if (!selection || selection.courtId !== courtId) {
      const range = buildSelectedRange(
        courtId,
        courtName,
        date,
        slot,
        slot,
        timelineHours,
        bookings,
      );
      set({ selection: range });
      return;
    }

    // CASE 2: Clicked on a slot already selected -> If only 1 slot, deselect; otherwise deselect
    if (selection.selectedSlots.length === 1 && selection.selectedSlots[0] === slot) {
      set({ selection: null });
      return;
    }

    // CASE 3: Extend range from current start to this slot
    const range = buildSelectedRange(
      courtId,
      courtName,
      date,
      selection.startTime,
      slot,
      timelineHours,
      bookings,
    );

    if (range) {
      set({ selection: range });
    } else {
      // Fallback: reset to just this slot
      const single = buildSelectedRange(
        courtId,
        courtName,
        date,
        slot,
        slot,
        timelineHours,
        bookings,
      );
      set({ selection: single });
    }
  },
}));

export const schedulerSelectionStore = useCourtSchedulerSelectionStore;
