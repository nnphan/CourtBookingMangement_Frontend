import { Archive, Camera, Fan, ParkingCircle, Sparkles, Wifi, type LucideIcon } from 'lucide-react';

const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  parking: ParkingCircle,
  'air-conditioner': Fan,
  camera: Camera,
  locker: Archive,
};

export const getAmenityIcon = (icon?: string | null): LucideIcon =>
  AMENITY_ICONS[icon?.toLowerCase() ?? ''] ?? Sparkles;
