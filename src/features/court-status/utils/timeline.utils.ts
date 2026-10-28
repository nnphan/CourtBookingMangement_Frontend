import dayjs from '@/lib/dayjs';

export const parseHourMinute = (timeStr: string): { hour: number; minute: number } => {
  if (!timeStr) return { hour: 5, minute: 0 };
  const parts = timeStr.split(':');
  const hour = parseInt(parts[0] ?? '5', 10);
  const minute = parseInt(parts[1] ?? '0', 10);
  return {
    hour: Number.isFinite(hour) ? hour : 5,
    minute: Number.isFinite(minute) ? minute : 0,
  };
};

export const timeToMinutes = (timeStr: string): number => {
  const { hour, minute } = parseHourMinute(timeStr);
  return hour * 60 + minute;
};

/**
 * Generate hourly slot starts from openTime up to, but not including, closeTime.
 * e.g. openTime = '05:00:00', closeTime = '23:00:00' -> ['05:00', '06:00', ..., '22:00']
 */
export const generateTimelineHours = (openTime: string, closeTime: string): string[] => {
  if (!openTime || !closeTime) return [];
  const { hour: startHour } = parseHourMinute(openTime);
  const endMinutes = timeToMinutes(closeTime);
  const hours: string[] = [];

  for (let h = startHour; h * 60 < endMinutes && h < 24; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`);
  }

  return hours;
};

/**
 * Calculates dynamic left offset and width in pixels for a booking item
 * based on its start/end time relative to openTime.
 */
export const calculateBookingDimensions = (
  startTime: string,
  endTime: string,
  openTime: string,
  hourWidth: number,
): { left: number; width: number } => {
  const openMinutes = timeToMinutes(openTime);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  const offsetMinutes = Math.max(0, startMinutes - openMinutes);
  const durationMinutes = Math.max(15, endMinutes - startMinutes);

  const left = Math.round((offsetMinutes / 60) * hourWidth);
  const width = Math.round((durationMinutes / 60) * hourWidth);

  return { left, width };
};

/**
 * Calculates current time vertical indicator position relative to openTime
 */
export const calculateCurrentTimeIndicator = (
  openTime: string,
  closeTime: string,
  hourWidth: number,
  selectedDate: string,
  timezone = 'Asia/Ho_Chi_Minh',
): { offsetPx: number | null; label: string } => {
  const selectedBusinessDate = dayjs.tz(selectedDate, 'YYYY-MM-DD', timezone);
  const now = dayjs().tz(timezone);
  const isToday = selectedBusinessDate.isSame(now, 'day');
  if (!isToday) {
    return { offsetPx: null, label: '' };
  }

  const currentMinutes = now.hour() * 60 + now.minute();
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  if (currentMinutes < openMinutes || currentMinutes > closeMinutes) {
    return { offsetPx: null, label: now.format('HH:mm') };
  }

  const offsetMinutes = currentMinutes - openMinutes;
  const offsetPx = Math.round((offsetMinutes / 60) * hourWidth);

  return { offsetPx, label: now.format('HH:mm') };
};
