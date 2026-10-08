import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface BranchDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  branchName?: string;
  isDeleting?: boolean;
}

export const BranchDeleteDialog: React.FC<BranchDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  branchName,
  isDeleting = false,
}) => {
  const { t } = useTranslation('branch');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
          <div className="size-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <AlertTriangle className="size-6 stroke-[2.2]" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {t('deleteDialog.title')}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-1">
              {branchName ? (
                <Trans
                  t={t}
                  i18nKey="deleteDialog.description"
                  values={{ name: branchName }}
                  components={{ bold: <span className="font-semibold text-slate-900" /> }}
                />
              ) : (
                t('deleteDialog.descriptionGeneric')
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border-slate-200"
          >
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirm}
            loading={isDeleting}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {t('actions.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
