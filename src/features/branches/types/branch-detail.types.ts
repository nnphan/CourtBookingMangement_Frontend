export interface BranchAmenityDto {
  id: string;
  code?: string;
  name: string;
  icon?: string;
}

export interface BranchImageDto {
  imageUrl: string;
  sortOrder: number;
}

export interface BranchCourtDto {
  courtNumber: number;
  name: string;
  isActive: boolean;
}

export interface BranchOperatingHourDto {
  openTime: string; // "05:30:00" or "05:30"
  closeTime: string; // "23:30:00" or "23:30"
  isClosed: boolean;
}

export interface BranchPricingDto {
  pricingType: 'NORMAL' | 'PEAK' | 'WEEKEND' | string;
  startTime: string; // "05:00:00" or "05:00"
  endTime: string; // "17:00:00" or "17:00"
  pricePerHour: number;
}

export interface BranchDetailDto {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  district: string;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber: string;
  timeZone?: string;
  supportsInstantBooking?: boolean;
  isActive: boolean;
  amenityIds?: string[];
  amenities?: BranchAmenityDto[];
  images?: (BranchImageDto | string)[];
  operatingHours?: BranchOperatingHourDto[];
  courts?: BranchCourtDto[];
  branchPricings?: BranchPricingDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateBranchRequest {
  name: string;
  description: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  timeZone: string;
  supportsInstantBooking: boolean;
  amenityIds: string[];
  images: BranchImageDto[];
  operatingHours: BranchOperatingHourDto[];
  courts: BranchCourtDto[];
  branchPricings: BranchPricingDto[];
}
