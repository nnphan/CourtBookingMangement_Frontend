export const BRANCH_DETAIL_QUERY_KEYS = {
  detail: (branchId: string) => ['branch-detail', branchId] as const,
  all: ['branch-detail'] as const,
};
