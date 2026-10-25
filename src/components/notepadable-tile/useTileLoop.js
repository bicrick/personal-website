import { useEffect, useLayoutEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Scale a fixed virtual stage (stageW wide) to whatever box the tile is in,
 * the same way NotepadableEmbed fits its frame. Returns the scale factor.
 */
export function useStageScale(rootRef, stageW) {
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / stageW);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rootRef, stageW]);
  return scale;
}

/**
 * Drive a seamless loop of `durationMs`. `onFrame(t)` gets the time within the
 * loop every animation frame while the tile is on screen. With reduced motion
 * it is called once with `restT` (the finished, readable frame) and never again.
 * `onFrame` should only write transform / opacity / text to refs.
 */
export function useTileLoop(rootRef, durationMs, restT, onFrame) {
  const frameRef = useRef(onFrame);
  frameRef.current = onFrame;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      frameRef.current(restT);
      return undefined;
    }

    let raf = 0;
    let visible = true;
    let origin = null;
    let pausedAt = null;

    const tick = (now) => {
      if (origin === null) origin = now;
      frameRef.current((now - origin) % durationMs);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf) return;
      if (pausedAt !== null && origin !== null) {
        // Resume where it left off instead of jumping.
        origin += performance.now() - pausedAt;
        pausedAt = null;
      }
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      pausedAt = performance.now();
    };

    frameRef.current(0);
    start();

    let io;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !document.hidden) start();
          else stop();
        },
        { rootMargin: '64px' }
      );
      io.observe(el);
    }
    const onVis = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [rootRef, durationMs, restT]);
}

/** 0→1 over [a, b], clamped, with an ease-in-out curve. */
export function ramp(t, a, b) {
  if (t <= a) return 0;
  if (t >= b) return 1;
  const x = (t - a) / (b - a);
  return x * x * (3 - 2 * x);
}

/** Deterministic per-character typing schedule (ms offsets), so every loop types identically. */
export function typingSchedule(text, { start = 0, base = 46, jitter = 22, newline = 170, space = 18 } = {}) {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const times = [];
  let t = start;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    let d = base + (rand() - 0.5) * 2 * jitter;
    if (ch === '\n') d += newline;
    else if (ch === ' ') d += space;
    t += d;
    times.push(Math.round(t));
  }
  return times;
}

/** How many entries of a sorted schedule have happened by time t. */
export function countUpTo(times, t) {
  let lo = 0;
  let hi = times.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Caret visibility on CodeMirror's 1.2s cycle; solid while typing, blink resumes from `since`. */
export function caretOn(t, since) {
  if (t < since) return true;
  return Math.floor((t - since) / 600) % 2 === 0;
}
