import React, { useEffect, useRef } from 'react';
import './TapestryTilePreview.css';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;
const BRAND = `${IMG}/brand`;
const RIBBON = `${IMG}/ribbon-scroll.webp`;
const RIBBON_FALLBACK = `${IMG}/ribbon-scroll.jpg`;
const MASK = `${BRAND}/mask-infinity.png`;
const MARK_CREAM = `${BRAND}/mark-cream.png`;

export const THUMB_VARIANTS = ['a', 'b', 'c'];

/** Official infinity stroke used by the mark (viewBox 0..64). */
const INFINITY_D =
  'M18 42c5 0 9-3 14-10s9-10 14-10a10 10 0 0 1 0 20c-5 0-9-3-14-10s-9-10-14-10a10 10 0 0 0 0 20z';

function loadImage(src, fallback) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => {
      if (fallback) {
        const second = new Image();
        second.onload = () => resolve(second);
        second.onerror = reject;
        second.src = fallback;
      } else {
        reject(new Error(`failed ${src}`));
      }
    };
    img.src = src;
  });
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Homepage / preview thumbnail for Infinite Tapestry.
 * variant: 'a' | 'b' | 'c'
 *   a — painting scrolls along the infinity loop path
 *   b — painting scrolls inside the infinity mark as a mask
 *   c — infinity stroke draws itself while strips paint in behind
 */
export default function TapestryTilePreview({
  variant = 'a',
  className = '',
  showBadge = true,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const v = THUMB_VARIANTS.includes(variant) ? variant : 'a';

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    let alive = true;
    let raf = 0;
    let ribbon = null;
    let mask = null;
    let mark = null;
    let t0 = performance.now();
    const reduced = prefersReducedMotion();
    const path = new Path2D(INFINITY_D);

    const assets = Promise.all([
      loadImage(RIBBON, RIBBON_FALLBACK),
      loadImage(MASK),
      loadImage(MARK_CREAM),
    ]).then(([r, m, c]) => {
      if (!alive) return;
      ribbon = r;
      mask = m;
      mark = c;
    }).catch(() => {});

    const drawScrollingRibbon = (ctx, w, h, time, speed = 28) => {
      if (!ribbon) {
        ctx.fillStyle = '#0b0b0d';
        ctx.fillRect(0, 0, w, h);
        return { drawW: w };
      }
      const scale = h / ribbon.height;
      const drawW = ribbon.width * scale;
      const drawH = h;
      let x = reduced ? -drawW * 0.15 : -((time * speed) % drawW);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      while (x < w) {
        ctx.drawImage(ribbon, x, 0, drawW, drawH);
        x += drawW;
      }
      return { drawW };
    };

    const fitInfinity = (w, h, pad = 0.14) => {
      const box = 64;
      const scale = Math.min(w, h) * (1 - pad * 2) / box;
      const ox = (w - box * scale) / 2;
      const oy = (h - box * scale) / 2;
      return { scale, ox, oy };
    };

    const drawA = (ctx, w, h, time) => {
      // Dark field + faint full ribbon underlay
      ctx.fillStyle = '#0b0b0d';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.22;
      drawScrollingRibbon(ctx, w, h, time, 18);
      ctx.globalAlpha = 1;

      if (!ribbon) return;
      const { scale, ox, oy } = fitInfinity(w, h, 0.1);
      // Pattern that scrolls: sample ribbon into a pattern space
      const bandH = Math.max(28, Math.round(Math.min(w, h) * 0.16));
      const off = document.createElement('canvas');
      off.width = Math.max(64, Math.floor(ribbon.width * (bandH / ribbon.height)));
      off.height = bandH;
      const octx = off.getContext('2d');
      octx.drawImage(ribbon, 0, 0, off.width, off.height);
      const pattern = ctx.createPattern(off, 'repeat');
      if (!pattern) return;

      const shift = reduced ? 0 : (time * 42) % off.width;
      // Stroke infinity with scrolling pattern
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);
      // Widen stroke in path units so it reads at card size
      ctx.lineWidth = 11;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Map pattern into path space
      const patScale = 1 / scale;
      pattern.setTransform(new DOMMatrix()
        .translate(-shift * patScale, 0)
        .scale(patScale * (bandH / off.height), patScale * (bandH / off.height)));
      ctx.strokeStyle = pattern;
      ctx.stroke(path);

      // Cream woven outline on top (official mark feel)
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = '#efe9df';
      ctx.globalAlpha = 0.95;
      ctx.stroke(path);
      ctx.globalAlpha = 1;
      ctx.restore();

      // Soft vignette
      const g = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.2, w * 0.5, h * 0.5, Math.min(w, h) * 0.75);
      g.addColorStop(0, 'rgba(11,11,13,0)');
      g.addColorStop(1, 'rgba(11,11,13,0.55)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

    const drawB = (ctx, w, h, time) => {
      ctx.fillStyle = '#0b0b0d';
      ctx.fillRect(0, 0, w, h);

      // Paint scrolling ribbon into a layer, then mask to infinity
      const layer = document.createElement('canvas');
      layer.width = canvas.width;
      layer.height = canvas.height;
      const lctx = layer.getContext('2d');
      const dpr = canvas.width / w;
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScrollingRibbon(lctx, w, h, time, 30);

      if (mask) {
        lctx.globalCompositeOperation = 'destination-in';
        const { scale, ox, oy } = fitInfinity(w, h, 0.08);
        // mask image is 0..64 content; draw scaled
        lctx.drawImage(mask, ox, oy, 64 * scale, 64 * scale);
      }

      ctx.drawImage(layer, 0, 0, w, h);

      // Cream mark outline for definition
      if (mark) {
        const { scale, ox, oy } = fitInfinity(w, h, 0.08);
        ctx.globalAlpha = 0.92;
        ctx.drawImage(mark, ox, oy, 64 * scale, 64 * scale);
        ctx.globalAlpha = 1;
      }
    };

    const drawC = (ctx, w, h, time) => {
      ctx.fillStyle = '#0b0b0d';
      ctx.fillRect(0, 0, w, h);

      // Strips paint in left → right (looping)
      const cycle = reduced ? 1 : ((time * 0.22) % 1.35);
      const reveal = Math.min(1, cycle / 1);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w * reveal, h);
      ctx.clip();
      drawScrollingRibbon(ctx, w, h, time, 16);
      ctx.restore();

      // Leading paint edge
      if (!reduced && reveal < 1) {
        const gx = w * reveal;
        const grad = ctx.createLinearGradient(gx - 18, 0, gx + 8, 0);
        grad.addColorStop(0, 'rgba(239,233,223,0)');
        grad.addColorStop(0.6, 'rgba(239,233,223,0.35)');
        grad.addColorStop(1, 'rgba(239,233,223,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(gx - 18, 0, 26, h);
      }

      // Infinity stroke draws itself
      const { scale, ox, oy } = fitInfinity(w, h, 0.12);
      const drawProgress = reduced ? 1 : Math.min(1, Math.max(0, (cycle - 0.08) / 0.85));
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);
      // Approximate path length in viewBox units
      const pathLen = 118;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([pathLen * drawProgress, pathLen]);
      ctx.lineDashOffset = 0;

      // Dark under-stroke
      ctx.strokeStyle = '#0b0b0d';
      ctx.lineWidth = 9;
      ctx.stroke(path);
      // Cream weave
      ctx.strokeStyle = '#efe9df';
      ctx.lineWidth = 6.4;
      ctx.stroke(path);
      ctx.strokeStyle = '#0b0b0d';
      ctx.lineWidth = 4;
      ctx.stroke(path);
      ctx.strokeStyle = '#efe9df';
      ctx.lineWidth = 1.3;
      ctx.stroke(path);
      ctx.restore();

      // After a full draw, hold briefly then loop (handled by cycle wrap)
      if (reveal >= 1 && mark && drawProgress >= 1) {
        const fit = fitInfinity(w, h, 0.12);
        ctx.globalAlpha = 0.2;
        ctx.drawImage(mark, fit.ox, fit.oy, 64 * fit.scale, 64 * fit.scale);
        ctx.globalAlpha = 1;
      }
    };

    const draw = (now) => {
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
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const time = (now - t0) / 1000;

      if (v === 'b') drawB(ctx, w, h, time);
      else if (v === 'c') drawC(ctx, w, h, time);
      else drawA(ctx, w, h, time);
    };

    const tick = (now) => {
      draw(now);
      raf = requestAnimationFrame(tick);
    };

    assets.finally(() => {
      if (!alive) return;
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    });

    const onResize = () => draw(performance.now());
    window.addEventListener('resize', onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [v]);

  return (
    <div
      ref={wrapRef}
      className={`tapestry-tile-preview is-${v}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      data-thumb={v}
    >
      <canvas ref={canvasRef} />
      {showBadge ? <span className="tapestry-tile-live">live</span> : null}
    </div>
  );
}
