import { http } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  Customer,
  CustomerSearchRequest,
  CustomerCreateInput,
  CustomerUpdateInput,
  CustomerStatsOverview,
} from '../types/customer';
import type { CustomerBookingHistory, BookingHistoryParams } from '../types/booking-history';
import { createSuccessResponse } from '@/mocks/shared/mock-api-response';
import { createErrorResponse } from '@/mocks/shared/mock-error';
import { mockDelay } from '@/mocks/shared/mock-delay';

// Mock Customers Database Seed
let inMemoryCustomers: Customer[] = [
  {
    id: 'cust-001',
    customerCode: 'KH001',
    fullName: 'Coach Hiếu',
    phoneNumber: '0903757746',
    email: 'hieu.coach@alobo.vn',
    gender: 'male',
    birthday: '1988-06-15',
    address: '123 Huỳnh Thúc Kháng, Bến Nghé, Quận 1, TP.HCM',
    notes: 'Huấn luyện viên đội tuyển trẻ, thuê cố định 3 sân chiều tối',
    memberType: 'platinum',
    status: 'active',
    isGuest: false,
    totalBookings: 68,
    totalRevenue: 24500000,
    lastBookingDate: '2026-09-27',
    favoriteCourt: 'Sân 5 (VIP)',
    bookingFrequency: '4 buổi/tuần',
    joinDate: '2024-03-01',
    expireDate: '2027-03-01',
    createdDate: '2024-03-01T08:00:00.000Z',
    updatedDate: '2026-09-27T10:00:00.000Z',
  },
  {
    id: 'cust-002',
    customerCode: 'KH002',
    fullName: 'Trần Văn Long',
    phoneNumber: '0912345678',
    email: 'long.tran@gmail.com',
    gender: 'male',
    birthday: '1992-11-20',
    address: '456 Nguyễn Hữu Thọ, Phường Tân Phong, Quận 7, TP.HCM',
    notes: 'Khách quen ca sáng sớm 06:00 - 08:00',
    memberType: 'gold',
    status: 'active',
    isGuest: false,
    totalBookings: 42,
    totalRevenue: 10800000,
    lastBookingDate: '2026-09-26',
    favoriteCourt: 'Sân 1 (VIP)',
    bookingFrequency: '3 buổi/tuần',
    joinDate: '2024-07-15',
    expireDate: '2026-12-31',
    createdDate: '2024-07-15T09:30:00.000Z',
    updatedDate: '2026-09-26T07:00:00.000Z',
  },
  {
    id: 'cust-003',
    customerCode: 'KH003',
    fullName: 'Nguyễn Thị Mai',
    phoneNumber: '0988776655',
    email: 'mai.nguyen@outlook.com',
    gender: 'female',
    birthday: '1995-04-10',
    address: '789 Cộng Hòa, Phường 13, Quận Tân Bình, TP.HCM',
    notes: 'Gói linh hoạt giờ sáng các ngày trong tuần',
    memberType: 'silver',
    status: 'active',
    isGuest: false,
    totalBookings: 25,
    totalRevenue: 5400000,
    lastBookingDate: '2026-09-25',
    favoriteCourt: 'Sân 2 (VIP)',
    bookingFrequency: '2 buổi/tuần',
    joinDate: '2025-01-10',
    expireDate: '2026-10-10',
    createdDate: '2025-01-10T14:15:00.000Z',
    updatedDate: '2026-09-25T11:30:00.000Z',
  },
  {
    id: 'cust-004',
    customerCode: 'KH004',
    fullName: 'Lê Minh Tuấn',
    phoneNumber: '0933221100',
    email: 'tuan.lm@techcorp.vn',
    gender: 'male',
    birthday: '1990-08-25',
    address: '12 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM',
    notes: 'Đặt ca tối cho câu lạc bộ công ty',
    memberType: 'bronze',
    status: 'active',
    isGuest: false,
    totalBookings: 18,
    totalRevenue: 4200000,
    lastBookingDate: '2026-09-24',
    favoriteCourt: 'Sân 11',
    bookingFrequency: '1 buổi/tuần',
    joinDate: '2025-05-20',
    expireDate: '2026-11-20',
    createdDate: '2025-05-20T16:00:00.000Z',
    updatedDate: '2026-09-24T21:00:00.000Z',
  },
  {
    id: 'cust-005',
    customerCode: 'KH005',
    fullName: 'Võ Hoàng Yến',
    phoneNumber: '0977112233',
    email: 'yen.vo@fitness.vn',
    gender: 'female',
    birthday: '1994-12-05',
    address: '34 Phan Xích Long, Phường 2, Quận Phú Nhuận, TP.HCM',
    notes: 'Thường mang theo học viên nữ luyện phản xạ',
    memberType: 'gold',
    status: 'active',
    isGuest: false,
    totalBookings: 36,
    totalRevenue: 9200000,
    lastBookingDate: '2026-09-27',
    favoriteCourt: 'Sân 3',
    bookingFrequency: '3 buổi/tuần',
    joinDate: '2024-11-01',
    expireDate: '2026-11-01',
    createdDate: '2024-11-01T10:00:00.000Z',
    updatedDate: '2026-09-27T14:00:00.000Z',
  },
  {
    id: 'cust-006',
    customerCode: 'KH006',
    fullName: 'Đặng Quốc Bảo',
    phoneNumber: '0908889999',
    email: 'bao.dang@invest.com',
    gender: 'male',
    birthday: '1985-02-18',
    address: '56 Thảo Điền, Quận 2, TP.Thủ Đức',
    notes: 'Khách VIP doanh nghiệp, hay tổ chức thi đấu nội bộ',
    memberType: 'platinum',
    status: 'active',
    isGuest: false,
    totalBookings: 52,
    totalRevenue: 18600000,
    lastBookingDate: '2026-09-23',
    favoriteCourt: 'Sân 6 (VIP)',
    bookingFrequency: '2 buổi/tuần',
    joinDate: '2024-04-12',
    expireDate: '2027-04-12',
    createdDate: '2024-04-12T11:20:00.000Z',
    updatedDate: '2026-09-23T18:00:00.000Z',
  },
  {
    id: 'cust-007',
    customerCode: 'KH007',
    fullName: 'Phạm Thu Trang',
    phoneNumber: '0944556677',
    email: 'trang.pham@design.co',
    gender: 'female',
    birthday: '1998-09-30',
    address: '88 Nguyễn Đình Chiểu, Đa Kao, Quận 1, TP.HCM',
    notes: 'Tạm ngưng chơi 1 tháng do chấn thương cổ chân',
    memberType: 'silver',
    status: 'inactive',
    isGuest: false,
    totalBookings: 14,
    totalRevenue: 2800000,
    lastBookingDate: '2026-08-10',
    favoriteCourt: 'Sân 4',
    bookingFrequency: '1 buổi/tháng',
    joinDate: '2025-02-15',
    expireDate: '2026-08-15',
    createdDate: '2025-02-15T08:45:00.000Z',
    updatedDate: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 'cust-008',
    customerCode: 'KH008',
    fullName: 'Hoàng Minh Đức',
    phoneNumber: '0966443322',
    email: 'duc.hoang@badminton.net',
    gender: 'male',
    birthday: '1991-07-22',
    address: '99 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP.HCM',
    notes: 'Vi phạm quy định hủy sân sát giờ nhiều lần',
    memberType: 'bronze',
    status: 'blocked',
    isGuest: false,
    totalBookings: 8,
    totalRevenue: 1200000,
    lastBookingDate: '2026-07-18',
    favoriteCourt: 'Sân 8',
    bookingFrequency: 'Không xác định',
    joinDate: '2025-06-01',
    expireDate: '2026-06-01',
    createdDate: '2025-06-01T15:30:00.000Z',
    updatedDate: '2026-07-20T09:00:00.000Z',
  },
  {
    id: 'cust-009',
    customerCode: 'KH009',
    fullName: 'Bùi Anh Tuấn (Khách Vãng Lai)',
    phoneNumber: '0901239876',
    gender: 'male',
    notes: 'Khách đặt qua hotline lần đầu, chưa đăng ký thành viên',
    memberType: 'standard',
    status: 'active',
    isGuest: true,
    totalBookings: 2,
    totalRevenue: 480000,
    lastBookingDate: '2026-09-27',
    favoriteCourt: 'Sân 9',
    bookingFrequency: 'Mới',
    joinDate: '2026-09-27',
    createdDate: '2026-09-27T08:00:00.000Z',
    updatedDate: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'cust-010',
    customerCode: 'KH010',
    fullName: 'Lê Phương Thảo',
    phoneNumber: '0919876543',
    email: 'thao.le@fashion.vn',
    gender: 'female',
    birthday: '1996-03-14',
    address: '150 Nam Kỳ Khởi Nghĩa, Phường 6, Quận 3, TP.HCM',
    notes: 'Khách hàng thân thiết, thích sân sàn gỗ tiêu chuẩn',
    memberType: 'gold',
    status: 'active',
    isGuest: false,
    totalBookings: 31,
    totalRevenue: 7500000,
    lastBookingDate: '2026-09-26',
    favoriteCourt: 'Sân 7',
    bookingFrequency: '2 buổi/tuần',
    joinDate: '2024-10-10',
    expireDate: '2026-10-10',
    createdDate: '2024-10-10T13:00:00.000Z',
    updatedDate: '2026-09-26T17:00:00.000Z',
  },
  {
    id: 'cust-011',
    customerCode: 'KH011',
    fullName: 'CLB Cầu Lông Tân Phú',
    phoneNumber: '0903332211',
    email: 'clb.tanphu@sport.vn',
    gender: 'other',
    address: '25 Tân Hương, Phường Tân Quý, Quận Tân Phú, TP.HCM',
    notes: 'Tổ chức sinh hoạt cố định tối Thứ 3 - 5 - 7',
    memberType: 'platinum',
    status: 'active',
    isGuest: false,
    totalBookings: 84,
    totalRevenue: 32000000,
    lastBookingDate: '2026-09-27',
    favoriteCourt: 'Sân 12',
    bookingFrequency: '3 buổi/tuần',
    joinDate: '2024-01-05',
    expireDate: '2027-01-05',
    createdDate: '2024-01-05T08:00:00.000Z',
    updatedDate: '2026-09-27T16:00:00.000Z',
  },
  {
    id: 'cust-012',
    customerCode: 'KH012',
    fullName: 'Đỗ Thị Kim Oanh (Khách Đặt Nhanh)',
    phoneNumber: '0938765432',
    gender: 'female',
    notes: 'Khách đặt nhanh tại quầy',
    memberType: 'standard',
    status: 'active',
    isGuest: true,
    totalBookings: 1,
    totalRevenue: 240000,
    lastBookingDate: '2026-09-26',
    favoriteCourt: 'Sân 14',
    bookingFrequency: 'Mới',
    joinDate: '2026-09-26',
    createdDate: '2026-09-26T14:30:00.000Z',
    updatedDate: '2026-09-26T14:30:00.000Z',
  },
];

// Mock Booking History Seed
const inMemoryBookings: Record<string, CustomerBookingHistory[]> = {
  'cust-001': [
    {
      id: 'b-101',
      bookingNumber: 'BK-20260927-01',
      bookingDate: '2026-09-27',
      courtId: 'court-5',
      courtName: 'Sân 5 (VIP)',
      startTime: '17:00',
      endTime: '20:00',
      durationMinutes: 180,
      totalAmount: 360000,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      notes: 'Lớp học viên nâng cao 3 sân',
      createdDate: '2026-09-25T10:00:00.000Z',
    },
    {
      id: 'b-102',
      bookingNumber: 'BK-20260925-05',
      bookingDate: '2026-09-25',
      courtId: 'court-5',
      courtName: 'Sân 5 (VIP)',
      startTime: '17:00',
      endTime: '20:00',
      durationMinutes: 180,
      totalAmount: 360000,
      bookingStatus: 'completed',
      paymentStatus: 'paid',
      notes: 'Luyện tập thể lực',
      createdDate: '2026-09-23T08:30:00.000Z',
    },
    {
      id: 'b-103',
      bookingNumber: 'BK-20260922-04',
      bookingDate: '2026-09-22',
      courtId: 'court-6',
      courtName: 'Sân 6 (VIP)',
      startTime: '18:00',
      endTime: '21:00',
      durationMinutes: 180,
      totalAmount: 360000,
      bookingStatus: 'completed',
      paymentStatus: 'paid',
      createdDate: '2026-09-20T14:00:00.000Z',
    },
    {
      id: 'b-104',
      bookingNumber: 'BK-20260918-08',
      bookingDate: '2026-09-18',
      courtId: 'court-5',
      courtName: 'Sân 5 (VIP)',
      startTime: '17:00',
      endTime: '20:00',
      durationMinutes: 180,
      totalAmount: 360000,
      bookingStatus: 'completed',
      paymentStatus: 'paid',
      createdDate: '2026-09-15T09:00:00.000Z',
    },
  ],
  'cust-002': [
    {
      id: 'b-201',
      bookingNumber: 'BK-20260926-02',
      bookingDate: '2026-09-26',
      courtId: 'court-1',
      courtName: 'Sân 1 (VIP)',
      startTime: '06:00',
      endTime: '08:00',
      durationMinutes: 120,
      totalAmount: 240000,
      bookingStatus: 'completed',
      paymentStatus: 'paid',
      notes: 'Ca sáng sớm thứ Bảy',
      createdDate: '2026-09-24T12:00:00.000Z',
    },
    {
      id: 'b-202',
      bookingNumber: 'BK-20260924-01',
      bookingDate: '2026-09-24',
      courtId: 'court-1',
      courtName: 'Sân 1 (VIP)',
      startTime: '06:00',
      endTime: '08:00',
      durationMinutes: 120,
      totalAmount: 240000,
      bookingStatus: 'completed',
      paymentStatus: 'paid',
      createdDate: '2026-09-22T11:00:00.000Z',
    },
  ],
};

export const customerApi = {
  /**
   * Get paginated customer list with multi-field search and filters
   */
  getCustomers: async (requestParams: CustomerSearchRequest): Promise<ApiResponse<Customer[]>> => {
    try {
      const res = await http.get<ApiResponse<Customer[]>>('/customers', {
        params: requestParams,
      });
      return res.data;
    } catch {
      await mockDelay(200);

      const {
        pageNumber = 1,
        pageSize = 10,
        keyword = '',
        status = 'all',
        memberType = 'all',
        isGuest = 'all',
        sortBy = 'createdDate',
        sortOrder = 'desc',
      } = requestParams;

      // 1. Filter
      let filtered = [...inMemoryCustomers];

      if (keyword.trim()) {
        const query = keyword.toLowerCase().trim();
        filtered = filtered.filter(
          (c) =>
            c.fullName.toLowerCase().includes(query) ||
            c.phoneNumber.toLowerCase().includes(query) ||
            (c.email && c.email.toLowerCase().includes(query)) ||
            c.customerCode.toLowerCase().includes(query),
        );
      }

      if (status !== 'all') {
        filtered = filtered.filter((c) => c.status === status);
      }

      if (memberType !== 'all') {
        filtered = filtered.filter((c) => c.memberType === memberType);
      }

      if (isGuest !== 'all') {
        filtered = filtered.filter((c) => c.isGuest === isGuest);
      }

      // 2. Sort
      filtered.sort((a, b) => {
        let comp = 0;
        if (sortBy === 'fullName') {
          comp = a.fullName.localeCompare(b.fullName, 'vi');
        } else if (sortBy === 'totalBookings') {
          comp = a.totalBookings - b.totalBookings;
        } else if (sortBy === 'totalRevenue') {
          comp = a.totalRevenue - b.totalRevenue;
        } else {
          comp = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        }
        return sortOrder === 'desc' ? -comp : comp;
      });

      // 3. Paginate
      const totalCount = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const startIndex = (pageNumber - 1) * pageSize;
      const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

      return createSuccessResponse(paginatedData, {
        pageNumber,
        pageSize,
        totalCount,
        totalPages,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber < totalPages,
      });
    }
  },

  /**
   * Get single customer profile by ID
   */
  getCustomerById: async (id: string): Promise<ApiResponse<Customer>> => {
    try {
      const res = await http.get<ApiResponse<Customer>>(`/customers/${id}`);
      return res.data;
    } catch {
      await mockDelay(150);
      const customer = inMemoryCustomers.find((c) => c.id === id);
      if (!customer) {
        return createErrorResponse('CUSTOMER_NOT_FOUND', `Customer with ID ${id} not found.`);
      }
      return createSuccessResponse(customer);
    }
  },

  /**
   * Create a new customer
   */
  createCustomer: async (input: CustomerCreateInput): Promise<ApiResponse<Customer>> => {
    try {
      const res = await http.post<ApiResponse<Customer>>('/customers', input);
      return res.data;
    } catch {
      await mockDelay(250);

      // Validate unique phone number
      const existingPhone = inMemoryCustomers.find(
        (c) => c.phoneNumber.trim() === input.phoneNumber.trim(),
      );
      if (existingPhone) {
        return createErrorResponse('VALIDATION_ERROR', 'Số điện thoại này đã được sử dụng.', [
          { field: 'phoneNumber', message: 'Số điện thoại này đã thuộc về khách hàng khác.' },
        ]);
      }

      const nextCodeNum = inMemoryCustomers.length + 1;
      const customerCode = `KH${nextCodeNum.toString().padStart(3, '0')}`;
      const now = new Date().toISOString();

      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        customerCode,
        fullName: input.fullName.trim(),
        phoneNumber: input.phoneNumber.trim(),
        email: input.email?.trim() || undefined,
        gender: input.gender ?? 'other',
        birthday: input.birthday || undefined,
        address: input.address?.trim() || undefined,
        notes: input.notes?.trim() || undefined,
        memberType: input.memberType ?? 'standard',
        status: input.status ?? 'active',
        isGuest: input.isGuest ?? false,
        totalBookings: 0,
        totalRevenue: 0,
        bookingFrequency: 'Chưa có',
        joinDate: now.split('T')[0] ?? '',
        createdDate: now,
        updatedDate: now,
      };

      inMemoryCustomers.unshift(newCustomer);
      return createSuccessResponse(newCustomer, null, 'Tạo khách hàng mới thành công.');
    }
  },

  /**
   * Update an existing customer
   */
  updateCustomer: async (
    id: string,
    input: CustomerUpdateInput,
  ): Promise<ApiResponse<Customer>> => {
    try {
      const res = await http.put<ApiResponse<Customer>>(`/customers/${id}`, input);
      return res.data;
    } catch {
      await mockDelay(200);

      const index = inMemoryCustomers.findIndex((c) => c.id === id);
      if (index === -1) {
        return createErrorResponse('CUSTOMER_NOT_FOUND', `Customer with ID ${id} not found.`);
      }

      // Check phone uniqueness against other customers
      const duplicatePhone = inMemoryCustomers.find(
        (c) => c.id !== id && c.phoneNumber.trim() === input.phoneNumber.trim(),
      );
      if (duplicatePhone) {
        return createErrorResponse('VALIDATION_ERROR', 'Số điện thoại này đã được sử dụng.', [
          { field: 'phoneNumber', message: 'Số điện thoại này đã thuộc về khách hàng khác.' },
        ]);
      }

      const existing = inMemoryCustomers[index]!;
      const updatedCustomer: Customer = {
        ...existing,
        fullName: input.fullName.trim(),
        phoneNumber: input.phoneNumber.trim(),
        email: input.email !== undefined ? input.email.trim() : existing.email,
        gender: input.gender ?? existing.gender,
        birthday: input.birthday !== undefined ? input.birthday : existing.birthday,
        address: input.address !== undefined ? input.address.trim() : existing.address,
        notes: input.notes !== undefined ? input.notes.trim() : existing.notes,
        memberType: input.memberType ?? existing.memberType,
        status: input.status ?? existing.status,
        updatedDate: new Date().toISOString(),
      };

      inMemoryCustomers[index] = updatedCustomer;
      return createSuccessResponse(updatedCustomer, null, 'Cập nhật khách hàng thành công.');
    }
  },

  /**
   * Deactivate or toggle status of customer
   */
  deactivateCustomer: async (id: string): Promise<ApiResponse<Customer>> => {
    try {
      const res = await http.patch<ApiResponse<Customer>>(`/customers/${id}/deactivate`);
      return res.data;
    } catch {
      await mockDelay(150);
      const index = inMemoryCustomers.findIndex((c) => c.id === id);
      if (index === -1) {
        return createErrorResponse('CUSTOMER_NOT_FOUND', `Customer with ID ${id} not found.`);
      }

      const customer = inMemoryCustomers[index]!;
      customer.status = customer.status === 'active' ? 'inactive' : 'active';
      customer.updatedDate = new Date().toISOString();

      return createSuccessResponse(
        customer,
        null,
        customer.status === 'active'
          ? 'Kích hoạt khách hàng thành công.'
          : 'Ngừng hoạt động khách hàng thành công.',
      );
    }
  },

  /**
   * Convert guest customer to registered member
   */
  convertGuestToCustomer: async (
    guestId: string,
    data?: Partial<CustomerCreateInput>,
  ): Promise<ApiResponse<Customer>> => {
    try {
      const res = await http.post<ApiResponse<Customer>>(`/customers/${guestId}/convert`, data);
      return res.data;
    } catch {
      await mockDelay(200);
      const index = inMemoryCustomers.findIndex((c) => c.id === guestId);
      if (index === -1) {
        return createErrorResponse('CUSTOMER_NOT_FOUND', 'Guest customer not found.');
      }

      const existing = inMemoryCustomers[index]!;
      const converted: Customer = {
        ...existing,
        ...data,
        isGuest: false,
        memberType: data?.memberType ?? 'bronze',
        updatedDate: new Date().toISOString(),
      };

      inMemoryCustomers[index] = converted;
      return createSuccessResponse(converted, null, 'Chuyển đổi khách vãng lai thành hội viên thành công.');
    }
  },

  /**
   * Get booking history for a specific customer
   */
  getCustomerBookings: async (
    customerId: string,
    params?: BookingHistoryParams,
  ): Promise<ApiResponse<CustomerBookingHistory[]>> => {
    try {
      const res = await http.get<ApiResponse<CustomerBookingHistory[]>>(
        `/customers/${customerId}/bookings`,
        { params },
      );
      return res.data;
    } catch {
      await mockDelay(200);

      const customer = inMemoryCustomers.find((c) => c.id === customerId);
      if (!customer) {
        return createErrorResponse('CUSTOMER_NOT_FOUND', 'Customer not found.');
      }

      let history = inMemoryBookings[customerId] ?? [];

      // If customer has no specific mock bookings seeded, create realistic history dynamically
      if (history.length === 0 && customer.totalBookings > 0) {
        history = Array.from({ length: Math.min(customer.totalBookings, 8) }).map((_, i) => ({
          id: `b-${customerId}-${i + 1}`,
          bookingNumber: `BK-202609${(25 - i).toString().padStart(2, '0')}-0${i + 1}`,
          bookingDate: `2026-09-${(25 - i).toString().padStart(2, '0')}`,
          courtId: `court-${(i % 6) + 1}`,
          courtName: `Sân ${(i % 6) + 1}${i % 3 === 0 ? ' (VIP)' : ''}`,
          startTime: `${16 + (i % 3)}:00`,
          endTime: `${18 + (i % 3)}:00`,
          durationMinutes: 120,
          totalAmount: 240000,
          bookingStatus: i === 0 ? 'confirmed' : 'completed',
          paymentStatus: 'paid',
          notes: i % 2 === 0 ? 'Khách quen đặt sân định kỳ' : undefined,
          createdDate: new Date(Date.now() - i * 86400000 * 3).toISOString(),
        }));
        inMemoryBookings[customerId] = history;
      }

      // Filter by status if provided
      if (params?.bookingStatus && params.bookingStatus !== 'all') {
        history = history.filter((b) => b.bookingStatus === params.bookingStatus);
      }
      if (params?.paymentStatus && params.paymentStatus !== 'all') {
        history = history.filter((b) => b.paymentStatus === params.paymentStatus);
      }

      return createSuccessResponse(history, {
        pageNumber: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 10,
        totalCount: history.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      });
    }
  },

  /**
   * Real-time customer search (by name, phone, code) with fast response for autocomplete
   */
  searchCustomers: async (query: string): Promise<ApiResponse<Customer[]>> => {
    try {
      const res = await http.get<ApiResponse<Customer[]>>('/customers/search', {
        params: { q: query },
      });
      return res.data;
    } catch {
      await mockDelay(100);
      const clean = query.trim().toLowerCase();
      if (!clean) {
        return createSuccessResponse(inMemoryCustomers.slice(0, 5));
      }

      const results = inMemoryCustomers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(clean) ||
          c.phoneNumber.includes(clean) ||
          c.customerCode.toLowerCase().includes(clean),
      );

      return createSuccessResponse(results.slice(0, 8));
    }
  },

  /**
   * Get overview statistics and analytics for dashboard
   */
  getCustomerStats: async (): Promise<ApiResponse<CustomerStatsOverview>> => {
    try {
      const res = await http.get<ApiResponse<CustomerStatsOverview>>('/customers/stats');
      return res.data;
    } catch {
      await mockDelay(150);

      const totalCustomers = inMemoryCustomers.length;
      const activeCustomers = inMemoryCustomers.filter((c) => c.status === 'active').length;
      const vipCustomers = inMemoryCustomers.filter(
        (c) => c.memberType === 'gold' || c.memberType === 'platinum',
      ).length;
      const newCustomersThisMonth = 4;

      const monthlyTrend = [
        { month: 'T4/2026', count: 18 },
        { month: 'T5/2026', count: 24 },
        { month: 'T6/2026', count: 32 },
        { month: 'T7/2026', count: 45 },
        { month: 'T8/2026', count: 58 },
        { month: 'T9/2026', count: 72 },
      ];

      const topRevenueCustomers = [...inMemoryCustomers]
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          fullName: c.fullName,
          customerCode: c.customerCode,
          totalRevenue: c.totalRevenue,
          memberType: c.memberType,
        }));

      const memberCounts: Record<string, number> = {};
      inMemoryCustomers.forEach((c) => {
        memberCounts[c.memberType] = (memberCounts[c.memberType] || 0) + 1;
      });

      const memberDistribution = Object.entries(memberCounts).map(([type, count]) => ({
        type: type as Customer['memberType'],
        count,
        percentage: Math.round((count / totalCustomers) * 100),
      }));

      return createSuccessResponse({
        totalCustomers,
        activeCustomers,
        vipCustomers,
        newCustomersThisMonth,
        monthlyTrend,
        topRevenueCustomers,
        memberDistribution,
      });
    }
  },
};
