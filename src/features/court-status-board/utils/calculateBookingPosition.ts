/**
 * Parse time string ("14:00:00" or "14:00") into minutes from midnight.
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0] ?? '0', 10);
  const minutes = parseInt(parts[1] ?? '0', 10);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

export interface BookingPositionOptions {
  /** Width in pixels for 1 hour on the timeline (e.g. 100 or 120) */
  hourWidth?: number;
  /** Total operating hours on the board (e.g. 18 for 05:00 - 23:00) */
  totalHours?: number;
}

export interface BookingPositionResult {
  left: number;
  width: number;
}

/**
 * Calculates the horizontal position (left) and dimension (width) of a booking slot
 * relative to the timeline start (openTime).
 * 
 * Example:
 * Board openTime: "05:00:00"
 * Booking: startTime: "14:00:00", endTime: "16:00:00"
 * Offset = 14:00 - 05:00 = 9 hours (540 mins)
 * Width = 16:00 - 14:00 = 2 hours (120 mins)
 * 
 * When hourWidth = 100px:
 * left = 900px, width = 200px
 */
export function calculateBookingPosition(
  booking: { startTime: string; endTime: string },
  openTime: string = '05:00:00',
  options?: BookingPositionOptions,
): BookingPositionResult {
  const startMinutes = timeStringToMinutes(booking.startTime);
  const endMinutes = timeStringToMinutes(booking.endTime);
  const openMinutes = timeStringToMinutes(openTime);

  // Offset after opening
  const offsetMinutes = Math.max(0, startMinutes - openMinutes);
  // Duration of booking
  const durationMinutes = Math.max(0, endMinutes - startMinutes);

  const offsetHours = offsetMinutes / 60;
  const durationHours = durationMinutes / 60;

  if (options?.hourWidth !== undefined) {
    return {
      left: Math.round(offsetHours * options.hourWidth),
      width: Math.max(12, Math.round(durationHours * options.hourWidth)),
    };
  }

  if (options?.totalHours !== undefined && options.totalHours > 0) {
    // Return percentage if totalHours is provided without specific pixel width
    return {
      left: (offsetHours / options.totalHours) * 100,
      width: Math.max(1, (durationHours / options.totalHours) * 100),
    };
  }

  // Default fallback: assume 1 hour = 100 units / pixels
  return {
    left: offsetHours * 100,
    width: Math.max(12, durationHours * 100),
  };
}

export default calculateBookingPosition;
