import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { profileApi } from '@/features/profile/api/profile.api';
import { queryKeys } from '@/lib/query-client';
import type { User } from '@/types/auth';
import type { ApiErrorShape } from '@/types/api';
import type { MyProfile, UpdateMyProfileRequest } from '../types/profile.types';
import type { UploadedFileData } from '@/services/file-upload.service';

export interface UploadAvatarVariables {
  file: File;
  onProgress?: (percentage: number) => void;
}

export const useUploadAvatar = () =>
  useMutation<UploadedFileData, ApiErrorShape | Error, UploadAvatarVariables>({
    mutationFn: ({ file, onProgress }: UploadAvatarVariables) =>
      profileApi.uploadAvatar(file, onProgress),
  });

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<MyProfile, ApiErrorShape | Error, UpdateMyProfileRequest>({
    mutationFn: profileApi.updateMyProfile,
    onSuccess: async (profile) => {
      queryClient.setQueryData(queryKeys.profile.me, profile);

      const currentUser =
        queryClient.getQueryData<User>(queryKeys.auth.me) ?? useAuthStore.getState().user;
      if (currentUser?.id === profile.userId) {
        const updatedUser: User = {
          ...currentUser,
          fullName: profile.displayName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          avatarUrl: profile.avatar?.url ?? null,
        };
        queryClient.setQueryData(queryKeys.auth.me, updatedUser);
        useAuthStore.getState().setUser(updatedUser);
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};
