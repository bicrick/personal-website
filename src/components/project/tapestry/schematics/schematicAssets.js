const BASE = `${process.env.PUBLIC_URL}/images/infinite-tapestry/schematic`;

export const SCHEMATIC = {
  geomContext: `${BASE}/geom-context.webp`,
  geomRepaint: `${BASE}/geom-repaint.webp`,
  geomNew: `${BASE}/geom-new.webp`,
  geomEmit: `${BASE}/geom-emit.webp`,
  joinPrev: `${BASE}/join-prev.webp`,
  joinNew: `${BASE}/join-new.webp`,
  loop: [0, 1, 2, 3, 4].map((i) => `${BASE}/loop-${i}.webp`),
};

/** Mono label chip over image fills. */
export function LabelChip({ x, y, text, anchor = 'middle' }) {
  const padX = 6;
  const approx = text.length * 5.2 + padX * 2;
  const tx = anchor === 'middle' ? x : anchor === 'end' ? x - approx / 2 : x + approx / 2;
  return (
    <g>
      <rect
        className="it-schematic-chip"
        x={tx - approx / 2}
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
