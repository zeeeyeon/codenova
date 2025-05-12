// import { useState, useRef, useEffect } from "react";
// import enterIcon from "../../../assets/images/multi_enter_icon.png";
// import { getSocket } from "../../../sockets/socketClient";
// import useAuthStore from "../../../store/authStore";

// const TypingBox = ({ roomId,gameStarted, elapsedTime, onFinish, targetCode }) => {
//   // const targetCode = `let timer = setInterval(() => {
//   //       this.counter--;
        
//   //       if (this.counter === 0) {
//   //         clearInterval(timer);
//   //         this.onTimeUp();
//   //       }
//   //     }, 1000);`;

//   if (!targetCode) {
//     return (
//       <div className="w-[93%] h-[96%] flex justify-center items-center bg-[#110429] rounded-2xl border-4 border-cyan-400 text-white text-xl animate-pulse">
//         코드 불러오는 중...
//       </div>
//     );
//   }

//   const inputRef = useRef(null);

//   const lines = targetCode.split("\n"); // 줄 단위로 분리
//   const [currentLine, setCurrentLine] = useState(0);  // 현재 타이핑해야할 인덱스
//   const [userInput, setUserInput] = useState(""); // 사용자 입력 문자
//   const [shake, setShake] = useState(false);  // 오타 입력창 흔들기 모션

//   const codeContainerRef = useRef(null);

//   const currentLineText = lines[currentLine] ?? ""; // 현재 입력한 줄 원본
//   const trimmedCurrentLine = currentLineText.trimStart(); // 현재 줄에서 들여쓰기 제거 문자(비교용)
//   const trimmedUserInput = userInput.trimStart();

//   const isCorrect = trimmedCurrentLine.startsWith(trimmedUserInput); // 현재 입력 맞게 입력되고있는지(줄 앞 공백 무시시)
//   const nickname = useAuthStore((state) => state.user?.nickname);
//   const totalLength = targetCode.replace(/\s/g, "").length;  // 전체 코드(공백 제외)



  
//   useEffect(() => {
//     if (inputRef.current) {
//       inputRef.current.focus(); // 자동 포커스
//     }
//   }, []);
  
//   // 사용자 입력값 업뎃
//   const handleInputChange = (e) => {
//     if (!gameStarted) return;  // 게임 시작 전 입력 막기
//     setUserInput(e.target.value);
//   };

//   const handleKeyDown = (e) => {
//     if (!gameStarted) {
//       e.preventDefault(); // 게임 시작 전이면 엔터 막기
//       return;
//     }

//     if (e.key === "Enter") {
//       if (trimmedUserInput === trimmedCurrentLine) {
//         if (currentLine === lines.length - 1) {
//             onFinish?.(); // ✅ 부모에게 "끝났어!" 신호
//           }
//         setCurrentLine((prev) => prev + 1); // 다음 줄 이동
//         setUserInput("");  // 입력창 초기화
//       } else {
//         setShake(true);
//         setTimeout(() => setShake(false), 500);
//       }
//       e.preventDefault(); // 기본 enter 줄바꿈 막기기
//     }
//   };

//   useEffect(() => {
//     if (codeContainerRef.current && currentLine > 0) {
//       const lineHeight = 28; // 예를 들어 한 줄 높이 28px (tailwind leading-relaxed 기준)
//       codeContainerRef.current.scrollTop += lineHeight;
//     }
//   }, [currentLine]);

//   const minutes = Math.floor(elapsedTime / 60000);
//   const seconds = Math.floor((elapsedTime % 60000) / 1000);
//   const milliseconds = Math.floor((elapsedTime % 1000));

//   const elapsedTimeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;


//   // 코드 타자 진행도 소켓 emit
//   const prevProgressRef = useRef(0);

// useEffect(() => {
//   if (!gameStarted || !targetCode) return;

//   const socket = getSocket();
//   if (!socket || !nickname || !roomId) return;

//   // 전체 정답 문자열 (공백 제거)
//   const cleanTarget = targetCode.replace(/\s/g, "");
//   const cleanTyped = (lines.slice(0, currentLine).join("\n") + userInput).replace(/\s/g, "");

//   // 몇 글자까지 정확히 맞았는지 확인
//   let correctCount = 0;
//   for (let i = 0; i < cleanTyped.length; i++) {
//     if (cleanTyped[i] === cleanTarget[i]) {
//       correctCount++;
//     } else {
//       break;
//     }
//   }

//   const progressPercent = Math.floor((correctCount / cleanTarget.length) * 100);

//   // 이전보다 높을 때만 emit
//   if (progressPercent > prevProgressRef.current) {
//     prevProgressRef.current = progressPercent;

//     socket.emit("progress_update", {
//       roomId,
//       nickname,
//       progressPercent,
//     });
//   }
// }, [userInput, currentLine]);



//   return (
//     <div className="w-[93%] h-[96%] p-4 bg-[#110429] rounded-2xl border-4 border-cyan-400 relative flex flex-col">
//       {/* Round 표시 */}
//       <div className="absolute top-[-14px] left-6 bg-cyan-400 text-black px-3 py-1 rounded-lg text-m z-20">
//         Round 1
//       </div>

//       {/* 코드 + 입력창 */}
//       <div className="flex-1 flex flex-col justify-between overflow-hidden p-4">
//         <div 
//         ref={codeContainerRef}
//         className="flex-1 min-h-[125px] overflow-y-auto custom-scrollbar">

//             {/* 🕒 타이머 표시 */}
//             <div className="absolute top-4 right-12 bg-black bg-opacity-80 text-white px-3 py-2 rounded-full border border-white text-lg">
//             ⏱ {elapsedTimeFormatted}
//             </div>

//           <pre className="text-left whitespace-pre-wrap font-mono text-base leading-relaxed break-words text-lg">
//           {lines.map((line, idx) => {
//             if (idx === currentLine) {
//                 // 현재 입력 중인 줄
//                 const originalIndent = currentLineText.length - trimmedCurrentLine.length;
//                 const indentSpaces = currentLineText.slice(0, originalIndent);
//                 const content = trimmedCurrentLine;

//     return (
//       <div key={idx} className="flex items-center">
//         <span className="text-white">{indentSpaces}</span>
//         {content.split("").map((char, cidx) => {
//           let color = "text-white";
//           if (cidx < trimmedUserInput.length) {
//             color = trimmedUserInput[cidx] === char ? "text-green-400" : "text-red-400";
//           }
//           return (
//             <span key={cidx} className={color}>
//               {char}
//             </span>
//           );
//         })}
//         <img src={enterIcon} alt="enter" className="w-5 h-5 ml-2" />
//       </div>
//     );
//   } else {
//     // 완료되었거나 아직 입력 안한 줄
//     const textColor = idx < currentLine ? "text-green-400" : "text-gray-400";
//     return (
//       <div key={idx} className={`flex items-center ${textColor}`}>
//         <span>{line}</span>
//         <img src={enterIcon} alt="enter" className="w-6 h-6 ml-2" />
//       </div>
//             );
//         }
//         })}

//           </pre>
//         </div>

//         {/* 입력창 */}
//         <input
//           ref={inputRef}
//           type="text"
//           spellCheck={false}
//           value={userInput}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           placeholder="Start Typing Code Here."
//           onFocus={(e) => (e.target.placeholder = "")} 
//           onBlur={(e) => (e.target.placeholder = "Start Typing Code Here.")}
//           className={`w-full mt-1 px-4 py-2 rounded-md text-black focus:outline-none 
//           ${isCorrect ? "border-4 border-green-400" : "border-4 border-red-400"}
//           ${shake ? "animate-shake" : ""}`}
//         />
//       </div>
//     </div>
//   );
// };

// export default TypingBox;


import { useState, useRef, useEffect } from "react";
import enterIcon from "../../../assets/images/multi_enter_icon.png";
import { getSocket } from "../../../sockets/socketClient";
import useAuthStore from "../../../store/authStore";
import '../../../styles/single/SinglePage.css';

const TypingBox = ({ 
  roomId, 
  gameStarted, 
  elapsedTime, 
  onFinish, 
  targetCode,
  currentRound,
  disabled = false
}) => {
  if (!targetCode) {
    return (
      <div className="w-[93%] h-[96%] flex justify-center items-center bg-[#110429] rounded-2xl border-4 border-cyan-400 text-white text-xl animate-pulse">
        코드 불러오는 중...
      </div>
    );
  }

  const inputRef = useRef(null);
  const lines = targetCode.split("\n");
  const [currentLine, setCurrentLine] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [shake, setShake] = useState(false);
  const codeContainerRef = useRef(null);

  const currentLineText = lines[currentLine] ?? "";
  const trimmedCurrentLine = currentLineText.trimStart();
  const trimmedUserInput = userInput.trimStart();
  const isCorrect = trimmedCurrentLine.startsWith(trimmedUserInput);
  const nickname = useAuthStore((state) => state.user?.nickname);
  const currentLineRef = useRef(null);
  const preContainerRef = useRef(null);


  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    if (disabled || !gameStarted) return;
    setUserInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (disabled || !gameStarted) {
      e.preventDefault();
      return;
    }

    const socket = getSocket();

    // 오타율 소켓
    if (e.key === "Backspace") {
      // 오타 판단 로직
      const expectedChar = trimmedCurrentLine[trimmedUserInput.length - 1];
      const typedChar = trimmedUserInput[trimmedUserInput.length - 1];

      const isMistake = typedChar && typedChar !== expectedChar;

      if (isMistake && socket && nickname && roomId) {
        socket.emit("typo_occurred", {
          roomId,
          nickname
        });
        console.log("👿 typo_occurred_emit", roomId, nickname);
      }
    }

    if (e.key === "Enter") {
      if (trimmedUserInput === trimmedCurrentLine) {
        const isLastLine = currentLine === lines.length - 1;
    
        if (isLastLine) {
          const socket = getSocket();
          if (socket && nickname && roomId) {
            socket.emit("progress_update", {
              roomId,
              nickname,
              progressPercent: 100,
              time: elapsedTime,
            }); // ✅ time 보내는 유일한 위치
          }
    
          onFinish?.(); // 게임 종료 처리
        }
    
        setCurrentLine((prev) => prev + 1);
        setUserInput("");
        codeContainerRef.current.scrollLeft = 0;
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    
      e.preventDefault();
    }
  };
    

  useEffect(() => {
    // if (currentLineRef.current) {
    //   currentLineRef.current.scrollIntoView({
    //     behavior: 'smooth',
    //     block: 'nearest',
    //   });
    // }
    if (preContainerRef.current) {
      const lineElements = preContainerRef.current.querySelectorAll('.codeLine');
  
      if (lineElements[currentLine]) {
        const lineHeight = lineElements[currentLine].getBoundingClientRect().height || 28;
        const offset = lineHeight * currentLine;
  
        preContainerRef.current.scrollTop = offset;  // 줄 위치에 맞춰 스크롤
        preContainerRef.current.scrollLeft = 0;       // 가로 스크롤 초기화
      }
    }
  }, [currentLine]);
  

  const minutes = Math.floor(elapsedTime / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  const milliseconds = Math.floor((elapsedTime % 1000));
  const elapsedTimeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(3, "0")}`;

  const prevProgressRef = useRef(0);

  // useEffect(() => {
  //   if (!gameStarted || !targetCode) return;

  //   const socket = getSocket();
  //   if (!socket || !nickname || !roomId) return;

  //   const cleanTarget = targetCode.replace(/\s/g, "");
  //   const cleanTyped = (lines.slice(0, currentLine).join("\n") + userInput).replace(/\s/g, "");

  //   let correctCount = 0;
  //   for (let i = 0; i < cleanTyped.length; i++) {
  //     if (cleanTyped[i] === cleanTarget[i]) {
  //       correctCount++;
  //     } else {
  //       break;
  //     }
  //   }

  //   const progressPercent = Math.floor((correctCount / cleanTarget.length) * 100);

  //   if (progressPercent > prevProgressRef.current) {
  //     prevProgressRef.current = progressPercent;
  
  //     // const payload = {
  //     //   roomId,
  //     //   nickname,
  //     //   progressPercent,

  //     // };
  
  //     // // 100%일 때만 time 추가
  //     // if (progressPercent === 100 && currentLine === lines.length - 1 && trimmedUserInput === trimmedCurrentLine) {
  //     //   payload.time = elapsedTime;
  //     // }
      
  //     // console.log("🍳progress_update : ", payload);
  //     socket.emit("progress_update",       
  //       {roomId,
  //       nickname,
  //       progressPercent});
  //   }
  // }, [userInput, currentLine]);
  useEffect(() => {
    if (!gameStarted || !targetCode) return;
  
    const socket = getSocket();
    if (!socket || !nickname || !roomId) return;
  
    const cleanTarget = targetCode.replace(/\s/g, "");
    const cleanTyped = (lines.slice(0, currentLine).join("\n") + userInput).replace(/\s/g, "");
  
    let correctCount = 0;
    for (let i = 0; i < cleanTyped.length; i++) {
      if (cleanTyped[i] === cleanTarget[i]) {
        correctCount++;
      } else {
        break;
      }
    }
  
    let progressPercent = Math.floor((correctCount / cleanTarget.length) * 100);
  
    // ✅ 마지막 줄에서 엔터 안 친 경우 100% 막기
    const isOnLastLine = currentLine === lines.length - 1;
    const isLastLineFullyTyped = trimmedUserInput === trimmedCurrentLine;
  
    if (progressPercent === 100 && isOnLastLine && isLastLineFullyTyped) {
      // 아직 엔터 안 쳤으므로 막음 (진행률은 99까지만)
      return;
    }
  
    // ✅ emit 조건
    if (progressPercent > prevProgressRef.current && progressPercent < 100) {
      prevProgressRef.current = progressPercent;
  
      socket.emit("progress_update", {
        roomId,
        nickname,
        progressPercent,
      });
    }
  }, [userInput, currentLine]);
  

  useEffect(() =>{
        
    const container = preContainerRef.current;
    const cursorEl = currentLineRef.current?.querySelector('.cursor');   
    if ( container && cursorEl) {

        const containerRect = container.getBoundingClientRect();
        const cursorRect = cursorEl.getBoundingClientRect();

        const padding = 50; // 커서가 오른쪽으로 50px 남았을 때 스크롤 하기

         // 커서가 너무 오른쪽에 가까워졌는지 확인
        
         if (cursorRect.right > containerRect.right - padding) {
            // 오른쪽으로 약간 스크롤
            container.scrollLeft += 400;
        }

        // 커서가 왼쪽 밖으로 밀린 경우 (역방향 처리도 가능)
        if (cursorRect.left < containerRect.left + 20) {
            container.scrollLeft -= 400;
        }
    }
    console.log(userInput);
  }, [userInput])

  

  return (
    <div className="w-[93%] h-[97%] p-2 bg-[#110429] rounded-2xl border-4 border-cyan-400 relative flex flex-col">
      <div className="absolute top-[-14px] left-6 bg-cyan-400 text-black px-3 py-1 rounded-lg text-m z-20">
        Round {currentRound}
      </div>

      <div className="flex-1 flex flex-col justify-between overflow-hidden p-2">
        {/* <div className="flex-1 min-h-[130px] overflow-y-auto overflow-x-auto custom-scrollbar"> */}
        <div  ref={codeContainerRef} className="flex-1 min-h-[130px] overflow-y-auto overflow-x-auto custom-scrollbar">
          <div className="absolute -top-6 right-8 bg-black text-white px-3 py-2 rounded-full border border-white text-lg">
            ⏱ {elapsedTimeFormatted}
          </div>

          <pre ref={preContainerRef} className="overflow-auto w-full h-[90%] p-4 text-xl custom-scrollbar mb-2">
            <code>
              {lines.map((line, idx) => {
                const normalizedInput = userInput.split('');
                const isCurrent = idx === currentLine;
                const indent = line.length - line.trimStart().length;
                const indentSpaces = line.slice(0, indent);
                const content = line.trimStart();

                return (
                  <div key={idx} className="codeLine max-h-[28px]"
                  ref={isCurrent ? currentLineRef : null}
                  >
                    {/* 들여쓰기 공백 렌더 */}
                    <span>
                      {indentSpaces.split('').map((_, i) => (
                        <span key={i}>&nbsp;</span>
                      ))}
                    </span>

                    {isCurrent ? (
                        <>
                          {content.split('').map((char, i) => {
                            const inputChar = normalizedInput[i];
                            const isCursor = i === normalizedInput.length;
                            let className = '';

                            if (inputChar == null) className = 'pending currentLine';
                            else if (inputChar === char) className = 'typed currentLine';
                            else className = 'wrong currentLine';

                            return (
                              <span key={i} className="cursor-container">
                                {isCursor && <span className="cursor" />}
                                <span className={className}>{char === ' ' ? '\u00A0' : char}</span>
                              </span>
                            );
                          })}
                          <img src={enterIcon} alt="enter" className="inline-block w-5 h-5 ml-2" />
                        </>
                      ) : idx < currentLine ? (
                        <>
                          <span>
                            {line.split('').map((char, i) => (
                              <span key={i} className="typed">{char}</span>
                            ))}
                          </span>
                          <img src={enterIcon} alt="enter" className="inline-block w-5 h-5 ml-2" />
                        </>
                      ) : (
                        <>
                          <span>
                            {line.split('').map((char, i) => (
                              <span key={i} className="pending">{char}</span>
                            ))}
                          </span>
                          <img src={enterIcon} alt="enter" className="inline-block w-5 h-5 ml-2" />
                        </>
                      )}
                    </div>
                );
              })}
            </code>
          </pre>


        </div>

        <input
          ref={inputRef}
          type="text"
          spellCheck={false}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Start Typing Code Here."
          disabled={disabled}
          onFocus={(e) => (e.target.placeholder = "")}
          onBlur={(e) => (e.target.placeholder = "Start Typing Code Here.")}
          className={`input w-full px-4 py-2 rounded-md text-black focus:outline-none 
            ${isCorrect ? "border-4 border-green-400" : "border-4 border-red-400"}
            ${shake ? "animate-shake" : ""}`}
        />
      </div>
    </div>
  );
};

export default TypingBox;
