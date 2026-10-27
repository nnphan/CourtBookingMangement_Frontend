import { http } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  CreatePermissionRequest,
  Permission,
  PermissionPage,
  PermissionSearchRequest,
  UpdatePermissionRequest,
} from '../types/permission.types';

export const getPermissions = async (
  request: PermissionSearchRequest,
  signal?: AbortSignal,
): Promise<PermissionPage> => {
  const keyword = request.keyword?.trim();
  const { data: response } = await http.get<ApiResponse<Permission[]>>('/permissions', {
    params: {
      keyword: keyword || undefined,
      pageNumber: Math.max(1, request.pageNumber),
      pageSize: request.pageSize,
    },
    signal,
  });
  if (!response.success) throw new Error(response.message);
  return { data: response.data, metadata: response.metadata };
};

export const getPermissionById = async (id: string, signal?: AbortSignal): Promise<Permission> => {
  const { data: response } = await http.get<ApiResponse<Permission>>(
    `/permissions/${encodeURIComponent(id)}`,
    { signal },
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const createPermission = async (
  request: CreatePermissionRequest,
): Promise<Permission> => {
  const { data: response } = await http.post<ApiResponse<Permission>>('/permissions', request);
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const updatePermission = async (
  id: string,
  request: UpdatePermissionRequest,
): Promise<Permission> => {
  const { data: response } = await http.put<ApiResponse<Permission>>(
    `/permissions/${encodeURIComponent(id)}`,
    request,
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const deletePermission = async (id: string): Promise<void> => {
  const { data: response } = await http.delete<ApiResponse<string>>(
    `/permissions/${encodeURIComponent(id)}`,
  );
  if (!response.success) throw new Error(response.message);
};
