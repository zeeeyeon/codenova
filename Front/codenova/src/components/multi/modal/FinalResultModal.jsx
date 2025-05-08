import React from "react";
import { useNavigate } from "react-router-dom";

const FinalResultModal = ({ visible, results = [], onClose, roomInfo }) => {

    console.log("➡️ 이동 시도 roomInfo:", roomInfo);
    const navigate = useNavigate();
  if (!visible) return null;

  const handleConfirm = () => {
    // 대기방으로 이동하면서 최신 roomInfo도 같이 넘김
    navigate(`/multi/room/${String(roomInfo.roomId)}`, {
      state: { roomInfo }, // 공개방 or 비공개방 여부 포함해서 넘김
    });
    onClose(); // 모달 닫기
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[500px] max-w-full p-6 text-center relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 최종 랭킹</h2>
        <ul className="text-lg text-gray-700">
          {results.map((user, index) => (
            <li key={user.nickname} className="mb-2">
              <span className="font-semibold mr-2">{index + 1}위</span>
              <span className="font-semibold mr-2">{user.nickname}</span>
              <span className="font-semibold mr-2">({user.averageScore}점)</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleConfirm}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          대기방으로 이동!
        </button>
      </div>
    </div>
  );
};

export default FinalResultModal;
