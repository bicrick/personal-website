import { useEffect, useRef } from 'react';
import { CHART } from './geometry';
import {
  BACK_SPAN,
  FINAL_T,
  RUN_MS,
  chartX,
  chartY,
  pose,
} from './timeline';

const KEYS = [
  'run', 'trunk', 'decoy', 'ghost', 'route', 'ball', 'crow', 'readout',
  'pocket', 'exit', 'clip', 'dot', 'band',
];

function paintTrace(path, amount) {
  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length * (1 - amount)}`;
  path.style.opacity = amount <= 0 ? '0' : '1';
}

function readout(label, distance) {
  const n = distance.toFixed(1);
  if (label === 'stuck') return `stuck · ${n} · no way through`;
  if (label === 'back') return `going back · ${n}`;
  if (label === 'out') return `out · ${n}`;
  return `${label} · ${n}`;
}

function paint(el, t) {
  const p = pose(t);
  el.run.style.opacity = String(p.opacity);

  paintTrace(el.trunk, p.trails.trunk);
  paintTrace(el.decoy, p.trails.decoy);
  paintTrace(el.route, p.trails.route);
  el.ghost.style.opacity = p.deadEnd ? '1' : '0';
  el.pocket.style.opacity = p.deadEnd ? '1' : '0';

  el.ball.setAttribute('cx', p.point.x);
  el.ball.setAttribute('cy', p.point.y);
  el.crow.setAttribute('x1', p.point.x);
  el.crow.setAttribute('y1', p.point.y);
  el.crow.style.opacity = p.label === 'out' ? '0' : '1';

  el.readout.textContent = readout(p.label, p.distance);
  el.readout.classList.toggle('is-back', p.label === 'back');
  el.exit.classList.toggle('is-reached', p.label === 'out');

  const x = chartX(t);
  el.clip.setAttribute('width', String(Math.max(0, x - CHART.x + 4)));
  el.dot.setAttribute('cx', x);
  el.dot.setAttribute('cy', chartY(p.distance));
  el.dot.classList.toggle('is-back', p.label === 'back');
  el.band.style.opacity = x > BACK_SPAN.x0 ? '1' : '0';
}

export default function useMazeRun(reduce) {
  const refs = useRef(null);
  if (!refs.current) {
    refs.current = Object.fromEntries(KEYS.map((key) => [key, { current: null }]));
  }

  useEffect(() => {
    const el = Object.fromEntries(KEYS.map((key) => [key, refs.current[key].current]));
    if (KEYS.some((key) => !el[key])) return undefined;

    if (reduce) {
      paint(el, FINAL_T);
      return undefined;
    }

    let frame = 0;
    const started = performance.now();
    const tick = (now) => {
      paint(el, (now - started) % RUN_MS);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [reduce]);

  return refs.current;
}
