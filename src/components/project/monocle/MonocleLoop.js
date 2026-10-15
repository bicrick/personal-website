import React from 'react';
import '../tapestry/schematics/schematics.css';

const TOP = [
  { id: 'tab', title: 'live tab', sub: 'landmarks + media' },
  { id: 'panel', title: 'side panel', sub: 'your prompt' },
  { id: 'companion', title: 'companion', sub: '127.0.0.1:8787' },
  { id: 'agent', title: 'agent -p', sub: 'isolated cwd + tab MCP' },
];

const BOTTOM = [
  { id: 'same', title: 'same tab', sub: 'JS + media still running' },
  { id: 'apply', title: 'applicator', sub: 'page + sandbox frame' },
  { id: 'guard', title: 'validate', sub: 'schema + runtime guards' },
  { id: 'patch', title: 'patch', sub: 'css, overlay, ops, runtime' },
];

const VB_W = 720;
const VB_H = 214;
const BOX_W = 150;
const BOX_H = 56;
const PAD = 24;
const GAP = (VB_W - PAD * 2 - BOX_W * 4) / 3;
const TOP_Y = 24;
const BOT_Y = 134;

const colX = (i) => PAD + i * (BOX_W + GAP);

function Box({ x, y, title, sub }) {
  return (
    <g>
      <rect className="it-schematic-fill-faint" x={x} y={y} width={BOX_W} height={BOX_H} />
      <text
        className="it-schematic-label it-schematic-label-ink"
        x={x + BOX_W / 2}
        y={y + 24}
        textAnchor="middle"
      >
        {title}
      </text>
      <text className="it-schematic-label" x={x + BOX_W / 2} y={y + 42} textAnchor="middle">
        {sub}
      </text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }) {
  const dx = Math.sign(x2 - x1);
  const dy = Math.sign(y2 - y1);
  const head = dx !== 0
    ? `${x2 - dx * 7},${y2 - 5} ${x2},${y2} ${x2 - dx * 7},${y2 + 5}`
    : `${x2 - 5},${y2 - dy * 7} ${x2},${y2} ${x2 + 5},${y2 - dy * 7}`;
  return (
    <g>
      <line className="it-schematic-arrow" x1={x1} y1={y1} x2={x2} y2={y2} />
      <polyline className="it-schematic-arrow" points={head} />
    </g>
  );
}

/** Request path along the top, patch path back along the bottom. */
export default function MonocleLoop() {
  const midTop = TOP_Y + BOX_H / 2;
  const midBot = BOT_Y + BOX_H / 2;

  return (
    <figure className="it-schematic" aria-label="Monocle request and patch loop">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} role="img">
        <title>Monocle loop</title>
        {TOP.map((box, i) => (
          <Box key={box.id} x={colX(i)} y={TOP_Y} {...box} />
        ))}
        {BOTTOM.map((box, i) => (
          <Box key={box.id} x={colX(i)} y={BOT_Y} {...box} />
        ))}
        {[0, 1, 2].map((i) => (
          <Arrow
            key={`t${i}`}
            x1={colX(i) + BOX_W + 4}
            y1={midTop}
            x2={colX(i + 1) - 4}
            y2={midTop}
          />
        ))}
        <Arrow x1={colX(3) + BOX_W / 2} y1={TOP_Y + BOX_H + 4} x2={colX(3) + BOX_W / 2} y2={BOT_Y - 4} />
        {[3, 2, 1].map((i) => (
          <Arrow
            key={`b${i}`}
            x1={colX(i) - 4}
            y1={midBot}
            x2={colX(i - 1) + BOX_W + 4}
            y2={midBot}
          />
        ))}
        <text
          className="it-schematic-label"
          x={VB_W / 2}
          y={BOT_Y + BOX_H + 22}
          textAnchor="middle"
        >
          the model only ever returns a patch. It never touches the page directly.
        </text>
      </svg>
    </figure>
  );
}
