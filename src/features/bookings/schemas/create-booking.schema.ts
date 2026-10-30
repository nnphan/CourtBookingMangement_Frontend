import { z } from 'zod';

export const VIETNAM_PHONE_REGEX = /^0[0-9]{9,10}$/;

export const normalizePhoneNumber = (phone?: string | null): string => {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[\s.-]/g, '');
  if (cleaned.startsWith('+84')) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
};

export const isValidVietnamPhone = (phone?: string | null): boolean => {
  if (!phone) return false;
  const normalized = normalizePhoneNumber(phone);
  return VIETNAM_PHONE_REGEX.test(normalized);
};

export const createBookingSchema = z
  .object({
    customerId: z.string().nullable().optional(),
    // Not part of the POST /api/bookings contract; kept optional for the admin form UI only.
    customerName: z.string().trim().optional(),
    phoneNumber: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || isValidVietnamPhone(value), {
        message: 'Số điện thoại không hợp lệ',
      }),
    courtId: z.string({ required_error: 'Vui lòng chọn sân' }).min(1, 'Vui lòng chọn sân'),
    bookingDate: z.string({ required_error: 'Vui lòng chọn ngày' }).min(1, 'Vui lòng chọn ngày'),
    startTime: z
      .string({ required_error: 'Giờ bắt đầu là bắt buộc' })
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ bắt đầu không hợp lệ (HH:mm)'),
    endTime: z
      .string({ required_error: 'Giờ kết thúc là bắt buộc' })
      .regex(/^([01]\d|2[0-4]):([0-5]\d)$/, 'Giờ kết thúc không hợp lệ (HH:mm)'),
    bookingType: z.enum(['FLEXIBLE', 'FIXED'], {
      errorMap: () => ({ message: 'Vui lòng chọn loại đặt sân' }),
    }),
    note: z.string().optional(),
  })
  .refine(
    (data) => {
      const [startH, startM] = data.startTime.split(':').map((v) => parseInt(v, 10));
      const [endH, endM] = data.endTime.split(':').map((v) => parseInt(v, 10));
      const startTotal = (startH ?? 0) * 60 + (startM ?? 0);
      const endTotal = (endH ?? 0) * 60 + (endM ?? 0);
      return endTotal > startTotal;
    },
    {
      message: 'Giờ kết thúc phải sau giờ bắt đầu',
      path: ['endTime'],
    },
  );

export type CreateBookingSchemaType = z.infer<typeof createBookingSchema>;

/** Mode-aware schema for CreateBookingDialog. Messages are i18n keys resolved by the dialog. */
export const buildCreateBookingFormSchema = (requireContact: boolean) =>
  z
    .object({
      customerName: z.string().trim().optional(),
      phoneNumber: z.string().trim().optional(),
      paymentMethod: z.enum(['CASH']),
      notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!requireContact) return;
      if (!data.customerName || data.customerName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customerName'],
          message: 'booking.validation.customerNameRequired',
        });
      }
      if (!data.phoneNumber || data.phoneNumber.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phoneNumber'],
          message: 'booking.validation.phoneNumberRequired',
        });
      } else if (!isValidVietnamPhone(data.phoneNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phoneNumber'],
          message: 'booking.validation.phoneNumberInvalid',
        });
      }
    });
