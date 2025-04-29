import React, { useEffect, useRef } from "react";

export default function FallingWord({ word, duration, left, groundY, onEnd }) {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 초기 위치/스타일
    el.style.transform = "translateY(0px)";
    el.style.left = left != null ? `${left}%` : "50%";
    el.style.transition = `transform ${duration}ms linear`;

    // transition 끝나면 onEnd 호출
    const handleTransitionEnd = () => onEnd();
    el.addEventListener("transitionend", handleTransitionEnd);

    // 애니메이션 시작: 땅 위치 + 추가 여유 20px
    requestAnimationFrame(() => {
      const wordHeight = el.offsetHeight;
      const translateY = groundY - wordHeight + 40;
      el.style.transform = `translateY(${translateY}px)`;
    });

    return () => el.removeEventListener("transitionend", handleTransitionEnd);
  }, [groundY, duration, left, onEnd]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 0,
        whiteSpace: "nowrap",
        fontSize: "2rem",
        color: "#fff",
        textShadow: "0 0 3px #000",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {word}
    </div>
  );
}