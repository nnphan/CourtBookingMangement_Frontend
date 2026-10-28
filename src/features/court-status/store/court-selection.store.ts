import { create } from 'zustand';
import type { CourtScheduleBlockViewModel } from '../types/court-schedule-block';
import type { CourtSelection } from '../utils/time-selection.utils';
import { buildSelectedRange, isSelectableSlot } from '../utils/time-selection.utils';

export interface CourtSelectionStore {
  // State
  selectedCourtId: string | null;
  selectedCourtName: string | null;
  selectionStart: string | null;
  selectionEnd: string | null;
  selectedSlots: string[];
  selection: CourtSelection | null;
  isSelecting: boolean;
  hoverSlot: string | null;

  // Actions
  startSelection: (
    courtId: string,
    courtName: string,
    slot: string,
    timelineHours: string[],
    bookings: CourtScheduleBlockViewModel[],
    date: string,
    courtStatus?: string,
    timezone?: string,
  ) => void;

  updateSelection: (
    courtId: string,
    slot: string,
    timelineHours: string[],
    bookings: CourtScheduleBlockViewModel[],
    date: string,
    courtStatus?: string,
    timezone?: string,
  ) => void;

  completeSelection: () => void;
  clearSelection: () => void;
  setHoverSlot: (slot: string | null) => void;

  /**
   * Supports Click Start Slot -> Click End Slot
   * Edge Case 1: Clicking selected range clears selection
   */
  handleClickSlot: (
    courtId: string,
    courtName: string,
    slot: string,
    timelineHours: string[],
    bookings: CourtScheduleBlockViewModel[],
    date: string,
    courtStatus?: string,
    timezone?: string,
  ) => void;
}

export const useCourtSelectionStore = create<CourtSelectionStore>((set, get) => ({
  selectedCourtId: null,
  selectedCourtName: null,
  selectionStart: null,
  selectionEnd: null,
  selectedSlots: [],
  selection: null,
  isSelecting: false,
  hoverSlot: null,

  setHoverSlot: (slot) => set({ hoverSlot: slot }),

  startSelection: (
    courtId,
    courtName,
    slot,
    timelineHours,
    bookings,
    date,
    courtStatus = 'active',
    timezone = 'Asia/Ho_Chi_Minh',
  ) => {
    // Edge Case 2: User starts selection on booked/disabled slot -> Nothing happens
    if (!isSelectableSlot(courtId, slot, courtStatus, date, bookings, undefined, timezone)) {
      return;
    }

    const range = buildSelectedRange(
      courtId,
      courtName,
      slot,
      slot,
      timelineHours,
      bookings,
      date,
      courtStatus,
      undefined,
      timezone,
    );

    if (range) {
      set({
        selectedCourtId: courtId,
        selectedCourtName: courtName,
        selectionStart: slot,
        selectionEnd: slot,
        selectedSlots: range.selectedSlots,
        selection: range,
        isSelecting: true,
      });
    }
  },

  updateSelection: (
    courtId,
    slot,
    timelineHours,
    bookings,
    date,
    courtStatus = 'active',
    timezone = 'Asia/Ho_Chi_Minh',
  ) => {
    const { isSelecting, selectedCourtId, selectedCourtName, selectionStart } = get();

    // Rule 1: Selection must remain inside the same court
    if (!isSelecting || selectedCourtId !== courtId || !selectionStart || !selectedCourtName) {
      return;
    }

    // Edge Case 3: Stop selection before booked or disabled slot
    const range = buildSelectedRange(
      courtId,
      selectedCourtName,
      selectionStart,
      slot,
      timelineHours,
      bookings,
      date,
      courtStatus,
      undefined,
      timezone,
    );

    if (range) {
      set({
        selectionEnd: slot,
        selectedSlots: range.selectedSlots,
        selection: range,
      });
    }
  },

  completeSelection: () => {
    set({ isSelecting: false, hoverSlot: null });
  },

  clearSelection: () => {
    set({
      selectedCourtId: null,
      selectedCourtName: null,
      selectionStart: null,
      selectionEnd: null,
      selectedSlots: [],
      selection: null,
      isSelecting: false,
      hoverSlot: null,
    });
  },

  handleClickSlot: (
    courtId,
    courtName,
    slot,
    timelineHours,
    bookings,
    date,
    courtStatus = 'active',
    timezone = 'Asia/Ho_Chi_Minh',
  ) => {
    const { selectedCourtId, selectedSlots, selectionStart } = get();

    // Edge Case 2: Cannot select booked or disabled slot
    if (!isSelectableSlot(courtId, slot, courtStatus, date, bookings, undefined, timezone)) {
      return;
    }

    // Edge Case 1: User clicks on an already selected slot -> Clear selection
    if (selectedCourtId === courtId && selectedSlots.includes(slot)) {
      get().clearSelection();
      return;
    }

    // If no previous selection or clicked on a different court -> Start new single-slot selection
    if (!selectedCourtId || selectedCourtId !== courtId || !selectionStart) {
      const range = buildSelectedRange(
        courtId,
        courtName,
        slot,
        slot,
        timelineHours,
        bookings,
        date,
        courtStatus,
        undefined,
        timezone,
      );
      if (range) {
        set({
          selectedCourtId: courtId,
          selectedCourtName: courtName,
          selectionStart: slot,
          selectionEnd: slot,
          selectedSlots: range.selectedSlots,
          selection: range,
          isSelecting: false,
        });
      }
      return;
    }

    // Clicked second slot on same court -> Continuous range auto-selected (Click Start -> Click End)
    const range = buildSelectedRange(
      courtId,
      courtName,
      selectionStart,
      slot,
      timelineHours,
      bookings,
      date,
      courtStatus,
      undefined,
      timezone,
    );

    if (range) {
      set({
        selectedCourtId: courtId,
        selectedCourtName: courtName,
        selectionEnd: slot,
        selectedSlots: range.selectedSlots,
        selection: range,
        isSelecting: false,
      });
    } else {
      // Fallback: reset to this clicked slot
      const single = buildSelectedRange(
        courtId,
        courtName,
        slot,
        slot,
        timelineHours,
        bookings,
        date,
        courtStatus,
      );
      set({
        selectedCourtId: courtId,
        selectedCourtName: courtName,
        selectionStart: slot,
        selectionEnd: slot,
        selectedSlots: single?.selectedSlots || [slot],
        selection: single,
        isSelecting: false,
      });
    }
  },
}));

export const courtSelectionStore = useCourtSelectionStore;
