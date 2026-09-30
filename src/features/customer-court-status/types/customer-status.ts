export type CustomerCourtStatusType = 'AVAILABLE' | 'BOOKED' | 'LOCKED' | 'EVENT' | 'PAST';

export enum SchedulerSlotState {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  LOCKED = 'LOCKED',
  EVENT = 'EVENT',
  PAST = 'PAST',
  SELECTED = 'SELECTED',
}

export interface CustomerCourtStatusConfig {
  id: CustomerCourtStatusType;
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
  tooltip: string;
}

export const CUSTOMER_COURT_STATUS: Record<CustomerCourtStatusType, CustomerCourtStatusConfig> = {
  AVAILABLE: {
    id: 'AVAILABLE',
    name: 'Trống',
    color: '#FFFFFF',
    textColor: '#1E293B',
    borderColor: '#CBD5E1',
    tooltip: 'Khung giờ còn trống, nhấp để đặt sân',
  },
  BOOKED: {
    id: 'BOOKED',
    name: 'Đã đặt',
    color: '#FF6666',
    textColor: '#FFFFFF',
    borderColor: '#EF4444',
    tooltip: 'Sân đã có người đặt',
  },
  LOCKED: {
    id: 'LOCKED',
    name: 'Khóa',
    color: '#AFAFAF',
    textColor: '#FFFFFF',
    borderColor: '#94A3B8',
    tooltip: 'Sân tạm thời khóa / bảo trì',
  },
  EVENT: {
    id: 'EVENT',
    name: 'Sự kiện',
    color: '#E39AFD',
    textColor: '#FFFFFF',
    borderColor: '#C084FC',
    tooltip: 'Dành cho sự kiện / giải đấu',
  },
  PAST: {
    id: 'PAST',
    name: 'Đã qua',
    color: '#05111dff',
    textColor: '#425568ff',
    borderColor: '#CBD5E1',
    tooltip: 'Khung giờ đã qua không thể đặt sân (Past time slots cannot be booked)',
  },
} as const;
