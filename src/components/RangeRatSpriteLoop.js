import { useEffect, useState } from 'react';

const FRAME = 52;
const COLS = 5;
const FRAME_COUNT = 17;
const FPS = 6;
const SCALE = 5;

function RangeRatSpriteLoop({ sheet, ariaLabel, startFrame = 0 }) {
  const [frame, setFrame] = useState(startFrame % FRAME_COUNT);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) {
      return undefined;
    }

    const id = window.setInterval(() => {
      setFrame((current) => (current + 1) % FRAME_COUNT);
    }, 1000 / FPS);

    return () => window.clearInterval(id);
  }, []);

  const size = FRAME * SCALE;
  const col = frame % COLS;
  const row = Math.floor(frame / COLS);

  return (
    <div
      className="range-rat-sprite-frame"
      role="img"
      aria-label={ariaLabel}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${sheet})`,
        backgroundSize: `${260 * SCALE}px ${208 * SCALE}px`,
        backgroundPosition: `${-col * size}px ${-row * size}px`,
      }}
    />
  );
}

export default RangeRatSpriteLoop;
