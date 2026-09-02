import { useEffect, useRef } from 'react';

const FRAME = 52;
const COLS = 5;
const FRAME_COUNT = 17;
const FPS = 6;
const SCALE = 5;
const SHEET_WIDTH = 260 * SCALE;
const SHEET_HEIGHT = 208 * SCALE;
const FRAME_MS = 1000 / FPS;

function paintFrame(layer, index, size) {
  if (!layer) return;
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  layer.style.transform = `translate(${-col * size}px, ${-row * size}px)`;
}

function RangeRatSpriteLoop({ sheet, ariaLabel, startFrame = 0 }) {
  const layerRef = useRef(null);
  const size = FRAME * SCALE;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) {
      return undefined;
    }

    let frame = startFrame % FRAME_COUNT;
    let last = performance.now();
    let raf = 0;

    paintFrame(layerRef.current, frame, size);

    const tick = (now) => {
      if (now - last >= FRAME_MS) {
        frame = (frame + 1) % FRAME_COUNT;
        paintFrame(layerRef.current, frame, size);
        last = now;
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [size, startFrame]);

  return (
    <div
      className="range-rat-sprite-frame"
      role="img"
      aria-label={ariaLabel}
    >
      <img
        ref={layerRef}
        className="range-rat-sprite-sheet"
        src={sheet}
        alt=""
        width={SHEET_WIDTH}
        height={SHEET_HEIGHT}
        draggable={false}
      />
    </div>
  );
}

export default RangeRatSpriteLoop;
