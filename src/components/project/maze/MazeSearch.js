import { buildMaze } from './buildMaze';
import { EXIT, POCKET, START } from './design';
import DistanceChart from './DistanceChart';
import { LABEL, VIEW, center, exitMark, wallSegments } from './geometry';
import { decoy, route, trunk } from './timeline';
import useMazeRun from './useMazeRun';
import useReducedMotion from '../useReducedMotion';
import './MazeSearch.css';

const WALLS = wallSegments(buildMaze());

export default function MazeSearch() {
  const reduce = useReducedMotion();
  const refs = useMazeRun(reduce);
  const [sx, sy] = center(START[0], START[1]);
  const [ex, ey] = center(EXIT[0], EXIT[1]);
  const [px, py] = center(POCKET[0], POCKET[1]);
  const mark = exitMark();

  return (
    <figure className="maze-search">
      <svg
        viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
        role="img"
        aria-label="A maze. Greedy only takes steps that bring it closer to the exit, and ends in a pocket one wall away. The way out backs up, gets almost as far from the exit as the start, then comes around the top. A chart below plots the distance going down, stalling, climbing back up, and then reaching zero."
      >
        {WALLS.map((wall) => (
          <line
            key={`${wall.x0}-${wall.y0}-${wall.x1}-${wall.y1}`}
            className={wall.outer ? 'maze-wall is-outer' : 'maze-wall'}
            x1={wall.x0}
            y1={wall.y0}
            x2={wall.x1}
            y2={wall.y1}
          />
        ))}

        <circle className="maze-start" cx={sx} cy={sy} r="2.4" />
        <text className="maze-exit-name" x={mark.x} y={mark.y}>exit</text>
        <circle ref={refs.exit} className="maze-exit" cx={ex} cy={ey} r="4" />

        <g ref={refs.run} className="maze-run">
          <path ref={refs.ghost} className="maze-trace is-ghost" d={decoy.d} />
          <path ref={refs.trunk} className="maze-trace" d={trunk.d} />
          <path ref={refs.decoy} className="maze-trace" d={decoy.d} />
          <path ref={refs.route} className="maze-trace" d={route.d} />

          <g ref={refs.pocket} className="maze-pocket">
            <line x1={px - 4} y1={py - 4} x2={px + 4} y2={py + 4} />
            <line x1={px - 4} y1={py + 4} x2={px + 4} y2={py - 4} />
          </g>

          <line ref={refs.crow} className="maze-crow" x1={sx} y1={sy} x2={ex} y2={ey} />
          <circle ref={refs.ball} className="maze-walker" cx={sx} cy={sy} r="5" />

          <DistanceChart refs={refs} />
        </g>

        <text ref={refs.readout} className="maze-readout" x={LABEL.x} y={LABEL.y}>greedy</text>
      </svg>
      <figcaption>
        Greedy only takes steps that shrink the yellow line, and ends one wall from the exit. The way out backs up and lets the line grow almost all the way back to where it started. Then it comes around.
      </figcaption>
    </figure>
  );
}
