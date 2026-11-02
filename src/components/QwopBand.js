import { useEffect, useRef } from 'react';
import './QwopBand.css';

/**
 * Thin homepage band: real QWOP ragdoll centered, running in place on the
 * real track surface (sprintbg crop) + underground dirt. Transparent canvas
 * so it blends into the page. Playback 1.5x.
 *
 * Loop: hard cut on a seam pair searched from best-run.json where pose[b]
 * closely matches pose[a]. Every rendered pose is a real recorded frame (or
 * a sub-frame lerp between two adjacent real frames). No crossfade blend.
 * Ground meters stay continuous via a loopBaseMeters offset.
 *
 * Atmosphere: full-width pixel day/night sky (blue / deep navy) with
 * drifting pixel clouds + two rolling-hill layers. Parallax is tied to
 * run meters (clouds slowest → far hills → near hills → ground). Vertical
 * alpha only: opaque at the track, fade to transparent going up / down.
 * Override with ?sky=day|night; else local hour (6–18 day) or is-dark → night.
 */
const ASSET = `${process.env.PUBLIC_URL}/demos/qwop`;
const RUNNER_H = 58;
const BODY_WORLD_H = 14.2;
const TRACK_CENTER_Y = 10.74275;
const METERS_TO_WORLD = 10;
const TRACK_ROW_TOP = 325;
const TRACK_ROW_BOT = 383;
const UG_OVERLAP_NATIVE = 4;
const HEAD_PAD = 10;
const SKY_EXTRA = 52; // CSS px of sky above the previous band top
const UG_DEPTH = 2.55;
const PLAYBACK_RATE = 1.5;

// Parallax factors vs ground native scroll (meters * METERS_TO_WORLD * worldScale).
const CLOUD_PARALLAX = 0.045;
const FAR_HILL_PARALLAX = 0.12;
const NEAR_HILL_PARALLAX = 0.28;

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
  if (typeof document !== 'undefined'
      && document.documentElement.classList.contains('is-dark')) {
    return 'night';
  }
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? 'day' : 'night';
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

/** Bayer-ish stepped vertical alpha mask (pixel-y but intentional). */
function buildVerticalAlphaMask(h, opaqueAt /* 'bottom' | 'top' */) {
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = Math.max(1, Math.ceil(h));
  const g = c.getContext('2d');
  const H = c.height;
  // 4x4 Bayer thresholds 0..15
  const bayer = [
    0, 8, 2, 10,
    12, 4, 14, 6,
    3, 11, 1, 9,
    15, 7, 13, 5,
  ];
  const img = g.createImageData(1, H);
  for (let y = 0; y < H; y += 1) {
    // t: 0 at transparent end, 1 at opaque end
    let t = opaqueAt === 'bottom' ? y / Math.max(1, H - 1) : 1 - y / Math.max(1, H - 1);
    // Long gentle curve: stay fully opaque near the track for longer.
    let a;
    if (opaqueAt === 'bottom') {
      // sky: opaque near bottom (track), transparent at top
      if (t > 0.72) a = 1;
      else if (t < 0.08) a = 0;
      else {
        const u = (t - 0.08) / 0.64;
        a = u * u; // ease-in toward opaque
      }
    } else {
      // dirt: opaque near top (track), transparent at bottom
      if (t > 0.55) a = 1;
      else if (t < 0.05) a = 0;
      else {
        const u = (t - 0.05) / 0.5;
        a = u * u;
      }
    }
    // Quantize with dither for a pixel feel without hard banding.
    const level = a * 16;
    const thr = bayer[y % 4]; // only 1px wide — use y
    const on = level > thr ? Math.min(1, Math.ceil(level) / 16) : Math.floor(level) / 16;
    const A = Math.round(Math.max(0, Math.min(1, on)) * 255);
    const i = y * 4;
    img.data[i] = 255;
    img.data[i + 1] = 255;
    img.data[i + 2] = 255;
    img.data[i + 3] = A;
  }
  g.putImageData(img, 0, 0);
  return c;
}

function tileUnderground(src) {
  const reps = 128;
  const c = document.createElement('canvas');
  c.width = src.width * reps;
  c.height = src.height;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  for (let x = 0; x < reps; x += 1) g.drawImage(src, x * src.width, 0);
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
      underground: null,
      trackSurface: null,
      tiledUnderground: null,
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
      skyMask: null,
      dirtMask: null,
      skyMaskH: 0,
      dirtMaskH: 0,
      strideStart: 0,
      strideEnd: 0,
      loopLen: 0,
      loopMeters: 0,
      phase: 0,
      loopBaseMeters: 0,
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

    function partScale() {
      return RUNNER_H / (BODY_WORLD_H * state.run.worldScale);
    }

    function layoutMetrics() {
      const s = partScale();
      const trackH = state.trackSurface.height * s;
      const ugNativeH = state.underground.height * s;
      const ugH = ugNativeH * UG_DEPTH;
      const overlap = UG_OVERLAP_NATIVE * s;
      const contactBandY = SKY_EXTRA + HEAD_PAD + RUNNER_H;
      const trackTop = contactBandY - trackH + 2;
      const ugTop = trackTop + trackH - overlap;
      const bandH = Math.ceil(ugTop + ugH);
      return {
        s, trackH, ugH, ugNativeH, overlap, trackTop, ugTop, bandH, contactBandY,
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

    function metersInLoop(local) {
      const { run, strideStart, strideEnd, loopLen: L, loopMeters } = state;
      if (local >= L) return loopMeters;
      if (local <= 0) return 0;
      const i0 = Math.floor(local);
      const f = local - i0;
      const d0 = (i0 >= L - 1)
        ? run.distance[strideEnd - 1]
        : run.distance[strideStart + i0];
      const d1 = (i0 >= L - 1)
        ? run.distance[strideEnd]
        : run.distance[strideStart + i0 + 1];
      return lerp(d0, d1, f) - run.distance[strideStart];
    }

    function displaySample() {
      return {
        pose: samplePose(state.phase),
        meters: state.loopBaseMeters + metersInLoop(state.phase),
      };
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
     * near the track → transparent at top). Parallax from run meters.
     */
    function drawSky(w, trackTop, scrollNative) {
      const night = state.skyMode === 'night';
      const skyH = Math.max(1, Math.ceil(trackTop + 2));
      state.skyBuf = ensureBuffer(state.skyBuf, w, skyH);
      const oc = state.skyBuf;
      const og = oc.getContext('2d');
      og.setTransform(1, 0, 0, 1, 0, 0);
      og.clearRect(0, 0, oc.width, oc.height);
      og.imageSmoothingEnabled = false;

      const fill = night ? state.skyFillNight : state.skyFillDay;
      const clouds = night ? state.cloudsNight : state.cloudsDay;
      const farH = night ? state.farHillsNight : state.farHillsDay;
      const nearH = night ? state.nearHillsNight : state.nearHillsDay;

      // Sky fill — single-column stretch, full width, no L/R fade.
      og.drawImage(fill, 0, 0, 1, fill.height, 0, 0, w, skyH);

      if (night && state.nightExtras) {
        // Stars/moon: almost static (tiny parallax) so they feel distant.
        const starScale = 2;
        blitScrolling(
          og,
          state.nightExtras,
          scrollNative * 0.01,
          0,
          Math.round(state.nightExtras.height * starScale),
          w,
          starScale,
        );
      }

      // Clouds — slowest moving layer, integer scale for crisp pixels.
      const cloudScale = 2;
      const cloudH = clouds.height * cloudScale;
      const cloudY = Math.max(2, Math.round(skyH * 0.12));
      blitScrolling(
        og,
        clouds,
        scrollNative * CLOUD_PARALLAX,
        cloudY,
        cloudH,
        w,
        cloudScale,
      );

      // Far hills
      const farScale = 2;
      const farDestH = farH.height * farScale;
      const farY = skyH - farDestH - Math.round(skyH * 0.08);
      blitScrolling(
        og,
        farH,
        scrollNative * FAR_HILL_PARALLAX,
        farY,
        farDestH,
        w,
        farScale,
      );

      // Near hills — sit just above the track
      const nearScale = 2;
      const nearDestH = nearH.height * nearScale;
      const nearY = skyH - nearDestH;
      blitScrolling(
        og,
        nearH,
        scrollNative * NEAR_HILL_PARALLAX,
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

    function drawGround(w, meters) {
      const m = layoutMetrics();
      const { s, trackH, ugH, trackTop, ugTop } = m;
      const scrollNative = meters * METERS_TO_WORLD * state.run.worldScale;

      ctx.save();
      ctx.imageSmoothingEnabled = false;

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

      // Fade dirt into wallpaper toward the bottom only (no L/R fade).
      og.globalCompositeOperation = 'destination-in';
      const mask = ensureDirtMask(ugH);
      og.drawImage(mask, 0, 0, 1, mask.height, 0, 0, w, ugH);
      og.globalCompositeOperation = 'source-over';

      ctx.drawImage(oc, 0, 0, w, ugH, 0, ugTop, w, ugH);

      // Single full-width blit — uniform stretch of one source column.
      ctx.drawImage(
        state.trackSurface,
        0, 0, state.trackSurface.width, state.trackSurface.height,
        0, trackTop, w, trackH,
      );
      ctx.restore();
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
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(angle);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(
          state.atlas,
          fr.x, fr.y, fr.w, fr.h,
          -widthPx / 2, -heightPx / 2,
          widthPx, heightPx,
        );
        ctx.restore();
      }
    }

    function paint() {
      const w = state.cssW || sizeCanvas();
      const h = state.bandH;
      ctx.clearRect(0, 0, w, h);
      if (!state.run || !state.trackSurface || !state.underground) return;
      const { pose, meters } = displaySample();
      const m = layoutMetrics();
      const scrollNative = meters * METERS_TO_WORLD * state.run.worldScale;
      drawSky(w, m.trackTop, scrollNative);
      const { trackTop, trackH } = drawGround(w, meters);
      drawRunner(pose, trackTop, trackH, w / 2);
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
          state.loopBaseMeters += state.loopMeters;
        }
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
        const [run, atlasJson, atlas, underground, sprintbg] = await Promise.all([
          loadJson(`${ASSET}/best-run.json`),
          loadJson(`${ASSET}/playercolor.json`),
          loadImage(`${ASSET}/playercolor.png`),
          loadImage(`${ASSET}/underground.png`),
          loadImage(`${ASSET}/sprintbg.jpg`),
        ]);
        if (cancelled) return;
        state.run = run;
        state.frames = atlasJson.frames;
        state.atlas = atlas;
        state.underground = underground;
        state.trackSurface = buildTrackSurface(sprintbg);
        state.tiledUnderground = tileUnderground(underground);
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
        state.loopBaseMeters = 0;
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
