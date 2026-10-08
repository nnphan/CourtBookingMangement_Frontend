export type BranchStatus = 'active' | 'inactive';

export type CourtSurface = 'bwf_mat' | 'wood' | 'acrylic' | 'pvc';
export type CourtCategory = 'standard' | 'vip' | 'training';
export type CourtStatus = 'available' | 'maintenance' | 'occupied';

export interface PricingTier {
  id: string;
  name: string; // e.g. "Weekday Morning", "Weekend", "Peak Hour"
  timeRange: string; // e.g. "06:00 - 17:00"
  pricePerHour: number; // e.g. 120000 VND
  description?: string;
}

export interface CourtItem {
  id: string;
  name: string;
  surface: CourtSurface;
  category: CourtCategory;
  status: CourtStatus;
  pricePerHour?: number;
}

export interface Branch {
  id: string;
  branchName: string;
  slug: string;
  phone: string;
  description: string;
  city: string;
  district: string;
  address: string;
  latitude?: number;
  longitude?: number;
  /** Daily opening time, 24h "HH:mm". Applies to every day of the week. */
  openTime: string;
  /** Daily closing time, 24h "HH:mm". Must be later than openTime. */
  closeTime: string;
  images: string[];
  coverImage?: string;
  pricing: PricingTier[];
  courts: CourtItem[];
  totalCourts: number;
  status: BranchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BranchStats {
  totalBranches: number;
  activeBranches: number;
  inactiveBranches: number;
  totalCourts: number;
}

export interface BranchSearchParams {
  keyword?: string;
  city?: string;
  district?: string;
  status?: 'all' | 'active' | 'inactive';
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCourtInput {
  name: string;
  surface: CourtSurface;
  category: CourtCategory;
  status: CourtStatus;
  pricePerHour?: number;
}

export interface CreateBranchInput {
  branchName: string;
  phone: string;
  description?: string;
  city: string;
  district: string;
  address: string;
  latitude?: number;
  longitude?: number;
  openTime: string;
  closeTime: string;
  images: string[];
  pricing: PricingTier[];
  courts: (CreateCourtInput & { id?: string })[];
  status?: BranchStatus;
}

export interface UpdateBranchInput extends Partial<CreateBranchInput> {
  id: string;
}
