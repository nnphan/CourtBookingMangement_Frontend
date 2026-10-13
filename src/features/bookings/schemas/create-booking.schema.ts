import { z } from 'zod';

export const VIETNAM_PHONE_REGEX = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

export const createBookingSchema = z
  .object({
    customerId: z.string().nullable().optional(),
    customerName: z
      .string({ required_error: 'Tên khách hàng là bắt buộc.' })
      .trim()
      .min(1, 'Tên khách hàng là bắt buộc.'),
    phoneNumber: z
      .string({ required_error: 'Số điện thoại là bắt buộc.' })
      .trim()
      .min(10, 'Số điện thoại gồm ít nhất 10 số')
      .regex(VIETNAM_PHONE_REGEX, 'Số điện thoại không hợp lệ'),
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
