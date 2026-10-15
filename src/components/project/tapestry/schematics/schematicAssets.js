import React from 'react';

const BASE = `${process.env.PUBLIC_URL}/images/infinite-tapestry/schematic`;

/** Pre-baked monochrome stipple alpha masks (scripts/stipple-schematics.py). */
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
 * Dense monochrome stipple via CSS mask-image + currentColor.
 * Alpha PNGs are white opaque dots on transparent (no source tint).
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
  const href = `${stem}-stipple-mask.png`;
  const pos =
    preserveAspectRatio.includes('xMax')
      ? 'right center'
      : preserveAspectRatio.includes('xMin')
        ? 'left center'
        : 'center center';
  const size = preserveAspectRatio.includes('meet') ? 'contain' : 'cover';

  return (
    <g className="it-stipple-ink" clipPath={clipPath}>
      <foreignObject x={x} y={y} width={width} height={height}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="it-stipple-fill"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'currentColor',
            WebkitMaskImage: `url(${href})`,
            maskImage: `url(${href})`,
            WebkitMaskSize: size,
            maskSize: size,
            WebkitMaskPosition: pos,
            maskPosition: pos,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
          }}
        />
      </foreignObject>
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
