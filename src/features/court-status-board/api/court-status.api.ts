import { request } from '@/lib/axios';
import type { CourtStatusFilterParams, CourtStatusResponse } from '../types/common';
import type { BookingItem } from '../types/booking';
import type { CourtItem, CourtBranch, CourtGroup } from '../types/court';
import { SchedulerService } from '../services/scheduler.service';

const MOCK_BRANCHES: CourtBranch[] = [
  {
    id: 'tmt-demo',
    name: 'TMT (Sân DEMO của ALOBO)',
    address: '123 Huỳnh Thúc Kháng, Q.1, TP.HCM',
    openTime: '05:00',
    closeTime: '23:00',
  },
  {
    id: 'alobo-quan-7',
    name: 'ALOBO Club Quận 7',
    address: '456 Nguyễn Hữu Thọ, Q.7, TP.HCM',
    openTime: '05:00',
    closeTime: '22:00',
  },
  {
    id: 'alobo-tan-binh',
    name: 'ALOBO Sân Cầu Lông Tân Bình',
    address: '789 Cộng Hòa, Q.Tân Bình, TP.HCM',
    openTime: '05:00',
    closeTime: '24:00',
  },
];

const MOCK_GROUPS: CourtGroup[] = [
  { id: 'all', name: 'Tất cả', branchId: 'tmt-demo' },
  { id: 'vip', name: 'Khu VIP (Sân 1-6)', branchId: 'tmt-demo' },
  { id: 'standard', name: 'Khu Tiêu Chuẩn (Sân 7-18)', branchId: 'tmt-demo' },
];

const generateMockCourts = (branchId: string): CourtItem[] => {
  const courts: CourtItem[] = [];
  for (let i = 1; i <= 18; i++) {
    courts.push({
      id: `court-${i}`,
      name: `Sân ${i}`,
      courtNumber: i,
      branchId,
      courtGroupId: i <= 6 ? 'vip' : 'standard',
      isActive: i !== 14,
      pricePerHour: i <= 6 ? 120000 : 90000,
    });
  }
  return courts;
};

// Seed bookings matching screenshot
let inMemoryBookings: BookingItem[] = [
  // 2026-09-27 Bookings (Matching attached Vietnamese datepicker screenshot)
  {
    id: 'b-social-c1',
    bookingNumber: 'BK-20260927-01',
    courtId: 'court-1',
    courtName: 'Sân 1',
    customerName: '[Social] - Chiều tối #753 - 0/40',
    phoneNumber: '',
    membership: 'Corporate',
    date: '2026-09-27',
    startTime: '16:00',
    endTime: '20:00',
    bookingType: 'event',
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    depositAmount: 500000,
    remainingAmount: 0,
    totalAmount: 500000,
    notes: 'Sự kiện giao lưu cầu lông Social chiều tối',
  },
  {
    id: 'b-social-c2',
    bookingNumber: 'BK-20260927-02',
    courtId: 'court-2',
    courtName: 'Sân 2',
    customerName: '[Social] - Chiều tối #753 - 0/40',
    phoneNumber: '',
    membership: 'Corporate',
    date: '2026-09-27',
    startTime: '16:00',
    endTime: '20:00',
    bookingType: 'event',
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    depositAmount: 500000,
    remainingAmount: 0,
    totalAmount: 500000,
    notes: 'Sự kiện giao lưu cầu lông Social chiều tối',
  },
  {
    id: 'b-001',
    bookingNumber: 'BK-20260815-05',
    courtId: 'court-5',
    courtName: 'Sân 5',
    customerName: 'Coach Hiếu',
    phoneNumber: '0903757746',
    membership: 'VIP Gold',
    date: '2026-08-15',
    startTime: '17:00',
    endTime: '20:00',
    bookingType: 'recurring',
    bookingStatus: 'confirmed',
    paymentStatus: 'unpaid',
    depositAmount: 0,
    remainingAmount: 360000,
    totalAmount: 360000,
    notes: 'Lớp huấn luyện học viên nâng cao 3 sân',
    services: [{ id: 's1', name: 'Nước suối Aquafina', quantity: 6, unitPrice: 10000, totalPrice: 60000 }],
  },
  {
    id: 'b-002',
    bookingNumber: 'BK-20260815-06',
    courtId: 'court-6',
    courtName: 'Sân 6',
    customerName: 'Coach Hiếu',
    phoneNumber: '0903757746',
    membership: 'VIP Gold',
    date: '2026-08-15',
    startTime: '17:00',
    endTime: '20:00',
    bookingType: 'recurring',
    bookingStatus: 'confirmed',
    paymentStatus: 'unpaid',
    depositAmount: 0,
    remainingAmount: 360000,
    totalAmount: 360000,
    notes: 'Lớp huấn luyện học viên nâng cao 3 sân',
  },
  {
    id: 'b-003',
    bookingNumber: 'BK-20260815-07',
    courtId: 'court-7',
    courtName: 'Sân 7',
    customerName: 'Coach Hiếu',
    phoneNumber: '0903757746',
    membership: 'VIP Gold',
    date: '2026-08-15',
    startTime: '17:00',
    endTime: '20:00',
    bookingType: 'recurring',
    bookingStatus: 'confirmed',
    paymentStatus: 'unpaid',
    depositAmount: 0,
    remainingAmount: 270000,
    totalAmount: 270000,
    notes: 'Lớp huấn luyện học viên nâng cao 3 sân',
  },
  {
    id: 'b-004',
    bookingNumber: 'BK-20260815-01',
    courtId: 'court-1',
    courtName: 'Sân 1',
    customerName: 'Trần Văn Long',
    phoneNumber: '0912345678',
    membership: 'Standard',
    date: '2026-08-15',
    startTime: '06:00',
    endTime: '08:00',
    bookingType: 'daily',
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    depositAmount: 240000,
    remainingAmount: 0,
    totalAmount: 240000,
    notes: 'Khách quen ca sáng sớm',
  },
  {
    id: 'b-005',
    bookingNumber: 'BK-20260815-02',
    courtId: 'court-2',
    courtName: 'Sân 2',
    customerName: 'Nguyễn Thị Mai',
    phoneNumber: '0988776655',
    membership: 'Silver',
    date: '2026-08-15',
    startTime: '09:00',
    endTime: '11:00',
    bookingType: 'flexible',
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    depositAmount: 240000,
    remainingAmount: 0,
    totalAmount: 240000,
    notes: 'Đặt theo gói giờ linh hoạt',
  },
  {
    id: 'b-006',
    bookingNumber: 'BK-20260815-03',
    courtId: 'court-10',
    courtName: 'Sân 10',
    customerName: 'Giải Vô Địch Mở Rộng ALOBO',
    phoneNumber: '0909000111',
    membership: 'Corporate',
    date: '2026-08-15',
    startTime: '08:00',
    endTime: '12:00',
    bookingType: 'event',
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    depositAmount: 360000,
    remainingAmount: 0,
    totalAmount: 360000,
    notes: 'Vòng bảng giải phong trào',
  },
  {
    id: 'b-007',
    bookingNumber: 'BK-20260815-04',
    courtId: 'court-11',
    courtName: 'Sân 11',
    customerName: 'Lê Minh Tuấn',
    phoneNumber: '0933221100',
    membership: 'Standard',
    date: '2026-08-15',
    startTime: '19:00',
    endTime: '21:30',
    bookingType: 'deposit_pending',
    bookingStatus: 'pending',
    paymentStatus: 'deposit_pending',
    depositAmount: 0,
    remainingAmount: 225000,
    totalAmount: 225000,
    notes: 'Hẹn chuyển khoản cọc trước 15:00',
  },
];

export const courtStatusApi = {
  /**
   * Fetch court status data (courts, bookings, branch, group metadata)
   */
  getCourtStatus: async (params: CourtStatusFilterParams): Promise<CourtStatusResponse> => {
    try {
      // First attempt to call actual backend API
      const res = await request<CourtStatusResponse>({
        url: '/court-status',
        method: 'GET',
        params: {
          branchId: params.branchId,
          date: params.date,
          courtGroupId: params.courtGroupId,
        },
      });
      return res;
    } catch {
      // Graceful fallback to mock data for standalone development / demo
      const courts = generateMockCourts(params.branchId);
      const filteredCourts =
        params.courtGroupId && params.courtGroupId !== 'all'
          ? courts.filter((c) => c.courtGroupId === params.courtGroupId)
          : courts;

      // Filter bookings by date
      const dateBookings = inMemoryBookings.filter((b) => b.date === params.date);

      return {
        courts: filteredCourts,
        bookings: dateBookings,
        branches: MOCK_BRANCHES,
        groups: MOCK_GROUPS,
      };
    }
  },

  /**
   * Create a new booking
   */
  createBooking: async (data: Partial<BookingItem>): Promise<BookingItem> => {
    // API request validation before submit
    if (data.date && SchedulerService.isPastDate(data.date)) {
      throw new Error('Cannot create bookings for past dates.');
    }
    if (data.date && data.startTime && SchedulerService.isPastSlot(data.date, data.startTime)) {
      throw new Error('Past time slots cannot be booked.');
    }

    try {
      return await request<BookingItem>({
        url: '/court-status/bookings',
        method: 'POST',
        data,
      });
    } catch {
      const newBooking: BookingItem = {
        id: `b-${Date.now()}`,
        bookingNumber: `BK-${data.date?.replace(/-/g, '') || '20260815'}-${Math.floor(10 + Math.random() * 90)}`,
        courtId: data.courtId ?? 'court-1',
        courtName: data.courtName ?? 'Sân 1',
        customerName: data.customerName ?? 'Khách lẻ',
        phoneNumber: data.phoneNumber ?? '0900000000',
        membership: data.membership ?? 'Standard',
        date: data.date ?? '2026-08-15',
        startTime: data.startTime ?? '08:00',
        endTime: data.endTime ?? '10:00',
        bookingType: data.bookingType ?? 'daily',
        bookingStatus: 'confirmed',
        paymentStatus: data.paymentStatus ?? 'paid',
        depositAmount: data.depositAmount ?? 0,
        remainingAmount: data.remainingAmount ?? 0,
        totalAmount: data.totalAmount ?? 180000,
        notes: data.notes ?? '',
        services: data.services ?? [],
      };
      inMemoryBookings.push(newBooking);
      return newBooking;
    }
  },

  /**
   * Update an existing booking
   */
  updateBooking: async (id: string, data: Partial<BookingItem>): Promise<BookingItem> => {
    try {
      return await request<BookingItem>({
        url: `/court-status/bookings/${id}`,
        method: 'PUT',
        data,
      });
    } catch {
      const idx = inMemoryBookings.findIndex((b) => b.id === id);
      if (idx !== -1) {
        inMemoryBookings[idx] = { ...inMemoryBookings[idx]!, ...data };
        return inMemoryBookings[idx]!;
      }
      throw new Error('Booking not found');
    }
  },

  /**
   * Cancel / delete a booking
   */
  cancelBooking: async (id: string): Promise<{ success: boolean }> => {
    try {
      return await request<{ success: boolean }>({
        url: `/court-status/bookings/${id}`,
        method: 'DELETE',
      });
    } catch {
      inMemoryBookings = inMemoryBookings.filter((b) => b.id !== id);
      return { success: true };
    }
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
