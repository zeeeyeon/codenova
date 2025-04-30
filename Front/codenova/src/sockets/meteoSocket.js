import { getSocket } from "./socketClient";
// 방 생성
export const createMeteoRoom = ({ isPrivate, nickname }, onSuccess, onError) => {
  console.log("[createMeteoRoom] createRoom emit 보냄", { isPrivate, nickname });
  getSocket().emit("createRoom", { isPrivate, nickname });

  getSocket().once("roomCreate", (roomData) => {
    console.log("[createMeteoRoom] roomCreated 수신", roomData);
    onSuccess(roomData);
  });

  getSocket().once("error", (error) => {
    console.error("[createMeteoRoom] error 수신", error);
    onError(error.message);
  });
};

// 방 참가
export const joinMeteoRoom = ({ roomCode, nickname }, onSuccess, onError) => {
  console.log("[joinMeteoRoom] joinSecretRoom emit:", { roomCode, nickname });
  getSocket().emit("joinSecretRoom", { roomCode, nickname });

  getSocket().once("secretRoomJoin", (roomData) => {
    console.log("[joinMeteoRoom] secretRoomJoin 수신:", roomData);
    onSuccess(roomData);
    console.log("🔥 [joinMeteoRoom] secretRoomJoin 수신:", roomData);
  });

  getSocket().once("error", (error) => {
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
  getSocket().emit("exitRoom", { roomId, nickname });
};

// 방 나가기 응답 수신
export const onRoomExit = (callback) => {
  getSocket().on("roomExit", (data) => {
    console.log("[onRoomExit] roomExit 수신", data);
    callback(data);
  });
};

// 방 나가기 리스너 해제
export const offRoomExit = () => {
  getSocket().off("roomExit");
};

// 게임시작 요청 (방장)
export const startMeteoGame = (roomId) => {
  const socket = getSocket();
  if (!socket) return;
  socket.emit("startGame", { roomId });
  console.log("🚀 [startGame emit] roomId:", roomId);
};

// 게임 시작 수신 리스너 등록
export const onMeteoGameStart = (callback) => {
  const socket = getSocket();
  if (!socket) return;
  socket.on("gameStart", callback);
};

// 게임 시작 리스너 해제
export const offMeteoGameStart = () => {
  const socket = getSocket();
  if (!socket) return;
  socket.off("gameStart");
};

// 단어 낙하 이벤트 수신
export const onWordFalling = (callback) => {
  const socket = getSocket();
  if (!socket) return;
  socket.on("wordFalling", callback);
};

// 단어 낙하 이벤트 해제
export const offWordFalling = () => {
  const socket = getSocket();
  if (!socket) return;
  socket.off("wordFalling");
};

// 게임 도중 종료 수신
export const exitMeteoGame = ({roomId, nickname}) => {
  if (!roomId || !nickname) {
    console.error("❌ [exitGame] roomId 또는 nickname이 없습니다.", { roomId, nickname });
    return;
  }
  getSocket().emit("exitRoom", { roomId, nickname });
}





// export const exitMeteoRoom = ({ roomId, nickname }) => {
//   if (!roomId || !nickname) {
//     console.error("❌ [exitMeteoRoom] roomId 또는 nickname이 없습니다.", { roomId, nickname });
//     return;
//   }
//   console.log("[exitMeteoRoom] exitRoom emit 보냄", { roomId, nickname });
//   getSocket().emit("exitRoom", { roomId, nickname });
// };
