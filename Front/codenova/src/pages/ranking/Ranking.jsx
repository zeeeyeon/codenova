import bgImg from "../../assets/images/multi_background.png"
import Board2Container from "../../components/single/BoardContainer"
import goldMedal from "../../assets/images/gold_medal.png"
import silverMedal from "../../assets/images/silver_medal.png"
import bronzeMedal from "../../assets/images/dong_medal.png"
import leftBtn from "../../assets/images/left_btn.png"
import rightBtn from "../../assets/images/right_btn.png"
import xBtn from "../../assets/images/x_btn.png"
import { useState } from "react"
import { useNavigate } from 'react-router-dom'

const Ranking = () => {

    const navigate = useNavigate();
    const [lang, setLang] = useState("PYTHON")

    const languages = ['Python', 'JS', 'Java', 'Go', 'C', 'SQL'];

    const [currentLangIndex, setCurrentLangIndex] = useState(0);
    
    const btn_class = 'cursor-pointer scale-75 transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]'

    const other = 
        [
            { 
                "nickname" : '부울경_1반_이가람',
                "speed" : 107   
            },
            { 
                "nickname" : '부울경_1반_김나영',
                "speed" : 106   
            },
            { 
                "nickname" : '부울력_1반_정영한',
                "speed" : 105   
            },
            { 
                "nickname" : '부울력_1반_최진성',
                "speed" : 104   
            },
            { 
                "nickname" : '부울경_1반_강혜경',
                "speed" : 103   
            },
            { 
                "nickname" : '부울경_1반_도경원',
                "speed" : 102   
            },
            { 
                "nickname" : '부울경_1반_이원재',
                "speed" : 101   
            },
        ]

    const myRanking = {
        "nickname" : '동현갈비',
        "ranking" : 129,
        "speed" : 101
    }

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
            <Board2Container>


                <div className="absolute top-[1%] left-1/2 -translate-x-1/2 font-bold text-4xl drop-shadow-md z-10 flex gap-6 w-[27%] justify-between"
                 style={{color: '#1C1C1C'}}
                >
                    <img src={leftBtn} alt="왼쪽" className={`cursor-pointer scale-75 ${btn_class}`} 
                        onClick={handlePrev}/>
                    <div className="flex justify-center">
                        {languages[currentLangIndex].toUpperCase()}
                    </div>
                    <img src={rightBtn} alt="오른쪽" className={`cursor-pointer scale-75 ${btn_class}`} 
                        onClick={handleNext}
                    />

                </div>

                <img src={xBtn} 
                    alt="x" 
                    className= {`cursor-pointer scale-75 absolute top-1 right-2 text-black text-ml font-extrabold w-[4%] ${btn_class}`}
                    onClick={()=> navigate(-1)}
                />

                <div className=" w-full h-full flex p-6 justify-center items-center">
                    <div className="w-[40%] h-full text-white flex flex-col gap-8 justify-center">
                        <div className="w-full h-[20%] flex items-center gap-4">
                            <img src={goldMedal} alt="금메달" className="w-[20%]"/>
                            
                            <div className="flex flex-col items-center justify-center text-xl">
                                <span >
                                    부울경_1반_송동현
                                </span>
                                <span >
                                    999타수
                                </span>
                            </div>
                            
                        </div>

                        <div className="w-full h-[20%]  flex items-center gap-4">
                            <img src={silverMedal} alt="금메달" className="w-[20%]"/>
                            
                            <div className="flex flex-col items-center justify-center text-xl">
                                <span >
                                    부울경_1반_이지연
                                </span>
                                <span >
                                    333타수
                                </span>
                            </div>
                            
                        </div>

                        <div className="w-full h-[20%] flex items-center gap-4">
                            <img src={bronzeMedal} alt="동메달" className="w-[20%]"/>
                            
                            <div className="flex flex-col items-center justify-center text-xl">
                                <span >
                                    부울경_1반_유지인
                                </span>
                                <span >
                                    222타수
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
                        
                        {other.map((Player, idx) => (
                            <div key={idx} className=" w-full h-auto ">
                                {idx + 4}. {Player.nickname} ({Player.speed})
                            </div>
                        ))}
                        
                        <div className=" w-full h-auto flex justify-end mt-4 text-xl">
                            내 등수: {myRanking.ranking}등 ({myRanking.speed}타)
                        </div>
                    </div>
                </div>
                

            </Board2Container>


        </div>
    )

}

export default Ranking;