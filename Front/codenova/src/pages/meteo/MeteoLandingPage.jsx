import React from "react"
import MeteoBg from "../../assets/images/meteo_bg.png"
import Header from "../../components/common/Header"
import MeteoBoard from "../../assets/images/board1.jpg"
import UserBoard from "../../assets/images/board2.jpg"


const MeteoLandingPage = () => {
    return (
        <div
            className="w-screen h-screen bg-cover bg-center bg-no-repeat"
            style={{
            backgroundImage: `url(${MeteoBg})`,
            }}>
        <Header/>
        
        <div className="relative flex justify-center items-center">
        <img src={MeteoBoard} className="w-[66rem] rounded-2xl shadow-xl z-0" alt="meteoBoard"/>
        <div className="absolute top-[2%] left-1/2 -translate-x-1/2 z-20 text-1C1C1C text-3xl font-bold">
        지구를 지켜라!
        </div>
            <div className="absolute top-[15%] grid grid-cols-4 gap-9 z-10">
                {[...Array(4)].map((_, idx) => (
                <img
                    key={idx}
                    src={UserBoard}
                    alt={`user-board-${idx}`}
                    className="w-48 h-auto rounded-xl shadow-md"
                />
                ))}
            </div>
            {/* ✅ 하단 레이아웃: 채팅 + 방코드/버튼 */}
            <div className="flex absolute top-[50%] gap-6">
                {/* 채팅 영역 */}
                <div
                className="w-[44rem] h-[13rem] border-4 rounded-xl"
                style={{ borderColor: "#01FFFE" }}
                ></div>

                {/* 방코드 + 버튼 영역 */}
                <div className="flex flex-col gap-4">
                <div
                    className="w-[10rem] h-[8rem] border-4 rounded-xl flex items-center justify-center"
                    style={{ borderColor: "#01FFFE" }}
                ></div>

                <div
                    className="w-[10rem] h-[3.5rem] border-4 rounded-xl flex items-center justify-center"
                    style={{ borderColor: "#01FFFE" }}
                ></div>
                </div>
                    

            </div>
        </div>



        </div>
    )
}

export default MeteoLandingPage