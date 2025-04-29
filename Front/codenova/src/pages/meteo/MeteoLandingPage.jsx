import React, { useEffect, useState } from "react";
import MeteoBg from "../../assets/images/meteo_bg.png";
import Header from "../../components/common/Header";
import MeteoBoard from "../../assets/images/board1.jpg";
import UserBoard from "../../assets/images/board2.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import Profile1 from "../../assets/images/profile1.png";
import Profile2 from "../../assets/images/profile2.png";
import Profile3 from "../../assets/images/profile3.png";
import Profile4 from "../../assets/images/profile4.png";
import socket from "../../sockets/socketClient";
import useAuthStore from "../../store/authStore";
import { exitMeteoRoom, offRoomExit, onRoomExit } from "../../sockets/meteoSocket";

const MeteoLandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode, roomId, players } = location.state || {};
  const [users, setUsers] = useState([null, null, null, null]);
  const profileImages = [Profile1, Profile2, Profile3, Profile4];
  const nickname = useAuthStore((state) => state.user?.nickname);

  // players 배열을 users 배열로 변환
  const updateUsersFromPlayers = (playersArray) => {
    const updated = Array(4).fill(null);
    playersArray.forEach((player, idx) => {
      if (idx < 4) {
        updated[idx] = { nickname: player.nickname };
      }
    });
    setUsers(updated);
  };

  useEffect(() => {
    if (!roomCode || !nickname) {
      alert("방 정보가 없습니다. 메인으로 이동합니다.");
      navigate("/meteo/main");
      return;
    }

    // 처음 입장했을 때 players가 있다면 users 설정
    if (players) {
      updateUsersFromPlayers(players);

      // ✅ 처음 입장할 때 localStorage 저장
      localStorage.setItem("meteoRoomCode", roomCode);
      localStorage.setItem("meteoRoomId", roomId);
      console.log("✅ [방 생성/입장] localStorage 저장 완료");
    }

    // 서버에서 secretRoomJoin 수신했을 때
    const handleSecretRoomJoin = (roomData) => {
      console.log("🛰️ [secretRoomJoin 수신]", roomData);
      updateUsersFromPlayers(roomData.players);

      // ✅ join 성공 시 localStorage 저장
      if (roomData.roomCode && roomData.roomId) {
        localStorage.setItem("meteoRoomCode", roomData.roomCode);
        localStorage.setItem("meteoRoomId", roomData.roomId);
        console.log("✅ [방 참가] localStorage 저장 완료");
      }
    };
    socket.on("secretRoomJoin", handleSecretRoomJoin);

    onRoomExit((data) => {
      const { currentPlayers, leftUser } = data;
    
      const mySessionId = socket.id;   // ✅ 먼저 socket.id를 mySessionId에 저장
    
      console.log("🛰️ [roomExit 수신] 현재 인원:", currentPlayers);
      console.log("내 세션 ID:", mySessionId, "나간 사람 세션 ID:", leftUser.sessionId);
    
      if (currentPlayers) {
        updateUsersFromPlayers(currentPlayers);
      }
    
      if (leftUser.sessionId === mySessionId) {
        console.log("✅ 내가 나갔음. 메인으로 이동.");
        localStorage.removeItem("meteoRoomCode");
        localStorage.removeItem("meteoRoomId");
        navigate("/main");
      } else {
        console.log("✅ 상대방이 나감. 현재 방 유지.");
      }
    });
    
    
    return () => {
      socket.off("secretRoomJoin", handleSecretRoomJoin);
      offRoomExit();
      // 페이지 떠날 때도 깔끔하게 localStorage 삭제
      localStorage.removeItem("meteoRoomCode");
      localStorage.removeItem("meteoRoomId");
    };
  }, [roomCode, nickname, players, navigate]);

  // 방 나가기 버튼 클릭
  const handleExitRoom = () => {
    const savedRoomId = localStorage.getItem("meteoRoomId");
    const savedNickname = nickname;

    console.log("🚀 [방 나가기 버튼] 저장된 roomId:", savedRoomId);
    console.log("🚀 [방 나가기 버튼] 저장된 nickname:", savedNickname);

    if (savedRoomId && savedNickname) {
      exitMeteoRoom({ roomId: savedRoomId, nickname: savedNickname });
    } else {
      console.error("❌ [방 나가기] roomId 또는 nickname 없음", { savedRoomId, savedNickname });
    }

    // ❗ emit 보내고 바로 메인으로 튕기기
    localStorage.removeItem("meteoRoomCode");
    localStorage.removeItem("meteoRoomId");
    navigate("/main");
  };


  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
      style={{ backgroundImage: `url(${MeteoBg})` }}
    >
      <Header />

      <div className="relative flex justify-center items-center mt-28">
        <img src={MeteoBoard} className="w-[66rem] rounded-2xl shadow-xl z-0" alt="meteoBoard" />
        <div className="absolute top-[2%] left-1/2 -translate-x-1/2 z-20 text-1C1C1C text-3xl font-bold">
          지구를 지켜라!
        </div>

        {/* 유저 카드 */}
        <div className="absolute top-[15%] grid grid-cols-4 gap-9 z-10">
          {users.map((user, idx) => (
            <div key={idx} className="relative w-48 h-auto">
              <img src={UserBoard} alt={`user-board-${idx}`} className="w-full h-auto rounded-xl shadow-md" />
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-black text-xl">
                No.{idx + 1}
              </div>
              <img src={profileImages[idx]} alt={`user-profile-${idx}`} className="absolute top-12 left-1/2 transform -translate-x-1/2 w-14 h-auto" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-m">
                {user ? user.nickname : "-"}
              </div>
            </div>
          ))}
        </div>

        {/* 채팅 + 방코드 */}
        <div className="flex absolute top-[50%] gap-6">
          <div className="w-[44rem] h-[13rem] border-4 rounded-xl" style={{ borderColor: "#01FFFE" }}></div>
          <div className="flex flex-col gap-4">
            <div className="w-[10rem] h-[8rem] border-4 rounded-xl flex flex-col items-center justify-center text-white text-2xl" style={{ borderColor: "#01FFFE" }}>
              <p className="text-xl mb-1">방코드</p>
              <p className="text-3xl">{roomCode || "없음"}</p>
            </div>
            <div className="w-[10rem] h-[3.5rem] border-4 rounded-xl flex items-center justify-center" style={{ borderColor: "#01FFFE" }}></div>
          </div>
        </div>

        {/* 방 나가기 버튼 */}
        <button onClick={handleExitRoom} className="absolute bottom-3 right-52 text-white text-2xl">
          방 나가기
        </button>
      </div>
    </div>
  );
};

export default MeteoLandingPage;
