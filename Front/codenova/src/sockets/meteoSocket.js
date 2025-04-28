import socket from "./socketClient";

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
