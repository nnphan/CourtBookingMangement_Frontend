import React, { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';
import type { CustomerBranch } from '../types/customer-court';
import { Building2, MapPin, ChevronDown, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BranchSelectDropdownProps {
  branches: CustomerBranch[];
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  variant?: 'header' | 'surface' | 'mobile';
  className?: string;
}

export const BranchSelectDropdown: React.FC<BranchSelectDropdownProps> = memo(
  ({
    branches,
    selectedBranchId,
    onBranchChange,
    variant = 'header',
    className,
  }) => {
    const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

    if (!branches || branches.length === 0) {
      return null;
    }

    // Modern Header Variant (Translucent Glassmorphism on Emerald Top Bar)
    if (variant === 'header') {
      return (
        <Select value={selectedBranchId} onValueChange={onBranchChange}>
          <SelectTrigger
            hideChevron
            aria-label="Chọn chi nhánh câu lạc bộ"
            className={cn(
              'h-8 px-2.5 rounded-lg border border-white/20 bg-white/12 hover:bg-white/20 active:bg-white/25 text-white font-medium text-xs shadow-xs transition-all duration-150 flex items-center gap-2 group cursor-pointer focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1 focus:ring-offset-emerald-900',
              className,
            )}
          >
            <div className="flex items-center gap-1.5 truncate max-w-[190px] sm:max-w-[240px]">
              <Building2 className="size-3.5 text-emerald-200 shrink-0" />
              <span className="truncate">
                {activeBranch?.branchCode ? `${activeBranch.branchCode} - ` : ''}
                {activeBranch?.branchName || 'Chọn chi nhánh'}
              </span>
            </div>
            <ChevronDown className="size-3.5 text-white/80 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
          </SelectTrigger>

          <SelectContent
            align="end"
            sideOffset={6}
            className="w-[300px] sm:w-[350px] p-1.5 rounded-2xl border border-slate-200/90 bg-white shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95"
          >
            {/* Notion / Linear Styled Section Header */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Chi nhánh câu lạc bộ
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {branches.length} cơ sở
              </span>
            </div>

            {/* Branch Items with High Information Density */}
            <div className="space-y-1">
              {branches.map((branch) => {
                const isSelected = branch.id === selectedBranchId;
                return (
                  <SelectItem
                    key={branch.id}
                    value={branch.id}
                    className={cn(
                      'py-2.5 px-3 rounded-xl transition-all duration-150 cursor-pointer',
                      isSelected
                        ? 'bg-emerald-50/80 text-emerald-950 font-semibold'
                        : 'hover:bg-slate-50 text-slate-800',
                    )}
                  >
                    <div className="flex flex-col gap-0.5 w-full">
                      {/* Name & Code Badge Row */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {branch.branchName}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-emerald-100/90 text-emerald-800 shrink-0">
                          {branch.branchCode}
                        </span>
                      </div>

                      {/* Address & Status Row */}
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        {branch.address && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-normal truncate">
                            <MapPin className="size-3 text-slate-400 shrink-0" />
                            <span className="truncate">{branch.address}</span>
                          </div>
                        )}
                        {branch.rating && (
                          <div className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-600 shrink-0 ml-auto">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span>{branch.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </div>

            <SelectSeparator className="my-1.5 bg-slate-100" />

            <div className="px-3 py-1.5 text-[10px] text-slate-400 text-center font-medium">
              ⚡ Tự động cập nhật tình trạng sân trống tức thì
            </div>
          </SelectContent>
        </Select>
      );
    }

    // Surface / Mobile Card Variant
    return (
      <Select value={selectedBranchId} onValueChange={onBranchChange}>
        <SelectTrigger
          hideChevron
          aria-label="Chọn chi nhánh câu lạc bộ"
          className={cn(
            'h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs shadow-2xs transition-all flex items-center justify-between gap-2 group cursor-pointer focus:ring-2 focus:ring-emerald-500',
            className,
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <div className="grid size-6 place-items-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
              <Building2 className="size-3.5" />
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-bold text-slate-900 truncate">
                {activeBranch?.branchName || 'Chọn chi nhánh'}
              </span>
              {activeBranch?.address && (
                <span className="text-[10px] text-slate-500 truncate font-normal">
                  {activeBranch.address}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="size-4 text-slate-400 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
        </SelectTrigger>

        <SelectContent
          align="start"
          sideOffset={6}
          className="w-[300px] sm:w-[360px] p-1.5 rounded-2xl border border-slate-200 bg-white shadow-2xl backdrop-blur-md"
        >
          <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Chọn chi nhánh câu lạc bộ
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {branches.length} chi nhánh
            </span>
          </div>

          <div className="space-y-1">
            {branches.map((branch) => {
              const isSelected = branch.id === selectedBranchId;
              return (
                <SelectItem
                  key={branch.id}
                  value={branch.id}
                  className={cn(
                    'py-2.5 px-3 rounded-xl transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-semibold'
                      : 'hover:bg-slate-50 text-slate-800',
                  )}
                >
                  <div className="flex flex-col gap-0.5 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {branch.branchName}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                        {branch.branchCode}
                      </span>
                    </div>
                    {branch.address && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-normal truncate mt-0.5">
                        <MapPin className="size-3 text-slate-400 shrink-0" />
                        <span className="truncate">{branch.address}</span>
                      </div>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </div>
        </SelectContent>
      </Select>
    );
  },
);

BranchSelectDropdown.displayName = 'BranchSelectDropdown';
