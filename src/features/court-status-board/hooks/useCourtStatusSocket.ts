import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { courtStatusKeys } from './useCourtStatus';
import type { BookingItem } from '../types/booking';

interface SocketBookingPayload {
  booking: BookingItem;
}

export const useCourtStatusSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: ReturnType<typeof getSocket> | null = null;

    try {
      socket = getSocket();
      socket.connect();

      const handleInvalidate = () => {
        void queryClient.invalidateQueries({ queryKey: courtStatusKeys.all });
      };

      const handleBookingCreated = (_data: SocketBookingPayload | unknown) => {
        handleInvalidate();
      };

      const handleBookingUpdated = (_data: SocketBookingPayload | unknown) => {
        handleInvalidate();
      };

      const handleBookingCancelled = (_data: { bookingId: string } | unknown) => {
        handleInvalidate();
      };

      const handlePaymentCompleted = (_data: { bookingId: string } | unknown) => {
        handleInvalidate();
      };

      socket.on('booking-created', handleBookingCreated);
      socket.on('booking-updated', handleBookingUpdated);
      socket.on('booking-cancelled', handleBookingCancelled);
      socket.on('payment-completed', handlePaymentCompleted);

      // Support alternative camelCase/colon events from backend if present
      socket.on('booking:created', handleBookingCreated);
      socket.on('booking:updated', handleBookingUpdated);
      socket.on('booking:cancelled', handleBookingCancelled);

      return () => {
        if (!socket) return;
        socket.off('booking-created', handleBookingCreated);
        socket.off('booking-updated', handleBookingUpdated);
        socket.off('booking-cancelled', handleBookingCancelled);
        socket.off('payment-completed', handlePaymentCompleted);
        socket.off('booking:created', handleBookingCreated);
        socket.off('booking:updated', handleBookingUpdated);
        socket.off('booking:cancelled', handleBookingCancelled);
      };
    } catch {
      // In case socket server is unavailable in dev environment, continue smoothly
      return undefined;
    }
  }, [queryClient]);
};
