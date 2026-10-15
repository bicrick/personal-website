import React, { useId } from 'react';

const BASE = `${process.env.PUBLIC_URL}/images/infinite-tapestry/schematic`;

/** Pre-baked monochrome stipple masks (scripts/stipple-schematics.py). */
export const SCHEMATIC = {
  geomContext: `${BASE}/geom-context`,
  geomRepaint: `${BASE}/geom-repaint`,
  geomNew: `${BASE}/geom-new`,
  geomEmit: `${BASE}/geom-emit`,
  joinPrev: `${BASE}/join-prev`,
  joinNew: `${BASE}/join-new`,
  loop: [0, 1, 2, 3, 4].map((i) => `${BASE}/loop-${i}`),
};

/**
 * Monochrome stipple fill via SVG mask + currentColor.
 * Mask PNGs are white-on-black luminance only (no source tint).
 * Theme CSS sets .it-schematic color → dark dots on light, light on dark.
 */
export function StippleImage({
  stem,
  x,
  y,
  width,
  height,
  clipPath,
  preserveAspectRatio = 'xMidYMid slice',
}) {
  const uid = useId().replace(/:/g, '');
  const maskId = `it-stipple-${uid}`;
  const href = `${stem}-stipple-mask.png`;

  return (
    <g className="it-stipple-ink" clipPath={clipPath}>
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={x}
          y={y}
          width={width}
          height={height}
        >
          {/* Black = hide, white = show currentColor ink */}
          <rect x={x} y={y} width={width} height={height} fill="#000" />
          <image
            href={href}
            x={x}
            y={y}
            width={width}
            height={height}
            preserveAspectRatio={preserveAspectRatio}
          />
        </mask>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </g>
  );
}

/** Mono label chip over image fills. */
export function LabelChip({ x, y, text }) {
  const padX = 6;
  const approx = text.length * 5.2 + padX * 2;
  return (
    <g>
      <rect
        className="it-schematic-chip"
        x={x - approx / 2}
        y={y - 9}
        width={approx}
        height={16}
        rx={3}
      />
      <text className="it-schematic-chip-label" x={x} y={y + 3} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}
