import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast, type ToastPayload } from '@/lib/toast';

const stylesByType: Record<ToastPayload['type'], string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
};

const iconByType: Record<ToastPayload['type'], typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export const Toaster = () => {
  const [items, setItems] = useState<ToastPayload[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe(setItems);
    return unsubscribe;
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      {items.map((item) => {
        const Icon = iconByType[item.type];

        return (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-lg backdrop-blur-sm',
              stylesByType[item.type],
            )}
            role="status"
            aria-live="polite"
          >
            <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm opacity-80">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(item.id)}
              className="rounded-md p-1 text-current opacity-70 transition hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <XCircle className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
