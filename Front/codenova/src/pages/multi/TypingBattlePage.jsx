import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import multiBg from "../../assets/images/multi_background.png";
import Header from "../../components/common/Header";
import boardBg from "../../assets/images/board1.jpg";
import logo from "../../assets/images/logo.png";
import TypingBox from "../../components/multi/game/TypingBox";
import ProgressBoard from "../../components/multi/game/ProgressBoard";

const TypingBattlePage = () => {
  const { roomId } = useParams();  // ✅ roomId 읽어오기
  const [countdown, setCountdown] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);

  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeRunning, setTimeRunning] = useState(false); // 타이머 실행 중 여부

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setGameStarted(true); // 카운트다운 끝나면 게임 시작
    }
  }, [countdown]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setGameStarted(true); // 카운트다운 끝나면 게임 시작
      setTimeRunning(true); // ✅ 타이머도 시작!
    }
  }, [countdown]);
  
  


  return (
    <div
    className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden relative"
    style={{ backgroundImage: `url(${multiBg})` }}
  >
    <Header />
    <h1 className="text-2xl text-center">Typing Battle 시작! (Room ID: {roomId})</h1>
    {/* 🖤 카운트다운 오버레이 (전체화면 기준!) */}
  {!gameStarted && (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="text-9xl font-bold text-white animate-pulse">
        {countdown > 0 ? countdown : "Start!"}
      </div>
    </div>
  )}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[66vw] max-w-[1300px] aspect-[4/3] bg-contain bg-no-repeat bg-center relative flex flex-col items-center justify-start pt-[6.5%] rounded-2xl">
      <img src={boardBg} alt="board" className="absolute object-cover rounded-2xl z-0" />
  
      {/* 컨텐츠 */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between px-20 py-6 top-[-18%]">
        
        {/* 로고 */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="logo" className="w-[260px]" />
        </div>
  
        {/* 타이핑 박스 */}
        <div className="h-[40%] flex items-center justify-center ">
        <TypingBox elapsedTime={elapsedTime} onFinish={() => setTimeRunning(false)} />
        </div>
  
        {/* 진행 보드 */}
        <div className="h-[50%] flex items-center justify-center bg-green-300">
          <ProgressBoard />
        </div>
  
      </div>
    </div>
  </div>
  
  );
};

export default TypingBattlePage;
