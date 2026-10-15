import React, { useEffect, useState } from 'react';

const BASE = `${process.env.PUBLIC_URL}/images/infinite-tapestry/schematic`;

/** Pre-baked weighted-Voronoi stipple PNGs (scripts/stipple-schematics.py). */
export const SCHEMATIC = {
  geomContext: `${BASE}/geom-context`,
  geomRepaint: `${BASE}/geom-repaint`,
  geomNew: `${BASE}/geom-new`,
  geomEmit: `${BASE}/geom-emit`,
  joinPrev: `${BASE}/join-prev`,
  joinNew: `${BASE}/join-new`,
  loop: [0, 1, 2, 3, 4].map((i) => `${BASE}/loop-${i}`),
};

function isSiteDark() {
  return typeof document !== 'undefined'
    && document.documentElement.classList.contains('is-dark');
}

function useSiteDark() {
  const [dark, setDark] = useState(isSiteDark);
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains('is-dark'));
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

/**
 * Theme-aware stipple fill: dark dots on light, light dots on dark.
 * Assets are pre-baked PNGs — no runtime stippling.
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
  const dark = useSiteDark();
  // *-stipple-light.png = dark dots (for light UI)
  // *-stipple-dark.png  = light dots (for dark UI)
  const href = `${stem}-stipple-${dark ? 'dark' : 'light'}.png`;
  return (
    <image
      href={href}
      x={x}
      y={y}
      width={width}
      height={height}
      preserveAspectRatio={preserveAspectRatio}
      clipPath={clipPath}
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
