import React from "react";
import board3 from "../../assets/images/board3.png";
import customer from "../../assets/images/customer.png";
import endBtn from "../../assets/images/end_game_button.png";
import retryBtn from "../../assets/images/try_again_button.png";
import goWaitingRoomBtn from "../../assets/images/waitingRoom.png";

const GameResultModal = ({ results, success, onExit, onRetry }) => {

  
  return (
    <div className="fixed inset-0 z-[1000] bg-black bg-opacity-70 flex items-center justify-center">
      <div className="relative w-[56rem] h-[38rem] bg-contain bg-no-repeat bg-center" style={{ backgroundImage: `url(${board3})` }}>
      <div className="absolute top-32 w-full text-center text-white text-2xl" >
        {success ? "지구를 지켰습니다!" : "유성으로부터 지구를 지킬 수 없습니다.."}
      </div>
      <div className="absolute top-56 w-full flex justify-center gap-8">
      {results.map((r, idx) => {
        const myNickname = localStorage.getItem("nickname");
        const isMe = r.nickname === myNickname;

        return (
          <div key={idx} className="flex flex-col items-center">
            <img src={customer} alt="user" className="w-[5.5rem] h-[5.5rem]" />
            <div className={`mt-2 text-lg ${isMe ? "text-cyan-300" : "text-white"}`}>
              {r.nickname}
            </div>
            <div className={`text-xl ${isMe ? "text-cyan-300" : "text-white"}`}>
              {r.correctCount}개
            </div>
          </div>
        );
      })}
    </div>


        {/* 버튼들 */}
        <div className="absolute bottom-28 w-full flex justify-center gap-16">
          <img
            src={endBtn}
            alt="end"
            className="w-[9rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
            onClick={onExit}
          />
          <img
            src={goWaitingRoomBtn}
            alt="retry"
            className="w-[9rem] cursor-pointer transition-all duration-150 hover:brightness-110 hover:translate-y-[2px] hover:scale-[0.98] active:scale-[0.95]"
            onClick={onRetry}
          />
        </div>
      </div>
    </div>
  );
};

export default GameResultModal;
