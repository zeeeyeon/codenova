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
import  { getSocket } from "../../sockets/socketClient";
import useAuthStore from "../../store/authStore";
import { exitMeteoRoom, offMeteoGameStart, offRoomExit, onMeteoGameStart, onRoomExit, startMeteoGame } from "../../sockets/meteoSocket";
import Crown from "../../assets/images/crown_icon.png";
import StartButton from "../../assets/images/start_btn.png";
import WaitButton from "../../assets/images/wait_btn.png";

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
        updated[idx] = {
          nickname: player.nickname,
          isHost: player.isHost || false  // ✅ isHost도 같이 저장
        };
      }
    });
    console.log("✅ [updateUsersFromPlayers] 유저 리스트:", updated);
    setUsers(updated);
  };

  useEffect(() => {
    const socket = getSocket();

    if (!roomCode || !roomId || !players || players.length === 0 || !nickname || !socket) {
      console.warn("❗ 방 정보 없음 또는 소켓 없음 → 메인으로 이동");
  
      // localStorage 정리
      localStorage.removeItem("meteoRoomCode");
      localStorage.removeItem("meteoRoomId");
  
      // 메인 페이지로 이동
      navigate("/main");
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
    getSocket().on("secretRoomJoin", handleSecretRoomJoin);

    onRoomExit((data) => {
      const { currentPlayers, leftUser } = data;
    
      const mySessionId = getSocket().id;   // ✅ 먼저 socket.id를 mySessionId에 저장
    
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
      getSocket().off("secretRoomJoin", handleSecretRoomJoin);
      offRoomExit();
      // 페이지 떠날 때도 깔끔하게 localStorage 삭제
      localStorage.removeItem("meteoRoomCode");
      localStorage.removeItem("meteoRoomId");
    };
  }, [roomCode, nickname, players, navigate]);

  // 게임 시작
  const handleStartGame = () => {
    startMeteoGame(roomId);
  };
  
  useEffect(() => {
    onMeteoGameStart((gameData) => {
      console.log("🎮 [gameStart 수신] 게임 데이터:", gameData);
  
      const { roomId, players } = gameData;
      const myNickname = localStorage.getItem("nickname"); // 기본 저장되어 있다고 가정
  
      // ✅ roomId 저장
      localStorage.setItem("roomId", roomId);
  
      // ✅ roomCode가 없다면 빈 문자열로 초기화 (혹시 몰라서)
      if (!localStorage.getItem("roomCode")) {
        localStorage.setItem("roomCode", "");
      }
  
      // ✅ nickname이 날아갔을 경우 보정
      if (!myNickname) {
        const mySessionId = getSocket()?.id;
        const matched = players.find(p => p.sessionId === mySessionId);
        if (matched?.nickname) {
          localStorage.setItem("nickname", matched.nickname);
        }
      }
  
      // ✅ 페이지 이동
      navigate("/meteo/game", { state: { ...gameData } });
    });
  
    return () => {
      offMeteoGameStart();
    };
  }, [navigate]);

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
                {/* 왕관 아이콘 (오른쪽 상단) */}
                {user?.isHost && (
                  <img
                    src={Crown}
                    alt="Crown"
                    className="absolute top-1 right-1 w-5 h-5" // 위치, 크기 조정
                  />
                )}
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-black text-xl">
                No.{idx + 1}
              </div>
                  {/* ✅ user가 있을 때만 프로필 사진 */}
                  {user ? (
                    <img
                      src={profileImages[idx]}
                      alt={`user-profile-${idx}`}
                      className="absolute top-12 left-1/2 transform -translate-x-1/2 w-14 h-auto"
                    />
                  ) : null}
              {/* <img src={profileImages[idx]} alt={`user-profile-${idx}`} className="absolute top-12 left-1/2 transform -translate-x-1/2 w-14 h-auto" /> */}
              {/* 닉네임 */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-m">
                {user?.nickname || "-"}
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
            <div className="w-[10rem] h-[3.5rem] border-4 rounded-xl flex items-center justify-center" style={{ borderColor: "#01FFFE" }}>
            {users.find(user => user?.nickname === nickname)?.isHost ? (
              users.filter(user => user !== null).length === 4 ? (
                // ✅ 방장이고, 4명 다 찼으면 진짜 Start 버튼
                <img
                  src={StartButton}
                  alt="start"
                  className="w-full h-full cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
                  onClick={() => handleStartGame()}
                />
              ) : (
                // ✅ 방장이지만 아직 4명 안 찼으면 흐릿한 Start 버튼
                <img
                  src={StartButton}
                  alt="start-disabled"
                  className="w-full h-full opacity-50"
                />
              )
            ) : (
              // ✅ 방장이 아니면 무조건 Wait 버튼
              <img
                src={WaitButton}
                alt="wait"
                className="w-full h-full opacity-50"
              />
            )}
          </div>

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
