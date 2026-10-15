import React, { useEffect, useRef, useState } from 'react';
import {
  createMarkPaths,
  fitMark,
  MARK_MASK_STROKES,
  MARK_VIEWBOX,
} from './tapestry/markGeometry';
import './TapestryTilePreview.css';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;
const RIBBON = `${IMG}/ribbon-thumb.webp`;
const RIBBON_FALLBACK = `${IMG}/ribbon-thumb.jpg`;

const SHEEN_PERIOD = 14;
const SHEEN_RGB = '255,240,215';
/**
 * Starfield after infinitetapestry.app intro.js: jittered lattice of
 * 1.6px·(.85+.3r) points at alpha .25+.35r, drifting in x with a slow y wobble.
 * Lattice cell is shrunk for the thumbnail so the field stays dense.
 */
const STAR_SPACING = 4.8;
const STAR_CROSS_FRAC = 0.04;
const STAR_ALPHA_BUCKETS = 24;
const RIBBON_SPEED = 12;

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
      glowAlpha: 0.42,
      sheenPeak: 0.14,
      reflPeak: 0.28,
      sparkle: '255,255,255',
      sparklePeak: 1,
      hairline: 'rgba(255,255,255,0.42)',
    };
  }
  return {
    bg: '#f4efe7',
    glowAlpha: 0.32,
    sheenPeak: 0.12,
    reflPeak: 0.2,
    sparkle: '20,20,20',
    sparklePeak: 1,
    hairline: 'rgba(20,20,20,0.5)',
  };
}

/**
 * Rasterize the official mark.svg outermost strokes into a solid alpha mask.
 * Built once per size; reused for destination-in each frame.
 * No woven outline is drawn — cutout only.
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

/**
 * Ring of `radius` device px just outside the mask (covers the inner holes too),
 * made by dilating the mask and punching the original back out.
 */
function buildMaskHairline(mask, radius, color) {
  const canvas = document.createElement('canvas');
  canvas.width = mask.width;
  canvas.height = mask.height;
  const ctx = canvas.getContext('2d');
  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      if (dx * dx + dy * dy <= radius * radius + 1) ctx.drawImage(mask, dx, dy);
    }
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Jittered lattice like intro.js: (i + .2 + .6·rnd)·cell. Sizes are in device px.
 */
function seedStars(w, h, dpr) {
  const cell = STAR_SPACING;
  const cols = Math.max(8, Math.ceil(w / cell));
  const rows = Math.max(6, Math.ceil(h / cell));
  const out = [];
  let seed = 0x9e3779b9;
  const rnd = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      const jx = rnd();
      const jy = rnd();
      const r0 = rnd();
      const r1 = rnd();
      // intro points are 1.6px with an exp(-d²·9) falloff; ~1.1px is the visible core
      const size = Math.max(1, Math.round(1.1 * dpr * (0.85 + 0.3 * r0)));
      out.push({
        x: (i + 0.2 + 0.6 * jx) / cols,
        y: (j + 0.2 + 0.6 * jy) / rows,
        size,
        phase: r1 * Math.PI * 2,
        // intro: x drift uT·6·(r.x−.5) world px/s ≈ ±3 screen px/s
        driftX: 6 * (r0 - 0.5),
        baseA: 0.25 + 0.35 * r0,
        cross: rnd() < STAR_CROSS_FRAC && r0 > 0.5,
        twinkle: 0.6 + rnd() * 1.2,
      });
    }
  }
  return out;
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
    let visible = true;
    let ribbon = null;
    let solidMask = null;
    let solidMaskKey = '';
    let hairline = null;
    let t0 = performance.now();
    const reduced = prefersReducedMotion();
    const paths = createMarkPaths();
    const palette = themePalette(dark);
    const paintLayer = document.createElement('canvas');
    const sheenLayer = document.createElement('canvas');
    let stars = [];
    let starsKey = '';

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

    const drawScrollingRibbon = (ctx, w, h, time, speed = RIBBON_SPEED) => {
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
        hairline = buildMaskHairline(solidMask, Math.max(1, Math.round(dpr)), palette.hairline);
        solidMaskKey = key;
      }

      const lctx = ensureSize(paintLayer, w, h, dpr);
      lctx.clearRect(0, 0, w, h);
      drawScrollingRibbon(lctx, w, h, time, RIBBON_SPEED);

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

    const buckets = Array.from({ length: STAR_ALPHA_BUCKETS }, () => []);
    const bucketStyles = buckets.map((_, b) => (
      `rgba(${palette.sparkle},${(palette.sparklePeak * (b + 0.5)) / STAR_ALPHA_BUCKETS})`
    ));

    /**
     * Hard device-pixel points batched by quantised alpha so thousands of stars
     * cost a couple dozen fillStyle changes per frame.
     */
    const drawStars = (ctx, w, h, time, dpr) => {
      const key = `${Math.round(w)}x${Math.round(h)}@${dpr}`;
      if (starsKey !== key) {
        stars = seedStars(w, h, dpr);
        starsKey = key;
      }
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      const wobble = h * 0.02 * dpr;
      buckets.forEach((b) => { b.length = 0; });
      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        const flicker = reduced
          ? 0.8
          : 0.6 + 0.4 * Math.sin(time * s.twinkle + s.phase);
        const a = Math.min(0.999, s.baseA * flicker);
        const xOff = reduced ? 0 : time * s.driftX * dpr;
        const yOff = reduced ? 0 : wobble * Math.sin(time * 0.7 + s.phase);
        s.px = Math.floor((((s.x * cw + xOff) % cw) + cw) % cw);
        s.py = Math.floor((((s.y * ch + yOff) % ch) + ch) % ch);
        s.a = a;
        buckets[Math.floor(a * STAR_ALPHA_BUCKETS)].push(s);
      }
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.globalCompositeOperation = 'source-over';
      const arm = Math.max(2, Math.round(2 * dpr));
      const line = Math.max(1, Math.round(dpr * 0.75));
      for (let b = 0; b < buckets.length; b += 1) {
        const list = buckets[b];
        if (list.length) {
          ctx.fillStyle = bucketStyles[b];
          for (let i = 0; i < list.length; i += 1) {
            const s = list[i];
            ctx.fillRect(s.px, s.py, s.size, s.size);
          }
        }
      }
      if (!reduced) {
        for (let i = 0; i < stars.length; i += 1) {
          const s = stars[i];
          if (s.cross) {
            const crossA = s.a * 0.55;
            ctx.fillStyle = bucketStyles[Math.floor(crossA * STAR_ALPHA_BUCKETS)];
            const cx = s.px + Math.floor((s.size - line) / 2);
            const cy = s.py + Math.floor((s.size - line) / 2);
            ctx.fillRect(cx - arm, cy, arm * 2 + line, line);
            ctx.fillRect(cx, cy - arm, line, arm * 2 + line);
          }
        }
      }
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
      drawStars(ctx, w, h, time, dpr);
      drawReflection(ctx, w, h, layer, fit);
      ctx.drawImage(layer, 0, 0, w, h);
      if (hairline) ctx.drawImage(hairline, 0, 0, w, h);
      drawSheen(ctx, w, h, fit, time, dpr);
    };

    const tick = (now) => {
      if (!alive) return;
      if (visible) {
        draw(now);
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const resume = () => {
      if (!alive || raf) return;
      t0 = performance.now() - ((performance.now() - t0) % 1000);
      raf = requestAnimationFrame(tick);
    };

    assets.finally(() => {
      if (!alive) return;
      t0 = performance.now();
      if (visible) raf = requestAnimationFrame(tick);
      else draw(performance.now());
    });

    const onResize = () => {
      solidMask = null;
      solidMaskKey = '';
      draw(performance.now());
    };
    window.addEventListener('resize', onResize);

    let io;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) resume();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }, { threshold: 0.05 });
      io.observe(wrap);
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      io?.disconnect();
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
