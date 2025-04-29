// import { useRef, useState } from "react";

// const SingleTypingBox = () => {

//     // 포커스 관련 상태관리
//         const inputAreaRef = useRef(null);
//         const [isFocused, setIsFocused] = useState(false);

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
