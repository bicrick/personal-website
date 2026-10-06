import {
  COLS,
  DECOY,
  EXIT,
  POCKET,
  ROUTE,
  ROWS,
  SEED,
  TRUNK,
} from './design';

const STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cellKey = ([x, y]) => `${x},${y}`;

export function edgeKey(a, b) {
  const [first, second] = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) ? [a, b] : [b, a];
  return `${cellKey(first)}|${cellKey(second)}`;
}

export function distanceToExit([x, y]) {
  return Math.hypot(x - EXIT[0], y - EXIT[1]);
}

function inBounds([x, y]) {
  return x >= 0 && y >= 0 && x < COLS && y < ROWS;
}

// Carves the three corridors, then grows a spanning tree into the rest of
// the grid. Side branches off the greedy corridors are only allowed where
// they would make the distance worse than the next corridor step, so a
// greedy walker always stays on the decoy.
export function buildMaze(seed = SEED) {
  const rand = mulberry32(seed);
  const open = new Set();
  const visited = new Set();

  [TRUNK, DECOY, ROUTE].forEach((path) => {
    path.forEach((cell, i) => {
      visited.add(cellKey(cell));
      if (i > 0) open.add(edgeKey(path[i - 1], cell));
    });
  });

  const greedyNext = new Map();
  [TRUNK, DECOY].forEach((path) => {
    path.slice(0, -1).forEach((cell, i) => {
      greedyNext.set(cellKey(cell), distanceToExit(path[i + 1]));
    });
  });
  const sealed = new Set([cellKey(POCKET), cellKey(EXIT)]);

  const canBranch = (from, to) => {
    if (sealed.has(cellKey(from))) return false;
    const limit = greedyNext.get(cellKey(from));
    if (limit === undefined) return true;
    return distanceToExit(to) > limit + 0.01;
  };

  const frontier = [...TRUNK, ...DECOY, ...ROUTE];
  while (frontier.length) {
    const i = rand() < 0.65 ? frontier.length - 1 : Math.floor(rand() * frontier.length);
    const cell = frontier[i];
    const options = STEPS
      .map(([dx, dy]) => [cell[0] + dx, cell[1] + dy])
      .filter((next) => inBounds(next) && !visited.has(cellKey(next)) && canBranch(cell, next));
    if (!options.length) {
      frontier.splice(i, 1);
    } else {
      const next = options[Math.floor(rand() * options.length)];
      open.add(edgeKey(cell, next));
      visited.add(cellKey(next));
      frontier.push(next);
    }
  }

  return {
    isOpen(a, b) {
      return inBounds(a) && inBounds(b) && open.has(edgeKey(a, b));
    },
    filled: visited.size === COLS * ROWS,
  };
}
