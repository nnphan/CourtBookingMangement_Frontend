import type { MyBookingListItemDto } from '@/features/bookings/types/booking.types';
import { PlayerMatchDraftDialog } from './PlayerMatchDraftDialog';

interface CreatePlayerMatchDialogProps {
  booking: MyBookingListItemDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePlayerMatchDialog = ({
  booking,
  open,
  onOpenChange,
}: CreatePlayerMatchDialogProps) => (
  <PlayerMatchDraftDialog booking={booking} open={open} onOpenChange={onOpenChange} />
);
