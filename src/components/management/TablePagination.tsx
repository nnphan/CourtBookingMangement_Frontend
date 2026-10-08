import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import { cn } from '@/lib/utils';

const PAGE_SIZES = [10, 20, 50, 100];

interface TablePaginationProps {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  /** Translated plural noun for the records, e.g. "branches". */
  itemsLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  itemsLabel,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation();
  const { formatNumber } = useLocaleFormatters();

  const from = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const to = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="font-medium">
          <Trans
            t={t}
            i18nKey="management.pagination.showing"
            values={{
              from: formatNumber(from),
              to: formatNumber(to),
              total: formatNumber(totalCount),
              items: itemsLabel,
            }}
            components={{ bold: <span className="font-semibold text-slate-900" /> }}
          />
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 hidden md:inline">
            {t('management.pagination.rowsPerPage')}
          </span>
          <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
            <SelectTrigger
              aria-label={t('management.pagination.rowsPerPage')}
              className="h-9 w-20 rounded-lg bg-white border-slate-200 text-sm font-semibold"
            >
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="h-9 px-3 rounded-lg"
        >
          <ChevronLeft aria-hidden className="size-4" />
          {t('management.pagination.previous')}
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
            let p = idx + 1;
            if (totalPages > 5 && pageNumber > 3) {
              p = pageNumber - 2 + idx;
              if (p > totalPages) p = totalPages - (4 - idx);
            }
            const isSelected = p === pageNumber;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isSelected ? 'page' : undefined}
                className={cn(
                  'size-9 rounded-lg text-sm font-semibold transition-all',
                  isSelected
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70',
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
          className="h-9 px-3 rounded-lg"
        >
          {t('management.pagination.next')}
          <ChevronRight aria-hidden className="size-4" />
        </Button>
      </div>
    </div>
  );
};
