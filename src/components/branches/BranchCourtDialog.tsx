import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CourtStatus } from '@/types/branch';
import type { BranchCourtDraft } from './branch-court';

/** Only these two states can be chosen when configuring a court. */
const COURT_STATUSES: CourtStatus[] = ['available', 'maintenance'];

const FIELD_LABEL_CLASS = 'block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5';

interface BranchCourtDialogProps {
  mode: 'create' | 'edit';
  initialCourt: BranchCourtDraft;
  onSubmit: (court: BranchCourtDraft) => void;
  onClose: () => void;
}

/**
 * Create / edit a single court (name + status only). Mount it only while open
 * so its state always starts from `initialCourt`. Any other court fields on
 * `initialCourt` are passed through unchanged.
 */
export const BranchCourtDialog: React.FC<BranchCourtDialogProps> = ({
  mode,
  initialCourt,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation('branch');
  const [name, setName] = useState(initialCourt.name);
  const [status, setStatus] = useState<CourtStatus>(initialCourt.status);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('validation.courtNameRequired');
      return;
    }
    onSubmit({ ...initialCourt, name: trimmed, status });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {mode === 'create' ? t('actions.addCourt') : t('actions.editCourt')}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {t('form.courts.dialogDescription')}
            </DialogDescription>
          </DialogHeader>

          <div>
            <label htmlFor="court-name" className={FIELD_LABEL_CLASS}>
              {t('form.courts.name')} <span className="text-red-500">*</span>
            </label>
            <input
              id="court-name"
              type="text"
              autoFocus
              value={name}
              placeholder={t('form.placeholders.courtName')}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              aria-invalid={Boolean(nameError)}
              className="w-full h-11 px-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900"
            />
            {nameError && <p className="text-xs text-red-500 mt-1">{t(nameError)}</p>}
          </div>

          <div>
            <label className={FIELD_LABEL_CLASS}>
              {t('form.courts.status')} <span className="text-red-500">*</span>
            </label>
            <Select value={status} onValueChange={(value) => setStatus(value as CourtStatus)}>
              <SelectTrigger
                aria-label={t('form.courts.status')}
                className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/70 text-sm"
              >
                <SelectValue placeholder={t('form.placeholders.courtStatus')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                {COURT_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value === 'available' ? t('form.courts.active') : t('form.courts.inactive')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {mode === 'create' ? t('actions.addCourt') : t('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
