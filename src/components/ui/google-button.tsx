import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const GoogleMark = () => (
  <svg aria-hidden viewBox="0 0 48 48" className="size-5">
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.15-3.2-.44-4.7H24v9h12.7c-.55 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.8-9.9 6.8-17.2z"
    />
    <path
      fill="#FBBC05"
      d="M10.4 28.7a14.5 14.5 0 0 1 0-9.4l-7.8-6.1a24 24 0 0 0 0 21.6l7.8-6.1z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.4 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
    />
  </svg>
);

export const GoogleButton = ({
  onClick,
  loading,
}: {
  onClick?: () => void;
  loading?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Button type="button" variant="outline" block loading={loading} onClick={onClick}>
      {loading ? null : <GoogleMark />}
      <span className="font-medium">{t('auth.login.google')}</span>
    </Button>
  );
};
