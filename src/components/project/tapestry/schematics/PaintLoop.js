import React from 'react';
import { LabelChip, SCHEMATIC, StippleImage } from './schematicAssets';
import './schematics.css';

const STEPS = [
  { id: 'prompt', label: 'prompt', thumb: 0 },
  { id: 'source', label: 'Auto / visitor', thumb: 1 },
  { id: 'gpu', label: 'SDXL', thumb: 2 },
  { id: 'stitch', label: 'stitch', thumb: 3 },
  { id: 'store', label: 'store', thumb: 4 },
];

/** Paint loop with tiny pre-baked stipple thumbnails. */
export default function PaintLoop() {
  const vbW = 720;
  const vbH = 132;
  const boxW = 108;
  const boxH = 64;
  const y = 20;
  const gap = (vbW - 48 - STEPS.length * boxW) / (STEPS.length - 1);
  const startX = 24;
  const thumb = 28;

  return (
    <figure className="it-schematic" aria-label="Paint loop schematic">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} role="img">
        <title>Paint loop</title>
        {STEPS.map((step, i) => {
          const x = startX + i * (boxW + gap);
          const nextX = x + boxW + gap;
          const tx = x + 10;
          const ty = y + 10;
          return (
            <g key={step.id}>
              <rect
                className="it-schematic-fill-faint"
                x={x}
                y={y}
                width={boxW}
                height={boxH}
              />
              <rect className="it-schematic-stipple-wash" x={tx} y={ty} width={thumb} height={thumb} />
              <StippleImage
                stem={SCHEMATIC.loop[step.thumb]}
                x={tx}
                y={ty}
                width={thumb}
                height={thumb}
              />
              <rect
                className="it-schematic-stroke-faint"
                x={tx}
                y={ty}
                width={thumb}
                height={thumb}
                fill="none"
              />
              <LabelChip x={x + boxW / 2 + 8} y={y + boxH - 14} text={step.label} />
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
