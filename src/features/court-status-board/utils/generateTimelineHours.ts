/**
 * Generate an array of hourly time strings from openTime to closeTime.
 * Handles formats: "05:00:00", "05:00", "5:00".
 * 
 * Example:
 * Input: openTime = "05:00:00", closeTime = "23:00:00"
 * Output: ["05:00", "06:00", "07:00", ..., "23:00"]
 */
export function generateTimelineHours(
  openTime: string = '05:00',
  closeTime: string = '23:00',
): string[] {
  if (!openTime || !closeTime) {
    return [];
  }

  const parseHour = (timeStr: string, defaultHour: number): number => {
    const parts = timeStr.trim().split(':');
    const hour = parseInt(parts[0] ?? '', 10);
    return Number.isFinite(hour) ? Math.max(0, Math.min(24, hour)) : defaultHour;
  };

  const parseMinutes = (timeStr: string): number => {
    const parts = timeStr.trim().split(':');
    const minute = parseInt(parts[1] ?? '0', 10);
    return Number.isFinite(minute) ? minute : 0;
  };

  const startHour = parseHour(openTime, 5);
  let endHour = parseHour(closeTime, 23);
  const endMinutes = parseMinutes(closeTime);

  // If closeTime has minutes past the hour (e.g. 23:30), include the 23:00 hour
  if (endMinutes > 0 && endHour < 24) {
    endHour = Math.min(24, endHour + 1);
  }

  // Handle midnight or wrapping case
  if (endHour <= startHour) {
    endHour = 24;
  }

  const hours: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    const displayHour = h === 24 ? 24 : h;
    const formatted = `${displayHour.toString().padStart(2, '0')}:00`;
    hours.push(formatted);
  }

  return hours;
}

export default generateTimelineHours;
