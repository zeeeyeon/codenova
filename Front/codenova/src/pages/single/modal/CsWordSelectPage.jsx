import BoardContainer from '../../../components/single/BoardContainer'
import cancelBtn from '../../../assets/images/cancel_btn.png'
import createReportBtn from '../../../assets/images/create_report.png'
import { useNavigate } from 'react-router-dom'

const CsWordSelectPage = ({category, words}) => {

    const navigate = useNavigate();

    return (
        <div
            className='w-screen h-screen flex flex-col items-center justify-center'
            style={{ backgroundColor : 'rgba(217, 217, 217, 0.7' }}
        >

            <BoardContainer>

                {/* 타이틀 텍스트 */}
                <div className="absolute top-[1%] left-1/2 -translate-x-1/2 font-bold text-4xl drop-shadow-md z-10"
                    style={{color: '#1C1C1C'}}>
                    단어 선택
                </div>

                {/* 전체 컨텐츠 영역 */}
                <div className="flex flex-row justify-around w-[90%] h-full items-center text-white">
                    
                    {/* 왼쪽 체크리스트 */}
                    <div className="text-3xl w-[20vw]">
                        <div className='mb-4'>
                            공부한 단어
                        </div>

                        <div className="flex flex-col gap-3 text-2xl border-2 rounded-2xl p-4"
                            style={{
                                borderColor: '#51E2F5'
                            }}
                        >
                            <label className="flex items-center gap-2">
                                <input type="checkbox"/>모두 선택
                            </label>                    

                            <label className="flex items-center gap-2">
                                <input type="checkbox"/>싱글톤 패턴
                            </label>  

                            <label className="flex items-center gap-2">
                                <input type="checkbox"/>팩토리 패턴
                            </label>

                            <label className="flex items-center gap-2">
                                <input type="checkbox"/>MVC 패턴
                            </label>

                            <label className="flex items-center gap-2">
                                <input type="checkbox"/>implements
                            </label>

                        </div>
                    </div>

                    <div className="w-[20vw] flex flex-col items-center justify-center">
                        {/* 취소 버튼 */}
                        <img src={createReportBtn} alt="리포트 생생" className='w-[16vw] max-w-[300px] rounded-3xl cursor-pointer transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]'/>
                        <img src={cancelBtn} alt="취소" className='w-[16vw] max-w-[300px] rounded-3xl cursor-pointer transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]' onClick={() => navigate('/single/select/language')}/>
                        
                        
                    </div>
                </div>

            </BoardContainer>
        </div>
    )

}

export default CsWordSelectPage;