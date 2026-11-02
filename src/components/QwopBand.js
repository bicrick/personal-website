import { useEffect, useRef } from 'react';
import './QwopBand.css';

/**
 * Thin homepage band: real QWOP ragdoll centered, running in place on the
 * real track surface (sprintbg crop) + underground dirt. Transparent canvas
 * so it blends into the page. Playback 1.5x.
 *
 * Loop: hard cut on a seam pair searched from best-run.json where pose[b]
 * closely matches pose[a] (root-relative joints + wrapped angles + vertical
 * root + velocity). Every rendered pose is a real recorded frame (or a
 * sub-frame lerp between two adjacent real frames). No crossfade blend —
 * blending mismatched stride phases was producing a crouched/sitting
 * artifact. Ground meters stay continuous via a loopBaseMeters offset.
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
const PLAYBACK_RATE = 1.5;

// Hard-loop window [START, END): pose[END] ≈ pose[START] (offline search).
// 240 → 663: 12.0 m → 46.6 m, Δ34.6 m ≈ 6 strides. Seam pose cost ≈ 2.49
// (below median frame-to-frame ≈ 5.75).
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

function tileUnderground(src) {
  // Wide enough for full-bleed 4k+ viewports at our partScale, with wrap room.
  const reps = 128;
  const c = document.createElement('canvas');
  c.width = src.width * reps;
  c.height = src.height;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  for (let x = 0; x < reps; x += 1) g.drawImage(src, x * src.width, 0);
  return c;
}

export default function QwopBand() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    let resizeObserver = null;
    let intersectionObserver = null;
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
      strideStart: 0,
      strideEnd: 0,
      loopLen: 0, // exclusive-end frame count (END - START)
      loopMeters: 0, // distance[END] - distance[START]
      phase: 0, // continuous float in [0, loopLen); wraps by loopLen
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
      const ugH = state.underground.height * s;
      const overlap = UG_OVERLAP_NATIVE * s;
      const contactBandY = HEAD_PAD + RUNNER_H;
      const trackTop = contactBandY - trackH + 2;
      const ugTop = trackTop + trackH - overlap;
      const bandH = Math.ceil(ugTop + ugH);
      return { s, trackH, ugH, overlap, trackTop, ugTop, bandH, contactBandY };
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

    /**
     * Sub-frame sample at local phase in [0, loopLen). Adjacent real frames
     * only. The wrap subframe [L-1, L) lerps toward pose[END] (≈ pose[START]),
     * so the hard cut lands on a nearly identical pose.
     */
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

    /** Continuous meters on [0, loopLen]; wrap subframe targets distance[END]. */
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

    function drawGround(w, meters) {
      const m = layoutMetrics();
      const { s, trackH, ugH, trackTop, ugTop } = m;
      const scrollNative = meters * METERS_TO_WORLD * state.run.worldScale;

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      // Dirt first (may tuck 1px under the track). Track painted AFTER so any
      // underground wrap seam cannot bleed a light column into the orange.
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
      ctx.drawImage(
        state.tiledUnderground,
        srcX, 0, srcNeed, state.underground.height,
        0, ugTop,
        firstW, ugH,
      );
      if (firstW < w + 1) {
        const remain = w + tileW * s - firstW;
        const secondSrc = Math.min(
          Math.ceil(remain / s) + 2,
          state.tiledUnderground.width,
        );
        ctx.drawImage(
          state.tiledUnderground,
          0, 0, secondSrc, state.underground.height,
          Math.floor(firstW) - 1, ugTop,
          secondSrc * s + 1, ugH,
        );
      }

      // Single full-width blit — uniform stretch of one source column.
      // Never tile the track; non-integer tile widths left light gaps.
      ctx.drawImage(
        state.trackSurface,
        0, 0, state.trackSurface.width, state.trackSurface.height,
        0, trackTop, w, trackH,
      );
      ctx.restore();
      return m;
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
      if (!tabVisible) {
        state.lastTs = 0;
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
          if (!visible) {
            state.lastTs = 0;
          }
        },
        { threshold: 0.05 },
      );
      intersectionObserver.observe(wrap);
    }
    document.addEventListener('visibilitychange', onVisibility);

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onMq = () => {
      reduced = prefersReducedMotion();
    };
    mq?.addEventListener?.('change', onMq);

    boot();

    return () => {
      cancelled = true;
      stopLoop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      mq?.removeEventListener?.('change', onMq);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, []);

  return (
    <div className="qwop-band" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="qwop-band-canvas"
        width={896}
        height={96}
        role="img"
        aria-label="QWOP world-record run, looping mid-stride"
      />
    </div>
  );
}
