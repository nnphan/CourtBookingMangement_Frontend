import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarX2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  date?: string;
  onCreateBooking?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = memo(({ date, onCreateBooking }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 shadow-xs">
        <CalendarX2 className="size-7" />
      </div>

      <h3 className="text-base font-bold text-slate-800">
        {t('courtStatus.empty.title', 'Không có lịch đặt nào')}
      </h3>

      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
        {date
          ? t('courtStatus.empty.dateDescription', `Chưa có lịch đặt nào vào ngày ${date}. Bạn có thể bấm vào khung giờ trên sân để thêm mới.`)
          : t('courtStatus.empty.description', 'Chưa có lịch đặt nào trong ngày đã chọn.')}
      </p>

      {onCreateBooking && (
        <Button
          variant="primary"
          size="sm"
          onClick={onCreateBooking}
          className="bg-emerald-600 hover:bg-emerald-700 text-xs"
        >
          <Plus className="size-3.5 mr-1" />
          {t('courtStatus.empty.createBtn', 'Tạo lịch đặt ngay')}
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
