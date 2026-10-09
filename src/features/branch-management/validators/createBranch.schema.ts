import { z } from 'zod';
import type { SelectedImageItem } from '../types/branch.types';

// Helper to normalize time to "HH:mm" for comparisons
const timeToMinutes = (timeStr: string): number => {
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  return hours * 60 + minutes;
};

export const operatingHourSchema = z
  .object({
    openTime: z.string().min(1, 'Vui lòng chọn giờ mở cửa'),
    closeTime: z.string().min(1, 'Vui lòng chọn giờ đóng cửa'),
    isClosed: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.isClosed) return true;
      return timeToMinutes(data.closeTime) > timeToMinutes(data.openTime);
    },
    {
      message: 'Giờ đóng cửa phải sau giờ mở cửa',
      path: ['closeTime'],
    },
  );

export const courtItemSchema = z.object({
  courtNumber: z
    .number({ invalid_type_error: 'Số thứ tự sân phải là số' })
    .int('Số thứ tự sân phải là số nguyên')
    .min(1, 'Số thứ tự sân phải lớn hơn hoặc bằng 1'),
  name: z.string().trim().min(1, 'Tên sân không được để trống'),
  isActive: z.boolean().default(true),
});

export const branchPricingSchema = z
  .object({
    pricingType: z.enum(['NORMAL', 'PEAK', 'WEEKEND'], {
      errorMap: () => ({ message: 'Loại bảng giá không hợp lệ' }),
    }),
    startTime: z.string().min(1, 'Vui lòng chọn giờ bắt đầu'),
    endTime: z.string().min(1, 'Vui lòng chọn giờ kết thúc'),
    pricePerHour: z
      .number({ invalid_type_error: 'Giá theo giờ phải là số' })
      .min(1000, 'Giá theo giờ tối thiểu là 1,000 VND'),
  })
  .refine((data) => timeToMinutes(data.endTime) > timeToMinutes(data.startTime), {
    message: 'Giờ kết thúc phải sau giờ bắt đầu',
    path: ['endTime'],
  });

export const createBranchFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Tên chi nhánh bắt buộc nhập (tối thiểu 2 ký tự)'),
    description: z.string().default(''),
    address: z.string().trim().min(5, 'Địa chỉ chi nhánh bắt buộc nhập'),
    city: z.string().trim().min(1, 'Vui lòng chọn hoặc nhập Tỉnh/Thành phố'),
    district: z.string().trim().min(1, 'Vui lòng chọn hoặc nhập Quận/Huyện'),
    phoneNumber: z
      .string()
      .trim()
      .min(8, 'Số điện thoại bắt buộc nhập (tối thiểu 8 ký tự)')
      .regex(/^[0-9+() -]+$/, 'Số điện thoại chứa ký tự không hợp lệ'),
    latitude: z.number().default(10.7303),
    longitude: z.number().default(106.7072),
    timeZone: z.string().default('Asia/Ho_Chi_Minh'),
    supportsInstantBooking: z.boolean().default(true),

    amenityIds: z.array(z.string()).default([]),

    operatingHours: z
      .array(operatingHourSchema)
      .min(1, 'Cần ít nhất 1 cấu hình khung giờ hoạt động'),

    courts: z
      .array(courtItemSchema)
      .min(1, 'Chi nhánh phải có ít nhất 1 sân hoạt động')
      .refine(
        (courts) => {
          const numbers = courts.map((c) => c.courtNumber);
          return new Set(numbers).size === numbers.length;
        },
        {
          message: 'Số thứ tự sân (Court Number) phải là duy nhất, không được trùng lặp',
          path: [0, 'courtNumber'],
        },
      ),

    branchPricings: z
      .array(branchPricingSchema)
      .min(1, 'Chi nhánh phải có ít nhất 1 khung giá'),
  });

export type CreateBranchFormValues = z.infer<typeof createBranchFormSchema>;

export interface CreateBranchFormData extends CreateBranchFormValues {
  selectedImages: SelectedImageItem[];
}
