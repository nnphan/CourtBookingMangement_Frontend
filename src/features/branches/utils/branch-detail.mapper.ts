import type { BranchImageDto } from '../types/branch-detail.types';

/**
 * Trims seconds from "HH:mm:ss" -> "HH:mm"
 */
export function formatTimeSpan(timeStr?: string | null): string {
  if (!timeStr) return '';
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return timeStr.trim();
}

/**
 * Formats time range: "05:30:00" & "23:30:00" -> "05:30 - 23:30"
 */
export function formatTimeRange(openTime?: string | null, closeTime?: string | null): string {
  if (!openTime && !closeTime) return '-';
  const start = formatTimeSpan(openTime);
  const end = formatTimeSpan(closeTime);
  if (start && end) return `${start} - ${end}`;
  return start || end || '-';
}

/**
 * Formats currency amount using Intl.NumberFormat('vi-VN') + " VNĐ"
 * Example: 80000 -> "80.000 VNĐ"
 */
export function formatBranchPrice(price?: number | null): string {
  if (price === undefined || price === null || isNaN(price)) return '0 VNĐ';
  return `${new Intl.NumberFormat('vi-VN').format(price)} VNĐ`;
}

/**
 * Maps pricing type code to Vietnamese human-readable label
 */
export function mapPricingTypeLabel(pricingType?: string | null): string {
  if (!pricingType) return 'Giờ thường';
  const upper = pricingType.toUpperCase().trim();
  switch (upper) {
    case 'NORMAL':
      return 'Giờ thường';
    case 'PEAK':
      return 'Giờ cao điểm';
    case 'WEEKEND':
      return 'Cuối tuần';
    default:
      return pricingType;
  }
}

/**
 * Normalizes branch images whether returned as objects or plain string URLs
 */
export function normalizeBranchImages(
  images?: (BranchImageDto | string)[] | null,
): BranchImageDto[] {
  if (!images || !Array.isArray(images)) return [];
  return images.map((img, idx) => {
    if (typeof img === 'string') {
      return { imageUrl: img, sortOrder: idx };
    }
    return {
      imageUrl: img.imageUrl,
      sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : idx,
    };
  });
}

/**
 * Builds standard full address string: "${address}, ${district}, ${city}"
 */
export function buildFullAddress(
  address?: string | null,
  district?: string | null,
  city?: string | null,
): string {
  return [address, district, city]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(', ');
}
