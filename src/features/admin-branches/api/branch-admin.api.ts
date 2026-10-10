import { http } from '@/lib/axios';
import type { PaginationMetadata } from '@/types/api';
import type {
  BranchSummaryDto,
  BranchListItemDto,
  BranchListParams,
  BranchListResponse,
} from '../types/branch-admin.types';
import { mapToBranchListResponse } from '../utils/branch.mapper';

interface ApiResponseWrapper<T> {
  success: boolean;
  message: string;
  data: T;
  metadata?: PaginationMetadata | null;
}

export const getBranchSummary = async (): Promise<BranchSummaryDto> => {
  const response = await http.get<ApiResponseWrapper<BranchSummaryDto>>('/admin/branches/summary');

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Không thể tải tổng quan chi nhánh.');
  }

  return response.data.data;
};

export const getBranches = async (params: BranchListParams): Promise<BranchListResponse> => {
  const queryParams: Record<string, unknown> = {
    PageNumber: params.pageNumber,
    PageSize: params.pageSize,
  };

  if (params.keyword?.trim()) {
    queryParams.Keyword = params.keyword.trim();
  }
  if (params.city && params.city !== 'all') {
    queryParams.City = params.city;
  }
  if (params.district && params.district !== 'all') {
    queryParams.District = params.district;
  }
  if (params.isActive !== undefined) {
    queryParams.IsActive = params.isActive;
  }

  const response = await http.get<ApiResponseWrapper<BranchListItemDto[]>>('/admin/branches', {
    params: queryParams,
  });

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Không thể tải danh sách chi nhánh.');
  }

  return mapToBranchListResponse(response.data.data, response.data.metadata);
};

export const deleteBranch = async (id: string): Promise<{ id: string }> => {
  const response = await http.delete<ApiResponseWrapper<{ id: string }>>(`/branches/${id}`);

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Không thể xóa chi nhánh.');
  }

  return response.data.data ?? { id };
};

export const branchAdminApi = {
  getBranchSummary,
  getBranches,
  deleteBranch,
};
