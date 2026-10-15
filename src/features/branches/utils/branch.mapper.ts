import type {
  BranchImageDto,
  BranchListItemDto,
  BranchOperatingHourDto,
  BranchPricingDto,
} from '../types/branch.types';
import { formatTimeSpan } from './branch-detail.mapper';

export { formatTimeSpan };

export const DEFAULT_BRANCH_IMAGE =
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop';

/**
 * Formats operating hours from BranchOperatingHourDto
 * e.g. "05:30 - 23:30"
 */
export function formatOperatingHours(operatingHour?: BranchOperatingHourDto | null): string {
  if (!operatingHour) return 'Đang cập nhật';
  if (operatingHour.isClosed) return 'Tạm đóng cửa';
  const open = formatTimeSpan(operatingHour.openTime);
  const close = formatTimeSpan(operatingHour.closeTime);
  if (open && close) {
    return `${open} - ${close}`;
  }
  return open || close || 'Đang cập nhật';
}

/**
 * Formats court count: courts.length -> "4 sân"
 */
export function formatCourtCount(count?: number | null): string {
  const safeCount = typeof count === 'number' && !isNaN(count) ? count : 0;
  return `${safeCount} sân`;
}

/**
 * Calculates lowest price from branchPricings
 * Math.min(...branchPricings.map(x => x.pricePerHour))
 */
export function calculateLowestPrice(pricings?: BranchPricingDto[] | null): number | null {
  if (!pricings || !Array.isArray(pricings) || pricings.length === 0) {
    return null;
  }
  const validPrices = pricings
    .map((p) => p.pricePerHour)
    .filter((price) => typeof price === 'number' && !isNaN(price) && price > 0);

  if (validPrices.length === 0) {
    return null;
  }
  return Math.min(...validPrices);
}

/**
 * Formats price amount with Intl.NumberFormat("vi-VN")
 * e.g. 80000 -> "Từ 80.000 VNĐ/giờ"
 */
export function formatLowestPriceDisplay(lowestPrice: number | null): string {
  if (lowestPrice === null) {
    return 'Liên hệ báo giá';
  }
  const formatted = new Intl.NumberFormat('vi-VN').format(lowestPrice);
  return `Từ ${formatted} VNĐ/giờ`;
}

/**
 * Formats simple currency
 * e.g. 80000 -> "80.000 VNĐ"
 */
export function formatCurrencyVND(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 VNĐ';
  }
  return `${new Intl.NumberFormat('vi-VN').format(amount)} VNĐ`;
}

/**
 * Extracts branch thumbnail image with fallback
 */
export function getBranchThumbnail(images?: (BranchImageDto | string)[] | null): string {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return DEFAULT_BRANCH_IMAGE;
  }
  const first = images[0];
  if (typeof first === 'string') {
    return first || DEFAULT_BRANCH_IMAGE;
  }
  const sorted = [...(images as BranchImageDto[])].sort(
    (a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0),
  );
  return sorted[0]?.imageUrl || DEFAULT_BRANCH_IMAGE;
}

/**
 * Returns a human-friendly emoji or symbol for common badminton center amenities
 */
export function getAmenityEmoji(name?: string, icon?: string): string {
  if (icon && icon.trim().length <= 4) {
    return icon.trim();
  }
  const lower = (name || '').toLowerCase();
  if (lower.includes('camera')) return '📷';
  if (lower.includes('vợt')) return '🏸';
  if (lower.includes('giày')) return '👟';
  if (lower.includes('căng tin') || lower.includes('nước') || lower.includes('uống') || lower.includes('cafe'))
    return '☕';
  if (lower.includes('huấn luyện') || lower.includes('hlv') || lower.includes('thầy')) return '🧑‍🏫';
  if (lower.includes('dụng cụ') || lower.includes('shop') || lower.includes('cửa hàng')) return '🛍️';
  if (lower.includes('xe') || lower.includes('bãi đỗ')) return '🅿️';
  if (lower.includes('wifi') || lower.includes('mạng')) return '📶';
  if (lower.includes('tắm') || lower.includes('vòi sen')) return '🚿';
  if (lower.includes('điều hòa') || lower.includes('máy lạnh')) return '❄️';
  if (lower.includes('ghế') || lower.includes('khán đài')) return '🪑';
  return '✓';
}

/**
 * Builds standard location string e.g. "Quận 7, Hồ Chí Minh"
 */
export function formatBranchLocation(branch: Pick<BranchListItemDto, 'district' | 'city'>): string {
  const parts = [branch.district, branch.city].map((s) => s?.trim()).filter(Boolean);
  return parts.join(', ');
}
