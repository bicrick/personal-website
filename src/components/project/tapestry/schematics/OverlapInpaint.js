import React from 'react';
import './schematics.css';

/**
 * Overlap + inpaint join, keyed to admin knobs:
 * seam_px (join width / crossfade), bridge_strength (repaint), +128 px into new scene.
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
  const seamPx = 192;
  const scale = 1.1;
  const seamW = seamPx * scale * 0.55;
  const joinX = rightX;
  const hatchW = seamW + 128 * 0.55;

  const hatchLines = [];
  for (let i = 0; i < hatchW; i += 7) {
    hatchLines.push(i);
  }

  return (
    <figure className="it-schematic" aria-label="Overlap and inpaint join schematic">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} role="img">
        <title>Overlap and inpaint</title>
        <defs>
          <clipPath id="it-join-clip">
            <rect x={joinX - seamW} y={y} width={hatchW} height={h} />
          </clipPath>
        </defs>

        {/* Old scene */}
        <rect className="it-schematic-fill-faint" x={leftX} y={y} width={leftW} height={h} />
        <text className="it-schematic-label" x={leftX + 70} y={y + h / 2 + 4} textAnchor="middle">
          previous scene
        </text>

        {/* New scene */}
        <rect className="it-schematic-fill-faint" x={rightX} y={y} width={rightW} height={h} />
        <text
          className="it-schematic-label"
          x={rightX + rightW - 70}
          y={y + h / 2 + 4}
          textAnchor="middle"
        >
          new scene
        </text>

        {/* Overlap / crossfade band */}
        <rect
          className="it-schematic-fill-overlap"
          x={joinX - seamW}
          y={y}
          width={seamW}
          height={h}
        />

        {/* Inpaint / repaint hatch over join zone */}
        <g clipPath="url(#it-join-clip)">
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

        {/* Join outline */}
        <rect
          className="it-schematic-accent"
          x={joinX - seamW}
          y={y}
          width={hatchW}
          height={h}
        />

        {/* Crossfade underline (yellow in admin = ink here) */}
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

        {/* Knob callouts */}
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
