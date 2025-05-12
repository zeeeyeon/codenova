import { io } from "socket.io-client";

// const SERVER_URL =
//   import.meta.env.VITE_SOCKET_URL ||
//   import.meta.env.VITE_API_BASE_URL.replace(/^http/, "ws");

// const socket = io("wss://www.codenova.kr/socket.io", {
//   transports: ["websocket"]
// });
let socket = null;
let isConnecting = false;

// const SERVER_URL = "http://localhost:9092";
const SERVER_URL = import.meta.env.VITE_REACT_APP_SOCKET_URL;
// console.log("소켓 URL",SERVER_URL);
// const SERVER_URL = import.meta.env.VITE_REL_REACT_APP_SOCKET_URL;

export const connectSocket = (forceReconnect = false) => {
  if (socket && socket.connected && !forceReconnect) {
    // console.log("[Socket] 이미 연결되어 있습니다.");
    return;
  }
  if (isConnecting) {
    // console.log("[Socket] 이미 연결 시도중입니다.");
    return;
  }

  isConnecting = true;
  
  socket = io(SERVER_URL, {
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    // console.log(`[Socket Connected] ID: ${socket.id}`);
    isConnecting = false;
  });

  socket.on('disconnect', (reason) => {
    // console.warn(`[Socket Disconnected] Reason: ${reason}`);
    if (!socket.connected) {
      // console.warn("[Socket] 끊겼음. 강제 재연결 시도함.");
      connectSocket(true); // ⭐ 강제 재연결
    }
  });

  socket.on('connect_error', (err) => {
    console.error(`[Socket Connect Error] ${err.message}`);
    if (!socket.connected) {
      // console.warn("[Socket] 연결 에러 발생. 강제 재연결 시도함.");
      connectSocket(true);
    }
  });

  socket.on('connect_timeout', () => {
    // console.warn("[Socket Connect Timeout]");
    if (!socket.connected) {
      connectSocket(true);
    }
  });

  socket.on('error', (error) => {
    // console.error(`[Socket Error]`, error);
    if (!socket.connected) {
      connectSocket(true);
    }
  });

  socket.on('reconnect_attempt', (attempt) => {
    // console.log(`[Socket Reconnect Attempt] Attempt: ${attempt}`);
  });

  socket.on('reconnect', (attempt) => {
    // console.log(`[Socket Reconnected] Attempts: ${attempt}`);
    isConnecting = false;
  });
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    // console.warn("⚠️ Socket is not connected.");
    // window.location.reload();
    connectSocket(true)
  }
  return socket;
};


export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    // console.log("[Socket Disconnected] by manual");
    socket = null;
    isConnecting = false;
  }
};


