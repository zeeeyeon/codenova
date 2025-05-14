// components/multi/waiting/RoomInfoPanel.jsx
import React from "react";
import languageIcon from "../../../assets/images/multi_language_icon.png";
import peopleIcon from "../../../assets/images/multi_people_icon.png";
import startBtn from "../../../assets/images/multi_start_btn.png";  
import unReadyBtn from "../../../assets/images/multi_unready_btn.png"; 
import readyBtn from "../../../assets/images/multi_ready_btn.png";  
import exitBtn from "../../../assets/images/multi_exit_btn.png";  
import copyBtn from "../../../assets/images/multi_copy_icon.png";
import CustomAlert from "../../../components/multi/modal/MultiAlertModal";
import { useState } from "react";


const RoomInfoPanel = ({ 
  isPublic, 
  roomCode, 
  language, 
  currentPeople, 
  standardPeople, 
  onLeave, 
  onReady, 
  isReady,
  isHost,
  allReady,
  onStart,
  canstart
}) => {

  const [alertMessage, setAlertMessage] = useState(null);
    
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
            setAlertMessage("방 코드가 복사되었습니다.");
        } catch (err) {
          setAlertMessage("복사에 실패했습니다.")
        }
    }

    // console.log("📦 Panel props:", { isPublic, roomCode });

  
    return (
    <div className="w-[200px] h-[230px] bg-[#0D0D2B] bg-opacity-70 rounded-2xl flex flex-col items-center p-4 justify-between mt-7">
      
      {/* 상단 정보 */}
      <div className="w-full text-center text-white mb-4 mt-2">
        {isPublic ? (
          <div className="space-y-3 flex flex-col items-center text-white text-xl">
            <div className="flex items-center gap-2">
              <img src={languageIcon} alt="language" className="w-7 h-7" />
              <span className="">{language}</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={peopleIcon} alt="people" className="w-7 h-7" />
              <span className="">{currentPeople} / {standardPeople} 명</span>
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
<div className="w-full flex flex-col items-center gap-y-3">
  {/* 나가기 버튼 */}
  <button onClick={onLeave} className="w-[145px] h-[45px] hover:brightness-110 hover:scale-95 transition">
    <img src={exitBtn} alt="Exit" className="w-full h-full object-contain" />
  </button>

    {isHost ? (
      <div className="relative group w-[145px] h-[45px]">
      <button
        onClick={onStart}
        disabled={!canstart}
        className={`w-full h-full transition ${
          canstart ? "hover:brightness-110 hover:scale-95" : "opacity-50 cursor-not-allowed"
        }`}
      >
        <img src={startBtn} alt="Start" className="w-full h-full object-contain" />
      </button>
    
      {/* 툴팁 (hover 시 표시) */}
      {!canstart && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block z-20">
          <div className="bg-yellow-400 text-black text-m font-bold px-3 py-2 rounded-md shadow-md relative whitespace-nowrap">
          최소 2명이 모여야<br /> 시작할 수 있어요!
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-yellow-400 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
    ) : (
      <button onClick={onReady} className="w-[145px] h-[45px] hover:brightness-110 hover:scale-95 transition">
        <img 
          src={isReady ? unReadyBtn : readyBtn} 
          alt={isReady ? "Unready" : "Ready"} 
          className="w-full h-full object-contain"
        />
      </button>
    )}
  </div>
    
      {alertMessage && (
      <CustomAlert 
          message={alertMessage} 
          onConfirm={() => setAlertMessage(null)} />
        )}
    </div>
  );
};

export default RoomInfoPanel;
