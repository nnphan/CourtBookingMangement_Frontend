export type CourtSurface = 'bwf_mat' | 'wood' | 'acrylic' | 'pvc';

export type CourtCategory = 'standard' | 'vip' | 'training';

export type BranchAmenityId =
  | 'wifi'
  | 'parking'
  | 'air_conditioning'
  | 'shower'
  | 'pro_shop'
  | 'stringing'
  | 'canteen'
  | 'coaching'
  | 'lighting_bwf'
  | 'water_dispenser';

export interface BranchAmenity {
  id: BranchAmenityId;
  name: string;
  icon: string;
  description: string;
}

export interface BranchCourtSummary {
  id: string;
  name: string;
  surface: CourtSurface;
  surfaceLabel: string;
  category: CourtCategory;
  pricePerHour: number;
  isAvailableNow: boolean;
  availableSlotCount: number;
}

export interface BranchOperatingHours {
  open: string; // e.g. "05:00"
  close: string; // e.g. "23:00"
  daysDescription: string; // e.g. "Thứ 2 - Chủ Nhật"
}

export interface BranchCoordinates {
  lat: number;
  lng: number;
}

export interface BadmintonBranch {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  distanceKm?: number;
  coordinates: BranchCoordinates;
  phone: string;
  hotline: string;
  rating: number; // e.g. 4.9
  reviewCount: number; // e.g. 182
  images: string[];
  coverImage: string;
  amenities: BranchAmenityId[];
  courtsCount: number;
  availableCourtsCount: number;
  priceRange: {
    min: number;
    max: number;
    currency: 'VND';
  };
  operatingHours: BranchOperatingHours;
  courts: BranchCourtSummary[];
  isFeatured?: boolean;
  isPromoted?: boolean;
  isOpenNow: boolean;
  description: string;
  rules: string[];
}

export type BranchSortOption =
  | 'recommended'
  | 'rating_desc'
  | 'price_asc'
  | 'price_desc'
  | 'distance_asc'
  | 'courts_desc';

export type TimeSlotCategory = 'all' | 'morning' | 'afternoon' | 'evening' | 'night';

export interface BranchSearchParams {
  keyword?: string;
  city?: string;
  district?: string;
  date?: string; // YYYY-MM-DD
  timeSlot?: TimeSlotCategory;
  startTime?: string;
  endTime?: string;
  courtSurface?: CourtSurface | 'all';
  amenities?: BranchAmenityId[];
  minPrice?: number;
  maxPrice?: number;
  onlyOpenNow?: boolean;
  onlyInstantBooking?: boolean;
  sortBy?: BranchSortOption;
  page?: number;
  pageSize?: number;
}

export interface BranchBookingRequest {
  branchId: string;
  branchName: string;
  courtId: string;
  courtName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationHours: number;
  pricePerHour: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  note?: string;
}

export interface BranchBookingResult {
  bookingId: string;
  bookingCode: string;
  status: 'confirmed' | 'pending';
  branchName: string;
  courtName: string;
  bookingTime: string;
  totalPrice: number;
  createdAt: string;
}
