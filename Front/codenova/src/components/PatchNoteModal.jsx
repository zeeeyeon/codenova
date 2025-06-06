// components/PatchNoteModal.jsx
import React from "react";

const PatchNoteModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center animate-fade-in">
      <div className="bg-gradient-to-br from-[#0f0f1f] to-[#1a1a2e] text-white rounded-2xl p-8 w-[50%] shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10 animate-slide-up">
        <h2 className="text-4xl font-bold mb-6 text-center text-pink-400  tracking-wide animate-pulse">
          🚀 CodeNova v1.2.3 업데이트
        </h2>

        <div className="space-y-3 text-[17px] leading-relaxed">
          <PatchItem text="🙏 필수!! - 인증 로직이 변경에 따라 에러시 재로그인 해주세요 " />
          <PatchItem text="⌨️ 싱글 모드 - 코드 설명 및 AI 챗봇 기능이 추가되었습니다 (코드 설명 페이지 우측 하단)" />
          <PatchItem text="⌨️ 싱글 모드 - 이제 코드 입력시 정답 코드 길이 이상 칠 수 없어요(방향키 사용 동작 X)" />
          <PatchItem text="🎬 멀티 모드 - 이제 대기방에서 방 설정을 바꿀 수 있습니다!!" />
          <PatchItem text="🌠 유성 모드 - 잠수 유저 자동 감지 및 자동 강퇴 기능 추가!!" />
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
