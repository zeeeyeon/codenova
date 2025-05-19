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
import { getSocket } from "../../sockets/socketClient";
import useAuthStore from "../../store/authStore";
import Ready from "../../assets/images/multi_ready_btn.png";
import Unready from "../../assets/images/multi_unready_btn.png";
import {
  exitMeteoRoom,
  GameReady,
  offMeteoGameStart,
  offRoomExit,
  onChatMessage,
  onGameReady,
  onMeteoGameStart,
  onRoomExit,
  startMeteoGame,
  onGoWaitingRoom,
  offGoWaitingRoom,
  onExitMeteoGame,
  onKick,
  onReadyWarning,
  offReadyWarning,
  offKick,
  onHostKickWarning,
  offHostKickWarning,
} from "../../sockets/meteoSocket";
import Crown from "../../assets/images/crown_icon.png";
import StartButton from "../../assets/images/start_btn.png";
import WaitButton from "../../assets/images/wait_btn.png";
import ExitButton from "../../assets/images/multi_exit_btn.png";
import CopyButton from "../../assets/images/multi_copy_icon.png";
import CustomAlert from "../../components/common/CustomAlert";

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
  const currentRoomCode = localStorage.getItem("meteoRoomCode");
  const [countdown, setCountdown] = useState(null);
  const [showReadyAlert, setShowReadyAlert] = useState(false);
  const readyUsers = users.filter((user) => user && user.ready);
  const totalUsers = users.filter((user) => user !== null);
  // const allReady = totalUsers.length >= 2 && readyUsers.length === totalUsers.length;
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showKickAlert, setShowKickAlert] = useState(false);
  const [kickMessage, setKickMessage] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setAlertMessage("방 코드가 복사되었습니다.");
      setShowAlert(true);
    } catch (err) {
      setAlertMessage("복사에 실패했습니다.");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    const socket = getSocket();

    const handleGameReady = (data) => {
      // console.log("[onGameReady] ready 수신", { data });
      updateUsersFromPlayers(data.players);
      localStorage.setItem("meteoPlayers", JSON.stringify(data.players));
    };

    onGameReady(handleGameReady);
    return () => socket.off("readyGame", handleGameReady);
  }, []);

  const [allReady, setAllReady] = useState(false);

  const updateUsersFromPlayers = (playersArray) => {
    if (!Array.isArray(playersArray)) return;

    const updated = Array(4).fill(null);
    let computedAllReady = true;
    let realPlayerCount = 0;

    playersArray.forEach((player, idx) => {
      if (idx < 4) {
        const isHost = player.isHost || false;
        const isReady = isHost ? true : player.isReady || false;

        if (player.nickname) realPlayerCount++;
        if (!isReady) computedAllReady = false;

        updated[idx] = {
          nickname: player.nickname,
          isHost,
          ready: isReady,
        };
      }
    });

    // 두 명 이상이어야 allReady 인정
    const allReady = computedAllReady && realPlayerCount >= 2;

    setUsers(updated);
    setAllReady(allReady);

    if (allReady) {
      setMessages((prev) => {
        const exists = prev.some((msg) =>
          msg.message.includes("모든 플레이어가 준비되었습니다")
        );
        return exists
          ? prev
          : [
              ...prev,
              {
                nickname: "SYSTEM",
                message:
                  "모든 플레이어가 준비되었습니다. 방장님은 20초 내에 게임을 시작해주세요!",
              },
            ];
      });
      setShowReadyAlert(true);
      setTimeout(() => setShowReadyAlert(false), 4000);
    }
  };

  // 1) 방 정보 저장 전용 useEffect
  useEffect(() => {
    if (players && players.length > 0) {
      // 화면에 유저 세팅
      updateUsersFromPlayers(players);

      // 로컬스토리지에 방 정보 저장
      localStorage.setItem("meteoRoomCode", roomCode);
      localStorage.setItem("meteoRoomId", roomId);
      localStorage.setItem("meteoPlayers", JSON.stringify(players));

      // console.log("✅ [방 생성/입장] localStorage 저장 완료");
    }
  }, [players, roomCode, roomId]);

  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // 2) guard + socket 이벤트 관리
  useEffect(() => {
    const socket = getSocket();

    // 1) guard: localStorage 기반
    const savedId = localStorage.getItem("meteoRoomId");
    const savedPlayers = JSON.parse(
      localStorage.getItem("meteoPlayers") || "[]"
    );
    if (!savedId || savedPlayers.length === 0 || !nickname || !socket) {
      // console.warn("❗ 방 정보 없음 또는 소켓 없음 → 메인으로 이동");

      // localStorage 정리
      localStorage.removeItem("meteoRoomCode");
      localStorage.removeItem("meteoRoomId");
      localStorage.removeItem("meteoPlayers");

      // 메인으로 리다이렉트
      navigate("/main");
      return;
    }

    // 2) guard 통과 후 서버 이벤트 등록
    const handleSecretRoomJoin = (roomData) => {
      updateUsersFromPlayers(roomData.players);
      localStorage.setItem("meteoPlayers", JSON.stringify(roomData.players));
      // ✅ 2. SYSTEM 메시지 추가
      const prevCount = usersRef.current.filter((u) => u !== null).length;
      const newCount = roomData.players.length;

      if (newCount > prevCount) {
        const joined = roomData.players[newCount - 1];
        if (joined?.nickname) {
          setMessages((prev) => [
            ...prev,
            {
              nickname: "SYSTEM",
              message: `${joined.nickname} 님이 들어왔습니다.`,
            },
          ]);
        }
      } // console.log("🛰️ [secretRoomJoin] localStorage 업데이트");
    };
    socket.on("secretRoomJoin", handleSecretRoomJoin);

    const handleRoomExit = (data) => {
      const { currentPlayers, leftUser } = data;
      const mySessionId = socket.id;
      localStorage.setItem("meteoPlayers", JSON.stringify(currentPlayers));

      updateUsersFromPlayers(currentPlayers);

      if (leftUser.sessionId === mySessionId) {
        localStorage.removeItem("meteoRoomCode");
        localStorage.removeItem("meteoRoomId");
        localStorage.removeItem("meteoPlayers");
        navigate("/main");
      } else {
        setMessages((prev) => [
          ...prev,
          {
            nickname: "SYSTEM",
            message: `${leftUser.nickname} 님이 나갔습니다.`,
          },
        ]);
      }
    };
    onRoomExit(handleRoomExit);

    // 3) cleanup
    return () => {
      socket.off("secretRoomJoin", handleSecretRoomJoin);
      socket.off("roomExit", handleRoomExit);
      offRoomExit();
      // localStorage.removeItem("meteoRoomCode");
      localStorage.removeItem("meteoRoomId");
      // localStorage.removeItem("meteoPlayers");
    };
  }, [nickname, navigate]);

  useEffect(() => {
    const handleUnloadOrBack = () => {
      const savedRoomId = localStorage.getItem("meteoRoomId");
      const savedNickname = nickname;

      if (savedRoomId && savedNickname) {
        // console.log("🚪 [뒤로가기/새로고침] 방 나감 처리 시작");
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

      alert("게임을 나가시겠습니까?");

      const savedNickname = nickname;

      if (currentRoomId && savedNickname) {
        exitMeteoRoom({ roomId: roomId, nickname: nickname });
        localStorage.removeItem("meteoRoomCode");
        localStorage.removeItem("meteoRoomId");
        navigate("/main");
        // console.log("🚪 [뒤로가기] 방 나감 처리 시작");
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
      // console.log("🛰️ [matchRandom 수신 - LandingPage]", roomData);
      localStorage.setItem("meteoPlayers", JSON.stringify(roomData.players));
      updateUsersFromPlayers(roomData.players);
      // ✅ 마지막 들어온 유저 추적해서 system 메시지 출력
      const prevCount = users.filter((u) => u !== null).length;
      const newCount = roomData.players.length;

      if (newCount > prevCount) {
        const joined = roomData.players[newCount - 1];
        if (joined?.nickname) {
          setMessages((prev) => [
            ...prev,
            {
              nickname: "SYSTEM",
              message: `${joined.nickname} 님이 들어왔습니다.`,
            },
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
    startMeteoGame(currentRoomId);
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
          localStorage.setItem("meteoRoomId", gameData.roomId); // ✅ 명확히 같이 저장

          if (gameData.roomCode) {
            localStorage.setItem("roomCode", gameData.roomCode);
            localStorage.setItem("meteoRoomCode", gameData.roomCode); // ✅ 확실하게
            console.log("✅ roomCode 저장됨:", gameData.roomCode);
          } else {
            // console.warn("❗ gameData.roomCode 없음 → 저장 생략");
          }

          if (!localStorage.getItem("nickname")) {
            const matched = gameData.players.find(
              (p) => p.sessionId === getSocket()?.id
            );
            if (matched?.nickname) {
              localStorage.setItem("nickname", matched.nickname);
            }
          }

          // ✅ 페이지 이동
          navigate("/meteo/game", { state: { ...gameData } }, 3000);
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

    // console.log("🚀 [방 나가기 버튼] 저장된 roomId:", savedRoomId);
    // console.log("🚀 [방 나가기 버튼] 저장된 nickname:", savedNickname);

    if (savedRoomId && savedNickname) {
      exitMeteoRoom({ roomId: savedRoomId, nickname: savedNickname });
      // onExitMeteoGame({ roomId: savedRoomId, nickname: savedNickname });
    } else {
      console.error("❌ [방 나가기] roomId 또는 nickname 없음", {
        savedRoomId,
        savedNickname,
      });
    }

    // ❗ emit 보내고 바로 메인으로 튕기기
    localStorage.removeItem("meteoRoomCode");
    localStorage.removeItem("meteoRoomId");
    navigate("/main");
  };

  useEffect(() => {
    const handleChat = (data) => {
      // console.log("[채팅 수신]", data);
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
      roomId: currentRoomId,
      nickname,
      message: chatInput.trim(),
    });
    setChatInput("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // MeteoLandingPage.jsx

  useEffect(() => {
    const handleGoWaitingRoom = (data) => {
      // console.log("📥 [LandingPage] waitingRoomGo 수신:", data);

      const myNickname = localStorage.getItem("nickname");
      const isMeIncluded = data.players.some(
        (player) => player.nickname === myNickname
      );

      if (!isMeIncluded) {
        console.warn("❗ 내 닉네임이 포함되지 않음 → 수신 무시");
        return;
      }

      updateUsersFromPlayers(data.players);
      localStorage.setItem("meteoPlayers", JSON.stringify(data.players));
    };

    onGoWaitingRoom(handleGoWaitingRoom);
    return () => {
      offGoWaitingRoom();
    };
  }, []);

  useEffect(() => {
    // 준비 경고 이벤트 처리
    onReadyWarning((data) => {
      // console.log("⚠️ [onReadyWarning] 경고 수신:", data);

      // 알림 표시 (준비 경고 메시지)
      setAlertMessage(
        data.message || "10초 내에 준비하지 않으면 방에서 퇴장됩니다."
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000);

      // 시스템 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          nickname: "SYSTEM",
          message:
            "⚠️ " +
            (data.message || "10초 내에 준비하지 않으면 방에서 퇴장됩니다."),
        },
      ]);
    });

    // 강퇴 이벤트 처리
    onKick((data) => {
      // console.log("👢 [onKick] 강퇴 수신:", data);

      // 로컬 스토리지 정리
      localStorage.removeItem("meteoRoomCode");
      localStorage.removeItem("meteoRoomId");
      localStorage.removeItem("meteoPlayers");

      // 강퇴 전용 알림 표시
      setKickMessage(
        data.message || "준비 시간이 초과되어 방에서 퇴장되었습니다."
      );
      setShowKickAlert(true);
    });
    
    // 이벤트 리스너 정리 함수
    return () => {
      offReadyWarning(); // 함수로 분리된 이벤트 리스너 제거 함수 호출
      offKick();
    };
  }, [navigate]);
  
  const handleKickConfirm = () => {
    setShowKickAlert(false);
    navigate("/main");
  };

  useEffect(() => {
    // 방장 경고 이벤트 (방장에게만 표시)
    onHostKickWarning((data) => {
      // console.log("⚠️ [onHostKickWarning] 방장 경고 수신:", data);

      // 방장인 경우에만 알림 표시
      if (users.find((u) => u?.nickname === nickname)?.isHost) {
        setAlertMessage("5초 내에 게임을 시작해주세요");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    });


    return () => {
      offHostKickWarning();
    };
  }, [users, nickname]);
  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
      style={{ backgroundImage: `url(${MeteoBg})` }}
    >
      {showReadyAlert && (
        <div className="absolute top-6 left-1/3 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full text-lg shadow-xl animate-bounce">
          방장님은 20초 내에 시작 버튼을 눌러 게임을 시작해주세요!
        </div>
      )}

      {/* <Header /> */}
      {countdown !== null && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center pointer-events-none transition-opacity duration-300">
          <div className="text-white text-[10rem] font-extrabold drop-shadow-2xl animate-ping-scale-fade">
            {countdown}
          </div>
        </div>
      )}

      <div className="relative flex justify-center items-center mt-20">
        <div className="relative w-[66rem]">
          <img
            src={MeteoBoard}
            className="w-[66rem] rounded-2xl shadow-xl z-0"
            alt="meteoBoard"
          />
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
              <div
                className="absolute top-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black bg-opacity-90 text-white text-sm px-3 py-2 rounded shadow-md whitespace-nowrap z-30 text-center
                animate-fade-slide-up"
              >
                2~4인의 협력 모드
                <br />
                들어온 Player들이 모두 준비되면
                <br />
                방장이 시작 버튼을 눌러
                <br />
                지구를 지킬 수 있습니다!
              </div>
            </div>
          </div>

          {/* 유저 카드 */}
          <div className="flex absolute top-[15%] right-[5.5rem] grid-cols-4 gap-9 z-10">
            {users.map((user, idx) => (
              <div key={idx} className="relative w-48 h-auto">
                <img
                  src={UserBoard}
                  alt={`user-board-${idx}`}
                  className="w-full h-auto rounded-xl shadow-md"
                />
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
                    className="absolute top-12 left-1/2 transform -translate-x-1/2 w-12 h-auto"
                  />
                ) : null}
                {/* <img src={profileImages[idx]} alt={`user-profile-${idx}`} className="absolute top-12 left-1/2 transform -translate-x-1/2 w-14 h-auto" /> */}
                {/* 닉네임 */}
                <div
                  className={`absolute bottom-9 left-1/2 transform -translate-x-1/2 text-m w-[16rem] text-center truncate ${
                    user?.nickname === nickname ? "text-cyan-300" : "text-white"
                  }`}
                >
                  {user?.nickname || "-"}
                </div>
                {user && (
                  <div
                    className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 text-m w-[16rem] text-center truncate ${
                      user.ready ? "text-green-400" : "text-white"
                    }`}
                  >
                    {user.ready ? "Ready" : "unReady"}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 채팅 + 방코드 */}
          <div className="flex absolute top-[50%] right-[5.5rem] gap-6">
            <div
              className="w-[44rem] h-[12.5rem] border-4 rounded-xl bg-#1f0e38 bg-opacity-70 p-3 flex flex-col justify-between text-white text-sm"
              style={{ borderColor: "#01FFFE" }}
            >
              {/* 채팅 메시지 영역 */}
              <div className="flex-1 overflow-y-auto scroll-smooth pr-1">
                {messages.map((msg, idx) => {
                  if (msg.nickname === "SYSTEM") {
                    const isJoin = msg.message.includes("들어왔습니다");
                    const isExit = msg.message.includes("나갔습니다");

                    return (
                      <div
                        key={idx}
                        className={`text-center  py-1 ${
                          isJoin
                            ? "text-green-500"
                            : isExit
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {msg.message}
                      </div>
                    );
                  }

                  return (
                    <div key={idx}>
                      <strong className="text-white">{msg.nickname}</strong>:{" "}
                      {msg.message}
                    </div>
                  );
                })}
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
              <div
                className="w-[10rem] h-[8rem] border-4 rounded-xl flex flex-col items-center justify-center text-white text-2xl"
                style={{ borderColor: "#01FFFE" }}
              >
                <p className="text-xl mb-1">방코드</p>
                <p className="text-3xl">
                  {!currentRoomCode || currentRoomCode === "undefined"
                    ? "-"
                    : currentRoomCode}
                </p>
                {currentRoomCode ? (
                  <button
                    onClick={handleCopy}
                    className="w-7 h-7 hover:scale-110 transition"
                  >
                    <img
                      src={CopyButton}
                      alt="Copy"
                      className="w-full h-full object-contain"
                    />
                  </button>
                ) : null}
              </div>
              <div
                className="w-[10rem] h-[3.5rem] border-4 rounded-xl flex items-center justify-center"
                style={{ borderColor: "#01FFFE" }}
              >
                {users.find((user) => user?.nickname === nickname)?.isHost ? (
                  allReady && totalUsers.length >= 2 ? (
                    // ✅ 방장이고, allReady이면 진짜 Start 버튼
                    <img
                      src={StartButton}
                      alt="start"
                      role="button"
                      className="w-full h-full cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95] animate-pulse"
                      onClick={handleStartGame}
                    />
                  ) : (
                    // ✅ 방장이지만 아직 allReady가 false면 흐릿한 버튼
                    <img
                      src={StartButton}
                      role="button"
                      alt="start-disabled"
                      className="w-full h-full opacity-50"
                    />
                  )
                ) : (
                  // ✅ 일반 유저는 ready/unready 토글 버튼
                  <img
                   role="button"
                    src={
                      users.find((u) => u?.nickname === nickname)?.ready
                        ? Unready
                        : Ready
                    }
                    alt="ready-btn"
                    onClick={() =>
                      GameReady({
                        roomId: currentRoomId,
                        nickname,
                        ready: !users.find((u) => u?.nickname === nickname)
                          ?.ready,
                      })
                    }
                    className="w-[8rem] cursor-pointer hover:scale-105 transition"
                  />
                )}
              </div>
            </div>
          </div>
          <img
            src={ExitButton}
            role="button"
            alt="exit"
            onClick={handleExitRoom}
            className="absolute bottom-3 right-[0rem] w-[8rem] cursor-pointer z-30
        transition-all duration-150 hover:brightness-110 hover:scale-105 active:scale-95"
        style={{ cursor: "url('/cursors/click.png') 30 30, pointer" }}
          />
        </div>
      </div>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onConfirm={() => setShowAlert(false)}
        />
      )}

      {showKickAlert && (
        <CustomAlert message={kickMessage} onConfirm={handleKickConfirm} />
      )}
    </div>
  );
};

export default MeteoLandingPage;
