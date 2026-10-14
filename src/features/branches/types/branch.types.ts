import type { PaginationMetadata } from '@/types/api';
import type {
  BranchAmenityDto,
  BranchImageDto,
  BranchCourtDto,
  BranchOperatingHourDto,
  BranchPricingDto,
} from './branch-detail.types';

export type {
  BranchAmenityDto,
  BranchImageDto,
  BranchCourtDto,
  BranchOperatingHourDto,
  BranchPricingDto,
};

export interface BranchListItemDto {
  id: string;
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
  isActive: boolean;
  branchAmenities: BranchAmenityDto[];
  images: BranchImageDto[];
  operatingHours: BranchOperatingHourDto[];
  courts: BranchCourtDto[];
  branchPricings: BranchPricingDto[];
}

export interface BranchSearchRequest {
  keyword?: string;
  city?: string;
  district?: string;
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface BranchSearchResponse {
  branches: BranchListItemDto[];
  metadata: PaginationMetadata;
}
