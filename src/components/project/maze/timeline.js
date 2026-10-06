import { DECOY, EXIT, ROUTE, TRUNK } from './design';
import { CHART, S, center } from './geometry';
import { buildRoute } from './route';

export const trunk = buildRoute(TRUNK);
export const decoy = buildRoute(DECOY);
export const route = buildRoute(ROUTE);

const [EX, EY] = center(EXIT[0], EXIT[1]);

export function distanceAt(p) {
  return Math.hypot(p.x - EX, p.y - EY) / S;
}

// How far along the route the walker is farthest from the exit. Past this
// point the distance finally starts shrinking again.
const PEAK = (() => {
  let best = 0;
  let bestD = -1;
  for (let s = 0; s <= route.length; s += 1) {
    const dist = distanceAt(route.at(s));
    if (dist > bestD) {
      bestD = dist;
      best = s;
    }
  }
  return best;
})();

// Accelerate over the first `a` of the move, cruise, decelerate over the last `b`.
function trapezoid(p, a, b) {
  const t = Math.max(0, Math.min(1, p));
  const vmax = 1 / (1 - a / 2 - b / 2);
  if (t < a) return (vmax * t * t) / (2 * a);
  if (t > 1 - b) return 1 - (vmax * (1 - t) * (1 - t)) / (2 * b);
  return vmax * (a / 2 + (t - a));
}

const SPEED = 160;
const forwardLen = trunk.length + decoy.length;
const escapeLen = decoy.length + route.length;

const PLAN = [
  ['enter', 500],
  ['greedy', (forwardLen / SPEED) * 1000],
  ['stuck', 1700],
  ['escape', (escapeLen / SPEED) * 1000],
  ['out', 1800],
  ['leave', 500],
];

const STARTS = {};
let clock = 0;
PLAN.forEach(([name, ms]) => {
  STARTS[name] = { start: clock, ms };
  clock += ms;
});

export const RUN_MS = clock;

function progress(name, t) {
  const { start, ms } = STARTS[name];
  return Math.max(0, Math.min(1, (t - start) / ms));
}

function inPhase(name, t) {
  const { start, ms } = STARTS[name];
  return t >= start && t < start + ms;
}

const START_POINT = trunk.at(0);
const POCKET_POINT = decoy.at(decoy.length);
const EXIT_POINT = route.at(route.length);

function frame(point, label, trails, extra = {}) {
  return {
    point,
    label,
    distance: distanceAt(point),
    trails,
    deadEnd: false,
    opacity: 1,
    ...extra,
  };
}

export function pose(t) {
  if (inPhase('enter', t)) {
    return frame(START_POINT, 'greedy', { trunk: 0, decoy: 0, route: 0 }, {
      opacity: progress('enter', t),
    });
  }

  if (inPhase('greedy', t)) {
    const s = forwardLen * trapezoid(progress('greedy', t), 0.06, 0.18);
    if (s < trunk.length) {
      return frame(trunk.at(s), 'greedy', { trunk: s / trunk.length, decoy: 0, route: 0 });
    }
    const along = s - trunk.length;
    return frame(decoy.at(along), 'greedy', { trunk: 1, decoy: along / decoy.length, route: 0 });
  }

  if (inPhase('stuck', t)) {
    return frame(POCKET_POINT, 'stuck', { trunk: 1, decoy: 1, route: 0 }, {
      deadEnd: progress('stuck', t) > 0.35,
    });
  }

  if (inPhase('escape', t)) {
    const s = escapeLen * trapezoid(progress('escape', t), 0.1, 0.14);
    if (s < decoy.length) {
      const along = decoy.length - s;
      return frame(decoy.at(along), 'back', { trunk: 1, decoy: along / decoy.length, route: 0 }, {
        deadEnd: true,
      });
    }
    const along = s - decoy.length;
    return frame(route.at(along), along < PEAK ? 'back' : 'around', {
      trunk: 1,
      decoy: 0,
      route: along / route.length,
    }, { deadEnd: true });
  }

  const leaving = inPhase('leave', t) || t >= RUN_MS;
  return frame(EXIT_POINT, 'out', { trunk: 1, decoy: 0, route: 1 }, {
    deadEnd: true,
    opacity: leaving ? 1 - progress('leave', t) : 1,
  });
}

export const FINAL_T = STARTS.out.start + 1;

// The chart spans from the first greedy step to arriving at the exit.
const CHART_T0 = STARTS.greedy.start;
const CHART_T1 = STARTS.out.start;

export function chartX(t) {
  const p = Math.max(0, Math.min(1, (t - CHART_T0) / (CHART_T1 - CHART_T0)));
  return CHART.x + p * CHART.w;
}

const SAMPLES = 360;
const CHART_POINTS = [];
for (let i = 0; i <= SAMPLES; i += 1) {
  const t = CHART_T0 + ((CHART_T1 - CHART_T0) * i) / SAMPLES;
  const p = pose(Math.min(t, CHART_T1 - 0.001));
  CHART_POINTS.push({ t, distance: p.distance, label: p.label });
}
const MAX_DISTANCE = Math.max(...CHART_POINTS.map((p) => p.distance));

export function chartY(distance) {
  return CHART.y + CHART.h - (distance / MAX_DISTANCE) * CHART.h;
}

function polyline(points) {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${chartX(p.t).toFixed(2)} ${chartY(p.distance).toFixed(2)}`)
    .join(' ');
}

// One stroke per stretch of the story, so the backwards part can be colored on its own.
export const CHART_SEGMENTS = (() => {
  const segs = [];
  let current = null;
  CHART_POINTS.forEach((point, i) => {
    const kind = point.label === 'back' ? 'back' : 'forward';
    if (!current || current.kind !== kind) {
      const prev = CHART_POINTS[i - 1];
      current = { kind, points: prev ? [prev] : [] };
      segs.push(current);
    }
    current.points.push(point);
  });
  return segs.map((seg) => ({ kind: seg.kind, d: polyline(seg.points) }));
})();

export const BACK_SPAN = (() => {
  const backs = CHART_POINTS.filter((p) => p.label === 'back');
  const peak = backs.reduce((a, b) => (b.distance > a.distance ? b : a), backs[0]);
  return {
    x0: chartX(backs[0].t),
    x1: chartX(backs[backs.length - 1].t),
    peakY: chartY(peak.distance),
  };
})();
