import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,   // { nickname: string }
      token: null,

      login: ({ nickname, token, userType = "member" }) => 
        set({ user: { nickname, userType }, token }),

      logout: () => 
        set({ user: null, token: null }),
    
      updateNickname: (newNickName) => {
        const { token, user } = get();
        if (user) {
          set({ user: { ...user, nickname: newNickName}, token});
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
