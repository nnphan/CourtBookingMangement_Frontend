import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  BOUNDARY_PADDING_PX,
  COURT_COLUMN_WIDTH,
  MAX_SLOT_WIDTH,
  MIN_SLOT_WIDTH,
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
 * Normalize branch openTime and closeTime to whole-hour boundaries (e.g. "05:00" -> "23:00")
 */
export function normalizeOperatingHours(
  openTime: string = SCHEDULER_CONFIG.START_TIME,
  closeTime: string = SCHEDULER_CONFIG.END_TIME,
): { openTime: string; closeTime: string; totalHours: number } {
  const rawOpenMin = parseTimeToMinutes(openTime);
  const rawCloseMin = parseTimeToMinutes(closeTime);

  const openHour = Math.max(0, Math.min(22, Math.floor(rawOpenMin / 60)));
  let closeHour = Math.max(openHour + 1, Math.min(24, Math.floor(rawCloseMin / 60)));
  if (closeHour <= openHour) {
    closeHour = 23;
  }

  return {
    openTime: `${openHour.toString().padStart(2, '0')}:00`,
    closeTime: `${closeHour.toString().padStart(2, '0')}:00`,
    totalHours: closeHour - openHour,
  };
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
 * Calculate adaptive slot width based on container width, operating hours (totalSlots), and zoom level.
 * Clamped between MIN_SLOT_WIDTH (60px) and MAX_SLOT_WIDTH (140px).
 */
export function calculateAdaptiveSlotWidth(params: {
  containerWidth: number;
  totalSlots: number;
  courtColumnWidth?: number;
  boundaryPaddingPx?: number;
  zoomLevel?: number;
  minSlotWidth?: number;
  maxSlotWidth?: number;
}): {
  slotWidth: number;
  availableWidth: number;
  gridWidth: number;
  timelineWidth: number;
} {
  const {
    containerWidth,
    totalSlots,
    courtColumnWidth = COURT_COLUMN_WIDTH,
    boundaryPaddingPx = BOUNDARY_PADDING_PX,
    zoomLevel = 1.0,
    minSlotWidth = MIN_SLOT_WIDTH,
    maxSlotWidth = MAX_SLOT_WIDTH,
  } = params;

  const safeSlots = Math.max(1, totalSlots);
  const availableWidth = Math.max(0, containerWidth - courtColumnWidth - boundaryPaddingPx);

  const rawCalculatedWidth =
    availableWidth > 0 ? (availableWidth / safeSlots) * zoomLevel : minSlotWidth * zoomLevel;

  const slotWidth = Number(
    Math.max(minSlotWidth, Math.min(rawCalculatedWidth, maxSlotWidth)).toFixed(2),
  );

  const gridWidth = Math.round(safeSlots * slotWidth);
  const timelineWidth = gridWidth + boundaryPaddingPx;

  return {
    slotWidth,
    availableWidth,
    gridWidth,
    timelineWidth,
  };
}

/**
 * Compute responsive slot width based on container width and slot count.
 */
export function getResponsiveSlotWidth(
  viewportWidth: number,
  containerWidth: number = 0,
  slotCount: number = 18,
  zoomLevel: number = 1.0,
  courtColumnWidth: number = COURT_COLUMN_WIDTH,
): number {
  const effectiveContainerWidth = containerWidth > 0 ? containerWidth : viewportWidth;
  return calculateAdaptiveSlotWidth({
    containerWidth: effectiveContainerWidth,
    totalSlots: slotCount,
    courtColumnWidth,
    zoomLevel,
  }).slotWidth;
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

/**
 * Check if a given date string (YYYY-MM-DD) is today
 */
export function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = dayjs(dateStr);
  return d.isValid() && d.isSame(dayjs(), 'day');
}

/**
 * Check if a given date string (YYYY-MM-DD) is in the past (before today 00:00:00)
 */
export function isPastDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = dayjs(dateStr);
  if (!d.isValid()) return false;
  return d.startOf('day').isBefore(dayjs().startOf('day'));
}

/**
 * Check if a slot time on a specific date is in the past:
 * - Selected Date Yesterday -> returns true (all disabled)
 * - Selected Date Today -> returns slotDateTime.isBefore(now)
 * - Selected Date Tomorrow -> returns false (all enabled)
 */
export function isPastSlot(selectedDate: string, startTime: string): boolean {
  if (!selectedDate || !startTime) return false;
  const now = dayjs();
  const d = dayjs(selectedDate);
  if (!d.isValid()) return false;

  if (d.startOf('day').isBefore(now.startOf('day'))) return true;
  if (d.startOf('day').isAfter(now.endOf('day'))) return false;

  const [hours, minutes] = startTime.split(':').map((v) => parseInt(v, 10));
  if (hours === undefined || minutes === undefined || isNaN(hours) || isNaN(minutes)) return false;

  const slotDateTime = dayjs(selectedDate)
    .hour(hours)
    .minute(minutes)
    .second(0)
    .millisecond(0);

  return slotDateTime.isBefore(now);
}

