import axios from "axios";
import { getAccessToken } from "../utils/tokenUtils";
import  useAuthStore from "../store/authStore";
import  { useSessionStore } from "../store/useSessionStore";
import  { useChatStore} from "../store/useChatStore";

// 언니오빠들이 쓸 거 
// import authApi from "./authAxiosConfig"; 
// 이렇게 import 해서 쓰면 됨 
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Authorization 자동 추가
authApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // JWT 만료 등 인증 문제 → 메인으로 이동
      localStorage.removeItem("auth-storage");
      localStorage.removeItem("session");
      localStorage.removeItem("chat-storage");
      useAuthStore.getState().logout();
      useSessionStore.getState().clearSession();
      useChatStore.getState().clearAllChats();
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
)

export default authApi;


