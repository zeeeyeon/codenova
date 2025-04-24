import React from "react";
import multiBg from "../../assets/images/multi_background.png";
import boardBg from "../../assets/images/board1.jpg";
import mintBtn from  "../../assets/images/mint_large_btn.png";
import searchBtn from "../../assets/images/search_btn.png";

const MultiPage = () => {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url(${multiBg})`,
      }}
    >
    <div
        className="absolute top-[53%] left-1/2 -translate-x-1/2 -translate-y-1/2 
             w-[75vw] max-w-[1300px] aspect-[4/3] bg-contain bg-no-repeat bg-center 
             relative flex flex-col items-center justify-start pt-[6.5%]"
        style={{
            backgroundImage: `url(${boardBg})`,
        }}
    >

        <h1
          className="text-5xl font-bold drop-shadow-md ml-3 text-[#1c1c1c]  "
        >
          Multi Room
        </h1>
        {/* 방 만들기 버튼 */}
        <button
          className="absolute top-[22%] left-[10%] w-[100px] h-[36px] bg-no-repeat bg-contain"
          style={{
            backgroundImage: `url(${mintBtn})`,
          }}
        >
          <span className="text-black font-bold text-m relative -translate-y-1">방 만들기</span>
        </button>

          {/* 검색창 + 검색버튼 */}
          <div className="absolute top-[5%] left-[28%] w-[260px] relative">
            <input
                type="text"
                placeholder="방 검색"
                className="w-full h-[45px] pl-4 pr-[65px] rounded-md text-[16px] font-bold text-black focus:outline-none"
            />
            <button
                className="absolute top-1/2 right-1 -translate-y-1/2 w-[60px] h-[40px] bg-no-repeat bg-contain"
                style={{
                backgroundImage: `url(${searchBtn})`,
                }}
            />
           </div>

     </div>
      
    </div>
  );
};

export default MultiPage;