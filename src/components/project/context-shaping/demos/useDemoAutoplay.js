import { useCallback, useEffect, useRef, useState } from 'react';
import useReducedMotion from '../../useReducedMotion';

/**
 * Scroll-triggered guided autoplay for demos.
 * - Starts when the root enters view.
 * - Advances idx 0..length-1; optionally loops or settles.
 * - prefers-reduced-motion → jump to last step, no animation.
 * - Optional pause / step / replay after (or during) autoplay.
 * - `durations[i]` (ms) overrides `stepMs` for step i, for timelines that mix
 *   quick per-turn frames with slower narrated beats.
 */
export default function useDemoAutoplay({
  length,
  stepMs = 1600,
  holdLastMs = 2400,
  loop = false,
  initialIndex = 0,
  durations = null,
}) {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [idx, setIdx] = useState(() =>
    reduce ? Math.max(0, length - 1) : initialIndex
  );
  const [playing, setPlaying] = useState(!reduce);
  const [finishedOnce, setFinishedOnce] = useState(reduce);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // "In view" = crossing the middle band of the screen, so demos taller
      // than the viewport (common on phones) still start.
      { threshold: 0, rootMargin: '-30% 0px -30% 0px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce) {
      setIdx(Math.max(0, length - 1));
      setPlaying(false);
      setFinishedOnce(true);
    }
  }, [reduce, length]);

  useEffect(() => {
    if (reduce || !inView || !playing || length < 1) return undefined;
    const last = length - 1;
    const delay = idx >= last ? holdLastMs : durations?.[idx] ?? stepMs;
    const id = window.setTimeout(() => {
      if (idx >= last) {
        setFinishedOnce(true);
        if (loop) {
          setIdx(0);
        } else {
          setPlaying(false);
        }
      } else {
        setIdx((i) => i + 1);
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [reduce, inView, playing, idx, length, stepMs, holdLastMs, loop, durations]);

  const pause = useCallback(() => setPlaying(false), []);
  const play = useCallback(() => {
    if (reduce) return;
    setPlaying(true);
  }, [reduce]);

  const replay = useCallback(() => {
    setIdx(0);
    setFinishedOnce(false);
    if (!reduce) setPlaying(true);
  }, [reduce]);

  const stepNext = useCallback(() => {
    setPlaying(false);
    setIdx((i) => Math.min(length - 1, i + 1));
    if (idx >= length - 2) setFinishedOnce(true);
  }, [length, idx]);

  const stepPrev = useCallback(() => {
    setPlaying(false);
    setIdx((i) => Math.max(0, i - 1));
  }, []);

  const goTo = useCallback(
    (i) => {
      setPlaying(false);
      setIdx(Math.max(0, Math.min(length - 1, i)));
      if (i >= length - 1) setFinishedOnce(true);
    },
    [length]
  );

  return {
    rootRef,
    idx,
    playing,
    finishedOnce,
    reduce,
    inView,
    pause,
    play,
    replay,
    stepNext,
    stepPrev,
    goTo,
  };
}
