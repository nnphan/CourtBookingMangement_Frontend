import { request } from '@/lib/axios';
import { uploadFile } from '@/services/file-upload.service';
import type { MyProfile, UpdateMyProfileRequest } from '../types/profile.types';
import type { UploadedFileData } from '@/services/file-upload.service';

export const profileApi = {
  getMyProfile: () => request<MyProfile>({ url: '/me/profile', method: 'GET' }),

  updateMyProfile: (payload: UpdateMyProfileRequest) =>
    request<MyProfile>({ url: '/me/profile', method: 'PUT', data: payload }),

  uploadAvatar: (file: File, onProgress?: (percentage: number) => void): Promise<UploadedFileData> =>
    uploadFile(file, 'avatar', onProgress),
};
