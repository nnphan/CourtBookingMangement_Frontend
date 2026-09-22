import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/auth.store';

/** Connects the realtime channel while a session exists, and tears it down after. */
export const useSocket = (handlers: Record<string, (payload: unknown) => void> = {}) => {
  const authenticated = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (!authenticated) return;
    const socket = getSocket();
    socket.connect();
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);
};
