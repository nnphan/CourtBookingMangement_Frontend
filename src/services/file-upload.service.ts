import { http } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

export interface UploadedFileData {
  fileId: string;
  fileName: string;
  url: string;
  contentType: string;
  size: number;
  category: string;
}

export const uploadFile = async (
  file: File,
  category: string,
  onProgress?: (percentage: number) => void,
): Promise<UploadedFileData> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const response = await http.post<ApiResponse<UploadedFileData>>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: ({ loaded, total }) => {
      if (total && total > 0) {
        onProgress?.(Math.round((loaded / total) * 100));
      }
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Unable to upload file.');
  }

  return response.data.data;
};
