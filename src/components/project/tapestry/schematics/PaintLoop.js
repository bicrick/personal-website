import React from 'react';
import './schematics.css';

const STEPS = [
  { id: 'prompt', label: 'prompt' },
  { id: 'source', label: 'Auto / visitor' },
  { id: 'gpu', label: 'SDXL' },
  { id: 'stitch', label: 'stitch' },
  { id: 'store', label: 'store' },
];

/** Paint loop: prompt → Auto/visitor → SDXL → stitch → store. */
export default function PaintLoop() {
  const vbW = 720;
  const vbH = 110;
  const boxW = 108;
  const boxH = 40;
  const y = 28;
  const gap = (vbW - 48 - STEPS.length * boxW) / (STEPS.length - 1);
  const startX = 24;

  return (
    <figure className="it-schematic" aria-label="Paint loop schematic">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} role="img">
        <title>Paint loop</title>
        {STEPS.map((step, i) => {
          const x = startX + i * (boxW + gap);
          const nextX = x + boxW + gap;
          return (
            <g key={step.id}>
              <rect
                className="it-schematic-fill-faint"
                x={x}
                y={y}
                width={boxW}
                height={boxH}
              />
              <text
                className="it-schematic-label it-schematic-label-ink"
                x={x + boxW / 2}
                y={y + boxH / 2 + 4}
                textAnchor="middle"
              >
                {step.label}
              </text>
              {i < STEPS.length - 1 ? (
                <g>
                  <line
                    className="it-schematic-arrow"
                    x1={x + boxW + 4}
                    y1={y + boxH / 2}
                    x2={nextX - 8}
                    y2={y + boxH / 2}
                  />
                  <polyline
                    className="it-schematic-arrow"
                    points={`${nextX - 14},${y + boxH / 2 - 5} ${nextX - 6},${y + boxH / 2} ${nextX - 14},${y + boxH / 2 + 5}`}
                  />
                </g>
              ) : null}
            </g>
          );
        })}
        <text className="it-schematic-label" x={vbW / 2} y={y + boxH + 28} textAnchor="middle">
          RealVisXL · one RTX 4090 · ~2.7 s / strip · 18 steps · CFG 6
        </text>
      </svg>
    </figure>
  );
}
