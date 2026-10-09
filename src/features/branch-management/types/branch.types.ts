export interface Amenity {
  id: string;
  code?: string;
  name: string;
  icon?: string | null;
}

export interface UploadFileData {
  fileName: string;
  url: string;
  contentType: string;
  size: number;
  category: string;
}

export interface UploadFileResponse {
  success: boolean;
  message: string;
  data: UploadFileData;
}

export interface CreateBranchImage {
  imageUrl: string;
  sortOrder: number;
}

export interface CreateOperatingHour {
  openTime: string; // "05:30:00"
  closeTime: string; // "23:30:00"
  isClosed: boolean;
}

export interface CreateCourt {
  courtNumber: number;
  name: string;
  isActive: boolean;
}

export type PricingType = 'NORMAL' | 'PEAK' | 'WEEKEND';

export interface CreateBranchPricing {
  pricingType: PricingType | string;
  startTime: string; // "05:00:00"
  endTime: string; // "17:00:00"
  pricePerHour: number;
}

export interface CreateBranchRequest {
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
  images: CreateBranchImage[];
  operatingHours: CreateOperatingHour[];
  courts: CreateCourt[];
  branchPricings: CreateBranchPricing[];
}

export interface CreateBranchResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
}

export interface SelectedImageItem {
  id: string;
  file: File;
  previewUrl: string;
}
