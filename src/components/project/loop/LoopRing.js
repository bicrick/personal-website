import { useRef } from 'react';
import useReducedMotion from '../useReducedMotion';
import GrokBot from './GrokBot';
import FarmRuns from './scenes/FarmRuns';
import ObserveChart from './scenes/ObserveChart';
import ShapeCode from './scenes/ShapeCode';
import EnqueueJobs from './scenes/EnqueueJobs';
import useLoopClock from './useLoopClock';
import { CARD, STATIONS, VIEW } from './pose';
import './LoopRing.css';

const DUR = '14s';
const [FARM, OBSERVE, SHAPE, ENQUEUE] = STATIONS;

// Straight track through the card centers. Cards sit on top of it.
const TRACK = `M${FARM.x} ${FARM.y} H${OBSERVE.x} V${SHAPE.y} H${ENQUEUE.x} Z`;

const CHEVRONS = [
  { x: (FARM.x + OBSERVE.x) / 2, y: FARM.y, r: 0 },
  { x: OBSERVE.x, y: (OBSERVE.y + SHAPE.y) / 2, r: 90 },
  { x: (SHAPE.x + ENQUEUE.x) / 2, y: SHAPE.y, r: 180 },
  { x: ENQUEUE.x, y: (ENQUEUE.y + FARM.y) / 2, r: 270 },
];

const corner = (station) => ({ x: station.x - CARD.w / 2, y: station.y - CARD.h / 2 });

export default function LoopRing() {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  useLoopClock(rootRef, reduce);

  return (
    <figure ref={rootRef} className="loop-ring" data-stage="farm" style={{ '--loop-dur': DUR }}>
      <svg
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        role="group"
        aria-label="A loop of four steps. Farm runs parallel executions, observe reads the loss, shape rewrites the reward code, enqueue launches the next runs, and it goes back to farm. A grok bot in the middle watches whichever step is active."
      >
        <path className="loop-track" d={TRACK} />
        {CHEVRONS.map((c) => (
          <path
            key={`${c.x}-${c.y}`}
            className="loop-chevron"
            d="M-3 -4.5 L3 0 L-3 4.5"
            transform={`translate(${c.x} ${c.y}) rotate(${c.r})`}
          />
        ))}
        {!reduce && <circle className="loop-bead" r="5.5" cx={FARM.x} cy={FARM.y} />}

        <FarmRuns {...corner(FARM)} />
        <ObserveChart {...corner(OBSERVE)} />
        <ShapeCode {...corner(SHAPE)} />
        <EnqueueJobs {...corner(ENQUEUE)} />

        <GrokBot />
        <rect className="loop-clock" width="0" height="0" />
      </svg>
      <figcaption>
        It just keeps going. Watch the runs, change the reward, try again.
      </figcaption>
    </figure>
  );
}
