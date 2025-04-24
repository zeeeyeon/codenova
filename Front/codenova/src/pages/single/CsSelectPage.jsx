import backgroundImg from '../../assets/images/main_background.avif'
import designPattenBtn from '../../assets/images/design_patten_btn.png'
import networkBtn from '../../assets/images/network_btn.png'
import dataStrBtn from '../../assets/images/data_str_btn.png'
import dbBtn from '../../assets/images/db_btn.png'
import osBtn from '../../assets/images/os_btn.png'
import box from '../../assets/images/board1.jpg'
import cancelBtn from '../../assets/images/cancel_btn.png'


const CsSelectPage = () => {

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-no-repeat bg-cover bg-center"
      style={{backgroundImage: `url(${backgroundImg})`}}
    >

      <div className='relative w-[50vw] h-[35vw] max-w-5xl py-12 px-6 flex flex-col items-center gap-6 rounded-2xl'
        style={{
          backgroundImage: `url(${box})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* 선택 박스 배경 이미지 */}
        {/* <img src={box} alt="언어선택박스" className='w-full h-full object-cover rounded-2xl'/> */}

        {/* 타이틀 텍스트 */}
        <div className="absolute top-[1%] left-1/2 -translate-x-1/2 font-bold text-4xl drop-shadow-md z-10"
             style={{color: '#1C1C1C'}}
        >
          단계선택
        </div>

        {/* 버튼 이미지들 */}
        <div className='flex flex-wrap justify-center gap-4 w-full px-4 mt-20'>
          <img src={designPattenBtn} alt="디자인패턴" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'/>
          <img src={networkBtn} alt="네트워크" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'/>
          <img src={dbBtn} alt="데이터베이스" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'/>
          <img src={dataStrBtn} alt="자료구조" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'/>
          <img src={osBtn} alt="운영체제" className='w-[13vw] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'/>
        </div>

        {/* 취소 버튼 */}
        <div className='relative w-[16vw] max-w-[300px] mt-20'>
          <img src={cancelBtn} alt="취소" className='w-full h-full rounded-xl cursor-pointer transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]'/>
        </div>

      </div>
    </div>
  )  
};
  
export default CsSelectPage;