import {getSocket} from "./socketClient";

// 방 목록 요청 emit
export const requestRoomList = (callback) => {
    const socket = getSocket();
    if (!socket) return;
  
    socket.emit("room_list", (rooms) => {
      console.log("📥 방 목록 응답 수신:", rooms);
      callback?.(rooms);
    });
  };

// 방 목록 응답 수신 리스너 등록
export const onRoomList = (callback) => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("room_list", callback); // 서버에서 보낸 roomList 데이터 수신
};

// 소켓에서 방 목록 리스너 제거
export const offRoomList = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.off("room_list");  
  };

  export const onRoomUpdate = (callback) => {
    const socket = getSocket();
    if (!socket) return;
    socket.on("room_update", callback);
  };
  
  export const offRoomUpdate = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.off("room_update");
  };


// 방 만들기 요청 emit + ack로 응답 받기
export const createRoom = (payload, callback) => {
    const socket = getSocket();
    if (!socket) return;
  
    console.log("create_Room 요청:", payload);
  
    socket.emit("create_room", payload, (response) => {
      console.log("📥 방 생성 응답:", response);
      callback?.(response);
    });
};