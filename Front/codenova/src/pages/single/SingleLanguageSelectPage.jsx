import backgroundImg from '../../assets/images/single_background.jpg'
import javaBtn from '../../assets/images/java_button.png'
import pythonBtn from '../../assets/images/python_button.png'
import sqlBtn from '../../assets/images/SQL_button.png'
import cBtn from '../../assets/images/C_button.png'
import csBtn from '../../assets/images/CS_button.png'
import cancelBtn from '../../assets/images/cancel_btn.png'
import BoardContainer from '../../components/single/BoardContainer'

import { useNavigate } from 'react-router-dom'


const SingleLanguageSelectPage = () => {

  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-no-repeat bg-cover bg-center"
      style={{backgroundImage: `url(${backgroundImg})`}}
    >

      <BoardContainer>
        {/* 타이틀 텍스트 */}
        <div className="absolute top-[1%] left-1/2 -translate-x-1/2 font-bold text-4xl drop-shadow-md z-10"
             style={{color: '#1C1C1C'}}
        >
          언어선택
        </div>

        {/* 버튼 이미지들 */}
        <div className='flex flex-wrap justify-center gap-4 w-full px-4 mt-20'>
          <img src={javaBtn} alt="자바" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]' onClick={() => navigate('/single/game/java')}/>
          <img src={pythonBtn} alt="파이썬" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'onClick={() => navigate('/single/game/python')}/>
          <img src={sqlBtn} alt="SQL" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]' onClick={() => navigate('/single/game/sql')} />
          <img src={cBtn} alt="C언어" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]' onClick={() => navigate('/single/game/js')}/>
          <img src={csBtn} alt="CS" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]' onClick={() => navigate('/single/select/cs')}/>
        </div>

        {/* 취소 버튼 */}
        <div className='relative w-[16vw] max-w-[300px] mt-10'>
          <img src={cancelBtn} alt="취소" className='w-full h-full rounded-3xl cursor-pointer transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]'  onClick={() => navigate('/main')}/>
        </div>
      </BoardContainer>


    </div>
  )  
};
  
export default SingleLanguageSelectPage;