import { useEffect, useRef, useState } from "react";

export default function FallingWord({
  word,
  duration,
  left,
  groundY,
  spawnTime,
  onEnd,
}) {
  const [y, setY] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const elapsed = now - spawnTime;
      const progress = Math.min(elapsed / duration, 1);
      const FALL_END_OFFSET = 140;
      const nextY = progress * (groundY - FALL_END_OFFSET);
      // console.log(`[${word}] elapsed: ${elapsed}ms, progress: ${progress.toFixed(2)}, y: ${nextY.toFixed(1)}`);

      if (elapsed >= duration) {
        setY(groundY);
        onEnd();
        return;
      }

      setY(nextY);
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(rafRef.current);
  }, [spawnTime, duration, groundY, onEnd]);

  return (
    <div
      style={{
        position: "absolute",
        top: `${y}px`,
        left: `${left}%`,
        whiteSpace: "nowrap",
        fontSize: "2rem",
        color: "#fff",
        textShadow: "0 0 3px #000",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 100,
        // fontFamily : "D2Coding"
      }}
    >
      {word}
    </div>
  );
}
