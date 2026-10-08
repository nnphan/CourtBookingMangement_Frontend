import { useQuery } from '@tanstack/react-query';
import { getAmenities } from '../services/amenityService';

export const AMENITIES_QUERY_KEY = ['amenities'] as const;

export const useAmenities = () =>
  useQuery({
    queryKey: AMENITIES_QUERY_KEY,
    queryFn: getAmenities,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
