export interface CustomerCourt {
  courtId: string;
  courtName: string;
}

export interface CustomerBranch {
  id: string;
  branchCode: string;
  branchName: string;
  address: string;
  openTime: string;
  closeTime: string;
  rating?: number;
  isActive?: boolean;
}
