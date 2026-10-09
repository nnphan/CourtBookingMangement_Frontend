import { useQuery } from '@tanstack/react-query';
import { getAmenities } from '../services/amenityService';
import type { Amenity } from '../types/branch.types';

export const AMENITIES_QUERY_KEY = ['amenities'] as const;

/**
 * Hook to retrieve master amenities with Loading, Success, Error and Retry support
 */
export const useAmenities = () => {
  return useQuery<Amenity[], Error>({
    queryKey: AMENITIES_QUERY_KEY,
    queryFn: getAmenities,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    gcTime: 1000 * 60 * 60,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
