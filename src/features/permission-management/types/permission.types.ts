import type { PaginationMetadata } from '@/types/api';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  roleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionSearchRequest {
  keyword?: string;
  pageNumber: number;
  pageSize: number;
}

export interface PermissionPage {
  data: Permission[];
  metadata: PaginationMetadata | null;
}

export interface CreatePermissionRequest {
  code: string;
  name: string;
  description?: string | null;
}

export interface UpdatePermissionRequest {
  name: string;
  description?: string | null;
}
