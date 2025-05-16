// import { useRef, useState } from "react";

// const SingleTypingBox = () => {

//     // 코드 입력 관련 상태관리
//     const [rawCode, setRawCode] = useState(""); // API 받은 순수 코드
//     const [lines, setLines] = useState([]);
//     const [currentLineIndex, setCurrentLineIndex] = useState(0);
//     const [currentInput, setCurrentInput] = useState(""); //사용자가 입력한 문자열
//     const [wrongChar, setWrongChar] = useState(false); // 현재까지 입력한 input중에 틀림 존재 여부 상태 관리
//     const [shake, setShake] = useState(false);  // 오타 입력창 흔들기 모션션

//     // 포커스 관련 상태관리
//     const inputAreaRef = useRef(null);
//     const [isFocused, setIsFocused] = useState(false);


//     // 시간 및 달성률 상태관리
//     const [startTime, setStartTime] = useState(null);
//     const [elapsedTime, setElapsedTime] = useState(0);
//     const [isStarted, setIsStarted] = useState(false);

//     const [progress, setProgress] = useState(0);

//     // 전체 타이핑한 글자수 상태관리
//     const [totalTypedChars, setTotalTypedChars] = useState(0);
//     const [cpm, setCpm] = useState(0);

//     // 완료 상태 관리
//     const [isFinished, setIsFinished] = useState(false);

//     // 자동으로 내려가게게
//     const codeContainerRef = useRef(null);


//     useEffect(() => {
//         if (inputAreaRef.current) {
//             inputAreaRef.current.focus();
//         }
//     },[])

//     const normalizeLineReTab = (line) => {
//         // 앞뒤 공백과 탭을 제거
//         return line.trim().replace(/\t/g, ''); 
//     }

//     const getLanguageClass = (lang) => {
//         if (!lang) {
//             return '';
//         }
        
//         const lowerLang = lang.toLowerCase();

//         if (lowerLang === "java") return 'language-java';
//         else if (lowerLang === "python") return 'language-python';
//         else if (lowerLang === "js") return 'language-javascript';
//         else if (lowerLang === "sql") return 'language-sql';
//         else return '';
        
//     }


//     const handleKeyDown = (e) => {
    
//         if (!isStarted) {
//             setStartTime(Date.now())
//             setIsStarted(true);
//         }

//         const key = e.key;
        
//         if (key === 'Enter') {
//             e.preventDefault(); // 기본적으로 엔터줄바꾸는거 막기

//             const currentLine = lines[currentLineIndex];
//             const normalizedInput = normalizeLineReTab(currentInput);
//             const normalizedLine = normalizeLineReTab(currentLine);

//             if (normalizedInput === normalizedLine) { //다 맞게 쳤으면
//                 setCurrentLineIndex((prev) => prev + 1);
//                 setCurrentInput('');
                
//             } else { // 틀렸으면
//                 console.log('현재 줄을 정확히 입력하지 않음')
//                 setShake(true);
//                 setTimeout(() => setShake(false), 500);
//             }
//         }
//         else if (key === 'Tab') {
//             e.preventDefault(); //
//             // setCurrentInput((prev) => prev + '\t'); 일단 탭을 막아놓기
//         }

//         else if (key.length === 1){ //글자 입력하면
//             setCurrentInput((prev) => {
//                 const newInput = prev + key;

//                 const normalizedLine = normalizeLineReTab(lines[currentLineIndex]);
//                 const nextChar = normalizedLine[newInput.length - 1];

//                 // 현재까지 입력한 값과 정답을 비교하여 틀린 글자가 있는지 확인
//                 const hasWrongChar = normalizedLine.slice(0, newInput.length) !== newInput;
//                 setWrongChar(hasWrongChar); // 틀린 글자가 있으면 빨간 테두리 유지

//                 if (key === nextChar) {
//                     setTotalTypedChars(prev => prev + 1);
//                 } 

//                 return newInput;
//             })

//         }
//         else if (key === 'Backspace') //백스페이스 누르면 지우기
//             setCurrentInput((prev) => prev.slice(0,-1));
//     };

//     useEffect(() => {
//         let timer;

//         if (isStarted && !isFinished) {
//             timer = setInterval(() => {
//                 setElapsedTime(Date.now() - startTime);
//             }, 10);
//         }

//         return () => {
//             if (timer) clearInterval(timer);
//         };
        
//     }, [isStarted, startTime, isFinished])


//     return(
//         <div className="flex-1 h-[50%] border-4 rounded-xl text-xl px-4 pt-2 focus:outline-none"
//             ref={inputAreaRef}
//             onFocus={() => setIsFocused(true)}
//             onBlur={() => setIsFocused(false)}
//             tabIndex={0}
//             onKeyDown={handleKeyDown}
//             style={{
//                 backgroundColor: '#1C1C1C',
//                 borderColor: '#51E2F5',
//             }}
//         >
//             <pre 
//                 ref={codeContainerRef}
//                 className="overflow-auto w-full h-[85%] whitespace-pre-wrap p-4 text-xl custom-scrollbar">
//                 {/* <code
//                     className="hljs"
//                     dangerouslySetInnerHTML={{ __html: highlightedCode }}
//                 /> */}
//                 <code className={getLanguageClass(lang)}>
//                     {lines.map((line, idx) => {
//                         //line앞에 tab이 있는지 확인하는 메서드로 있는만큼 현재줄에 탭 넣어주게 할 예정
//                         const normalizedInput = normalizeLineReTab(currentInput);
                        
//                         const normalizedLineReTab = normalizeLineReTab(line);
//                         const lineWithSpace = getLeadingWhitespaceCount(line);
//                         return (
//                             <div key={idx}>
//                                 {idx < currentLineIndex ? (
//                                     // 이미 완료 한 줄
//                                     <span className='typed'>{line}</span>
//                                 ) : idx === currentLineIndex ? (
//                                     // 현재 타이핑 중인 줄
//                                     // 여기에 공백 넣기 <span>으로 
                                    
//                                     <span>
//                                         {new Array(lineWithSpace).fill('\u00A0').map((_, spaceIndex) => (
//                                             <span key={spaceIndex}>&nbsp;</span> // 탭 크기만큼 공백 추가
//                                         ))}
//                                         { normalizedLineReTab.split('').map((char,i) => {
//                                             const inputChar = normalizedInput[i];
//                                             let className = '';
//                                             if (inputChar == null) {
//                                                 className = 'pending currentLine';
//                                             } else if (inputChar === char) {
//                                                 className = 'typed currentLine';
//                                             } else {
//                                                 className = 'wrong currentLine';
//                                             }
//                                             return (
//                                                 <span key={i} className={className}> 
//                                                     {char === ' ' ? '\u00A0' : char}                        
//                                                 </span>
//                                             );
//                                         })}
//                                     </span>
//                                 ) : (
//                                     // 아직 안친줄
//                                     <span className="pending">{line}</span>
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </code>
//             </pre>
//             {/* 유저가 타이핑한 코드가 보이는 곳 */}
//             <div className={`flex items-center bg-white text-black rounded-2xl w-full h-[12%] p-2 border-4 ${wrongChar ?  'border-red-400' :'border-green-400'} ${shake ? "animate-shake" : ""}`}>
//                 <pre className="w-full h-full whitespace-pre-wrap text-xl flex items-center"
//                     placeholder="Start Typing Code Here."
//                 >
//                     {currentInput.split('').map((char, idx) => (
//                     <span key={idx} className='currentInput'>
//                       {char === '\t' ? '\u00A0\u00A0\u00A0\u00A0' : char}
//                     </span>
//                     ))}
//                     {/* 커서 */}
//                     {isFocused && <span className="blinking-cursor currentInput">|</span>}
//                 </pre>
//             </div>
//         </div>
//     )
// };

// export default SingleTypingBox;
