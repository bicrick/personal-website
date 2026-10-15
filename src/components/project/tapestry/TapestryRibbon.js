import React, { useEffect, useRef, useState } from 'react';
import {
  AMB_BLOB_OPACITY,
  AMB_SAMPLE_MS,
  SCROLL_SPEED,
  SURROUND,
  WORLD_HEIGHT,
  easeSpring,
} from './viewerConstants';
import './tapestry.css';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;
const SRC = `${IMG}/ribbon-scroll.webp`;
const FALLBACK = `${IMG}/ribbon-scroll.jpg`;

function isSiteDark() {
  return typeof document !== 'undefined'
    && document.documentElement.classList.contains('is-dark');
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Compact article ribbon demo: short band + reflection fade.
 * Ambient glow, lights, veil, reflection; no about-page sheen sweep.
 * Scroll speed = config.scroll_speed (30 world px/s) scaled to display.
 * No zoom.
 */
export default function TapestryRibbon({
  caption = 'Drag to pan. Baked from the public history feed (SFW SDXL scenes), stitched with the same overlap the live site uses.',
}) {
  const frameRef = useRef(null);
  const bandRef = useRef(null);
  const canvasRef = useRef(null);
  const reflRef = useRef(null);
  const blobRefs = useRef([]);
  const glowRefs = useRef([]);
  const imgRef = useRef(null);
  const state = useRef({
    x: 0,
    dragging: false,
    lastX: 0,
    pointers: new Map(),
    auto: true,
    reduced: prefersReducedMotion(),
    vel: 0,
    settling: false,
    settleFrom: 0,
    settleTo: 0,
    settleT0: 0,
    visible: true,
  });
  const [hintGone, setHintGone] = useState(false);
  const [playing, setPlaying] = useState(!prefersReducedMotion());
  const [dark, setDark] = useState(isSiteDark);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains('is-dark'));
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      state.current.reduced = mq.matches;
      if (mq.matches) {
        state.current.auto = false;
        setPlaying(false);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const band = bandRef.current;
    const canvas = canvasRef.current;
    const refl = reflRef.current;
    if (!band || !canvas) return undefined;

    let alive = true;
    let raf = 0;
    let last = performance.now();
    let sampleAt = 0;

    const img = new Image();
    img.decoding = 'async';
    img.src = SRC;
    img.onerror = () => { img.src = FALLBACK; };
    img.onload = () => {
      if (!alive) return;
      imgRef.current = img;
      sampleAmbient();
      draw(performance.now());
    };

    const theme = () => (dark ? SURROUND.dark : SURROUND.light);

    const drawBand = (ctx, w, h, x) => {
      const source = imgRef.current;
      const t = theme();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, w, h);
      if (!source || !source.naturalWidth) {
        ctx.fillStyle = t.empty;
        ctx.fillRect(0, 0, w, h);
        return { drawW: w };
      }
      const baseScale = h / source.naturalHeight;
      const drawW = source.naturalWidth * baseScale;
      const minX = Math.min(0, w - drawW);
      const clamped = Math.max(minX, Math.min(0, x));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, clamped, 0, drawW, h);
      return { drawW, minX, x: clamped };
    };

    const drawReflection = (bandW, bandH, x) => {
      if (!refl || !imgRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(bandW * dpr);
      const ch = Math.round(bandH * dpr);
      if (refl.width !== cw || refl.height !== ch) {
        refl.width = cw;
        refl.height = ch;
      }
      const ctx = refl.getContext('2d');
      drawBand(ctx, bandW, bandH, x);
      // REFL_VAR gain/sat applied via CSS filter on .it-band-refl canvas
    };

    const sampleAmbient = () => {
      const source = imgRef.current;
      if (!source || !source.naturalWidth) return;
      const probe = document.createElement('canvas');
      probe.width = 6;
      probe.height = 2;
      const pctx = probe.getContext('2d', { willReadFrequently: true });
      const s = state.current;
      const bandH = band.clientHeight || 200;
      const bandW = band.clientWidth || 600;
      const baseScale = bandH / source.naturalHeight;
      const drawW = source.naturalWidth * baseScale;
      const viewX = -s.x;
      pctx.drawImage(source, viewX / baseScale, 0, bandW / baseScale, source.naturalHeight, 0, 0, 6, 2);
      const d = pctx.getImageData(0, 0, 6, 2).data;
      const setColor = (els, n, row, col) => {
        const el = els[n];
        if (!el) return;
        const o = (row * 6 + col) * 4;
        el.style.setProperty('--c', `rgb(${d[o]},${d[o + 1]},${d[o + 2]})`);
      };
      // 3 top + 3 bot blobs (client.js ambBlobs)
      [0, 1, 2].forEach((i) => setColor(blobRefs.current, i, 0, i * 2 + 1));
      [0, 1, 2].forEach((i) => setColor(blobRefs.current, i + 3, 1, i * 2 + 1));
      // Sync glow fallbacks to sampled warm/cool when available
      if (glowRefs.current[0]) {
        const o = 4;
        glowRefs.current[0].style.background =
          `radial-gradient(closest-side, rgba(${d[o]},${d[o + 1]},${d[o + 2]},0.55), transparent)`;
      }
      if (glowRefs.current[1]) {
        const o = 12;
        glowRefs.current[1].style.background =
          `radial-gradient(closest-side, rgba(${d[o]},${d[o + 1]},${d[o + 2]},0.45), transparent)`;
      }
      void drawW;
      void AMB_BLOB_OPACITY;
    };

    const draw = () => {
      const w = band.clientWidth;
      const h = band.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      const ctx = canvas.getContext('2d');
      const s = state.current;
      const result = drawBand(ctx, w, h, s.x);
      if (result.minX != null) s.x = result.x;
      drawReflection(w, h, s.x);
    };

    const tick = (now) => {
      if (!alive) return;
      const s = state.current;
      if (!s.visible) {
        raf = 0;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const h = band.clientHeight || 200;
      // Port: screen px/s = scroll_speed * (displayBandHeight / worldHeight)
      const screenSpeed = SCROLL_SPEED * (h / WORLD_HEIGHT);

      if (s.settling) {
        const t = Math.min(1, (now - s.settleT0) / 700);
        const e = easeSpring(t);
        s.x = s.settleFrom + (s.settleTo - s.settleFrom) * e;
        if (t >= 1) s.settling = false;
      } else if (s.auto && !s.dragging && imgRef.current) {
        const source = imgRef.current;
        const baseScale = h / source.naturalHeight;
        const drawW = source.naturalWidth * baseScale;
        const minX = Math.min(0, band.clientWidth - drawW);
        s.x -= screenSpeed * dt;
        if (s.x <= minX) s.x = 0;
      } else if (!s.dragging && Math.abs(s.vel) > 2) {
        // Loose glide then friction (client.js fly/coast spirit, no zoom)
        s.x += s.vel * dt;
        s.vel *= Math.exp(-dt * 3.2);
        const source = imgRef.current;
        if (source) {
          const baseScale = h / source.naturalHeight;
          const drawW = source.naturalWidth * baseScale;
          const minX = Math.min(0, band.clientWidth - drawW);
          if (s.x > 0) { s.x = 0; s.vel = 0; }
          if (s.x < minX) { s.x = minX; s.vel = 0; }
        }
      }

      if (now - sampleAt >= AMB_SAMPLE_MS) {
        sampleAt = now;
        sampleAmbient();
      }

      draw();
      raf = requestAnimationFrame(tick);
    };

    const resume = () => {
      if (!alive || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    let io;
    if (typeof IntersectionObserver !== 'undefined' && frameRef.current) {
      io = new IntersectionObserver(([entry]) => {
        state.current.visible = entry.isIntersecting;
        if (entry.isIntersecting) resume();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }, { threshold: 0.05 });
      io.observe(frameRef.current);
    }

    const onResize = () => draw();
    window.addEventListener('resize', onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      io?.disconnect();
    };
  }, [dark]);

  const stopHint = () => {
    if (!hintGone) setHintGone(true);
  };

  const onPointerDown = (event) => {
    const s = state.current;
    const band = bandRef.current;
    band?.setPointerCapture?.(event.pointerId);
    s.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    s.dragging = true;
    s.settling = false;
    s.vel = 0;
    s.lastX = event.clientX;
    s.lastT = performance.now();
    band?.classList.add('is-dragging');
    stopHint();
  };

  const onPointerMove = (event) => {
    const s = state.current;
    if (!s.pointers.has(event.pointerId) || !s.dragging) return;
    if (s.pointers.size > 1) {
      s.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      return;
    }
    s.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const now = performance.now();
    const dx = event.clientX - s.lastX;
    const dt = Math.max(0.008, (now - (s.lastT || now)) / 1000);
    s.vel = dx / dt;
    s.lastX = event.clientX;
    s.lastT = now;
    s.x += dx;
  };

  const onPointerUp = (event) => {
    const s = state.current;
    s.pointers.delete(event.pointerId);
    if (s.pointers.size === 0) {
      s.dragging = false;
      bandRef.current?.classList.remove('is-dragging');
    } else if (s.pointers.size === 1) {
      const remaining = [...s.pointers.values()][0];
      s.lastX = remaining.x;
    }
  };

  const togglePlay = () => {
    const next = !state.current.auto;
    state.current.auto = next;
    state.current.vel = 0;
    setPlaying(next);
    stopHint();
  };

  const resetView = () => {
    const s = state.current;
    s.settleFrom = s.x;
    s.settleTo = 0;
    s.settleT0 = performance.now();
    s.settling = true;
    s.vel = 0;
    stopHint();
  };

  const ambA = dark ? SURROUND.dark.glow : SURROUND.light.glow;

  return (
    <figure className="it-demo it-ribbon" style={{ '--it-amb-a': ambA }}>
      <div ref={frameRef} className="it-ribbon-frame">
        <div className="it-amb-blobs" aria-hidden="true">
          <div className="ab ab-top">
            {[0, 1, 2].map((i) => (
              <i
                key={`t${i}`}
                ref={(el) => { blobRefs.current[i] = el; }}
                style={{ '--c': i === 1 ? 'rgb(70,140,200)' : 'rgb(255,176,82)' }}
              />
            ))}
          </div>
          <div className="ab ab-bot">
            {[0, 1, 2].map((i) => (
              <i
                key={`b${i}`}
                ref={(el) => { blobRefs.current[i + 3] = el; }}
                style={{ '--c': i === 1 ? 'rgb(70,140,200)' : 'rgb(220,140,100)' }}
              />
            ))}
          </div>
        </div>

        <div className="it-band-glow" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <i key={i} ref={(el) => { glowRefs.current[i] = el; }} />
          ))}
        </div>

        <div
          ref={bandRef}
          className="it-band"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="img"
          aria-label="Scrollable ribbon of real Infinite Tapestry strips"
        >
          <canvas ref={canvasRef} className="it-band-canvas" />
          <div className="it-band-lights" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => <i key={i} />)}
          </div>
          <div className="it-band-veil" aria-hidden="true" />
          <span className={`it-ribbon-hint${hintGone ? ' is-gone' : ''}`}>
            drag to pan
          </span>
        </div>

        <div className="it-band-refl" aria-hidden="true">
          <canvas ref={reflRef} />
        </div>
      </div>

      <div className="it-ribbon-controls">
        <button type="button" className={playing ? 'is-on' : ''} onClick={togglePlay}>
          {playing ? 'pause scroll' : 'auto scroll'}
        </button>
        <button type="button" onClick={resetView}>
          reset
        </button>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
