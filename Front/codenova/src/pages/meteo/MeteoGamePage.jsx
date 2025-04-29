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

  // Players 애니메이션 컨테이너 ref 및 groundY 상태
  const playersRef = useRef(null);
  const [groundY, setGroundY] = useState(window.innerHeight);
  // groundY 계산 (네 명 애니메이션 위쪽)
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

  // 새로고침 시 state 없거나 소켓 없으면 메인으로
  useEffect(() => { 
    const socket = getSocket();
    if (!gameData || !roomId || !players?.length || !socket) {
      // 올바른 진입이 아니므로 메인으로 이동
      navigate("/main");
      return;
    }
  }, [gameData, roomId, players, navigate]);

    // 단어 낙하 이벤트 한 번만 등록
    useEffect(() => {
      const socket = getSocket();
      if (!socket) return;

      const handleWordFalling = ({ word, fallDuration }) => {
        // 충돌 검사: 기존 단어들의 left 값 참조
        const existing = wordsRef.current.map(w => w.left);
        let leftPercent;
        do {
          leftPercent = Math.random() * 80 + 10; // 10~90%
        } while (existing.some(x => Math.abs(x - leftPercent) < 15));

        const id = Date.now() + Math.random();
        setFallingWords(prev => [
          ...prev,
          { id, word, fallDuration, left: leftPercent }
        ]);
      };
      socket.on("wordFalling", handleWordFalling);
      return () => {
        socket.off("wordFalling", handleWordFalling);
      };
    }, []); // ← 빈 배열: 마운트 시 한 번만 실행

    // 단어가 바닥에 닿으면 제거
    const handleWordEnd = id => {
      setFallingWords(prev => prev.filter(w => w.id !== id));
    };



    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        console.log("입력한 단어:", input);
        setInput("");
      }
    };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${MeteoGameBg})`,
      }}
    >

      {/* 낙하하는 단어 목록 */}
      {fallingWords.map(({ id, word, fallDuration, left }) => (
        <FallingWord
          key={id}
          word={word}
          duration={fallDuration}
          left={left}
          onEnd={() => handleWordEnd(id)}
        />
      ))}

      {/* 왼쪽 하단 사람 4명 */}
      <div className="absolute bottom-14 left-1 flex z-20">
        {Array(4)
          .fill(0)
          .map((_, idx) => (
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

      {/* 사용자 입력창 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="단어를 입력하세요..."
          className="w-[20rem] h-14 text-xl text-center font-bold text-black bg-[#f0f0f0] border-[3px] border-[#3a3a3a] rounded-lg shadow-md outline-none focus:ring-2 focus:ring-pink-300"
          style={{
            fontFamily: "pixel, sans-serif",
          }}
        />
      </div>
    </div>
  );
};

export default MeteoGamePage;
