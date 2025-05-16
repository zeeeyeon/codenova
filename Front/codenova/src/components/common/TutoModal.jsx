import React, { useState } from "react";
import tuto1 from "../../assets/tuto/1.png";
import tuto2 from "../../assets/tuto/2.png";
import tuto3 from "../../assets/tuto/3.png";
import tuto4 from "../../assets/tuto/4.png";
import tuto5 from "../../assets/tuto/5.png";
import tuto6 from "../../assets/tuto/6.png";
import tuto7 from "../../assets/tuto/7.png";
import tuto8 from "../../assets/tuto/8.png";
import closeIcon from "../../assets/images/x_btn.png"; // X 아이콘 추가 필요

const images = [tuto1, tuto2, tuto3, tuto4, tuto5, tuto6, tuto7, tuto8];

const TutoModal = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < images.length - 1) setStep(step + 1);
    else onClose(); // 마지막이면 종료
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 font-[PixelFont]">
  <div className="relative w-[55rem] max-w-[95%] p-4 border-2 border-cyan-400 bg-[#0F111A] rounded-xl shadow-2xl flex flex-col items-center">
    {/* 닫기 버튼 */}
    <img
      src={closeIcon}
      alt="닫기"
      className="absolute top-1 right-1 w-5 h-5 cursor-pointer hover:scale-110 transition"
      onClick={onClose}
    />
    
    {/* 튜토리얼 이미지 */}
    <img
      src={images[step]}
      alt={`튜토리얼 ${step + 1}`}
      className="rounded-lg border border-cyan-500 max-h-[60vh] mb-6"
    />

    {/* 하단 네비게이션 */}
    <div className="flex justify-between w-full px-8">
      <button
        onClick={handlePrev}
        disabled={step === 0}
        className="px-6 py-2 border border-cyan-400 text-cyan-300 hover:bg-cyan-800 transition disabled:opacity-30"
      >
        ◀ 이전
      </button>
      <button
        onClick={handleNext}
        className="px-6 py-2 border border-cyan-400 text-cyan-300 hover:bg-cyan-800 transition"
      >
        {step === images.length - 1 ? "닫기" : "다음 ▶"}
      </button>
    </div>
  </div>
</div>

  );
};

export default TutoModal;
