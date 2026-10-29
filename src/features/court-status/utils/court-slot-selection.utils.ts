export interface SelectedCourtSlot {
  courtId: string;
  courtName: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss or HH:mm
  endTime: string; // HH:mm:ss or HH:mm
  price?: number;
}

export interface NormalizedBookingRange {
  courtId: string;
  courtName: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  durationHours: number;
  slots: SelectedCourtSlot[];
  slotKeys: string[];
}

/**
 * Normalizes time string to standard "HH:mm:ss" format.
 * Examples: "9:00" -> "09:00:00", "09:00" -> "09:00:00", "09:00:00" -> "09:00:00".
 */
export const normalizeTime = (timeStr?: string | null): string => {
  if (!timeStr) return '00:00:00';
  const trimmed = timeStr.trim();
  const parts = trimmed.split(':');
  const h = String(parts[0] ?? '0').padStart(2, '0');
  const m = String(parts[1] ?? '0').padStart(2, '0');
  const s = String(parts[2] ?? '0').padStart(2, '0');
  return `${h}:${m}:${s}`;
};

/**
 * Formats time string to user-friendly "HH:mm" display format.
 */
export const displayTime = (timeStr?: string | null): string => {
  if (!timeStr) return '';
  const normalized = normalizeTime(timeStr);
  return normalized.slice(0, 5);
};

/**
 * Parses time string ("HH:mm" or "HH:mm:ss") into total minutes from midnight.
 */
export const timeToMinutes = (timeStr?: string | null): number => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = Number.parseInt(parts[0] ?? '0', 10);
  const m = Number.parseInt(parts[1] ?? '0', 10);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

/**
 * Converts total minutes from midnight to "HH:mm:ss" or "HH:mm".
 */
export const minutesToTime = (totalMinutes: number, withSeconds = true): string => {
  const clamped = Math.max(0, Math.min(24 * 60, totalMinutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return withSeconds ? `${hh}:${mm}:00` : `${hh}:${mm}`;
};

/**
 * Computes an atomic slot's end time given start time and duration in minutes.
 */
export const computeSlotEndTime = (startTime: string, durationMinutes = 60): string => {
  const startMin = timeToMinutes(startTime);
  return minutesToTime(startMin + durationMinutes, true);
};

/**
 * Stable unique identifier for an atomic slot.
 * Identity includes courtId, bookingDate, startTime, and endTime.
 */
export const getSlotKey = (
  slot: Pick<SelectedCourtSlot, 'courtId' | 'bookingDate' | 'startTime'> & {
    endTime?: string;
  },
): string => {
  const normalizedStart = normalizeTime(slot.startTime);
  const normalizedEnd = slot.endTime ? normalizeTime(slot.endTime) : '';
  return normalizedEnd
    ? `${slot.courtId}:${slot.bookingDate}:${normalizedStart}:${normalizedEnd}`
    : `${slot.courtId}:${slot.bookingDate}:${normalizedStart}`;
};

/**
 * Half-open interval overlap check: [a.start, a.end) overlaps [b.start, b.end).
 * Adjacent intervals e.g. 09:00-10:00 and 10:00-11:00 do NOT overlap.
 */
export const rangesOverlap = (
  a: { startTime: string; endTime: string },
  b: { startTime: string; endTime: string },
): boolean =>
  timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
  timeToMinutes(b.startTime) < timeToMinutes(a.endTime);

/**
 * Pure function: Toggles an atomic slot in the selected list.
 * If present -> removes it.
 * If absent -> adds it with normalized time strings.
 */
export const toggleSlotInSelection = (
  currentSlots: readonly SelectedCourtSlot[],
  slotToToggle: SelectedCourtSlot,
): SelectedCourtSlot[] => {
  const normalizedSlot: SelectedCourtSlot = {
    ...slotToToggle,
    startTime: normalizeTime(slotToToggle.startTime),
    endTime: normalizeTime(slotToToggle.endTime),
  };
  const key = getSlotKey(normalizedSlot);
  const exists = currentSlots.some((s) => getSlotKey(s) === key);

  if (exists) {
    return currentSlots.filter((s) => getSlotKey(s) !== key);
  }
  return [...currentSlots, normalizedSlot];
};

/**
 * Pure function: Removes an entire normalized range by removing all its underlying slots.
 */
export const removeRangeFromSlots = (
  currentSlots: readonly SelectedCourtSlot[],
  range: Pick<NormalizedBookingRange, 'courtId' | 'bookingDate' | 'startTime' | 'endTime'>,
): SelectedCourtSlot[] => {
  const rangeStart = timeToMinutes(range.startTime);
  const rangeEnd = timeToMinutes(range.endTime);

  return currentSlots.filter((s) => {
    if (s.courtId !== range.courtId || s.bookingDate !== range.bookingDate) {
      return true;
    }
    const slotStart = timeToMinutes(s.startTime);
    const slotEnd = timeToMinutes(s.endTime);
    // Remove if slot is within the range [rangeStart, rangeEnd]
    const isWithin = slotStart >= rangeStart && slotEnd <= rangeEnd;
    return !isWithin;
  });
};

/**
 * Pure function: Removes all selected slots belonging to a specific court.
 */
export const removeCourtFromSlots = (
  currentSlots: readonly SelectedCourtSlot[],
  courtId: string,
): SelectedCourtSlot[] => currentSlots.filter((s) => s.courtId !== courtId);

/**
 * Checks if a specific slot on a court, date, and start time is currently selected.
 */
export const isSlotInSelection = (
  currentSlots: readonly SelectedCourtSlot[],
  courtId: string,
  bookingDate: string,
  startTime: string,
): boolean => {
  const normalizedStart = normalizeTime(startTime);
  return currentSlots.some(
    (s) =>
      s.courtId === courtId &&
      s.bookingDate === bookingDate &&
      normalizeTime(s.startTime) === normalizedStart,
  );
};

/**
 * Groups and merges contiguous atomic slots per court and bookingDate.
 *
 * Rules:
 * 1. Group by courtId + bookingDate.
 * 2. Sort by numeric start time.
 * 3. Merge only when next slot starts exactly when current ends.
 * 4. Gapped slots remain separate ranges.
 * 5. Different courts remain separate ranges.
 * 6. Different dates remain separate ranges.
 * 7. Duplicate slots are deduplicated.
 * 8. Return deterministic ordering (by bookingDate, startTime, courtName).
 */
export const mergeContiguousSlotsByCourtAndDate = (
  selectedSlots: readonly SelectedCourtSlot[],
): NormalizedBookingRange[] => {
  if (!selectedSlots || selectedSlots.length === 0) {
    return [];
  }

  // 1. Deduplicate by unique slot key & normalize times
  const uniqueMap = new Map<string, SelectedCourtSlot>();
  for (const rawSlot of selectedSlots) {
    if (!rawSlot || !rawSlot.courtId || !rawSlot.bookingDate || !rawSlot.startTime) {
      continue;
    }
    const normalized: SelectedCourtSlot = {
      ...rawSlot,
      startTime: normalizeTime(rawSlot.startTime),
      endTime: rawSlot.endTime
        ? normalizeTime(rawSlot.endTime)
        : computeSlotEndTime(rawSlot.startTime),
    };
    const key = getSlotKey(normalized);
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, normalized);
    }
  }

  // 2. Group slots by `courtId:::bookingDate`
  const groups = new Map<string, SelectedCourtSlot[]>();
  for (const slot of uniqueMap.values()) {
    const groupKey = `${slot.courtId}:::${slot.bookingDate}`;
    const list = groups.get(groupKey);
    if (list) {
      list.push(slot);
    } else {
      groups.set(groupKey, [slot]);
    }
  }

  const normalizedRanges: NormalizedBookingRange[] = [];

  // 3. For each group, sort by startTime and merge adjacent contiguous intervals
  for (const groupSlots of groups.values()) {
    if (groupSlots.length === 0) continue;

    groupSlots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    let currentRange: NormalizedBookingRange | null = null;

    for (const slot of groupSlots) {
      const slotStartMin = timeToMinutes(slot.startTime);
      const slotEndMin = timeToMinutes(slot.endTime);

      if (!currentRange) {
        currentRange = {
          courtId: slot.courtId,
          courtName: slot.courtName,
          bookingDate: slot.bookingDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          durationHours: (slotEndMin - slotStartMin) / 60,
          slots: [slot],
          slotKeys: [getSlotKey(slot)],
        };
        continue;
      }

      const currentEndMin = timeToMinutes(currentRange.endTime);

      // Contiguous merge rule: slot starts exactly when currentRange ends
      if (slotStartMin === currentEndMin) {
        currentRange.endTime = slot.endTime;
        currentRange.durationHours = (slotEndMin - timeToMinutes(currentRange.startTime)) / 60;
        currentRange.slots.push(slot);
        currentRange.slotKeys.push(getSlotKey(slot));
      } else if (slotStartMin > currentEndMin) {
        // Gap detected: commit currentRange and start a new range
        normalizedRanges.push(currentRange);
        currentRange = {
          courtId: slot.courtId,
          courtName: slot.courtName,
          bookingDate: slot.bookingDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          durationHours: (slotEndMin - slotStartMin) / 60,
          slots: [slot],
          slotKeys: [getSlotKey(slot)],
        };
      } else {
        // Overlap or duplicate: if it extends past currentEndMin, extend it, but don't duplicate keys
        if (slotEndMin > currentEndMin) {
          currentRange.endTime = slot.endTime;
          currentRange.durationHours = (slotEndMin - timeToMinutes(currentRange.startTime)) / 60;
        }
        if (!currentRange.slotKeys.includes(getSlotKey(slot))) {
          currentRange.slots.push(slot);
          currentRange.slotKeys.push(getSlotKey(slot));
        }
      }
    }

    if (currentRange) {
      normalizedRanges.push(currentRange);
    }
  }

  // 4. Deterministic sorting: bookingDate -> startTime -> courtName -> courtId
  normalizedRanges.sort((a, b) => {
    if (a.bookingDate !== b.bookingDate) {
      return a.bookingDate.localeCompare(b.bookingDate);
    }
    const startDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    if (startDiff !== 0) return startDiff;
    const nameDiff = (a.courtName || '').localeCompare(b.courtName || '');
    if (nameDiff !== 0) return nameDiff;
    return a.courtId.localeCompare(b.courtId);
  });

  return normalizedRanges;
};
