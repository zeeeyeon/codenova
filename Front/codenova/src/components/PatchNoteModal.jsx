// components/PatchNoteModal.jsx
import React from "react";

const PatchNoteModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center animate-fade-in">
      <div className="bg-gradient-to-br from-[#0f0f1f] to-[#1a1a2e] text-white rounded-2xl p-8 w-[50%] shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10 animate-slide-up">
        <h2 className="text-4xl font-bold mb-6 text-center text-pink-400  tracking-wide animate-pulse">
          🚀 CodeNova v1.0.3 업데이트
        </h2>

        <div className="space-y-3 text-[17px] leading-relaxed">
          <PatchItem text="🌠 유성 모드 - 잠수 유저 강제 퇴장 기능 추가" />
          <PatchItem text="🌧️ 유성 모드 - 하루 이벤트로 유성 속도가 느려졌습니다" />
          <PatchItem text="🎬 멀티 모드 - 랜덤언어로 플레이가 가능합니다" />
          <PatchItem text="🛠️ 설정 - 색약유저를 위한 색깔 지정 기능 추가" />
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-pink-500 text-white rounded-full  hover:bg-pink-600 active:scale-95 transition-all shadow-md shadow-pink-400/40"
          >
            확인했어요
          </button>
        </div>   
      </div>
    </div>
  );
};

const PatchItem = ({ text }) => (
  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 transition-transform hover:scale-[1.02] shadow-inner shadow-white/5">
    {text}
  </div>
);

export default PatchNoteModal;
