type ToastType = 'success' | 'error' | 'info';

export interface ToastPayload {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
}

const listeners = new Set<(toasts: ToastPayload[]) => void>();
let toasts: ToastPayload[] = [];
let nextId = 1;

const publish = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

const removeToast = (id: number) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  publish();
};

const pushToast = (type: ToastType, title: string, description?: string) => {
  const item: ToastPayload = { id: nextId++, title, description, type };
  toasts = [...toasts, item];
  publish();

  window.setTimeout(() => removeToast(item.id), 4000);
};

export const toast = {
  success: (title: string, description?: string) => pushToast('success', title, description),
  error: (title: string, description?: string) => pushToast('error', title, description),
  info: (title: string, description?: string) => pushToast('info', title, description),
  subscribe: (listener: (payload: ToastPayload[]) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  dismiss: removeToast,
};
