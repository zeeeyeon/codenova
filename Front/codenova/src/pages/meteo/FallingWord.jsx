import React, { useEffect, useRef } from "react";

export default function FallingWord({
  word,
  duration,  // 서버에서 받은 “풀 높이→0까지” 기준 duration
  left,      // % (0~100)
  groundY,
  onEnd,
}) {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 1) 초기 스타일
    el.style.position    = "absolute";
    el.style.top         = "0px";
    el.style.left        = `${left}%`;
    el.style.willChange  = "transform";             // GPU 가속
    el.style.transform   = "translateY(0px)";

    // 2) 하강 거리 계산
    const wordH = el.offsetHeight;
    const fullDrop = groundY;                        // top:0 → groundY
    const distance = groundY - wordH -80;           // +여유
    // 3) 속도 고정: 풀 높이에 비례해 duration 재계산
    const pxPerMs = fullDrop / duration;
    const actualDuration = distance / pxPerMs;

    el.style.transition = `transform ${actualDuration}ms linear`;

    // 4) 트랜지션 끝나면 onEnd 호출
    const done = () => onEnd();
    el.addEventListener("transitionend", done);

    // 5) 다음 프레임에 애니메이션 시작
    requestAnimationFrame(() => {
      el.style.transform = `translateY(${distance}px)`;
    });

    return () => el.removeEventListener("transitionend", done);
  }, [groundY, duration, left, onEnd]);

  return (
    <div
      ref={ref}
      style={{
        whiteSpace: "nowrap",
        fontSize: "2rem",
        color: "#fff",
        textShadow: "0 0 3px #000",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: "100",
      }}
    >
      {word}
    </div>
  );
}
