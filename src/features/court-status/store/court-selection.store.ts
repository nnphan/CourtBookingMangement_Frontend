import { create } from 'zustand';
import i18n from 'i18next';
import type { CourtScheduleItemDto } from '../types/court-status.types';
import type { CourtSelection } from '../utils/time-selection.utils';
import { buildSelectedRange, isSelectableSlot } from '../utils/time-selection.utils';
import type { SelectedBookingCourt } from '@/features/bookings/types/booking.types';

export interface CourtSelectionStore {
  // State
  selectedCourtId: string | null;
  selectedCourtName: string | null;
  /** All selected Courts (primary first). They share `selection`'s date/time range. */
  selectedCourts: SelectedBookingCourt[];
  selectionNotice: string | null;
  selectionStart: string | null;
  selectionEnd: string | null;
  selectedSlots: string[];
  selection: CourtSelection | null;
  isSelecting: boolean;
  hoverSlot: string | null;

  // Actions
  removeCourt: (courtId: string) => void;
  setSelectionNotice: (notice: string | null) => void;
  startSelection: (
    courtId: string,
    courtName: string,
    slot: string,
    timelineHours: string[],
    bookings: CourtScheduleItemDto[],
    date: string,
    courtStatus?: string,
  ) => void;

  updateSelection: (
    courtId: string,
    slot: string,
    timelineHours: string[],
    bookings: CourtScheduleItemDto[],
    date: string,
    courtStatus?: string,
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
    bookings: CourtScheduleItemDto[],
    date: string,
    courtStatus?: string,
  ) => void;
}

export const useCourtSelectionStore = create<CourtSelectionStore>((set, get) => ({
  selectedCourtId: null,
  selectedCourtName: null,
  selectedCourts: [],
  selectionNotice: null,
  selectionStart: null,
  selectionEnd: null,
  selectedSlots: [],
  selection: null,
  isSelecting: false,
  hoverSlot: null,

  setHoverSlot: (slot) => set({ hoverSlot: slot }),

  setSelectionNotice: (notice) => set({ selectionNotice: notice }),

  removeCourt: (courtId) => {
    const { selectedCourts, selection } = get();
    const remaining = selectedCourts.filter((court) => court.courtId !== courtId);
    const primary = remaining[0];
    if (!primary || !selection) {
      get().clearSelection();
      return;
    }
    set({
      selectedCourts: remaining,
      selectedCourtId: primary.courtId,
      selectedCourtName: primary.courtName,
      selection: { ...selection, courtId: primary.courtId, courtName: primary.courtName },
      selectionNotice: null,
    });
  },

  startSelection: (courtId, courtName, slot, timelineHours, bookings, date, courtStatus = 'active') => {
    // Dragging is only for building the range of a single Court; multi-Court uses clicks.
    if (get().selectedCourts.length > 1) return;

    // Edge Case 2: User starts selection on booked/disabled slot -> Nothing happens
    if (!isSelectableSlot(courtId, slot, courtStatus, date, bookings)) {
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
    );

    if (range) {
      set({
        selectedCourtId: courtId,
        selectedCourtName: courtName,
        selectedCourts: [{ courtId, courtName }],
        selectionNotice: null,
        selectionStart: slot,
        selectionEnd: slot,
        selectedSlots: range.selectedSlots,
        selection: range,
        isSelecting: true,
      });
    }
  },

  updateSelection: (courtId, slot, timelineHours, bookings, date, courtStatus = 'active') => {
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
      selectedCourts: [],
      selectionStart: null,
      selectionEnd: null,
      selectedSlots: [],
      selection: null,
      isSelecting: false,
      hoverSlot: null,
    });
  },

  handleClickSlot: (courtId, courtName, slot, timelineHours, bookings, date, courtStatus = 'active') => {
    const { selectedCourtId, selectedSlots, selectionStart, selectedCourts } = get();

    // Multi-Court mode: once a range exists, clicks on other Courts (or any click while more
    // than one Court is selected) toggle Courts within the shared range instead of changing it.
    const multiMode =
      selectedCourts.length > 0 &&
      selectedSlots.length > 0 &&
      (selectedCourts.length > 1 || selectedCourtId !== courtId);
    if (multiMode) {
      const sameTime = i18n.t('booking.multiCourt.sameTimeRequired');
      const isSelected = selectedCourts.some((court) => court.courtId === courtId);
      if (isSelected) {
        get().removeCourt(courtId);
        return;
      }
      const rangeAvailable = selectedSlots.every((s) =>
        isSelectableSlot(courtId, s, courtStatus, date, bookings),
      );
      if (!selectedSlots.includes(slot) || !rangeAvailable) {
        set({ selectionNotice: sameTime });
        return;
      }
      set({ selectedCourts: [...selectedCourts, { courtId, courtName }], selectionNotice: null });
      return;
    }

    // Edge Case 2: Cannot select booked or disabled slot
    if (!isSelectableSlot(courtId, slot, courtStatus, date, bookings)) {
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
      );
      if (range) {
        set({
          selectedCourtId: courtId,
          selectedCourtName: courtName,
          selectedCourts: [{ courtId, courtName }],
          selectionNotice: null,
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
    );

    if (range) {
      set({
        selectedCourtId: courtId,
        selectedCourtName: courtName,
        selectedCourts: [{ courtId, courtName }],
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
        selectedCourts: [{ courtId, courtName }],
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
