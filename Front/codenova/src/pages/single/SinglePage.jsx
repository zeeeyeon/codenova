import backgroundImg from '../../assets/images/single_background.jpg'
import box from '../../assets/images/board1_cut.jpg'
import logo from '../../assets/images/logo.png'
import Keyboard from '../../components/keyboard/Keyboard'


import { getAccessToken } from "../../utils/tokenUtils";
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useRef} from 'react'

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

import { singleLangCode, getLangCode, verifiedRecord, postRecord } from '../../api/singleApi'
import { userColorStore } from '../../store/userSettingStore';
import CodeDescription from '../../components/single/CodeDescription';
import { encryptWithSessionKey } from '../../utils/cryptoUtils';

// 등록
hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('sql', sql);


const SinglePage = () => {

    const navigate = useNavigate();
    const { lang } = useParams();

    const [userType ,setUserType] = useState(null);


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
    const [shake, setShake] = useState(false);  // 오타 입력창 흔들기 모션

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

    const [requestId, setRequestId] = useState("");

    // 자동으로 내려가게
    const codeContainerRef = useRef(null);

    const [logCount, setLogCount] = useState(0);
    const keyLogsRef = useRef([]);
    const hasVerifiedRef = useRef(false); //중복호출 막을려고


    const initColors = userColorStore((state) => state.initColors);

    const [showCodeDescription, setShowCodeDescription] = useState(false);


    useEffect(() => {
        const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
        setUserType(auth?.state?.user?.userType);
        initColors(); 

        if (inputAreaRef.current) {
            inputAreaRef.current.focus();
        }
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    },[])

    useEffect(() => {
        const handleWindowBlur = () => {
            if (!isFinished) setIsFinished(true);
        };

        window.addEventListener("blur", handleWindowBlur);
        return () => {
            window.removeEventListener("blur", handleWindowBlur);
        };
    }, []);

    useEffect(() => {
        const accessToken = getAccessToken();
        // console.log(accessToken)
        if (!accessToken) {
            alert("로그인이 필요합니다");
            navigate("/auth/login");
        }
    }, [navigate]);

    // 포커스를 항상 유지
    useEffect(() => {
        if (inputAreaRef.current && isFocused && !isFinished) {
            inputAreaRef.current.focus();
        }
    }, [isFocused, isFinished]);

    useEffect(() => {
        if (!isFinished) {
            document.addEventListener("click", handleClickOutside);
        } else {
            document.removeEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isFinished]);

    // 외부 클릭시 포커스를 유지
    const handleClickOutside = (e) => {
        if (inputAreaRef.current && !inputAreaRef.current.contains(e.target)) {
            e.preventDefault();
            inputAreaRef.current.focus();
        }
    };

    useEffect(() => {
        if (lang) {
            singleLangCode(lang)
            // getLangCode(12) //476 : h만 있음
                .then(data => {
                    // console.log("api 결과", data);            
                    const { lines , space, charCount } = processCode(data.content);
                    setCodeId(data.codeId);
                    setLines(lines);
                    setSpace(space);
                    setlinesCharCount(charCount)
                    setRequestId(data.requestId)
                })
                .catch(e => {
                    // console.error("api 요청 실패:" , e)
                })
        }
    },[lang])

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

        // ↓ 입력 길이 제한 확인
        const isTypingKey = key.length === 1; // 문자, 숫자, 스페이스 등 일반 키
        const isInputTooLong = currentInput.length >= lines[currentLineIndex]?.length;
        const ALWAYS_LOG_KEYS = ['Enter', 'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];
        const PREVENT_KEYS = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Alt'];

        const shouldLog = !isInputTooLong || 
                          !isTypingKey || 
                          ALWAYS_LOG_KEYS.includes(key) //혹시 모르니까 특정키는 무조건 넣게 하기기 

        if (shouldLog) {
            const newLog = {
                key: key,
                timestamp: Date.now(),
            };
            keyLogsRef.current.push(newLog);
            setLogCount((prev) => prev + 1);
            //console.log("입력된 키", newLog.key)
        }

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
        else if (PREVENT_KEYS.includes(key)) {
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


    const verifiedResult = async () => {    

        if (hasVerifiedRef.current) return ; // 이미 검증했으면 중단하기기
        hasVerifiedRef.current = true;

        const data = {
            codeId : codeId,
            language : lang.toUpperCase(),
            keyLogs : keyLogsRef.current,
            requestId : requestId 
        }
        try {
            // console.log(keyLogsRef.current)
            const encryptedData = encryptWithSessionKey(data);
            const response = await verifiedRecord(encryptedData);
            const {code, message} = response.status;
            if (code === 200){
                setCpm(response.content.typingSpeed)
                await postResult(response.content.verifiedToken)
            } else{
                // console.log(response)
            }
        } 
        catch (e) {
            // console.log(e)
        }
    }

    // 검증완료했으면 저장 로직 수행
    const postResult = async (token) => {
        try {
            const response = await postRecord(token, requestId);
            const {code, message} = response.status;

            if (code === 200) {
                if (response.content.isNewRecord) {
                    alert(message);
                }
            }
            else if (code === 400) {
                // console.log("비정상적인 접근입니다.")
            }
        } catch (e) {
            // console.error("postResult error:", e);
        }
    }


    useEffect(() => {
        setProgress(getProgress(currentLineIndex, lines.length))

        if( lines.length > 0 && currentLineIndex === lines.length) {
            
            if (userType === "member") {
                verifiedResult();
            }
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
        const currentLine = lines[currentLineIndex] || [];

        // 입력이 현재 줄의 길이보다 작거나 같을 때만 반영
        if (value.length <= currentLine.length) {
            setCurrentInput(value);
        } else {
            // 오버플로우 방지: 입력된 텍스트가 너무 길면 잘라서 반영 (실수 방지용)
            setCurrentInput(value.slice(0, currentLine.length));
        }

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

    // useEffect(() => {
    //     console.log(keyLogsRef.current)
    // },[logCount])


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
                                className={`single-input flex items-center bg-white text-black rounded-2xl w-full h-[12%] p-2 border-4 ${wrongChar ?  'border-red-400' :'border-green-400'} ${shake ? "animate-shake" : ""}`}
                                type="text"
                                value={currentInput}
                                onChange={handleInputChange}
                                onFocus={() => setIsFocused(true)}  
                                placeholder="여기에 타이핑하세요"
                                style={{ pointerEvents: 'none' }} // 클릭 방지
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
                        lang={lang}
                        cpm={cpm}
                        elapsedTime={elapsedTime}
                        onShowCodeDescription={() => setShowCodeDescription(true)}
                    />
                </div>
                
            )}
            {/* {showCodeDescription && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <CodeDescription 
                        onClose={() => setShowCodeDescription(false)} 
                        lang={lang.toUpperCase()}
                        codeId={codeId}
                    />
                </div>
            )} */}
            {showCodeDescription && (
    userType === 'member' ? (
        <div className="absolute inset-0 flex items-center justify-center z-50">
            <CodeDescription
                onClose={() => setShowCodeDescription(false)}
                lang={lang.toUpperCase()}
                codeId={codeId}
            />
        </div>
    ) : (
        <>
            {/* 경고 메시지 띄우기 */}
            <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="bg-black bg-opacity-80 text-white p-6 rounded-xl border border-gray-600 flex flex-col justify-center items-center">
                    회원 전용 기능입니다.
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                        onClick={() => setShowCodeDescription(false)}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </>
    )
)}
        </div>
    )
};

export default SinglePage
