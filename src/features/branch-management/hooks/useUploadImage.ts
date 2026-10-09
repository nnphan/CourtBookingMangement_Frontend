import { useMutation } from '@tanstack/react-query';
import { uploadBranchImage } from '../services/uploadService';
import type { UploadFileData } from '../types/branch.types';
import { extractErrorMessage } from '../utils/error';
import { toast } from '@/lib/toast';

export interface UploadImageVariables {
  file: File;
  category?: string;
}

/**
 * Hook to upload image files with react-query mutation support
 * Supports Loading, Success, Error and Retry
 */
export const useUploadImage = () => {
  return useMutation<UploadFileData, Error, UploadImageVariables>({
    mutationFn: async ({ file, category = 'branch' }) => {
      return await uploadBranchImage(file, category);
    },
    onError: (err: unknown) => {
      const message = extractErrorMessage(err, 'Không thể tải hình ảnh lên hệ thống.');
      toast.error('Cannot upload image', message);
    },
    retry: 1,
  });
};
