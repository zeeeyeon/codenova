import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const MultiAlertModal = ({
  message = "메시지를 입력해주세요.",
  onConfirm,
  confirmText = "확인",
  showCancel = false,
  onCancel,
}) => {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    confirmButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        onConfirm();
      } else if (e.key === "Escape" && showCancel && onCancel) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onConfirm, onCancel, showCancel]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-70 flex items-center justify-center font-pixel">
      <div className="w-[28rem] px-8 py-6 bg-gradient-to-br from-[#1f0e38] to-[#3a216d] border-4 border-cyan-400 rounded-2xl shadow-2xl text-white text-center">
        <div className="text-xl mb-6 whitespace-pre-line">{message}</div>

        <div className={`flex ${showCancel ? "justify-between" : "justify-center"} gap-4`}>
        <button
          ref={confirmButtonRef}
          onClick={onConfirm}
          className={`px-4 py-2 text-white text-lg rounded-2xl shadow-lg hover:brightness-110 hover:scale-105 active:scale-95 transition-transform duration-150
            bg-gradient-to-r from-purple-500 to-pink-500
            ${showCancel ? "flex-1" : "w-[120px]"}`}
        >
          {confirmText}
        </button>

          {showCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-500 text-white text-lg rounded-2xl shadow-lg hover:brightness-110 hover:scale-105 active:scale-95 transition-transform duration-150"
            >
              취소
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MultiAlertModal;
