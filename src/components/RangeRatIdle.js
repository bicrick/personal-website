import { useEffect, useState } from 'react';
import './RangeRatIdle.css';

const SHEET = `${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-idle-sheet.png`;
const FRAME = 52;
const COLS = 5;
const FRAME_COUNT = 17;
const FPS = 6;
const SCALE = 5;

function RangeRatIdle() {
  const [frame, setFrame] = useState(0);

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
    <figure className="project-figure range-rat-idle-figure">
      <div className="range-rat-idle-row">
        <div
          className="range-rat-idle"
          role="img"
          aria-label="Range Rat idle animation, 17 frames at 6 frames per second"
          style={{
            width: size,
            height: size,
            backgroundImage: `url(${SHEET})`,
            backgroundSize: `${260 * SCALE}px ${208 * SCALE}px`,
            backgroundPosition: `${-col * size}px ${-row * size}px`,
          }}
        />
        <img
          className="range-rat-idle-sheet"
          src={SHEET}
          alt="Range Rat idle sprite sheet, 17 frames in a 5 by 4 grid"
          width={260}
          height={208}
        />
      </div>
      <figcaption>
        The idle sheet, playing at 6 fps. 17 frames, 52×52, real pixels.
      </figcaption>
    </figure>
  );
}

export default RangeRatIdle;
