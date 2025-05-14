import backgroundImg from '../../assets/images/single_background.jpg'
import javaBtn from '../../assets/images/java_button.png'
import pythonBtn from '../../assets/images/python_button.png'
import sqlBtn from '../../assets/images/SQL_button.png'
import jsBtn from '../../assets/images/js_button.png'
import goBtn from '../../assets/images/go_button.png'
import cBtn from '../../assets/images/C_button.png'
import csBtn from '../../assets/images/CS_button.png'
import lockIcon from '../../assets/images/lock_icon.png'
import cancelBtn from '../../assets/images/cancel_btn.png'
import BoardContainer from '../../components/single/BoardContainer'
import Header from '../../components/common/Header'
import TutoModal from '../../components/common/TutoModal'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SettingModal from '../../components/modal/SettingModal'


const SingleLanguageSelectPage = () => {

  const navigate = useNavigate();
  const [showTutoModal, setShowTutoModal] = useState(false)
  const [showSettingModal, setShowSettingModal] = useState(false);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-no-repeat bg-cover bg-center"
      style={{backgroundImage: `url(${backgroundImg})`}}
    >
      {/* 튜토리얼 모달 조건부 렌더링 */}
      {showTutoModal && (
        <div className="z-[9999]">
          <TutoModal onClose={() => setShowTutoModal(false)} />
        </div>
      )}
      {showSettingModal && <SettingModal onClose={() => setShowSettingModal(false)} />}
      
      <Header 
        onShowTuto={() => setShowTutoModal(true)}
        onShowSetting={() => setShowSettingModal(true)}  

      />

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
          <img src={jsBtn} alt="js" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]' onClick={() => navigate('/single/game/js')}/>
          {/* <img src={goBtn} alt="go" className='w-[13vw] cursor-pointer transition-all duration-150 brightness-50 pointer-events-none' onClick={() => navigate('/single/select/go')}/> */}
          <div className="relative group w-[13vw]">
            <img src={goBtn} alt="go" className='w-full cursor-pointer transition-all duration-150 brightness-50 pointer-events-none' onClick={() => navigate('/single/select/go')}/>
            <img
              src={lockIcon}
              alt="lock"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[20%] "
            />
            <div className="absolute  left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-sm px-2 py-1 rounded shadow-md whitespace-nowrap z-10">
                GO언어 추후 GOGO 예정!!
              </div>
          </div>
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