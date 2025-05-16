// import React from "react";

// const ProgressBoard = ({ users }) => {
//     return (
//       <div className="flex flex-col items-start justify-center w-[95%] h-full gap-1 mt-1">
//         {users.map((user, idx) => (
//           <div key={idx} className="flex items-center w-full h-12">
            
//             {/* 닉네임 영역 - 고정 폭 */}
//             <div className="w-32 text-right pr-4 text-white text-sm whitespace-nowrap">
//               {user.nickname}
//             </div>
  
//             {/* 트랙 + 로켓 */}
//             <div className="relative flex-1 h-full flex items-center pr-8">
//               {/* 점선 트랙 */}
//               <div className="w-full border-t-2 border-dashed border-white w-[98%] absolute top-1/2 -translate-y-1/2" />
  
//               {/* 로켓 */}
//               <img
//                 src={user.rocketImage}
//                 alt="rocket"
//                 className="w-8 h-8 rotate-90 absolute -translate-y-1/2 top-[52%] transition-all duration-300"
//                 style={{ left: `${user.progress}%` }}
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };
  

// export default ProgressBoard;

import React from "react";
import useAuthStore from "../../../store/authStore";

const ProgressBoard = ({ users, firstFinisher }) => {
  const justifyClass = users.length <= 2 ? "justify-center" : "justify-evenly";
  const myNickname = useAuthStore((state) => state.user?.nickname);

    // 👑 1등 유저 찾기
    const topUser = users.reduce((prev, curr) =>
      curr.progress > prev.progress ? curr : prev,
      users[0]
    );

    return (
      <div className="relative flex flex-col justify-evenly w-[95%] h-full">
  {users.map((user, idx) => (
    <div key={idx} className="flex items-center w-full h-[80px] relative">
      {/* 닉네임 + 왕관 */}
      <div className="w-32 text-right pr-4 text-sm whitespace-nowrap flex items-center justify-end gap-1">
            {(firstFinisher
              ? user.nickname === firstFinisher // 👑 고정된 1등
              : user.nickname === topUser.nickname // 실시간 1등
            ) && <span className="text-yellow-400 text-2xl">👑</span>}

            <span
              className={`${
                user.nickname === myNickname ? "text-yellow-300" : "text-white"
              }`}
            >
              {user.nickname}
            </span>
          </div>

      {/* 트랙 + 로켓 (수직 중앙에 정렬) */}
      <div className="relative flex-1 flex items-center">
        {/* 점선 트랙 */}
        <div className="w-full h-0.5 border-t-2 border-dashed border-white" />

        {/* 로켓 + 진행률 (flex absolute 대신 relative + translateY 제거) */}
        <div
          className="absolute flex flex-col items-center transition-all duration-300"
          style={{ left: `${user.progress}%`, top: "50%", transform: "translateY(-33%)" }}
        >
          <img
            src={user.rocketImage}
            alt="rocket"
            className="w-8 h-8 rotate-90"
          />
          <span className="text-white text-xs">{user.progress}%</span>
        </div>
      </div>
    </div>
  ))}
</div>
    );
  };

export default ProgressBoard;
