import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card, CardBody } from '@/components/ui/card';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { paths } from '@/app/router/paths';

export const RegisterPage = () => {
  const { t } = useTranslation();

  return (
    <AuthLayout title={t('auth.register.title')}>
      <Card>
        <CardBody>
          <RegisterForm />
          <p className="mt-5 text-center text-sm text-content-primary">
            {t('auth.register.hasAccount')}{' '}
            <Link to={paths.login} className="font-bold text-content-link underline-offset-2 hover:underline">
              {t('auth.register.loginLink')}
            </Link>
          </p>
        </CardBody>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;
