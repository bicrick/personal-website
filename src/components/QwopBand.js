import { useEffect, useRef } from 'react';
import './QwopBand.css';

/**
 * Thin homepage band: real QWOP ragdoll centered, running in place on the
 * real track surface (sprintbg crop) + underground dirt. Transparent canvas
 * so it blends into the page. Playback rate 2 — ground scroll locked to
 * the same distance meters as the runner, so 2x stays in sync.
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
const PLAYBACK_RATE = 2;

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

function findFrameForDistance(run, m) {
  const d = run.distance;
  let best = 0;
  let bestDelta = Infinity;
  for (let i = 0; i < d.length; i += 1) {
    const delta = Math.abs(d[i] - m);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = i;
    }
  }
  return best;
}

function pickStrideWindow(run) {
  const a = findFrameForDistance(run, 22);
  const b = findFrameForDistance(run, 48);
  const ti = run.parts.indexOf('torso');
  const startAngle = run.poses[a][ti][2];
  let end = b;
  let best = Infinity;
  for (let i = b - 30; i < b + 30 && i < run.poses.length; i += 1) {
    if (i <= a + 60) continue;
    const da = Math.abs(run.poses[i][ti][2] - startAngle);
    const dd = Math.abs((run.distance[i] - run.distance[a]) - (run.distance[b] - run.distance[a]));
    const score = da * 2 + dd * 0.01;
    if (score < best) {
      best = score;
      end = i;
    }
  }
  return { strideStart: a, strideEnd: Math.max(a + 90, end) };
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
      drawRunner(state.run.poses[state.frameIndex], trackTop, trackH, w / 2);
    }

    function advanceStride() {
      state.frameIndex += 1;
      if (state.frameIndex > state.strideEnd) {
        state.loopBaseMeters += state.run.distance[state.strideEnd] - state.run.distance[state.strideStart];
        state.frameIndex = state.strideStart;
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
