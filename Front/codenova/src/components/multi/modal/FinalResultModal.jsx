import React from "react";

const FinalResultModal = ({ visible, results = [], onClose }) => {
  if (!visible) return null;

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
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default FinalResultModal;
