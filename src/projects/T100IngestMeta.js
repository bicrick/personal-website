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

/**
 * Map 08-player-rows absolute boxes (on 08-cell-grid-overlay, 1800×1349)
 * through the rectified card (719×539) and sequence.json crop into
 * step-cutout.webp UV space (719×341). No hand-tuned offsets.
 *
 * overlay = rectified resized to 1800×1349
 * cutout  = rectified[srcTop:bot] with synthPad rows prepended
 */
const OVERLAY_W = 1800;
const OVERLAY_H = 1349;
const RECT_W = 719;
const RECT_H = 539;
const CROP_SRC_TOP = 200;
const CROP_SYNTH_PAD = 14;
const FRAME_W = 719;
const FRAME_H = 341;

/** R1 (ANTHONY) from 08-player-rows_ecd4.json — absolute overlay pixels */
const PLAYER_ROW = {
  name: 'ANTHONY',
  nameBox: [191.4, 746.0, 551.0, 801.0],
  scores: [4, 5, 4, 3, 3, 3, 3, 2, 3],
  cells: {
    1: [551, 746, 641, 801],
    2: [641, 746, 731, 801],
    3: [731, 746, 823, 801],
    4: [823, 746, 910, 801],
    5: [910, 746, 1000, 801],
    6: [1000, 746, 1092, 801],
    7: [1092, 746, 1184, 801],
    8: [1184, 746, 1273, 801],
    9: [1273, 746, 1363, 801],
  },
  out: [1395, 746, 1484, 801],
};

function overlayBoxToUv([x0, y0, x1, y1]) {
  const rx0 = (x0 / OVERLAY_W) * RECT_W;
  const rx1 = (x1 / OVERLAY_W) * RECT_W;
  const ry0 = (y0 / OVERLAY_H) * RECT_H;
  const ry1 = (y1 / OVERLAY_H) * RECT_H;
  const cy0 = ry0 - CROP_SRC_TOP + CROP_SYNTH_PAD;
  const cy1 = ry1 - CROP_SRC_TOP + CROP_SYNTH_PAD;
  return {
    x: rx0 / FRAME_W,
    y: cy0 / FRAME_H,
    w: (rx1 - rx0) / FRAME_W,
    h: (cy1 - cy0) / FRAME_H,
  };
}

const nameBox = overlayBoxToUv(PLAYER_ROW.nameBox);
const cells = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((hole) => ({
  hole,
  value: PLAYER_ROW.scores[hole - 1],
  ...overlayBoxToUv(PLAYER_ROW.cells[hole]),
}));
const outBox = overlayBoxToUv(PLAYER_ROW.out);

export const META = {
  player: PLAYER_ROW.name,
  total: 64,
  out: 30,
  inn: 34,
  holesPlayed: 18,
  teeOptions: ['Blue', 'White'],
  question: 'Which tees?',
  nameBox,
  cells,
  outBox,
};

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
