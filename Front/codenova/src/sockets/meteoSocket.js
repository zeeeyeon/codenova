import socket from "./socketClient";

// 방 생성성
export const createMeteoRoom = ({ isPrivate, nickname }, onSuccess, onError) => {
  console.log("📤 [createMeteoRoom] createRoom emit 보냄", { isPrivate, nickname });

  socket.emit("createRoom", { isPrivate, nickname });

  socket.once("roomCreate", (roomData) => {
    console.log("✅ [createMeteoRoom] roomCreated 수신", roomData);
    onSuccess(roomData);
  });

  socket.once("error", (error) => {
    console.error("❌ [createMeteoRoom] error 수신", error);
    onError(error.message);
  });
};

// 방 참가
export const joinMeteoRoom = ({ roomCode, nickname }, onSuccess, onError) => {
  console.log("[SOCKET] joinSecretRoom emit:", { roomCode, nickname });
  
  socket.emit("joinSecretRoom", { roomCode, nickname });

  socket.once("secretRoomJoin", (roomData) => {
    console.log("[SOCKET] secretRoomJoin 수신:", roomData);
    onSuccess(roomData.players); // players 배열 넘겨줌
  });

  socket.once("error", (error) => {
    console.error("[SOCKET] error 수신:", error);
    onError(error.message);
  });
};
