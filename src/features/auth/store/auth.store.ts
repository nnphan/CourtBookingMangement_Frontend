import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthSession, User } from '@/types/auth';
import { tokenStorage, isExpired } from '@/lib/token-storage';
import { disconnectSocket } from '@/lib/socket';
import { queryClient } from '@/lib/query-client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: 'authenticated' | 'unauthenticated';
  hasHydrated: boolean;
  setSession: (session: AuthSession) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
      hasHydrated: false,

      setSession: ({ user, accessToken, refreshToken }) => {
        tokenStorage.write({ accessToken, refreshToken });
        set({ user, accessToken, status: 'authenticated' });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        tokenStorage.clear();
        disconnectSocket();
        queryClient.clear();
        set({ user: null, accessToken: null, status: 'unauthenticated' });
      },

      isAuthenticated: () => {
        const token = get().accessToken ?? tokenStorage.read()?.accessToken ?? null;
        return !!token && !isExpired(token);
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'alobo.session',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ user, accessToken, status }) => ({ user, accessToken, status }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/** Axios emits this when a refresh attempt fails. */
window.addEventListener('alobo:session-expired', () => useAuthStore.getState().logout());
