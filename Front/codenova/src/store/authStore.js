import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode'; // ✅


const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,   // { nickname: string }
      token: null,
      tokenExp: null,

      login: ({ nickname, token, userType = "member" }) => {
        let exp = null;
        
        if (userType === "member") {
          try {
            const decode = jwtDecode(token);
            exp = decode.exp;
          } catch (e) {
            exp = null;
          }
        }
        set({ user: { nickname, userType }, token, tokenExp: exp });
      },

      logout: () => 
        set({ user: null, token: null , tokenExp: null }),
    
      updateNickname: (newNickName) => {
        const { token, user, tokenExp} = get();
        if (user) {
          set({ user: { ...user, nickname: newNickName}, token, tokenExp});
        }
      },

      isTokenValid: () => {
        const { tokenExp , user } = get();

        if (user?.userType === 'guest') return true; // 비회원은 그냥 패스

        if (!tokenExp) return false; // 회원 인데 시간 없으면 무조건 false

        const now = Math.floor(Date.now() / 1000 );
        //console.log(now.toString());
        return now + 120 < tokenExp;
      }

    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
