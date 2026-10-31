import { request } from '@/lib/axios';
import { courtStatusService } from '@/services/court-status.service';
import type { CourtStatusFilterParams, CourtStatusResponse } from '../types/common';
import type { BookingItem, PaymentStatus } from '../types/booking';
import { BookingType } from '@/types/booking-type.enum';
import type { CourtItem, CourtGroup } from '../types/court';
import type { CourtScheduleItem, CourtStatusCourt } from '@/types/court-status';
import { SchedulerService } from '../services/scheduler.service';
import { bookingApi } from '@/features/bookings/api/booking.api';

const MOCK_GROUPS: CourtGroup[] = [
  { id: 'all', name: 'Tất cả', branchId: 'all' },
  { id: 'vip', name: 'Khu VIP', branchId: 'vip' },
  { id: 'standard', name: 'Khu Tiêu Chuẩn', branchId: 'standard' },
];

function mapScheduleItemToBooking(item: CourtScheduleItem): BookingItem {
  const normTime = (t: string) => (t && t.length >= 5 ? t.slice(0, 5) : t);
  const paymentMap: Record<string, PaymentStatus> = {
    paid: 'paid',
    unpaid: 'unpaid',
    deposit_pending: 'deposit_pending',
    service_unpaid: 'service_unpaid',
    ticket_unpaid: 'ticket_unpaid',
    partially_paid: 'partially_paid',
  };

  const rawBookingType = (item.bookingType || '').trim().toUpperCase();
  const bookingType =
    rawBookingType === BookingType.FIXED || rawBookingType === 'RECURRING'
      ? BookingType.FIXED
      : BookingType.FLEXIBLE;
  const paymentStatusLower = (item.paymentStatus || '').toLowerCase();

  return {
    id: item.bookingId,
    bookingNumber: item.bookingId,
    courtId: item.courtId,
    courtName: item.courtName,
    customerName: item.customerName,
    phoneNumber: item.phoneNumber,
    date: item.bookingDate,
    startTime: normTime(item.startTime),
    endTime: normTime(item.endTime),
    bookingType,
    bookingStatus: item.bookingStatus || 'Pending',
    paymentStatus: paymentMap[paymentStatusLower] ?? 'paid',
    notes: item.title,
    color: item.color,
  };
}

function mapCourtToCourtItem(court: CourtStatusCourt): CourtItem {
  const statusLower = (court.status || '').toLowerCase();
  const isActive = statusLower !== 'inactive' && statusLower !== 'maintenance';

  return {
    id: court.courtId,
    name: court.courtName,
    courtNumber: court.courtNumber,
    isActive,
    pricePerHour: 100000,
    branchId: '',
  };
}

export const courtStatusApi = {
  /**
   * Fetch court status data from the real API GET /api/court-status
   */
  getCourtStatus: async (params: CourtStatusFilterParams): Promise<CourtStatusResponse> => {
    const data = await courtStatusService.getCourtStatus(params.branchId, params.date);
    const courts = (data.courts || []).map(mapCourtToCourtItem);
    const bookings = (data.scheduleItems || []).map(mapScheduleItemToBooking);

    return {
      courts,
      bookings,
      branches: [],
      groups: MOCK_GROUPS,
    };
  },

  /**
   * Create a new booking via POST /api/bookings
   */
  createBooking: async (data: Partial<BookingItem>): Promise<BookingItem> => {
    if (data.date && SchedulerService.isPastDate(data.date)) {
      throw new Error('Cannot create bookings for past dates.');
    }
    if (data.date && data.startTime && SchedulerService.isPastSlot(data.date, data.startTime)) {
      throw new Error('Past time slots cannot be booked.');
    }

    const payload = {
      branchId: (data as { branchId?: string }).branchId || '',
      courtId: data.courtId || '',
      customerId: (data as { customerId?: string | null }).customerId ?? null,
      customerName: data.customerName || '',
      phoneNumber: data.phoneNumber || '',
      bookingDate: data.date || '',
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      bookingType: (data.bookingType === BookingType.FIXED ? 'FIXED' : 'FLEXIBLE') as 'FIXED' | 'FLEXIBLE',
      paymentMethod: 'CASH',
      note: data.notes || '',
    };

    const res = await request<BookingItem>({
      url: '/api/bookings',
      method: 'POST',
      data: payload,
    }).catch(async () => {
      // Fallback for mock environments
      return request<BookingItem>({
        url: '/court-status/bookings',
        method: 'POST',
        data,
      });
    });

    return res;
  },

  /**
   * Update an existing booking
   */
  updateBooking: async (id: string, data: Partial<BookingItem>): Promise<BookingItem> => {
    return await request<BookingItem>({
      url: `/court-status/bookings/${id}`,
      method: 'PUT',
      data,
    });
  },

  /**
   * Cancel a booking via PATCH /api/bookings/{id}
   */
  cancelBooking: async (id: string): Promise<unknown> => {
    return await bookingApi.updateBookingStatus(id, 'CANCELLED');
  },

  /**
   * Check in customer via PATCH /api/bookings/{id}
   */
  checkIn: async (id: string): Promise<unknown> => {
    return await bookingApi.updateBookingStatus(id, 'CHECKED_IN');
  },

  /**
   * Check out customer via PATCH /api/bookings/{id}
   */
  checkOut: async (id: string): Promise<unknown> => {
    return await bookingApi.updateBookingStatus(id, 'COMPLETED');
  },
};
