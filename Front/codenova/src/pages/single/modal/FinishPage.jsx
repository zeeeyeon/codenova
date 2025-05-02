import box from '../../../assets/images/board1.jpg'
import cup from '../../../assets/images/cup.png'
import csReportBtn from '../../../assets/images/cs_report_btn.png'
import okBtn from '../../../assets/images/ok_btn.png'
import { formatTime } from '../../../utils/formatTimeUtils'

import authApi from "../../../api/authAxiosConfig"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CsWordSelectPage from './CsWordSelectPage'

const FinishPage = ({ codeId, lang, cpm, elapsedTime, isCS, category, words}) => {

    const navigate = useNavigate();

    const [isApiLoading, setIsApiLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [isCsWordSelect, setIsCsWordSelect] = useState(false)


    const handleConfirmClick = () => {

        if (isCS) { 
            window.location.href = "/single/select/language"; // 원하는 페이지로 이동 (URL을 적절히 수정)
            return; // 페이지 이동 후 나머지 코드를 실행하지 않도록 return
        }
        setIsApiLoading(true);
        setApiError(null); // 초기화

        const data = {
            codeId : codeId,
            language : lang.toUpperCase(),
            time : elapsedTime,
            speed : cpm
        }
        authApi.post('/api/single/code/result', data)
            .then(res => {
                console.log("api 결과", res.data);
                setIsApiLoading(false);
                window.location.href = "/single/select/language"; //저장되면 나가기
            })
            .catch(e => {
                console.error("api 요청 실패:" , e);
            });
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
                    <div className={`mt-10 flex gap-4 ${isCS ? 'w-[30vw]' : 'w-[15vw]'} max-w-[400px] justify-center gap-12`}>
                        {isCS && (
                            <img
                                src={csReportBtn}
                                alt="CS 리포트"
                                className="w-full max-w-[200px] rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]"
                                onClick={() => setIsCsWordSelect(true)}
                            />
                        )}
                        <div 
                            onClick={handleConfirmClick}
                            className={`w-full max-w-[200px] rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94] ${isApiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ pointerEvents: isApiLoading ? 'none' : 'auto' }} // 비활성화 시 클릭 방지
                        >
                            <img
                                src={okBtn}
                                alt="확인"
                                className="w-full max-w-[200px] rounded-3xl"
                            />
                        </div>
                    </div>
                </div>
            
            </div>
            {isCsWordSelect && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <CsWordSelectPage
                        category = {category}
                        word = {words}
                    />
                </div>
            )}
        </div>
    )
     
};

export default FinishPage