import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card, CardBody } from '@/components/ui/card';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui/button';

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  return (
    <AuthLayout title={t('auth.login.forgotLink')}>
      <Card>
        <CardBody>
          <form noValidate className="space-y-5">
            <TextInput
              id="forgot-phone"
              type="tel"
              inputMode="numeric"
              label={t('auth.fields.phoneLabel')}
              placeholder={t('auth.fields.phonePlaceholder')}
            />
            <Button type="submit" block className="font-bold">
              {t('auth.login.forgotLink')}
            </Button>
          </form>
        </CardBody>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
