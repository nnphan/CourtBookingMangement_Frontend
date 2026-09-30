import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  COURT_COLUMN_WIDTH,
  RESPONSIVE_SLOT_WIDTH,
  SCHEDULER_CONFIG,
  SLOT_WIDTH,
} from '../constants/customer-scheduler.config';
import type { CustomerSlotSelection } from '../types/customer-slot';

dayjs.extend(customParseFormat);

export interface GeneratedTimeSlot {
  time: string; // "05:00", "06:00"
  endTime: string; // "06:00", "07:00"
  formattedTime: string; // "05:00", "06:00"
  formattedHour: string; // "05:00", "06:00"
  isMajorHour: boolean;
  slotIndex: number;
  minutesFromStart: number;
}

/**
 * Convert "HH:mm" to total minutes from 00:00
 */
export function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0] ?? '0', 10);
  const minutes = parseInt(parts[1] ?? '0', 10);
  return hours * 60 + minutes;
}

/**
 * Convert total minutes from 00:00 to "HH:mm"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate difference in hours between endTime and startTime
 */
export function differenceInHours(endTime: string, startTime: string): number {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  return Math.max(0, (endMinutes - startMinutes) / 60);
}

/**
 * Compute responsive slot width based on viewport width and available container width:
 * - Desktop (>= 1280px): 100px per slot
 * - Tablet (768px - 1279px): 90px per slot
 * - Mobile (< 768px): 80px per slot
 * Expands dynamically if the container is wider than total slots width so 100% width is used.
 */
export function getResponsiveSlotWidth(
  viewportWidth: number,
  containerWidth: number = 0,
  slotCount: number = 18,
  zoomLevel: number = 1.0,
  courtColumnWidth: number = COURT_COLUMN_WIDTH,
): number {
  let baseWidth: number = RESPONSIVE_SLOT_WIDTH.DESKTOP;
  if (viewportWidth < 768) {
    baseWidth = RESPONSIVE_SLOT_WIDTH.MOBILE;
  } else if (viewportWidth < 1280) {
    baseWidth = RESPONSIVE_SLOT_WIDTH.TABLET;
  }

  const zoomedWidth = Math.max(80, Math.min(160, Math.round(baseWidth * zoomLevel)));

  if (containerWidth > courtColumnWidth && slotCount > 0) {
    const availableGridWidth = containerWidth - courtColumnWidth;
    const expandedSlotWidth = Math.floor(availableGridWidth / slotCount);
    return Math.max(zoomedWidth, expandedSlotWidth);
  }

  return zoomedWidth;
}

/**
 * Calculate current time red line indicator X position in pixels
 */
export function calculateCurrentTimeOffset(
  slotWidth: number = SLOT_WIDTH,
  slotDuration: number = SCHEDULER_CONFIG.SLOT_DURATION,
  schedulerStartTime: string = SCHEDULER_CONFIG.START_TIME,
  schedulerEndTime: string = SCHEDULER_CONFIG.END_TIME,
): { offsetPx: number; currentTimeLabel: string; isWithinHours: boolean } {
  const now = dayjs();
  const currentMinutes = now.hour() * 60 + now.minute();
  const startMinutes = parseTimeToMinutes(schedulerStartTime);
  const endMinutes = parseTimeToMinutes(schedulerEndTime);

  const isWithinHours = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  const clampedMinutes = Math.max(startMinutes, Math.min(endMinutes, currentMinutes));
  const safeDuration = slotDuration > 0 ? slotDuration : SCHEDULER_CONFIG.SLOT_DURATION;
  const offsetPx = Math.round(((clampedMinutes - startMinutes) / safeDuration) * slotWidth);

  return {
    offsetPx,
    currentTimeLabel: now.format('HH:mm'),
    isWithinHours,
  };
}

/**
 * Generate time slots between startTime and endTime based on slotDuration (default 60 minutes).
 * Example: generateTimeSlots("05:00", "23:00", 60) -> 18 slots ("05:00" .. "22:00", each representing 1 hour)
 */
export function generateTimeSlots(
  startTimeStr: string = SCHEDULER_CONFIG.START_TIME,
  endTimeStr: string = SCHEDULER_CONFIG.END_TIME,
  slotDuration: number = SCHEDULER_CONFIG.SLOT_DURATION,
): GeneratedTimeSlot[] {
  const startMinutes = parseTimeToMinutes(startTimeStr);
  let endMinutes = parseTimeToMinutes(endTimeStr);
  if (endMinutes <= startMinutes) {
    endMinutes = 23 * 60;
  }

  const safeDuration = slotDuration > 0 ? slotDuration : SCHEDULER_CONFIG.SLOT_DURATION;
  const slots: GeneratedTimeSlot[] = [];
  let current = startMinutes;
  let slotIndex = 0;

  while (current < endMinutes) {
    const hours = Math.floor(current / 60);
    const minutes = current % 60;
    const isMajorHour = minutes === 0;
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const slotEndTime = minutesToTime(Math.min(endMinutes, current + safeDuration));
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const formattedHour = isMajorHour ? formattedTime : '';

    slots.push({
      time,
      endTime: slotEndTime,
      formattedTime,
      formattedHour,
      isMajorHour,
      slotIndex,
      minutesFromStart: current - startMinutes,
    });

    current += safeDuration;
    slotIndex++;
  }

  return slots;
}

/**
 * Calculate booking block left offset and width in pixels based on SLOT_DURATION.
 * Example (SLOT_DURATION = 60):
 * - 14:00 -> 15:00 = 1 cell (1 * slotWidth)
 * - 14:00 -> 16:00 = 2 cells (2 * slotWidth)
 * - 14:00 -> 17:00 = 3 cells (3 * slotWidth)
 */
export function calculateBookingWidth(
  startTime: string,
  endTime: string,
  slotWidth: number = SLOT_WIDTH,
  slotDuration: number = SCHEDULER_CONFIG.SLOT_DURATION,
  schedulerStartTime: string = SCHEDULER_CONFIG.START_TIME,
): { left: number; width: number; durationHours: number; cellsSpanned: number } {
  const baseStart = parseTimeToMinutes(schedulerStartTime);
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  const safeDuration = slotDuration > 0 ? slotDuration : SCHEDULER_CONFIG.SLOT_DURATION;
  const minutesOffset = Math.max(0, start - baseStart);
  const durationMinutes = Math.max(safeDuration, end - start);
  const durationHours = differenceInHours(endTime, startTime);
  const cellsSpanned = durationMinutes / safeDuration;

  const pxPerMinute = slotWidth / safeDuration;
  const left = minutesOffset * pxPerMinute;
  const width = durationMinutes * pxPerMinute;

  return {
    left: Math.round(left),
    width: Math.max(16, Math.round(width)),
    durationHours,
    cellsSpanned,
  };
}

/**
 * Calculate consecutive selected time range from selected slot array based on SLOT_DURATION (default 60 minutes).
 */
export function calculateSelectedTimeRange(
  courtId: string,
  courtName: string,
  selectedSlotTimes: string[],
  slotDuration: number = SCHEDULER_CONFIG.SLOT_DURATION,
): CustomerSlotSelection | null {
  if (selectedSlotTimes.length === 0) return null;

  const safeDuration = slotDuration > 0 ? slotDuration : SCHEDULER_CONFIG.SLOT_DURATION;
  const sortedMinutes = selectedSlotTimes
    .map((t) => parseTimeToMinutes(t))
    .sort((a, b) => a - b);

  const minMinutes = sortedMinutes[0];
  const maxMinutes = sortedMinutes[sortedMinutes.length - 1];

  if (minMinutes === undefined || maxMinutes === undefined) return null;

  const startTime = minutesToTime(minMinutes);
  const endTime = minutesToTime(maxMinutes + safeDuration);
  const durationMinutes = maxMinutes + safeDuration - minMinutes;
  const normalizedSlots = sortedMinutes.map((m) => minutesToTime(m));

  return {
    courtId,
    courtName,
    startTime,
    endTime,
    selectedSlots: normalizedSlots,
    durationMinutes,
  };
}

