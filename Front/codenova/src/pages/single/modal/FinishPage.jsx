import box from '../../../assets/images/board1.jpg'
import cup from '../../../assets/images/cup.png'
import restartBtn from '../../../assets/images/restart_btn.png'
import stopBtn from '../../../assets/images/stop_btn.png'
import { formatTime } from '../../../utils/formatTimeUtils'

import { postRecord } from '../../../api/singleApi'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import codeDescBtn from '../../../assets/images/codeDescriptionBtn.png'
import codeDescBtn1 from '../../../assets/images/codeDescriptionBtn1.png'
import codeDescBtn2 from '../../../assets/images/codeDescriptionBtn2.png'
import codeDescBtn3 from '../../../assets/images/codeDescriptionBtn3.png'
import codeDescBtn4 from '../../../assets/images/codeDescriptionBtn4.png'
import mouseImg from '../../../assets/images/mouse.png';
import CodeDescription from '../../../components/single/CodeDescription'
// import CsWordSelectPage from './CsWordSelectPage'

const FinishPage = ({ codeId, lang, cpm, elapsedTime, onShowCodeDescription}) => {

    const navigate = useNavigate();

    const [userType ,setUserType] = useState(null);
    const [fireworks, setFireworks] = useState([]);
    
    const [isApiLoading, setIsApiLoading] = useState(false);

    const codeBtns = [codeDescBtn ,codeDescBtn1, codeDescBtn2, codeDescBtn3, codeDescBtn4];
    const [currentButtonIndex, setCurrentButtonIndex] = useState(0);

    const btn_class = 'cursor-pointer scale-75 transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'
    

    useEffect(() => {
        const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
        setUserType(auth?.state?.user?.userType);

        const interval = setInterval(() => {
        setFireworks((prev) => [
            ...prev,
            {
              id: Math.random(),
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              size: Math.random() * 8 + 4,
              color: ["#ff0", "#f0f", "#0ff", "#0f0", "#f00"][Math.floor(Math.random() * 5)],
            },
          ]);
        }, 80);

        const buttonInterval = setInterval(() => {
            setCurrentButtonIndex((prev) => (prev + 1) % 5); 
        }, 800);

        // 30개 생성 후 멈추기
        setTimeout(() => clearInterval(interval), 40 * 80);

        return () => {
            clearInterval(interval);
            clearInterval(buttonInterval);
        }
    }, [])

    return (
        <div     
            className='w-screen h-screen flex flex-col items-center justify-center'
            style={ { backgroundColor : 'rgba(0, 0, 0, 0.7'}}
            // style={ { backgroundColor : 'rgba(217, 217, 217, 0.7'}}
        >
            
            {/* 폭죽 레이어 */}
            {fireworks.map((fw) => (
              <div
              key={fw.id}
              className="firework sparkle"
              style={{
                position: "absolute",
                left: fw.left,
                top: fw.top,
                width: `${fw.size}px`,
                height: `${fw.size}px`,
                backgroundColor: fw.color,
                zIndex: 60,
                borderRadius: "50%",
              }}
            />
            ))}

            <div className= 'relative w-[45vw] h-[30vw] max-w-5xl py-12 px-6 flex flex-col items-center gap-6 rounded-3xl'
                style={{
                    backgroundImage: `url(${box})`,
                    backgroundSize: '100% 100%',
                    backgroundRepeat : 'no-repeat'
                }}
            >

                {/* 타이틀 텍스트 */}
                <div className='absolute top-[1%] left-1/2 -translate-x-1/2 font-bold text-3xl drop-shadow-md z-10'
                    stlye={{color: '#1C1C1C'}}
                >
                    미션 성공
                </div>

                {/* 코드 설명 보러 가기 버튼 */}
                <div className = {""} >
                     <img src={codeBtns[currentButtonIndex]} alt={`코드설명버튼${currentButtonIndex + 1}`} 
                        className= {`w-[35%] cursor-pointer absolute -top-20 -right-2 will-change-transform animate-poke ${btn_class}`}
                        onClick={onShowCodeDescription} role="button"
                    />
                    <img src={mouseImg} alt="마우스이미지" 
                        className='w-[7%] absolute -top-16 -right-4 '
                    />
                </div>
               


                {/* 모달 컨텐츠들 */}
                <div className="text-white flex flex-col items-center justify-center w-full mt-[3vw] ">

                    {/* 컨텐츠 타이틀 */}
                    <div className="title flex item-center gap-3 text-4xl mb-4">
                        <img src={cup} alt="트로피" className="w-[3vw] max-w-[50px]"/>
                        <span>
                            {lang.toUpperCase()} 미션 성공
                        </span>
                    </div>

                    {/*  컨텐츠 내용 */}
                    <div className= "time text-3xl text-center mt-4">
                        <div className="time mt-4">
                            시간 : {formatTime(elapsedTime)}
                        </div>

                        <div className="speed mt-4">
                            타수 : {Math.floor(cpm)}
                        </div>
                    </div>

                    {/* 버튼 컨테이너  */}
                    <div className={`mt-10 flex w-[30vw] max-w-[400px] justify-center gap-12`}>
                
                        <img
                            src={restartBtn}
                            role="button"
                            alt="다시하기"
                            className={`w-full max-w-[200px] rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94] ${isApiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => window.location.reload()}
                            style={{ pointerEvents: isApiLoading ? 'none' : 'auto' }} // 비활성화 시 클릭 방지
                        />
                        <img
                            src={stopBtn}
                            role="button"
                            onClick={() => navigate("/single/select/language")}
                            alt="확인"
                            className={`w-full max-w-[200px] rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94] ${isApiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ pointerEvents: isApiLoading ? 'none' : 'auto' }} // 비활성화 시 클릭 방지
                        />
                    </div>
                </div>
            
            </div>
        </div>
    )
     
};

export default FinishPage