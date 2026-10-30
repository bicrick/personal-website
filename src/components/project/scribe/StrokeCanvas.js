import React, { useEffect, useRef } from 'react';
import { resolveInk } from './hands';

function inkColor() {
  if (typeof window === 'undefined') return '#21232d';
  const v = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
  return v || '#21232d';
}

/** Draws scenario ink up to `progress` (0..1) in the theme ink color. */
export default function StrokeCanvas({
  ink,
  handId = 'neat',
  progress = 1,
  className,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || !ink) return undefined;
    const ctx = cv.getContext('2d');
    const data = resolveInk(ink, handId);
    const paint = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssW = cv.clientWidth || 1;
      const cssH = cv.clientHeight || 1;
      cv.width = Math.round(cssW * dpr);
      cv.height = Math.round(cssH * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      // Uniform "meet" scale + center — same transform as the wireframe SVG
      // (preserveAspectRatio=xMidYMid meet). Non-uniform stretch used to drift
      // ink left of region boxes on portrait papers.
      const scale = Math.min(cssW / data.w, cssH / data.h);
      const ox = (cssW - data.w * scale) / 2;
      const oy = (cssH - data.h * scale) / 2;
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);
      ctx.strokeStyle = inkColor();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const total = data.strokes.length;
      const until = progress >= 1 ? total : Math.floor(total * progress);
      const frac = progress >= 1 ? 0 : (total * progress) - until;
      for (let i = 0; i < until; i += 1) {
        const s = data.strokes[i];
        if (!s.xs.length) continue;
        ctx.lineWidth = s.w || 0.45;
        ctx.beginPath();
        ctx.moveTo(s.xs[0], s.ys[0]);
        for (let k = 1; k < s.xs.length; k += 1) ctx.lineTo(s.xs[k], s.ys[k]);
        ctx.stroke();
      }
      if (frac > 0 && until < total) {
        const s = data.strokes[until];
        const n = Math.max(1, Math.floor((s.xs.length - 1) * frac));
        ctx.lineWidth = s.w || 0.45;
        ctx.beginPath();
        ctx.moveTo(s.xs[0], s.ys[0]);
        for (let k = 1; k <= n; k += 1) ctx.lineTo(s.xs[k], s.ys[k]);
        ctx.stroke();
      }
    };
    paint();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(paint) : null;
    if (ro) ro.observe(cv);
    window.addEventListener('resize', paint);
    // site toggles html.is-dark — observe class changes
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      if (ro) ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', paint);
    };
  }, [ink, handId, progress]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
