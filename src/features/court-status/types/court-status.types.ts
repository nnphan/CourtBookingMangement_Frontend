export interface CourtStatusRequest {
  branchId: string;
  date: string;
}

export interface CourtStatusCourtDto {
  courtId: string;
  courtNumber: number;
  courtName: string;
  status: string;
}

export interface CourtScheduleItemDto {
  bookingId: string;
  courtId: string;
  courtNumber: number;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingType: string;
  bookingStatus: string;
  /** V2: unique per Court block; bookingId is the aggregate Booking shared across Courts. */
  bookingDetailId?: string;
  bookingDetailStatus?: string | null;
  bookingCourtCount?: number;
  paymentStatus: string;
  customerName: string;
  phoneNumber: string;
  title: string;
  color: string;
}

export interface CourtStatusDto {
  branchId: string;
  branchName: string;
  date: string;
  openTime: string;
  closeTime: string;
  courts: CourtStatusCourtDto[];
  scheduleItems: CourtScheduleItemDto[];
  isClosed?: boolean;
  timezone?: string;
}

export type BookingStatusType = 'Pending' | 'CheckedIn' | 'Completed' | string;
export type PaymentStatusType = 'UNPAID' | 'PAID' | 'PARTIAL_PAID' | string;
export type CourtStatusType = 'active' | 'inactive' | 'maintenance' | string;

export const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  Pending: {
    label: 'Chờ nhận sân',
    badgeClass: 'bg-amber-500 text-white border-amber-400',
  },
  CheckedIn: {
    label: 'Đang chơi',
    badgeClass: 'bg-emerald-600 text-white border-emerald-400',
  },
  Completed: {
    label: 'Hoàn thành',
    badgeClass: 'bg-blue-600 text-white border-blue-400',
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  UNPAID: {
    label: 'UNPAID',
    badgeClass: 'bg-rose-600 text-white border-rose-500',
  },
  PAID: {
    label: 'PAID',
    badgeClass: 'bg-emerald-600 text-white border-emerald-500',
  },
  PARTIAL_PAID: {
    label: 'PARTIAL_PAID',
    badgeClass: 'bg-amber-600 text-white border-amber-500',
  },
};

export const COURT_STATUS_CONFIG: Record<
  string,
  { label: string; dotClass: string; badgeClass: string }
> = {
  active: {
    label: 'Hoạt động',
    dotClass: 'bg-emerald-500',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  inactive: {
    label: 'Không hoạt động',
    dotClass: 'bg-slate-400',
    badgeClass: 'text-slate-600 bg-slate-50 border-slate-200',
  },
  maintenance: {
    label: 'Bảo trì',
    dotClass: 'bg-amber-500',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
  },
};

export const getBookingStatusInfo = (status: string) => {
  const normalized = (status || '').trim();
  const lower = normalized.toLowerCase();
  if (lower === 'pending' || lower.includes('cho')) {
    return BOOKING_STATUS_CONFIG.Pending;
  }
  if (lower === 'checkedin' || lower === 'checked_in' || lower.includes('choi')) {
    return BOOKING_STATUS_CONFIG.CheckedIn;
  }
  if (lower === 'completed' || lower.includes('hoanthanh') || lower.includes('xong')) {
    return BOOKING_STATUS_CONFIG.Completed;
  }
  return {
    label: normalized || 'Pending',
    badgeClass: 'bg-slate-700 text-white border-slate-600',
  };
};

export const getPaymentStatusInfo = (paymentStatus: string) => {
  const normalized = (paymentStatus || '').trim().toUpperCase();
  if (normalized === 'PAID') {
    return PAYMENT_STATUS_CONFIG.PAID;
  }
  if (normalized === 'PARTIAL_PAID' || normalized === 'PARTIALLY_PAID') {
    return PAYMENT_STATUS_CONFIG.PARTIAL_PAID;
  }
  return PAYMENT_STATUS_CONFIG.UNPAID;
};

export const getCourtStatusInfo = (status: string) => {
  const lower = (status || 'active').trim().toLowerCase();
  return COURT_STATUS_CONFIG[lower] ?? COURT_STATUS_CONFIG.active;
};
