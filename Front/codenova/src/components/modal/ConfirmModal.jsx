import React from "react";
import modalBg from "../../assets/images/board3.png";

const ConfirmModal = ({ title, onConfirm, onCancel }) => {


    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 어두운 배경 */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div
        className="relative z-50 w-[37rem] h-[19rem] px-6 py-8 flex flex-col items-center justify-center text-center"
        style={{
          backgroundImage: `url(${modalBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "1rem",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          color: "#fff", // fallback
        }}
      >
        <h2 className="text-2xl text-white mb-4 drop-shadow"> {title} </h2>
        <div className="flex justify-center gap-8 mt-6">
          <button
            onClick={onConfirm}
            className="bg-[#cc3d3d] hover:bg-[#a32e2e] text-white px-5 py-2 rounded-xl shadow-md transition text-xl font-semibold"
          >
            종료
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-black  px-5 py-2 rounded-xl shadow-md transition text-xl font-semibold"
          >
            취소
          </button>
        </div>
      </div>

    </div>
    )
}

export default ConfirmModal;
