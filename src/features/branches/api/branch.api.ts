import { http } from '@/lib/axios';
import type { PaginationMetadata } from '@/types/api';
import type {
  BranchListItemDto,
  BranchSearchRequest,
  BranchSearchResponse,
} from '../types/branch.types';

interface ApiResponseWrapper<T> {
  success: boolean;
  message: string;
  data: T;
  metadata?: PaginationMetadata | null;
}

/**
 * Fetch branches from API with pagination, search, and filters.
 * Endpoint: GET /api/branches
 */
export const getBranches = async (
  params: BranchSearchRequest,
): Promise<BranchSearchResponse> => {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 9;

  const queryParams: Record<string, unknown> = {
    pageNumber,
    pageSize,
  };

  if (params.keyword?.trim()) {
    queryParams.keyword = params.keyword.trim();
  }
  if (params.city && params.city !== 'all') {
    queryParams.city = params.city.trim();
  }
  if (params.district && params.district !== 'all') {
    queryParams.district = params.district.trim();
  }
  if (params.isActive !== undefined) {
    queryParams.isActive = params.isActive;
  } else {
    // Branch Status Protection: Display only active branches
    queryParams.isActive = true;
  }

  const response = await http.get<ApiResponseWrapper<BranchListItemDto[]> | BranchListItemDto[]>(
    '/branches',
    { params: queryParams },
  );

  const raw = response.data;
  let items: BranchListItemDto[] = [];
  let metadata: PaginationMetadata = {
    pageNumber,
    pageSize,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  if (Array.isArray(raw)) {
    items = raw;
    const totalCount = raw.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    metadata = {
      pageNumber,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    };
  } else if (raw && typeof raw === 'object') {
    if ('data' in raw && Array.isArray((raw as { data: unknown }).data)) {
      items = (raw as { data: BranchListItemDto[] }).data;
    }
    if ('metadata' in raw && (raw as { metadata?: PaginationMetadata }).metadata) {
      const meta = (raw as { metadata: PaginationMetadata }).metadata;
      metadata = {
        pageNumber: meta.pageNumber ?? pageNumber,
        pageSize: meta.pageSize ?? pageSize,
        totalCount: meta.totalCount ?? items.length,
        totalPages:
          meta.totalPages ?? Math.max(1, Math.ceil((meta.totalCount ?? items.length) / pageSize)),
        hasPreviousPage: meta.hasPreviousPage ?? pageNumber > 1,
        hasNextPage: meta.hasNextPage ?? pageNumber < (meta.totalPages ?? 1),
      };
    } else {
      const totalCount = items.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      metadata = {
        pageNumber,
        pageSize,
        totalCount,
        totalPages,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber < totalPages,
      };
    }
  }

  // Branch Status Protection: Display only isActive === true branches
  const activeBranches = items.filter((b) => b.isActive !== false);

  return {
    branches: activeBranches,
    metadata,
  };
};

export const branchApi = {
  getBranches,
};
