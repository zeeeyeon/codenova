import { getSocket } from "./socketClient";
// 방 생성
export const createMeteoRoom = (
  { isPrivate, nickname },
  onSuccess,
  onError
) => {
  // console.log("[createMeteoRoom] createRoom emit 보냄", { isPrivate, nickname });
  getSocket().emit("createRoom", { isPrivate, nickname });

  getSocket().once("roomCreate", (roomData) => {
    // console.log("[createMeteoRoom] roomCreated 수신", roomData);
    onSuccess(roomData);
  });

  // getSocket().once("roomCreate", (error) => {
  //   console.error("[createMeteoRoom] error 수신", error);
  //   onError(error.message);
  // });
};

// 방 참가
export const joinMeteoRoom = ({ roomCode, nickname }, onSuccess, onError) => {
  // console.log("[joinMeteoRoom] joinSecretRoom emit:", { roomCode, nickname });
  getSocket().emit("joinSecretRoom", { roomCode, nickname });

  getSocket().once("secretRoomJoin", (roomData) => {
    // console.log("[joinMeteoRoom] secretRoomJoin 수신:", roomData);
    onSuccess(roomData);
    // console.log("🔥 [joinMeteoRoom] secretRoomJoin 수신:", roomData);
  });

  getSocket().once("codeError", (error) => {
    // console.error("[joinMeteoRoom] error 수신", error);
    onError(error.message);
  });
};

// 방 나가기
export const exitMeteoRoom = ({ roomId, nickname }) => {
  if (!roomId || !nickname) {
    // console.error("❌ [exitMeteoRoom] roomId 또는 nickname이 없습니다.", { roomId, nickname });
    return;
  }
  console.log("[exitMeteoRoom] exitRoom emit 보냄", { roomId, nickname });
  getSocket().emit("exitRoom", { roomId, nickname });
};

// // 방 나가기 응답 수신
// export const onRoomExit = (callback) => {
//   getSocket().on("roomExit", (data) => {
//     console.log("[onRoomExit] roomExit 수신", data);
//     callback(data);
//   });
// };

// // 방 나가기 리스너 해제
// export const offRoomExit = () => {
//   getSocket().off("roomExit");
// };

let roomExitHandler = null; // 전역으로 저장

export const onRoomExit = (callback) => {
  offRoomExit(); // 등록 전에 항상 기존 리스너 제거

  roomExitHandler = (data) => {
    console.log("[onRoomExit] roomExit 수신", data);
    callback(data);
  };

  getSocket().on("roomExit", roomExitHandler);
};

export const offRoomExit = () => {
  if (roomExitHandler) {
    getSocket().off("roomExit", roomExitHandler);
    roomExitHandler = null;
  } else {
    getSocket().off("roomExit"); // fallback
  }
};

// 게임시작 요청 (방장)
export const startMeteoGame = (roomId) => {
  const socket = getSocket();
  if (!socket) return;
  socket.emit("startGame", { roomId });
  // console.log("🚀 [startGame emit] roomId:", roomId);
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
export const exitMeteoGame = ({ roomId, nickname }) => {
  if (!roomId || !nickname) {
    console.error("❌ [exitGame] roomId 또는 nickname이 없습니다.", {
      roomId,
      nickname,
    });
    return;
  }
  getSocket().emit("exitRoom", { roomId, nickname });
};

// 게임 도중 게임 종료 버튼 클릭으로 게임 나가기
export const exitGame = ({ roomId, nickname }) => {
  console.log("[exitGame] exitGame emit 보냄", { roomId, nickname });
  getSocket().emit("exitGame", { roomId, nickname });
};

// 방 나갔을 때 브로드캐스트 수신
export const onExitMeteoGame = (callback) => {
  getSocket().on("gameLeave", (data) => {
    console.log("[onExitMeteoGame] gameLeave 수신", data);
    callback(data);
  });
};

// 입력한 단어 정답인 지 확인
export const onCheckText = ({ roomId, nickname, text }) => {
  getSocket().emit("checkText", { roomId, nickname, text });
};

// 입력한 단어 정답인 지 브로드캐스트 수신
export const onCheckTextResponse = (callback) => {
  getSocket().on("textCheck", (data) => {
    // console.log("[onCheckTextResponse] checkTextResponse 수신", data);
    callback(data);
  });
};

// 게임 종료 후 결과 수신
export const onGameEnd = (callback) => {
  getSocket().on("gameEnd", (data) => {
    // console.log("[onGameEnd] gameEnd 수신", data);
    callback(data);
  });
};

// 단어가 땅에 도달 수신
export const onRemoveHeartResponse = (callback) => {
  getSocket().on("lostLife", (data) => {
    // console.log("[onRemoveHeartResponse] lostLife 수신", data);
    callback(data);
  });
};

// 랜덤매칭
export const onRandomMatch = (nickname) => {
  getSocket().emit("randomMatch", { nickname });
  // console.log("[onRandomMatch] randomMatch emit 보냄", { nickname });
};

// 🔹 랜덤매칭 응답 수신
export const onRandomMatchResponse = (callback) => {
  getSocket().on("matchRandom", (data) => {
    // console.log("[onRandomMatchResponse] matchRandom 수신:", data);
    callback(data);
  });
};

// 랜덤매칭 해제
export const offRandomMatch = () => {
  getSocket().off("matchRandom");
};

// 대기방 채팅
export const onChatMessage = ({ roomId, nickname, message }) => {
  getSocket().emit("sendChat", { roomId, nickname, message });
};

// 대기방 채팅 수신
export const onChatMessageResponse = (callback) => {
  getSocket().on("chatSend", (data) => {
    // console.log("[onChatMessageResponse] chatSend 수신", data);
    callback(data);
  });
};

// 사용자 입력값 실시간으로 보여지게 하기
export const onUserInput = ({ roomId, nickname, text }) => {
  getSocket().emit("inputText", { roomId, nickname, text });
  // console.log("[onUserInput] userInput emit 보냄", { roomId, nickname, text });
};

// 사용자 입력값 실시간으로 보여지게 하기 수신
export const onUserInputResponse = (callback) => {
  getSocket().on("textInput", (data) => {
    // console.log("[onUserInputResponse] userInput 수신", data);
    callback(data);
  });
};

// 사용자 입력값 실시간으로 보여지게 하기 해제
export const offUserInput = () => {
  getSocket().off("userInput");
};

// 게임 도중 나갈 때 브로드캐스트
export const onGameLeave = (callback) => {
  getSocket().on("playerDisconnected", (data) => {
    // console.log("[onGameLeave] gameLeave 수신", data);
    callback(data);
  });
};

// 게임 ready
export const GameReady = ({ roomId, nickname }) => {
  getSocket().emit("gameReady", { roomId, nickname });
};

// 게임 ready 수신
export const onGameReady = (callback) => {
  getSocket().on("readyGame", (data) => {
    // console.log("[onGameReady] ready 수신", data);
    //   {
    //     "nickname" : "가람"
    //     "readyCount" : 3
    //  }
    callback(data);
  });
};

// 대기방
export const goWaitingRoom = ({ nickname, roomId }) => {
  getSocket().emit("goWaitingRoom", { nickname, roomId });
  console.log("[goWaitingRoom] goWaitingRoom emit 보냄", { nickname, roomId });
};

// 대기방 on
export const onGoWaitingRoom = (callback) => {
  getSocket().on("waitingRoomGo", (data) => {
    console.log("[onGoWaitingRoom] goWaitingRoom 수신", data);
    callback(data);
  });
};

// 대기방 off
export const offGoWaitingRoom = () => {
  getSocket().off("waitingRoomGo");
};

export const onReadyWarning = (callback) => {
  getSocket().on("readyWarning", (data) => {
    console.log("[onReadyWarning] readyWarning 수신", data);
    callback(data);
  });
};
export const offReadyWarning = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("readyWarning");
  }
};

export const onKick = (callback) => {
  const socket = getSocket();
  if (!socket) return;

  // 이벤트 핸들러 제거 후 재등록
  socket.off("youWereKicked");

  socket.on("youWereKicked", (data) => {
    console.log("[onKick] youWereKicked 이벤트 수신:", data);
    callback(data);
  });
};

export const offKick = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("youWereKicked");
  }
};

export const onHostKickWarning = (callback) => {
  getSocket().on("hostKickWarning", (data) => {
    console.log("[onHostKickWarning] 방장 경고 수신:", data);
    callback(data);
  });
};

export const offHostKickWarning = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("hostKickWarning");
  }
}