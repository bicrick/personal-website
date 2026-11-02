import { useEffect, useRef } from 'react';
import './QwopBand.css';

/**
 * Thin homepage band: real QWOP ragdoll centered, running in place on the
 * real track surface (sprintbg crop) + underground dirt. Transparent canvas
 * so it blends into the page. Playback 1.5x. Loop window chosen by
 * minimizing full-ragdoll pose distance (rel. positions + angles +
 * velocity) between seam frames; a short pose blend hides residual pop.
 * Ground scroll stays locked to distance meters (never resets).
 */

const ASSET = `${process.env.PUBLIC_URL}/demos/qwop`;
const RUNNER_H = 58;
const BODY_WORLD_H = 14.2;
const TRACK_CENTER_Y = 10.74275;
const METERS_TO_WORLD = 10;
const TRACK_ROW_TOP = 325;
const TRACK_ROW_BOT = 383;
const UG_OVERLAP_NATIVE = 4;
const HEAD_PAD = 10; // clearance for raised limbs above the torso
const PLAYBACK_RATE = 1.5;

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


// Offline search over best-run.json (steady 15–85 m): minimize full
// ragdoll pose distance (torso-relative xy + shortest-angle + velocity)
// between candidate seam pairs. Best multi-stride hit:
//   frames 453 → 706  (29.9 m → 50.5 m, Δ20.6 m ≈ 4 strides)
//   seam cost ≈ 0.55 vs median frame-to-frame ≈ 1.42
const STRIDE_START = 453;
const STRIDE_END = 706;
const BLEND_FRAMES = 5; // lerp end→start over these ticks at the seam

function shortestAngleDelta(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function lerpPose(fromPose, toPose, t) {
  const out = new Array(fromPose.length);
  for (let i = 0; i < fromPose.length; i += 1) {
    const [x0, y0, a0] = fromPose[i];
    const [x1, y1, a1] = toPose[i];
    out[i] = [
      x0 + (x1 - x0) * t,
      y0 + (y1 - y0) * t,
      a0 + shortestAngleDelta(a0, a1) * t,
    ];
  }
  return out;
}

function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

function pickStrideWindow(/* run */) {
  return { strideStart: STRIDE_START, strideEnd: STRIDE_END };
}

function buildTrackSurface(sprintbg) {
  const h = TRACK_ROW_BOT - TRACK_ROW_TOP;
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(sprintbg, 0, TRACK_ROW_TOP, 1, h, 0, 0, 640, h);
  return c;
}

function tileUnderground(src) {
  // Wide enough for full-bleed 4k+ viewports at our partScale.
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
      frameIndex: 0,
      loopBaseMeters: 0,
      blend: null, // { i, fromPose, toPose } while crossfading the seam
      acc: 0,
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
      // Feet sit near the bottom of the red track; head clears HEAD_PAD.
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

    function displayMeters() {
      const { run, frameIndex, strideStart, loopBaseMeters } = state;
      return loopBaseMeters + (run.distance[frameIndex] - run.distance[strideStart]);
    }

    function drawGround(w, meters) {
      const m = layoutMetrics();
      const { s, trackH, ugH, trackTop, ugTop } = m;
      const scrollNative = meters * METERS_TO_WORLD * state.run.worldScale;

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      let x = 0;
      const tileBandW = state.trackSurface.width * s;
      while (x < w + 2) {
        ctx.drawImage(
          state.trackSurface,
          0, 0, state.trackSurface.width, state.trackSurface.height,
          x, trackTop, tileBandW, trackH,
        );
        x += tileBandW;
      }

      const tileW = state.underground.width;
      let srcX = scrollNative % tileW;
      if (srcX < 0) srcX += tileW;
      // Cover the full CSS width in destination space (full-bleed).
      const destNeed = w + tileW * s;
      const srcNeed = Math.min(
        Math.ceil(destNeed / s) + 1,
        state.tiledUnderground.width - srcX,
      );
      // If near the end of the pre-tiled strip, wrap with a second blit.
      const firstW = srcNeed * s;
      ctx.drawImage(
        state.tiledUnderground,
        srcX, 0, srcNeed, state.underground.height,
        0, ugTop,
        firstW, ugH,
      );
      if (firstW < w + 1) {
        const remain = w + tileW * s - firstW;
        const secondSrc = Math.min(Math.ceil(remain / s) + 1, state.tiledUnderground.width);
        ctx.drawImage(
          state.tiledUnderground,
          0, 0, secondSrc, state.underground.height,
          firstW, ugTop,
          secondSrc * s, ugH,
        );
      }
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
      // Transparent — page texture shows through. No fill.
      ctx.clearRect(0, 0, w, h);
      if (!state.run || !state.trackSurface || !state.underground) return;
      const { trackTop, trackH } = drawGround(w, displayMeters());
      let pose = state.run.poses[state.frameIndex];
      if (state.blend) {
        const t = easeInOut((state.blend.i + 1) / BLEND_FRAMES);
        pose = lerpPose(state.blend.fromPose, state.blend.toPose, t);
      }
      drawRunner(pose, trackTop, trackH, w / 2);
    }

    function advanceStride() {
      // Finish an in-progress seam blend before advancing the frame index.
      if (state.blend) {
        state.blend.i += 1;
        if (state.blend.i >= BLEND_FRAMES) {
          state.blend = null;
        }
        return;
      }

      state.frameIndex += 1;
      if (state.frameIndex > state.strideEnd) {
        // Ground stays continuous: fold the window length into the base and
        // snap the index back. Pose pops are hidden by a short lerp.
        const fromPose = state.run.poses[state.strideEnd];
        const toPose = state.run.poses[state.strideStart];
        state.loopBaseMeters += (
          state.run.distance[state.strideEnd] - state.run.distance[state.strideStart]
        );
        state.frameIndex = state.strideStart;
        state.blend = { i: 0, fromPose, toPose };
      }
    }

    function tick(ts) {
      if (cancelled || !playing) return;
      if (!state.lastTs) state.lastTs = ts;
      const dt = (ts - state.lastTs) / 1000;
      state.lastTs = ts;
      if (!reduced && visible && tabVisible) {
        state.acc += dt * PLAYBACK_RATE;
        while (state.acc >= state.run.dt) {
          state.acc -= state.run.dt;
          advanceStride();
        }
      }
      paint();
      rafId = window.requestAnimationFrame(tick);
    }

    function startLoop() {
      if (playing || cancelled || !state.run) return;
      playing = true;
      state.lastTs = 0;
      state.acc = 0;
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
        state.acc = 0;
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
        state.frameIndex = win.strideStart;
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
            state.acc = 0;
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
