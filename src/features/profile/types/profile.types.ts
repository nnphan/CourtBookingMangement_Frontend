export interface ProfileAvatar {
  fileId: string;
  url: string;
  fileName: string;
}

export interface MyProfile {
  userId: string;
  customerId: string | null;
  displayName: string | null;
  email: string;
  phoneNumber: string | null;
  avatar: ProfileAvatar | null;
  updatedAt: string;
}

export interface UpdateMyProfileRequest {
  displayName: string;
  avatarFileId?: string | null;
  removeAvatar?: boolean;
}
