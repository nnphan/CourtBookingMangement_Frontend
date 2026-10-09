import { http } from '@/lib/axios';
import type { CreateBranchRequest, CreateBranchResponse } from '../types/branch.types';

/**
 * Branch service for branch creation and management
 * Endpoint: POST /api/branches
 */
export const createBranch = async (
  request: CreateBranchRequest,
): Promise<CreateBranchResponse['data']> => {
  const response = await http.post<CreateBranchResponse>('/branches', request);

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Không thể tạo chi nhánh.');
  }

  return response.data.data;
};

export const branchService = {
  createBranch,
};
