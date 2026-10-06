import React from 'react';
import './Figures.css';

const X0 = 116;
const WIDTH = 424;
const RUN = 56;
const WAIT = 62;
const HAND_Y = 52;
const LOOP_Y = 150;
const STEP = 22;

const LOOP_LANES = [
  { name: 'lr sweep', offset: 0 },
  { name: 'batch sweep', offset: 22 },
  { name: 'gait reward', offset: 9 },
  { name: 'speed reward', offset: 36 },
  { name: 'start reward', offset: 14 },
  { name: 'training wheels', offset: 28 },
];

function lane(offset, run, gap) {
  const xs = [];
  for (let x = offset; x + run <= WIDTH; x += run + gap) xs.push(x);
  return xs;
}

const HAND = lane(0, RUN, WAIT);

function Runs({ xs, y, hand }) {
  return xs.map((x) => (
    <rect
      key={x}
      className={`lanes-run${hand ? ' is-hand' : ''}`}
      x={X0 + x}
      y={y}
      width={RUN}
      height="14"
      rx="2"
    />
  ));
}

export default function ParallelLanes() {
  const lanes = LOOP_LANES.map((l) => ({ ...l, xs: lane(l.offset, RUN, 5) }));
  const loopCount = lanes.reduce((sum, l) => sum + l.xs.length, 0);

  return (
    <figure className="rl-figure">
      <svg
        viewBox="0 0 560 300"
        role="img"
        aria-label={`Two timelines of the same length. By hand, one run at a time with a wait between each, ${HAND.length} runs. With a loop, six lanes of sweeps and reward shapes running side by side, ${loopCount} runs.`}
      >
        <text className="rl-label rl-strong" x="14" y="26">by hand</text>
        <text className="rl-label rl-strong" x="14" y="128">with a loop</text>

        <text className="rl-small" x="14" y={HAND_Y + 11}>one at a time</text>
        {lanes.map((l, i) => (
          <text key={l.name} className="rl-small" x="14" y={LOOP_Y + i * STEP + 11}>{l.name}</text>
        ))}

        <g className="rl-sweep-x" style={{ '--dur': '11s' }}>
          <rect x={X0} y="0" width={WIDTH} height="300" fill="none" />
          <Runs xs={HAND} y={HAND_Y} hand />
          {HAND.map((x) => (
            <line
              key={`wait-${x}`}
              className="lanes-wait"
              x1={X0 + x + RUN + 6}
              x2={Math.min(X0 + x + RUN + WAIT - 6, X0 + WIDTH)}
              y1={HAND_Y + 7}
              y2={HAND_Y + 7}
            />
          ))}
          {lanes.map((l, i) => (
            <Runs key={l.name} xs={l.xs} y={LOOP_Y + i * STEP} />
          ))}
        </g>

        <text className="rl-small" x={X0 + RUN + 4} y={HAND_Y + 34}>wait, read, edit, enqueue</text>

        <g className="rl-late" style={{ '--dur': '11s' }}>
          <text className="rl-label rl-strong" x="546" y="26" textAnchor="end">{HAND.length} tries</text>
          <text className="rl-label rl-link" x="546" y="128" textAnchor="end">{loopCount} tries</text>
        </g>

        <line className="rl-axis" x1={X0} x2={X0 + WIDTH} y1="288" y2="288" />
        <text className="rl-small" x={X0 + WIDTH} y="282" textAnchor="end">time</text>
      </svg>
      <figcaption>The same stretch of time. A sketch, not measured.</figcaption>
    </figure>
  );
}
