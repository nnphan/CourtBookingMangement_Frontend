import type { CreateCourtInput } from '@/types/branch';

export type BranchCourtDraft = CreateCourtInput & { id?: string };

/**
 * Values a new court gets for the fields the court dialog does not ask for.
 * They can be changed later from the Court Management module.
 */
export const NEW_COURT_DEFAULTS: Omit<BranchCourtDraft, 'name'> = {
  surface: 'bwf_mat',
  category: 'standard',
  status: 'available',
  pricePerHour: 120000,
};
