import type { NavigateFunction } from 'react-router';
import { paths } from '@/app/router/paths';
import { trackAnalyticsEvent } from '@/lib/analytics';
import type { BadmintonBranch } from '../types/branch';

export class BranchNavigationService {
  /**
   * Navigate customer directly to the court status schedule board for a selected branch.
   * Tracks analytics and ensures deep-link route navigation.
   */
  public static goToCustomerCourtStatus(
    navigate: NavigateFunction,
    branch: Pick<BadmintonBranch, 'id' | 'name'>,
  ): void {
    // 1. Analytics Event Tracking
    trackAnalyticsEvent('Branch Book Now Clicked', {
      branchId: branch.id,
      branchName: branch.name,
    });

    // 2. Direct Navigation to CustomerCourtStatusPage
    navigate(paths.customerBranchCourtStatus(branch.id), {
      state: {
        branchId: branch.id,
        branchName: branch.name,
      },
    });
  }
}
