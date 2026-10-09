import { http } from '@/lib/axios';
import type { UploadFileData, UploadFileResponse } from '../types/branch.types';

/**
 * Upload an image file for branch management
 * Endpoint: POST /api/files/upload (multipart/form-data)
 */
export const uploadBranchImage = async (
  file: File,
  category = 'branch',
): Promise<UploadFileData> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const response = await http.post<UploadFileResponse>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data || !response.data.success) {
    throw new Error(response.data?.message || 'Không thể tải lên hình ảnh.');
  }

  return response.data.data;
};

export const uploadService = {
  uploadBranchImage,
};
