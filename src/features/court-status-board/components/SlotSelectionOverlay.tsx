import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SlotSelectionRange } from '../types/common';
import { SchedulerService } from '../services/scheduler.service';
import { useCourtStatusStore } from '../store/court-status.store';
import { CalendarPlus, AlertTriangle, AlertCircle, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotSelectionOverlayProps {
  courtId: string;
  selection: SlotSelectionRange;
  slotWidth: number;
  slotInterval: number;
  rowHeight?: number;
  onConfirm: (selection: SlotSelectionRange) => void;
  onClear: () => void;
}

export const SlotSelectionOverlay: React.FC<SlotSelectionOverlayProps> = memo(
  ({
    courtId,
    selection,
    slotWidth,
    slotInterval,
    rowHeight = 44,
    onConfirm,
    onClear,
  }) => {
    const { t } = useTranslation();

    if (selection.courtId !== courtId) return null;

    const { left, width } = SchedulerService.calculateBookingDimensions(
      selection.startTime,
      selection.endTime,
      slotWidth,
      slotInterval,
    );

    const selectedDate = useCourtStatusStore((s) => s.selectedDate);
    const isPastDate = SchedulerService.isPastDate(selectedDate);
    const hasPastSlot = isPastDate || SchedulerService.isPastSlot(selectedDate, selection.startTime);

    const isInvalid = !selection.isConsecutive || selection.hasOverlap || hasPastSlot;

    return (
      <div
        role="region"
        aria-label={`Khung giờ đang chọn: ${selection.courtName} từ ${selection.startTime} đến ${selection.endTime}`}
        style={{
          position: 'absolute',
          left: `${left}px`,
          width: `${width}px`,
          top: 0,
          height: `${rowHeight}px`,
        }}
        className={cn(
          'pointer-events-none z-30 flex items-center justify-between px-2 select-none transition-all',
          hasPastSlot
            ? 'bg-slate-300/30 border-2 border-dashed border-slate-400 shadow-md'
            : selection.hasOverlap
              ? 'bg-rose-500/20 border-2 border-dashed border-rose-500 shadow-md'
              : !selection.isConsecutive
                ? 'bg-amber-500/20 border-2 border-dashed border-amber-500 shadow-md'
                : 'bg-emerald-500/20 border-2 border-emerald-600 shadow-md',
        )}
      >
        {/* Selected Range Info Label */}
        <div className="flex items-center gap-1.5 truncate text-xs font-bold drop-shadow-xs">
          {hasPastSlot ? (
            <span className="flex items-center gap-1 text-slate-700 bg-white/95 px-2 py-0.5 rounded shadow-xs text-[11px]">
              <Clock className="size-3.5 text-slate-500 shrink-0" />
              <span>{t('courtStatus.selection.pastSlot', 'Khung giờ quá khứ')}</span>
              <span className="font-normal text-slate-500">
                ({selection.startTime} - {selection.endTime})
              </span>
            </span>
          ) : selection.hasOverlap ? (
            <span className="flex items-center gap-1 text-rose-700 bg-white/95 px-2 py-0.5 rounded shadow-xs text-[11px]">
              <AlertCircle className="size-3.5 text-rose-600 shrink-0" />
              <span>{t('courtStatus.selection.overlap', 'Trùng lịch đặt')}</span>
              <span className="font-normal text-rose-600">
                ({selection.startTime} - {selection.endTime})
              </span>
            </span>
          ) : !selection.isConsecutive ? (
            <span className="flex items-center gap-1 text-amber-900 bg-white/95 px-2 py-0.5 rounded shadow-xs text-[11px]">
              <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
              <span>{t('courtStatus.selection.notConsecutive', 'Các khung giờ phải liền kề nhau')}</span>
              {selection.consecutiveError && (
                <span className="font-normal text-amber-700">({selection.consecutiveError})</span>
              )}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-950 bg-white/95 px-2 py-0.5 rounded shadow-xs text-[11px]">
              <span className="text-emerald-700 font-bold">{selection.courtName}</span>
              <span className="text-slate-400">|</span>
              <span className="font-bold">
                {selection.startTime} → {selection.endTime}
              </span>
              <span className="text-emerald-700 font-semibold">({selection.durationFormatted})</span>
            </span>
          )}
        </div>

        {/* Floating Action Trigger Buttons */}
        <div className="pointer-events-auto flex items-center gap-1 shrink-0 animate-in fade-in zoom-in-95 duration-150">
          {/* The Selection Button: User clicks to open Create Booking Dialog */}
          <button
            type="button"
            disabled={isInvalid}
            onClick={(e) => {
              e.stopPropagation();
              if (!isInvalid) onConfirm(selection);
            }}
            title={
              hasPastSlot
                ? 'Past time slots cannot be booked.'
                : selection.hasOverlap
                  ? 'Khoảng thời gian này đã có lịch đặt'
                  : !selection.isConsecutive
                    ? 'Vui lòng chọn các khung giờ liền kề nhau'
                    : `Bấm để tạo đặt sân ${selection.courtName} (${selection.startTime} - ${selection.endTime})`
            }
            className={cn(
              'flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold shadow-md transition-transform active:scale-95 cursor-pointer',
              isInvalid
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg',
            )}
          >
            <CalendarPlus className="size-3.5" />
            <span>
              {hasPastSlot
                ? t('courtStatus.selection.pastSlotBtn', 'Giờ quá khứ')
                : !selection.isConsecutive
                  ? t('courtStatus.selection.nonConsecutiveBtn', 'Chưa liền kề')
                  : selection.hasOverlap
                    ? t('courtStatus.selection.overlapBtn', 'Trùng lịch')
                    : t('courtStatus.selection.bookBtn', 'Đặt lịch')}
            </span>
          </button>

          {/* Clear Selection Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            title={t('courtStatus.selection.clear', 'Hủy chọn')}
            className="grid size-5 place-items-center rounded-full bg-white/95 text-slate-500 hover:bg-white hover:text-slate-800 shadow-xs cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    );
  },
);

SlotSelectionOverlay.displayName = 'SlotSelectionOverlay';
