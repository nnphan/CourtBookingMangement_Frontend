import { http } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  CreateRoleRequest,
  Role,
  RolePage,
  RoleSearchRequest,
  UpdateRoleRequest,
} from '../types/role.types';

export const getRoles = async (
  request: RoleSearchRequest,
  signal?: AbortSignal,
): Promise<RolePage> => {
  const keyword = request.keyword?.trim();
  const { data: response } = await http.get<ApiResponse<Role[]>>('/roles', {
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

export const getRoleById = async (id: string, signal?: AbortSignal): Promise<Role> => {
  const { data: response } = await http.get<ApiResponse<Role>>(
    `/roles/${encodeURIComponent(id)}`,
    { signal },
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const createRole = async (request: CreateRoleRequest): Promise<Role> => {
  const { data: response } = await http.post<ApiResponse<Role>>('/roles', request);
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const updateRole = async (id: string, request: UpdateRoleRequest): Promise<Role> => {
  const { data: response } = await http.put<ApiResponse<Role>>(
    `/roles/${encodeURIComponent(id)}`,
    request,
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  const { data: response } = await http.delete<ApiResponse<string>>(
    `/roles/${encodeURIComponent(id)}`,
  );
  if (!response.success) throw new Error(response.message);
};
