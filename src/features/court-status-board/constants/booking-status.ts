import { STATUS_COLORS } from './colors';

export interface BookingStatusConfig {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon?: 'alert-circle' | 'dollar' | 'info';
  border?: string;
  description?: string;
}

export const COURT_BOOKING_STATUSES: readonly BookingStatusConfig[] = [
  {
    id: 'available',
    name: 'Trắng',
    color: STATUS_COLORS.AVAILABLE,
    textColor: '#334155',
    border: '#cbd5e1',
    description: 'Sân trống / Chưa có lịch đặt',
  },
  {
    id: 'recurring',
    name: 'Lịch cố định',
    color: STATUS_COLORS.RECURRING_BOOKING,
    textColor: '#ffffff',
    description: 'Lịch đặt cố định hàng tuần / tháng',
  },
  {
    id: 'daily',
    name: 'Lịch ngày',
    color: STATUS_COLORS.DAILY_BOOKING,
    textColor: '#ffffff',
    description: 'Lịch đặt vãng lai theo ngày',
  },
  {
    id: 'flexible',
    name: 'Lịch linh hoạt',
    color: STATUS_COLORS.FLEXIBLE_BOOKING,
    textColor: '#ffffff',
    description: 'Lịch đặt giờ chơi linh động',
  },
  {
    id: 'event',
    name: 'Sự kiện',
    color: STATUS_COLORS.EVENT,
    textColor: '#ffffff',
    icon: 'info',
    description: 'Giải đấu hoặc sự kiện đặc biệt',
  },
  {
    id: 'deposit_pending',
    name: 'Chờ KH cọc',
    color: STATUS_COLORS.DEPOSIT_PENDING,
    textColor: '#ffffff',
    description: 'Chờ khách hàng thanh toán tiền cọc',
  },
  {
    id: 'maintenance',
    name: 'Khóa',
    color: STATUS_COLORS.MAINTENANCE,
    textColor: '#ffffff',
    description: 'Sân bảo trì / tạm ngừng sử dụng',
  },
  {
    id: 'service_unpaid',
    name: 'Chưa T.T dịch vụ',
    color: STATUS_COLORS.SERVICE_UNPAID,
    textColor: '#1e293b',
    icon: 'alert-circle',
    description: 'Chưa thanh toán nước uống, cầu lông, phụ phí',
  },
  {
    id: 'ticket_unpaid',
    name: 'Chưa T.T tiền vé',
    color: STATUS_COLORS.TICKET_UNPAID,
    textColor: '#ffffff',
    icon: 'dollar',
    description: 'Chưa thanh toán tiền giờ thuê sân',
  },
] as const;

export const getStatusConfig = (statusId: string): BookingStatusConfig => {
  const found = COURT_BOOKING_STATUSES.find((s) => s.id === statusId);
  if (found) return found;
  return {
    id: statusId,
    name: statusId,
    color: STATUS_COLORS.DAILY_BOOKING,
    textColor: '#ffffff',
  };
};
