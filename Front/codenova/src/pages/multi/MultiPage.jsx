import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import multiBg from "../../assets/images/multi_background.png";
import boardBg from "../../assets/images/board1.jpg";
import mintBtn from "../../assets/images/mint_large_btn.png";
import searchBtn from "../../assets/images/search_btn.png";
import RoomList from "../../components/multi/RoomList";
import MakeRoomModal from "../../components/multi/modal/MakeRoomModal";
import EnterRoomModal from "../../components/multi/modal/EnterRoomModal"; 
import { requestRoomList, onRoomList, offRoomList, onRoomUpdate, offRoomUpdate, joinRoom } from "../../sockets/MultiSocket";
import { getSocket } from "../../sockets/socketClient";
import useAuthStore from "../../store/authStore";
import goOutBtn from "../../assets/images/go_out.png"

const MultiPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);   // 방 만들기 모달
  const [selectedRoom, setSelectedRoom] = useState(null);   // 클릭한 방
  const [showEnterModal, setShowEnterModal] = useState(false); // 입장 모달
  const [roomList, setRoomList] = useState([]); // 룸 목록
  const [searchKeyword, setSearchKeyword] = useState(""); // 방 검색색

  const navigate = useNavigate();

  const filteredRooms = roomList.filter((room) => 
    room.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );
 
  // useEffect(() => {
  //   const socket = getSocket();
  //   if (socket) {
  //     socket.onAny((event, ...args) => {
  //       console.log("📡 수신된 이벤트:", event, args);
  //     });
  //   }
  // }, []);
  

  useEffect(() => {
    const handleRoomList = (rooms) => {
      // console.log("[room_list 수신 :", rooms);
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
      // console.log("🟡 room_update 수신:", updatedRoom);
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

      // console.log("💡 parsed currentPeople:", parsed.currentPeople);
      
      setRoomList((prevRooms) => {
        const exists = prevRooms.some((room) => room.id === parsed.id);
        return exists
          ? prevRooms.map((room) => (room.id === parsed.id ? parsed : room))
          : [...prevRooms, parsed];
      });
    };
  
    const requestRoomsSafely = () => {
      const s = getSocket();
      if (s && s.connected) {
        // console.log("🟢 socket 연결됨 → 방 목록 요청");
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
  
        // ✅ 연결된 이후에만 리스너 등록
        onRoomList(handleRoomList);
        onRoomUpdate(handleRoomUpdate);
      } else {
        setTimeout(requestRoomsSafely, 300);
      }
    };
  
    requestRoomsSafely();
  
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

  const nickname = useAuthStore((state) => state.user?.nickname);

  
  const handleConfirmEnter = (roomCode, feedbackCallback) => {
    const socket = getSocket();

    const handleJoinResponse = (res) => {
      // console.log("✅ 입장 응답:", res); // res === "joined"
    
      if (res === "joined") {
        navigate(`/multi/room/${selectedRoom.id}`, {
          state: {
            roomTitle: selectedRoom.title,
            isPublic: selectedRoom.isPublic,
            language: selectedRoom.language,
            currentPeople: selectedRoom.currentPeople,
            standardPeople: selectedRoom.standardPeople,
            roomCode: selectedRoom.roomCode,
          },
        });

        setSelectedRoom(null);
        setShowEnterModal(false);
        feedbackCallback?.(true);
      } else {
        feedbackCallback?.(false);
      }
    };
  
    // ✅ nickname 포함해서 전달
    if (selectedRoom.isPublic) {
      joinRoom({ roomId: selectedRoom.id, nickname }, handleJoinResponse);
    } else {
      joinRoom({ roomId: selectedRoom.id, roomCode, nickname }, handleJoinResponse);
    }
  };
  
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
  
    const handleRoomRemoved = (removedRoomId) => {
      // console.log("🗑️ room_removed 수신:", removedRoomId);
      setRoomList((prev) => prev.filter((room) => room.id !== removedRoomId));
    };
  
    socket.on("room_removed", handleRoomRemoved);
  
    return () => {
      socket.off("room_removed", handleRoomRemoved);
    };
  }, []);


  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
      style={{ backgroundImage: `url(${multiBg})` }}
    >
      {/* <Header /> */}

      {/* 방 만들기 모달 */}
      {isModalOpen && <MakeRoomModal onClose={() => setIsModalOpen(false)} />}

      {/* 메인 보드 */}
      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72rem] max-w-[1300px] aspect-[4/3] bg-contain bg-no-repeat bg-center relative flex flex-col items-center justify-start pt-[6.5%] rounded-2xl">
        <img
          src={boardBg}
          alt="board"
          className="absolute object-cover rounded-2xl z-0"
        />

        <h1 className="text-4xl font-semibold drop-shadow-md ml-3 mt-3 text-[#1c1c1c]">
          배틀모드
        </h1>

        {/* 방 만들기 버튼 */}
        <button
          className="absolute top-[23%] left-[12%] w-[110px] h-[36px] bg-no-repeat bg-contain hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundImage: `url(${mintBtn})` }}
        >
          <span className="text-black font-bold text-lg relative -translate-y-1">방 만들기</span>
        </button>

        {/* 검색창 */}
        <div className="absolute top-[6%] left-[28%] w-[260px] relative">
          <input
            type="text"
            placeholder="방 검색"
            onChange={(e) => setSearchKeyword(e.target.value)} // 엔터없이 글자 포함되어있을때 검색 가능
            className="w-full h-[45px] pl-4 pr-[65px] rounded-md text-[17px] font-bold text-black focus:outline-none"
          />
          <button
            className="absolute top-1/2 right-1 -translate-y-1/2 w-[60px] h-[40px] bg-no-repeat bg-contain hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
            style={{ backgroundImage: `url(${searchBtn})` }}
          />
        </div>

        {/* 방 리스트 */}
        <div className="mt-[4%] w-[83%] h-[60%] overflow-y-auto flex flex-col items-center gap-4 pt-2 z-10">
          <RoomList rooms={filteredRooms} onEnterClick={handleEnterClick} />
        </div>

        <img
          src={goOutBtn}
          alt="나가기"
          role="button"
          onClick={() => navigate("/main")}
          className="absolute bottom-24 right-5 w-[7rem] h-[3rem] hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
          style={{ cursor: "url('/cursors/click.png') 32 32, pointer" }}
        />

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
