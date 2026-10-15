import React, { useEffect, useRef, useState } from 'react';
import {
  createMarkPaths,
  fitMark,
  MARK_CROSSING_STROKES,
  MARK_MASK_STROKES,
  MARK_VIEWBOX,
} from './tapestry/markGeometry';
import './TapestryTilePreview.css';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;
const RIBBON = `${IMG}/ribbon-thumb.webp`;
const RIBBON_FALLBACK = `${IMG}/ribbon-thumb.jpg`;

const SHEEN_PERIOD = 14;
const SHEEN_RGB = '255,240,215';

function loadImage(src, fallback) {
  const trySrc = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (!img.naturalWidth) {
        reject(new Error(`empty image ${url}`));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error(`failed ${url}`));
    img.src = url;
  });
  return trySrc(src).catch((err) => {
    if (!fallback) throw err;
    return trySrc(fallback);
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
      glowAlpha: 0.42,
      sheenPeak: 0.14,
      reflPeak: 0.28,
    };
  }
  return {
    bg: '#f4efe7',
    under: '#f4efe7',
    cream: '#1a1612',
    glowAlpha: 0.32,
    sheenPeak: 0.12,
    reflPeak: 0.2,
  };
}

/**
 * Rasterize the official mark.svg outermost strokes into a solid alpha mask.
 * Built once per size; reused for destination-in each frame.
 */
function buildSolidMask(paths, cssW, cssH, dpr, fit) {
  const cw = Math.round(cssW * dpr);
  const ch = Math.round(cssH * dpr);
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.translate(fit.ox, fit.oy);
  ctx.scale(fit.scale, fit.scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#ffffff';
  MARK_MASK_STROKES.forEach(({ key, width }) => {
    ctx.lineWidth = width;
    ctx.stroke(paths[key]);
  });
  return canvas;
}

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
    let solidMask = null;
    let solidMaskKey = '';
    let t0 = performance.now();
    const reduced = prefersReducedMotion();
    const paths = createMarkPaths();
    const palette = themePalette(dark);
    const paintLayer = document.createElement('canvas');
    const sheenLayer = document.createElement('canvas');

    const glowColors = [
      [255, 176, 82],
      [70, 140, 200],
      [220, 140, 100],
    ];

    const assets = loadImage(RIBBON, RIBBON_FALLBACK)
      .then((r) => {
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
        } catch (_) { /* keep fallbacks */ }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('TapestryTilePreview ribbon failed', RIBBON, err);
      });

    const ensureSize = (layer, w, h, dpr) => {
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (layer.width !== cw || layer.height !== ch) {
        layer.width = cw;
        layer.height = ch;
      }
      const ctx = layer.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      return ctx;
    };

    const drawScrollingRibbon = (ctx, w, h, time, speed = 28) => {
      if (!ribbon || !ribbon.naturalWidth) {
        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, w, h);
        return;
      }
      const scale = h / ribbon.naturalHeight;
      const drawW = ribbon.naturalWidth * scale;
      let x = reduced ? -drawW * 0.18 : -((time * speed) % drawW);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      while (x < w) {
        ctx.drawImage(ribbon, x, 0, drawW, h);
        x += drawW;
      }
    };

    const sheenProgress = (time) => {
      if (reduced) return 0.35;
      const cycle = (time % SHEEN_PERIOD) / SHEEN_PERIOD;
      if (cycle < 0.55) return 0;
      return (cycle - 0.55) / 0.45;
    };

    const drawGlow = (ctx, w, h, fit, time) => {
      const cx = fit.ox + (MARK_VIEWBOX * fit.scale) / 2;
      const cy = fit.oy + (MARK_VIEWBOX * fit.scale) / 2;
      const R = Math.min(w, h) * 0.55;
      const drift = reduced ? 0 : Math.sin((time * Math.PI * 2) / 38) * R * 0.04;
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

    const buildCutout = (w, h, dpr, time) => {
      const fit = fitMark(w, h);
      const key = `${Math.round(w)}x${Math.round(h)}@${dpr}`;
      if (!solidMask || solidMaskKey !== key) {
        solidMask = buildSolidMask(paths, w, h, dpr, fit);
        solidMaskKey = key;
      }

      const lctx = ensureSize(paintLayer, w, h, dpr);
      lctx.clearRect(0, 0, w, h);
      drawScrollingRibbon(lctx, w, h, time, 28);

      // destination-in with a pre-rasterized solid mask (mark.svg outermost strokes)
      lctx.globalCompositeOperation = 'destination-in';
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.drawImage(solidMask, 0, 0);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.globalCompositeOperation = 'source-over';
      return { layer: paintLayer, fit };
    };

    const drawSheen = (ctx, w, h, fit, time, dpr) => {
      const p = sheenProgress(time);
      if (p <= 0 && !reduced) return;
      const bandW = w * 0.3;
      const x = -bandW + p * (w + bandW * 4.2);
      const peak = palette.sheenPeak;
      const cctx = ensureSize(sheenLayer, w, h, dpr);
      cctx.clearRect(0, 0, w, h);
      const grad = cctx.createLinearGradient(x, 0, x + bandW, h * 0.15);
      grad.addColorStop(0, `rgba(${SHEEN_RGB},0)`);
      grad.addColorStop(0.45, `rgba(${SHEEN_RGB},${peak * 0.7})`);
      grad.addColorStop(0.5, `rgba(${SHEEN_RGB},${peak})`);
      grad.addColorStop(1, `rgba(${SHEEN_RGB},0)`);
      cctx.fillStyle = grad;
      cctx.fillRect(x, 0, bandW, h);

      if (solidMask) {
        cctx.globalCompositeOperation = 'destination-in';
        cctx.setTransform(1, 0, 0, 1, 0, 0);
        cctx.drawImage(solidMask, 0, 0);
        cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cctx.globalCompositeOperation = 'source-over';
      }

      ctx.save();
      ctx.globalCompositeOperation = dark ? 'screen' : 'soft-light';
      ctx.drawImage(sheenLayer, 0, 0, w, h);
      ctx.restore();
    };

    const drawReflection = (ctx, w, h, layer, fit) => {
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
      ctx.drawImage(
        layer,
        0,
        markTop * (layer.height / h),
        layer.width,
        markH * (layer.height / h),
        0,
        -markH,
        w,
        markH,
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

    const strokeOutline = (ctx, fit) => {
      ctx.save();
      ctx.translate(fit.ox, fit.oy);
      ctx.scale(fit.scale, fit.scale);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      // Official mark.svg 1.3 cream highlight
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = palette.cream;
      ['right', 'left', 'weave'].forEach((key) => {
        ctx.lineWidth = 1.3;
        ctx.stroke(paths[key]);
      });
      MARK_CROSSING_STROKES.forEach(({ key, width, role }) => {
        ctx.lineWidth = width;
        ctx.globalAlpha = role === 'cream' ? 0.95 : 0.85;
        ctx.strokeStyle = role === 'cream' ? palette.cream : palette.under;
        ctx.stroke(paths[key]);
      });
      ctx.globalAlpha = 1;
      ctx.restore();
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

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);

      const { layer, fit } = buildCutout(w, h, dpr, time);
      drawGlow(ctx, w, h, fit, time);
      drawReflection(ctx, w, h, layer, fit);
      ctx.drawImage(layer, 0, 0, w, h);
      strokeOutline(ctx, fit);
      drawSheen(ctx, w, h, fit, time, dpr);
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

    const onResize = () => {
      solidMask = null;
      solidMaskKey = '';
      draw(performance.now());
    };
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
