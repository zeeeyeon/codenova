import React, { useEffect } from "react";

const CustomAlert = ({ message = "메시지를 입력해주세요.", onConfirm, confirmText = "확인" }) => {
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onConfirm]);
  
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="w-[28rem] px-8 py-6 bg-gradient-to-br from-[#1f0e38] to-[#3a216d] border-4 border-cyan-400 rounded-2xl shadow-2xl text-white text-center font-pixel">
        <div className="text-xl mb-6">{message}</div>

        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg rounded-2xl shadow-lg hover:brightness-110 hover:scale-105 active:scale-95 transition-transform duration-150"
        >
          {confirmText}
        </button>

      </div>
    </div>
  );
};

export default CustomAlert;
