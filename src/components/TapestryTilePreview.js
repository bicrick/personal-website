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
 * Starfield ported from the infinitetapestry.app intro (v6 "halftone bloom",
 * star phase): N = 20000 uniformly random stars over the viewport, so the tile
 * keeps the same density per CSS px as a 1440×900 screen.
 */
const INTRO_STARS = 20000;
const INTRO_REF_AREA = 1440 * 900;
const INTRO_MOTE_RAMP = 0.7;
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
      // intro mote: vec3(.96, .95, .9)
      star: [245, 242, 230],
      hairline: 'rgba(255,255,255,0.42)',
    };
  }
  return {
    bg: '#f4efe7',
    glowAlpha: 0.32,
    sheenPeak: 0.12,
    reflPeak: 0.2,
    // intro mote: vec3(.1)
    star: [26, 26, 26],
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

  // Mirror the left half onto the right in device pixels so both lobes and holes match exactly.
  const half = Math.floor(cw / 2);
  const left = document.createElement('canvas');
  left.width = half;
  left.height = ch;
  left.getContext('2d').drawImage(canvas, 0, 0, half, ch, 0, 0, half, ch);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(cw - half, 0, half, ch);
  ctx.setTransform(-1, 0, 0, 1, cw, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(left, 0, 0);
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

function smoothstep(e0, e1, x) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/**
 * Same per-star randoms as intro.js: a.z/a.w = start position, r.x = dimming,
 * r.y = size / alpha / twinkle phase / drift. Size is the intro's gl_PointSize
 * (intro canvas runs at ≤1.5× DPR) converted to device px.
 */
function seedStars(w, h, dpr) {
  const count = Math.round((INTRO_STARS * w * h) / INTRO_REF_AREA);
  const introPx = dpr / Math.min(dpr, 1.5);
  const out = [];
  let seed = 0x9e3779b9;
  const rnd = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  for (let n = 0; n < count; n += 1) {
    const ax = rnd();
    const ay = rnd();
    const rx = rnd();
    const ry = rnd();
    const pointSize = Math.max(1, 1.7 * (0.75 + 0.5 * ry) * (0.9 + 0.2 * ry));
    out.push({
      ax,
      ay,
      ry,
      size: Math.round(pointSize * introPx * 8) / 8,
      baseA: (0.22 + 0.45 * ry) * (1 - 0.75 * smoothstep(0.35, 0.8, rx)),
    });
  }
  return out;
}

/**
 * Point sprite matching the intro fragment shader: hard disc,
 * alpha = 1 − smoothstep(.41, .5, |pointCoord − .5|), sampled at pixel centres.
 */
function buildStarSprite(size, rgb) {
  // Odd dimension keeps the centre on a pixel centre, so 1px stars stay solid.
  const dim = 2 * Math.ceil(size / 2) + 1;
  const c = dim / 2;
  const canvas = document.createElement('canvas');
  canvas.width = dim;
  canvas.height = dim;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(dim, dim);
  for (let j = 0; j < dim; j += 1) {
    for (let i = 0; i < dim; i += 1) {
      const u = (i + 0.5 - c) / size;
      const v = (j + 0.5 - c) / size;
      const inside = Math.abs(u) <= 0.5 && Math.abs(v) <= 0.5;
      const a = inside ? 1 - smoothstep(0.41, 0.5, Math.hypot(u, v)) : 0;
      const o = (j * dim + i) * 4;
      img.data[o] = rgb[0];
      img.data[o + 1] = rgb[1];
      img.data[o + 2] = rgb[2];
      img.data[o + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return { canvas, c };
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

    const sprites = new Map();
    let moteStart = null;

    /**
     * intro.js star phase (e = 0), per star:
     *   x = fract(a.z + t·(r.y − .5)·.004)·W, y = fract(a.w + .01·sin(t·.5 + r.y·2π))·H
     *   alpha = mote·(.22 + .45·r.y)·(.72 + .28·sin(t·1.7 + r.y·40))·(1 − .75·smoothstep(.35, .8, r.x))
     */
    const drawStars = (ctx, w, h, time, dpr) => {
      const key = `${Math.round(w)}x${Math.round(h)}@${dpr}`;
      if (starsKey !== key) {
        stars = seedStars(w, h, dpr);
        stars.forEach((s) => {
          if (!sprites.has(s.size)) sprites.set(s.size, buildStarSprite(s.size, palette.star));
          s.sprite = sprites.get(s.size);
        });
        starsKey = key;
      }
      const now = performance.now();
      if (moteStart == null) moteStart = now;
      const mote = reduced ? 1 : Math.min(1, (now - moteStart) / 1000 / INTRO_MOTE_RAMP);
      const t = reduced ? 0 : time;
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        const twinkle = 0.72 + 0.28 * Math.sin(t * 1.7 + s.ry * 40);
        const a = mote * s.baseA * twinkle;
        if (a >= 0.004) {
          const fx = s.ax + t * (s.ry - 0.5) * 0.004;
          const fy = s.ay + 0.01 * Math.sin(t * 0.5 + s.ry * Math.PI * 2);
          const x = (fx - Math.floor(fx)) * cw;
          const y = (fy - Math.floor(fy)) * ch;
          const { canvas: img, c } = s.sprite;
          ctx.globalAlpha = a;
          ctx.drawImage(img, Math.floor(x) + 0.5 - c, Math.floor(y) + 0.5 - c);
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
