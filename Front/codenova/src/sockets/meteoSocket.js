import socket from "./socketClient";

// 방 생성
export const createMeteoRoom = ({ isPrivate, nickname }, onSuccess, onError) => {
  console.log("[createMeteoRoom] createRoom emit 보냄", { isPrivate, nickname });
  socket.emit("createRoom", { isPrivate, nickname });

  socket.once("roomCreate", (roomData) => {
    console.log("[createMeteoRoom] roomCreated 수신", roomData);
    onSuccess(roomData);
  });

  socket.once("error", (error) => {
    console.error("[createMeteoRoom] error 수신", error);
    onError(error.message);
  });
};

// 방 참가
export const joinMeteoRoom = ({ roomCode, nickname }, onSuccess, onError) => {
  console.log("[joinMeteoRoom] joinSecretRoom emit:", { roomCode, nickname });
  socket.emit("joinSecretRoom", { roomCode, nickname });

  socket.once("secretRoomJoin", (roomData) => {
    console.log("[joinMeteoRoom] secretRoomJoin 수신:", roomData);
    onSuccess(roomData);
  });

  socket.once("error", (error) => {
    console.error("[joinMeteoRoom] error 수신", error);
    onError(error.message);
  });
};

// 방 나가기
export const exitMeteoRoom = ({ roomId, nickname }) => {
  if (!roomId || !nickname) {
    console.error("❌ [exitMeteoRoom] roomId 또는 nickname이 없습니다.", { roomId, nickname });
    return;
  }
  console.log("[exitMeteoRoom] exitRoom emit 보냄", { roomId, nickname });
  socket.emit("exitRoom", { roomId, nickname });
};

// 방 나가기 응답 수신
export const onRoomExit = (callback) => {
  socket.on("roomExit", (data) => {
    console.log("[onRoomExit] roomExit 수신", data);
    callback(data);
  });
};

// 방 나가기 리스너 해제
export const offRoomExit = () => {
  socket.off("roomExit");
};
