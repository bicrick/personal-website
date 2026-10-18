import React, { createContext, useContext } from 'react';

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

const FrameContext = createContext(null);

/**
 * Shared box for a viewBox schematic and its image overlays.
 * The in-flow SVG sets the aspect ratio; overlays and the front SVG
 * occupy that same box so user-unit positions become percentages.
 */
export function SchematicStage({ vbW, vbH, title, under, stipples, over }) {
  return (
    <FrameContext.Provider value={{ vbW, vbH }}>
      <div className="it-schematic-stage">
        <svg viewBox={`0 0 ${vbW} ${vbH}`} role="img">
          {title ? <title>{title}</title> : null}
          {under}
        </svg>
        <div className="it-schematic-overlays">{stipples}</div>
        <svg
          className="it-schematic-front"
          viewBox={`0 0 ${vbW} ${vbH}`}
          aria-hidden="true"
          focusable="false"
        >
          {over}
        </svg>
      </div>
    </FrameContext.Provider>
  );
}

/**
 * Dense monochrome stipple via CSS mask-image + currentColor.
 * Alpha PNGs are white opaque dots on transparent (no source tint).
 * Theme CSS sets .it-schematic color → dark dots on light, light on dark.
 *
 * These sit in HTML, not SVG foreignObject. WebKit paints foreignObject
 * children at the viewBox's user-unit size and ignores the scale that
 * shrinks the schematic, so the photos slide off the drawing on a phone.
 * Percentages of the same stage box track the viewBox at every width.
 */
export function StippleImage({
  stem,
  x,
  y,
  width,
  height,
  preserveAspectRatio = 'xMidYMid slice',
}) {
  const frame = useContext(FrameContext);
  if (!frame) {
    throw new Error('StippleImage must render inside SchematicStage');
  }
  const { vbW, vbH } = frame;
  const href = `${stem}-stipple-mask.png`;
  const pos = preserveAspectRatio.includes('xMax')
    ? 'right center'
    : preserveAspectRatio.includes('xMin')
      ? 'left center'
      : 'center center';
  const size = preserveAspectRatio.includes('meet') ? 'contain' : 'cover';

  return (
    <div
      className="it-stipple-fill"
      style={{
        left: `${(x / vbW) * 100}%`,
        top: `${(y / vbH) * 100}%`,
        width: `${(width / vbW) * 100}%`,
        height: `${(height / vbH) * 100}%`,
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
