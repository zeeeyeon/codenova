import { io } from "socket.io-client";

let socket = null;
let isConnecting = false; // ✅ 연결 시도 중인지

const SERVER_URL = "http://localhost:9092";

// 소켓 연결 함수
export const connectSocket = (forceReconnect = false) => {
  if (socket && socket.connected && !forceReconnect) {
    console.log("[Socket] 이미 연결되어 있습니다.");
    return;
  }
  if (isConnecting) {
    console.log("[Socket] 이미 연결 시도중입니다.");
    return;
  }

  isConnecting = true;
  
  socket = io(SERVER_URL, {
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,                // ✅ 끊기면 재연결
    reconnectionAttempts: Infinity,    // ✅ 무한 재연결 시도
    reconnectionDelay: 1000,            // ✅ 1초 간격으로 시도
  });

  socket.on('connect', () => {
    console.log(`[Socket Connected] ID: ${socket.id}`);
    isConnecting = false;
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
};

// 소켓 가져오기
export const getSocket = () => {
  if (!socket || !socket.connected) {
    // 한 번만 경고 찍거나, 필요할 때만 찍어도 된다
    console.warn("⚠️ Socket is not connected.");
    return null;
  }
  return socket;
};

// 소켓 연결 끊기
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnecting = false;
    console.log("[Socket Disconnected] by manual");
  }
};
