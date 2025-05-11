import backgroundImg from '../../assets/images/single_background.jpg'
import box from '../../assets/images/board1_cut.jpg'
import logo from '../../assets/images/logo.png'
import Keyboard from '../../components/keyboard/Keyboard'


import { getAccessToken } from "../../utils/tokenUtils";
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/atom-one-dark.css';
import '../../styles/single/SinglePage.css';
import ProgressBox from '../../components/single/ProgressBox'

import { calculateCPM, getProgress, processCode, compareInputWithLineEnter, compareInputWithLine, calculateCurrentLineTypedChars } from '../../utils/typingUtils';
import FinishPage from '../single/modal/FinishPage';

import { singleCsCode, singleLangCode, getLangCode } from '../../api/singleApi'

// 등록
hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('sql', sql);


const SinglePage = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const category = query.get('category') // "DATABASE", "NETWORK", "OS", "DATA_STRUCTURE", "COMPUTER_STRUCTURE"
    const { lang } = useParams();


    // 코드 입력 관련 상태관리
    // const [highlightedCode, setHighlightedCode] = useState(""); // 하이라이트된 HTML 코드 안써도 될듯 이거
    const [codeId, setCodeId] = useState(null);
    const [lines, setLines] = useState([]);
    const [linesCharCount, setlinesCharCount] = useState([]);
    const [space, setSpace] = useState([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentInput, setCurrentInput] = useState(""); //사용자가 입력한 문자열
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [wrongChar, setWrongChar] = useState(false); // 현재까지 입력한 input중에 틀림 존재 여부 상태 관리
    const [shake, setShake] = useState(false);  // 오타 입력창 흔들기 모션션

    // 포커스 관련 상태관리
    const inputAreaRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);


    // 시간 및 달성률 상태관리
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isStarted, setIsStarted] = useState(false);

    const [progress, setProgress] = useState(0);

    // 전체 타이핑한 글자수 상태관리
    const [totalTypedChars, setTotalTypedChars] = useState(0);
    const [cpm, setCpm] = useState(0);

    // 완료 상태 관리
    const [isFinished, setIsFinished] = useState(false);

    // 자동으로 내려가게
    const codeContainerRef = useRef(null);

    const [CScode, setCScode] = useState([]);
    const [isCs , setIsCs] = useState(false);

    useEffect(() => {
        if (inputAreaRef.current) {
            inputAreaRef.current.focus();
        }
    },[])

    useEffect(() => {
        const accessToken = getAccessToken();
        // console.log(accessToken)
        if (!accessToken) {
            alert("로그인이 필요합니다");
            navigate("/auth/login");
        }
    }, [navigate]);

    // 일단 다시시작하면 그코드 다시 시작
    const resetGame = () => {
        //setLines([]);                // 코드 줄 초기화
        //setlinesCharCount([]);       // 줄별 글자 수 초기화
        //setSpace([]);                // 공백 개수 초기화
        setCurrentLineIndex(0);      // 현재 줄 인덱스 초기화
        setCurrentInput("");         // 현재 입력 초기화
        setCurrentCharIndex(0);      // 현재 문자 인덱스 초기화
        setWrongChar(false);         // 오타 여부 초기화
        setShake(false);             // 흔들기 효과 초기화

        setStartTime(null);          // 시작 시간 초기화
        setElapsedTime(0);           // 경과 시간 초기화
        setIsStarted(false);         // 게임 시작 상태 초기화

        setProgress(0);              // 달성률 초기화
        setTotalTypedChars(0);       // 전체 타자 수 초기화
        setCpm(0);                   // 타자 속도 초기화

        setIsFinished(false);        // 완료 상태 초기화

        inputAreaRef.current?.focus();
    }

    useEffect(() => {
        if (lang) {
            if (lang === 'cs') {
                setIsCs(true);
                singleCsCode(category)
                    .then(data => {
                        setCScode(data);
                    })
                    .catch(e => {
                        // console.error("api 요청 실패:" , e)
                    })
            } else {
                setIsCs(false);
                singleLangCode(lang)
                // getLangCode(476) //476 : h만 있음
                    .then(data => {
                        // console.log("api 결과", data);            
                        const { lines , space, charCount } = processCode(data.content);
                        setCodeId(data.codeId);
                        setLines(lines);
                        setSpace(space);
                        setlinesCharCount(charCount)
                    })
                    .catch(e => {
                        // console.error("api 요청 실패:" , e)
                    })
                
            }

        }
    },[lang])

    useEffect(() => {
        if (!Array.isArray(CScode)) return;

        // console.log(CScode);
        // const allLines = CScode.map((item) => `${item.keyword} - ${item.content}`);
        //     setLines(allLines); // 하나의 배열로 상태 저장
        const allLines = CScode.map((item) => `${item.keyword} - ${item.content}`);
            setLines(allLines); // 하나의 배열로 상태 저장
    }, [CScode])

    const getLanguageClass = (lang) => {
        if (!lang) {
            return '';
        }
        
        const lowerLang = lang.toLowerCase();

        if (lowerLang === "java") return 'language-java';
        else if (lowerLang === "python") return 'language-python';
        else if (lowerLang === "js") return 'language-javascript';
        else if (lowerLang === "sql") return 'language-sql';
        else return '';
        
    }

    const handleKeyDown = (e) => {

        if (!isStarted) {
            setStartTime(Date.now())
            setIsStarted(true);
        }

        const key = e.key;

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') { // ctrl+V or commend + V 막기기
            e.preventDefault();
        }
        
        if (key === 'Enter') {
            e.preventDefault(); // 기본적으로 엔터줄바꾸는거 막기

            const currentLine = lines[currentLineIndex];
            const normalizedInput = currentInput.split('');

            if (compareInputWithLineEnter(normalizedInput, currentLine)) { //다 맞게 쳤으면
                setCurrentLineIndex((prev) => prev + 1); // 다음줄로 넘김
                setCurrentInput('');    // 입력창 리셋
                setCurrentCharIndex(0); // 현재 입력 위치 리셋셋
                
            } else { // 틀렸으면
                // console.log('현재 줄을 정확히 입력하지 않음')
                setShake(true);
                setTimeout(() => setShake(false), 500);
            }
        }
        else if (key === 'Tab') {
            e.preventDefault(); //
            // setCurrentInput((prev) => prev + '\t'); 일단 탭을 막아놓기
        }

        else if (key === 'Backspace') {
            if (currentCharIndex > 0) {
                setCurrentCharIndex((prev) => prev - 1); // 지운 글자만큼 currentCharIndex 감소
            }
        }
    };

    useEffect(() => {
        let timer;

        if (isStarted && !isFinished) {
            timer = setInterval(() => {
                setElapsedTime(Date.now() - startTime);
            }, 10);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
        
    }, [isStarted, startTime, isFinished])

    useEffect(() => {
        setCpm(calculateCPM(totalTypedChars, elapsedTime / 1000 ))
    }, [elapsedTime])

    useEffect(() => {
        setProgress(getProgress(currentLineIndex, lines.length))

        if( lines.length > 0 && currentLineIndex === lines.length) {
            setIsFinished(true);
        }

        if (codeContainerRef.current && currentLineIndex > 0) {
            // 코드의 각 줄을 가져옵니다.
            const lineElements = codeContainerRef.current.querySelectorAll('.codeLine');

            // 각 줄의 고정된 높이를 가져옵니다. 이 높이는 이미 max-h로 지정되어 있기 때문에 일정합니다.
            const lineHeight = lineElements[currentLineIndex]?.getBoundingClientRect().height || 28; // 한 줄의 높이 계산

            // 스크롤을 자동으로 내리기
            codeContainerRef.current.scrollTop += lineHeight;
            codeContainerRef.current.scrollLeft = 0; // 전줄에서 오른쪽 스클롤 한게 있으면 돌려야함
          }
    }, [currentLineIndex])

    useEffect(() =>{
        
        const container = codeContainerRef.current;
        const cursorEl = document.querySelector('.cursor');            
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
          
    }, [currentInput])

    const handleInputChange = (e) => {
        const value = e.target.value;
        setCurrentInput(value);

    };

    useEffect(()=> {
        updateTotalTypedChars();
    }, [currentInput, currentLineIndex])

    const updateTotalTypedChars = () => {
        let previousLinesChars = 0;
        for (let i = 0; i < currentLineIndex; i++) {
            previousLinesChars += linesCharCount[i] || 0;
        }
        
        // 현재 줄에서 올바르게 입력한 글자 수
        const currentLine = lines[currentLineIndex] || [];
        const currentLineChars = calculateCurrentLineTypedChars(currentInput, currentLine);
        // 전체 올바르게 입력한 글자 수 업데이트
        setTotalTypedChars(previousLinesChars + currentLineChars);
        
        // 현재 줄에 틀린 글자가 있는지 확인
        const hasWrongChar = compareInputWithLine(currentInput, currentLine);
        setWrongChar(hasWrongChar);
    }

    // useEffect(()=> {
    //     console.log(totalTypedChars);
    // }, [totalTypedChars])

    // useEffect(()=>{
    //     console.log(lines);
    // }, [lines])

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImg})`}}
        >
            {/* <Header/> */}
            {/* 타자게임 박스 */}
            <div className='relative mt-20 '>
                <img src={box} alt="타자게임 박스" className="w-[85vw] max-w-5wl h-auto rounded-2xl"/>

                <img src={logo} alt="로고" className="absolute -top-[50px] left-1/2 -translate-x-1/2 w-[12vw] max-w-[300px] h-auto z-10"/>


                {/* 콘텐츠 박스들 */}
                <div className="absolute top-0 left-0 w-full h-full flex gap-4 z-10 px-20 py-20">
                    {/* 왼쪽 컨텐츠 영역 */}
                    <div className="flex flex-col flex-1 gap-4 w-full h-full max-w-[80%]">
                        <div className="flex-1 w-full h-[30%] border-4 rounded-xl text-xl px-4 py-2 focus:outline-none"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            tabIndex={0}
                            onKeyDown={handleKeyDown}
                            style={{
                                backgroundColor: '#1C1C1C',
                                borderColor: '#51E2F5',
                            }}
                        >
                            <pre 
                                ref={codeContainerRef}
                                className="overflow-auto w-full h-[85%] p-4 text-xl custom-scrollbar mb-2">
                                {/* <code
                                    className="hljs"
                                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                                /> */}

                                <code className={`codeLine ${getLanguageClass(lang)}`}>
                                    {lines.map((line, idx) => {
                                        
                                        // 현재 줄을 이차원 배열에서 문자를 하나씩 가져오기
                                        const normalizedInput = currentInput.split('');
                                        const currentLine = line;

                                        const lineWithSpace = space[idx];

                                        return (
                                            <div key={idx} className='max-h-[28px]'>
                                                {idx < currentLineIndex ? (
                                                    // 이미 완료한 줄
                                                    <span>
                                                        {new Array(lineWithSpace).fill('\u00A0').map((_, spaceIndex) => (
                                                            <span key={spaceIndex}>&nbsp;</span>  // 탭 크기만큼 공백 추가
                                                        ))}
                                                        {line.map((char, i) => (
                                                            <span key={i} className='typed'>{char}</span>
                                                        ))}
                                                    </span>
                                                ) : idx === currentLineIndex ? (

                                                    // 현재 타이핑 중인 줄
                                                    
                                                    <span>
                                                        {new Array(lineWithSpace).fill('\u00A0').map((_, spaceIndex) => (
                                                            <span key={spaceIndex}>&nbsp;</span>  // 탭 크기만큼 공백 추가
                                                        ))}
                                                        {currentLine.map((char, i) => {
                                                            const inputChar = normalizedInput[i];  // 입력된 문자

                                                            let className = '';
                                                            
                                                            // 현재 문자가 일치하는지 확인
                                                            if (inputChar == null) {
                                                                className = 'pending currentLine';  // 아직 입력 안 된 문자
                                                            } else if (inputChar=== char) {
                                                                className = 'typed currentLine';  // 일치한 문자
                                                            } else {
                                                                if (char === ' '){
                                                                    className = 'wrong currentLine bg-red-400 '; // 공백이고 틀린 문자
                                                                } else {
                                                                    className = 'wrong currentLine';  // 틀린 문자
                                                                }
                                                            }
                                                        
                                                            return (
                                                                <span key={i} className="cursor-container">
                                                                    {i === normalizedInput.length && <span className="cursor"></span>}
                                                                    <span className={className}>
                                                                        {char === ' ' ? '\u00A0' : char}
                                                                    </span>
                                                                </span>
                                                            );
                                                        })}
                                                        
                                                    </span>
                                                ) : (
                                                    // 아직 안친 줄
                                                    <span>
                                                        {new Array(lineWithSpace).fill('\u00A0').map((_, spaceIndex) => (
                                                            <span key={spaceIndex}>&nbsp;</span>  // 탭 크기만큼 공백 추가
                                                        ))}
                                                        {line.map((char, i) => (
                                                            <span key={i} className="pending">{char}</span>
                                                        ))}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </code>
                            </pre>


                            {/* 유저가 타이핑한 코드가 보이는 곳 */}
                            <input
                                ref={inputAreaRef}
                                className={`flex items-center bg-white text-black rounded-2xl w-full h-[12%] p-2 border-4 ${wrongChar ?  'border-red-400' :'border-green-400'} ${shake ? "animate-shake" : ""}`}
                                type="text"
                                value={currentInput}
                                onChange={handleInputChange}  
                                placeholder="여기에 타이핑하세요"
                                onPaste={(e) => e.preventDefault()} //마우스 붙여 넣기도 막기기
                            />

                        </div>
                        
                        <div className="flex-1 border-4 rounded-xl max-h-[180px] text-white p-2 flex justify-center"
                            style={{
                                borderColor: '#51E2F5'
                            }}
                        >
                            <Keyboard/>
                        
                        </div>
                    </div>

                    {/* 오른쪽 콘텐츠 박스 */}
                    <ProgressBox 
                        lang={lang}
                        elapsedTime={elapsedTime}
                        cpm={cpm} 
                        progress={progress} />
                </div>
            </div>

            {isFinished && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <FinishPage
                        codeId = {codeId}
                        lang = {lang}
                        cpm = {cpm}
                        elapsedTime = {elapsedTime}
                        isCS = {lang === 'cs'}
                        onRestart={resetGame}
                    />
                </div>
            )}
        </div>
    )
};

export default SinglePage
