import { COLS, EXIT, ROWS, START } from './design';

export const S = 28;
export const PAD_X = 16;
export const PAD_Y = 42;

const MAZE_W = COLS * S;
const MAZE_H = ROWS * S;
const MAZE_BOTTOM = PAD_Y + MAZE_H;

export function center(x, y) {
  return [PAD_X + x * S + S / 2, PAD_Y + y * S + S / 2];
}

export function wallSegments(maze) {
  const segs = [];
  const add = (x0, y0, x1, y1, outer) => segs.push({ x0, y0, x1, y1, outer });

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const x0 = PAD_X + x * S;
      const y0 = PAD_Y + y * S;
      const x1 = x0 + S;
      const y1 = y0 + S;
      const isStart = x === START[0] && y === START[1];
      const isExit = x === EXIT[0] && y === EXIT[1];

      if (y === 0 || !maze.isOpen([x, y], [x, y - 1])) add(x0, y0, x1, y0, y === 0);
      if ((x === 0 && !isStart) || (x > 0 && !maze.isOpen([x, y], [x - 1, y]))) {
        add(x0, y0, x0, y1, x === 0);
      }
      if (x === COLS - 1 && !isExit) add(x1, y0, x1, y1, true);
      if (y === ROWS - 1) add(x0, y1, x1, y1, true);
    }
  }
  return segs;
}

export const CHART = {
  x: PAD_X,
  y: MAZE_BOTTOM + 40,
  w: MAZE_W,
  h: 72,
};

const RIGHT = PAD_X + MAZE_W + 46;
const BOTTOM = CHART.y + CHART.h + 14;

export const VIEW = {
  x: PAD_X - 12,
  y: 14,
  w: RIGHT - (PAD_X - 12),
  h: BOTTOM - 14,
};

export const LABEL = { x: PAD_X, y: 32 };

export function exitMark() {
  const [x, y] = center(EXIT[0], EXIT[1]);
  return { x: x + S / 2 + 10, y: y + 4 };
}
