import { http } from '@/lib/axios';
import type { BranchDetailDto, UpdateBranchRequest } from '../types/branch-detail.types';

interface ApiResponseWrapper<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Fetch branch detail by ID
 * Endpoint: GET /api/branches/{id}
 */
export const getBranchDetail = async (branchId: string): Promise<BranchDetailDto> => {
  const response = await http.get<ApiResponseWrapper<BranchDetailDto>>(`/branches/${branchId}`);

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Không thể tải thông tin chi nhánh.');
  }

  return response.data.data;
};

/**
 * Update branch by ID
 * Endpoint: PUT /api/branches/{id}
 */
export const updateBranch = async (
  branchId: string,
  payload: UpdateBranchRequest,
): Promise<BranchDetailDto> => {
  const response = await http.put<ApiResponseWrapper<BranchDetailDto>>(
    `/branches/${branchId}`,
    payload,
  );

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Không thể cập nhật chi nhánh.');
  }

  return response.data.data;
};

export const branchDetailApi = {
  getBranchDetail,
  updateBranch,
};
