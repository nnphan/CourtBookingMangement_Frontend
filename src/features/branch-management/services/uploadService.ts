import { uploadFile } from '@/services/file-upload.service';
import type { UploadFileData } from '../types/branch.types';

/**
 * Upload an image file for branch management
 * Endpoint: POST /api/files/upload (multipart/form-data)
 */
export const uploadBranchImage = async (
  file: File,
  category = 'branch',
): Promise<UploadFileData> => uploadFile(file, category);

export const uploadService = {
  uploadBranchImage,
};
