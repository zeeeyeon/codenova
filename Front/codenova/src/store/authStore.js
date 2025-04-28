import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,   // { nickname: string }
      token: null,

      login: ({ nickname, token }) => 
        set({ user: { nickname }, token }),

      logout: () => 
        set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
