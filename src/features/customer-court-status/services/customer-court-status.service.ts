import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { CustomerSlotItem, CustomerSlotSelection } from '../types/customer-slot';
import {
  CUSTOMER_SCHEDULER_CONFIG,
  SCHEDULER_CONFIG,
  SLOT_WIDTH,
} from '../constants/customer-scheduler.config';
import {
  type GeneratedTimeSlot,
  parseTimeToMinutes,
  minutesToTime,
  differenceInHours,
  generateTimeSlots,
  calculateBookingWidth,
  calculateSelectedTimeRange,
} from '../utils/time-slot.utils';

dayjs.extend(customParseFormat);

export type CustomerGeneratedTimeSlot = GeneratedTimeSlot;

export class CustomerCourtStatusService {
  /**
   * Convert "HH:mm" to total minutes from 00:00
   */
  public static parseTimeToMinutes(timeStr: string): number {
    return parseTimeToMinutes(timeStr);
  }

  /**
   * Convert total minutes from 00:00 to "HH:mm"
   */
  public static minutesToTime(minutes: number): string {
    return minutesToTime(minutes);
  }

  /**
   * Calculate difference in hours between endTime and startTime
   */
  public static differenceInHours(endTime: string, startTime: string): number {
    return differenceInHours(endTime, startTime);
  }

  /**
   * Generate array of time slots from START_TIME ("05:00") to END_TIME ("23:00")
   * with default 60-minute slot duration (18 cells).
   */
  public static generateTimeSlots(
    startTimeStr: string = SCHEDULER_CONFIG.START_TIME,
    endTimeStr: string = SCHEDULER_CONFIG.END_TIME,
    intervalMinutes: number = SCHEDULER_CONFIG.SLOT_DURATION,
  ): CustomerGeneratedTimeSlot[] {
    return generateTimeSlots(startTimeStr, endTimeStr, intervalMinutes);
  }

  /**
   * Calculate slot block position and width in pixels based on SLOT_DURATION (default 60 minutes)
   */
  public static calculateSlotDimensions(
    startTime: string,
    endTime: string,
    slotWidth: number = SLOT_WIDTH,
    intervalMinutes: number = SCHEDULER_CONFIG.SLOT_DURATION,
    schedulerStartTime: string = SCHEDULER_CONFIG.START_TIME,
  ): { left: number; width: number } {
    const { left, width } = calculateBookingWidth(
      startTime,
      endTime,
      slotWidth,
      intervalMinutes,
      schedulerStartTime,
    );
    return { left, width };
  }

  /**
   * Alias for calculateBookingWidth utility
   */
  public static calculateBookingWidth = calculateBookingWidth;

  /**
   * Find if a slot overlaps with any occupied slot for a specific court
   */
  public static findSlotAtTime(
    slots: CustomerSlotItem[],
    courtId: string,
    slotTime: string,
    slotDuration: number = SCHEDULER_CONFIG.SLOT_DURATION,
  ): CustomerSlotItem | undefined {
    const slotStartMin = this.parseTimeToMinutes(slotTime);
    const slotEndMin = slotStartMin + slotDuration;
    return slots.find((s) => {
      if (s.courtId !== courtId) return false;
      const startMin = this.parseTimeToMinutes(s.startTime);
      const endMin = this.parseTimeToMinutes(s.endTime);
      return Math.max(slotStartMin, startMin) < Math.min(slotEndMin, endMin);
    });
  }

  /**
   * Validate if a selection range on a court is free of occupied slots
   */
  public static isRangeAvailable(
    slots: CustomerSlotItem[],
    courtId: string,
    startTime: string,
    endTime: string,
  ): boolean {
    const rangeStart = this.parseTimeToMinutes(startTime);
    const rangeEnd = this.parseTimeToMinutes(endTime);

    return !slots.some((s) => {
      if (s.courtId !== courtId || s.status === 'AVAILABLE') return false;
      const sStart = this.parseTimeToMinutes(s.startTime);
      const sEnd = this.parseTimeToMinutes(s.endTime);
      // Overlap condition: max(start1, start2) < min(end1, end2)
      return Math.max(rangeStart, sStart) < Math.min(rangeEnd, sEnd);
    });
  }

  /**
   * Calculate duration in minutes between startTime and endTime
   */
  public static calculateDurationMinutes(startTime: string, endTime: string): number {
    const start = this.parseTimeToMinutes(startTime);
    const end = this.parseTimeToMinutes(endTime);
    return Math.max(0, end - start);
  }

  /**
   * Compute consecutive slot range from selected slot array using SLOT_DURATION (60 minutes)
   */
  public static calculateRangeFromSlots(
    courtId: string,
    courtName: string,
    selectedSlotTimes: string[],
    intervalMinutes: number = CUSTOMER_SCHEDULER_CONFIG.SLOT_DURATION,
  ): CustomerSlotSelection | null {
    return calculateSelectedTimeRange(courtId, courtName, selectedSlotTimes, intervalMinutes);
  }

  /**
   * Alias for calculateSelectedTimeRange utility
   */
  public static calculateSelectedTimeRange = calculateSelectedTimeRange;

  /**
   * Check if a given date string (YYYY-MM-DD) is today
   */
  public static isToday(dateStr: string): boolean {
    if (!dateStr) return false;
    const d = dayjs(dateStr);
    return d.isValid() && d.isSame(dayjs(), 'day');
  }

  /**
   * Check if a given date string (YYYY-MM-DD) is in the past (before today 00:00:00)
   */
  public static isPastDate(dateStr: string): boolean {
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
  public static isPastSlot(dateStr: string, slotTime: string): boolean {
    if (!dateStr || !slotTime) return false;
    const now = dayjs();
    const d = dayjs(dateStr);
    if (!d.isValid()) return false;

    if (d.startOf('day').isBefore(now.startOf('day'))) return true;
    if (d.startOf('day').isAfter(now.endOf('day'))) return false;

    const [hours, minutes] = slotTime.split(':').map((v) => parseInt(v, 10));
    if (hours === undefined || minutes === undefined || isNaN(hours) || isNaN(minutes)) return false;

    const slotDateTime = dayjs(dateStr)
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0);

    return slotDateTime.isBefore(now);
  }

  /**
   * Format date into Vietnamese month header: "tháng M năm YYYY" (e.g. "tháng 9 năm 2026")
   */
  public static formatVietnameseMonthHeader(date: dayjs.Dayjs | string): string {
    const d = typeof date === 'string' ? dayjs(date) : date;
    return d.isValid() ? `tháng ${d.month() + 1} năm ${d.year()}` : '';
  }
}
