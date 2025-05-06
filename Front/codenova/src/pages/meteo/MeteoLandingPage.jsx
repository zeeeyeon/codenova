import React, { useEffect, useRef, useState } from "react";
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
import { exitMeteoRoom, offMeteoGameStart, offRoomExit, onChatMessage, onMeteoGameStart, onRoomExit, startMeteoGame } from "../../sockets/meteoSocket";
import Crown from "../../assets/images/crown_icon.png";
import StartButton from "../../assets/images/start_btn.png";
import WaitButton from "../../assets/images/wait_btn.png";
import ExitButton from "../../assets/images/multi_exit_btn.png";
import CopyButton from "../../assets/images/multi_copy_icon.png";

const MeteoLandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode, roomId, players } = location.state || {};
  const [users, setUsers] = useState([null, null, null, null]);
  const profileImages = [Profile1, Profile2, Profile3, Profile4];
  const nickname = useAuthStore((state) => state.user?.nickname);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const scrollRef = useRef(null);
  const currentRoomId = localStorage.getItem("meteoRoomId");
 const [countdown, setCountdown] = useState(null);

  const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(roomCode);
        alert("방 코드가 복사되었습니다.");
    } catch (err) {
        alert("복사에 실패했습니다.")
    }
  }

  

  // players 배열을 users 배열로 변환
  const updateUsersFromPlayers = (playersArray) => {
    const updated = Array(4).fill(null);
    playersArray.forEach((player, idx) => {
      if (idx < 4) {
        updated[idx] = {
          nickname: player.nickname,
          isHost: player.isHost || false 
        };
      }
    });
    console.log("✅ [updateUsersFromPlayers] 유저 리스트:", updated);
    setUsers(updated);
  };

  useEffect(() => {
    const socket = getSocket();

    if (!roomId || !players || players.length === 0 || !nickname || !socket) {
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
        // ✅ 시스템 메시지 추가
        setMessages(prev => [
          ...prev,
          { nickname: "SYSTEM", message: `${leftUser.nickname} 님이 나갔습니다.` }
        ]);
      }
    });

    return () => {
      getSocket().off("secretRoomJoin", handleSecretRoomJoin);
      offRoomExit();
      // 페이지 떠날 때도 깔끔하게 localStorage 삭제
      localStorage.removeItem("meteoRoomCode");
      localStorage.removeItem("meteoRoomId");
    };
  }, [roomCode, nickname, players, navigate, roomId]);

  useEffect(() => {
    const handleUnloadOrBack = () => {
      const savedRoomId = localStorage.getItem("meteoRoomId");
      const savedNickname = nickname;
  
      if (savedRoomId && savedNickname) {
        console.log("🚪 [뒤로가기/새로고침] 방 나감 처리 시작");
        exitMeteoRoom({ roomId: savedRoomId, nickname: savedNickname });
  
        localStorage.removeItem("meteoRoomCode");
        localStorage.removeItem("meteoRoomId");
      }
    };
  
    window.addEventListener("beforeunload", handleUnloadOrBack); // 새로고침 / 탭 종료
 

    return () => {
      window.removeEventListener("beforeunload", handleUnloadOrBack);
    };
  }, [nickname]);
  useEffect(() => {
    const handlePopState = (event) => {
      // 브라우저 alert 사용 (콘솔이 안 보일때도 확인 가능)

      alert("방을 나가시겠습니까?");

      const savedNickname = nickname;

      if (currentRoomId && savedNickname) {
        exitMeteoRoom({ roomId: roomId, nickname: nickname });
        console.log("🚪 [뒤로가기] 방 나감 처리 시작");
      }
    };

    // 현재 history 상태 저장
    window.history.pushState({ page: "meteo" }, "", window.location.pathname);

    // 이벤트 리스너 등록
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [nickname]);

  useEffect(() => {
    const socket = getSocket();
  
    const handleMatchRandom = (roomData) => {
      console.log("🛰️ [matchRandom 수신 - LandingPage]", roomData);
      updateUsersFromPlayers(roomData.players);
      // ✅ 마지막 들어온 유저 추적해서 system 메시지 출력
      const prevCount = users.filter((u) => u !== null).length;
      const newCount = roomData.players.length;

      if (newCount > prevCount) {
        const joined = roomData.players[newCount - 1];
        if (joined?.nickname) {
          setMessages((prev) => [
            ...prev,
            { nickname: "SYSTEM", message: `${joined.nickname} 님이 들어왔습니다.` },
          ]);
        }
      }
    };
  
    socket.on("matchRandom", handleMatchRandom);
  
    return () => {
      socket.off("matchRandom", handleMatchRandom);
    };
  }, []);
  

  // 게임 시작
  const handleStartGame = () => {

      startMeteoGame(roomId);
    };
  
    useEffect(() => {
      onMeteoGameStart((gameData) => {
        console.log("🎮 [gameStart 수신] 게임 데이터:", gameData);
    
        // ✅ 카운트다운 먼저 시작
        setCountdown(3);
        let count = 3;
        const countdownInterval = setInterval(() => {
          count -= 1;
          setCountdown(count);
          if (count === 0) {
            clearInterval(countdownInterval);
    
            // ✅ roomId, roomCode, nickname 저장 보정
            localStorage.setItem("roomId", gameData.roomId);
            if (!localStorage.getItem("roomCode")) localStorage.setItem("roomCode", "");
            if (!localStorage.getItem("nickname")) {
              const matched = gameData.players.find(p => p.sessionId === getSocket()?.id);
              if (matched?.nickname) {
                localStorage.setItem("nickname", matched.nickname);
              }
            }
    
            // ✅ 페이지 이동
            navigate("/meteo/game", { state: { ...gameData } });
          }
        }, 1000);
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

  useEffect(() => {
    const handleChat = (data) => {
      console.log("[채팅 수신]", data);
      setMessages((prev) => [...prev, data]);
    };
  
    // ✅ 먼저 off 해두고 on
    const socket = getSocket();
    socket.off("chatSend", handleChat);
    socket.on("chatSend", handleChat);
  
    return () => {
      socket.off("chatSend", handleChat);
    };
  }, []);
  
  
  const sendChat = () => {
    if (!chatInput.trim()) return;
    onChatMessage({
      roomId,
      nickname,
      message: chatInput.trim()
    });
    setChatInput("");
  };
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
      style={{ backgroundImage: `url(${MeteoBg})` }}
    >
      {/* <Header /> */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-white text-[10rem] font-bold drop-shadow-lg animate-scale-fade">
            {countdown}
          </div>
        </div>
      )}

      <div className="relative flex justify-center items-center mt-20">
        <div className="relative w-[66rem]">

        
        <img src={MeteoBoard} className="w-[66rem] rounded-2xl shadow-xl z-0" alt="meteoBoard" />
        <div className="absolute top-[2%] left-1/2 -translate-x-1/2 z-20 text-1C1C1C text-3xl font-bold">
          지구를 지켜라!
          </div>
          <div className="absolute top-[1%] right-[0rem] -translate-x-1/2 z-20">
            <div className="relative group ml-2">
              {/* 아이콘에 호버 애니메이션 추가 */}
              <span className="cursor-help text-black text-4xl font-bold transition duration-200 ease-in-out group-hover:scale-125 group-hover:text-yellow-400 animate-pulse-color">
                ?
              </span>

              {/* 툴팁에 페이드 + 슬라이드 효과 */}
              <div className="absolute top-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black bg-opacity-90 text-white text-sm px-3 py-2 rounded shadow-md whitespace-nowrap z-30 text-center
                animate-fade-slide-up">
                Player 4명이 모두 들어오면<br />
                방장이 시작 버튼을 눌러<br />
                지구를 지킬 수 있습니다!
              </div>
            </div>
          </div>




        {/* 유저 카드 */}
        <div className="flex absolute top-[15%] right-[5.5rem] grid-cols-4 gap-9 z-10">
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
                <div
                  className={`absolute bottom-7 left-1/2 transform -translate-x-1/2 text-m w-[16rem] text-center truncate ${
                    user?.nickname === nickname ? "text-cyan-300" : "text-white"
                  }`}
                >
                  {user?.nickname || "-"}
                </div>
            </div>
          ))}
        </div>

        {/* 채팅 + 방코드 */}
        <div className="flex absolute top-[50%] right-[5.5rem] gap-6">

        <div className="w-[44rem] h-[12.5rem] border-4 rounded-xl bg-white bg-opacity-80 p-3 flex flex-col justify-between text-black text-sm" style={{ borderColor: "#01FFFE" }}>
        {/* 채팅 메시지 영역 */}
        <div className="flex-1 overflow-y-auto scroll-smooth pr-1">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <strong className="text-blue-700">{msg.nickname}</strong>: {msg.message}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* 채팅 입력창 */}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-1 rounded border border-gray-400 text-black"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder="메시지를 입력하세요"
          />
          <button
            onClick={sendChat}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            전송
          </button>
        </div>
      </div>

          <div className="flex flex-col gap-4">
            <div className="w-[10rem] h-[8rem] border-4 rounded-xl flex flex-col items-center justify-center text-white text-2xl" style={{ borderColor: "#01FFFE" }}>
              <p className="text-xl mb-1">방코드</p>
              <p className="text-3xl">{roomCode || "-"}</p>
            <button onClick={handleCopy} className="w-7 h-7 hover:scale-110 transition">
                <img src={CopyButton} alt="Copy" className="w-full h-full object-contain" />
            </button>
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
        <img
        src={ExitButton}
        alt="exit"
        onClick={handleExitRoom}
        className="absolute bottom-3 right-[0rem] w-[8rem] cursor-pointer z-50
        transition-all duration-150 hover:brightness-110 hover:scale-105 active:scale-95"
        />

      </div>
      </div>
    </div>
  );
};

export default MeteoLandingPage;
