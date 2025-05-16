import React from "react";
import userProfileBg from "../../../assets/images/board2.jpg";
import rocket1 from "../../../assets/images/multi_rocket_1.png";
import rocket2 from "../../../assets/images/multi_rocket_2.png";
import rocket3 from "../../../assets/images/multi_rocket_3.png";
import rocket4 from "../../../assets/images/multi_rocket_4.png";
import crownIcon from "../../../assets/images/multi_host_icon.png";

const rockets = [rocket1, rocket2, rocket3, rocket4];

const RoomUserCard = ({ user }) => {
  const isEmptySlot = user.empty;
  const rocketImage = rockets[user.slot - 1];

  return (
    <div className="w-[220px] h-[220px] rounded-2xl  relative flex flex-col items-center justify-center mt-4">
       {!isEmptySlot && user.isHost && (
    <img 
      src={crownIcon} 
      alt="Host" 
      className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 w-16 h-16 z-20" 
    />
  )}
      
      {/* 테두리 배경 */}
      <img
        src={userProfileBg}
        alt="User Profile Background"
        className="absolute inset-0 w-full h-full object-contain rounded-2xl"
      />

      {/* 슬롯 번호 (사용자가 있을 때만) */}
      {!isEmptySlot && (
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-2xl">
          No.{user.slot}
        </div>

        
      )}

      {/* 메인 내용 */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-9">
        {isEmptySlot ? (
          <div className="text-5xl text-gray-400">-</div> 
        ) : (
          <>

          
            <img
              src={rocketImage}
              alt="Rocket"
              className="w-12 h-12 mb-2"
            />
            <div className="text-white text-m mt-1">{user.nickname}</div>
            {/* <div className="text-fuchsia-400 text-sm">{user.typing}</div> */}
            <div className={`mt-2 ${user.isReady ? "text-green-400" : "text-gray-400"}`}>
              {user.isReady ? "Ready" : "Not Ready"}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomUserCard;
