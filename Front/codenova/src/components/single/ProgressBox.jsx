import pythonImg from '../../assets/images/python.png'
import javaImg from '../../assets/images/Java.png'
import cImg from '../../assets/images/C.png'
import csImg from '../../assets/images/CS.png'
import sqlImg from '../../assets/images/SQL.png'

import { calculateWPM, calculateCPM, getSpeedProgress, getProgress } from '../../utils/typingUtils'
import { formatTime } from '../../utils/formatTimeUtils'
import { useState, useEffect } from 'react'

const ProgressBox = ({lang, elapsedTime, cpm, progress}) => {

    const getLangImg = (lang) => {
        if (lang === "java") return javaImg;
        else if (lang === "python") return pythonImg;
        else if (lang === "c") return cImg;
        else if (lang === "sql") return sqlImg;
        else return csImg;  // 기본값은 csImg
    }
    
    const [langImg, setLangImg] = useState(getLangImg(lang));

    

    return (
        <div className="w-[20%] max-h-full border-4 rounded-xl text-white text-center p-2 "
            style={{
                borderColor: '#51E2F5'
            }}
        >
            {/* 캐릭터 */}
            <div className="w-full flex flex-col items-center gap-3 text-white text-center">
                <img 
                    src={langImg}
                    alt="캐릭터"
                    className="w-full rounded-xl border-2"
                    style={{ borderColor : '#51E2F5'}} 
                />
            </div>
            {/* 시간 */}
            <div className="text-2xl mt-2 font-bold">시간</div>
            <div className="w-full py-2 rounded-xl border-2 text-2xl"
                style={{ borderColor: "#51E2F5"}}    
            >
                {formatTime(elapsedTime)}
            </div>
            {/* 타수 */}
            {/* <div className="text-2xl mt-2 font-bold">타수</div>
            <div className="w-full py-2 rounded-xl border-2 font-bold text-2xl"
                style={{ borderColor: "#51E2F5"}}    
            >
                {cpm}
                </div> */}
            <div className="w-full py-2 text-2xl mt-4"
                style={{ borderColor: "#51E2F5"}}    
            >
                타수 : {cpm}
            </div>
            {/* 기본 흐릿한 배경 */}
            <div className="w-full h-4 rounded-md"
                style={{
                    background: `linear-gradient(
                        to right,
                        rgba(81, 226, 245, 1) ${getSpeedProgress(cpm)}%, 
                        rgba(81, 226, 245, 0.3) ${getSpeedProgress(cpm)}%
                      )`,
                      transition: 'background 0.3s ease',
                      borderColor: '#51E2F5'
                }}
            />
            {/* 진행률 바 */}
            <div className="w-full h-8 rounded-xl overflow-hidden mt-8 border-2"
                style={{ 
                    borderColor: '#51E2F5'
                    
                }}
            >
                <div className="w-full h-full"
                    style={{ 
                        borderColor: "#51E2F5",
                        backgroundColor: "#51E2F5",
                        width: `${progress}%`
                    }}
                >
                </div>
            </div>
            
            <div className="text-2xl w-full mt-4">진행률: {progress}%</div>
        </div>
    )
}

export default ProgressBox;