import type { NavigateFunction } from 'react-router';
import dayjs from '@/lib/dayjs';
import { paths } from '@/app/router/paths';
import { trackAnalyticsEvent } from '@/lib/analytics';
import type { BadmintonBranch } from '../types/branch';
import { useBranchSearchStore } from '../store/branch-search.store';
import { useCustomerCourtStatusStore } from '@/features/customer-court-status/store/customer-court-status.store';

export class BranchNavigationService {
  /**
   * Navigate customer directly to the court status schedule board for a selected branch,
   * preserving the selected booking date across URL query params, navigation state, and stores.
   */
  public static goToCustomerCourtStatus(
    navigate: NavigateFunction,
    branch: Pick<BadmintonBranch, 'id' | 'name'>,
    selectedDate?: string,
  ): void {
    const storeDate = useBranchSearchStore.getState().selectedDate;
    const rawDate = selectedDate || storeDate;
    const resolvedDate =
      rawDate && dayjs(rawDate).isValid()
        ? dayjs(rawDate).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');

    // 1. Synchronize branch and date across stores before navigation
    useBranchSearchStore.getState().setSelectedDate(resolvedDate);
    useCustomerCourtStatusStore.getState().setSelectedBranchId(branch.id);
    useCustomerCourtStatusStore.getState().setSelectedDate(resolvedDate);

    // 2. Analytics Event Tracking
    trackAnalyticsEvent('Branch Book Now Clicked', {
      branchId: branch.id,
      branchName: branch.name,
      selectedDate: resolvedDate,
    });

    // 3. Direct Navigation with ?date=YYYY-MM-DD query parameter and state
    navigate(paths.customerBranchCourtStatus(branch.id, resolvedDate), {
      state: {
        branchId: branch.id,
        branchName: branch.name,
        selectedDate: resolvedDate,
      },
    });
  }
}

