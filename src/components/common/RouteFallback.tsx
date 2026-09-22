import { Loader2 } from 'lucide-react';

export const RouteFallback = () => (
  <div className="auth-canvas grid min-h-dvh place-items-center">
    <Loader2 aria-label="Loading" className="size-8 animate-spin text-content-onbrand" />
  </div>
);
