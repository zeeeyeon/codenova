import React, { useState } from "react";
import modalBg from "../../../assets/images/board3.png";
import cancleBtn from "../../../assets/images/multi_cancel_btn.png";  //  취소 버튼
import goRoomBtn from "../../../assets/images/multi_go_game_room.png"; //  입장 버튼

const EnterRoomModal = ({ 
    isPrivate, 
    roomTitle, 
    roomLanguage, 
    currentPeople,
    standardPeople,
    onClose, 
    onEnter,
  }) => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleEnter = () => {
    onEnter(roomCode, (success) => {
      if (!success) {
        setError(true);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    });
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="relative top-[13%] w-[600px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* 배경 이미지 */}
        <img
          src={modalBg}
          alt="modal background"
          className="absolute inset-0  object-cover rounded-2xl"
        />

        {/* 내용 */}
        <div className="relative z-10 flex flex-col items-center h-full text-white px-6 py-8">

          {/* 비공개방 (코드 입력) */}
          {isPrivate ? (
            <>
              <h2 className="text-3xl  mb-2">Room Code</h2>
              <p className="text-3xl  mb-2 text-fuchsia-400">[{roomTitle}]</p>
              <p className="text-m text-gray-300 mb-2">방 코드를 입력해주세요!</p>

              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                    setRoomCode(e.target.value);
                    if (error) setError(false); // 수정 시 에러 해제
                  }}
                onKeyDown={(e) => {
                  if (e.key === "Enter")  handleEnter();
                }}
                onFocus={(e) => (e.target.placeholder = "")} // 포커스 되면 placeholder 삭제
                onBlur={(e) => (e.target.placeholder = "방 코드 입력")} // 포커스 풀리면 다시 복구
                className={`border rounded px-4 py-2 text-black text-xl w-[240px] mb-4 mx-auto text-center 
                    ${error ? 'border-red-500 border-4' : ''} 
                    ${shake ? 'animate-shake' : ''}`}   // 에러시 테두리 빨간색 + 흔들림
                  placeholder="방 코드 입력"
              />

                <div className="flex gap-16 mt-2">
                {/* 취소 버튼 */}
                <button
                  onClick={onClose}
                  className="w-[120px] h-[50px] hover:brightness-110 hover:scale-95 transition"
                >
                  <img src={cancleBtn} alt="취소" className="w-full h-full object-contain" />
                </button>

                {/* 입장 버튼 */}
                <button
                  onClick={handleEnter}
                  className="w-[120px] h-[50px] hover:brightness-110 hover:scale-95 transition"
                >
                  <img src={goRoomBtn} alt="입장" className="w-full h-full object-contain" />
                </button>
              </div>
            </>
          ) : (
          /* 공개방 (그냥 입장) */
            <>
              <h2 className="text-3xl mb-2">입장하시겠습니까?</h2>
              <p className="text-3xl mt-4 mb-4 text-fuchsia-400">[{roomTitle}]</p>

              <p className="text-xl text-gray-300 mb-1">언어: {roomLanguage}</p>
              <p className="text-xl text-gray-300 mb-2">인원: {currentPeople}/{standardPeople}명</p>

              <div className="flex justify-center gap-16 mt-3">
                {/* 취소 버튼 */}
                <button
                  onClick={onClose}
                  className="w-[120px] h-[50px] hover:brightness-110 hover:scale-95 transition"
                >
                  <img src={cancleBtn} alt="취소" className="w-full h-full object-contain" />
                </button>

                {/* 입장 버튼 */}
                <button
                  onClick={() => onEnter()}
                  className="w-[120px] h-[50px] hover:brightness-110 hover:scale-95 transition"
                >
                  <img src={goRoomBtn} alt="입장" className="w-full h-full object-contain" />
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default EnterRoomModal;
