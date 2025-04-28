// src/sockets/socketClient.js
import { io } from "socket.io-client";

// 로컬 서버 주소 + 포트
const SERVER_URL = "http://localhost:9092";

// 소켓 연결 생성
const socket = io(SERVER_URL, {
  transports: ["websocket"], // 웹소켓만 사용
  withCredentials: true,     // 쿠키 인증 필요 시 true, 필요없으면 false
});

// 연결 성공 시
socket.on('connect', () => {
  console.log(`[Socket Connected] ID: ${socket.id}`);
});

// 연결 끊길 시
socket.on('disconnect', (reason) => {
  console.log(`[Socket Disconnected] Reason: ${reason}`);
});

// 재연결 성공 시
socket.on('reconnect', (attempt) => {
  console.log(`[Socket Reconnected] Attempts: ${attempt}`);
});

// 재연결 시도할 때
socket.on('reconnect_attempt', (attempt) => {
  console.log(`[Socket Reconnect Attempt] Attempt: ${attempt}`);
});

export default socket;
