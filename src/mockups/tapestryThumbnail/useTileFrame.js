import { useEffect, useRef } from 'react';
import { loadRibbon, ribbonTime } from './ribbon';

/**
 * Owns one tile canvas: sizing, the shared ribbon bitmap, and the rAF loop.
 * The loop stops offscreen and when the user prefers reduced motion; a single
 * frame stays up in that case.
 */
export default function useTileFrame(paint) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const paintRef = useRef(paint);
  paintRef.current = paint;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    let alive = true;
    let raf = 0;
    let visible = true;
    let ribbon = null;
    const state = {};
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const frame = (now) => {
      if (!alive) return;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'none';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      const reduced = reducedMq.matches;
      wrap.dataset.motion = reduced ? 'reduced' : 'running';
      paintRef.current({
        ctx,
        w,
        h,
        dpr,
        time: ribbonTime(now, reduced),
        ribbon,
        reduced,
        state,
      });
    };

    const loop = (now) => {
      if (!alive) return;
      frame(now);
      if (visible && !reducedMq.matches) raf = requestAnimationFrame(loop);
      else raf = 0;
    };

    const kick = () => {
      if (!alive || raf) return;
      raf = requestAnimationFrame(loop);
    };

    frame(performance.now());

    loadRibbon()
      .then((img) => {
        if (!alive) return;
        ribbon = img;
        if (visible) kick();
        else frame(performance.now());
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('tapestry thumbnail mockup ribbon failed', err);
      });

    const onResize = () => {
      state.maskKey = '';
      frame(performance.now());
    };
    window.addEventListener('resize', onResize);

    const onMotion = () => {
      if (reducedMq.matches) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        frame(performance.now());
      } else if (visible) kick();
    };
    reducedMq.addEventListener('change', onMotion);

    let io;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) kick();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }, { threshold: 0.02 });
      io.observe(wrap);
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      reducedMq.removeEventListener('change', onMotion);
      io?.disconnect();
    };
  }, []);

  return { wrapRef, canvasRef };
}
