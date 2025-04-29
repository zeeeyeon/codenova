// src/sockets/socketClient.js
import { io } from "socket.io-client";

let socket = null; // 소켓 객체를 초기엔 null로

const SERVER_URL = "http://localhost:9092";

// 소켓 연결 함수
export const connectSocket = () => {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log(`[Socket Connected] ID: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected] Reason: ${reason}`);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`[Socket Reconnected] Attempts: ${attempt}`);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`[Socket Reconnect Attempt] Attempt: ${attempt}`);
    });
  }
};

// 소켓 가져오기
export const getSocket = () => {
  if (!socket || !socket.connected) {
    console.warn("⚠️ Socket is not connected.");
    return null;
  }
  return socket;
};

// ✅ 소켓 연결 끊기
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // socket 객체 비워버리기
    console.log("[Socket Disconnected] by logout");
  }
};