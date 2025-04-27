import React, { useState } from "react";
import multiBg from "../../assets/images/multi_background.png";
import boardBg from "../../assets/images/board1.jpg";
import mintBtn from  "../../assets/images/mint_large_btn.png";
import searchBtn from "../../assets/images/search_btn.png";
import Header from "../../components/common/Header";
import MakeRoomModal from "../../components/multi/modal/MakeRoomModal";
// import RoomList from "../../components/multi/RoomList";


const MultiPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url(${multiBg})`,
      }}
    >
    <Header />
    {/* 방만들기 모달 */}
    {isModalOpen && <MakeRoomModal onClose={() => setIsModalOpen(false)} />}
    
    <div
        className="absolute top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 
             w-[66vw] max-w-[1300px] aspect-[4/3] bg-contain bg-no-repeat bg-center 
             relative flex flex-col items-center justify-start pt-[6.5%] rounded-2xl"
    >
        <img
        src={boardBg}
        alt="board"
        className="absolute object-cover rounded-2xl"
        />

        <h1
          className="text-4xl font-bold drop-shadow-md ml-3 mt-4 text-[#1c1c1c] "
        >
          Multi Room
        </h1>
        
        {/* 방 만들기 버튼 */}
        <button
          className="absolute top-[26%] left-[10%] w-[100px] h-[36px] bg-no-repeat bg-contain hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
          onClick={() => setIsModalOpen(true)}
          style={{
            backgroundImage: `url(${mintBtn})`,
          }}
        >
          <span className="text-black font-bold text-m relative -translate-y-1">방 만들기</span>
        </button>

          {/* 검색창 + 검색버튼 */}
          <div className="absolute top-[7%] left-[28%] w-[260px] relative">
            <input
                type="text"
                placeholder="방 검색"
                className="w-full h-[45px] pl-4 pr-[65px] rounded-md text-[17px] font-bold text-black focus:outline-none"
            />
            <button
                className="absolute top-1/2 right-1 -translate-y-1/2 w-[60px] h-[40px] bg-no-repeat bg-contain hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] transition"
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