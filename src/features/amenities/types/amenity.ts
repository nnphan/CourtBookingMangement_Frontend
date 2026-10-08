export interface Amenity {
  id: string;
  code: string;
  name: string;
  icon?: string | null;
}

export interface GetAmenitiesResponse {
  success: boolean;
  message: string;
  data: Amenity[];
}
