import React, { useState, useEffect, useRef } from "react";
import MeteoGameBg from "../../assets/images/meteo_game_bg.png";
import { Player } from "@lottiefiles/react-lottie-player";
import typingLottie from "../../assets/lottie/typing.json";
import FallingWord from "./FallingWord";
import { useLocation, useNavigate } from "react-router-dom";
import { getSocket } from "../../sockets/socketClient";
import EndGameBtn from "../../assets/images/end_game_button.png";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { exitMeteoGame, exitMeteoRoom, onCheckText, onCheckTextResponse, onGameEnd,  onRemoveHeartResponse } from "../../sockets/meteoSocket";
import GameResultModal from "../../components/modal/GameResultModal";
import redHeart from "../../assets/images/red_heart.png";
import blackHeart from "../../assets/images/black_heart.png";


const MeteoGamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameData = location.state;
  const { roomId, players } = gameData || {};
  const [gameResult, setGameResult] = useState(null); // null이면 모달 안 띄움
  const [lifesLeft, setLifesLeft] = useState(5);

  // 초기값은 무조건 4명
  const [playerList, setPlayerList] = useState(["player1", "player2", "player3", "player4"]);

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
      console.log("🔥 [뒤로가기 또는 새로고침] 방 나감 처리", savedRoomId, savedNickname);
      if (savedRoomId && savedNickname) {
        console.log("🚪 [뒤로가기 또는 새로고침] 방 나감 처리");
        exitMeteoRoom({ roomId: savedRoomId, nickname: savedNickname });
  
        localStorage.removeItem("meteoRoomCode");
        localStorage.removeItem("meteoRoomId");
      }
    };
  
    // 뒤로가기, 새로고침 등 감지
    window.addEventListener("popstate", handleBeforeUnloadOrPop);
    window.addEventListener("beforeunload", handleBeforeUnloadOrPop);
  
    return () => {
      window.removeEventListener("popstate", handleBeforeUnloadOrPop);
      window.removeEventListener("beforeunload", handleBeforeUnloadOrPop);
    };
  }, []);
  

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
      console.log("[wordFalling] word:", word, "fallDuration:", fallDuration, "timestamp:", timestamp);

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

    const handleLeave = (data) => {
      console.log("[onExitMeteoGame] gameLeave 수신", data);
      const { leftUser, currentPlayers } = data;

      // 본인이면 → 메인으로 이동
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
    socket.off("gameLeave", handleLeave); // ✅ 중복 방지
    socket.on("gameLeave", handleLeave);
    return () => getSocket().off("gameLeave", handleLeave);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const text = input.trim();
      if (!text) return;
  
      const roomId = localStorage.getItem("roomId");
      const nickname = localStorage.getItem("nickname");
  
      // 서버로 입력 단어 전송
      onCheckText({ roomId, nickname, text });
      setInput(""); // 입력창 초기화
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
      console.log("[onGameEnd] gameEnd 수신", data);
      setGameResult(data);
    };
  
    onGameEnd(handleGameEnd);
  
    return () => {
      getSocket().off("gameEnd", handleGameEnd);
    };
  }, []);
  
  useEffect(() => {
    const handleLostLife = (data) => {
      console.log("[onRemoveHeartResponse] lostLife 수신", data);
      setLifesLeft(data.lifesLeft);
    };
  
    onRemoveHeartResponse(handleLostLife);
  
    return () => {
      getSocket().off("lostLife", handleLostLife);
    };
  }, []);
  
  

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
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

      {/* 플레이어 애니메이션 */}
      <div ref={playersRef} className="absolute bottom-10 left-1 flex z-20">
        {playerList.map((nickname, idx) => (
          <Player
            key={nickname}
            autoplay
            loop
            src={typingLottie}
            className="w-[12rem] h-[12rem] inline-block"
            style={{ marginLeft: idx === 0 ? 0 : "-5rem" }}
          />
        ))}
      </div>

      {/* 입력창 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
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
        {Array(5).fill(0).map((_, idx) => (
          <img
            key={idx}
            src={idx < lifesLeft ? redHeart : blackHeart}
            alt="heart"
            className="w-14 h-14"
          />
        ))}
      </div>

        {showExitModal && (
          <ConfirmModal
            title="게임을 종료하시겠습니까?"
            onConfirm={() => {
              const roomId = localStorage.getItem("roomId");
              const nickname = localStorage.getItem("nickname");
              console.log("roomId:", roomId); // null이면 문제 있음
              console.log("nickname:", nickname); // null이면 문제 있음
              console.log("🔥 exit 요청할 roomId / nickname:", roomId, nickname);
            
              exitMeteoGame({ roomId, nickname });
            
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
            localStorage.removeItem("roomId");
            localStorage.removeItem("roomCode");
            navigate("/main");
          }}
          onRetry={() => {
            // 재도전 로직 (예: navigate to waiting room or emit retry)
            window.location.reload(); // 임시로 새로고침
          }}
        />
      )}




    </div>

  );
};

export default MeteoGamePage;