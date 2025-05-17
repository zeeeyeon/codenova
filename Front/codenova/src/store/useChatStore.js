import { create } from "zustand";
import { persist } from 'zustand/middleware';

const EXPIRY_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7일

export const useChatStore = create(
    persist(
        (set, get) => ({

        chats: {}, // { [codeId]: [ { sender, message, time } ] }

        // 특정 codeId에 메시지 추가
        addMessage: (codeId, message) => {
            set((state) => ({
                chats: {
                    ...state.chats,
                    [codeId]: [...(state.chats[codeId] ?? []), message]
                }
            }))
        },

        getMessages: (codeId) => (get().chats[codeId] || []),

        replaceLastMessage: (codeId, message) => {
            const current = get().chats[codeId] ?? [];
            if (current.length === 0) return;
            set((state) => ({
                chats: {
                    ...state.chats,
                    [codeId]: [...current.slice(0, -1), message],
                },
            }));
        },

        clearChat: (codeId) => set((state) => ({
            chats: {
                ...state.chats,
                [codeId]: []
            }
        })),
        clearAllChats: () => set({ chats: {} }),

        getChatByCodeId: (codeId) => get.chats?.[codeId] ?? [],
        
        
    }),
        {
            name: "chat-storage"
        }
    )
);
