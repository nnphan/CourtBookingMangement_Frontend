import dayjs from '@/lib/dayjs';
import type { CreateBookingRequest, CreateBookingResponse } from '../types/booking.types';
import { bookingApi } from '../api/booking.api';
import { toCreateBookingPayload } from '../utils/booking.mapper';

export class BookingService {
  /**
   * Calculate duration in hours and minutes between start time and end time
   * Implementation matches business standard:
   * Example: 13:00 - 15:00 -> "2 giờ (13:00 - 15:00)"
   */
  public static calculateDuration(
    startTime: string,
    endTime: string,
  ): {
    hours: number;
    minutes: number;
    formatted: string;
    displayText: string;
  } {
    if (!startTime || !endTime) {
      return { hours: 0, minutes: 0, formatted: '', displayText: '' };
    }

    const start = dayjs(`2000-01-01T${startTime.slice(0, 5)}:00`);
    const end = dayjs(`2000-01-01T${endTime.slice(0, 5)}:00`);

    const diffMinutes = Math.max(0, end.diff(start, 'minute'));
    const hours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    let formatted = '';
    if (hours > 0 && remainingMinutes > 0) {
      formatted = `${hours} giờ ${remainingMinutes} phút`;
    } else if (hours > 0) {
      formatted = `${hours} giờ`;
    } else {
      formatted = `${remainingMinutes} phút`;
    }

    const displayText = `${formatted} (${startTime.slice(0, 5)} - ${endTime.slice(0, 5)})`;

    return {
      hours: diffMinutes / 60,
      minutes: diffMinutes,
      formatted,
      displayText,
    };
  }

  /**
   * Submit create booking request
   */
  public static async createBooking(payload: CreateBookingRequest): Promise<CreateBookingResponse> {
    return bookingApi.createBooking(payload);
  }

  /**
   * Build create booking request payload
   */
  public static buildPayload = toCreateBookingPayload;
}
