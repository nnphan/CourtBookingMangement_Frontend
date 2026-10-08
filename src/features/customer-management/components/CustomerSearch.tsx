import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Loader2, User, Phone, Crown } from 'lucide-react';
import { customerApi } from '../api/customer.api';
import type { Customer } from '../types/customer';
import { MEMBER_TYPE_CONFIG } from '../constants/customer-status';
import { cn } from '@/lib/utils';

interface CustomerSearchProps {
  value?: string;
  onChange?: (val: string) => void;
  onSelectCustomer?: (customer: Customer) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showDropdown?: boolean;
  disabled?: boolean;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = memo(
  ({
    value = '',
    onChange,
    onSelectCustomer,
    placeholder,
    className,
    autoFocus = false,
    showDropdown = true,
    disabled = false,
  }) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState(value);
    const [results, setResults] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Synchronize external value changes
    useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Debounced search (500ms as required)
    useEffect(() => {
      const timer = setTimeout(async () => {
        if (onChange) {
          onChange(inputValue);
        }

        if (showDropdown && onSelectCustomer && inputValue.trim().length >= 1) {
          setIsLoading(true);
          try {
            const res = await customerApi.searchCustomers(inputValue);
            if (res.success) {
              setResults(res.data);
              setIsOpen(res.data.length > 0);
              setHighlightedIndex(-1);
            }
          } catch {
            setResults([]);
          } finally {
            setIsLoading(false);
          }
        } else {
          setResults([]);
          setIsOpen(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    }, [inputValue, onChange, onSelectCustomer, showDropdown]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = useCallback(
      (customer: Customer) => {
        setInputValue(customer.fullName);
        setIsOpen(false);
        if (onChange) {
          onChange(customer.fullName);
        }
        if (onSelectCustomer) {
          onSelectCustomer(customer);
        }
      },
      [onChange, onSelectCustomer],
    );

    const handleClear = useCallback(() => {
      setInputValue('');
      setResults([]);
      setIsOpen(false);
      if (onChange) {
        onChange('');
      }
      inputRef.current?.focus();
    }, [onChange]);

    // Keyboard navigation (Tab, Arrow Keys, Enter, Escape)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || results.length === 0) {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < results.length) {
            handleSelect(results[highlightedIndex]!);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    return (
      <div ref={containerRef} className={cn('relative w-full', className)}>
        {/* Input Field */}
        <div className="relative flex items-center">
          <Search
            aria-hidden="true"
            className="absolute left-3 size-4 text-slate-400 pointer-events-none"
          />

          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="customer-search-results"
            aria-label={t('customer.searchLabel', 'Tìm kiếm khách hàng theo tên, số điện thoại hoặc mã')}
            disabled={disabled}
            autoFocus={autoFocus}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ||
              t(
                'customer.searchPlaceholder',
                'Tìm theo tên, SĐT (ví dụ: 0909...), mã KH, email...',
              )
            }
            className="w-full h-10 pl-9 pr-9 text-sm bg-white rounded-xl border border-slate-200 shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:bg-slate-50"
          />

          {/* Right Action Icons (Clear / Loader) */}
          <div className="absolute right-2.5 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="size-4 animate-spin text-emerald-600" aria-label="Loading" />
            )}
            {!isLoading && inputValue && (
              <button
                type="button"
                onClick={handleClear}
                aria-label={t('common.clear', 'Xoá tìm kiếm')}
                className="grid size-5 place-items-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Real-time Autocomplete Dropdown */}
        {isOpen && results.length > 0 && (
          <ul
            id="customer-search-results"
            role="listbox"
            className="absolute z-50 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-50"
          >
            {results.map((c, index) => {
              const isSelected = index === highlightedIndex;
              const memberConfig = MEMBER_TYPE_CONFIG[c.memberType];

              return (
                <li
                  key={c.id}
                  id={`customer-option-${c.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(c)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors select-none',
                    isSelected ? 'bg-emerald-50 text-emerald-950' : 'hover:bg-slate-50 text-slate-800',
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                      {c.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold truncate">{c.fullName}</span>
                        {c.isGuest ? (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                            Khách vãng lai
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded font-bold border flex items-center gap-0.5',
                              memberConfig.badgeClass,
                            )}
                          >
                            <Crown className="size-2.5" />
                            {memberConfig.labelVi}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="size-3 text-slate-400" />
                          <span className="font-mono">{c.phoneNumber}</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400">Mã: {c.customerCode}</span>
                        {c.totalBookings > 0 && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span className="text-emerald-700 font-medium">
                              {c.totalBookings} lượt đặt
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-700 shrink-0 ml-2 hidden sm:block">
                    Chọn ↵
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
);

CustomerSearch.displayName = 'CustomerSearch';
