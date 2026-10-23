import { http } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  AssignUserRolesRequest,
  RoleListItem,
  UserListItem,
  UserRoleDetail,
} from '../types/user.types';

export const getUsers = async (): Promise<UserListItem[]> => {
  const { data: response } = await http.get<ApiResponse<UserListItem[]>>('/users/getlist');
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const getRoles = async (): Promise<RoleListItem[]> => {
  const roles: RoleListItem[] = [];
  let pageNumber = 1;
  let pageSize: number | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    if (pageNumber > 1 && pageSize === undefined) {
      throw new Error('Không thể tải đầy đủ danh sách vai trò do thiếu thông tin phân trang.');
    }
    const response: ApiResponse<RoleListItem[]> = (
      await http.get<ApiResponse<RoleListItem[]>>('/roles', {
        params:
          pageNumber === 1 ? undefined : { PageNumber: pageNumber, PageSize: pageSize },
      })
    ).data;

    if (!response.success) throw new Error(response.message);
    roles.push(...response.data);
    pageSize = response.metadata?.pageSize;
    hasNextPage = response.metadata?.hasNextPage ?? false;
    pageNumber += 1;
  }

  return roles;
};

export const getUserRoles = async (userId: string): Promise<UserRoleDetail[]> => {
  const { data: response } = await http.get<ApiResponse<UserRoleDetail[]>>(
    `/users/${encodeURIComponent(userId)}/roles`,
  );
  if (!response.success) throw new Error(response.message);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const { data: response } = await http.delete<ApiResponse<null>>(
    `/users/${encodeURIComponent(userId)}`,
  );
  if (response && response.success === false) throw new Error(response.message);
};

export const assignUserRoles = async (
  userId: string,
  request: AssignUserRolesRequest,
): Promise<void> => {
  const { data: response } = await http.post<ApiResponse<null>>(
    `/users/${encodeURIComponent(userId)}/roles`,
    request,
  );
  if (!response.success) throw new Error(response.message);
};
