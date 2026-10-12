import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, RotateCw, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMyBranches } from '@/hooks/branches/useMyBranches';
import type { BranchLookupResponse } from '@/types/branch';
import { cn } from '@/lib/utils';

export interface SelectSkeletonProps {
  className?: string;
  variant?: 'default' | 'contrast';
}

/**
 * Skeleton placeholder for BranchSelector while fetching branches
 */
export const SelectSkeleton: React.FC<SelectSkeletonProps> = ({
  className,
  variant = 'default',
}) => {
  return (
    <div
      role="status"
      aria-label="Loading branches..."
      className={cn(
        'flex h-10 w-full min-w-[200px] animate-pulse items-center justify-between rounded-lg px-3',
        variant === 'contrast'
          ? 'border border-white/25 bg-white/20'
          : 'border border-slate-200 bg-slate-100',
        className,
      )}
    >
      <div
        className={cn(
          'h-3.5 w-28 rounded',
          variant === 'contrast' ? 'bg-white/30' : 'bg-slate-300',
        )}
      />
      <div
        className={cn(
          'size-4 rounded-full',
          variant === 'contrast' ? 'bg-white/30' : 'bg-slate-300',
        )}
      />
      <span className="sr-only">Loading branches...</span>
    </div>
  );
};

export interface BranchSelectorProps {
  /** Selected branch ID */
  value?: string;
  /** Callback when branch selection changes */
  onChange: (branchId: string) => void;
  /** Whether selector is disabled */
  disabled?: boolean;
  /** Optional custom CSS classes */
  className?: string;
  /** Visual variant ('contrast' for dark/colored backgrounds e.g. green header, 'default' for standard forms) */
  variant?: 'default' | 'contrast';
  /** Placeholder text */
  placeholder?: string;
  /** Accessible label */
  'aria-label'?: string;
  /** Optional custom branches override; if omitted, automatically uses useMyBranches */
  branches?: BranchLookupResponse[];
  /** Optional custom loading state override */
  isLoading?: boolean;
  /** Optional custom error state override */
  isError?: boolean;
  /** Optional custom retry callback */
  onRetry?: () => void;
}

const EMPTY_BRANCHES: BranchLookupResponse[] = [];

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  variant = 'default',
  placeholder,
  'aria-label': ariaLabel,
  branches: customBranches,
  isLoading: customIsLoading,
  isError: customIsError,
  onRetry: customOnRetry,
}) => {
  const { t } = useTranslation();

  // If custom branches are passed, use them; otherwise fetch from useMyBranches hook
  const {
    data: fetchedBranches,
    isLoading: isFetchingBranches,
    isError: isFetchError,
    refetch,
  } = useMyBranches();

  const branches = customBranches ?? fetchedBranches ?? EMPTY_BRANCHES;
  const isLoading = customIsLoading ?? (customBranches === undefined && isFetchingBranches);
  const isError = customIsError ?? (customBranches === undefined && isFetchError);
  const handleRetry = customOnRetry ?? (() => void refetch());

  // Dropdown mapping: Map API response { id, name } into { value, label }
  const options = useMemo(() => {
    return branches.map((branch) => ({
      value: branch.id,
      label: branch.name,
    }));
  }, [branches]);

  // Loading State: Render SelectSkeleton
  if (isLoading) {
    return <SelectSkeleton variant={variant} className={className} />;
  }

  // Error State: Show error text and Retry button
  if (isError) {
    return (
      <div
        className={cn(
          'flex h-10 w-full min-w-[200px] items-center justify-between gap-2 rounded-lg px-3 text-xs',
          variant === 'contrast'
            ? 'border border-amber-300/40 bg-amber-950/40 text-amber-200'
            : 'border border-red-200 bg-red-50 text-red-600',
          className,
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{t('courtStatus.filters.branchLoadError', 'Failed to load branches')}</span>
        </span>
        <button
          type="button"
          onClick={handleRetry}
          title={t('common.retry', 'Thử lại')}
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 font-semibold transition-colors cursor-pointer',
            variant === 'contrast'
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-red-100 text-red-700 hover:bg-red-200',
          )}
        >
          <RotateCw className="size-3" />
          <span>{t('common.retry', 'Thử lại')}</span>
        </button>
      </div>
    );
  }

  // Empty State: No branches returned
  if (branches.length === 0) {
    return (
      <div
        className={cn(
          'flex h-10 w-full min-w-[200px] items-center gap-2 rounded-lg px-3 text-xs opacity-75',
          variant === 'contrast'
            ? 'border border-white/20 bg-white/10 text-white/80'
            : 'border border-slate-200 bg-slate-50 text-slate-500',
          className,
        )}
      >
        <GitBranch className="size-3.5 shrink-0 opacity-70" />
        <span className="truncate">{t('courtStatus.noBranches', 'No branches found')}</span>
      </div>
    );
  }

  const defaultPlaceholder = t('courtStatus.filters.selectBranch', 'Chọn chi nhánh');

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel || t('courtStatus.filters.branchLabel', 'Chi nhánh')}
        rightIcon={
          <GitBranch
            className={cn(
              'size-3.5',
              variant === 'contrast' ? 'text-white/80' : 'text-slate-500',
            )}
          />
        }
        className={cn(
          'h-10 text-xs font-semibold shadow-none transition-colors cursor-pointer',
          variant === 'contrast'
            ? 'border-white/25 bg-white/20 text-white backdrop-blur-xs hover:bg-white/25 focus:ring-white/40'
            : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus:ring-emerald-600',
          className,
        )}
      >
        <SelectValue placeholder={placeholder || defaultPlaceholder} />
      </SelectTrigger>
      <SelectContent align="start" className="min-w-[260px] p-1">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn(
              'rounded-lg py-2 pl-2.5 pr-8 text-xs font-medium cursor-pointer transition-colors',
              // Highlight currently selected branch
              option.value === value && 'font-semibold text-emerald-800 bg-emerald-50/90',
            )}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BranchSelector;
