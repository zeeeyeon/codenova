import React from "react";
import lockImg from "../../assets/images/lock_icon.png";
import unlockImg from "../../assets/images/unlock_icon.png";
import userImg from "../../assets/images/multi_people_icon.png";
import languageImg from "../../assets/images/multi_language_icon.png";
import goRoomBtn from "../../assets/images/multi_go_game_btn.png";
import nogoRoomBtn from "../../assets/images/multi_nogo_game_btn.png";

const RoomItem = ({ room, onEnterClick }) => {
  return (
    <div className="w-[260px] h-[160px] bg-[#1B103E] border-4 border-[#51E2F5] rounded-xl px-5 py-3 shadow-md flex flex-col justify-between hover:scale-[1.02] transition">
      
      {/* 방 제목 */}
      <div className="flex items-center gap-2 text-lg text-white truncate">
        <img src={room.isPublic ? unlockImg : lockImg} alt="Lock" className="w-6 h-6" />
        {room.title}
      </div>

      {/* 언어 */}
      <div className="flex items-center gap-2 -mb-8 text-white text-m">
        <img src={languageImg} alt="Language" className="w-6 h-6" />
        <span>{room.language}</span>
      </div>

      {/* 인원수 + 상태 + 입장 버튼 */}
      <div className="flex items-center justify-between w-full mt-1 text-white text-m">
        
        {/* 인원 정보 */}
        <div className="flex items-center gap-2">
          <img src={userImg} alt="User" className="w-6 h-6" />
          <span>{room.currentPeople}/{room.standardPeople}명</span>
        </div>

        {/* 상태 + 입장 버튼 */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs 
            ${room.status === "waiting" ? "bg-green-400 text-black" : "bg-red-400 text-black"}`}>
            {room.status === "waiting" ? "대기중" : "게임중"}
          </span>
          <button 
            className={`w-16 transition  hover:brightness-110 hover:scale-[0.98] active:scale-[0.95] ${room.status !== "waiting" ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={room.status !== "waiting"}
            onClick={() => onEnterClick(room)} // 클릭하면 room 넘김
          >
            <img src={room.status === "waiting" ? goRoomBtn : nogoRoomBtn} alt="go room" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default RoomItem;



