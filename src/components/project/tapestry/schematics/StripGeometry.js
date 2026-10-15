import React from 'react';
import './schematics.css';

/** Strip / window geometry: 256×1024 strip, 1024 window, 192 overlap, 128 repaint. */
export default function StripGeometry() {
  // Proportional layout (px units in viewBox):
  // context 768 + new 256 = 1024 window
  // overlap 192 on left of emitted strip; repaint band 128 into context
  const vbW = 720;
  const vbH = 220;
  const y = 48;
  const h = 96;
  const scale = 0.55; // 1024 * 0.55 ≈ 563
  const winX = 80;
  const winW = 1024 * scale;
  const contextW = 768 * scale;
  const newW = 256 * scale;
  const overlapW = 192 * scale;
  const repaintW = 128 * scale;
  const stripX = winX + contextW - overlapW;
  const stripW = overlapW + newW;

  return (
    <figure className="it-schematic" aria-label="Strip geometry schematic">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} role="img">
        <title>Strip geometry</title>

        {/* Window outline */}
        <rect
          className="it-schematic-stroke"
          x={winX}
          y={y}
          width={winW}
          height={h}
        />

        {/* Context (kept) */}
        <rect
          className="it-schematic-fill-faint"
          x={winX}
          y={y}
          width={contextW - repaintW}
          height={h}
        />

        {/* Repaint band */}
        <rect
          className="it-schematic-fill-mask"
          x={winX + contextW - repaintW}
          y={y}
          width={repaintW}
          height={h}
        />

        {/* New slot */}
        <rect
          className="it-schematic-fill-soft"
          x={winX + contextW}
          y={y}
          width={newW}
          height={h}
        />

        {/* Emitted strip bracket under window */}
        <rect
          className="it-schematic-stroke"
          x={stripX}
          y={y + h + 18}
          width={stripW}
          height={22}
        />
        <rect
          className="it-schematic-fill-overlap"
          x={stripX}
          y={y + h + 18}
          width={overlapW}
          height={22}
        />

        {/* Dimension ticks: window */}
        <line
          className="it-schematic-stroke-faint"
          x1={winX}
          y1={y - 14}
          x2={winX + winW}
          y2={y - 14}
        />
        <line className="it-schematic-stroke-faint" x1={winX} y1={y - 18} x2={winX} y2={y - 10} />
        <line
          className="it-schematic-stroke-faint"
          x1={winX + winW}
          y1={y - 18}
          x2={winX + winW}
          y2={y - 10}
        />
        <text className="it-schematic-label" x={winX + winW / 2} y={y - 20} textAnchor="middle">
          window 1024×1024
        </text>

        {/* Height label */}
        <line
          className="it-schematic-stroke-faint"
          x1={winX - 16}
          y1={y}
          x2={winX - 16}
          y2={y + h}
        />
        <text
          className="it-schematic-label"
          x={winX - 22}
          y={y + h / 2 + 3}
          textAnchor="middle"
          transform={`rotate(-90 ${winX - 22} ${y + h / 2})`}
        >
          1024
        </text>

        {/* Region labels */}
        <text className="it-schematic-label" x={winX + (contextW - repaintW) / 2} y={y + h / 2 + 4} textAnchor="middle">
          context 768
        </text>
        <text
          className="it-schematic-label"
          x={winX + contextW - repaintW / 2}
          y={y + h / 2 + 4}
          textAnchor="middle"
        >
          128
        </text>
        <text
          className="it-schematic-label"
          x={winX + contextW + newW / 2}
          y={y + h / 2 + 4}
          textAnchor="middle"
        >
          new 256
        </text>

        <text className="it-schematic-label" x={stripX + overlapW / 2} y={y + h + 33} textAnchor="middle">
          overlap 192
        </text>
        <text className="it-schematic-label" x={stripX + overlapW + newW / 2} y={y + h + 33} textAnchor="middle">
          strip 256×1024
        </text>
        <text className="it-schematic-label" x={stripX + stripW / 2} y={y + h + 58} textAnchor="middle">
          emitted file 448×1024
        </text>
      </svg>
    </figure>
  );
}
