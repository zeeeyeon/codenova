import backgroundImg from '../../assets/images/single_background.jpg'
import BoardContainer from '../../components/single/BoardContainer'
import csReportBtn from '../../assets/images/cs_report_btn.png'
import okBtn from '../../assets/images/ok_btn.png'


const MyPage= () => {

    return (
        <div 
            className="w-screen h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImg})`}}
        >
            <BoardContainer>
                {/* 타이틀 텍스트 */}
                <div className="absolute top-[1%] left-1/2 -translate-x-1/2 font-bold text-4xl drop-shadow-md z-10"
                    style={{color: '#1C1C1C'}}
                >
                    마이페이지
                </div>

                <div className="text-white text-3xl mt-[4vw]">
                    <div>
                        ID : test01
                    </div>

                    <div className=" mt-[2vw]">
                        Name : 나는야 타자왕
                    </div>

                    <div className=" mt-[2vw]">
                        최고타수 : 999타 
                    </div>
                </div>

                {/* 버튼 컨테이너  */}
                    <div className={`mt-10 flex  w-[30vw] max-w-[400px] justify-center gap-12`}>
                        <img
                            src={csReportBtn}
                            alt="CS 리포트"
                            className="w-full max-w-[200px] rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]"
                        />
                        <img
                            src={okBtn}
                            alt="확인"
                            className="w-full max-w-[200px] rounded-3xl transition-all duration-200 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.97] active:scale-[0.94]"
                        />
                    </div>

            </BoardContainer>

        </div>
    );
};

export default MyPage;