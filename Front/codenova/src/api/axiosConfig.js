import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000, // 5초 안에 응답 없으면 실패
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 같은거 보낼때 필요하면 true (지금은 false여도 상관없음)
});

export default api;
