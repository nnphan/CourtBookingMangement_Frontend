import dayjs from '@/lib/dayjs';
import type { PaginationMetadata } from '@/types/api';
import type {
  BranchListItemDto,
  BranchListResponse,
  BranchFilterValues,
  BranchListParams,
} from '../types/branch-admin.types';

/**
 * Maps API data and pagination metadata to BranchListResponse
 */
export function mapToBranchListResponse(
  data: BranchListItemDto[] | null | undefined,
  metadata?: PaginationMetadata | null,
): BranchListResponse {
  const items = Array.isArray(data) ? data : [];
  const pageNumber = metadata?.pageNumber ?? 1;
  const pageSize = metadata?.pageSize ?? 10;
  const totalCount = metadata?.totalCount ?? items.length;
  const totalPages =
    metadata?.totalPages ?? Math.max(1, Math.ceil(totalCount / (pageSize || 10)));
  const hasPreviousPage = metadata?.hasPreviousPage ?? pageNumber > 1;
  const hasNextPage = metadata?.hasNextPage ?? pageNumber < totalPages;

  const result: BranchListResponse = {
    items,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  };

  Object.defineProperty(result, 'length', {
    get: () => items.length,
    enumerable: false,
    configurable: true,
  });

  return result;
}

/**
 * Maps UI filter values and pagination to API query parameters
 */
export function mapFiltersToParams(
  filters: BranchFilterValues,
  pageNumber: number,
  pageSize: number,
): BranchListParams {
  let isActive: boolean | undefined = undefined;
  if (filters.status === 'active') {
    isActive = true;
  } else if (filters.status === 'inactive') {
    isActive = false;
  }

  return {
    keyword: filters.keyword.trim() || undefined,
    city: filters.city !== 'all' ? filters.city : undefined,
    district: filters.district !== 'all' ? filters.district : undefined,
    isActive,
    pageNumber,
    pageSize,
  };
}

/**
 * Formats date string to DD/MM/YYYY using dayjs
 */
export function formatBranchDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '-';
}

/**
 * Returns fallback '-' for null or empty text
 */
export function formatNullableText(text?: string | null): string {
  if (!text || !text.trim()) return '-';
  return text.trim();
}
