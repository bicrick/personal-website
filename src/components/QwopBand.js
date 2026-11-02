import { useEffect, useRef } from 'react';
import './QwopBand.css';

/**
 * Thin homepage band: real QWOP ragdoll centered, running in place on the
 * real track surface (sprintbg crop) + seamless pixel grass below. Transparent canvas
 * so it blends into the page. Playback 1.5x.
 *
 * Loop: hard cut on a seam pair searched from best-run.json where pose[b]
 * closely matches pose[a]. Every rendered pose is a real recorded frame (or
 * a sub-frame lerp between two adjacent real frames). No crossfade blend.
 * Runner pose still plays recorded frames; ground scroll is decoupled.
 *
 * Atmosphere: full-width pixel day/night sky (blue / deep navy) with
 * drifting pixel clouds + two rolling-hill layers. Ground + layers scroll at
 * a CONSTANT average loop speed (not the replay's micro-accelerations).
 * Parallax factors are fractions of on-screen ground CSS px/s. Vertical alpha
 * only: opaque through the hills, then a long dithered fade upward.
 * Day follows light theme, night follows html.is-dark; ?sky=day|night overrides.
 */
const ASSET = `${process.env.PUBLIC_URL}/demos/qwop`;
const BAND_ZOOM = 1.15; // ~15% closer (runner/track/grass/hills); sky pad stays put
const RUNNER_H = Math.round(58 * BAND_ZOOM); // was 58
const BODY_WORLD_H = 14.2;
const TRACK_CENTER_Y = 10.74275;
const METERS_TO_WORLD = 10;
const TRACK_ROW_TOP = 325;
const TRACK_ROW_BOT = 383;
const UG_OVERLAP_NATIVE = 4;
const HEAD_PAD = 10;
const SKY_EXTRA_MIN = 200; // unchanged — zoom grows content into the frame, not more empty sky
const TRACK_DRAW_SCALE = 1.35; // visual mass (layout contact stays on unscaled trackH)
const UG_DEPTH = 6.2;
const PLAYBACK_RATE = 1.5;
const ATMOS_SCALE = 2 * BAND_ZOOM; // clouds/hills/stars (nearest-neighbor, stays crisp)

// Parallax factors vs on-screen ground CSS px/s (NOT native scroll units —
// blitScrolling takes destination CSS px; dirt scrolls at scrollNative * partScale).
const CLOUD_PARALLAX = 0.025;
const FAR_HILL_PARALLAX = 0.06;
const NEAR_HILL_PARALLAX = 0.15;
const STAR_PARALLAX = 0.01;

// Hard-loop window [START, END): pose[END] ≈ pose[START] (offline search).
const STRIDE_START = 240;
const STRIDE_END = 663;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`fail ${src}`));
    img.src = src;
  });
}

async function loadJson(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`fail ${src}`);
  return res.json();
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shortestAngleDelta(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Sub-frame lerp; angles travel the shortest arc. */
function lerpPose(fromPose, toPose, t) {
  const out = new Array(fromPose.length);
  for (let i = 0; i < fromPose.length; i += 1) {
    const [x0, y0, a0] = fromPose[i];
    const [x1, y1, a1] = toPose[i];
    out[i] = [
      lerp(x0, x1, t),
      lerp(y0, y1, t),
      a0 + shortestAngleDelta(a0, a1) * t,
    ];
  }
  return out;
}

function pickStrideWindow(/* run */) {
  return { strideStart: STRIDE_START, strideEnd: STRIDE_END };
}

function readSkyQuery() {
  if (typeof window === 'undefined') return null;
  try {
    const v = new URLSearchParams(window.location.search).get('sky');
    if (v === 'day' || v === 'night') return v;
  } catch (_) {
    /* ignore */
  }
  return null;
}

function resolveSkyMode() {
  const q = readSkyQuery();
  if (q) return q;
  // Follow the site theme toggle (html.is-dark). Night into the light
  // wallpaper looks muddy; day into dark wallpaper does too — so sky
  // tracks theme unless ?sky= forces a preview.
  if (typeof document !== 'undefined'
      && document.documentElement.classList.contains('is-dark')) {
    return 'night';
  }
  return 'day';
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Track surface is a 1px-wide sprintbg column stretched horizontally.
 * Build a modest strip; drawGround paints it as ONE full-width blit so
 * there are no tile seams (non-integer tile widths left light gaps).
 */
function buildTrackSurface(sprintbg) {
  const h = TRACK_ROW_BOT - TRACK_ROW_TOP;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(sprintbg, 0, TRACK_ROW_TOP, 1, h, 0, 0, c.width, h);
  return c;
}

/** 1px-wide stepped sky column — clear day blue or deep navy. */
function buildSkyFill(mode) {
  const h = 48;
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  for (let y = 0; y < h; y += 1) {
    const t = y / (h - 1); // 0 = top, 1 = bottom (near track)
    if (mode === 'day') {
      // Clear daytime blue, slightly lighter near horizon.
      const r = Math.round(96 + t * 48);
      const gre = Math.round(158 + t * 42);
      const b = Math.round(214 + t * 28);
      g.fillStyle = `rgb(${r},${gre},${b})`;
    } else {
      const r = Math.round(10 + t * 18);
      const gre = Math.round(14 + t * 24);
      const b = Math.round(36 + t * 40);
      g.fillStyle = `rgb(${r},${gre},${b})`;
    }
    g.fillRect(0, y, 1, 1);
  }
  return c;
}

/** Hard-edged pixel cloud blob (low-res, later integer-scaled). */
function paintPixelCloud(g, ox, oy, tone) {
  // tone: { hi, mid, lo }
  const cells = [
    // row relative y, runs of [x, w, colorKey]
    [0, [[3, 4, 'mid']]],
    [1, [[2, 7, 'mid'], [3, 4, 'hi']]],
    [2, [[1, 10, 'mid'], [2, 6, 'hi']]],
    [3, [[0, 12, 'mid'], [1, 8, 'hi'], [9, 2, 'lo']]],
    [4, [[0, 13, 'mid'], [2, 7, 'hi'], [10, 2, 'lo']]],
    [5, [[1, 11, 'mid'], [3, 5, 'hi']]],
    [6, [[3, 7, 'mid']]],
  ];
  cells.forEach(([dy, runs]) => {
    runs.forEach(([dx, w, key]) => {
      g.fillStyle = tone[key];
      g.fillRect(ox + dx, oy + dy, w, 1);
    });
  });
}

/**
 * Seamless tileable cloud strip (transparent bg). Drawn at native low-res;
 * blit with imageSmoothingEnabled=false.
 */
function buildCloudStrip(mode) {
  const W = 160;
  const H = 28;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const tone = mode === 'day'
    ? { hi: '#f4f7fb', mid: '#dce6f2', lo: '#b8c8dc' }
    : { hi: '#6a748c', mid: '#3e465c', lo: '#2a3144' };
  const rand = mulberry32(mode === 'day' ? 0xC10AD5 : 0xA17E00);
  // Place a few clouds; also draw wrapped copies so edges tile.
  const placements = [];
  for (let i = 0; i < 5; i += 1) {
    placements.push({
      x: Math.floor(rand() * W),
      y: Math.floor(rand() * 10),
      scale: 1 + Math.floor(rand() * 2), // 1 or 2
    });
  }
  const drawAt = (x, y, sc) => {
    g.save();
    g.translate(x, y);
    g.scale(sc, sc);
    paintPixelCloud(g, 0, 0, tone);
    g.restore();
  };
  placements.forEach(({ x, y, scale }) => {
    drawAt(x, y, scale);
    // wrap horizontally for seamless loop
    drawAt(x - W, y, scale);
    drawAt(x + W, y, scale);
  });
  return c;
}

/** Seamless rolling-hill silhouette strip. */
function buildHillStrip(mode, layer /* 'far' | 'near' */) {
  const W = 192;
  const H = layer === 'far' ? 22 : 28;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;

  let fill;
  let rim;
  if (mode === 'day') {
    if (layer === 'far') {
      fill = '#7aa0c4'; // lighter / bluer atmospheric haze
      rim = '#8eb2d2';
    } else {
      fill = '#5f8a6a'; // muted green near hills
      rim = '#6e9a78';
    }
  } else {
    if (layer === 'far') {
      fill = '#1a2438';
      rim = '#243048';
    } else {
      fill = '#121a28';
      rim = '#1a2434';
    }
  }

  // Build a seamless height profile via summed sines with integer periods of W.
  const heights = new Array(W);
  for (let x = 0; x < W; x += 1) {
    const t = (x / W) * Math.PI * 2;
    let h;
    if (layer === 'far') {
      h = H * 0.55
        + Math.sin(t * 2) * H * 0.22
        + Math.sin(t * 3 + 0.6) * H * 0.12
        + Math.sin(t + 1.2) * H * 0.1;
    } else {
      h = H * 0.62
        + Math.sin(t) * H * 0.28
        + Math.sin(t * 2 + 0.4) * H * 0.16
        + Math.sin(t * 4 + 1.1) * H * 0.08;
    }
    heights[x] = Math.max(2, Math.min(H - 1, Math.round(h)));
  }

  for (let x = 0; x < W; x += 1) {
    const top = H - heights[x];
    g.fillStyle = fill;
    g.fillRect(x, top, 1, heights[x]);
    g.fillStyle = rim;
    g.fillRect(x, top, 1, 1);
  }
  return c;
}

/** Sparse pixel stars + a small pixel moon for night. */
function buildNightExtras() {
  const W = 128;
  const H = 40;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const rand = mulberry32(0x57A25);
  for (let i = 0; i < 48; i += 1) {
    const x = Math.floor(rand() * W);
    const y = Math.floor(rand() * (H * 0.75));
    const bright = rand() > 0.7;
    g.fillStyle = bright ? '#e8ecf4' : '#9aa3b8';
    g.fillRect(x, y, 1, 1);
    if (bright && rand() > 0.6) {
      g.fillRect(x - 1, y, 3, 1);
      g.fillRect(x, y - 1, 1, 3);
    }
  }
  // Tiny pixel moon
  const mx = 96;
  const my = 8;
  g.fillStyle = '#d8dce8';
  const moon = [
    [1, 0, 3], [0, 1, 5], [0, 2, 5], [0, 3, 5], [1, 4, 3],
  ];
  moon.forEach(([dx, dy, w]) => g.fillRect(mx + dx, my + dy, w, 1));
  g.fillStyle = '#b0b6c8';
  g.fillRect(mx + 2, my + 1, 1, 1);
  g.fillRect(mx + 3, my + 3, 1, 1);
  return c;
}

/**
 * Smooth continuous vertical alpha mask (no Bayer / no quantized bands).
 * Pixel content stays crisp; only the fade alpha is continuous 0–255.
 * Sky (opaqueAt=bottom): opaque through the hill belt near the track,
 * then a long eased fade over the remaining height.
 * Dirt (opaqueAt=top): opaque under the track, slower fade downward.
 * No left/right edge fades — mask is 1px wide, stretched full width.
 */
function buildVerticalAlphaMask(h, opaqueAt /* 'bottom' | 'top' */) {
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = Math.max(1, Math.ceil(h));
  const g = c.getContext('2d');
  const H = c.height;
  // Absolute opaque belt near the track (px), then fade over the rest.
  const opaquePx = opaqueAt === 'bottom'
    ? Math.min(Math.round(H * 0.34), Math.max(64, Math.round(H * 0.28)))
    // Dirt: shorter opaque belt → longer smooth fade down into wallpaper.
    : Math.min(Math.round(H * 0.18), Math.max(12, Math.round(H * 0.14)));
  const img = g.createImageData(1, H);
  for (let y = 0; y < H; y += 1) {
    let a;
    if (opaqueAt === 'bottom') {
      // y=0 top (transparent) → y=H-1 bottom/track (opaque)
      const distFromTrack = (H - 1) - y;
      if (distFromTrack <= opaquePx) {
        a = 1;
      } else {
        const fadeH = Math.max(1, H - 1 - opaquePx);
        const u = 1 - (distFromTrack - opaquePx) / fadeH; // 1 at opaque edge → 0 at top
        // Smoothstep squared: slow start leaving opaque, long soft finish.
        const s = u * u * (3 - 2 * u);
        a = s * s;
      }
    } else {
      // dirt: y=0 top/track opaque → y=H-1 bottom transparent (long soft fade)
      if (y <= opaquePx) {
        a = 1;
      } else {
        const fadeH = Math.max(1, H - 1 - opaquePx);
        const u = 1 - (y - opaquePx) / fadeH;
        const s = u * u * (3 - 2 * u);
        // Same s^2 ease as sky — continuous, no mid-fade shelf from a steeper cubic.
        a = s * s;
      }
    }
    // Continuous per-row alpha (full 8-bit). No dither shelves.
    const A = Math.round(Math.max(0, Math.min(1, a)) * 255);
    const i = y * 4;
    img.data[i] = 255;
    img.data[i + 1] = 255;
    img.data[i + 2] = 255;
    img.data[i + 3] = A;
  }
  g.putImageData(img, 0, 0);
  return c;
}

/**
 * Seamless pixel grass tile (hill greens). Brighter near the track edge
 * with sparse irregular tufts; deeper / cooler further down.
 */
function buildGrassTile() {
  const W = 64;
  const H = 64; // match prior underground.png height (runner contact math)
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const rand = mulberry32(0x6A55C0DE);
  // Homogeneous field: solid per-row base (no 1px X noise — that becomes
  // vertical streaks when the tile is nearest-neighbor stretched), then a
  // few large soft patches (±4) for calm pixel-art variation.
  const mid = [0x58, 0x82, 0x64]; // #588264 near-hill green
  for (let y = 0; y < H; y += 1) {
    const depth = y / (H - 1);
    const shift = -Math.round(depth * 12);
    const r = Math.max(42, Math.min(100, mid[0] + shift));
    const gre = Math.max(72, Math.min(130, mid[1] + shift));
    const b = Math.max(50, Math.min(110, mid[2] + Math.round(shift * 0.85)));
    g.fillStyle = `rgb(${r},${gre},${b})`;
    g.fillRect(0, y, W, 1);
  }
  // Soft rectangular patches (tiling). Same hue family, low contrast.
  for (let i = 0; i < 18; i += 1) {
    const pw = 6 + Math.floor(rand() * 10); // 6–15
    const ph = 4 + Math.floor(rand() * 8); // 4–11
    const px0 = Math.floor(rand() * W);
    const py0 = Math.floor(rand() * H);
    const lift = Math.floor((rand() - 0.5) * 8); // ±3
    for (let dy = 0; dy < ph; dy += 1) {
      const y = (py0 + dy) % H;
      const depth = y / (H - 1);
      const shift = -Math.round(depth * 12) + lift;
      const r = Math.max(42, Math.min(100, mid[0] + shift));
      const gre = Math.max(72, Math.min(130, mid[1] + shift));
      const b = Math.max(50, Math.min(110, mid[2] + Math.round(shift * 0.85)));
      g.fillStyle = `rgb(${r},${gre},${b})`;
      for (let dx = 0; dx < pw; dx += 1) {
        g.fillRect((px0 + dx) % W, y, 1, 1);
      }
    }
  }
  return c;
}

function buildGrassTuftStrip() {
  // Long period (≥2× common desktop widths) so the wrap isn't a visible repeat.
  // Seeded gap walk: close pairs + long empty stretches, varied cluster sizes.
  const W = 2880;
  const H = Math.max(18, Math.round(18 * BAND_ZOOM));
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const rand = mulberry32(0xC0FFEE ^ 0x71F75);
  // Readable over orange track; still in the grass family.
  const colors = ['#3f6a4c', '#4a7358', '#5a8a68', '#6a9a78', '#7aac88'];

  function paintBlade(cx, baseY, dir, maxLen) {
    const len = 5 + Math.floor(rand() * Math.max(1, maxLen - 4)); // 5..maxLen
    const col = colors[Math.floor(rand() * colors.length)];
    g.fillStyle = col;
    for (let dy = 0; dy < len; dy += 1) {
      const lean = dy > 2 && rand() > 0.55 ? (rand() > 0.5 ? 1 : -1) : 0;
      const x = (cx + lean + W) % W;
      const y = baseY + dir * dy;
      if (y < 0 || y >= H) continue;
      g.fillRect(x, y, 1, 1);
    }
    if (dir < 0 && rand() > 0.3) {
      g.fillStyle = '#8fbe9a';
      const tipX = (cx + (rand() > 0.5 ? 1 : -1) + W) % W;
      g.fillRect(tipX, Math.max(0, baseY - len), 1, 1);
    }
  }

  function paintTuft(cx, baseY, dir, maxLen, blades) {
    for (let i = 0; i < blades; i += 1) {
      paintBlade(cx + i - Math.floor(blades / 2), baseY, dir, maxLen);
    }
  }

  // Irregular placement across the long strip.
  let x = 30 + Math.floor(rand() * 70);
  while (x < W - 16) {
    const blades = 2 + Math.floor(rand() * 3); // 2–4
    const maxLen = 9 + Math.floor(rand() * 6); // 9–14
    paintTuft(Math.floor(x) % W, H - 1, -1, maxLen, blades);
    const roll = rand();
    if (roll < 0.18) {
      x += 12 + Math.floor(rand() * 22); // tight pair
    } else if (roll < 0.35) {
      x += 40 + Math.floor(rand() * 50); // medium-close
    } else {
      x += 70 + Math.floor(rand() * 220); // 70–290 empty
    }
  }
  return c;
}

/** Subtle top-edge (infield) blades — irregular sparse clusters on a long strip. */
function buildGrassTuftTopStrip() {
  const W = 2880;
  const H = Math.max(6, Math.round(6 * BAND_ZOOM));
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  const rand = mulberry32(0xA11CE);
  const colors = ['#3f6a4c', '#4a7358', '#5a8a68', '#6a9a78'];
  let x = 80 + Math.floor(rand() * 160);
  while (x < W - 16) {
    const blades = 2 + Math.floor(rand() * 2); // 2–3
    for (let b = 0; b < blades; b += 1) {
      const len = 2 + Math.floor(rand() * 3);
      g.fillStyle = colors[Math.floor(rand() * colors.length)];
      for (let dy = 0; dy < len; dy += 1) {
        const px = (Math.floor(x) + b + (dy > 0 && rand() > 0.6 ? 1 : 0) + W) % W;
        g.fillRect(px, dy, 1, 1);
      }
    }
    const roll = rand();
    x += roll < 0.2 ? (20 + Math.floor(rand() * 40)) : (140 + Math.floor(rand() * 380));
  }
  return c;
}

function tileHorizontally(src, reps = 128) {
  // Cap width — browsers reject canvases past ~16k–32k on a side.
  // (720px tuft strips × 128 reps = 92160 → empty canvas, invisible tufts.)
  const maxW = 16384;
  const safeReps = Math.max(2, Math.min(reps, Math.floor(maxW / Math.max(1, src.width))));
  const c = document.createElement('canvas');
  c.width = src.width * safeReps;
  c.height = src.height;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  for (let x = 0; x < safeReps; x += 1) g.drawImage(src, x * src.width, 0);
  return c;
}

function ensureBuffer(buf, w, h) {
  const cw = Math.max(1, Math.ceil(w));
  const ch = Math.max(1, Math.ceil(h));
  if (!buf || buf.width !== cw || buf.height !== ch) {
    const c = document.createElement('canvas');
    c.width = cw;
    c.height = ch;
    return c;
  }
  return buf;
}

/** Seamless horizontal blit of a strip scrolled by scrollPx (CSS px). */
function blitScrolling(g, strip, scrollPx, destY, destH, destW, scaleX) {
  const tileW = strip.width * scaleX;
  if (tileW <= 0) return;
  let x0 = -((scrollPx % tileW) + tileW) % tileW;
  g.imageSmoothingEnabled = false;
  for (let x = x0; x < destW; x += tileW) {
    g.drawImage(strip, 0, 0, strip.width, strip.height, Math.round(x), destY, Math.ceil(tileW) + 1, destH);
  }
}

export default function QwopBand() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    let resizeObserver = null;
    let intersectionObserver = null;
    let themeObserver = null;
    let playing = false;
    let visible = true;
    let tabVisible = true;
    let reduced = prefersReducedMotion();

    const state = {
      run: null,
      frames: null,
      atlas: null,
      underground: null, // procedural grass tile (width/height for layout)
      trackSurface: null,
      tiledUnderground: null,
      grassTufts: null,
      tiledTufts: null,
      grassTuftsTop: null,
      tiledTuftsTop: null,
      skyFillDay: null,
      skyFillNight: null,
      cloudsDay: null,
      cloudsNight: null,
      farHillsDay: null,
      farHillsNight: null,
      nearHillsDay: null,
      nearHillsNight: null,
      nightExtras: null,
      skyMode: resolveSkyMode(),
      skyBuf: null,
      dirtBuf: null,
      fgBuf: null, // ground+runner; night tint via source-atop
      skyMask: null,
      dirtMask: null,
      skyMaskH: 0,
      dirtMaskH: 0,
      strideStart: 0,
      strideEnd: 0,
      loopLen: 0,
      loopMeters: 0,
      phase: 0,
      scrollMeters: 0,
      avgMetersPerSec: 0,
      torsoIndex: 0,
      lastTs: 0,
      cssW: 0,
      bandH: 96,
      trackTop: HEAD_PAD,
      trackH: 12,
    };

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    // drawGround/drawRunner paint into paintCtx (main or offscreen FG layer).
    let paintCtx = ctx;

    function partScale() {
      return RUNNER_H / (BODY_WORLD_H * state.run.worldScale);
    }

    /** Tall sky pad: opaque hill belt + long fade (≈150–250px on desktop). */
    function skyExtraPx() {
      const w = state.cssW || wrap.clientWidth || 320;
      // Longer fade so dissipating sky reaches up behind the name/links.
      const fade = Math.round(Math.min(280, Math.max(190, w * 0.17)));
      const opaque = Math.round(Math.min(96, Math.max(70, w * 0.06)));
      // skyH ≈ opaque + fade; SKY_EXTRA ≈ that minus runner/head pad + track
      return Math.max(SKY_EXTRA_MIN, opaque + fade - HEAD_PAD - 46);
    }

    function layoutMetrics() {
      const s = partScale();
      const trackH = state.trackSurface.height * s;
      const ugNativeH = state.underground.height * s;
      const ugH = ugNativeH * UG_DEPTH;
      const overlap = UG_OVERLAP_NATIVE * s;
      const skyExtra = skyExtraPx();
      const contactBandY = skyExtra + HEAD_PAD + RUNNER_H;
      const trackTop = contactBandY - trackH + 2;
      const ugTop = trackTop + trackH - overlap;
      const bandH = Math.ceil(ugTop + ugH);
      return {
        s, trackH, ugH, ugNativeH, overlap, trackTop, ugTop, bandH, contactBandY, skyExtra,
      };
    }

    function sizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.max(280, wrap.clientWidth || 320);
      let bandH = state.bandH;
      if (state.run && state.trackSurface && state.underground) {
        const m = layoutMetrics();
        bandH = m.bandH;
        state.bandH = bandH;
        state.trackTop = m.trackTop;
        state.trackH = m.trackH;
      }
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${bandH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(bandH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.cssW = cssW;
      return cssW;
    }

    function samplePose(local) {
      const { run, strideStart, strideEnd, loopLen: L } = state;
      const i0 = Math.floor(local);
      const f = local - i0;
      if (i0 >= L - 1) {
        return lerpPose(run.poses[strideEnd - 1], run.poses[strideEnd], f);
      }
      return lerpPose(
        run.poses[strideStart + i0],
        run.poses[strideStart + i0 + 1],
        f,
      );
    }


    function displaySample() {
      return { pose: samplePose(state.phase) };
    }

    function groundScrollNative() {
      return state.scrollMeters * METERS_TO_WORLD * state.run.worldScale;
    }

    function ensureSkyMask(h) {
      const hh = Math.max(1, Math.ceil(h));
      if (!state.skyMask || state.skyMaskH !== hh) {
        state.skyMask = buildVerticalAlphaMask(hh, 'bottom');
        state.skyMaskH = hh;
      }
      return state.skyMask;
    }

    function ensureDirtMask(h) {
      const hh = Math.max(1, Math.ceil(h));
      if (!state.dirtMask || state.dirtMaskH !== hh) {
        state.dirtMask = buildVerticalAlphaMask(hh, 'top');
        state.dirtMaskH = hh;
      }
      return state.dirtMask;
    }

    /**
     * Full-width pixel sky + clouds + hills. Vertical alpha only (opaque
     * near the track → transparent at top). Parallax in CSS px vs ground.
     */
    function drawSky(w, trackTop, scrollNative, s) {
      const night = state.skyMode === 'night';
      const skyH = Math.max(1, Math.ceil(trackTop + 2));
      state.skyBuf = ensureBuffer(state.skyBuf, w, skyH);
      const oc = state.skyBuf;
      const og = oc.getContext('2d');
      og.setTransform(1, 0, 0, 1, 0, 0);
      og.clearRect(0, 0, oc.width, oc.height);
      og.imageSmoothingEnabled = false;

      const clouds = night ? state.cloudsNight : state.cloudsDay;
      const farH = night ? state.farHillsNight : state.farHillsDay;
      const nearH = night ? state.nearHillsNight : state.nearHillsDay;

      // Sky fill — continuous vertical gradient (no 48px nearest-neighbor shelves).
      // Pixel-art clouds/hills stay crisp on top; only the wash is smooth.
      const grd = og.createLinearGradient(0, 0, 0, skyH);
      if (night) {
        grd.addColorStop(0, 'rgb(10, 14, 36)');
        grd.addColorStop(1, 'rgb(28, 38, 76)');
      } else {
        grd.addColorStop(0, 'rgb(96, 158, 214)');
        grd.addColorStop(1, 'rgb(144, 200, 242)');
      }
      og.fillStyle = grd;
      og.fillRect(0, 0, w, skyH);

      // Ground on-screen CSS px scroll; layer offsets are fractions of that.
      const groundCss = scrollNative * s;

      if (night && state.nightExtras) {
        const starScale = ATMOS_SCALE;
        blitScrolling(
          og,
          state.nightExtras,
          groundCss * STAR_PARALLAX,
          0,
          Math.round(state.nightExtras.height * starScale),
          w,
          starScale,
        );
      }

      // Clouds — slowest moving layer, integer scale for crisp pixels.
      const cloudScale = ATMOS_SCALE;
      const cloudH = clouds.height * cloudScale;
      const cloudY = Math.max(2, Math.round(skyH * 0.12));
      blitScrolling(
        og,
        clouds,
        groundCss * CLOUD_PARALLAX,
        cloudY,
        cloudH,
        w,
        cloudScale,
      );

      // Far hills
      const farScale = ATMOS_SCALE;
      const farDestH = farH.height * farScale;
      const farY = skyH - farDestH - Math.round(skyH * 0.08);
      blitScrolling(
        og,
        farH,
        groundCss * FAR_HILL_PARALLAX,
        farY,
        farDestH,
        w,
        farScale,
      );

      // Near hills — sit just above the track
      const nearScale = ATMOS_SCALE;
      const nearDestH = nearH.height * nearScale;
      const nearY = skyH - nearDestH;
      blitScrolling(
        og,
        nearH,
        groundCss * NEAR_HILL_PARALLAX,
        nearY,
        nearDestH,
        w,
        nearScale,
      );

      // Vertical alpha only — fully opaque at bottom (track), fade upward.
      og.globalCompositeOperation = 'destination-in';
      const mask = ensureSkyMask(skyH);
      og.drawImage(mask, 0, 0, 1, mask.height, 0, 0, w, skyH);
      og.globalCompositeOperation = 'source-over';

      ctx.drawImage(oc, 0, 0, w, skyH, 0, 0, w, skyH);
    }

    function drawGround(w, scrollNative) {
      const m = layoutMetrics();
      const { s, trackH, ugH, trackTop, ugTop } = m;
      const gctx = paintCtx;

      gctx.save();
      gctx.imageSmoothingEnabled = false;

      state.dirtBuf = ensureBuffer(state.dirtBuf, w + 2, ugH + 2);
      const oc = state.dirtBuf;
      const og = oc.getContext('2d');
      og.setTransform(1, 0, 0, 1, 0, 0);
      og.clearRect(0, 0, oc.width, oc.height);
      og.imageSmoothingEnabled = false;

      const tileW = state.underground.width;
      let srcX = scrollNative % tileW;
      if (srcX < 0) srcX += tileW;
      srcX = Math.floor(srcX);
      const destNeed = w + tileW * s;
      const srcNeed = Math.min(
        Math.ceil(destNeed / s) + 2,
        state.tiledUnderground.width - srcX,
      );
      const firstW = srcNeed * s;
      og.drawImage(
        state.tiledUnderground,
        srcX, 0, srcNeed, state.underground.height,
        0, 0,
        firstW, ugH,
      );
      if (firstW < w + 1) {
        const remain = w + tileW * s - firstW;
        const secondSrc = Math.min(
          Math.ceil(remain / s) + 2,
          state.tiledUnderground.width,
        );
        og.drawImage(
          state.tiledUnderground,
          0, 0, secondSrc, state.underground.height,
          Math.floor(firstW) - 1, 0,
          secondSrc * s + 1, ugH,
        );
      }

      // Fade grass into wallpaper toward the bottom only (no L/R fade).
      og.globalCompositeOperation = 'destination-in';
      const mask = ensureDirtMask(ugH);
      og.drawImage(mask, 0, 0, 1, mask.height, 0, 0, w, ugH);
      og.globalCompositeOperation = 'source-over';

      gctx.drawImage(oc, 0, 0, w, ugH, 0, ugTop, w, ugH);

      // Single full-width blit — stretch taller for visual mass; contact Y unchanged.
      const trackDrawH = trackH * TRACK_DRAW_SCALE;
      const trackDrawTop = trackTop + trackH - trackDrawH;
      gctx.drawImage(
        state.trackSurface,
        0, 0, state.trackSurface.width, state.trackSurface.height,
        0, trackDrawTop, w, trackDrawH,
      );

      // Sparse grass tufts at ~1 CSS px/source px (visible over the track).
      // Scroll from the small source strip with wrap — do NOT use a mega-tiled
      // canvas (720×128 exceeds browser max width and draws nothing).
      const groundCss = scrollNative * s;
      const blitTufts = (src, destY) => {
        if (!src) return;
        const tw = src.width;
        const th = src.height;
        let tSrcX = groundCss % tw;
        if (tSrcX < 0) tSrcX += tw;
        tSrcX = Math.floor(tSrcX);
        // Repeat the strip across the band width.
        let dx = -tSrcX;
        while (dx < w + tw) {
          gctx.drawImage(src, 0, 0, tw, th, dx, destY, tw, th);
          dx += tw;
        }
      };
      if (state.grassTufts) {
        const th = state.grassTufts.height;
        // Integer destY — fractional Y can drop 1px blades under nearest-neighbor.
        blitTufts(
          state.grassTufts,
          Math.round(trackTop + trackH - th),
        );
      }
      if (state.grassTuftsTop) {
        blitTufts(
          state.grassTuftsTop,
          Math.round(trackDrawTop),
        );
      }

      gctx.restore();
      return { ...m, scrollNative };
    }

    function drawRunner(pose, trackTop, trackH, cx) {
      const s = partScale();
      const ws = state.run.worldScale;
      const worldToBand = s * ws;
      const parts = state.run.parts;
      const contactBandY = trackTop + trackH - 2;
      const contactWorldY = TRACK_CENTER_Y - (state.underground.height / 2) / ws - 0.35;
      const torso = pose[parts.indexOf('torso')];

      for (let i = 0; i < parts.length; i += 1) {
        const [x, y, angle] = pose[i];
        const name = parts[i];
        const fr = state.frames[state.run.frameIndex[name]].frame;
        const widthPx = fr.w * s;
        const heightPx = fr.h * s;
        const screenX = cx + (x - torso[0]) * worldToBand;
        const screenY = contactBandY + (y - contactWorldY) * worldToBand;
        const rctx = paintCtx;
        rctx.save();
        rctx.translate(screenX, screenY);
        rctx.rotate(angle);
        rctx.imageSmoothingEnabled = true;
        rctx.drawImage(
          state.atlas,
          fr.x, fr.y, fr.w, fr.h,
          -widthPx / 2, -heightPx / 2,
          widthPx, heightPx,
        );
        rctx.restore();
      }
    }

    function paint() {
      const w = state.cssW || sizeCanvas();
      const h = state.bandH;
      ctx.clearRect(0, 0, w, h);
      if (!state.run || !state.trackSurface || !state.underground) return;
      const { pose } = displaySample();
      const m = layoutMetrics();
      const scrollNative = groundScrollNative();
      const groundCss = scrollNative * m.s;
      // Lightweight readback for Playwright speed checks (CSS px offsets).
      wrap.__qwop = {
        t: performance.now(),
        s: m.s,
        scrollMeters: state.scrollMeters,
        avgMetersPerSec: state.avgMetersPerSec,
        groundCss,
        cloudCss: groundCss * CLOUD_PARALLAX,
        farCss: groundCss * FAR_HILL_PARALLAX,
        nearCss: groundCss * NEAR_HILL_PARALLAX,
        factors: {
          cloud: CLOUD_PARALLAX,
          far: FAR_HILL_PARALLAX,
          near: NEAR_HILL_PARALLAX,
        },
      };
      drawSky(w, m.trackTop, scrollNative, m.s);

      // Foreground (grass + track + tufts + runner) on an offscreen layer so
      // night tint can use source-atop — only painted pixels dim; transparent
      // fade regions stay transparent (no gray-blue slab under the grass).
      state.fgBuf = ensureBuffer(state.fgBuf, w, h);
      const fg = state.fgBuf;
      const fctx = fg.getContext('2d');
      fctx.setTransform(1, 0, 0, 1, 0, 0);
      fctx.clearRect(0, 0, fg.width, fg.height);
      paintCtx = fctx;
      const { trackTop, trackH } = drawGround(w, scrollNative);
      drawRunner(pose, trackTop, trackH, w / 2);
      paintCtx = ctx;

      if (state.skyMode === 'night') {
        fctx.save();
        fctx.globalCompositeOperation = 'source-atop';
        // Cool navy dim — multiplies only where alpha > 0
        fctx.fillStyle = 'rgba(40, 52, 90, 0.42)';
        fctx.fillRect(0, 0, w, h);
        fctx.fillStyle = 'rgba(12, 18, 36, 0.20)';
        fctx.fillRect(0, 0, w, h);
        fctx.restore();
      }

      ctx.drawImage(fg, 0, 0, w, h, 0, 0, w, h);
    }

    function tick(ts) {
      if (cancelled || !playing) return;
      if (!state.lastTs) state.lastTs = ts;
      const dt = Math.min(0.05, (ts - state.lastTs) / 1000);
      state.lastTs = ts;
      if (!reduced && visible && tabVisible && state.loopLen > 0) {
        state.phase += (dt * PLAYBACK_RATE) / state.run.dt;
        while (state.phase >= state.loopLen) {
          state.phase -= state.loopLen;
        }
        // Constant average loop speed — no micro-accelerations from distance[].
        state.scrollMeters += state.avgMetersPerSec * dt;
      }
      paint();
      rafId = window.requestAnimationFrame(tick);
    }

    function startLoop() {
      if (playing || cancelled || !state.run) return;
      playing = true;
      state.lastTs = 0;
      rafId = window.requestAnimationFrame(tick);
    }

    function stopLoop() {
      playing = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    function onVisibility() {
      tabVisible = document.visibilityState !== 'hidden';
      if (!tabVisible) state.lastTs = 0;
    }

    function syncSkyMode() {
      const next = resolveSkyMode();
      if (next !== state.skyMode) {
        state.skyMode = next;
        if (state.run) paint();
      }
    }

    async function boot() {
      try {
        const [run, atlasJson, atlas, sprintbg] = await Promise.all([
          loadJson(`${ASSET}/best-run.json`),
          loadJson(`${ASSET}/playercolor.json`),
          loadImage(`${ASSET}/playercolor.png`),
          loadImage(`${ASSET}/sprintbg.jpg`),
        ]);
        if (cancelled) return;
        state.run = run;
        state.frames = atlasJson.frames;
        state.atlas = atlas;
        state.underground = buildGrassTile();
        state.trackSurface = buildTrackSurface(sprintbg);
        state.tiledUnderground = tileHorizontally(state.underground);
        state.grassTufts = buildGrassTuftStrip();
        state.tiledTufts = tileHorizontally(state.grassTufts);
        state.grassTuftsTop = buildGrassTuftTopStrip();
        state.tiledTuftsTop = tileHorizontally(state.grassTuftsTop);
        state.skyFillDay = buildSkyFill('day');
        state.skyFillNight = buildSkyFill('night');
        state.cloudsDay = buildCloudStrip('day');
        state.cloudsNight = buildCloudStrip('night');
        state.farHillsDay = buildHillStrip('day', 'far');
        state.farHillsNight = buildHillStrip('night', 'far');
        state.nearHillsDay = buildHillStrip('day', 'near');
        state.nearHillsNight = buildHillStrip('night', 'near');
        state.nightExtras = buildNightExtras();
        state.skyMode = resolveSkyMode();
        const win = pickStrideWindow(run);
        state.strideStart = win.strideStart;
        state.strideEnd = win.strideEnd;
        state.loopLen = win.strideEnd - win.strideStart;
        state.loopMeters = run.distance[win.strideEnd] - run.distance[win.strideStart];
        state.phase = 0;
        state.scrollMeters = 0;
        // Constant scroll: average ground speed over the loop at PLAYBACK_RATE.
        const loopSec = (state.loopLen * run.dt) / PLAYBACK_RATE;
        state.avgMetersPerSec = loopSec > 0 ? state.loopMeters / loopSec : 0;
        state.torsoIndex = Math.max(0, run.parts.indexOf('torso'));
        sizeCanvas();
        paint();
        startLoop();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('QwopBand', err);
      }
    }

    sizeCanvas();
    const onResize = () => {
      sizeCanvas();
      paint();
    };
    window.addEventListener('resize', onResize);
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(wrap);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          visible = Boolean(entry?.isIntersecting);
          if (!visible) state.lastTs = 0;
        },
        { threshold: 0.05 },
      );
      intersectionObserver.observe(wrap);
    }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('popstate', syncSkyMode);

    if (typeof MutationObserver !== 'undefined') {
      themeObserver = new MutationObserver(syncSkyMode);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onMq = () => { reduced = prefersReducedMotion(); };
    mq?.addEventListener?.('change', onMq);

    boot();

    return () => {
      cancelled = true;
      stopLoop();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('popstate', syncSkyMode);
      document.removeEventListener('visibilitychange', onVisibility);
      mq?.removeEventListener?.('change', onMq);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      themeObserver?.disconnect();
    };
  }, []);

  return (
    <div className="qwop-band" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="qwop-band-canvas"
        width={896}
        height={160}
        role="img"
        aria-label="QWOP world-record run, looping mid-stride"
      />
    </div>
  );
}
