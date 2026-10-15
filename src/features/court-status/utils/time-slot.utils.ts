import dayjs from '@/lib/dayjs';
import type { CourtScheduleItemDto } from '../types/court-status.types';
import { parseHourMinute, timeToMinutes } from './timeline.utils';

export interface CourtSelection {
  courtId: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  selectedSlots: string[];
  durationHours: number;
}

/**
 * Rule 1: Selected Date === Today -> Compare slotDateTime < currentDateTime
 * Rule 2: Selected Date > Today -> All future slots selectable (return false)
 * Rule 3: Selected Date < Today -> All past slots disabled (return true)
 */
export const isPastTimeSlot = (
  selectedDate: string,
  slotTime: string,
  referenceNow?: dayjs.Dayjs,
): boolean => {
  if (!selectedDate) return false;
  const now = referenceNow || dayjs();
  const targetDate = dayjs(selectedDate);

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
  // e.g. at 14:37, slot 14:00 is in the past, slot 15:00 is in the future
  const { hour, minute } = parseHourMinute(slotTime);
  const slotDateTime = targetDate.hour(hour).minute(minute).second(0).millisecond(0);

  return slotDateTime.isBefore(now, 'minute');
};

/**
 * Checks if a time slot is occupied by an existing booking for the given court
 */
export const isBookedTimeSlot = (
  courtId: string,
  slotTime: string,
  scheduleItems: CourtScheduleItemDto[],
): boolean => {
  const slotMinutes = timeToMinutes(slotTime);

  return scheduleItems.some((item) => {
    if (item.courtId !== courtId) return false;
    const startMin = timeToMinutes(item.startTime);
    const endMin = timeToMinutes(item.endTime);
    return slotMinutes >= startMin && slotMinutes < endMin;
  });
};

/**
 * Checks if a time slot is part of the current active selection
 */
export const isSelectedTimeSlot = (
  courtId: string,
  slotTime: string,
  selection: CourtSelection | null,
): boolean => {
  if (!selection || selection.courtId !== courtId) return false;
  return selection.selectedSlots.includes(slotTime);
};

/**
 * Calculates next hour for a given slot time (e.g. 10:00 -> 11:00)
 */
export const getSlotEndTime = (slotTime: string): string => {
  const { hour } = parseHourMinute(slotTime);
  const nextHour = Math.min(24, hour + 1);
  return `${String(nextHour).padStart(2, '0')}:00`;
};

/**
 * Builds continuous selection range between startSlot and endSlot on a court.
 * Clamps or rejects if any slot in the range is booked or disabled.
 */
export const buildSelectedRange = (
  courtId: string,
  courtName: string,
  date: string,
  startSlot: string,
  endSlot: string,
  timelineHours: string[],
  scheduleItems: CourtScheduleItemDto[],
  referenceNow?: dayjs.Dayjs,
): CourtSelection | null => {
  const startIdx = timelineHours.indexOf(startSlot);
  const endIdx = timelineHours.indexOf(endSlot);

  if (startIdx === -1 || endIdx === -1) return null;

  const selectedSlots: string[] = [];

  // Determine direction: start from startIdx expanding towards endIdx
  const step = startIdx <= endIdx ? 1 : -1;
  let curr = startIdx;

  while (true) {
    const slot = timelineHours[curr];
    if (!slot) break;

    // Check if slot is disabled (past) or booked
    const isPast = isPastTimeSlot(date, slot, referenceNow);
    const isBooked = isBookedTimeSlot(courtId, slot, scheduleItems);

    if (isPast || isBooked) {
      // Barrier hit! Cannot expand across booked or disabled slots
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
  const finalEndTime = getSlotEndTime(latestSlot);

  return {
    courtId,
    courtName,
    date,
    startTime: earliestSlot,
    endTime: finalEndTime,
    selectedSlots,
    durationHours: selectedSlots.length,
  };
};
