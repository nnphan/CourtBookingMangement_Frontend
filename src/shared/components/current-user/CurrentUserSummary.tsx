import { ChevronDown } from 'lucide-react';
import { CurrentUserAvatar } from './CurrentUserAvatar';

interface CurrentUserSummaryProps {
  fullName: string;
  avatarUrl?: string | null;
  roleLabel: string;
}

export const CurrentUserSummary = ({ fullName, avatarUrl, roleLabel }: CurrentUserSummaryProps) => (
  <span className="flex min-w-0 items-center gap-2">
    <CurrentUserAvatar fullName={fullName} avatarUrl={avatarUrl} />
    <span className="hidden min-w-0 flex-col items-start sm:flex">
      <span className="max-w-40 truncate text-sm leading-tight font-semibold">{fullName}</span>
      <span className="hidden text-[11px] leading-tight text-current/70 md:block">{roleLabel}</span>
    </span>
    <ChevronDown aria-hidden="true" className="hidden size-4 shrink-0 opacity-75 sm:block" />
  </span>
);
