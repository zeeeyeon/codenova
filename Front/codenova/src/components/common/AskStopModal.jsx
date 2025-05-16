import box from '../../../assets/images/board1.jpg'

import { useNavigate } from 'react-router-dom'

const AskStopModal = () => {

    const navigate = useNavigate();


    const cancelClick = () => {

        
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
                    게임 종료
                </div>

                {/* 모달 컨텐츠들 */}
                <div className="text-white flex flex-col items-center justify-center w-full mt-[3vw] ">

                    {/*  컨텐츠 내용 */}
                    <div className= "time text-3xl text-center mt-4">
                        지금 게임을 종료하면 현재까지의 내용을 저장할 수 없습니다. 그래도 게임을 종료하시겠습니까?
                    </div>

                    {/* 버튼 컨테이너  */}
                    <div className={`mt-10 flex gap-4 w-[30vw] max-w-[400px] justify-center gap-12`}>
                        
                        <img
                            src={""}
                            alt="취소"
                            className="w-full max-w-[200px] rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]"
                            onClick={() => cancelClick()}
                        />
                        <img
                            src={""}
                            alt="게임 종료"
                            className={`w-full max-w-[200px] rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]`}
                            onClick={() => navigate("/single/select/language")}
                        />
                    </div>
                </div>
            
            </div>
        </div>
    )
     
};

export default AskStopModal