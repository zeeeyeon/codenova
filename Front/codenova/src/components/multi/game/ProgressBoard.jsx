import React from "react";

const ProgressBoard = ({ users }) => {
    return (
      <div className="flex flex-col items-start justify-center w-[95%] h-full gap-1 mt-1">
        {users.map((user, idx) => (
          <div key={idx} className="flex items-center w-full h-12">
            
            {/* 닉네임 영역 - 고정 폭 */}
            <div className="w-32 text-right pr-4 text-white text-sm whitespace-nowrap">
              {user.nickname}
            </div>
  
            {/* 트랙 + 로켓 */}
            <div className="relative flex-1 h-full flex items-center pr-8">
              {/* 점선 트랙 */}
              <div className="w-full border-t-2 border-dashed border-white w-[98%] absolute top-1/2 -translate-y-1/2" />
  
              {/* 로켓 */}
              <img
                src={user.rocketImage}
                alt="rocket"
                className="w-8 h-8 rotate-90 absolute -translate-y-1/2 top-[52%] transition-all duration-300"
                style={{ left: `${user.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };
  

export default ProgressBoard;
