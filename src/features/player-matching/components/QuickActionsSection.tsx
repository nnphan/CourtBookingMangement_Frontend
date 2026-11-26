import { CalendarDays, Users, ReceiptText } from 'lucide-react';
import { QuickActionCard } from './QuickActionCard';
import { paths } from '@/app/router/paths';

export const QuickActionsSection = () => {
  return (
    <section aria-label="Quick Actions" className="w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Action 1: Book Court */}
        <QuickActionCard
          variant="emerald"
          icon={<CalendarDays className="size-6" />}
          title="Đặt sân"
          description="Khám phá và đặt sân cầu lông nhanh chóng tại các cụm sân chất lượng cao."
          badge="Đặt sân 24/7"
          actionText="Đặt sân ngay →"
          route="#branches-section"
        />

        {/* Action 2: Find Match (Featured) */}
        <QuickActionCard
          featured
          icon={<Users className="size-6" />}
          title="Tìm trận đấu"
          description="Giao lưu, ghép cặp và cọ xát theo trình độ."
          actionText="Tham gia ngay →"
          route={paths.playerMatching ?? '/player-matching'}
        />

        {/* Action 3: My Booking */}
        <QuickActionCard
          variant="blue"
          icon={<ReceiptText className="size-6" />}
          title="Lịch đặt sân của tôi"
          description="Quản lý lịch đặt sân, theo dõi thanh toán và xem thông tin trận đấu của bạn."
          badge="Lịch & Vé"
          actionText="Xem lịch đặt →"
          route={paths.myBooking}
        />
      </div>
    </section>
  );
};
