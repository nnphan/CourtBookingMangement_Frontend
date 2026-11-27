import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ApiErrorShape } from '@/types/api';
import { useCreateStaff } from '../hooks/useStaffManagement';
import type { CreateStaffResponse, StaffOwnedBranch } from '../types/staff.types';

const schema = z.object({
  displayName: z.string().trim().min(2, 'staffManagement.create.validation.name').max(100, 'staffManagement.create.validation.name'),
  email: z.string().trim().email('staffManagement.create.validation.email').max(100, 'staffManagement.create.validation.email'),
  phoneNumber: z.string().trim().min(1, 'staffManagement.create.validation.phone').max(20, 'staffManagement.create.validation.phone'),
  password: z.string().min(8, 'staffManagement.create.validation.password')
    .refine((value) => value.trim().length > 0 && new TextEncoder().encode(value).length <= 72, 'staffManagement.create.validation.password'),
  employmentStartDate: z.string(),
  notes: z.string().max(1000, 'staffManagement.create.validation.notes'),
  branchIds: z.array(z.string().uuid()).min(1, 'staffManagement.create.validation.branches'),
});

type FormValues = z.infer<typeof schema>;
type TextField = Exclude<keyof FormValues, 'branchIds' | 'notes'>;

const fields: { name: TextField; type: string; required?: boolean; maxLength?: number }[] = [
  { name: 'displayName', type: 'text', required: true, maxLength: 100 },
  { name: 'email', type: 'email', required: true, maxLength: 100 },
  { name: 'phoneNumber', type: 'tel', required: true, maxLength: 20 },
  { name: 'password', type: 'text', required: true, maxLength: 72 },
  { name: 'employmentStartDate', type: 'date' },
];

const inputClass = 'min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

interface Props {
  branches: StaffOwnedBranch[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StaffCreateDialog = ({ branches, open, onOpenChange }: Props) => {
  const { t } = useTranslation();
  const create = useCreateStaff();
  const submitting = useRef(false);
  const [result, setResult] = useState<CreateStaffResponse | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [validationDetail, setValidationDetail] = useState('');
  const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', email: '', phoneNumber: '', password: '12345678', employmentStartDate: '', notes: '', branchIds: [] },
  });

  const submit = async (values: FormValues) => {
    if (submitting.current || uncertain) return;
    clearErrors('root');
    setValidationDetail('');
    if (values.branchIds.some((id) => !branches.some((branch) => branch.branchId === id))) {
      setError('branchIds', { message: 'staffManagement.create.validation.branchesChanged' });
      return;
    }
    submitting.current = true;
    try {
      const response = await create.mutateAsync({
        ...values,
        employmentStartDate: values.employmentStartDate || null,
        notes: values.notes.trim() || null,
      });
      setResult(response);
    } catch (error) {
      const apiError = typeof error === 'object' && error !== null ? error as Partial<ApiErrorShape> : {};
      if (apiError.code === 'STAFF_CODE_ALREADY_USED') {
        setError('root', { message: 'staffManagement.create.conflictCode' });
      } else if (apiError.code === 'STAFF_ALREADY_EXISTS') {
        setError('email', { message: 'staffManagement.create.conflictContact' }, { shouldFocus: true });
        setError('phoneNumber', { message: 'staffManagement.create.conflictContact' });
      } else if (apiError.status === 403 || apiError.code === 'STAFF_BRANCH_ACCESS_DENIED') {
        setError('root', { message: 'staffManagement.create.forbidden' });
      } else if (apiError.code === 'STAFF_ROLE_NOT_CONFIGURED') {
        setError('root', { message: 'staffManagement.create.roleNotConfigured' });
      } else if (apiError.status === 400 || apiError.code === 'STAFF_INVALID_REQUEST') {
        setError('root', { message: 'staffManagement.create.invalid' });
        if (apiError.code === 'STAFF_INVALID_REQUEST' && typeof apiError.message === 'string') {
          setValidationDetail(apiError.message);
        }
      } else {
        setUncertain(true);
        setError('root', { message: 'staffManagement.create.unknownOutcome' });
      }
    } finally {
      submitting.current = false;
    }
  };

  const changeOpen = (next: boolean) => {
    if (!submitting.current) onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl" closeDisabled={create.isPending}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => { if (submitting.current) event.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>{t('staffManagement.create.title')}</DialogTitle>
          <DialogDescription>{t('staffManagement.create.explanation')}</DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="space-y-4" role="status">
            <p className="font-semibold text-emerald-700">{t('staffManagement.create.created')}</p>
            {result.staffCode && <p className="text-sm text-slate-700">{t('staffManagement.create.assignedCode', { code: result.staffCode })}</p>}
            <Button type="button" className="min-h-11" onClick={() => changeOpen(false)}>{t('staffManagement.create.done')}</Button>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(({ name, type, required, maxLength }) => (
                <div key={name} className="space-y-1">
                  <label htmlFor={`staff-create-${name}`} className="block text-sm font-medium text-slate-700">
                    {t(`staffManagement.create.fields.${name}`)}{required && ' *'}
                  </label>
                  <input id={`staff-create-${name}`} type={type} maxLength={maxLength} required={required}
                    aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `staff-create-${name}-error` : undefined}
                    className={inputClass} autoComplete={name === 'password' ? 'new-password' : undefined} {...register(name)} />
                  {errors[name]?.message && <p id={`staff-create-${name}-error`} className="text-sm text-red-700">{t(errors[name].message)}</p>}
                </div>
              ))}
              <div className="space-y-1">
                <label htmlFor="staff-create-code" className="block text-sm font-medium text-slate-700">{t('staffManagement.create.fields.staffCode')}</label>
                <input id="staff-create-code" readOnly value={t('staffManagement.create.generatedCode')} className={`${inputClass} bg-slate-50 text-slate-600`} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="staff-create-notes" className="block text-sm font-medium text-slate-700">{t('staffManagement.create.fields.notes')}</label>
                <textarea id="staff-create-notes" maxLength={1000} rows={3} className={`${inputClass} py-2`}
                  aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? 'staff-create-notes-error' : undefined} {...register('notes')} />
                {errors.notes?.message && <p id="staff-create-notes-error" className="text-sm text-red-700">{t(errors.notes.message)}</p>}
              </div>
            </div>
            <fieldset aria-describedby={errors.branchIds ? 'staff-create-branches-error' : undefined}>
              <legend className="text-sm font-medium text-slate-700">{t('staffManagement.create.fields.branches')} *</legend>
              <div className="mt-1 grid gap-1 sm:grid-cols-2">
                {branches.map((branch) => (
                  <label key={branch.branchId} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3">
                    <input type="checkbox" value={branch.branchId} className="size-5 accent-emerald-600" {...register('branchIds')} />
                    <span className="text-sm">{branch.branchName}</span>
                  </label>
                ))}
              </div>
              {errors.branchIds?.message && <p id="staff-create-branches-error" className="text-sm text-red-700">{t(errors.branchIds.message)}</p>}
            </fieldset>
            {errors.root?.message && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <p>{t(errors.root.message)}</p>
                {validationDetail && <p className="mt-1">{validationDetail}</p>}
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" className="min-h-11" disabled={create.isPending} onClick={() => changeOpen(false)}>
                {t(uncertain ? 'staffManagement.create.done' : 'staffManagement.create.cancel')}
              </Button>
              <Button type="submit" className="min-h-11" disabled={create.isPending || uncertain || branches.length === 0}>
                {t(create.isPending ? 'staffManagement.create.submitting' : 'staffManagement.create.submit')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
