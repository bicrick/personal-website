import React from 'react';
import { LabelChip, SCHEMATIC, SchematicStage, StippleImage } from './schematicAssets';
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

  const boxes = STEPS.map((step, i) => {
    const x = startX + i * (boxW + gap);
    const tx = x + 10;
    const ty = y + 10;
    return { ...step, i, x, tx, ty, nextX: x + boxW + gap };
  });

  return (
    <figure className="it-schematic" aria-label="Paint loop schematic">
      <SchematicStage
        vbW={vbW}
        vbH={vbH}
        title="Paint loop"
        under={
          <>
            {boxes.map((step) => (
              <g key={step.id}>
                <rect className="it-schematic-fill-faint" x={step.x} y={y} width={boxW} height={boxH} />
                <rect className="it-schematic-stipple-wash" x={step.tx} y={step.ty} width={thumb} height={thumb} />
              </g>
            ))}
          </>
        }
        stipples={
          <>
            {boxes.map((step) => (
              <StippleImage
                key={step.id}
                stem={SCHEMATIC.loop[step.thumb]}
                x={step.tx}
                y={step.ty}
                width={thumb}
                height={thumb}
              />
            ))}
          </>
        }
        over={
          <>
            {boxes.map((step) => (
              <g key={step.id}>
                <rect
                  className="it-schematic-stroke-faint"
                  x={step.tx}
                  y={step.ty}
                  width={thumb}
                  height={thumb}
                  fill="none"
                />
                <LabelChip x={step.x + boxW / 2 + 8} y={y + boxH - 14} text={step.label} />
                {step.i < STEPS.length - 1 ? (
                  <g>
                    <line
                      className="it-schematic-arrow"
                      x1={step.x + boxW + 4}
                      y1={y + boxH / 2}
                      x2={step.nextX - 8}
                      y2={y + boxH / 2}
                    />
                    <polyline
                      className="it-schematic-arrow"
                      points={`${step.nextX - 14},${y + boxH / 2 - 5} ${step.nextX - 6},${y + boxH / 2} ${step.nextX - 14},${y + boxH / 2 + 5}`}
                    />
                  </g>
                ) : null}
              </g>
            ))}
            <text className="it-schematic-label" x={vbW / 2} y={y + boxH + 28} textAnchor="middle">
              RealVisXL · one RTX 4090 · ~2.7 s / strip · 18 steps · CFG 6
            </text>
          </>
        }
      />
    </figure>
  );
}
