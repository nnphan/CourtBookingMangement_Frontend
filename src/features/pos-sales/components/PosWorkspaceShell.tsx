import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { BranchSelector } from '@/components/branches/BranchSelector';

interface PosWorkspaceHeaderProps {
  title: string;
  branchId: string;
  onBranchChange: (branchId: string) => void;
  branchDisabled?: boolean;
  compact?: boolean;
}

export const PosWorkspaceHeader = ({
  title,
  branchId,
  onBranchChange,
  branchDisabled = false,
  compact = false,
}: PosWorkspaceHeaderProps) => (
  <div className={`border-line bg-surface flex flex-col justify-between rounded-xl border sm:flex-row sm:items-end ${compact ? 'gap-3 px-4 py-3 lg:px-5' : 'gap-4 p-4 lg:px-6'}`}>
    <div>
      <h1 className={`mt-1 text-2xl font-black text-slate-950 ${compact ? 'lg:text-[26px]' : 'sm:text-3xl'}`}>{title}</h1>
    </div>
    <div className="w-full sm:w-80">
      <p className="mb-1.5 block text-sm font-semibold text-slate-700">Chi nhánh đang thao tác</p>
      <BranchSelector
        value={branchId}
        onChange={onBranchChange}
        disabled={branchDisabled}
        aria-label="Chi nhánh đang thao tác"
      />
    </div>
  </div>
);

export interface PosWorkspaceTab {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  active: boolean;
  disabled?: boolean;
}

export const PosWorkspaceTabs = ({
  tabs,
  ariaLabel,
  stretch = false,
  compact = false,
}: {
  tabs: PosWorkspaceTab[];
  ariaLabel: string;
  stretch?: boolean;
  compact?: boolean;
}) => {
  const navRef = useRef<HTMLElement>(null);
  const activeId = tabs.find((tab) => tab.active)?.id;

  useEffect(() => {
    const revealActive = () => {
      const nav = navRef.current;
      const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!nav || !active) return;
      const navBounds = nav.getBoundingClientRect();
      const activeBounds = active.getBoundingClientRect();
      if (activeBounds.right > navBounds.right) {
        nav.scrollLeft += activeBounds.right - navBounds.right + 8;
      } else if (activeBounds.left < navBounds.left) {
        nav.scrollLeft -= navBounds.left - activeBounds.left + 8;
      }
    };
    revealActive();
    window.addEventListener('resize', revealActive);
    return () => window.removeEventListener('resize', revealActive);
  }, [activeId]);

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      onFocusCapture={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const focused = event.target.getBoundingClientRect();
        if (focused.right > bounds.right) event.currentTarget.scrollLeft += focused.right - bounds.right + 8;
        else if (focused.left < bounds.left) event.currentTarget.scrollLeft -= bounds.left - focused.left + 8;
      }}
      className="border-line bg-surface flex min-w-0 gap-1 overflow-x-auto rounded-xl border p-1.5"
    >
      {tabs.map(({ id, label, icon: Icon, to, active, disabled }) => (
        <Link
          key={id}
          to={to}
          onClick={(event) => {
            if (disabled) event.preventDefault();
          }}
          aria-disabled={disabled || undefined}
          aria-current={active ? 'page' : undefined}
          className={`flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap transition ${compact ? 'min-h-9' : 'min-h-11'} ${
            stretch ? 'sm:flex-1' : ''
          } ${
            active
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
          }`}
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
};
