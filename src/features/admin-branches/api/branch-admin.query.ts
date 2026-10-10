import type { BranchListParams } from '../types/branch-admin.types';

export const BRANCH_ADMIN_QUERY_KEYS = {
  summary: ['branch-summary'] as const,
  branches: (filters: BranchListParams) => ['branches', filters] as const,
  allBranches: ['branches'] as const,
};
