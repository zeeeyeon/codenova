import React, { useState, useEffect, useRef } from "react";
import MeteoGameBg from "../../assets/images/meteo_game_bg.png";
import { Player } from "@lottiefiles/react-lottie-player";
import typingLottie from "../../assets/lottie/typing.json";
import FallingWord from "./FallingWord";
import { useLocation, useNavigate } from "react-router-dom";
import { getSocket } from "../../sockets/socketClient";

const MeteoGamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameData = location.state;
  const { roomId, players } = gameData || {};

  const [input, setInput] = useState("");
  const [fallingWords, setFallingWords] = useState([]);
  const wordsRef = useRef(fallingWords);
  wordsRef.current = fallingWords;

  // 플레이어 애니메이션 컨테이너 ref로 땅 위치 계산
  const playersRef = useRef(null);
  const [groundY, setGroundY] = useState(window.innerHeight);

  useEffect(() => {
    const calcGround = () => {
      if (playersRef.current) {
        const rect = playersRef.current.getBoundingClientRect();
        setGroundY(rect.top);
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

    const handleWordFalling = ({ word, fallDuration }) => {
      // 기존 단어들의 left%를 가져와 충돌 검사
      const existing = wordsRef.current.map(w => w.left).filter(x => x != null);
      let leftPercent = null;
      for (let i = 0; i < 5; i++) {
        const candidate = Math.random() * 80 + 10; // 10%~90%
        if (!existing.some(x => Math.abs(x - candidate) < 15)) {
          leftPercent = candidate;
          break;
        }
      }
      if (leftPercent === null) leftPercent = Math.random() * 80 + 10;

      const id = Date.now() + Math.random();
      setFallingWords(prev => [...prev, { id, word, fallDuration, left: leftPercent }]);
    };

    socket.off("wordFalling", handleWordFalling);
    socket.on("wordFalling", handleWordFalling);
    return () => socket.off("wordFalling", handleWordFalling);
  }, []);

  // 단어가 바닥에 닿으면 목록에서 제거
  const handleWordEnd = id => {
    setFallingWords(prev => prev.filter(w => w.id !== id));
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      // 예: 서버로 입력 단어 전송 가능
      setInput("");
    }
  };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `url(${MeteoGameBg})` }}
    >
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2
                 w-4/5 h-full relative overflow-hidden"
    >
      {fallingWords.map(({ id, word, fallDuration, left }) => (
        <FallingWord
          key={id}
          word={word}
          duration={fallDuration}
          left={left}         // 숫자형(예: 23.5)
          groundY={groundY}
          onEnd={() => handleWordEnd(id)}
        />
      ))}
    </div>

      {/* 플레이어 애니메이션 */}
      <div ref={playersRef} className="absolute bottom-14 left-1 flex z-20">
        {players.map((_, idx) => (
          <Player
            key={idx}
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
          className="w-[20rem] h-14 text-xl text-center font-bold text-black bg-[#f0f0f0] border-[3px] border-[#3a3a3a] rounded-lg shadow-md outline-none focus:ring-2 focus:ring-pink-300"
          style={{ fontFamily: "pixel, sans-serif" }}
        />
      </div>
    </div>
  );
};

export default MeteoGamePage;