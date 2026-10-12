import { BookingType } from '@/types/booking-type.enum';

export interface BookingTypeOption {
  label: string;
  value: BookingType;
}

export const BOOKING_TYPE_OPTIONS: readonly BookingTypeOption[] = [
  {
    label: 'Vãng lai',
    value: BookingType.FLEXIBLE,
  },
  {
    label: 'Cố định',
    value: BookingType.FIXED,
  },
] as const;

export const BOOKING_TYPE_LABELS: Record<string, string> = {
  [BookingType.FLEXIBLE]: 'Vãng lai',
  [BookingType.FIXED]: 'Cố định',
  FLEXIBLE: 'Vãng lai',
  FIXED: 'Cố định',
  flexible: 'Vãng lai',
  fixed: 'Cố định',
  daily: 'Vãng lai',
  recurring: 'Cố định',
};
