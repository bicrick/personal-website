import { center } from './geometry';

const CORNER_STEPS = 10;

function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function quad(a, c, b, t) {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

// A path through cell centers with rounded corners. Returns the SVG `d`
// and a sampled polyline so positions can be computed without the DOM.
export function buildRoute(cells, radius = 10) {
  const pts = cells.map(([x, y]) => {
    const [cx, cy] = center(x, y);
    return { x: cx, y: cy };
  });
  const samples = [pts[0]];
  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 1; i < pts.length - 1; i += 1) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const next = pts[i + 1];
    const v1 = { x: cur.x - prev.x, y: cur.y - prev.y };
    const v2 = { x: next.x - cur.x, y: next.y - cur.y };
    const l1 = Math.hypot(v1.x, v1.y);
    const l2 = Math.hypot(v2.x, v2.y);
    const dot = (v1.x * v2.x + v1.y * v2.y) / (l1 * l2);
    if (dot < 0.999) {
      const r = Math.min(radius, l1 / 2, l2 / 2);
      const a = { x: cur.x - (v1.x / l1) * r, y: cur.y - (v1.y / l1) * r };
      const b = { x: cur.x + (v2.x / l2) * r, y: cur.y + (v2.y / l2) * r };
      d += ` L ${a.x} ${a.y} Q ${cur.x} ${cur.y} ${b.x} ${b.y}`;
      samples.push(a);
      for (let k = 1; k <= CORNER_STEPS; k += 1) samples.push(quad(a, cur, b, k / CORNER_STEPS));
    }
  }

  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  samples.push(last);

  const lengths = [0];
  for (let i = 1; i < samples.length; i += 1) {
    lengths.push(lengths[i - 1] + Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y));
  }
  const length = lengths[lengths.length - 1];

  const at = (s) => {
    const target = Math.max(0, Math.min(length, s));
    let lo = 0;
    let hi = lengths.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (lengths[mid] <= target) lo = mid;
      else hi = mid;
    }
    const span = lengths[hi] - lengths[lo];
    return lerp(samples[lo], samples[hi], span > 0 ? (target - lengths[lo]) / span : 0);
  };

  return { d, length, at };
}
