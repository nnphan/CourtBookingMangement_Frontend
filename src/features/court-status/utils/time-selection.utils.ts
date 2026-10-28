import dayjs from '@/lib/dayjs';
import type { CourtScheduleBlockViewModel } from '../types/court-schedule-block';

export interface CourtSelection {
  courtId: string;
  courtName: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  selectedSlots: string[];
}

/**
 * Parses hour integer from string like '15:00' or '15:00:00'
 */
export const parseHour = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0] ?? '0', 10);
  return Number.isFinite(h) ? h : 0;
};

/**
 * Parses time into total minutes from midnight
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0] ?? '0', 10) || 0;
  const m = parseInt(parts[1] ?? '0', 10) || 0;
  return h * 60 + m;
};

/**
 * Formats hour integer to 'HH:00'
 */
export const formatSlotHour = (hour: number): string => {
  const clamped = Math.max(0, Math.min(24, hour));
  return `${String(clamped).padStart(2, '0')}:00`;
};

/**
 * Ensures 'HH:mm:ss' format for API payloads
 */
export const formatTimeWithSeconds = (timeStr: string): string => {
  if (!timeStr) return '00:00:00';
  const parts = timeStr.trim().split(':');
  const h = String(parts[0] ?? '00').padStart(2, '0');
  const m = String(parts[1] ?? '00').padStart(2, '0');
  const s = String(parts[2] ?? '00').padStart(2, '0');
  return `${h}:${m}:${s}`;
};

/**
 * EndTime should be: LastSelectedSlot + 1 Hour
 * Example: '17:00' -> '18:00'
 */
export const calculateEndTime = (lastSlot: string): string => {
  const hour = parseHour(lastSlot);
  return formatSlotHour(hour + 1);
};

/**
 * Calculate duration in hours between startTime and endTime
 * Example: 15:00 -> 18:00 = 3 hours
 */
export const calculateDuration = (startTime: string, endTime: string): number => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const diffHours = (endMin - startMin) / 60;
  return Math.max(1, Math.round(diffHours));
};

/**
 * Checks if slot is in the past:
 * Rule 1: Selected Date === Today -> Compare slotDateTime < currentDateTime
 * Rule 2: Selected Date > Today -> False (all future slots selectable)
 * Rule 3: Selected Date < Today -> True (all past slots disabled)
 */
export const isPastSlot = (
  date: string,
  slotTime: string,
  referenceNow?: dayjs.Dayjs,
  timezone = 'Asia/Ho_Chi_Minh',
): boolean => {
  if (!date) return false;
  const now = referenceNow || dayjs().tz(timezone);
  const targetDate = dayjs.tz(date, 'YYYY-MM-DD', timezone);

  if (!targetDate.isValid()) return false;

  // Rule 3: Past Date -> All slots disabled
  if (targetDate.isBefore(now, 'day')) {
    return true;
  }

  // Rule 2: Future Date -> All slots selectable
  if (targetDate.isAfter(now, 'day')) {
    return false;
  }

  // Rule 1: Today -> Compare slot time with current time
  // e.g. at 14:37, slot 14:00 is past, 15:00 is selectable
  const hour = parseHour(slotTime);
  const slotDateTime = targetDate.hour(hour).minute(0).second(0).millisecond(0);

  return slotDateTime.isBefore(now, 'minute');
};

/**
 * Checks if court slot is booked in existing schedule items
 */
export const isBookedSlot = (
  courtId: string,
  slotTime: string,
  scheduleItems: CourtScheduleBlockViewModel[],
): boolean => {
  const slotMinutes = timeToMinutes(slotTime);

  return scheduleItems.some((item) => {
    if (item.courtId !== courtId || !item.blocksAvailability) return false;
    const startMin = timeToMinutes(item.startTime);
    const endMin = timeToMinutes(item.endTime);
    return slotMinutes >= startMin && slotMinutes < endMin;
  });
};

/**
 * Checks if a slot can be selected by user (not maintenance, not past, not booked)
 */
export const isSelectableSlot = (
  courtId: string,
  slotTime: string,
  courtStatus: string = 'active',
  date: string,
  scheduleItems: CourtScheduleBlockViewModel[],
  referenceNow?: dayjs.Dayjs,
  timezone = 'Asia/Ho_Chi_Minh',
): boolean => {
  const statusLower = (courtStatus || 'active').trim().toLowerCase();
  if (statusLower !== 'active') return false;
  if (isPastSlot(date, slotTime, referenceNow, timezone)) {
    return false;
  }
  if (isBookedSlot(courtId, slotTime, scheduleItems)) {
    return false;
  }
  return true;
};

/**
 * Builds continuous selection range between startSlot and endSlot.
 * Stops before booked or disabled barrier.
 */
export const buildSelectedRange = (
  courtId: string,
  courtName: string,
  startSlot: string,
  endSlot: string,
  timelineHours: string[],
  scheduleItems: CourtScheduleBlockViewModel[],
  date: string,
  courtStatus: string = 'active',
  referenceNow?: dayjs.Dayjs,
  timezone = 'Asia/Ho_Chi_Minh',
): CourtSelection | null => {
  // Edge Case 2: User starts selection on unselectable slot -> Nothing happens
  if (
    !isSelectableSlot(
      courtId,
      startSlot,
      courtStatus,
      date,
      scheduleItems,
      referenceNow,
      timezone,
    )
  ) {
    return null;
  }

  const startIdx = timelineHours.indexOf(startSlot);
  const endIdx = timelineHours.indexOf(endSlot);

  if (startIdx === -1 || endIdx === -1) return null;

  const selectedSlots: string[] = [];
  const step = startIdx <= endIdx ? 1 : -1;
  let curr = startIdx;

  while (true) {
    const slot = timelineHours[curr];
    if (!slot) break;

    // Edge Case 3: Stop selection before booked or disabled slot
    if (
      !isSelectableSlot(
        courtId,
        slot,
        courtStatus,
        date,
        scheduleItems,
        referenceNow,
        timezone,
      )
    ) {
      break;
    }

    selectedSlots.push(slot);

    if (curr === endIdx) break;
    curr += step;
  }

  if (selectedSlots.length === 0) return null;

  // Sort slots chronologically
  selectedSlots.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  const earliestSlot = selectedSlots[0]!;
  const latestSlot = selectedSlots[selectedSlots.length - 1]!;
  const calculatedEndTime = calculateEndTime(latestSlot);
  const durationHours = calculateDuration(earliestSlot, calculatedEndTime);

  return {
    courtId,
    courtName,
    startTime: earliestSlot,
    endTime: calculatedEndTime,
    durationHours,
    selectedSlots,
  };
};
