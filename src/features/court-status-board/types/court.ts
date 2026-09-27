export interface CourtItem {
  id: string;
  name: string;
  courtNumber: number;
  courtGroupId?: string;
  branchId: string;
  isActive: boolean;
  pricePerHour: number;
}

export interface CourtBranch {
  id: string;
  name: string;
  address?: string;
}

export interface CourtGroup {
  id: string;
  name: string;
  branchId: string;
}
