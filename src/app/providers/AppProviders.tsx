import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { I18nextProvider } from 'react-i18next';
import { queryClient } from '@/lib/query-client';
import i18n from '@/i18n';
import { ErrorBoundary } from '@/app/providers/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </I18nextProvider>
  </ErrorBoundary>
);
