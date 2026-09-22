import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card, CardBody } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoogleButton } from '@/components/ui/google-button';
import { OwnerAppBanner } from '@/components/common/OwnerAppBanner';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { LoginPhoneForm } from '@/features/auth/components/LoginPhoneForm';
import { LoginEmailForm } from '@/features/auth/components/LoginEmailForm';
import { paths } from '@/app/router/paths';

export const LoginPage = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'phone' | 'email'>('phone');

  return (
    <AuthLayout title={t('auth.login.title')}>
      <LanguageSwitcher className="mb-4 self-end" />

      <Card>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'phone' | 'email')}>
          <TabsList>
            <TabsTrigger value="phone">{t('auth.login.tabPhone')}</TabsTrigger>
            <TabsTrigger value="email">{t('auth.login.tabEmail')}</TabsTrigger>
          </TabsList>

          <CardBody>
            <TabsContent value="phone">
              <LoginPhoneForm />
            </TabsContent>
            <TabsContent value="email">
              <LoginEmailForm />
            </TabsContent>

            <p className="mt-5 text-center text-sm text-content-primary">
              {t('auth.login.forgotPrompt')}{' '}
              <Link to={paths.forgotPassword} className="font-bold text-content-primary underline-offset-2 hover:underline">
                {t('auth.login.forgotLink')}
              </Link>
            </p>
          </CardBody>
        </Tabs>
      </Card>

      <p className="mt-6 text-center text-[15px] text-content-onbrand">
        {t('auth.login.noAccount')}{' '}
        <Link to={paths.register} className="font-bold underline-offset-2 hover:underline">
          {t('auth.login.registerLink')}
        </Link>
      </p>

      <div className="mt-5 w-full">
        <GoogleButton />
      </div>

      <div className="mt-8 w-full">
        <OwnerAppBanner />
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
