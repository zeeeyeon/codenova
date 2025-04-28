// components/multi/waiting/RoomInfoPanel.jsx
import React from "react";
import languageIcon from "../../../assets/images/multi_language_icon.png";
import peopleIcon from "../../../assets/images/multi_people_icon.png";
import startBtn from "../../../assets/images/multi_start_btn.png";  
import unReadyBtn from "../../../assets/images/multi_unready_btn.png"; 
import readyBtn from "../../../assets/images/multi_ready_btn.png";  
import exitBtn from "../../../assets/images/multi_exit_btn.png";  
import copyBtn from "../../../assets/images/multi_copy_icon.png";


const RoomInfoPanel = ({ isPublic, roomCode, language, currentPeople, standardPeople, onLeave, onReady, isReady }) => {
    
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
            alert("방 코드가 복사되었습니다.");
        } catch (err) {
            alert("복사에 실패했습니다.")
        }
    }

  
    return (
    <div className="w-[200px] h-[220px] bg-[#0D0D2B] bg-opacity-70 rounded-2xl flex flex-col items-center p-4 justify-between mt-5">
      
      {/* 상단 정보 */}
      <div className="w-full text-center text-white mb-4 mt-2">
        {isPublic ? (
          <div className="space-y-3 flex flex-col items-center text-white text-xl">
            <div className="flex items-center gap-2">
              <img src={languageIcon} alt="language" className="w-7 h-7" />
              <span className="text-base">{language}</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={peopleIcon} alt="people" className="w-7 h-7" />
              <span className="text-base">{currentPeople} / {standardPeople}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl">방 코드</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{roomCode}</span>
              <button onClick={handleCopy} className="w-7 h-7 hover:scale-110 transition">
                <img src={copyBtn} alt="Copy" className="w-full h-full object-contain" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="w-full flex flex-col items-center gap-y-1">
        {/* 나가기 버튼 */}
        <button onClick={onLeave} className="w-[145px] h-[45px] hover:brightness-110 hover:scale-95 transition">
          <img src={exitBtn} alt="Exit" className="w-full h-full object-contain" />
        </button>

        {/* Ready/Unready 버튼 */}
        <button onClick={onReady} className="w-[145px] h-[45px] hover:brightness-110 hover:scale-95 transition">
          <img 
            src={isReady ? unReadyBtn : readyBtn} 
            alt={isReady ? "Unready" : "Ready"} 
            className={`${isReady ? "scale-95" : "scale-100"} w-full h-full object-contain`} 
          />
        </button>
      </div>

    </div>
  );
};

export default RoomInfoPanel;
