import { request } from '@/lib/axios';
import { courtStatusService } from '@/services/court-status.service';
import type { CourtStatusFilterParams, CourtStatusResponse } from '../types/common';
import type { BookingItem, PaymentStatus } from '../types/booking';
import { BookingType } from '@/types/booking-type.enum';
import type { CourtItem, CourtGroup } from '../types/court';
import type { CourtScheduleItem, CourtStatusCourt } from '@/types/court-status';
import { SchedulerService } from '../services/scheduler.service';

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
   * Create a new booking
   */
  createBooking: async (data: Partial<BookingItem>): Promise<BookingItem> => {
    if (data.date && SchedulerService.isPastDate(data.date)) {
      throw new Error('Cannot create bookings for past dates.');
    }
    if (data.date && data.startTime && SchedulerService.isPastSlot(data.date, data.startTime)) {
      throw new Error('Past time slots cannot be booked.');
    }

    return await request<BookingItem>({
      url: '/court-status/bookings',
      method: 'POST',
      data,
    });
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
   * Cancel / delete a booking
   */
  cancelBooking: async (id: string): Promise<{ success: boolean }> => {
    return await request<{ success: boolean }>({
      url: `/court-status/bookings/${id}`,
      method: 'DELETE',
    });
  },

  /**
   * Check in customer
   */
  checkIn: async (id: string): Promise<BookingItem> => {
    return courtStatusApi.updateBooking(id, { checkedIn: true, bookingStatus: 'checked_in' });
  },

  /**
   * Check out customer
   */
  checkOut: async (id: string): Promise<BookingItem> => {
    return courtStatusApi.updateBooking(id, { checkedOut: true, bookingStatus: 'completed' });
  },
};
