import { useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ApiErrorShape } from '@/types/api';
import { useResendStaffActivation } from '../hooks/useStaffManagement';
import type { CreateStaffResponse } from '../types/staff.types';

interface Props {
  userId: string;
  email: string;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

export const ResendStaffActivationDialog = ({ userId, email, onClose, returnFocusRef }: Props) => {
  const { t } = useTranslation();
  const resend = useResendStaffActivation();
  const submitting = useRef(false);
  const [result, setResult] = useState<CreateStaffResponse | null>(null);
  const [errorKey, setErrorKey] = useState('');
  const [uncertain, setUncertain] = useState(false);

  const submit = async () => {
    if (submitting.current || uncertain) return;
    submitting.current = true;
    setErrorKey('');
    try {
      setResult(await resend.mutateAsync(userId));
    } catch (error) {
      const apiError = typeof error === 'object' && error !== null ? error as Partial<ApiErrorShape> : {};
      if (apiError.status === 403 || apiError.code === 'STAFF_BRANCH_ACCESS_DENIED') {
        setErrorKey('staffManagement.detail.resendForbidden');
      } else if (apiError.status === 404 || apiError.code === 'STAFF_NOT_FOUND') {
        setErrorKey('staffManagement.detail.resendNotFound');
      } else if (apiError.status === 409) {
        setErrorKey('staffManagement.detail.resendConflict');
      } else if (apiError.code === 'STAFF_DELIVERY_NOT_CONFIGURED') {
        setErrorKey('staffManagement.detail.resendNotConfigured');
      } else {
        setUncertain(true);
        setErrorKey('staffManagement.detail.resendUnknown');
      }
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !submitting.current) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto" closeDisabled={resend.isPending}
        onInteractOutside={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          if (returnFocusRef.current && !returnFocusRef.current.disabled) {
            event.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
        onEscapeKeyDown={(event) => { if (submitting.current) event.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>{t('staffManagement.detail.resendTitle')}</DialogTitle>
          <DialogDescription>{t('staffManagement.detail.resendDescription', { email })}</DialogDescription>
        </DialogHeader>
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {t('staffManagement.create.activationPrerequisite')}
        </p>
        {result && (
          <p role="status" className={result.invitationDeliveryStatus === 'SENT' ? 'text-sm text-emerald-700' : 'text-sm text-amber-800'}>
            {t(result.invitationDeliveryStatus === 'SENT' ? 'staffManagement.detail.resendSent' : 'staffManagement.detail.resendFailed')}
          </p>
        )}
        {errorKey && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{t(errorKey)}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" className="min-h-11" disabled={resend.isPending} onClick={onClose}>
            {t(result || uncertain ? 'staffManagement.create.done' : 'staffManagement.create.cancel')}
          </Button>
          {!result && !uncertain && (
            <Button type="button" className="min-h-11" disabled={resend.isPending} onClick={() => void submit()}>
              {t(resend.isPending ? 'staffManagement.detail.resending' : 'staffManagement.detail.confirmResend')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
