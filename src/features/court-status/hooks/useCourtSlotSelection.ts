import { useCallback, useMemo, useState } from 'react';
import {
  type SelectedCourtSlot,
  type NormalizedBookingRange,
  getSlotKey,
  normalizeTime,
  computeSlotEndTime,
  toggleSlotInSelection,
  removeRangeFromSlots,
  removeCourtFromSlots,
  isSlotInSelection,
  mergeContiguousSlotsByCourtAndDate,
} from '../utils/court-slot-selection.utils';

export interface UseCourtSlotSelectionOptions {
  initialSlots?: SelectedCourtSlot[];
  defaultSlotDurationMinutes?: number;
}

export interface UseCourtSlotSelectionReturn {
  /** Array of individual selected atomic slots (the true source of truth) */
  selectedSlots: SelectedCourtSlot[];
  /** Set of keys for O(1) cell lookup in timeline rendering */
  selectedSlotKeys: Set<string>;
  /** Contiguous slots grouped & merged per court and date into clean booking ranges */
  normalizedRanges: NormalizedBookingRange[];
  /** Total duration in hours across all selected ranges */
  totalDurationHours: number;
  /** Number of unique courts with selected slots */
  totalCourtCount: number;
  /** Total count of atomic selected slots */
  totalSlotCount: number;
  /** Whether any slot is currently selected */
  hasSelection: boolean;
  /** Toggle an atomic slot (select if unselected, deselect if already selected) */
  toggleSlot: (slot: {
    courtId: string;
    courtName: string;
    bookingDate: string;
    startTime: string;
    endTime?: string;
    price?: number;
  }) => void;
  /** Remove a specific slot by court, date, and startTime */
  removeSlot: (courtId: string, bookingDate: string, startTime: string) => void;
  /** Remove all slots belonging to a normalized booking range */
  removeRange: (range: NormalizedBookingRange) => void;
  /** Remove all slots belonging to a specific court */
  removeCourt: (courtId: string) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Replace entire selection directly */
  setSelection: (slots: SelectedCourtSlot[]) => void;
  /** Check if a specific slot is selected */
  isSelected: (courtId: string, bookingDate: string, startTime: string) => boolean;
}

/**
 * Headless React hook for managing independent multi-court, multi-time-slot selection.
 *
 * Guarantees:
 * 1. Independent courts: Selecting on Court B never alters Court A.
 * 2. Independent ranges: Multiple non-contiguous ranges on the same court coexist seamlessly.
 * 3. Atomic toggle: Clicking an available slot selects it; clicking a selected slot deselects it.
 * 4. Automatic normalization: Contiguous adjacent slots merge into contiguous ranges for summary and booking API.
 * 5. High performance: Uses Set of slot keys for O(1) cell highlight checks.
 */
export const useCourtSlotSelection = (
  options?: UseCourtSlotSelectionOptions,
): UseCourtSlotSelectionReturn => {
  const defaultDuration = options?.defaultSlotDurationMinutes ?? 60;
  const [selectedSlots, setSelectedSlots] = useState<SelectedCourtSlot[]>(
    () => options?.initialSlots ?? [],
  );

  // Set of slot keys for O(1) checks
  const selectedSlotKeys = useMemo(() => {
    const set = new Set<string>();
    for (const s of selectedSlots) {
      set.add(getSlotKey(s));
      // Also index with short key without endTime for convenience: "courtId:date:startTime"
      set.add(`${s.courtId}:${s.bookingDate}:${normalizeTime(s.startTime)}`);
    }
    return set;
  }, [selectedSlots]);

  // Normalized continuous ranges per court & date
  const normalizedRanges = useMemo(() => {
    return mergeContiguousSlotsByCourtAndDate(selectedSlots);
  }, [selectedSlots]);

  // Derived metrics
  const totalDurationHours = useMemo(() => {
    return normalizedRanges.reduce((sum, r) => sum + r.durationHours, 0);
  }, [normalizedRanges]);

  const totalCourtCount = useMemo(() => {
    return new Set(selectedSlots.map((s) => s.courtId)).size;
  }, [selectedSlots]);

  const totalSlotCount = selectedSlots.length;
  const hasSelection = selectedSlots.length > 0;

  // Toggle slot action
  const toggleSlot = useCallback(
    (slot: {
      courtId: string;
      courtName: string;
      bookingDate: string;
      startTime: string;
      endTime?: string;
      price?: number;
    }) => {
      const calculatedEnd =
        slot.endTime && slot.endTime.trim().length > 0
          ? slot.endTime
          : computeSlotEndTime(slot.startTime, defaultDuration);

      const target: SelectedCourtSlot = {
        courtId: slot.courtId,
        courtName: slot.courtName,
        bookingDate: slot.bookingDate,
        startTime: normalizeTime(slot.startTime),
        endTime: normalizeTime(calculatedEnd),
        price: slot.price,
      };

      setSelectedSlots((prev) => toggleSlotInSelection(prev, target));
    },
    [defaultDuration],
  );

  const removeSlot = useCallback(
    (courtId: string, bookingDate: string, startTime: string) => {
      const normalizedStart = normalizeTime(startTime);
      setSelectedSlots((prev) =>
        prev.filter(
          (s) =>
            !(
              s.courtId === courtId &&
              s.bookingDate === bookingDate &&
              normalizeTime(s.startTime) === normalizedStart
            ),
        ),
      );
    },
    [],
  );

  const removeRange = useCallback((range: NormalizedBookingRange) => {
    setSelectedSlots((prev) => removeRangeFromSlots(prev, range));
  }, []);

  const removeCourt = useCallback((courtId: string) => {
    setSelectedSlots((prev) => removeCourtFromSlots(prev, courtId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSlots([]);
  }, []);

  const setSelection = useCallback((slots: SelectedCourtSlot[]) => {
    setSelectedSlots(slots);
  }, []);

  const isSelected = useCallback(
    (courtId: string, bookingDate: string, startTime: string): boolean => {
      const key = `${courtId}:${bookingDate}:${normalizeTime(startTime)}`;
      return selectedSlotKeys.has(key);
    },
    [selectedSlotKeys],
  );

  return {
    selectedSlots,
    selectedSlotKeys,
    normalizedRanges,
    totalDurationHours,
    totalCourtCount,
    totalSlotCount,
    hasSelection,
    toggleSlot,
    removeSlot,
    removeRange,
    removeCourt,
    clearSelection,
    setSelection,
    isSelected,
  };
};

export default useCourtSlotSelection;

