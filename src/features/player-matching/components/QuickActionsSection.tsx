import { CalendarDays, Users, ReceiptText } from 'lucide-react';
import { QuickActionCard } from './QuickActionCard';
import { useMatchStats } from '../hooks/usePlayerMatching';
import { paths } from '@/app/router/paths';

export const QuickActionsSection = () => {
  const { data: statsResponse } = useMatchStats();
  const openMatchesCount = statsResponse?.data?.openMatches ?? 15;

  return (
    <section
      aria-label="Quick Actions"
      className="w-full"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Action 1: Book Court */}
        <QuickActionCard
          icon={<CalendarDays className="size-6" />}
          title="Book Court"
          description="Khám phá và đặt sân cầu lông nhanh chóng tại các cụm sân chất lượng cao."
          route="#branches-section"
        />

        {/* Action 2: Find Match (Featured) */}
        <QuickActionCard
          featured
          icon={<Users className="size-6" />}
          title="Find Match"
          description="Join players looking for teammates. Giao lưu, ghép cặp và cọ xát theo trình độ."
          badge={`${openMatchesCount} Open Matches`}
          route={paths.playerMatching ?? '/player-matching'}
        />

        {/* Action 3: My Booking */}
        <QuickActionCard
          icon={<ReceiptText className="size-6" />}
          title="My Booking"
          description="Quản lý lịch đặt sân, theo dõi thanh toán và xem thông tin trận đấu của bạn."
          route={paths.bookings ?? '/bookings'}
        />
      </div>
    </section>
  );
};
