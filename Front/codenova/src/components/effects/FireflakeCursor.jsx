import { useEffect, useRef } from 'react';

const FireflakeCursor = ({ element }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const canvImages = useRef([]);
  const animationFrame = useRef(null);
  const possibleEmoji = ['🔥'];
  const prefersReducedMotion = useRef(null);

  // 🔥 파티클 생성 간격 설정 (ms): 숫자가 클수록 덜 자주 나옴
  const throttleDelay = 80;
  let lastMoveTime = 0;

  // 🔥 동시에 존재할 수 있는 최대 파티클 수
  const MAX_PARTICLES = 100;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)');

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    const targetElement = element || document.body;
    canvas.style.position = element ? 'absolute' : 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    targetElement.appendChild(canvas);
    canvasRef.current = canvas;

    const setCanvasSize = () => {
      canvas.width = element ? targetElement.clientWidth : window.innerWidth;
      canvas.height = element ? targetElement.clientHeight : window.innerHeight;
    };

    const createEmojiImages = () => {
      context.font = '14px serif'; // 불꽃 크기
      context.textBaseline = 'middle';
      context.textAlign = 'center';

      possibleEmoji.forEach((emoji) => {
        const measurements = context.measureText(emoji);
        const bgCanvas = document.createElement('canvas');
        const bgContext = bgCanvas.getContext('2d');
        if (!bgContext) return;

        bgCanvas.width = measurements.width;
        bgCanvas.height = measurements.actualBoundingBoxAscent * 2;

        bgContext.textAlign = 'center';
        bgContext.font = '12px serif';
        bgContext.textBaseline = 'middle';
        bgContext.fillText(
          emoji,
          bgCanvas.width / 2,
          measurements.actualBoundingBoxAscent
        );

        canvImages.current.push(bgCanvas);
      });
    };

    const addParticle = (x, y) => {
      if (particles.current.length > MAX_PARTICLES) {
        particles.current.shift(); // 오래된 파티클 제거
      }

      const randomImage = canvImages.current[Math.floor(Math.random() * canvImages.current.length)];
      particles.current.push(new Particle(x, y, randomImage));
    };

    const onMouseMove = (e) => {
      const now = Date.now();
      if (now - lastMoveTime < throttleDelay) return;
      lastMoveTime = now;

      const x = element ? e.clientX - targetElement.getBoundingClientRect().left : e.clientX;
      const y = element ? e.clientY - targetElement.getBoundingClientRect().top : e.clientY;
      addParticle(x, y);
    };

    const updateParticles = () => {
      if (!context || !canvas) return;
      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((particle, index) => {
        particle.update(context);
        if (particle.lifeSpan < 0) {
          particles.current.splice(index, 1);
        }
      });
    };

    const animationLoop = () => {
      updateParticles();
      animationFrame.current = requestAnimationFrame(animationLoop);
    };

    const init = () => {
      if (prefersReducedMotion.current?.matches) return;
      setCanvasSize();
      createEmojiImages();
      targetElement.addEventListener('mousemove', onMouseMove);
      window.addEventListener('resize', setCanvasSize);
      animationLoop();
    };

    const destroy = () => {
      if (canvasRef.current) canvasRef.current.remove();
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      targetElement.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', setCanvasSize);
    };

    prefersReducedMotion.current.onchange = () => {
      if (prefersReducedMotion.current?.matches) {
        destroy();
      } else {
        init();
      }
    };

    init();
    return () => destroy();
  }, [element]);

  return null;
};

/**
 * 🔥 파티클 클래스
 * 이곳에서 불꽃의 움직임, 수명, 스케일 조절 가능
 */
class Particle {
  position;
  velocity;
  lifeSpan;
  initialLifeSpan;
  canv;

  constructor(x, y, canvasItem) {
    this.position = { x, y };

    this.velocity = {
      x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2), // 좌우 흔들림 정도
      y: 1 + Math.random(), // 위로 올라가는 속도 (높을수록 빠름)
    };

    // 🔥 파티클 수명 (프레임 단위): 작을수록 빨리 사라짐
    this.lifeSpan = Math.floor(Math.random() * 60 + 60);
    this.initialLifeSpan = this.lifeSpan;

    this.canv = canvasItem;
  }

  update(context) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.lifeSpan--;

    // 흔들림 정도 조절
    this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
    this.velocity.y -= Math.random() / 300; // 천천히 감속 (위쪽으로)

    const scale = Math.max(this.lifeSpan / this.initialLifeSpan, 0);

    context.save();
    context.translate(this.position.x, this.position.y);
    context.scale(scale, scale);
    context.drawImage(this.canv, -this.canv.width / 2, -this.canv.height / 2);
    context.restore();
  }
}

export default FireflakeCursor;
// 'use client';
// import { useEffect, useRef } from 'react';
// const FireflakeCursor = ({ element }) => {
//   const canvasRef = useRef(null);
//   const particles = useRef([]);
//   const canvImages = useRef([]);
//   const animationFrame = useRef(null);
//   const possibleEmoji = ['🔥'];
//   const prefersReducedMotion = useRef(null);
//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     prefersReducedMotion.current = window.matchMedia(
//       '(prefers-reduced-motion: reduce)'
//     );
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     if (!context) return;
//     const targetElement = element || document.body;
//     canvas.style.position = element ? 'absolute' : 'fixed';
//     canvas.style.top = '0';
//     canvas.style.left = '0';
//     canvas.style.pointerEvents = 'none';
//     targetElement.appendChild(canvas);
//     canvasRef.current = canvas;
//     const setCanvasSize = () => {
//       canvas.width = element ? targetElement.clientWidth : window.innerWidth;
//       canvas.height = element ? targetElement.clientHeight : window.innerHeight;
//     };
//     const createEmojiImages = () => {
//       context.font = '12px serif';
//       context.textBaseline = 'middle';
//       context.textAlign = 'center';
//       possibleEmoji.forEach((emoji) => {
//         const measurements = context.measureText(emoji);
//         const bgCanvas = document.createElement('canvas');
//         const bgContext = bgCanvas.getContext('2d');
//         if (!bgContext) return;
//         bgCanvas.width = measurements.width;
//         bgCanvas.height = measurements.actualBoundingBoxAscent * 2;
//         bgContext.textAlign = 'center';
//         bgContext.font = '12px serif';
//         bgContext.textBaseline = 'middle';
//         bgContext.fillText(
//           emoji,
//           bgCanvas.width / 2,
//           measurements.actualBoundingBoxAscent
//         );
//         canvImages.current.push(bgCanvas);
//       });
//     };
//     const addParticle = (x, y) => {
//       const randomImage =
//         canvImages.current[
//           Math.floor(Math.random() * canvImages.current.length)
//         ];
//       particles.current.push(new Particle(x, y, randomImage));
//     };
//     const onMouseMove = (e) => {
//       const x = element
//         ? e.clientX - targetElement.getBoundingClientRect().left
//         : e.clientX;
//       const y = element
//         ? e.clientY - targetElement.getBoundingClientRect().top
//         : e.clientY;
//       addParticle(x, y);
//     };
//     const updateParticles = () => {
//       if (!context || !canvas) return;
//       context.clearRect(0, 0, canvas.width, canvas.height);
//       particles.current.forEach((particle, index) => {
//         particle.update(context);
//         if (particle.lifeSpan < 0) {
//           particles.current.splice(index, 1);
//         }
//       });
//     };
//     const animationLoop = () => {
//       updateParticles();
//       animationFrame.current = requestAnimationFrame(animationLoop);
//     };
//     const init = () => {
//       if (prefersReducedMotion.current?.matches) return;
//       setCanvasSize();
//       createEmojiImages();
//       targetElement.addEventListener('mousemove', onMouseMove);
//       window.addEventListener('resize', setCanvasSize);
//       animationLoop();
//     };
//     const destroy = () => {
//       if (canvasRef.current) {
//         canvasRef.current.remove();
//       }
//       if (animationFrame.current) {
//         cancelAnimationFrame(animationFrame.current);
//       }
//       targetElement.removeEventListener('mousemove', onMouseMove);
//       window.removeEventListener('resize', setCanvasSize);
//     };
//     prefersReducedMotion.current.onchange = () => {
//       if (prefersReducedMotion.current?.matches) {
//         destroy();
//       } else {
//         init();
//       }
//     };
//     init();
//     return () => destroy();
//   }, [element]);
//   return null;
// };
// class Particle {
//   position;
//   velocity;
//   lifeSpan;
//   initialLifeSpan;
//   canv;
//   constructor(x, y, canvasItem) {
//     this.position = { x, y };
//     this.velocity = {
//       x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
//       y: 1 + Math.random(),
//     };
//     this.lifeSpan = Math.floor(Math.random() * 60 + 80);
//     this.initialLifeSpan = this.lifeSpan;
//     this.canv = canvasItem;
//   }
//   update(context) {
//     this.position.x += this.velocity.x;
//     this.position.y += this.velocity.y;
//     this.lifeSpan--;
//     this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
//     this.velocity.y -= Math.random() / 300;
//     const scale = Math.max(this.lifeSpan / this.initialLifeSpan, 0);
//     context.save();
//     context.translate(this.position.x, this.position.y);
//     context.scale(scale, scale);
//     context.drawImage(this.canv, -this.canv.width / 2, -this.canv.height / 2);
//     context.restore();
//   }
// }
// export default FireflakeCursor;