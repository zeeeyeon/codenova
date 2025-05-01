import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import multiBg from "../../assets/images/multi_background.png";
import boardBg from "../../assets/images/board1.jpg";
import mintBtn from "../../assets/images/mint_large_btn.png";
import searchBtn from "../../assets/images/search_btn.png";
import Header from "../../components/common/Header";
import RoomList from "../../components/multi/RoomList";
import MakeRoomModal from "../../components/multi/modal/MakeRoomModal";
import EnterRoomModal from "../../components/multi/modal/EnterRoomModal"; 
import { requestRoomList, onRoomList, offRoomList, onRoomUpdate, offRoomUpdate } from "../../sockets/MultiSocket";
import { getSocket } from "../../sockets/socketClient";

const MultiPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);   // 방 만들기 모달
  const [selectedRoom, setSelectedRoom] = useState(null);   // 클릭한 방
  const [showEnterModal, setShowEnterModal] = useState(false); // 입장 모달
  const [roomList, setRoomList] = useState([]); // 룸 목록

  const navigate = useNavigate();

  useEffect(() => {
    const requestRoomsSafely = () => {
      const s = getSocket();
      if (s && s.connected) {
        console.log("🟢 socket 연결됨 → 방 목록 요청");
        requestRoomList((rooms) => {
          const parsed = rooms.map((room) => ({
            id: room.roomId,
            title: room.title,
            language: room.language,
            standardPeople: room.maxCount,
            currentPeople: room.currentCount,
            isPublic: !room.isLocked,
            roomCode: room.roomCode,
            status: room.isStarted ? "playing" : "waiting"
          }));
          setRoomList(parsed);
        });
      } else {
        setTimeout(requestRoomsSafely, 300);
      }
    };
  
    requestRoomsSafely(); // 연결 완료 후 요청
  
    const handleRoomList = (rooms) => {
      console.log("[room_list 수신 :", rooms);
      const parsed = rooms.map((room) => ({
        id: room.roomId,
        title: room.title,
        language: room.language,
        standardPeople: room.maxCount,
        currentPeople: room.currentCount,
        isPublic: !room.isLocked,
        roomCode: room.roomCode,
        status: room.isStarted ? "playing" : "waiting"
      }));
      setRoomList(parsed);
    };
    
  
    const handleRoomUpdate = (updatedRoom) => {

      const parsed = {
        id: updatedRoom.roomId,
        title: updatedRoom.title,
        language: updatedRoom.language,
        standardPeople: updatedRoom.maxCount,
        currentPeople: updatedRoom.currentCount,
        isPublic: !updatedRoom.isLocked,
        roomCode: updatedRoom.roomCode,
        status: updatedRoom.isStarted ? "playing" : "waiting",
      };
      setRoomList((prevRooms) => {
        const exists = prevRooms.some((room) => room.id === parsed.id);
        if (exists) {
          return prevRooms.map((room) =>
            room.id === parsed.id ? parsed : room
          );
        } else {
          return [...prevRooms, parsed];
        }
      });
    };
  
    onRoomList(handleRoomList);
    onRoomUpdate(handleRoomUpdate);
  
    return () => {
      offRoomList();
      offRoomUpdate();
    };
  }, []);
  

  const handleEnterClick = (room) => {
    setSelectedRoom(room);
    setShowEnterModal(true);
  };

  const handleCloseEnterModal = () => {
    setSelectedRoom(null);
    setShowEnterModal(false);
  };

  const handleConfirmEnter = (roomCode) => {
    if (selectedRoom.isPublic) {
      console.log("✅ 공개방 입장!");
      navigate(`/multi/room/${selectedRoom.id}`, {
        state: {
          roomTitle:selectedRoom.title,
          isPublic: selectedRoom.isPublic,
          language: selectedRoom.language,
          currentPeople: selectedRoom.currentPeople,
          standardPeople: selectedRoom.standardPeople,
          
        },
      });  
    } else {
      console.log("🔒 입력한 코드:", roomCode);
      navigate(`/multi/room/${selectedRoom.id}`,{
        state: {
          roomTitle:selectedRoom.title,
          isPublic: selectedRoom.isPublic,
          language: selectedRoom.language,
          currentPeople: selectedRoom.currentPeople,
          standardPeople: selectedRoom.standardPeople,
          roomCode: selectedRoom.roomCode,
        },});  
    }
    setSelectedRoom(null);
    setShowEnterModal(false);
  };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
      style={{ backgroundImage: `url(${multiBg})` }}
    >
      <Header />

      {/* 방 만들기 모달 */}
      {isModalOpen && <MakeRoomModal onClose={() => setIsModalOpen(false)} />}

      {/* 메인 보드 */}
      <div className="absolute top-[53%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[66vw] max-w-[1300px] aspect-[4/3] bg-contain bg-no-repeat bg-center relative flex flex-col items-center justify-start pt-[6.5%] rounded-2xl">
        <img
          src={boardBg}
          alt="board"
          className="absolute object-cover rounded-2xl z-0"
        />

        <h1 className="text-4xl font-bold drop-shadow-md ml-3 mt-4 text-[#1c1c1c]">
          Multi Room
        </h1>

        {/* 방 만들기 버튼 */}
        <button
          className="absolute top-[26%] left-[10%] w-[100px] h-[36px] bg-no-repeat bg-contain hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundImage: `url(${mintBtn})` }}
        >
          <span className="text-black font-bold text-m relative -translate-y-1">방 만들기</span>
        </button>

        {/* 검색창 */}
        <div className="absolute top-[7%] left-[28%] w-[260px] relative">
          <input
            type="text"
            placeholder="방 검색"
            className="w-full h-[45px] pl-4 pr-[65px] rounded-md text-[17px] font-bold text-black focus:outline-none"
          />
          <button
            className="absolute top-1/2 right-1 -translate-y-1/2 w-[60px] h-[40px] bg-no-repeat bg-contain hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
            style={{ backgroundImage: `url(${searchBtn})` }}
          />
        </div>

        {/* 방 리스트 */}
        <div className="mt-[4%] w-[80%] h-[60%] overflow-y-auto flex flex-col items-center gap-4 pt-2 z-10">
          <RoomList rooms={roomList} onEnterClick={handleEnterClick} />
        </div>
      </div>

      {/* 방 입장 모달 */}
      {showEnterModal && selectedRoom && (
        <EnterRoomModal
          isPrivate={!selectedRoom.isPublic}
          roomTitle={selectedRoom.title}
          roomLanguage={selectedRoom.language}
          currentPeople = {selectedRoom.currentPeople}
          standardPeople = {selectedRoom.standardPeople}
          onClose={handleCloseEnterModal}
          onEnter={handleConfirmEnter}
          correctRoomCode={selectedRoom.roomCode}
        />
      )}
    </div>
  );
};

export default MultiPage;
