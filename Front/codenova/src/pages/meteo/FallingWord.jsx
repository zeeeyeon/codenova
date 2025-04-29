
// FallingWord.jsx
import React, { useEffect, useRef } from "react";

export default function FallingWord({ word, duration, left, groundY, onEnd }) {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    const wordHeight = el.offsetHeight;

    const handleTransitionEnd = () => onEnd();
    el.addEventListener("transitionend", handleTransitionEnd);

    requestAnimationFrame(() => {
      const translateY = groundY - wordHeight;
      el.style.transform = `translateY(${translateY}px)`;
    });

    return () => {
      el.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [groundY, onEnd]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 0,
        left: `${left}%`,
        whiteSpace: "nowrap",
        transition: `transform ${duration}ms linear`,
        fontSize: "4rem",
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