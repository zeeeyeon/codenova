import box from '../../../assets/images/board1.jpg'
import cup from '../../../assets/images/cup.png'
import restartBtn from '../../../assets/images/restart_btn.png'
import stopBtn from '../../../assets/images/stop_btn.png'
import { formatTime } from '../../../utils/formatTimeUtils'

import { postRecord } from '../../../api/singleApi'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// import CsWordSelectPage from './CsWordSelectPage'

const FinishPage = ({ codeId, lang, cpm, elapsedTime, isCS, category, words, onRestart}) => {

    const navigate = useNavigate();

    const [userType ,setUserType] = useState(null);

    
    const [isApiLoading, setIsApiLoading] = useState(false);
    
    useEffect(() => {
        const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
        setUserType(auth?.state?.user?.userType);

    }, [])

    const saveRecord = async () => {
        setIsApiLoading(true);

        const data = {
            codeId : codeId,
            language : lang.toUpperCase(),
            time : elapsedTime,
            speed : cpm
        }
        try {
            const response = await postRecord(data);
            const {code, message} = response.status;
            if (code === 200){
                if (response.content.isNewRecord) {
                    alert(message);
                }
            } else{
                alert("기록 저장에 실패하였습니다.")
            }
        } 
        catch (e) {
            alert("서버 오류로 인해 기록을 저장할 수 없습니다.");
        }finally {
            setIsApiLoading(false);  
        } 
    }

    // 다시 하기
    const handleRestartClick = async () => {

        if (userType !== "guest"){
            await saveRecord()
        }
        // onRestart(); // 부모에서 상태 초기화
        window.location.reload(); // 🔁 새로고침
    }


    // 그만하기
    const handleConfirmClick = async () => {

        if (userType === "guest") {
            alert("비회원은 기록을 저장할 수 없습니다.")
            navigate("/single/select/language"); 
            return;
        }
        await saveRecord();
        navigate("/single/select/language");

        
    };

    return (
        <div     
            className='w-screen h-screen flex flex-col items-center justify-center'
            style={ { backgroundColor : 'rgba(217, 217, 217, 0.7'}}
        >

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
                            alt="다시하기"
                            className={`w-full max-w-[200px] rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94] ${isApiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleRestartClick}
                            style={{ pointerEvents: isApiLoading ? 'none' : 'auto' }} // 비활성화 시 클릭 방지
                        />
                        <img
                            src={stopBtn}
                            onClick={handleConfirmClick}
                            alt="확인"
                            className={`w-full max-w-[200px] rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94] ${isApiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ pointerEvents: isApiLoading ? 'none' : 'auto' }} // 비활성화 시 클릭 방지
                        />
                    </div>
                </div>
            
            </div>
            {/* 
            {isCsWordSelect && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <CsWordSelectPage
                        category = {category}
                        word = {words}
                    />
                </div>
            )} */}
        </div>
    )
     
};

export default FinishPage