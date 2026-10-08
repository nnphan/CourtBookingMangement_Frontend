import { z } from 'zod';

export const branchFormSchema = z
  .object({
    branchName: z.string().trim().min(1, 'validation.branchNameRequired'),
    phone: z.string().trim().min(1, 'validation.phoneRequired'),
    description: z.string().optional(),
    city: z.string().trim().min(1, 'validation.cityRequired'),
    district: z.string().trim().min(1, 'validation.districtRequired'),
    address: z.string().trim().min(1, 'validation.addressRequired'),
    latitude: z.number().optional().or(z.nan()),
    longitude: z.number().optional().or(z.nan()),
    openTime: z.string().min(1, 'validation.openTimeRequired'),
    closeTime: z.string().min(1, 'validation.closeTimeRequired'),
    amenityIds: z.array(z.string()),
    images: z.array(z.string()),
    pricing: z.array(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        timeRange: z.string(),
        pricePerHour: z.number(),
        description: z.string().optional(),
      }),
    ),
    courts: z.array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        surface: z.enum(['bwf_mat', 'wood', 'acrylic', 'pvc']),
        category: z.enum(['standard', 'vip', 'training']),
        status: z.enum(['available', 'maintenance', 'occupied']),
        pricePerHour: z.number().optional(),
      }),
    ),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .refine((values) => values.closeTime > values.openTime, {
    path: ['closeTime'],
    message: 'validation.closeAfterOpen',
  });
