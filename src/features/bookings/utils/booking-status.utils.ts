import type { LucideIcon } from 'lucide-react';
import { Clock, PlayCircle, CheckCircle, HelpCircle } from 'lucide-react';

export type BookingStatusVariant = 'warning' | 'info' | 'success' | 'secondary';

export interface BookingStatusConfig {
  label: string;
  variant: BookingStatusVariant;
  badgeClass: string;
  icon: LucideIcon;
  dotColor: string;
}

/**
 * Returns human-readable Vietnamese label for booking status
 * PENDING -> "Chờ nhận sân"
 * CHECKED_IN -> "Đang chơi"
 * COMPLETED -> "Hoàn thành"
 * default -> "Không xác định"
 */
export const getBookingStatusLabel = (status?: string | null): string => {
  const normalized = (status || '').trim().toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return 'Chờ nhận sân';
    case 'CHECKED_IN':
      return 'Đang chơi';
    case 'COMPLETED':
      return 'Hoàn thành';
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
export const getBookingStatusVariant = (
  status?: string | null,
): BookingStatusVariant => {
  const normalized = (status || '').trim().toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return 'warning';
    case 'CHECKED_IN':
      return 'info';
    case 'COMPLETED':
      return 'success';
    default:
      return 'secondary';
  }
};

/**
 * Returns full configuration including Tailwind classes, icon, and colors
 */
export const getBookingStatusConfig = (
  status?: string | null,
): BookingStatusConfig => {
  const normalized = (status || '').trim().toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return {
        label: 'Chờ nhận sân',
        variant: 'warning',
        badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: Clock,
        dotColor: 'bg-yellow-500',
      };
    case 'CHECKED_IN':
      return {
        label: 'Đang chơi',
        variant: 'info',
        badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',
        icon: PlayCircle,
        dotColor: 'bg-blue-500',
      };
    case 'COMPLETED':
      return {
        label: 'Hoàn thành',
        variant: 'success',
        badgeClass: 'bg-green-100 text-green-700 border-green-300',
        icon: CheckCircle,
        dotColor: 'bg-green-500',
      };
    default:
      return {
        label: 'Không xác định',
        variant: 'secondary',
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: HelpCircle,
        dotColor: 'bg-gray-400',
      };
  }
};
