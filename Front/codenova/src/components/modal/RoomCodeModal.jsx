import React from "react";
import modalBg from "../../assets/images/board3.png";
import enterBtn from "../../assets/images/go_game_button.png";
import randomBtn from "../../assets/images/gorandom_button.png";

const RoomCodeModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 어두운 배경 */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* 모달 박스 */}
      <div
        className="relative z-50 w-[40rem] h-autoj px-6 py-8 flex flex-col items-center justify-center"
        style={{
          backgroundImage: `url(${modalBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <button
          className="absolute top-1 right-4 text-black text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="text-white text-3xl mt-6">Room Code</div>
        <div className="text-white text-lg mt-2">방코드를 입력해주세요 !</div>

        <input
          type="text"
          placeholder="ROOM123"
          className="mt-4 w-64 h-10 px-3 rounded text-black text-lg text-center"
        />

        <div className="flex gap-4 mt-6">
          <img
            src={enterBtn}
            alt="입장하기"
            className="w-[8rem] cursor-pointer hover:brightness-110 hover:scale-105 transition-transform"
          />
          <img
            src={randomBtn}
            alt="랜덤매칭"
            className="w-[8rem] cursor-pointer hover:brightness-110 hover:scale-105 transition-transform"
          />
        </div>
      </div>
    </div>
  );
};

export default RoomCodeModal;
