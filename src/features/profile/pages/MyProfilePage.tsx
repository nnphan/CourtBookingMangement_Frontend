import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, Save, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { TextInput } from '@/components/ui/text-input';
import { ProfileAvatarEditor, type AvatarDraft } from '@/features/profile/components/ProfileAvatarEditor';
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { useUpdateMyProfile } from '@/features/profile/hooks/useProfileMutations';
import type { ApiErrorShape } from '@/types/api';

const isApiErrorShape = (error: unknown): error is ApiErrorShape =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  'code' in error &&
  'message' in error;

const isDisplayNameField = (field: string) =>
  ['displayname', 'fullname'].includes(field.replace(/[^a-z]/gi, '').toLowerCase());

const MyProfilePage = () => {
  const { t } = useTranslation();
  const getErrorMessage = useApiErrorMessage();
  const profileQuery = useMyProfile();
  const updateMutation = useUpdateMyProfile();
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState<AvatarDraft | null>(null);
  const [avatarUploadPending, setAvatarUploadPending] = useState(false);
  const [avatarResetKey, setAvatarResetKey] = useState(0);

  const schema = z.object({
    displayName: z
      .string()
      .trim()
      .min(1, t('account.profilePage.nameRequired'))
      .min(2, t('account.profilePage.nameMin'))
      .max(150, t('account.profilePage.nameMax')),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<{ displayName: string }>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '' },
  });
  const hasUnsavedChanges = isDirty || Boolean(avatarDraft) || avatarUploadPending;
  const blocker = useBlocker(hasUnsavedChanges);

  useEffect(() => {
    if (profileQuery.data && !isDirty) {
      reset({ displayName: profileQuery.data.displayName ?? '' });
    }
  }, [profileQuery.data, isDirty, reset]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const submit = handleSubmit(async ({ displayName }) => {
    setFormError('');
    setSaved(false);

    try {
      const request = {
        displayName: displayName.trim(),
        ...(avatarDraft && 'avatarFileId' in avatarDraft
          ? { avatarFileId: avatarDraft.avatarFileId }
          : {}),
        ...(avatarDraft && 'removeAvatar' in avatarDraft ? { removeAvatar: true } : {}),
      };
      const updatedProfile = await updateMutation.mutateAsync(request);
      reset({ displayName: updatedProfile.displayName ?? '' });
      setAvatarDraft(null);
      setAvatarUploadPending(false);
      setAvatarResetKey((current) => current + 1);
      setSaved(true);
    } catch (error) {
      const fields = isApiErrorShape(error) ? error.fields : undefined;
      const displayNameServerError = fields
        ? Object.entries(fields).find(([field]) => isDisplayNameField(field))?.[1]
        : undefined;

      if (displayNameServerError) {
        setError('displayName', { type: 'server', message: displayNameServerError });
      } else {
        setFormError(getErrorMessage(error) ?? t('account.profilePage.saveError'));
      }
    }
  });

  if (profileQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10" role="status">
        <span className="sr-only">{t('account.profilePage.loading')}</span>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <Card>
          <CardBody className="space-y-6">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-36" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-8">
        <h1 className="text-content-primary text-2xl font-black tracking-tight sm:text-3xl">
          {t('account.profilePage.title')}
        </h1>
        <p role="alert" className="bg-danger/10 text-danger rounded-xl p-4 text-sm">
          {getErrorMessage(profileQuery.error) ?? t('account.profilePage.loadError')}
        </p>
        <Button type="button" variant="outline" onClick={() => void profileQuery.refetch()}>
          {t('playerMatch.discovery.retry')}
        </Button>
      </div>
    );
  }

  const displayNameField = register('displayName');
  const resetForm = () => {
    reset({ displayName: profileQuery.data.displayName ?? '' });
    setAvatarDraft(null);
    setAvatarUploadPending(false);
    setAvatarResetKey((current) => current + 1);
    setFormError('');
    setSaved(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 sm:py-10">
      <header className="space-y-3">
        <div className="bg-brand-100 text-brand-700 grid size-12 place-items-center rounded-2xl">
          <UserRound aria-hidden className="size-6" />
        </div>
        <div>
          <h1 className="text-content-primary text-2xl font-black tracking-tight sm:text-3xl">
            {t('account.profilePage.title')}
          </h1>
          <p className="text-content-secondary mt-2 text-sm leading-6">
            {t('account.profilePage.description')}
          </p>
        </div>
      </header>

      <Card>
        <CardBody>
          <div className="mb-6">
            <h2 className="text-content-primary text-lg font-bold">
              {t('account.profilePage.sectionTitle')}
            </h2>
            <p className="text-content-secondary mt-1 text-sm leading-6">
              {t('account.profilePage.sectionDescription')}
            </p>
          </div>

          <ProfileAvatarEditor
            avatar={profileQuery.data.avatar}
            displayName={profileQuery.data.displayName}
            resetKey={avatarResetKey}
            onDraftChange={setAvatarDraft}
            onPendingChange={setAvatarUploadPending}
          />

          <form noValidate onSubmit={submit} className="space-y-5">
            <TextInput
              id="profile-display-name"
              label={t('account.profilePage.displayName')}
              placeholder={t('account.profilePage.displayNamePlaceholder')}
              maxLength={150}
              autoComplete="name"
              aria-describedby={errors.displayName ? 'profile-display-name-error' : undefined}
              error={errors.displayName?.message}
              {...displayNameField}
              onChange={(event) => {
                void displayNameField.onChange(event);
                setFormError('');
                setSaved(false);
              }}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput
                id="profile-email"
                label={t('account.profilePage.email')}
                value={profileQuery.data.email || t('account.profilePage.notProvided')}
                readOnly
                aria-readonly="true"
                className="text-content-secondary"
              />
              <TextInput
                id="profile-phone"
                label={t('account.profilePage.phone')}
                value={profileQuery.data.phoneNumber || t('account.profilePage.notProvided')}
                readOnly
                aria-readonly="true"
                className="text-content-secondary"
              />
            </div>

            <p className="text-content-secondary flex items-center gap-2 text-xs">
              <LockKeyhole aria-hidden className="size-3.5 shrink-0" />
              {t('account.profilePage.readOnly')}
            </p>

            {formError ? (
              <p role="alert" className="bg-danger/10 text-danger rounded-xl p-4 text-sm">
                {formError}
              </p>
            ) : null}
            {saved ? (
              <p role="status" className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
                {t('account.profilePage.saveSuccess')}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={!hasUnsavedChanges || updateMutation.isPending || avatarUploadPending}
                onClick={resetForm}
              >
                {t('account.profilePage.reset')}
              </Button>
              <Button
                type="submit"
                disabled={
                  !hasUnsavedChanges ||
                  avatarUploadPending ||
                  updateMutation.isPending
                }
                loading={updateMutation.isPending}
              >
                <Save aria-hidden className="size-4" />
                {updateMutation.isPending
                  ? t('account.profilePage.saving')
                  : t('account.profilePage.save')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Dialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open && blocker.state === 'blocked') blocker.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('account.profilePage.leaveTitle')}</DialogTitle>
            <DialogDescription>
              {t('account.profilePage.leaveDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (blocker.state === 'blocked') blocker.reset();
              }}
            >
              {t('account.profilePage.stay')}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (blocker.state === 'blocked') blocker.proceed();
              }}
            >
              {t('account.profilePage.leave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyProfilePage;
