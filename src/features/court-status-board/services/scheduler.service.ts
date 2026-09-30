import dayjs from 'dayjs';
import type { TimeSlot, SlotSelectionRange } from '../types/common';
import type { BookingItem } from '../types/booking';
import { SCHEDULER_CONFIG } from '../constants/scheduler';

export class SchedulerService {
  /**
   * Parse "HH:mm" or "HH:mm:ss" into total minutes from 00:00
   */
  public static parseTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0] ?? '0', 10);
    const minutes = parseInt(parts[1] ?? '0', 10);
    return hours * 60 + minutes;
  }

  /**
   * Convert total minutes from 00:00 into formatted "HH:mm"
   */
  public static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Generate array of TimeSlot instances based on start time, end time, and slot duration (default 60 minutes)
   */
  public static generateTimeSlots(
    startTimeStr: string = SCHEDULER_CONFIG.START_TIME,
    endTimeStr: string = SCHEDULER_CONFIG.END_TIME,
    intervalMinutes: number = SCHEDULER_CONFIG.SLOT_DURATION,
  ): TimeSlot[] {
    const startMinutes = this.parseTimeToMinutes(startTimeStr);
    let endMinutes = this.parseTimeToMinutes(endTimeStr);
    if (endMinutes <= startMinutes) {
      endMinutes = 23 * 60; // 23:00
    }

    const safeInterval = intervalMinutes > 0 ? intervalMinutes : SCHEDULER_CONFIG.SLOT_DURATION;
    const slots: TimeSlot[] = [];
    let current = startMinutes;
    let slotIndex = 0;

    while (current < endMinutes) {
      const hours = Math.floor(current / 60);
      const minutes = current % 60;
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const time = formattedTime;

      slots.push({
        time,
        formattedTime,
        slotIndex,
        minutesFromStart: current - startMinutes,
      });

      current += safeInterval;
      slotIndex++;
    }

    return slots;
  }

  /**
   * Compute booking position (left and width in px) relative to scheduler grid
   */
  public static calculateBookingDimensions(
    startTime: string,
    endTime: string,
    slotWidth: number,
    intervalMinutes: number = SCHEDULER_CONFIG.SLOT_DURATION,
    schedulerStartTime: string = SCHEDULER_CONFIG.START_TIME,
  ): { left: number; width: number } {
    const baseStartMinutes = this.parseTimeToMinutes(schedulerStartTime);
    const bookingStartMinutes = this.parseTimeToMinutes(startTime);
    const bookingEndMinutes = this.parseTimeToMinutes(endTime);

    const safeInterval = intervalMinutes > 0 ? intervalMinutes : SCHEDULER_CONFIG.SLOT_DURATION;
    const minutesOffset = Math.max(0, bookingStartMinutes - baseStartMinutes);
    const durationMinutes = Math.max(safeInterval, bookingEndMinutes - bookingStartMinutes);

    // Each intervalMinutes corresponds to slotWidth
    const pixelsPerMinute = slotWidth / safeInterval;

    const left = minutesOffset * pixelsPerMinute;
    const width = durationMinutes * pixelsPerMinute;

    return {
      left: Math.round(left),
      width: Math.max(20, Math.round(width)),
    };
  }

  /**
   * Find booking at given time for a court
   */
  public static findBookingAtSlot(
    bookings: BookingItem[],
    courtId: string,
    slotTime: string,
  ): BookingItem | undefined {
    const slotMin = this.parseTimeToMinutes(slotTime);
    return bookings.find((b) => {
      if (b.courtId !== courtId) return false;
      const start = this.parseTimeToMinutes(b.startTime);
      const end = this.parseTimeToMinutes(b.endTime);
      return slotMin >= start && slotMin < end;
    });
  }

  /**
   * Check if a date string (YYYY-MM-DD) is strictly in the past (before today 00:00:00)
   */
  public static isPastDate(selectedDate: string): boolean {
    if (!selectedDate) return false;
    const d = dayjs(selectedDate, 'YYYY-MM-DD');
    if (!d.isValid()) return false;
    return d.isBefore(dayjs().startOf('day'));
  }

  /**
   * Check if a date string (YYYY-MM-DD) is today
   */
  public static isToday(selectedDate: string): boolean {
    if (!selectedDate) return false;
    const d = dayjs(selectedDate, 'YYYY-MM-DD');
    return d.isValid() && d.isSame(dayjs(), 'day');
  }

  /**
   * Check if a specific time slot on a given date is in the past.
   * - If selectedDate is before today: all slots are past -> returns true.
   * - If selectedDate is in the future: returns false.
   * - If selectedDate is today: returns true if slot start time is earlier than current time.
   */
  public static isPastSlot(selectedDate: string, slotTime: string): boolean {
    if (!selectedDate || !slotTime) return false;
    if (this.isPastDate(selectedDate)) return true;

    const d = dayjs(selectedDate, 'YYYY-MM-DD');
    if (!d.isValid()) return false;

    // Future date: all slots are available
    if (d.isAfter(dayjs().endOf('day'))) return false;

    // Selected date is today: compare slot start time with current time
    const parts = slotTime.split(':');
    const hours = parseInt(parts[0] ?? '0', 10);
    const minutes = parseInt(parts[1] ?? '0', 10);

    const slotDateTime = d
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0);

    return slotDateTime.isBefore(dayjs());
  }

  /**
   * Formats a date string (YYYY-MM-DD) into display label like "Thứ 7 15/08" or "C. Nhật 27/09"
   */
  public static formatVietnameseDateLabel(dateString: string): { dayOfWeek: string; formattedDate: string } {
    const d = dayjs(dateString);
    const dayOfWeekMap: Record<number, string> = {
      0: 'C. Nhật',
      1: 'Thứ 2',
      2: 'Thứ 3',
      3: 'Thứ 4',
      4: 'Thứ 5',
      5: 'Thứ 6',
      6: 'Thứ 7',
    };

    const dayOfWeek = dayOfWeekMap[d.day()] ?? 'Hôm nay';
    const formattedDate = d.format('DD/MM');

    return { dayOfWeek, formattedDate };
  }

  /**
   * Format YYYY-MM-DD to DD/MM/YYYY for Vietnamese input & filter bar
   */
  public static formatDisplayDate(dateString: string): string {
    const d = dayjs(dateString);
    return d.isValid() ? d.format('DD/MM/YYYY') : dateString;
  }

  /**
   * Format date into Vietnamese month header: "tháng M năm YYYY" (e.g. "tháng 9 năm 2026")
   */
  public static formatVietnameseMonthHeader(date: string | dayjs.Dayjs): string {
    const d = dayjs(date);
    return d.isValid() ? `tháng ${d.month() + 1} năm ${d.year()}` : '';
  }

  /**
   * Calculate human-readable duration from start and end times
   */
  public static calculateDuration(startTime: string, endTime: string): {
    minutes: number;
    hours: number;
    formatted: string;
  } {
    const startMin = this.parseTimeToMinutes(startTime);
    const endMin = this.parseTimeToMinutes(endTime);
    const diffMinutes = Math.max(0, endMin - startMin);
    const hours = diffMinutes / 60;

    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    let formatted = '';
    if (h > 0 && m > 0) {
      formatted = `${h} giờ ${m} phút`;
    } else if (h > 0) {
      formatted = `${h} giờ`;
    } else {
      formatted = `${m} phút`;
    }

    return {
      minutes: diffMinutes,
      hours,
      formatted,
    };
  }

  /**
   * Find all bookings that overlap with a time range on a court
   */
  public static getOverlappingBookings(
    existingBookings: BookingItem[],
    courtId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string,
  ): BookingItem[] {
    const newStart = this.parseTimeToMinutes(startTime);
    const newEnd = this.parseTimeToMinutes(endTime);

    return existingBookings.filter((b) => {
      if (b.courtId !== courtId) return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      const existingStart = this.parseTimeToMinutes(b.startTime);
      const existingEnd = this.parseTimeToMinutes(b.endTime);

      return newStart < existingEnd && newEnd > existingStart;
    });
  }

  /**
   * Validate if a list of slot times are strictly consecutive with intervalMinutes
   */
  public static validateConsecutiveSlots(
    slotTimes: string[],
    intervalMinutes: number = SCHEDULER_CONFIG.DEFAULT_INTERVAL_MINUTES,
  ): { isConsecutive: boolean; missingSlot?: string; gapAt?: string } {
    if (slotTimes.length <= 1) {
      return { isConsecutive: true };
    }

    const sortedMinutes = [...slotTimes]
      .map((t) => this.parseTimeToMinutes(t))
      .sort((a, b) => a - b);

    for (let i = 1; i < sortedMinutes.length; i++) {
      const prev = sortedMinutes[i - 1]!;
      const current = sortedMinutes[i]!;
      const diff = current - prev;

      if (diff !== intervalMinutes) {
        const missing = this.minutesToTime(prev + intervalMinutes);
        return {
          isConsecutive: false,
          missingSlot: missing,
          gapAt: `${this.minutesToTime(prev)} → ${this.minutesToTime(current)}`,
        };
      }
    }

    return { isConsecutive: true };
  }

  /**
   * Build a complete SlotSelectionRange from an array of clicked slot times
   * Auto calculates:
   * startTime = earliest selected slot
   * endTime = latest selected slot + slotDuration
   */
  public static buildRangeFromSlots(
    courtId: string,
    courtName: string,
    slotTimes: string[],
    intervalMinutes: number = SCHEDULER_CONFIG.DEFAULT_INTERVAL_MINUTES,
    existingBookings: BookingItem[] = [],
  ): SlotSelectionRange | null {
    if (slotTimes.length === 0) return null;

    const sortedTimes = [...slotTimes].sort(
      (a, b) => this.parseTimeToMinutes(a) - this.parseTimeToMinutes(b),
    );

    const earliestMinutes = this.parseTimeToMinutes(sortedTimes[0]!);
    const latestMinutes = this.parseTimeToMinutes(sortedTimes[sortedTimes.length - 1]!);

    const startTime = sortedTimes[0]!;
    const endTime = this.minutesToTime(latestMinutes + intervalMinutes);
    const durationMinutes = latestMinutes + intervalMinutes - earliestMinutes;

    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const durationFormatted =
      hours > 0 && mins > 0
        ? `${durationMinutes} phút (${hours}h${mins}p)`
        : hours > 0
          ? `${durationMinutes} phút (${hours} giờ)`
          : `${durationMinutes} phút`;

    const consecutiveCheck = this.validateConsecutiveSlots(sortedTimes, intervalMinutes);
    const overlappingBookings = this.getOverlappingBookings(
      existingBookings,
      courtId,
      startTime,
      endTime,
    );

    return {
      courtId,
      courtName,
      startTime,
      endTime,
      durationMinutes,
      durationFormatted,
      hasOverlap: overlappingBookings.length > 0,
      overlappingBookingIds: overlappingBookings.map((b) => b.id),
      selectedSlots: sortedTimes,
      isConsecutive: consecutiveCheck.isConsecutive,
      consecutiveError: consecutiveCheck.isConsecutive
        ? undefined
        : consecutiveCheck.missingSlot
          ? `Thiếu khung giờ ${consecutiveCheck.missingSlot}`
          : 'Các khung giờ đã chọn phải liền kề nhau',
    };
  }

  /**
   * Build a complete SlotSelectionRange from start and end slot inputs
   */
  public static buildSelectionRange(
    courtId: string,
    courtName: string,
    startSlotTime: string,
    endSlotTime: string,
    intervalMinutes: number = SCHEDULER_CONFIG.DEFAULT_INTERVAL_MINUTES,
    existingBookings: BookingItem[] = [],
  ): SlotSelectionRange {
    const startMin = this.parseTimeToMinutes(startSlotTime);
    const endMin = this.parseTimeToMinutes(endSlotTime);

    let finalStart: string;
    let finalEnd: string;

    if (startMin === endMin) {
      finalStart = startSlotTime;
      finalEnd = this.minutesToTime(startMin + intervalMinutes);
    } else if (startMin < endMin) {
      finalStart = startSlotTime;
      finalEnd = endSlotTime;
    } else {
      finalStart = endSlotTime;
      finalEnd = startSlotTime;
    }

    const duration = this.calculateDuration(finalStart, finalEnd);
    const overlappingBookings = this.getOverlappingBookings(
      existingBookings,
      courtId,
      finalStart,
      finalEnd,
    );

    // Compute slot times within this range
    const slots: string[] = [];
    const minStart = this.parseTimeToMinutes(finalStart);
    const minEnd = this.parseTimeToMinutes(finalEnd);
    for (let t = minStart; t < minEnd; t += intervalMinutes) {
      slots.push(this.minutesToTime(t));
    }

    return {
      courtId,
      courtName,
      startTime: finalStart,
      endTime: finalEnd,
      durationMinutes: duration.minutes,
      durationFormatted: duration.formatted,
      hasOverlap: overlappingBookings.length > 0,
      overlappingBookingIds: overlappingBookings.map((b) => b.id),
      selectedSlots: slots,
      isConsecutive: true,
    };
  }

  /**
   * Validate if a new booking conflicts with existing bookings on the same court
   */
  public static checkCollision(
    existingBookings: BookingItem[],
    courtId: string,
    newStartTime: string,
    newEndTime: string,
    excludeBookingId?: string,
  ): boolean {
    const newStart = this.parseTimeToMinutes(newStartTime);
    const newEnd = this.parseTimeToMinutes(newEndTime);

    return existingBookings.some((b) => {
      if (b.courtId !== courtId) return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      const existingStart = this.parseTimeToMinutes(b.startTime);
      const existingEnd = this.parseTimeToMinutes(b.endTime);

      // Overlap occurs if start < otherEnd and end > otherStart
      return newStart < existingEnd && newEnd > existingStart;
    });
  }
}
