import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/router/paths';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';
import { activateStaffInvitation, validateStaffInvitation } from '../api/staff-invitation.api';
import {
  staffInvitationLinkSchema,
  staffInvitationPasswordSchema,
  type StaffInvitationLink,
  type StaffInvitationPasswordValues,
} from '../schemas/staff-invitation.schema';
import type { StaffInvitationValidationResponse } from '../types/staff-invitation.types';

type ActivationStatus =
  | 'loading'
  | 'ready'
  | 'invalid'
  | 'expired'
  | 'used'
  | 'revoked'
  | 'error'
  | 'rateLimited'
  | 'success';

const readInvitationLink = (search: string): StaffInvitationLink | null => {
  const params = new URLSearchParams(search);
  const tokens = params.getAll('token');
  const emails = params.getAll('email');
  if (tokens.length !== 1 || emails.length !== 1) return null;

  const parsed = staffInvitationLinkSchema.safeParse({
    token: tokens[0],
    email: emails[0],
  });
  return parsed.success ? parsed.data : null;
};

const getErrorCode = (error: unknown): string | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }
  return undefined;
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
  ) {
    return error.status;
  }
  return undefined;
};

const getInvitationErrorStatus = (error: unknown): ActivationStatus => {
  switch (getErrorCode(error)) {
    case 'STAFF_INVITATION_EXPIRED':
      return 'expired';
    case 'STAFF_INVITATION_ALREADY_USED':
      return 'used';
    case 'STAFF_INVITATION_REVOKED':
      return 'revoked';
    case 'STAFF_INVITATION_INVALID':
      return 'invalid';
    default:
      return getErrorStatus(error) === 429 ? 'rateLimited' : 'error';
  }
};

const isTerminalInvitationStatus = (status: ActivationStatus) =>
  status === 'invalid' || status === 'expired' || status === 'used' || status === 'revoked';

const getStatusMessageKey = (status: ActivationStatus): string => {
  switch (status) {
    case 'loading':
      return 'staffActivation.states.loading';
    case 'invalid':
      return 'staffActivation.states.invalid';
    case 'expired':
      return 'staffActivation.states.expired';
    case 'used':
      return 'staffActivation.states.used';
    case 'revoked':
      return 'staffActivation.states.revoked';
    case 'rateLimited':
      return 'staffActivation.states.rateLimited';
    case 'error':
      return 'staffActivation.states.validationError';
    case 'success':
      return 'staffActivation.states.success';
    case 'ready':
      return '';
  }
};

export const StaffActivationPage = () => {
  const { t } = useTranslation();
  const { formatDate } = useLocaleFormatters();
  const location = useLocation();
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const shouldFocusErrorSummary = useRef(false);
  const [invitationLink, setInvitationLink] = useState(() => readInvitationLink(location.search));
  const [validation, setValidation] = useState<StaffInvitationValidationResponse | null>(null);
  const [status, setStatus] = useState<ActivationStatus>(() =>
    invitationLink ? 'loading' : 'invalid',
  );
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffInvitationPasswordValues>({
    resolver: zodResolver(staffInvitationPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const fieldErrorItems = [
    { id: 'staff-activation-password', message: errors.password?.message },
    { id: 'staff-activation-confirm-password', message: errors.confirmPassword?.message },
  ].filter((item): item is { id: string; message: string } => typeof item.message === 'string');

  useLayoutEffect(() => {
    if (!location.search) return;

    const nextInvitationLink = readInvitationLink(location.search);
    setInvitationLink(nextInvitationLink);
    setValidation(null);
    setSubmitError(null);
    setShowErrorSummary(false);
    shouldFocusErrorSummary.current = false;
    reset({ password: '', confirmPassword: '' });
    setStatus(nextInvitationLink ? 'loading' : 'invalid');
    navigate({ pathname: location.pathname, hash: location.hash }, { replace: true });
  }, [location.hash, location.key, location.pathname, location.search, navigate, reset]);

  useEffect(() => {
    if (!invitationLink) return;

    const controller = new AbortController();
    let active = true;

    void validateStaffInvitation(invitationLink, controller.signal)
      .then((response) => {
        if (!active) return;
        if (!response.valid) {
          setStatus('invalid');
          setInvitationLink(null);
          return;
        }
        setValidation(response);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        const nextStatus = getInvitationErrorStatus(error);
        setStatus(nextStatus);
        if (isTerminalInvitationStatus(nextStatus)) {
          setInvitationLink(null);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [invitationLink, validationAttempt]);

  useEffect(() => {
    if (!shouldFocusErrorSummary.current || !errorSummaryRef.current) return;
    errorSummaryRef.current.focus();
    shouldFocusErrorSummary.current = false;
  }, [fieldErrorItems.length, showErrorSummary, submitError]);

  const submit = async (values: StaffInvitationPasswordValues) => {
    if (!invitationLink || status !== 'ready') return;

    setSubmitError(null);
    setShowErrorSummary(false);
    const request = {
      token: invitationLink.token,
      email: invitationLink.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
    };

    try {
      await activateStaffInvitation(request);
      setValidation(null);
      setInvitationLink(null);
      setStatus('success');
    } catch (error: unknown) {
      const code = getErrorCode(error);
      const nextStatus = getInvitationErrorStatus(error);
      if (isTerminalInvitationStatus(nextStatus)) {
        setValidation(null);
        setInvitationLink(null);
        setStatus(nextStatus);
      } else {
        const messageKey =
          code === 'PASSWORD_POLICY_FAILED'
            ? 'staffActivation.errors.passwordPolicy'
            : code === 'PASSWORD_CONFIRMATION_MISMATCH'
              ? 'staffActivation.errors.passwordMismatch'
              : getErrorStatus(error) === 429
                ? 'staffActivation.states.rateLimited'
                : 'staffActivation.states.activationError';
        shouldFocusErrorSummary.current = true;
        setSubmitError(messageKey);
        setShowErrorSummary(true);
      }
    } finally {
      request.password = '';
      request.confirmPassword = '';
      reset({ password: '', confirmPassword: '' });
    }
  };

  const retryValidation = () => {
    setStatus('loading');
    setValidationAttempt((attempt) => attempt + 1);
  };

  const onInvalidSubmit = () => {
    shouldFocusErrorSummary.current = true;
    setShowErrorSummary(true);
  };

  const stateMessage = getStatusMessageKey(status);

  return (
    <AuthLayout title={t('staffActivation.title')}>
      <Card>
        <CardBody className="space-y-6">
          {status === 'loading' ? (
            <div className="flex items-center justify-center gap-3 py-8" role="status">
              <Loader2 aria-hidden className="text-brand-600 size-5 animate-spin" />
              <p>{t(stateMessage)}</p>
            </div>
          ) : status === 'ready' && validation && invitationLink ? (
            <div className="space-y-6">
              <section aria-labelledby="staff-activation-summary-title" className="space-y-3">
                <h2 id="staff-activation-summary-title" className="text-lg font-semibold">
                  {t('staffActivation.account.title')}
                </h2>
                <dl className="bg-surface-muted grid gap-3 rounded-xl p-4 text-sm sm:grid-cols-2">
                  <div className="min-w-0">
                    <dt className="text-content-secondary font-medium">
                      {t('staffActivation.account.name')}
                    </dt>
                    <dd className="text-content-primary mt-1 font-semibold break-words">
                      {validation.displayName}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-content-secondary font-medium">
                      {t('staffActivation.account.expiresAt')}
                    </dt>
                    <dd className="text-content-primary mt-1">
                      {formatDate(validation.expiresAt, { withTime: true })}
                    </dd>
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <dt className="text-content-secondary font-medium">
                      {t('staffActivation.account.branches')}
                    </dt>
                    <dd className="text-content-primary mt-1">
                      {validation.branchNames.length > 0 ? (
                        <ul className="list-inside list-disc space-y-1">
                          {validation.branchNames.map((branchName, index) => (
                            <li key={`${branchName}-${index}`} className="break-words">
                              {branchName}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        t('staffActivation.account.noBranches')
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              <form
                noValidate
                onSubmit={handleSubmit(submit, onInvalidSubmit)}
                className="space-y-5"
              >
                {(submitError || (showErrorSummary && fieldErrorItems.length > 0)) && (
                  <div
                    ref={errorSummaryRef}
                    tabIndex={-1}
                    role="alert"
                    aria-labelledby="staff-activation-error-title"
                    className="border-danger/30 bg-danger/5 text-danger focus-visible:ring-danger space-y-2 rounded-xl border p-4 text-sm focus:outline-none focus-visible:ring-2"
                  >
                    <h2 id="staff-activation-error-title" className="font-semibold">
                      {t('staffActivation.form.errorSummary')}
                    </h2>
                    {submitError && <p>{t(submitError)}</p>}
                    {showErrorSummary && fieldErrorItems.length > 0 && (
                      <ul className="list-inside list-disc space-y-1">
                        {fieldErrorItems.map(({ id, message }) => (
                          <li key={id}>
                            <a className="underline underline-offset-2" href={`#${id}`}>
                              {t(message)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <PasswordInput
                    id="staff-activation-password"
                    label={t('staffActivation.form.password')}
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    error={errors.password?.message ? t(errors.password.message) : undefined}
                    aria-describedby="staff-activation-password-help"
                    {...register('password')}
                  />
                  <p
                    id="staff-activation-password-help"
                    className="text-content-secondary text-sm leading-6"
                  >
                    {t('staffActivation.form.passwordRequirements')}
                  </p>
                </div>

                <PasswordInput
                  id="staff-activation-confirm-password"
                  label={t('staffActivation.form.confirmPassword')}
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                  error={
                    errors.confirmPassword?.message ? t(errors.confirmPassword.message) : undefined
                  }
                  {...register('confirmPassword')}
                />

                <Button type="submit" block loading={isSubmitting}>
                  {t(
                    isSubmitting
                      ? 'staffActivation.form.submitting'
                      : 'staffActivation.form.submit',
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div
              className="space-y-5 text-center"
              role={status === 'success' ? 'status' : 'alert'}
              aria-live={status === 'success' ? 'polite' : 'assertive'}
            >
              <p className="text-content-primary">{t(stateMessage)}</p>
              {(status === 'error' || status === 'rateLimited') && invitationLink && (
                <Button type="button" variant="outline" onClick={retryValidation}>
                  {t('staffActivation.retry')}
                </Button>
              )}
              <Link
                to={paths.login}
                className={`${buttonVariants({ variant: status === 'success' ? 'primary' : 'outline' })} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2`}
              >
                {t('staffActivation.signIn')}
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    </AuthLayout>
  );
};

export default StaffActivationPage;
