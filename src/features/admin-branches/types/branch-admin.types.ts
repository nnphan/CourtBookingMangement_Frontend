export interface BranchSummaryDto {
  totalBranches: number;
  activeBranches: number;
  inactiveBranches: number;
  totalCourts: number;
}

export interface BranchListItemDto {
  id: string;
  name: string;
  city: string | null;
  district: string | null;
  phoneNumber: string;
  totalCourts: number;
  isActive: boolean;
  createdAt: string;
}

export interface BranchListResponse {
  items: BranchListItemDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  length?: number;
}

export interface BranchListParams {
  keyword?: string;
  city?: string;
  district?: string;
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface BranchFilterValues {
  keyword: string;
  city: string;
  district: string;
  status: 'all' | 'active' | 'inactive';
}
