import bgImg from "../../assets/images/multi_background.png"
import Board2Container from "../../components/single/BoardContainer"
import goldMedal from "../../assets/images/gold_medal.png"
import silverMedal from "../../assets/images/silver_medal.png"
import bronzeMedal from "../../assets/images/dong_medal.png"
import leftBtn from "../../assets/images/left_btn.png"
import rightBtn from "../../assets/images/right_btn.png"
import leftBtn2 from "../../assets/images/less-than_black.png"
import rightBtn2 from "../../assets/images/greater-than_black.png"
import xBtn from "../../assets/images/x_btn.png"
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import { getRanking, getMemberRanking } from '../../api/rankingApi'
import Header from '../../components/common/Header'
import TutoModal from "../../components/common/TutoModal"
import SettingModal from "../../components/modal/SettingModal"


const Ranking = () => {

    const navigate = useNavigate();

    const languages = ['JAVA', 'PYTHON' , 'SQL' ,'JS'];
    const [showTutoModal, setShowTutoModal] = useState(false)
    const [currentLangIndex, setCurrentLangIndex] = useState(0);
    
    const [ranking, setRanking] = useState([null,null,null,null]); //언어별 랭킹
    // const [myRanking, setMyRanking] = useState([])

    const btn_class = 'cursor-pointer scale-75 transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'

    const [userType ,setUserType] = useState(null);
    const [showSettingModal, setShowSettingModal] = useState(false);

    useEffect(() => {
        const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
        setUserType(auth?.state?.user?.userType);
    }, [])

    // /api/single/ranking/{language}
    const getRankingData = async () => {
        const lang = languages[currentLangIndex];

        if(ranking[currentLangIndex] !== null) { //null이면 이미 요청 받은 적 있는거
            return; 
        }

        try {
            let response;
            if (userType === "guest") {
                response = await getRanking(lang);
            } else {

                response = await getMemberRanking(lang);
            }

            const { code, message } = response.data.status;
            
            if (code === 200){
                const newRanking = [...ranking]
                newRanking[currentLangIndex] = response.data.content
                setRanking(newRanking);
            } else{
                // console.log(message);
            }
            
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        getRankingData();
    },[currentLangIndex, userType])

    // useEffect(() => {
    //     console.log(ranking);
    // }, [ranking])

    const handlePrev = () => {
        setCurrentLangIndex((prev) => (prev - 1 + languages.length) % languages.length);
      };
      
      const handleNext = () => {
        setCurrentLangIndex((prev) => (prev + 1) % languages.length);
      };

    return (
        <div
            className="h-screen w-screen bg-cover bg-center bg-no-repeat overflow-hidden flex items-center justify-center"
            style={{ backgroundImage: `url(${bgImg})`}}
        >
        {/* 튜토리얼 모달 조건부 렌더링 */}
        {showTutoModal && (
            <div className="z-[9999]">
            <TutoModal onClose={() => setShowTutoModal(false)} />
            </div>
        )}
        {showSettingModal && (
            <div className="z-[9999]">
            <SettingModal onClose={() => setShowSettingModal(false)} />
            </div>
        )}

            <Header 
                onShowTuto={() => setShowTutoModal(true)} 
                onShowSetting={() => setShowSettingModal(true)}    
            />
              
            <Board2Container>
            <div className="absolute top-[0%] -right-[6%] -translate-x-1/2 z-20">
                <div className="relative group ml-2">
                    {/* 아이콘에 호버 애니메이션 추가 */}
                    <span className="cursor-help text-black text-4xl font-bold transition duration-200 ease-in-out group-hover:scale-125 group-hover:text-yellow-400 animate-pulse-color">
                    ?
                    </span>

                    {/* 툴팁에 페이드 + 슬라이드 효과 */}
                    <div className="absolute top-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black bg-opacity-90 text-white text-sm px-3 py-2 rounded shadow-md whitespace-nowrap z-30 text-center
                        animate-fade-slide-up">
                        언어 옆에 화살표를 클릭하시면<br />
                        다른 언어의 랭킹을 확인하실수 있습니다!<br/>
                    </div>
            </div>
          </div>
                

                <div className="absolute top-[1%] left-1/2 -translate-x-1/2 font-bold text-4xl drop-shadow-md z-10 flex w-[27%] justify-between items-center px-2 "
                 style={{color: '#1C1C1C'}}
                >
                    <img src={leftBtn2} alt="왼쪽" role="button" className={`cursor-pointer w-[12%] h-[10%] ${btn_class}`} 
                        onClick={handlePrev}/>
                    <div className="flex justify-center">
                        {languages[currentLangIndex]}
                    </div>
                    <img src={rightBtn2} alt="오른쪽" role="button" className={`cursor-pointer w-[12%] h-[10%] ${btn_class}`} 
                        onClick={handleNext}
                    />
                        
                </div>

                <img src={xBtn} 
                role="button"
                    alt="x" 
                    className= {`cursor-pointer scale-75 absolute top-1 right-2 text-black text-ml font-extrabold w-[4%] ${btn_class}`}
                    onClick={()=> navigate(-1)}
                />

                <div className=" w-full h-full flex p-6 justify-center items-center">
                    <div className="w-[50%] h-full text-white flex flex-col gap-8 justify-center">
                        <div className="w-full h-[20%] flex items-center gap-4">
                            <img src={goldMedal} alt="금메달" className="w-[20%]"/>
                            
                            <div className="flex w-full flex-col items-center justify-center lg:text-lg md:text-md sm:text-sm">
                                <span className="text-center">
                                    {ranking[currentLangIndex]?.top10?.[0]?.nickname || "없음"}
                                </span>
                                <span >
                                    {ranking[currentLangIndex]?.top10?.[0]?.typingSpeed != null ?
                                    Math.floor(ranking[currentLangIndex]?.top10?.[0]?.typingSpeed) : 0}타
                                </span>
                            </div>
                            
                        </div>

                        <div className="w-full h-[20%]  flex items-center gap-4">
                            <img src={silverMedal} alt="은메달" className="w-[20%]"/>
                            
                            <div className="flex w-[80%] flex-col items-center justify-center lg:text-lg md:text-md sm:text-sm">
                                <span className="text-center">
                                    {ranking[currentLangIndex]?.top10?.[1]?.nickname || "없음"}
                                </span>
                                <span >
                                    {ranking[currentLangIndex]?.top10?.[1]?.typingSpeed != null ?
                                    Math.floor(ranking[currentLangIndex]?.top10?.[1]?.typingSpeed) : 0}타
                                </span>
                            </div>
                        </div>

                        <div className="w-full h-[20%] flex items-center gap-4">
                            <img src={bronzeMedal} alt="동메달" className="w-[20%]"/>
                            
                            <div className="flex w-[70%] flex-col items-center justify-center lg:text-lg md:text-md sm:text-sm">
                                <span className="text-center">
                                    {ranking[currentLangIndex]?.top10?.[2]?.nickname || "없음"}
                                </span>
                                <span >
                                    {ranking[currentLangIndex]?.top10?.[2]?.typingSpeed != null ?
                                    Math.floor(ranking[currentLangIndex]?.top10?.[2]?.typingSpeed) : 0}타
                                </span>
                            </div>
                            
                        </div>

                    </div>
                                            
                    <div className="h-[80%] mx-12 bg-white"
                        style={{
                            width : "1px",
                            opacity : 0.4
                            
                        }}
                    />
                        <div className=" w-[40%] h-full flex flex-col justify-center text-white gap-4 mt-6">
                            {Array(7).fill(0).map((_,idx) => {
                                const nickname = ranking[currentLangIndex]?.top10?.[idx+3]?.nickname || "없음";
                                const speed =  ranking[currentLangIndex]?.top10?.[idx+3]?.typingSpeed || 0;
                                return (
                                    <div key={idx} className=" w-full h-auto sm:text-sm">
                                        {idx + 4}. {nickname} ({Math.floor(speed)})
                                    </div>
                                )
                            })}
                            {userType !== "guest" && (
                            <div className=" w-full h-auto flex justify-end mt-4 md:text-md lg:text-lg sm:text-sm">
                                내 등수: {ranking[currentLangIndex]?.myRank?.rank != null
                                    ? ` ${Math.floor(ranking[currentLangIndex].myRank.rank)}`
                                    : " - "
                                }등
                                
                                {ranking[currentLangIndex]?.myRank?.typingSpeed != null
                                    ? ` ${Math.floor(ranking[currentLangIndex].myRank.typingSpeed)}`
                                    : " - "
                                }타
                            </div>
                            )}
                        </div>
                </div>
            </Board2Container>


        </div>
    )

}

export default Ranking;
