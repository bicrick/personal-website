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
  nameBox: {
    x: 0.10633333333333336,
    y: 0.3286457438876195,
    w: 0.19977777777777775,
    h: 0.06444439130538751,
  },
  cells: [
    { hole: 1, value: 4, x: 0.3061111111111111, y: 0.3286457438876195, w: 0.049999999999999906, h: 0.06444439130538751 },
    { hole: 2, value: 5, x: 0.35611111111111104, y: 0.3286457438876195, w: 0.050000000000000065, h: 0.06444439130538751 },
    { hole: 3, value: 4, x: 0.4061111111111111, y: 0.3286457438876195, w: 0.051111111111111086, h: 0.06444439130538751 },
    { hole: 4, value: 3, x: 0.4572222222222222, y: 0.3286457438876195, w: 0.04833333333333341, h: 0.06444439130538751 },
    { hole: 5, value: 3, x: 0.5055555555555555, y: 0.3286457438876195, w: 0.04999999999999998, h: 0.06444439130538751 },
    { hole: 6, value: 3, x: 0.5555555555555556, y: 0.3286457438876195, w: 0.051111111111111086, h: 0.06444439130538751 },
    { hole: 7, value: 3, x: 0.6066666666666667, y: 0.3286457438876195, w: 0.05111111111111116, h: 0.06444439130538751 },
    { hole: 8, value: 2, x: 0.6577777777777778, y: 0.3286457438876195, w: 0.04944444444444435, h: 0.06444439130538751 },
    { hole: 9, value: 3, x: 0.7072222222222222, y: 0.3286457438876195, w: 0.050000000000000065, h: 0.06444439130538751 },
  ],
};

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
