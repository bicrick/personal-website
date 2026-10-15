import React, { useEffect, useRef, useState } from 'react';
import {
  createMarkPaths,
  fitMark,
  MARK_MASK_STROKES,
  MARK_OUTLINE_STROKES,
  MARK_VIEWBOX,
} from './tapestry/markGeometry';
import './TapestryTilePreview.css';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;
const RIBBON = `${IMG}/ribbon-thumb.webp`;
const RIBBON_FALLBACK = `${IMG}/ribbon-thumb.jpg`;

/** Production about.css `.band .sheen` timing (14s gloss sweep). */
const SHEEN_PERIOD = 14;
/** Production sheen gradient colors. */
const SHEEN_RGB = '255,240,215';

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

function isSiteDark() {
  return typeof document !== 'undefined'
    && document.documentElement.classList.contains('is-dark');
}

function useSiteDark() {
  const [dark, setDark] = useState(isSiteDark);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains('is-dark'));
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

function themePalette(dark) {
  if (dark) {
    return {
      bg: '#0b0b0d',
      under: '#0b0b0d',
      cream: '#efe9df',
      // about.css dark glow opacity ~0.5
      glowAlpha: 0.42,
      sheenPeak: 0.1,
      reflPeak: 0.28,
    };
  }
  // Light: match production surround + inverted mark (dark weave on cream field)
  return {
    bg: '#f4efe7',
    under: '#f4efe7',
    cream: '#1a1612',
    // about.css light: .band .glow { opacity: .38 }
    glowAlpha: 0.32,
    sheenPeak: 0.08,
    reflPeak: 0.2,
  };
}

/**
 * Homepage thumbnail for Infinite Tapestry (variant B only):
 * calm ribbon scrolls inside the official woven infinity mask, with
 * production-matched sheen + ambient glow + soft reflection.
 */
export default function TapestryTilePreview({ className = '' }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const dark = useSiteDark();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    let alive = true;
    let raf = 0;
    let ribbon = null;
    let t0 = performance.now();
    const reduced = prefersReducedMotion();
    const paths = createMarkPaths();
    const palette = themePalette(dark);
    const maskLayer = document.createElement('canvas');
    const sheenLayer = document.createElement('canvas');

    // Soft colour blobs sampled once from the ribbon (production #amb-blobs / .band .glow)
    const glowColors = [
      [255, 176, 82],
      [70, 140, 200],
      [220, 140, 100],
    ];

    const assets = loadImage(RIBBON, RIBBON_FALLBACK).then((r) => {
      if (!alive) return;
      ribbon = r;
      try {
        const s = document.createElement('canvas');
        s.width = 6;
        s.height = 2;
        const sctx = s.getContext('2d', { willReadFrequently: true });
        sctx.drawImage(r, 0, 0, 6, 2);
        const d = sctx.getImageData(0, 0, 6, 2).data;
        for (let n = 0; n < 3; n += 1) {
          const o = n * 8;
          glowColors[n] = [d[o], d[o + 1], d[o + 2]];
        }
      } catch (_) {
        /* keep fallback amber/teal */
      }
    }).catch(() => {});

    const strokeMask = (ctx) => {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#fff';
      MARK_MASK_STROKES.forEach(({ key, width }) => {
        ctx.lineWidth = width;
        ctx.stroke(paths[key]);
      });
    };

    const strokeOutline = (ctx) => {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      MARK_OUTLINE_STROKES.forEach(({ key, width, role }) => {
        ctx.lineWidth = width;
        ctx.strokeStyle = role === 'cream' ? palette.cream : palette.under;
        ctx.stroke(paths[key]);
      });
    };

    const drawScrollingRibbon = (ctx, w, h, time, speed = 26) => {
      if (!ribbon) {
        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, w, h);
        return;
      }
      const scale = h / ribbon.height;
      const drawW = ribbon.width * scale;
      const drawH = h;
      let x = reduced ? -drawW * 0.18 : -((time * speed) % drawW);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      while (x < w) {
        ctx.drawImage(ribbon, x, 0, drawW, drawH);
        x += drawW;
      }
    };

    /** Production about.css sheen keyframes: hold 55%, then sweep -120% → 420%. */
    const sheenProgress = (time) => {
      if (reduced) return 0.35;
      const cycle = (time % SHEEN_PERIOD) / SHEEN_PERIOD;
      if (cycle < 0.55) return 0;
      return (cycle - 0.55) / 0.45;
    };

    const drawGlow = (ctx, w, h, fit, time) => {
      // Soft colour spill around the mark — compositor-style blobs from production .band .glow
      const cx = fit.ox + (MARK_VIEWBOX * fit.scale) / 2;
      const cy = fit.oy + (MARK_VIEWBOX * fit.scale) / 2;
      const R = Math.min(w, h) * 0.55;
      const drift = reduced ? 0 : Math.sin(time * (Math.PI * 2) / 38) * R * 0.04;
      const positions = [
        [cx - R * 0.55 + drift, cy + R * 0.05],
        [cx + drift * 0.6, cy - R * 0.08],
        [cx + R * 0.5 - drift, cy + R * 0.02],
      ];
      ctx.save();
      ctx.globalCompositeOperation = dark ? 'screen' : 'multiply';
      positions.forEach(([x, y], i) => {
        const [r, g, b] = glowColors[i];
        const rad = R * (0.55 + i * 0.08);
        const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
        const a = palette.glowAlpha * (0.55 + 0.15 * i);
        grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    const ensureLayer = (layer, w, h, dpr) => {
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (layer.width !== cw || layer.height !== ch) {
        layer.width = cw;
        layer.height = ch;
      }
      return layer.getContext('2d');
    };

    const buildMaskedLayer = (w, h, dpr, time) => {
      const lctx = ensureLayer(maskLayer, w, h, dpr);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.clearRect(0, 0, w, h);
      drawScrollingRibbon(lctx, w, h, time, 28);

      const fit = fitMark(w, h, 0.1);
      lctx.save();
      lctx.translate(fit.ox, fit.oy);
      lctx.scale(fit.scale, fit.scale);
      lctx.globalCompositeOperation = 'destination-in';
      strokeMask(lctx);
      lctx.restore();
      return { layer: maskLayer, fit };
    };

    const drawSheen = (ctx, w, h, fit, time) => {
      const p = sheenProgress(time);
      if (p <= 0 && !reduced) return;
      // 30% band, gradient at 100deg — matches .band .sheen::before
      const bandW = w * 0.3;
      const x = -bandW + p * (w + bandW * 4.2);
      const peak = palette.sheenPeak;
      const dpr = ctx.canvas.width / w;
      const cctx = ensureLayer(sheenLayer, w, h, dpr);
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cctx.clearRect(0, 0, w, h);

      const grad = cctx.createLinearGradient(x, 0, x + bandW, h * 0.15);
      grad.addColorStop(0, `rgba(${SHEEN_RGB},0)`);
      grad.addColorStop(0.45, `rgba(${SHEEN_RGB},${peak * 0.7})`);
      grad.addColorStop(0.5, `rgba(${SHEEN_RGB},${peak})`);
      grad.addColorStop(1, `rgba(${SHEEN_RGB},0)`);
      cctx.fillStyle = grad;
      cctx.fillRect(x, 0, bandW, h);

      cctx.save();
      cctx.translate(fit.ox, fit.oy);
      cctx.scale(fit.scale, fit.scale);
      cctx.globalCompositeOperation = 'destination-in';
      strokeMask(cctx);
      cctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(sheenLayer, 0, 0, w, h);
      ctx.restore();
    };

    const drawReflection = (ctx, w, h, layer, fit) => {
      // Soft flipped mirror under the mark — production .band-refl falloff
      // (alpha ~0.55 at the edge, exponential fade; about.css .band-refl)
      const markH = MARK_VIEWBOX * fit.scale;
      const markTop = fit.oy;
      const reflTop = markTop + markH + markH * 0.02;
      const reflH = markH * 0.42;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, reflTop, w, reflH);
      ctx.clip();
      ctx.translate(0, reflTop);
      ctx.scale(1, -1);
      ctx.globalAlpha = palette.reflPeak;
      // Draw the mark region flipped: source y from markTop..markTop+markH
      ctx.drawImage(
        layer,
        0, markTop * (layer.height / h), layer.width, markH * (layer.height / h),
        0, -markH, w, markH,
      );
      ctx.restore();

      const cover = ctx.createLinearGradient(0, reflTop, 0, reflTop + reflH);
      const bg = dark ? '11,11,13' : '244,239,231';
      cover.addColorStop(0, `rgba(${bg},0)`);
      cover.addColorStop(0.35, `rgba(${bg},0.45)`);
      cover.addColorStop(1, `rgba(${bg},1)`);
      ctx.fillStyle = cover;
      ctx.fillRect(0, reflTop, w, reflH + 1);
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

      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);

      const { layer, fit } = buildMaskedLayer(w, h, dpr, time);

      drawGlow(ctx, w, h, fit, time);
      drawReflection(ctx, w, h, layer, fit);
      ctx.drawImage(layer, 0, 0, w, h);
      drawSheen(ctx, w, h, fit, time);

      ctx.save();
      ctx.translate(fit.ox, fit.oy);
      ctx.scale(fit.scale, fit.scale);
      strokeOutline(ctx);
      ctx.restore();
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
  }, [dark]);

  return (
    <div
      ref={wrapRef}
      className={`tapestry-tile-preview${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      data-thumb="b"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
