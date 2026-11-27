import type { PaginationMetadata } from '@/types/api';

export interface Owner {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  businessName: string;
  taxId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerSearchParams {
  keyword?: string;
  isActive?: boolean;
  sortBy?: 'latest';
  includeUnlinked?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface OwnerPage {
  data: OwnerListItem[];
  metadata: PaginationMetadata | null;
}

export type OwnerListItem = Owner | (Omit<Owner, 'id'> & { id: null });

export interface CreateOwnerRequest {
  userId: string;
  businessName: string;
  taxId?: string;
  isActive: boolean;
}

export interface UpdateOwnerRequest {
  businessName: string;
  taxId?: string;
  isActive: boolean;
}
