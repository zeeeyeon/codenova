import React, { useState } from "react";
import modalBg from "../../../assets/images/board3.png";
import cancleBtn from "../../../assets/images/cancle_btn_2.png";  //  취소 버튼
import goRoomBtn from "../../../assets/images/multi_go_room_btn.png"; //  입장 버튼

const EnterRoomModal = ({ 
    isPrivate, 
    roomTitle, 
    roomLanguage, 
    currentPeople,
    standardPeople,
    onClose, 
    onEnter, 
    correctRoomCode }) => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

    const handleEnter = () => {
    if (roomCode === correctRoomCode) {
        onEnter(roomCode); // ✅ 성공!
    } else {
        setError(true);    // ❌ 에러 표시
        setShake(true);    // ❌ 흔들림 추가
        setTimeout(() => {
        setShake(false);
        }, 500); // 흔들림은 0.5초만
    }
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
              <p className="text-2xl  mb-2 text-fuchsia-400">[{roomTitle}]</p>
              <p className="text-m text-gray-300 mb-4">방 코드를 입력해주세요!</p>

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

                <div className="flex gap-12 mt-2">
                {/* 취소 버튼 */}
                <button
                  onClick={onClose}
                  className="w-[100px] h-[40px] hover:brightness-110 hover:scale-95 transition"
                >
                  <img src={cancleBtn} alt="취소" className="w-full h-full object-contain" />
                </button>

                {/* 입장 버튼 */}
                <button
                  onClick={handleEnter}
                  className="w-[105px] h-[40px] hover:brightness-110 hover:scale-95 transition"
                >
                  <img src={goRoomBtn} alt="입장" className="w-full h-full object-contain" />
                </button>
              </div>
            </>
          ) : (
          /* 공개방 (그냥 입장) */
            <>
              <h2 className="text-3xl mb-2">입장하시겠습니까?</h2>
              <p className="text-2xl mt-6 mb-4 text-fuchsia-400">[{roomTitle}]</p>

              <p className="text-xl text-gray-300 mb-1">언어: {roomLanguage}</p>
              <p className="text-xl text-gray-300 mb-2">인원: {currentPeople}/{standardPeople}명</p>

              <div className="flex justify-center gap-12 mt-4">
                {/* 취소 버튼 */}
                <button
                  onClick={onClose}
                  className="w-[100px] h-[40px] hover:brightness-110 hover:scale-95 transition"
                >
                  <img src={cancleBtn} alt="취소" className="w-full h-full object-contain" />
                </button>

                {/* 입장 버튼 */}
                <button
                  onClick={() => onEnter()}
                  className="w-[100px] h-[40px] hover:brightness-110 hover:scale-95 transition"
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
