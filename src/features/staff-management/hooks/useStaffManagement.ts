import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { ApiErrorShape } from '@/types/api';
import {
  createStaff,
  getStaffBranches,
  getStaffDetail,
  getStaffList,
  resendStaffActivation,
} from '../api/staff-management.api';
import { STAFF_MANAGEMENT_QUERY_KEYS as keys } from '../api/staff-management.query';
import type {
  CreateStaffRequest,
  CreateStaffResponse,
  StaffListParams,
  StaffListResult,
  StaffOwnedBranch,
} from '../types/staff.types';

export const useStaffAccess = (enabled = true) => {
  const ownerId = useAuthStore((state) => state.user?.id ?? null);
  const authenticated = useAuthStore((state) => state.isAuthenticated());
  return useQuery<boolean, ApiErrorShape | Error>({
    queryKey: keys.access(ownerId),
    queryFn: async () => {
      await getStaffList({ page: 1, pageSize: 10 });
      return true;
    },
    enabled: enabled && authenticated && ownerId !== null,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
};

export const useStaffList = (filters: StaffListParams) => {
  const ownerId = useAuthStore((state) => state.user?.id ?? null);
  const authenticated = useAuthStore((state) => state.isAuthenticated());
  return useQuery<StaffListResult, ApiErrorShape | Error>({
    queryKey: keys.list(ownerId, filters),
    queryFn: () => getStaffList(filters),
    enabled: authenticated && ownerId !== null,
  });
};

export const useStaffBranches = () => {
  const ownerId = useAuthStore((state) => state.user?.id ?? null);
  const authenticated = useAuthStore((state) => state.isAuthenticated());
  return useQuery<StaffOwnedBranch[], ApiErrorShape | Error>({
    queryKey: keys.branches(ownerId),
    queryFn: getStaffBranches,
    enabled: authenticated && ownerId !== null,
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const useStaffDetail = (userId: string) => {
  const ownerId = useAuthStore((state) => state.user?.id ?? null);
  const authenticated = useAuthStore((state) => state.isAuthenticated());
  return useQuery({
    queryKey: keys.detail(ownerId, userId),
    queryFn: () => getStaffDetail(userId),
    enabled: authenticated && ownerId !== null && userId.length > 0,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
};

export const useCreateStaff = () => {
  const ownerId = useAuthStore((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();
  return useMutation<CreateStaffResponse, ApiErrorShape | Error, CreateStaffRequest>({
    mutationFn: createStaff,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.lists(ownerId) });
    },
  });
};

export const useResendStaffActivation = () => {
  const ownerId = useAuthStore((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();
  return useMutation<CreateStaffResponse, ApiErrorShape | Error, string>({
    mutationFn: resendStaffActivation,
    onSettled: async (_, __, userId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.lists(ownerId) }),
        queryClient.invalidateQueries({ queryKey: keys.detail(ownerId, userId) }),
      ]);
    },
  });
};
