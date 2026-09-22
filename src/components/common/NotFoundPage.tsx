import { Link } from 'react-router';
import { paths } from '@/app/router/paths';
import { Button } from '@/components/ui/button';

export const NotFoundPage = () => (
  <div className="auth-canvas grid min-h-dvh place-items-center px-4 text-center">
    <div className="max-w-sm">
      <p className="text-[64px] font-bold leading-none text-content-onbrand">404</p>
      <p className="mt-3 text-content-onbrand/90">
        Trang này không tồn tại. Quay lại trang đăng nhập để tiếp tục.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to={paths.login}>Về trang đăng nhập</Link>
      </Button>
    </div>
  </div>
);

export default NotFoundPage;
