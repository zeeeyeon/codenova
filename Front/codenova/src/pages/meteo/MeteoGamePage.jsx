import React, { useState } from "react";
import MeteoGameBg from "../../assets/images/meteo_game_bg.png";
import { Player } from "@lottiefiles/react-lottie-player";
import typingLottie from "../../assets/lottie/typing.json";

const MeteoGamePage = () => {
  const [input, setInput] = useState("");

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
