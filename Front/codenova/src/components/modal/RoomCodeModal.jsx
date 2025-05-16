import React, { useState } from "react";
import modalBg from "../../assets/images/board3.png";
import enterBtn from "../../assets/images/go_game_button.png";
import randomBtn from "../../assets/images/gorandom_button.png";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { joinMeteoRoom, offRandomMatch, onRandomMatch, onRandomMatchResponse } from "../../sockets/meteoSocket";

const RoomCodeModal = ({ onClose }) => {
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const nickname = useAuthStore((state) => state.user?.nickname);
  const navigate = useNavigate();

  const handleEnterRoom = () => {
    if (!roomCodeInput) {
      alert("방코드를 입력하세요!");
      return;
    }
    if (!nickname) {
      alert("닉네임이 없습니다!");
      return;
    }
  
    joinMeteoRoom(
      { roomCode: roomCodeInput, nickname },
      (roomData) => {
        // console.log("✅ 방 입장 성공:", roomData);
  
        // ✅ 성공했을 때만 로컬스토리지 저장
        localStorage.setItem("meteoRoomCode", roomCodeInput);
        localStorage.setItem("meteoRoomId", roomData.roomId);
  
        navigate("/meteo/landing", {
          state: { roomCode: roomCodeInput, roomId: roomData.roomId, players: roomData.players },
        });
  
        onClose(); // 모달 닫기
      },
      (errorMessage) => {
        // console.error("❌ 방 입장 실패:", errorMessage);
        alert("❌ 방 코드가 틀렸습니다.");
  
        // ✅ 실패하면 input 초기화 (선택사항)
        setRoomCodeInput(""); 
      }
    );
  };
  
  // const handleRandomMatch = () => {
  //   if (!nickname) {
  //     alert("닉네임이 없습니다!");
  //     return;
  //   }
  
  //   // 1. 랜덤 매칭 emit
  //   onRandomMatch(nickname);
  
  //   // 2. 응답 수신 후 처리
  //   onRandomMatchResponse((roomData) => {
  //     // console.log("🎲 랜덤매칭 완료:", roomData);
  
  //     // ✅ 랜덤 매칭 성공 시 저장
  //     localStorage.setItem("meteoRoomCode", ""); // 랜덤은 코드 없음
  //     localStorage.setItem("meteoRoomId", roomData.roomId);
  
  //     navigate("/meteo/landing", {
  //       state: {
  //         roomCode: "", // 랜덤매칭은 코드 없음
  //         roomId: roomData.roomId,
  //         players: roomData.players,
  //       },
  //     });
  
  //     // ✅ cleanup
  //     offRandomMatch();
  //     onClose();
  //   });
  // };
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 어두운 배경 */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* 모달 박스 */}
      <div
        className="relative z-50 w-[42rem] h-[20rem] px-6 py-8 flex flex-col items-center justify-center"
        style={{
          backgroundImage: `url(${modalBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <button
          className="absolute top-1 right-2 text-black text-ml font-extrabold"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="text-white text-3xl mt-6">Room Code</div>
        <div className="text-white text-lg mt-2">방코드를 입력해주세요 !</div>

        <input
          type="text"
          placeholder="ROOM코드"
          className="mt-4 w-64 h-10 px-3 rounded text-black text-lg text-center"
          value={roomCodeInput}
          onChange={(e) => setRoomCodeInput(e.target.value)}
        />

        <div className="flex gap-4 mt-6">
          <img
            src={enterBtn}
            alt="입장하기"
            className="w-[8rem] cursor-pointer hover:brightness-110 hover:scale-105 transition-transform"
            onClick={handleEnterRoom}
          />
          {/* <img
            src={randomBtn}
            alt="랜덤매칭"
            className="w-[8rem] cursor-pointer hover:brightness-110 hover:scale-105 transition-transform"
            onClick={handleRandomMatch}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default RoomCodeModal;
