import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { CustomerSlotItem, CustomerSlotSelection } from '../types/customer-slot';
import { CUSTOMER_SCHEDULER_CONFIG } from '../constants/customer-scheduler.config';

dayjs.extend(customParseFormat);

export interface CustomerGeneratedTimeSlot {
  time: string; // "05:00", "05:30"
  formattedHour: string; // "5:00", "6:00" or empty for half-hours
  isMajorHour: boolean;
  minutesFromStart: number;
}

export class CustomerCourtStatusService {
  /**
   * Convert "HH:mm" to total minutes from 00:00
   */
  public static parseTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0] ?? '0', 10);
    const minutes = parseInt(parts[1] ?? '0', 10);
    return hours * 60 + minutes;
  }

  /**
   * Convert total minutes from 00:00 to "HH:mm"
   */
  public static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Generate array of time slots from START_TIME to END_TIME
   */
  public static generateTimeSlots(
    startTimeStr: string = CUSTOMER_SCHEDULER_CONFIG.START_TIME,
    endTimeStr: string = CUSTOMER_SCHEDULER_CONFIG.END_TIME,
    intervalMinutes: number = CUSTOMER_SCHEDULER_CONFIG.DEFAULT_INTERVAL_MINUTES,
  ): CustomerGeneratedTimeSlot[] {
    const startMinutes = this.parseTimeToMinutes(startTimeStr);
    let endMinutes = this.parseTimeToMinutes(endTimeStr);
    if (endMinutes <= startMinutes) {
      endMinutes = 24 * 60;
    }

    const slots: CustomerGeneratedTimeSlot[] = [];
    let current = startMinutes;

    while (current < endMinutes) {
      const hours = Math.floor(current / 60);
      const minutes = current % 60;
      const isMajorHour = minutes === 0;
      const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const formattedHour = isMajorHour ? `${hours}:00` : '';

      slots.push({
        time,
        formattedHour,
        isMajorHour,
        minutesFromStart: current - startMinutes,
      });

      current += intervalMinutes;
    }

    return slots;
  }

  /**
   * Calculate slot block position in pixels
   */
  public static calculateSlotDimensions(
    startTime: string,
    endTime: string,
    slotWidth: number,
    intervalMinutes: number = CUSTOMER_SCHEDULER_CONFIG.DEFAULT_INTERVAL_MINUTES,
    schedulerStartTime: string = CUSTOMER_SCHEDULER_CONFIG.START_TIME,
  ): { left: number; width: number } {
    const baseStart = this.parseTimeToMinutes(schedulerStartTime);
    const start = this.parseTimeToMinutes(startTime);
    const end = this.parseTimeToMinutes(endTime);

    const minutesOffset = Math.max(0, start - baseStart);
    const durationMinutes = Math.max(intervalMinutes, end - start);

    const pxPerMinute = slotWidth / intervalMinutes;
    const left = minutesOffset * pxPerMinute;
    const width = durationMinutes * pxPerMinute;

    return {
      left: Math.round(left),
      width: Math.max(16, Math.round(width)),
    };
  }

  /**
   * Find if a slot overlaps with any occupied slot for a specific court
   */
  public static findSlotAtTime(
    slots: CustomerSlotItem[],
    courtId: string,
    slotTime: string,
  ): CustomerSlotItem | undefined {
    const targetMinutes = this.parseTimeToMinutes(slotTime);
    return slots.find((s) => {
      if (s.courtId !== courtId) return false;
      const startMin = this.parseTimeToMinutes(s.startTime);
      const endMin = this.parseTimeToMinutes(s.endTime);
      return targetMinutes >= startMin && targetMinutes < endMin;
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
   * Compute consecutive slot range from selected slot array
   */
  public static calculateRangeFromSlots(
    courtId: string,
    courtName: string,
    selectedSlotTimes: string[],
    intervalMinutes: number = CUSTOMER_SCHEDULER_CONFIG.DEFAULT_INTERVAL_MINUTES,
  ): CustomerSlotSelection | null {
    if (selectedSlotTimes.length === 0) return null;

    const sortedMinutes = selectedSlotTimes
      .map((t) => this.parseTimeToMinutes(t))
      .sort((a, b) => a - b);

    const minMinutes = sortedMinutes[0];
    const maxMinutes = sortedMinutes[sortedMinutes.length - 1];

    if (minMinutes === undefined || maxMinutes === undefined) return null;

    const startTime = this.minutesToTime(minMinutes);
    const endTime = this.minutesToTime(maxMinutes + intervalMinutes);
    const durationMinutes = (maxMinutes + intervalMinutes) - minMinutes;

    return {
      courtId,
      courtName,
      startTime,
      endTime,
      selectedSlots: selectedSlotTimes,
      durationMinutes,
    };
  }

  /**
   * Check if a given date string (YYYY-MM-DD) is in the past
   */
  public static isPastDate(dateStr: string): boolean {
    const today = dayjs().startOf('day');
    const target = dayjs(dateStr).startOf('day');
    return target.isBefore(today);
  }

  /**
   * Check if a slot time on a specific date is in the past
   */
  public static isPastSlot(dateStr: string, slotTime: string): boolean {
    if (this.isPastDate(dateStr)) return true;
    if (dayjs(dateStr).isAfter(dayjs(), 'day')) return false;

    const [hours, minutes] = slotTime.split(':').map((v) => parseInt(v, 10));
    if (hours === undefined || minutes === undefined) return false;

    const slotDateTime = dayjs(dateStr).hour(hours).minute(minutes).second(0);
    return slotDateTime.isBefore(dayjs());
  }

  /**
   * Format date into Vietnamese month header: "tháng M năm YYYY" (e.g. "tháng 9 năm 2026")
   */
  public static formatVietnameseMonthHeader(date: dayjs.Dayjs | string): string {
    const d = typeof date === 'string' ? dayjs(date) : date;
    return d.isValid() ? `tháng ${d.month() + 1} năm ${d.year()}` : '';
  }
}
