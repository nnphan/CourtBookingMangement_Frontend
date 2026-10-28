import type {
  NormalizedCourtScheduleStatus,
} from '@/features/court-status/types/court-schedule-block';
import type { CourtScheduleBlockViewModel } from '@/features/court-status/types/court-schedule-block';
import type { CourtStatusV2ScheduleItem } from '../types/court-status-v2';

const normalizeStatus = (value: string | null | undefined): string =>
  (value ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');

const toKnownStatus = (value: string | null | undefined): NormalizedCourtScheduleStatus | null => {
  switch (normalizeStatus(value)) {
    case 'PENDING_PAYMENT':
      return 'PENDING_PAYMENT';
    case 'RESERVED':
      return 'RESERVED';
    case 'CONFIRMED':
      return 'CONFIRMED';
    case 'PAID':
      return 'PAID';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
    case 'CANCELED':
      return 'CANCELLED';
    case 'EXPIRED':
      return 'EXPIRED';
    default:
      return null;
  }
};

const getDisplayStatus = (item: CourtStatusV2ScheduleItem): NormalizedCourtScheduleStatus => {
  const explicitStatus = toKnownStatus(item.displayStatus);
  if (explicitStatus) return explicitStatus;

  const detailStatus = toKnownStatus(item.bookingDetailStatus);
  if (detailStatus) return detailStatus;

  const bookingStatus = normalizeStatus(item.bookingStatus);
  const bookingResult = toKnownStatus(bookingStatus);
  if (bookingResult) return bookingResult;

  if (bookingStatus === 'PENDING' && normalizeStatus(item.paymentStatus) === 'UNPAID') {
    return 'PENDING_PAYMENT';
  }
  if (normalizeStatus(item.paymentStatus) === 'PAID') return 'PAID';
  return 'UNKNOWN';
};

const blocksAvailability = (item: CourtStatusV2ScheduleItem): boolean =>
  ![item.bookingDetailStatus, item.bookingStatus].some((value) =>
    ['CANCELLED', 'CANCELED', 'EXPIRED', 'COMPLETED'].includes(normalizeStatus(value)),
  );

const formatCustomerLabel = (customerName: string, phoneNumber: string): string =>
  [customerName.trim(), phoneNumber.trim()].filter(Boolean).join(' - ');

export const getScheduleItemLabel = (item: CourtStatusV2ScheduleItem): string =>
  item.displayLabel?.trim() ||
  item.title?.trim() ||
  formatCustomerLabel(item.customerName ?? '', item.phoneNumber ?? '') ||
  item.bookingCode;

export const mapCourtStatusV2ScheduleItem = (
  item: CourtStatusV2ScheduleItem,
): CourtScheduleBlockViewModel => ({
  bookingDetailId: item.bookingDetailId,
  bookingId: item.bookingId,
  bookingCode: item.bookingCode,
  courtId: item.courtId,
  courtNumber: item.courtNumber,
  courtName: item.courtName,
  bookingDate: item.bookingDate,
  startTime: item.startTime,
  endTime: item.endTime,
  bookingType: item.bookingType,
  bookingStatus: item.bookingStatus,
  bookingDetailStatus: item.bookingDetailStatus,
  paymentStatus: item.paymentStatus,
  bookingCourtCount: item.bookingCourtCount,
  label: getScheduleItemLabel(item),
  displayStatus: getDisplayStatus(item),
  blocksAvailability: blocksAvailability(item),
});

export const isValidTimeOnly = (time: string): boolean =>
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.test(time);
