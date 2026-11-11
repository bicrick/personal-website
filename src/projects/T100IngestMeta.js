export const INGEST = `${process.env.PUBLIC_URL}/images/t100/ingest`;

export const STEPS = [
  {
    id: 'photo',
    label: 'Photo',
    caption: 'System camera or library — Front required, Back optional.',
  },
  {
    id: 'cutout',
    label: 'Cutout',
    caption:
      'Vision mask lifts the paper; the server snaps it flat. Fold-aware dewarp runs only when a crease is found — this card had none, so it was skipped.',
  },
  {
    id: 'read',
    label: 'Read',
    caption:
      'RapidOCR maps the printed hole grid; Jev reads each handwritten cell.',
  },
  {
    id: 'done',
    label: 'Done',
    caption: 'One tap question per screen · ask below 0.72.',
  },
];

/** Hand-cropped Crow Canyon front — not the scanner photo with the blank block */
export const CARD_TEXTURE = `${INGEST}/step-cutout.webp`;
export const CARD_GRID_TEXTURE = `${INGEST}/step-grid.webp`;

export const CARD_ASPECT = 719 / 341;
export const CARD_W = 2.35;
export const CARD_H = CARD_W / CARD_ASPECT;

export const META = {
  player: 'ANTHONY',
  total: 64,
  out: 30,
  inn: 34,
  holesPlayed: 18,
  teeOptions: ['Blue', 'White'],
  question: 'Which tees?',
  // Normalized to step-cutout.webp (719×341) — EARL ANTHONY score row (below HANDICAP).
  nameBox: {
    x: 0.158,
    y: 0.318,
    w: 0.172,
    h: 0.05,
  },
  cells: [
    { hole: 1, value: 4, x: 0.356, y: 0.318, w: 0.05, h: 0.05 },
    { hole: 2, value: 5, x: 0.406, y: 0.318, w: 0.05, h: 0.05 },
    { hole: 3, value: 4, x: 0.456, y: 0.318, w: 0.051, h: 0.05 },
    { hole: 4, value: 3, x: 0.507, y: 0.318, w: 0.049, h: 0.05 },
    { hole: 5, value: 3, x: 0.556, y: 0.318, w: 0.051, h: 0.05 },
    { hole: 6, value: 3, x: 0.607, y: 0.318, w: 0.05, h: 0.05 },
    { hole: 7, value: 3, x: 0.657, y: 0.318, w: 0.05, h: 0.05 },
    { hole: 8, value: 2, x: 0.707, y: 0.318, w: 0.05, h: 0.05 },
    { hole: 9, value: 3, x: 0.757, y: 0.318, w: 0.05, h: 0.05 },
  ],
};

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
