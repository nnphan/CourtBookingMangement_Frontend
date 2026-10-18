import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  HelpCircle,
  PlayCircle,
  UserX,
  XCircle,
} from 'lucide-react';

export type BookingStatusVariant = 'warning' | 'info' | 'success' | 'secondary';

export interface BookingStatusConfig {
  label: string;
  variant: BookingStatusVariant;
  badgeClass: string;
  accentClass: string;
  icon: LucideIcon;
  dotColor: string;
}

export const normalizeBookingStatus = (status?: string | null): string =>
  (status || '')
    .trim()
    .replace(/-/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();

export const getBookingStatusLabel = (status?: string | null): string => {
  const normalized = normalizeBookingStatus(status);
  switch (normalized) {
    case 'PENDING':
      return 'Chờ nhận sân';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'CHECKED_IN':
      return 'Đang chơi';
    case 'COMPLETED':
      return 'Hoàn thành';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'NO_SHOW':
      return 'Không đến';
    default:
      return 'Không xác định';
  }
};

/**
 * Returns design system variant name for booking status
 * PENDING -> "warning"
 * CHECKED_IN -> "info"
 * COMPLETED -> "success"
 * default -> "secondary"
 */
export const getBookingStatusVariant = (status?: string | null): BookingStatusVariant => {
  const normalized = normalizeBookingStatus(status);
  switch (normalized) {
    case 'PENDING':
      return 'warning';
    case 'CONFIRMED':
      return 'success';
    case 'CHECKED_IN':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'secondary';
    default:
      return 'secondary';
  }
};

/**
 * Returns full configuration including Tailwind classes, icon, and colors
 */
export const getBookingStatusConfig = (status?: string | null): BookingStatusConfig => {
  const normalized = normalizeBookingStatus(status);
  switch (normalized) {
    case 'PENDING':
      return {
        label: 'Chờ xác nhận',
        variant: 'warning',
        badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
        accentClass: 'bg-amber-500',
        icon: Clock3,
        dotColor: 'bg-amber-500',
      };
    case 'CONFIRMED':
      return {
        label: 'Đã xác nhận',
        variant: 'success',
        badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
        accentClass: 'bg-blue-500',
        icon: BadgeCheck,
        dotColor: 'bg-blue-500',
      };
    case 'CHECKED_IN':
      return {
        label: 'Đang chơi',
        variant: 'info',
        badgeClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        accentClass: 'bg-indigo-500',
        icon: PlayCircle,
        dotColor: 'bg-indigo-500',
      };
    case 'COMPLETED':
      return {
        label: 'Hoàn thành',
        variant: 'success',
        badgeClass: 'border-green-200 bg-green-50 text-green-700',
        accentClass: 'bg-green-500',
        icon: CheckCircle2,
        dotColor: 'bg-green-500',
      };
    case 'CANCELLED':
      return {
        label: 'Đã hủy',
        variant: 'secondary',
        badgeClass: 'border-red-200 bg-red-50 text-red-700',
        accentClass: 'bg-red-500',
        icon: XCircle,
        dotColor: 'bg-red-500',
      };
    case 'NO_SHOW':
      return {
        label: 'Không đến',
        variant: 'secondary',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        accentClass: 'bg-slate-500',
        icon: UserX,
        dotColor: 'bg-slate-500',
      };
    default:
      return {
        label: 'Không xác định',
        variant: 'secondary',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
        accentClass: 'bg-slate-400',
        icon: HelpCircle,
        dotColor: 'bg-gray-400',
      };
  }
};
