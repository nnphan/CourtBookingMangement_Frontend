import React, { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectSeparator,
} from '@/components/ui/select';
import { Clock, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotIntervalSelectProps {
  value: number;
  onChange: (interval: number) => void;
  className?: string;
}

export const SlotIntervalSelect: React.FC<SlotIntervalSelectProps> = memo(
  ({ value, onChange, className }) => {
    return (
      <Select
        value={String(value)}
        onValueChange={(val) => onChange(parseInt(val, 10))}
      >
        <SelectTrigger
          hideChevron
          aria-label="Chọn độ dài khung giờ hiển thị"
          className={cn(
            'h-8 px-2.5 rounded-lg border border-white/20 bg-white/12 hover:bg-white/20 active:bg-white/25 text-white font-medium text-xs shadow-xs transition-all duration-150 flex items-center gap-1.5 group cursor-pointer focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1 focus:ring-offset-emerald-900',
            className,
          )}
        >
          <Clock className="size-3.5 text-emerald-200 shrink-0" />
          <span className="whitespace-nowrap">{value} phút / ô</span>
          <ChevronDown className="size-3 text-white/80 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
        </SelectTrigger>

        <SelectContent
          align="end"
          sideOffset={6}
          className="w-[210px] p-1.5 rounded-xl border border-slate-200/90 bg-white shadow-2xl backdrop-blur-md"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            Độ phân giải lịch
          </div>

          <SelectItem
            value="60"
            className="py-2 px-2.5 rounded-lg text-xs font-medium cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-bold text-slate-900">60 phút (Chuẩn 1 giờ / ô)</span>
              <span className="text-[10px] text-slate-500">Chuẩn đặt sân theo giờ</span>
            </div>
          </SelectItem>

          <SelectItem
            value="30"
            className="py-2 px-2.5 rounded-lg text-xs font-medium cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-bold text-slate-900">30 phút (Chi tiết)</span>
              <span className="text-[10px] text-slate-500">Hiển thị nửa giờ</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  },
);

SlotIntervalSelect.displayName = 'SlotIntervalSelect';
