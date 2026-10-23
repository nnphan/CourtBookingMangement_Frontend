import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import { deleteUser } from '../api/user.api';
import { USER_QUERY_KEYS } from '../api/user.query';
import type { UserListItem } from '../types/user.types';

interface DeleteUserDialogProps {
  user: UserListItem;
  onClose: () => void;
}

export const DeleteUserDialog = ({ user, onClose }: DeleteUserDialogProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const displayName = user.fullName || user.email;

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(user.id),
    onSuccess: async () => {
      toast.success(t('userManagement.deleteSuccessTitle'), t('userManagement.deleteSuccess'));
      onClose();
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.list() });
    },
    onError: (error) => {
      const status = 'status' in error ? error.status : undefined;
      const backendMessage = status === 409 || status === 400 ? error.message : undefined;
      const message =
        status === 403
          ? t('userManagement.forbidden')
          : status === 404
            ? t('userManagement.notFound')
            : backendMessage || t('userManagement.deleteError');
      toast.error(t('userManagement.deleteErrorTitle'), message);
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open && !deleteMutation.isPending) onClose();
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('userManagement.deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('userManagement.deleteConfirm', { user: displayName })}
          </DialogDescription>
        </DialogHeader>
        {user.email && (
          <p className="text-sm text-slate-600">
            <span className="font-semibold">{t('userManagement.deleteEmail')}:</span> {user.email}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            {t('userManagement.deleteCancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                {t('userManagement.deleting')}
              </>
            ) : (
              t('userManagement.delete')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
