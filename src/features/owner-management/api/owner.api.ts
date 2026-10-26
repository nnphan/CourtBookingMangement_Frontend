import { http } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  CreateOwnerRequest,
  Owner,
  OwnerPage,
  OwnerSearchParams,
  UpdateOwnerRequest,
} from '../types/owner.types';

export const getOwners = async (params: OwnerSearchParams): Promise<OwnerPage> => {
  const { data: response } = await http.get<ApiResponse<Owner[]>>('/owners', {
    params: {
      keyword: params.keyword || undefined,
      isActive: params.isActive,
      sortBy: params.sortBy,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    },
  });
  if (!response.success) throw new Error(response.message);
  return { data: response.data, metadata: response.metadata };
};

export const getOwner = async (id: string): Promise<Owner> => {
  const { data: response } = await http.post<ApiResponse<Owner>>(
    `/owners/${encodeURIComponent(id)}`,
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const createOwner = async (request: CreateOwnerRequest): Promise<Owner> => {
  const { data: response } = await http.post<ApiResponse<Owner>>('/owners', request);
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const updateOwner = async (
  id: string,
  request: UpdateOwnerRequest,
): Promise<Owner> => {
  const { data: response } = await http.put<ApiResponse<Owner>>(
    `/owners/${encodeURIComponent(id)}`,
    request,
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const deleteOwner = async (id: string): Promise<void> => {
  const { data: response } = await http.delete<ApiResponse<null> | undefined>(
    `/owners/${encodeURIComponent(id)}`,
  );
  if (response && !response.success) throw new Error(response.message);
};
