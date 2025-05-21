import React, { useState, useEffect, useRef } from "react";
import MeteoGameBg from "../../assets/images/meteo_game_bg.png";
import { Player } from "@lottiefiles/react-lottie-player";
import typingLottie from "../../assets/lottie/typing.json";
import FallingWord from "./FallingWord";
import useAuthStore from "../../store/authStore";
import { useLocation, useNavigate } from "react-router-dom";
import { getSocket } from "../../sockets/socketClient";
import EndGameBtn from "../../assets/images/end_game_button.png";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { onGoWaitingRoom, offGoWaitingRoom, exitMeteoGame, exitMeteoRoom, goWaitingRoom, offUserInput, onCheckText, onCheckTextResponse, onExitMeteoGame, onGameEnd,  onRemoveHeartResponse, onUserInput, onUserInputResponse, exitGame } from "../../sockets/meteoSocket";
import GameResultModal from "../../components/modal/GameResultModal";
import redHeart from "../../assets/images/red_heart.png";
import blackHeart from "../../assets/images/black_heart.png";
import gameOverLottie from "../../assets/lottie/game_over.json";
import victoryLottie from "../../assets/lottie/victory.json";
import bgm from "../../assets/sound/meteoBGM.mp3";
import explosionLottie from "../../assets/lottie/explosion.json";
import useVolumeStore from "../../store/useVolumsStore";

const MeteoGamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameData = location.state;
  const nickname = useAuthStore((state) => state.user?.nickname);
  const { roomId, players } = gameData || {};
  const [gameResult, setGameResult] = useState(null); // null이면 모달 안 띄움
  const [lifesLeft, setLifesLeft] = useState(5);
  const [userInputTexts, setUserInputTexts] = useState({});
  const currentRoomId = localStorage.getItem("meteoRoomId");
  const [showGameOver, setShowGameOver] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  const { bgmVolume } = useVolumeStore();
  const audioRef = useRef(null);

  // input 포커싱
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();  // 3. 페이지 진입 시 포커스

    const audio = new Audio(bgm);
    audio.loop = true;
    audio.volume = bgmVolume;
    audio.play().catch((e) => {           // 4. 자동 재생 시도 + 차단 시 경고 출력
      // console.warn("⚠️ 자동 재생 차단됨:", e);
    });
    audioRef.current = audio;

    return () => {
      audio.pause();                      // 5. 페이지 벗어날 때 음악 멈춤
      audio.currentTime = 0;             // 6. 재생 위치를 처음으로 초기화
    }
    }, []);

    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = bgmVolume;
      }
    }, [bgmVolume]);

  // 닉네임 매핑
  const [playerList, setPlayerList] = useState(players?.map(p => p.nickname) || []);

  const [input, setInput] = useState("");
  const [fallingWords, setFallingWords] = useState([]);
  const wordsRef = useRef(fallingWords);
  wordsRef.current = fallingWords;

  // 플레이어 애니메이션 컨테이너 ref로 땅 위치 계산
  const playersRef = useRef(null);
  const [groundY, setGroundY] = useState(window.innerHeight);

  // 모달
  const [showExitModal, setShowExitModal] = useState(false);
  const [leaveMessages, setLeaveMessages] = useState([]);

  


  useEffect(() => {
    const handleBeforeUnloadOrPop = () => {
      const savedRoomId = localStorage.getItem("meteoRoomId");
      const savedNickname = localStorage.getItem("nickname");
      // console.log("🔥 [뒤로가기 또는 새로고침] 방 나감 처리", savedRoomId, savedNickname);
      if (savedRoomId && savedNickname) {
        // console.log("🚪 [뒤로가기 또는 새로고침] 방 나감 처리");
        exitGame({ roomId: savedRoomId, nickname: savedNickname });
  
        // localStorage.removeItem("meteoRoomCode");
        // localStorage.removeItem("meteoRoomId");
      }
    };
  
    // 뒤로가기, 새로고침 등 감지
    window.addEventListener("beforeunload", handleBeforeUnloadOrPop);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnloadOrPop);
    };
  }, []);
  useEffect(() => {
      const handlePopState = (event) => {
        // 브라우저 alert 사용 (콘솔이 안 보일때도 확인 가능)
  
        alert("게임을 나가시겠습니까?");
  
        const savedNickname = nickname;
  
        if (currentRoomId && savedNickname) {
          exitGame({ roomId: roomId, nickname: nickname });
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
    const calcGround = () => {
      if (playersRef.current) {
        const rect = playersRef.current.getBoundingClientRect();
        setGroundY(rect.bottom);
      }
    };
    calcGround();
    window.addEventListener("resize", calcGround);
    return () => window.removeEventListener("resize", calcGround);
  }, []);

  // 새로고침 시 잘못된 접근이면 메인으로
  useEffect(() => {
    const socket = getSocket();
    if (!gameData || !roomId || !players?.length || !socket) {
      navigate("/main");
    }
  }, [gameData, roomId, players, navigate]);

  // 서버에서 단어 떨어뜨리기 이벤트 한 번만 등록
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
  
    const handleWordFalling = ({ word, fallDuration, timestamp }) => {
      const id = Date.now() + Math.random();

      let parsedTime = new Date(timestamp.replace(" ", "T")).getTime();      
      const now = Date.now()
      if (now - parsedTime > 5000 || now - parsedTime < -1000) {
        // console.warn("🚨 spawnTime 보정됨:", timestamp, `(Δ ${now - parsedTime}ms)`);
        parsedTime = now;
      }
      const spawnTime = parsedTime;
      // console.log("[타이밍 확인] now:", now, "spawnTime:", spawnTime, "Δ:", now - spawnTime);
      // console.log("[wordFalling] word:", word, "fallDuration:", fallDuration, "timestamp:", timestamp);

      setFallingWords(prev => {
        const existing = prev.map(w => w.left);
  
        let leftPercent;
        for (let i = 0; i < 5; i++) {
          const candidate = Math.random() * 80 + 10;
          if (!existing.some(x => Math.abs(x - candidate) < 15)) {
            leftPercent = candidate;
            break;
          }
        }
        if (leftPercent == null) leftPercent = Math.random() * 80 + 10;
  
        return [
          ...prev,
          { id, word, fallDuration, spawnTime, left: leftPercent },
        ];
      });
    };
  
    socket.off("wordFalling", handleWordFalling);
    socket.on("wordFalling", handleWordFalling);
    return () => socket.off("wordFalling", handleWordFalling);
  }, []);
  
  // 단어가 바닥에 닿으면 목록에서 제거
  const handleWordEnd = id => {

    setFallingWords(prev => prev.filter(w => w.id !== id));
  };

  // 게임 도중 나가기
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
  
    // 1. 정상 종료 처리
    const handleLeave = (data) => {
      const { leftUser, currentPlayers } = data;
      console.log("[handleLeave] 정상 종료 처리", data);
      if (leftUser.nickname === localStorage.getItem("nickname")) {
        localStorage.removeItem("roomId");
        localStorage.removeItem("roomCode");
        navigate("/main");
      } else {
        setPlayerList(currentPlayers.map(p => p.nickname));
        const id = Date.now() + Math.random();
        setLeaveMessages(prev => [...prev, { id, text: `${leftUser.nickname} 님이 게임을 나갔습니다.` }]);
        setTimeout(() => {
          setLeaveMessages(prev => prev.filter(msg => msg.id !== id));
        }, 3000);
      }
    };
    socket.off("gameLeave", handleLeave);
    socket.on("gameLeave", handleLeave);
    
    // 2. 비정상 종료 처리
    const handleGameLeave = (data) => {
      const { leftUser, currentPlayers } = data;
  
      if (leftUser.nickname === localStorage.getItem("nickname")) {
        localStorage.removeItem("roomId");
        localStorage.removeItem("roomCode");
        navigate("/main");
      } else {
        setPlayerList(currentPlayers.map(p => p.nickname));
        const id = Date.now() + Math.random();
        setLeaveMessages(prev => [...prev, { id, text: `${leftUser.nickname} 님이 게임을 나갔습니다.` }]);
        setTimeout(() => {
          setLeaveMessages(prev => prev.filter(msg => msg.id !== id));
        }, 3000);
      }
    };
    socket.off("playerDisconnected", handleGameLeave);
    socket.on("playerDisconnected", handleGameLeave);
  
    return () => {
      socket.off("gameLeave", handleLeave);
      socket.off("playerDisconnected", handleGameLeave);
    };
  }, []);
  

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const text = input.trim();
      if (!text) return;
  
      const roomId = localStorage.getItem("roomId");
      const nickname = localStorage.getItem("nickname");
  
      // 서버로 입력 단어 전송
      onUserInput({ roomId, nickname, text });
      onCheckText({ roomId, nickname, text });
      setInput(""); // 입력창 초기화
      setUserInputTexts(prev => ({ ...prev, [nickname]: "" }));
    }
  };
  
  useEffect(() => {
    const handleTextCheck = (data) => {
      // console.log("[onCheckTextResponse] 수신:", data);
      const { text, correct } = data;
  
      if (correct) {
        // 정답이면 해당 단어 제거
        setFallingWords((prev) =>
          prev.filter((wordObj) => wordObj.word !== text)
        );
      }
      // 오답이면 아무 처리 안함
    };
  
    onCheckTextResponse(handleTextCheck);
  
    // 클린업
    return () => getSocket().off("textCheck", handleTextCheck);
  }, []);


  useEffect(() => {
    const handleGameEnd = (data) => {
      if (!data.success) {
        setShowGameOver(true);  // 1) game over 애니메이션 표시
        setTimeout(() => {
          setShowGameOver(false); // 2) 애니메이션 숨기고 모달 표시
          setGameResult(data);
        }, 3000); // 애니메이션 보여줄 시간(ms)
      } else {
        setShowVictory(true);
        setTimeout(() => {
          setShowVictory(false);
          setGameResult(data);
        }, 3000);
      }
    };
  
    onGameEnd(handleGameEnd);
    return () => getSocket().off("gameEnd", handleGameEnd);
  }, []);
  
  const [explosionIndex, setExplosionIndex] = useState(null); // 몇 번째 하트 폭발?
  const [isShaking, setIsShaking] = useState(false); // 화면 흔들림 트리거

  useEffect(() => {
    const handleLostLife = (data) => {
      const newLifesLeft = data.lifesLeft;
      const explodingIndex = newLifesLeft; // 5 → 4면 index 4가 터지는 거
  
      setExplosionIndex(explodingIndex);  // 먼저 폭발 위치 지정
      setIsShaking(true);
  
      setTimeout(() => {
        setExplosionIndex(null);          // 폭발 끝
        setLifesLeft(newLifesLeft);       // 이제 하트 줄이기
        setIsShaking(false);
      }, 1000); // 1초 뒤에 하트 줄이기
    };
  
    onRemoveHeartResponse(handleLostLife);
  
    return () => {
      getSocket().off("lostLife", handleLostLife);
    };
  }, []);
  
  useEffect(() => {
    onUserInputResponse(({ nickname, text }) => {
      // console.log("[onUserInputResponse] 수신:", nickname, text);
      setUserInputTexts(prev => ({ ...prev, [nickname]: text }));
    });
  
    return () => {
      offUserInput();
    };
  }, []);

  useEffect(() => {
    const handleGoWaitingRoom = (data) => {
      const myNickname = localStorage.getItem("nickname");
      
      const isMeIncluded = data.players.some(
        (player) => player.nickname === myNickname
      );
  
      if (!isMeIncluded) {
        console.warn("❗ 내 닉네임이 포함되지 않음 → 대기방 이동 안 함");
        return;
      }
  
      console.log("✅ [내 포함됨] waitingRoomGo 수신 → 대기방 이동", data);
      navigate("/meteo/landing", { state: data });
    };
  
    onGoWaitingRoom(handleGoWaitingRoom);
    return () => {
      offGoWaitingRoom();
    };
  }, []);
  
  
  

  return (
<div
  className={`w-screen h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden ${
    isShaking ? "shake" : ""
  }`}
  style={{ backgroundImage: `url(${MeteoGameBg})` }}
>

      <img src={EndGameBtn} alt="end_game_btn" className="absolute top-0 right-3  w-[7rem] overflow-visible z-50 cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
      onClick={() => setShowExitModal(true)} />
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2
                 w-4/5 h-full relative overflow-visible z-48 pointer-events-none"
    >
      {fallingWords.map(({ id, word, fallDuration, left, spawnTime }) => (
        <FallingWord
          key={id}
          word={word}
          duration={fallDuration}
          left={left}         // 숫자형(예: 23.5)
          spawnTime={spawnTime}
          groundY={groundY}
          onEnd={() => handleWordEnd(id)}
        />
      ))}
    </div>

    <div ref={playersRef} className="absolute bottom-[-1rem] left-1 flex z-20">
    {playerList.map((nickname, idx) => {
      const myNickname = localStorage.getItem("nickname");
      const isMe = nickname === myNickname;

      return (
        <div
          key={nickname}
          className="flex flex-col items-center"
          style={{ marginLeft: idx === 0 ? 0 : "-5rem" }}
        >
          <Player
            autoplay
            loop
            src={typingLottie}
            className="w-[12rem] h-[12rem]"
          />

          <div className="flex flex-col items-center -translate-y-10">
            <div className={`text-sm leading-none text-center break-normal whitespace-pre-wrap max-w-[6rem] ${isMe ? "text-cyan-300" : "text-white"}`}>
              {isMe ? `${nickname}` : nickname}
            </div>

            <div className="text-pink-300 text-lg mt-1 min-h-[1.5rem] max-w-[6rem] leading-tight">
              {userInputTexts[nickname]?.length > 6
                ? userInputTexts[nickname].slice(0, 6) + "..."
                : userInputTexts[nickname] || ""}
            </div>

          </div>
        </div>
      );
    })}
  
    </div>


      {/* 입력창 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <input
        ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            const value = e.target.value;
            setInput(value);
          
            const roomId = localStorage.getItem("roomId");
            const nickname = localStorage.getItem("nickname");
            onUserInput({ roomId, nickname, text: value });
          }}
          
          onKeyDown={handleKeyDown}
          placeholder="단어를 입력하세요..."
          className="w-[20rem] z-50 h-14 text-xl text-center font-bold text-black bg-[#f0f0f0] border-[3px] border-[#3a3a3a] rounded-lg shadow-md outline-none focus:ring-2 focus:ring-pink-300"
          style={{ fontFamily: "pixel, sans-serif" }}
        />
      </div>

        {/* 떠난 유저 알림 메시지 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 space-y-2">
        {leaveMessages.map(msg => (
        <div
          key={msg.id}
          className="bg-black bg-opacity-70 text-white px-6 py-2 rounded-xl shadow-lg transition-opacity duration-300"
          style={{fontSize: "1.3rem"}}
        >
          {msg.text}
        </div>
        ))}
      </div>

      {/* 목숨 하트 UI (오른쪽 상단) */}
      <div className="absolute bottom-10 right-6 z-50 flex gap-2">
      {Array(5).fill(0).map((_, idx) => {
        const isExploding = explosionIndex === idx;
        const isAlive = idx < lifesLeft;

        return (
          <div key={idx} className="relative w-14 h-14">
            <img
              src={isAlive ? redHeart : blackHeart}
              alt="heart"
              className="w-full h-full"
            />
            {isExploding && (
              <Player
                autoplay
                keepLastFrame
                src={explosionLottie}
                className="absolute top-[-20%] left-0 w-[120%] h-[120%] pointer-events-none"
              />
            )}
          </div>
        );
      })}



      </div>

        {showExitModal && (
          <ConfirmModal
            title="게임을 종료하시겠습니까?"
            onConfirm={() => {
              const roomId = localStorage.getItem("roomId");
              const nickname = localStorage.getItem("nickname");
              // console.log("roomId:", roomId); // null이면 문제 있음
              // console.log("nickname:", nickname); // null이면 문제 있음
              // console.log("🔥 exit 요청할 roomId / nickname:", roomId, nickname);
            
              exitGame({ roomId, nickname });
            
              localStorage.removeItem("roomId");
              localStorage.removeItem("roomCode");
              navigate("/main");
            }}
            onCancel={() => setShowExitModal(false)}
          />
        )}


      {gameResult && (
        <GameResultModal
          results={gameResult.results}
          success={gameResult.success}
          onExit={() => {
            const roomId = localStorage.getItem("roomId");
            const nickname = localStorage.getItem("nickname");
            // console.log("🟨 [GameResultModal 종료] onExit 실행", { roomId, nickname });
            // if (!roomId || !nickname) {
            //   console.warn("❗ roomId 또는 nickname 누락 → 강제 메인 이동");
            //   navigate("/main");
            //   return;
            // }
            exitGame({ roomId, nickname })
            localStorage.removeItem("roomId");
            localStorage.removeItem("roomCode");
            navigate("/main");

          }}
          onRetry={() => {
            const roomId = localStorage.getItem("roomId");
            const nickname = localStorage.getItem("nickname");
            const roomCode = localStorage.getItem("meteoRoomCode");
          
            if (!roomId || !nickname) {
              console.warn("❗ roomId 또는 nickname 누락 → 강제 메인 이동");
              navigate("/main");
              return;
            }
          
            // meteoRoomCode가 사라졌다면 다시 복원
            if (!roomCode && gameData?.roomCode) {
              localStorage.setItem("meteoRoomCode", gameData.roomCode);
              console.log("✅ meteoRoomCode 복원:", gameData.roomCode);
            }
          
            goWaitingRoom({ nickname, roomId });
          }}
          
        />
      )}

      {showGameOver && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center pointer-events-none">
          <Player
            autoplay
            keepLastFrame
            src={gameOverLottie}
            className="w-[30rem] h-[30rem]"
          />
        </div>
      )}

      {showVictory && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center pointer-events-none">
          <Player
            autoplay
            keepLastFrame
            src={victoryLottie}
            className="w-[30rem] h-[30rem]"
          />
        </div>
      )}


    </div>

  );
};

export default MeteoGamePage;