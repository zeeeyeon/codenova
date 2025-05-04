import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,   // { nickname: string }
      token: null,

      login: ({ nickname, token, userType = "member" }) => 
        set({ user: { nickname, userType }, token }),

      logout: () => 
        set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
