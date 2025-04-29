// import backgroundImg from '../../assets/images/single_background.jpg'
// import box from '../../assets/images/board1.jpg'
// import logo from '../../assets/images/logo.png'
// import pythonImg from '../../assets/images/python.png'
// import javaImg from '../../assets/images/Java.png'
// import cImg from '../../assets/images/C.png'
// import csImg from '../../assets/images/CS.png'
// import sqlImg from '../../assets/images/SQL.png'
// import Keyboard from '../../components/keyboard/Keyboard'
// import Header from "../../components/common/Header"

// import authApi from "../../api/authAxiosConfig"
// import { getAccessToken } from "../../utils/tokenUtils";
// import { useNavigate, useParams } from 'react-router-dom'
// import { useEffect, useState, useRef } from 'react'

// import hljs from 'highlight.js/lib/core';
// import javascript from 'highlight.js/lib/languages/javascript';
// import java from 'highlight.js/lib/languages/java';
// import python from 'highlight.js/lib/languages/python';
// import sql from 'highlight.js/lib/languages/sql';
// import 'highlight.js/styles/atom-one-dark.css';
// import '../../styles/single/SinglePage.css';

// // 등록
// hljs.registerLanguage('java', java);
// hljs.registerLanguage('python', python);
// hljs.registerLanguage('javascript', javascript);
// hljs.registerLanguage('sql', sql);

// import { calculateWPM, calculateCPM, getSpeedProgress, getProgress } from '../../utils/typingUtils';
// import { formatTime } from '../../utils/formatTimeUtils'
// import FinishPage from '../single/modal/FinishPage';

// const SinglePage = () => {

//     const navigate = useNavigate();
//     const { lang } = useParams();

//     // 코드 입력 관련 상태관리
//     const [rawCode, setRawCode] = useState(""); // API 받은 순수 코드
//     // const [highlightedCode, setHighlightedCode] = useState(""); // 하이라이트된 HTML 코드 안써도 될듯 이거
//     const [lines, setLines] = useState([]);
//     const [currentLineIndex, setCurrentLineIndex] = useState(0);
//     const [currentInput, setCurrentInput] = useState(""); //사용자가 입력한 문자열
//     const [wrongChar, setWrongChar] = useState(false); // 현재까지 입력한 input중에 틀림 존재 여부 상태 관리
//     const [shake, setShake] = useState(false);  // 오타 입력창 흔들기 모션션

//     // 포커스 관련 상태관리
//     const inputAreaRef = useRef(null);
//     const [isFocused, setIsFocused] = useState(false);

//     // 언어별 캐릭터 이미지
//     const [langImg, setLangImg] = useState(null) 

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

//     useEffect(() => {
//         if (inputAreaRef.current) {
//             inputAreaRef.current.focus();
//         }
//     },[])

//     useEffect(() => {
//         const accessToken = getAccessToken();
//         // console.log(accessToken)
//         if (!accessToken) {
//             alert("로그인이 필요합니다");
//             navigate("/auth/login");
//         }
//     }, [navigate]);

//     useEffect(() => {
//         if (lang) {
//             getLangImg(lang);
//             authApi.get('/api/single/code', {params: {language: lang.toUpperCase()}})
//                 .then(res => {
//                     console.log("api 결과", res.data)
//                     const code = res.data.content.content
//                     setRawCode(code)

//                     // let langForHLJS = getLangForHLJS(lang);

//                     // if (langForHLJS) {
//                     //     const highlighted = hljs.highlight(code, { language: langForHLJS }).value;
//                     //     setHighlightedCode(highlighted);
//                     // } else {
//                     //     setHighlightedCode(code); // CS처럼 하이라이트 필요 없는 경우
//                     // }
                    
//                  })
//                 .catch(e => {
//                     console.error("api 요청 실패:" , e)
//                 })
//         }
//     },[lang])

//     // const getLangForHLJS = (lang) => {
//     //     if (!lang) {
//     //         return '';
//     //     }
        
//     //     const lowerLang = lang.toLowerCase();

//     //     if (lowerLang === "java") return 'java';
//     //     else if (lowerLang === "python") return 'python';
//     //     else if (lowerLang === "js") return 'javascript';
//     //     else if (lowerLang === "sql") return 'sql';
//     //     else return '';
        
//     // }

//     useEffect(() => { //줄 단위로 나누기
//         console.log(rawCode);
//         // setLines(rawCode.split('\n')); 
//         setLines(rawCode.split('\n').filter(line => line.trim() !== '')); // 양쪽에 빈 공백이 있음

//     }, [rawCode]);

//     const normalizeLine = (line) => {
//         const tabSize = 4;
//         return line.replace(/\t/g, ' '.repeat(tabSize))
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
//             const normalizedInput = normalizeLine(currentInput);
//             const normalizedLine = normalizeLine(currentLine);

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
//             setCurrentInput((prev) => prev + '\t');
//         }

//         else if (key.length === 1){ //글자 입력하면
//             // setCurrentInput((prev) => prev +key)
//             setCurrentInput((prev) => {
//                 const newInput = prev + key;

//                 const normalizedLine = normalizeLine(lines[currentLineIndex]);
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

//     const getLangImg = (lang) => {
//         if (lang === "java") setLangImg(javaImg);
//         else if (lang === "python") setLangImg(pythonImg);
//         else if (lang === "c") setLangImg(cImg);
//         else if (lang === "sql") setLangImg(sqlImg);
//         else setLangImg(csImg);
//     }

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

//     useEffect(() => {
//         setCpm(calculateCPM(totalTypedChars, elapsedTime / 1000 ))
//     }, [elapsedTime])

//     useEffect(() => {
//         setProgress(getProgress(currentLineIndex, lines.length))

//         if( lines.length > 0 && currentLineIndex == lines.length) {
//             setIsFinished(true);
//         }
//     }, [currentLineIndex])


//     return (
//         <div className="w-screen h-screen flex flex-col items-center justify-center bg-no-repeat bg-cover bg-center"
//             style={{ backgroundImage: `url(${backgroundImg})`}}
//         >
//             <Header/>
//             {/* 타자게임 박스 */}
//             <div className='relative mt-20'>
//                 <img src={box} alt="타자게임 박스" className="w-[70vw] max-w-5wl h-auto rounded-2xl"/>

//                 <img src={logo} alt="로고" className="absolute -top-[90px] left-1/2 -translate-x-1/2 w-[20vw] max-w-[300px] h-auto z-10"/>


//                 {/* 콘텐츠 박스들 */}
//                 <div className="absolute top-0 left-0 w-full h-full flex gap-4 z-10 px-24 py-24">
//                     {/* 왼쪽 컨텐츠 영역 */}
//                     <div className="flex flex-col flex-1 gap-4">
//                         <div className="flex-1 border-4 rounded-xl text-xl px-4 focus:outline-none"
//                             ref={inputAreaRef}
//                             onFocus={() => setIsFocused(true)}
//                             onBlur={() => setIsFocused(false)}
//                             tabIndex={0}
//                             onKeyDown={handleKeyDown}
//                             style={{
//                                 backgroundColor: '#1C1C1C',
//                                 borderColor: '#51E2F5',
//                             }}
//                         >
//                             <pre className="overflow-auto w-full h-[85%] whitespace-pre-wrap pt-2 text-xl custom-scrollbar">
//                                 {/* <code
//                                     className="hljs"
//                                     dangerouslySetInnerHTML={{ __html: highlightedCode }}
//                                 /> */}

//                                 <code className={getLanguageClass(lang)}>
//                                     {lines.map((line, idx) => {

//                                         const normalizedLine = normalizeLine(line);
//                                         const normalizedInput = normalizeLine(currentInput);
//                                         return (
//                                             <div key={idx}>
//                                                 {idx < currentLineIndex ? (

//                                                     // 이미 완료 한 줄
//                                                     <span className='typed'>{line}</span>
//                                                 ) : idx === currentLineIndex ? (

//                                                     // 현재 타이핑 중인 줄
//                                                     <span>
//                                                         { normalizedLine.split('').map((char,i) => {
//                                                             const inputChar = normalizedInput[i];
//                                                             let className = '';

//                                                             if (inputChar == null) {
//                                                                 className = 'pending currentLine';
//                                                             } else if (inputChar === char) {
//                                                                 className = 'typed currentLine';
//                                                             } else {
//                                                                 className = 'wrong currentLine';
//                                                             }

//                                                             return (
//                                                                 <span key={i} className={className}> 
//                                                                     {char === ' ' ? '\u00A0' : char}                        
//                                                                 </span>
//                                                             );
//                                                         })}
//                                                     </span>

//                                                 ) : (
//                                                     // 아직 안친줄
//                                                     <span className="pending">{line}</span>
//                                                 )}
//                                             </div>
//                                         );
//                                     })}
//                                 </code>
//                             </pre>


//                             {/* 유저가 타이핑한 코드가 보이는 곳 */}
//                             <div className={`flex items-center bg-white text-black rounded-2xl w-full h-[12%] p-2 border-4 ${wrongChar ?  'border-red-400' :'border-green-400'} ${shake ? "animate-shake" : ""}`}>
//                                 <pre className="w-full h-full whitespace-pre-wrap text-xl flex items-center"
//                                     placeholder="Start Typing Code Here."
//                                 >
//                                     {currentInput.split('').map((char, idx) => (
//                                     <span key={idx} className='currentInput'>
//                                       {char === '\t' ? '\u00A0\u00A0\u00A0\u00A0' : char}
//                                     </span>
//                                     ))}
//                                     {/* 커서 */}
//                                     {isFocused && <span className="blinking-cursor currentInput">|</span>}
//                                 </pre>
//                             </div>

//                         </div>
                        
//                         <div className="flex-1 border-4 rounded-xl max-h-[180px] text-white p-2 flex justify-center"
//                             style={{
//                                 borderColor: '#51E2F5'
//                             }}
//                         >
//                             <Keyboard/>
                        
//                         </div>
//                     </div>

//                     {/* 오른쪽 콘텐츠 박스 */}
//                     <div className="w-[20%] max-h-full border-4 rounded-xl text-white text-center p-2 "
//                         style={{
//                             borderColor: '#51E2F5'
//                         }}
//                     >
//                         {/* 캐릭터 */}
//                         <div className="w-full flex flex-col items-center gap-3 text-white text-center">

//                             <img 
//                                 src={langImg}
//                                 alt="캐릭터"
//                                 className="w-full rounded-xl border-2"
//                                 style={{ borderColor : '#51E2F5'}} 
//                             />
//                         </div>

//                         {/* 시간 */}
//                         <div className="text-2xl mt-2 font-bold">시간</div>
//                         <div className="w-full py-2 rounded-xl border-2 text-2xl"
//                             style={{ borderColor: "#51E2F5"}}    
//                         >
//                             {formatTime(elapsedTime)}
//                         </div>

//                         {/* 타수 */}
//                         {/* <div className="text-2xl mt-2 font-bold">타수</div>
//                         <div className="w-full py-2 rounded-xl border-2 font-bold text-2xl"
//                             style={{ borderColor: "#51E2F5"}}    
//                         >
//                             {cpm}
//                         </div> */}

//                         <div className="w-full py-2 text-2xl mt-4"
//                             style={{ borderColor: "#51E2F5"}}    
//                         >
//                             타수 : {cpm}
//                         </div>

//                         {/* 기본 흐릿한 배경 */}
//                         <div className="w-full h-4 rounded-md"
//                             style={{
//                                 background: `linear-gradient(
//                                     to right,
//                                     rgba(81, 226, 245, 1) ${getSpeedProgress(cpm)}%, 
//                                     rgba(81, 226, 245, 0.3) ${getSpeedProgress(cpm)}%
//                                   )`,
//                                   transition: 'background 0.3s ease',
//                                   borderColor: '#51E2F5'
//                             }}
//                         />

//                         {/* 진행률 바 */}
//                         <div className="w-full h-8 rounded-xl overflow-hidden mt-8 border-2"
//                             style={{ 
//                                 borderColor: '#51E2F5'
                                
//                             }}
//                         >
//                             <div className="w-full h-full"
//                                 style={{ 
//                                     borderColor: "#51E2F5",
//                                     backgroundColor: "#51E2F5",
//                                     width: `${progress}%`
//                                 }}
//                             >
//                             </div>
//                         </div>
                        
//                         <div className="text-2xl w-full mt-4">진행률: {progress}%</div>

//                     </div>
//                 </div>
//             </div>

//             {isFinished && (
//                 <div className="absolute inset-0 flex items-center justify-center z-50">
//                     <FinishPage
//                         lang = {lang}
//                         cpm = {cpm}
//                         elapsedTime = {elapsedTime}
//                         isCS = {lang === 'cs'}
//                     />
//                 </div>
//             )}
//         </div>
//     )
// };

// export default SinglePage