import type { LucideIcon } from 'lucide-react';

export type ManagementRole = 'ADMIN' | 'BRANCH_MANAGER' | 'STAFF' | 'CUSTOMER';

export interface ManagementNavigationItem {
  key: string;
  /** Fallback text used when the translation key is missing. */
  label: string;
  translationKey: string;
  path: string;
  icon?: LucideIcon;
  /** Roles allowed to see the item. Omit to show it to everyone. */
  roles?: ManagementRole[];
}
