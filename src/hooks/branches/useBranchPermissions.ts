import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';

export interface BranchPermissions {
  role: 'ADMIN' | 'BRANCH_MANAGER' | 'OTHER';
  isAdmin: boolean;
  isBranchManager: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}

/**
 * Evaluates current user's permissions for Branch Management.
 * ADMIN: View, Create, Edit, Delete all branches.
 * BRANCH_MANAGER: View, Edit assigned branch. Cannot Create, Cannot Delete.
 */
export const useBranchPermissions = (): BranchPermissions => {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    // If not logged in in local development/demo, default to ADMIN privilege
    if (!user) {
      return {
        role: 'ADMIN',
        isAdmin: true,
        isBranchManager: false,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canView: true,
      };
    }

    const roleName = user.role?.toLowerCase() || '';
    const rolesList = (user.roles || []).map((r) => r.toUpperCase());

    const isAdmin =
      roleName === 'admin' ||
      rolesList.includes('ADMIN') ||
      rolesList.includes('SUPER_ADMIN');

    const isBranchManager =
      roleName === 'owner' ||
      rolesList.includes('BRANCH_MANAGER') ||
      rolesList.includes('BRANCH_OWNER');

    const effectiveRole: 'ADMIN' | 'BRANCH_MANAGER' | 'OTHER' = isAdmin
      ? 'ADMIN'
      : isBranchManager
        ? 'BRANCH_MANAGER'
        : 'OTHER';

    return {
      role: effectiveRole,
      isAdmin,
      isBranchManager,
      canCreate: isAdmin,
      canEdit: isAdmin || isBranchManager,
      canDelete: isAdmin,
      canView: isAdmin || isBranchManager,
    };
  }, [user]);
};
