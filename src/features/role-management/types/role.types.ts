import type { PaginationMetadata } from '@/types/api';

export interface RolePermissionSummary {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  userCount: number;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: RolePermissionSummary[];
}

export interface RoleSearchRequest {
  keyword?: string;
  pageNumber: number;
  pageSize: number;
}

export interface RolePage {
  data: Role[];
  metadata: PaginationMetadata | null;
}

export interface CreateRoleRequest {
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  permissionIds: string[];
}

export type UpdateRoleRequest = CreateRoleRequest;
