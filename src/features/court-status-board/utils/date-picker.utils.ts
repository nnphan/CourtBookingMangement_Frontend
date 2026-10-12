import dayjs from '@/lib/dayjs';

/**
 * Normalizes input value (string, Date, or dayjs) into a valid dayjs object.
 * Defaults to current date (dayjs()) if input is empty or invalid.
 */
export const normalizeDate = (val?: string | Date | dayjs.Dayjs | null): dayjs.Dayjs => {
  if (!val) return dayjs();
  if (dayjs.isDayjs(val)) return val.isValid() ? val : dayjs();
  if (val instanceof Date) {
    const d = dayjs(val);
    return d.isValid() ? d : dayjs();
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return dayjs();
    const d = dayjs(trimmed);
    return d.isValid() ? d : dayjs();
  }
  return dayjs();
};
