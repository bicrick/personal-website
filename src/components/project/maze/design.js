// The three corridors the story runs on. Everything else in the maze is
// filled in around them by buildMaze.
//
// TRUNK: start to the fork. Every step shrinks the distance to the exit.
// DECOY: fork to the pocket, still shrinking, ending one wall from the exit.
// ROUTE: fork to the exit. Backs away first, nearly to the start, then
// comes around the top.

export const COLS = 15;
export const ROWS = 9;

export const START = [0, 8];
export const EXIT = [14, 4];
export const FORK = [5, 6];
export const POCKET = [13, 4];

export const TRUNK = [
  [0, 8], [1, 8], [2, 8], [2, 7], [3, 7], [4, 7], [4, 6], [5, 6],
];

export const DECOY = [
  [5, 6], [6, 6], [6, 5], [7, 5], [8, 5], [9, 5], [9, 4],
  [10, 4], [11, 4], [12, 4], [13, 4],
];

export const ROUTE = [
  [5, 6], [5, 5], [5, 4], [5, 3], [4, 3], [3, 3], [3, 2], [2, 2],
  [1, 2], [1, 1], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [5, 1],
  [6, 1], [7, 1], [7, 0], [8, 0], [9, 0], [10, 0], [10, 1], [11, 1],
  [12, 1], [12, 0], [13, 0], [14, 0], [14, 1], [14, 2], [14, 3], [14, 4],
];

export const SEED = 7;
