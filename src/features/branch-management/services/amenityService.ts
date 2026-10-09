import { http } from '@/lib/axios';
import type { Amenity } from '../types/branch.types';

interface GetAmenitiesApiResponse {
  success?: boolean;
  message?: string;
  data?: Amenity[];
}

/**
 * Service to fetch master amenities list
 * Endpoint: GET /api/amenities
 */
export const getAmenities = async (): Promise<Amenity[]> => {
  const response = await http.get<GetAmenitiesApiResponse | Amenity[]>('/amenities');

  const payload = response.data;
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload && payload.success === false) {
    throw new Error(payload.message || 'Không thể tải danh sách tiện ích.');
  }

  return [];
};

export const amenityService = {
  getAmenities,
};
