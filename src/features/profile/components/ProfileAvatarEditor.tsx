import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera, ImagePlus, Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CurrentUserAvatar } from '@/shared/components/current-user/CurrentUserAvatar';
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage';
import { useUploadAvatar } from '../hooks/useProfileMutations';
import type { ProfileAvatar } from '../types/profile.types';
import type { UploadedFileData } from '@/services/file-upload.service';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_FILES: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
};

export type AvatarDraft = { avatarFileId: string } | { removeAvatar: true };

interface ProfileAvatarEditorProps {
  avatar: ProfileAvatar | null;
  displayName: string | null;
  resetKey: number;
  onDraftChange: (draft: AvatarDraft | null) => void;
  onPendingChange: (pending: boolean) => void;
}

export const ProfileAvatarEditor = ({
  avatar,
  displayName,
  resetKey,
  onDraftChange,
  onPendingChange,
}: ProfileAvatarEditorProps) => {
  const { t } = useTranslation();
  const getErrorMessage = useApiErrorMessage();
  const uploadMutation = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(pendingFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingFile]);

  useEffect(() => {
    setPendingFile(null);
    setUploadedFile(null);
    setRemoveAvatar(false);
    setAvatarError('');
    setUploadProgress(0);
  }, [resetKey]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ALLOWED_AVATAR_FILES[file.type];
    if (!allowedExtensions || !extension || !allowedExtensions.includes(extension)) {
      setAvatarError(t('account.profilePage.avatarTypeError'));
      return;
    }
    if (file.size === 0) {
      setAvatarError(t('account.profilePage.avatarEmptyError'));
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError(t('account.profilePage.avatarSizeError'));
      return;
    }

    setPendingFile(file);
    setUploadedFile(null);
    setRemoveAvatar(false);
    setAvatarError('');
    setUploadProgress(0);
    uploadMutation.reset();
    onDraftChange(null);
    onPendingChange(true);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setAvatarError('');
    setUploadProgress(0);

    try {
      const uploaded = await uploadMutation.mutateAsync({
        file: pendingFile,
        onProgress: setUploadProgress,
      });
      setUploadedFile(uploaded);
      setPendingFile(null);
      setUploadProgress(100);
      onDraftChange({ avatarFileId: uploaded.fileId });
      onPendingChange(false);
    } catch (error) {
      setAvatarError(
        getErrorMessage(error) ?? t('account.profilePage.avatarUploadError'),
      );
    }
  };

  const discardAvatarDraft = () => {
    setPendingFile(null);
    setUploadedFile(null);
    setRemoveAvatar(false);
    setAvatarError('');
    setUploadProgress(0);
    uploadMutation.reset();
    onDraftChange(null);
    onPendingChange(false);
  };

  const confirmRemoveAvatar = () => {
    setPendingFile(null);
    setUploadedFile(null);
    setRemoveAvatar(Boolean(avatar));
    setAvatarError('');
    setUploadProgress(0);
    uploadMutation.reset();
    onDraftChange(avatar ? { removeAvatar: true } : null);
    onPendingChange(false);
    setRemoveDialogOpen(false);
  };

  const displayedAvatarUrl = removeAvatar
    ? null
    : previewUrl ?? uploadedFile?.url ?? avatar?.url ?? null;
  const isUploading = uploadMutation.isPending;

  return (
    <section
      aria-labelledby="profile-avatar-heading"
      className="border-line mb-6 rounded-2xl border bg-surface-muted/60 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          role="img"
          aria-label={t('account.profilePage.avatarPreview', {
            name: displayName || t('account.user'),
          })}
          className="bg-brand-100 grid size-24 shrink-0 place-items-center overflow-hidden rounded-full ring-4 ring-surface"
        >
          <CurrentUserAvatar
            fullName={displayName}
            avatarUrl={displayedAvatarUrl}
            className="size-full rounded-full text-2xl"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 id="profile-avatar-heading" className="text-content-primary font-bold">
            {t('account.profilePage.avatarTitle')}
          </h3>
          <p className="text-content-secondary text-sm leading-6">
            {t('account.profilePage.avatarFileHint')}
          </p>
          {pendingFile ? (
            <div className="text-content-secondary space-y-1 text-xs" role="status">
              <p>{t('account.profilePage.avatarPreviewStatus', { fileName: pendingFile.name })}</p>
              <p>{t('account.profilePage.avatarUploadBeforeSave')}</p>
            </div>
          ) : null}
          {uploadedFile ? (
            <p role="status" className="text-brand-700 text-xs font-medium">
              {t('account.profilePage.avatarReadyStatus')}
            </p>
          ) : null}
          {removeAvatar ? (
            <p role="status" className="text-content-secondary text-xs">
              {t('account.profilePage.avatarRemovalPending')}
            </p>
          ) : null}
        </div>
      </div>

      <input
        ref={fileInputRef}
        id="profile-avatar-file"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        tabIndex={-1}
        aria-label={t('account.profilePage.avatarChoose')}
        onChange={handleFileChange}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {displayedAvatarUrl ? (
            <Camera aria-hidden className="size-4" />
          ) : (
            <ImagePlus aria-hidden className="size-4" />
          )}
          {displayedAvatarUrl
            ? t('account.profilePage.avatarChange')
            : t('account.profilePage.avatarChoose')}
        </Button>

        {pendingFile ? (
          <Button type="button" disabled={isUploading} loading={isUploading} onClick={handleUpload}>
            <Upload aria-hidden className="size-4" />
            {isUploading
              ? t('account.profilePage.avatarUploading')
              : uploadMutation.isError
                ? t('account.profilePage.avatarRetry')
                : t('account.profilePage.avatarUpload')}
          </Button>
        ) : null}

        {(pendingFile || uploadedFile) && !isUploading ? (
          <Button type="button" variant="outline" onClick={discardAvatarDraft}>
            {t('account.profilePage.avatarDiscard')}
          </Button>
        ) : null}

        {avatar && !removeAvatar ? (
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => setRemoveDialogOpen(true)}
          >
            <Trash2 aria-hidden className="size-4" />
            {t('account.profilePage.avatarRemove')}
          </Button>
        ) : null}

        {removeAvatar ? (
          <Button type="button" variant="outline" onClick={discardAvatarDraft}>
            {t('account.profilePage.avatarUndoRemove')}
          </Button>
        ) : null}
      </div>

      {isUploading ? (
        <div className="mt-4 space-y-2">
          <div
            role="progressbar"
            aria-label={t('account.profilePage.avatarUploading')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploadProgress}
            className="bg-line h-2 overflow-hidden rounded-full"
          >
            <div
              className="bg-brand-600 h-full rounded-full transition-[width]"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-content-secondary text-xs" aria-live="polite">
            {t('account.profilePage.avatarProgress', { progress: uploadProgress })}
          </p>
        </div>
      ) : null}

      {avatarError ? (
        <p role="alert" className="bg-danger/10 text-danger mt-4 rounded-xl p-3 text-sm">
          {avatarError}
        </p>
      ) : null}

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('account.profilePage.avatarRemoveTitle')}</DialogTitle>
            <DialogDescription>
              {t('account.profilePage.avatarRemoveDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              {t('account.profilePage.cancel')}
            </Button>
            <Button type="button" variant="danger" onClick={confirmRemoveAvatar}>
              <Trash2 aria-hidden className="size-4" />
              {t('account.profilePage.avatarRemoveConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
