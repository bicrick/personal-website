import React from 'react';
import { LabelChip, SCHEMATIC, StippleImage } from './schematicAssets';
import './schematics.css';

/** Strip / window geometry with pre-baked stipple fills. */
export default function StripGeometry() {
  const vbW = 720;
  const vbH = 230;
  const y = 48;
  const h = 96;
  const scale = 0.55;
  const winX = 80;
  const winW = 1024 * scale;
  const contextW = 768 * scale;
  const newW = 256 * scale;
  const overlapW = 192 * scale;
  const repaintW = 128 * scale;
  const stripX = winX + contextW - overlapW;
  const stripW = overlapW + newW;
  const ctxKeep = contextW - repaintW;

  return (
    <figure className="it-schematic" aria-label="Strip geometry schematic">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} role="img">
        <title>Strip geometry</title>
        <defs>
          <clipPath id="it-geom-ctx">
            <rect x={winX} y={y} width={ctxKeep} height={h} />
          </clipPath>
          <clipPath id="it-geom-rep">
            <rect x={winX + ctxKeep} y={y} width={repaintW} height={h} />
          </clipPath>
          <clipPath id="it-geom-new">
            <rect x={winX + contextW} y={y} width={newW} height={h} />
          </clipPath>
          <pattern id="it-hatch-geom" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line className="it-schematic-hatch" x1="0" y1="0" x2="0" y2="7" />
          </pattern>
        </defs>

        <line className="it-schematic-stroke-faint" x1={winX} y1={y - 14} x2={winX + winW} y2={y - 14} />
        <line className="it-schematic-stroke-faint" x1={winX} y1={y - 18} x2={winX} y2={y - 10} />
        <line className="it-schematic-stroke-faint" x1={winX + winW} y1={y - 18} x2={winX + winW} y2={y - 10} />
        <text className="it-schematic-label" x={winX + winW / 2} y={y - 20} textAnchor="middle">
          window 1024×1024
        </text>

        {/* Soft wash behind stipple so empty paper never shows through gaps */}
        <rect className="it-schematic-stipple-wash" x={winX} y={y} width={winW} height={h} />

        <StippleImage
          stem={SCHEMATIC.geomContext}
          x={winX}
          y={y}
          width={ctxKeep}
          height={h}
          clipPath="url(#it-geom-ctx)"
        />
        <StippleImage
          stem={SCHEMATIC.geomRepaint}
          x={winX + ctxKeep}
          y={y}
          width={repaintW}
          height={h}
          clipPath="url(#it-geom-rep)"
        />
        <rect
          x={winX + ctxKeep}
          y={y}
          width={repaintW}
          height={h}
          fill="url(#it-hatch-geom)"
          opacity="0.7"
        />
        <StippleImage
          stem={SCHEMATIC.geomNew}
          x={winX + contextW}
          y={y}
          width={newW}
          height={h}
          clipPath="url(#it-geom-new)"
        />

        <rect className="it-schematic-stroke" x={winX} y={y} width={winW} height={h} fill="none" />

        <line className="it-schematic-stroke-faint" x1={winX - 16} y1={y} x2={winX - 16} y2={y + h} />
        <text
          className="it-schematic-label"
          x={winX - 22}
          y={y + h / 2 + 3}
          textAnchor="middle"
          transform={`rotate(-90 ${winX - 22} ${y + h / 2})`}
        >
          1024
        </text>

        <LabelChip x={winX + ctxKeep / 2} y={y + h / 2} text="context 768" />
        <LabelChip x={winX + ctxKeep + repaintW / 2} y={y + h / 2} text="128" />
        <LabelChip x={winX + contextW + newW / 2} y={y + h / 2} text="new 256" />

        <rect className="it-schematic-stipple-wash" x={stripX} y={y + h + 18} width={stripW} height={22} />
        <StippleImage
          stem={SCHEMATIC.geomEmit}
          x={stripX}
          y={y + h + 18}
          width={stripW}
          height={22}
        />
        <rect className="it-schematic-stroke" x={stripX} y={y + h + 18} width={stripW} height={22} fill="none" />
        <rect
          className="it-schematic-fill-overlap"
          x={stripX}
          y={y + h + 18}
          width={overlapW}
          height={22}
          opacity="0.28"
        />
        <LabelChip x={stripX + overlapW / 2} y={y + h + 29} text="overlap 192" />
        <LabelChip x={stripX + overlapW + newW / 2} y={y + h + 29} text="strip 256×1024" />
        <text className="it-schematic-label" x={stripX + stripW / 2} y={y + h + 58} textAnchor="middle">
          emitted file 448×1024
        </text>
      </svg>
    </figure>
  );
}
