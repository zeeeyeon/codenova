// FallingWord.jsx
import React, { useEffect, useRef } from "react";

export default function FallingWord({
  word,
  duration,
  left,      // 숫자: 0 ~ 100
  groundY,
  onEnd,
}) {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 1) 초기
    el.style.position   = "absolute";
    el.style.top        = "0px";
    el.style.left       = `${left}%`;      // ← 여기에만 % 붙이기
    el.style.transition = `transform ${duration}ms linear`;

    // 2) 트랜지션 끝나면 onEnd 호출
    const done = () => onEnd();
    el.addEventListener("transitionend", done);

    // 3) 애니메이션 시작
    requestAnimationFrame(() => {
      const wordH = el.offsetHeight;
      // +40px 여유를 주려면 groundY - wordH + 40
      const translateY = groundY - wordH + 40;
      el.style.transform = `translateY(${translateY}px)`;
    });

    return () => el.removeEventListener("transitionend", done);
  }, [groundY, duration, left, onEnd]);

  return (
    <div ref={ref} style={{
      whiteSpace: "nowrap",
      fontSize: "2rem",
      color: "#fff",
      textShadow: "0 0 3px #000",
      pointerEvents: "none",
      userSelect: "none",
    }}>
      {word}
    </div>
  );
}
