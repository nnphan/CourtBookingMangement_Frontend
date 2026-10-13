import type { CreateBookingRequest, BookingTypeApi } from '../types/booking.types';

export const mapBookingTypeToPayload = (type: string): BookingTypeApi => {
  const normalized = (type || '').trim().toUpperCase();
  if (normalized === 'FIXED' || normalized === 'CỐ ĐỊNH') {
    return 'FIXED';
  }
  return 'FLEXIBLE';
};

export const mapBookingTypeToLabel = (type: string): string => {
  const normalized = (type || '').trim().toUpperCase();
  if (normalized === 'FIXED') {
    return 'Cố định';
  }
  return 'Vãng lai';
};

export const toCreateBookingPayload = (
  values: {
    customerName: string;
    phoneNumber: string;
    bookingType: string;
    note?: string;
  },
  context: {
    branchId: string;
    courtId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    customerId?: string | null;
    paymentMethod?: string;
  },
): CreateBookingRequest => {
  return {
    branchId: context.branchId,
    courtId: context.courtId,
    customerId: context.customerId ?? null,
    customerName: values.customerName.trim(),
    phoneNumber: values.phoneNumber.trim(),
    bookingDate: context.bookingDate,
    startTime: context.startTime,
    endTime: context.endTime,
    bookingType: mapBookingTypeToPayload(values.bookingType),
    paymentMethod: context.paymentMethod || 'CASH',
    note: values.note?.trim() || '',
  };
};
