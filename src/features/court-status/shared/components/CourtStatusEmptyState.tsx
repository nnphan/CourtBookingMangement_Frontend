import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarX2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourtStatusEmptyStateProps {
  title?: string;
  description?: string;
  date?: string;
  onCreateBooking?: () => void;
}

export const CourtStatusEmptyState: React.FC<CourtStatusEmptyStateProps> = memo(
  ({ title, description, date, onCreateBooking }) => {
    const { t } = useTranslation();

    return (
      <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
          <CalendarX2 className="size-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          {title || t('courtStatus.empty.title', 'Không có lịch đặt nào')}
        </h3>
        <p className="mt-1 mb-4 max-w-sm text-xs text-slate-500">
          {description ||
            (date
              ? t(
                  'courtStatus.empty.dateDescription',
                  `Chưa có lịch đặt nào vào ngày ${date}. Bạn có thể bấm vào khung giờ trên sân để thêm mới.`,
                )
              : t('courtStatus.empty.description', 'Chưa có lịch đặt nào trong ngày đã chọn.'))}
        </p>
        {onCreateBooking && (
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateBooking}
            className="bg-emerald-600 text-xs hover:bg-emerald-700"
          >
            <Plus className="mr-1 size-3.5" />
            {t('courtStatus.empty.createBtn', 'Tạo lịch đặt ngay')}
          </Button>
        )}
      </div>
    );
  },
);

CourtStatusEmptyState.displayName = 'CourtStatusEmptyState';
