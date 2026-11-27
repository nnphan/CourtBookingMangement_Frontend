import type { PaginationMetadata } from '@/types/api';

export type StaffStatus = 'ACTIVE' | 'INACTIVE';
export type StaffActivationStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type StaffInvitationDeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';
export type StaffSortField =
  | 'displayName'
  | 'email'
  | 'staffCode'
  | 'status'
  | 'createdAt'
  | 'lastLoginAt';

export interface StaffListParams {
  branchId?: string;
  search?: string;
  status?: StaffStatus;
  activationStatus?: StaffActivationStatus;
  sortBy?: StaffSortField;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}

export interface StaffBranch {
  branchId: string;
  branchName: string;
  assignmentStatus: string;
  staffCode: string | null;
  jobTitle: string | null;
  employmentStartDate: string | null;
  notes: string | null;
}

export interface StaffOwnedBranch {
  branchId: string;
  branchName: string;
  canCreateStaff: boolean;
}

export interface StaffDetail {
  userId: string;
  displayName: string;
  email: string;
  phoneNumber: string | null;
  status: StaffStatus;
  activationStatus: StaffActivationStatus;
  invitationDeliveryStatus: StaffInvitationDeliveryStatus | null;
  branches: StaffBranch[];
  lastLoginAt: string | null;
  createdAt: string;
}

export interface StaffListItem extends StaffDetail {
  staffCode: string | null;
}

export interface StaffListResult {
  data: StaffListItem[];
  metadata: PaginationMetadata;
}

export interface CreateStaffRequest {
  displayName: string;
  email: string;
  phoneNumber: string;
  password: string;
  branchIds: string[];
  employmentStartDate?: string | null;
  notes?: string | null;
}

export interface CreateStaffResponse {
  userId: string;
  invitationDeliveryStatus?: 'SENT' | 'FAILED' | null;
  staffCode?: string | null;
  warningCode: string | null;
}
