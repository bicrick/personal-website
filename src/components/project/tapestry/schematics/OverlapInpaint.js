import React from 'react';
import { LabelChip, SCHEMATIC } from './schematicAssets';
import './schematics.css';

/**
 * Overlap + inpaint join with real scene crops and hatched inpaint overlay.
 * Knobs match admin: seam_px, bridge_strength.
 */
export default function OverlapInpaint() {
  const vbW = 720;
  const vbH = 200;
  const y = 40;
  const h = 88;
  const leftX = 60;
  const leftW = 280;
  const rightX = 280;
  const rightW = 300;
  const seamW = 192 * 0.55;
  const joinX = rightX;
  const hatchW = seamW + 128 * 0.55;

  const hatchLines = [];
  for (let i = 0; i < hatchW; i += 7) hatchLines.push(i);

  return (
    <figure className="it-schematic" aria-label="Overlap and inpaint join schematic">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} role="img">
        <title>Overlap and inpaint</title>
        <defs>
          <clipPath id="it-join-prev">
            <rect x={leftX} y={y} width={leftW} height={h} />
          </clipPath>
          <clipPath id="it-join-new">
            <rect x={rightX} y={y} width={rightW} height={h} />
          </clipPath>
          <clipPath id="it-join-hatch">
            <rect x={joinX - seamW} y={y} width={hatchW} height={h} />
          </clipPath>
        </defs>

        <image
          href={SCHEMATIC.joinPrev}
          x={leftX}
          y={y}
          width={leftW}
          height={h}
          preserveAspectRatio="xMaxYMid slice"
          clipPath="url(#it-join-prev)"
        />
        <image
          href={SCHEMATIC.joinNew}
          x={rightX}
          y={y}
          width={rightW}
          height={h}
          preserveAspectRatio="xMinYMid slice"
          clipPath="url(#it-join-new)"
        />

        {/* Soft crossfade veil over seam_px */}
        <rect
          x={joinX - seamW}
          y={y}
          width={seamW}
          height={h}
          fill="var(--paper)"
          opacity="0.22"
        />

        {/* Inpaint hatch on real pixels */}
        <g clipPath="url(#it-join-hatch)">
          {hatchLines.map((dx) => (
            <line
              key={dx}
              className="it-schematic-hatch"
              x1={joinX - seamW + dx}
              y1={y}
              x2={joinX - seamW + dx - 18}
              y2={y + h}
            />
          ))}
        </g>

        <rect className="it-schematic-stroke" x={leftX} y={y} width={leftW} height={h} fill="none" />
        <rect className="it-schematic-stroke" x={rightX} y={y} width={rightW} height={h} fill="none" />
        <rect
          className="it-schematic-accent"
          x={joinX - seamW}
          y={y}
          width={hatchW}
          height={h}
          fill="none"
        />

        <LabelChip x={leftX + 72} y={y + h / 2} text="previous scene" />
        <LabelChip x={rightX + rightW - 64} y={y + h / 2} text="new scene" />

        <line
          className="it-schematic-accent"
          x1={joinX - seamW}
          y1={y + h + 8}
          x2={joinX}
          y2={y + h + 8}
        />
        <text className="it-schematic-label" x={joinX - seamW / 2} y={y + h + 24} textAnchor="middle">
          crossfade · seam_px
        </text>
        <text
          className="it-schematic-label"
          x={joinX - seamW + hatchW / 2}
          y={y - 12}
          textAnchor="middle"
        >
          inpaint mask · bridge_strength
        </text>

        <text className="it-schematic-label" x={60} y={y + h + 52}>
          join width 32–192 px
        </text>
        <text className="it-schematic-label" x={280} y={y + h + 52}>
          repaint strength 0.30–1.00
        </text>
        <text className="it-schematic-label" x={520} y={y + h + 52}>
          +128 px into new
        </text>
      </svg>
      <figcaption>Adjacent strips overlap; the join is inpainted.</figcaption>
    </figure>
  );
}
