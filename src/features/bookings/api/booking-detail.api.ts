import { http } from '@/lib/axios';
import type { BookingDetailDto } from '../types/booking.types';

export interface BookingDetailResponse {
  success: boolean;
  message: string;
  data: BookingDetailDto;
}

/**
 * Fetch booking detail by bookingId
 * GET /api/bookings/{bookingId}
 */
export const getBookingDetail = async (bookingId: string): Promise<BookingDetailDto> => {
  const response = await http.get<BookingDetailResponse | BookingDetailDto>(
    `/api/bookings/${bookingId}`,
  );

  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body && (body as { data: unknown }).data) {
    return (body as BookingDetailResponse).data;
  }

  return body as BookingDetailDto;
};

export const bookingDetailApi = {
  getBookingDetail,
};
