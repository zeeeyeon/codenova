import { useState, useRef, useEffect } from "react";
import enterIcon from "../../../assets/images/multi_enter_icon.png";
import { getSocket } from "../../../sockets/socketClient";
import useAuthStore from "../../../store/authStore";

const TypingBox = ({ roomId,gameStarted, elapsedTime, onFinish, targetCode }) => {
  // const targetCode = `let timer = setInterval(() => {
  //       this.counter--;
        
  //       if (this.counter === 0) {
  //         clearInterval(timer);
  //         this.onTimeUp();
  //       }
  //     }, 1000);`;

  if (!targetCode) {
    return (
      <div className="w-[93%] h-[96%] flex justify-center items-center bg-[#110429] rounded-2xl border-4 border-cyan-400 text-white text-xl animate-pulse">
        코드 불러오는 중...
      </div>
    );
  }

  const inputRef = useRef(null);

  const lines = targetCode.split("\n"); // 줄 단위로 분리
  const [currentLine, setCurrentLine] = useState(0);  // 현재 타이핑해야할 인덱스
  const [userInput, setUserInput] = useState(""); // 사용자 입력 문자
  const [shake, setShake] = useState(false);  // 오타 입력창 흔들기 모션

  const codeContainerRef = useRef(null);

  const currentLineText = lines[currentLine] ?? ""; // 현재 입력한 줄 원본
  const trimmedCurrentLine = currentLineText.trimStart(); // 현재 줄에서 들여쓰기 제거 문자(비교용)
  const trimmedUserInput = userInput.trimStart();

  const isCorrect = trimmedCurrentLine.startsWith(trimmedUserInput); // 현재 입력 맞게 입력되고있는지(줄 앞 공백 무시시)
  const nickname = useAuthStore((state) => state.user?.nickname);
  const totalLength = targetCode.replace(/\s/g, "").length;  // 전체 코드(공백 제외)



  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // 자동 포커스
    }
  }, []);
  
  // 사용자 입력값 업뎃
  const handleInputChange = (e) => {
    if (!gameStarted) return;  // 게임 시작 전 입력 막기
    setUserInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (!gameStarted) {
      e.preventDefault(); // 게임 시작 전이면 엔터 막기
      return;
    }

    if (e.key === "Enter") {
      if (trimmedUserInput === trimmedCurrentLine) {
        if (currentLine === lines.length - 1) {
            onFinish?.(); // ✅ 부모에게 "끝났어!" 신호
          }
        setCurrentLine((prev) => prev + 1); // 다음 줄 이동
        setUserInput("");  // 입력창 초기화
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      e.preventDefault(); // 기본 enter 줄바꿈 막기기
    }
  };

  useEffect(() => {
    if (codeContainerRef.current && currentLine > 0) {
      const lineHeight = 28; // 예를 들어 한 줄 높이 28px (tailwind leading-relaxed 기준)
      codeContainerRef.current.scrollTop += lineHeight;
    }
  }, [currentLine]);

  const minutes = Math.floor(elapsedTime / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  const milliseconds = Math.floor((elapsedTime % 1000));

  const elapsedTimeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;


  // 코드 타자 진행도 소켓 emit
  const prevProgressRef = useRef(0);

useEffect(() => {
  if (!gameStarted || !targetCode) return;

  const socket = getSocket();
  if (!socket || !nickname || !roomId) return;

  // 전체 정답 문자열 (공백 제거)
  const cleanTarget = targetCode.replace(/\s/g, "");
  const cleanTyped = (lines.slice(0, currentLine).join("\n") + userInput).replace(/\s/g, "");

  // 몇 글자까지 정확히 맞았는지 확인
  let correctCount = 0;
  for (let i = 0; i < cleanTyped.length; i++) {
    if (cleanTyped[i] === cleanTarget[i]) {
      correctCount++;
    } else {
      break;
    }
  }

  const progressPercent = Math.floor((correctCount / cleanTarget.length) * 100);

  // 이전보다 높을 때만 emit
  if (progressPercent > prevProgressRef.current) {
    prevProgressRef.current = progressPercent;

    socket.emit("progress_update", {
      roomId,
      nickname,
      progressPercent,
    });
  }
}, [userInput, currentLine]);



  return (
    <div className="w-[93%] h-[96%] p-4 bg-[#110429] rounded-2xl border-4 border-cyan-400 relative flex flex-col">
      {/* Round 표시 */}
      <div className="absolute top-[-14px] left-6 bg-cyan-400 text-black px-3 py-1 rounded-lg text-m z-20">
        Round 1
      </div>

      {/* 코드 + 입력창 */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden p-4">
        <div 
        ref={codeContainerRef}
        className="flex-1 min-h-[125px] overflow-y-auto custom-scrollbar">

            {/* 🕒 타이머 표시 */}
            <div className="absolute top-4 right-12 bg-black bg-opacity-80 text-white px-3 py-2 rounded-full border border-white text-lg">
            ⏱ {elapsedTimeFormatted}
            </div>

          <pre className="text-left whitespace-pre-wrap font-mono text-base leading-relaxed break-words text-lg">
          {lines.map((line, idx) => {
            if (idx === currentLine) {
                // 현재 입력 중인 줄
                const originalIndent = currentLineText.length - trimmedCurrentLine.length;
                const indentSpaces = currentLineText.slice(0, originalIndent);
                const content = trimmedCurrentLine;

    return (
      <div key={idx} className="flex items-center">
        <span className="text-white">{indentSpaces}</span>
        {content.split("").map((char, cidx) => {
          let color = "text-white";
          if (cidx < trimmedUserInput.length) {
            color = trimmedUserInput[cidx] === char ? "text-green-400" : "text-red-400";
          }
          return (
            <span key={cidx} className={color}>
              {char}
            </span>
          );
        })}
        <img src={enterIcon} alt="enter" className="w-5 h-5 ml-2" />
      </div>
    );
  } else {
    // 완료되었거나 아직 입력 안한 줄
    const textColor = idx < currentLine ? "text-green-400" : "text-gray-400";
    return (
      <div key={idx} className={`flex items-center ${textColor}`}>
        <span>{line}</span>
        <img src={enterIcon} alt="enter" className="w-6 h-6 ml-2" />
      </div>
            );
        }
        })}

          </pre>
        </div>

        {/* 입력창 */}
        <input
          ref={inputRef}
          type="text"
          spellCheck={false}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Start Typing Code Here."
          onFocus={(e) => (e.target.placeholder = "")} 
          onBlur={(e) => (e.target.placeholder = "Start Typing Code Here.")}
          className={`w-full mt-1 px-4 py-2 rounded-md text-black focus:outline-none 
          ${isCorrect ? "border-4 border-green-400" : "border-4 border-red-400"}
          ${shake ? "animate-shake" : ""}`}
        />
      </div>
    </div>
  );
};

export default TypingBox;
