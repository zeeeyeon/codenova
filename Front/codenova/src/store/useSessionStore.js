import { create } from "zustand";
import { getSessionKey } from "../api/apiEncrytionApi";


export const useSessionStore = create((set) => {

    let refreshTimer = null;

    const scheduleRefresh = (expireAt) => {

        if (refreshTimer) clearTimeout(refreshTimer);
    
        const expireAtUtcFixed = expireAt.endsWith('Z') ? expireAt : `${expireAt}Z`;
        const delayMs = new Date(expireAtUtcFixed).getTime() - Date.now() - 1000;
        if ( delayMs > 0 ) {
            // console.log(`${delayMs / 1000}s 후 자동 갱신`)
            refreshTimer = setTimeout(() => {
                getSessionKeyHandler();
            }, delayMs);
        }
    };

    const getSessionKeyHandler = async () => {
        try {
          const respnse = await getSessionKey();
          const { code, message } = respnse.status;
        
          if (code === 200) {
            const sessionKey = respnse.content.sessionKey;
            const expireAt = respnse.content.expireAt;

            set({ sessionKey, expireAt })
            localStorage.setItem('session', JSON.stringify({ sessionKey, expireAt}));

            scheduleRefresh(expireAt);

          } else {
            // console.log("오류메시지 : ", message);
          }
        } catch (e) {
          console.error("세션션 발급 실패요~~", e);
          throw e
        }
    }
    
    return {
        sessionKey: null,
        expireAt: null,

        setSession : () => getSessionKeyHandler(),
        clearSession : () => {
            if (refreshTimer) clearTimeout(refreshTimer);  // ⛔ 타이머 정리
            refreshTimer = null;
            
                set(() => {
                localStorage.removeItem('session');
                return { sessionKey: null, expireAt: null};
            })
        },
        initSessionFromStorage: () => {
            const stored = JSON.parse(localStorage.getItem('session'));
            if (stored?.sessionKey && stored?.expireAt) {
                set({ sessionKey: stored.sessionKey, expireAt: stored.expireAt });
                scheduleRefresh(stored.expireAt);
            }
        },

        refreshSessionManually: () => getSessionKeyHandler(),
    };
});