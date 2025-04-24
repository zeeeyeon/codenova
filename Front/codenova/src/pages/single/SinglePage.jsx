import backgroundImg from '../../assets/images/main_background.avif'
import box from '../../assets/images/board1.jpg'
import logo from '../../assets/images/logo.png'
import pythonImg from '../../assets/images/python.png'
import javaImag from '../../assets/images/Java.png'
import cImag from '../../assets/images/C.png'
import CsImg from '../../assets/images/CS.png'
import SqlImg from '../../assets/images/SQL.png'
import Keyboard from '../../components/keyboard/Keyboard'

const SinglePage = () => {

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImg})`}}
        >
            {/* 타자게임 박스 */}
            <div className='relative mt-20'>
                <img src={box} alt="타자게임 박스" className="w-[70vw] max-w-5wl h-auto rounded-2xl"/>

                <img src={logo} alt="로고" className="absolute -top-[90px] left-1/2 -translate-x-1/2 w-[20vw] max-w-[300px] h-auto z-10"/>


                {/* 콘텐츠 박스들 */}
                <div className="absolute top-0 left-0 w-full h-full flex gap-4 z-10 px-24 py-32">
                    {/* 왼쪽 컨텐츠 영역 */}
                    <div className="flex flex-col flex-1 gap-4">
                        <div className="flex-1 border-4 rounded-xl bg-black text-white text-2xl p-4"
                            style={{
                                borderColor: '#51E2F5'
                            }}
                        >
                            for i in range(1,10)
                        </div>
                        
                        <div className="flex-1 border-4 rounded-xl max-h-[220px] text-white p-4 flex justify-center"
                            style={{
                                borderColor: '#51E2F5'
                            }}
                        >
                            <Keyboard/>
                        
                        </div>
                    </div>

                    {/* 오른쪽 콘텐츠 박스 */}
                    <div className="w-[20%] border-4 rounded-xl text-white text-center p-2"
                        style={{
                            borderColor: '#51E2F5'
                        }}
                    >
                        {/* 캐릭터 */}
                        <div className="w-full flex flex-col items-center gap-3 text-white text-center">

                            <img 
                                src={pythonImg}
                                alt="캐릭터"
                                className="w-full rounded-xl border-2"
                                style={{ borderColor : '#51E2F5'}} 
                            />
                        </div>

                        {/* 시간 */}
                        <div className="text-3xl mt-2 font-bold">시간</div>
                        <div className="w-full py-2 rounded-xl border-2 font-bold text-2xl"
                            style={{ borderColor: "#51E2F5"}}    
                        >
                            00:00
                        </div>

                        {/* 타수 */}
                        <div className="text-3xl mt-2 font-bold">타수</div>
                        <div className="w-full py-2 rounded-xl border-2 font-bold text-2xl"
                            style={{ borderColor: "#51E2F5"}}    
                        >
                            317
                        </div>

                        {/* 진행률 바 */}
                        <div className="w-full h-8 rounded-xl overflow-hidden mt-10 border-2"
                            style={{ borderColor: '#51E2F5'}}
                        >
                            <div className="h-full"
                                style={{ 
                                    borderColor: "#51E2F5",
                                    backgroundColor: "#51E2F5",
                                    width: "80%"
                                }}
                            >
                            </div>
                        </div>
                        <div className="text-2xl w-full mt-4">진행률: 80%</div>

                    </div>
                </div>
            </div>
        </div>
    )
};

export default SinglePage