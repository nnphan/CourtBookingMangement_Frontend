import { http } from '@/lib/axios';
import type { Amenity, GetAmenitiesResponse } from '../types/amenity';

export const getAmenities = async (): Promise<Amenity[]> => {
  const response = await http.get<GetAmenitiesResponse>('/amenities');
  if (!response.data.success) {
    throw new Error(response.data.message || 'Không thể tải danh sách tiện ích.');
  }
  return response.data.data;
};
