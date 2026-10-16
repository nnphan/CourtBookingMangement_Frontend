import dayjs from '@/lib/dayjs';

export const BOOKING_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const API_DATE_FORMAT = 'YYYY-MM-DD';

export const getCurrentBookingDate = (): string =>
  dayjs().tz(BOOKING_TIME_ZONE).format(API_DATE_FORMAT);

export const normalizeBookingDate = (value?: string | null): string | null => {
  if (!value?.trim()) return null;
  const parsed = dayjs(value.trim(), API_DATE_FORMAT, true);
  return parsed.isValid() ? parsed.format(API_DATE_FORMAT) : null;
};

export const formatBookingDateForDisplay = (value?: string | null): string => {
  const normalized = normalizeBookingDate(value) ?? getCurrentBookingDate();
  return dayjs(normalized, API_DATE_FORMAT, true).format('DD-MM-YYYY');
};
