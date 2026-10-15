import React, { useEffect, useRef, useState } from 'react';
import './tapestry.css';

const IMG = `${process.env.PUBLIC_URL}/images/infinite-tapestry`;
const SRC = `${IMG}/ribbon-scroll.webp`;
const FALLBACK = `${IMG}/ribbon-scroll.jpg`;

export default function TapestryRibbon({
  caption = 'Drag to pan. Baked from the public history feed (SFW SDXL scenes), stitched with the same overlap the live site uses.',
}) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const state = useRef({
    x: 0,
    dragging: false,
    lastX: 0,
    pointers: new Map(),
    auto: true,
    reduced: false,
  });
  const [hintGone, setHintGone] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    state.current.reduced = mq.matches;
    if (mq.matches) {
      state.current.auto = false;
      setPlaying(false);
    }
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
    const img = new Image();
    img.decoding = 'async';
    img.src = SRC;
    img.onerror = () => {
      img.src = FALLBACK;
    };
    img.onload = () => {
      imgRef.current = img;
      draw();
    };

    let raf = 0;
    let last = performance.now();

    const draw = () => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      const source = imgRef.current;
      if (!canvas || !stage || !source) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, w, h);

      const s = state.current;
      const baseScale = h / source.height;
      const drawH = h;
      const drawW = source.width * baseScale;
      const maxX = 0;
      const minX = Math.min(0, w - drawW);
      s.x = Math.max(minX, Math.min(maxX, s.x));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, s.x, 0, drawW, drawH);
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;
      if (s.auto && !s.dragging && imgRef.current) {
        const stage = stageRef.current;
        const source = imgRef.current;
        if (stage && source) {
          const baseScale = stage.clientHeight / source.height;
          const drawW = source.width * baseScale;
          const minX = Math.min(0, stage.clientWidth - drawW);
          s.x -= 28 * dt;
          if (s.x <= minX) s.x = 0;
        }
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const onResize = () => draw();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const stopHint = () => {
    if (!hintGone) setHintGone(true);
  };

  const onPointerDown = (event) => {
    const s = state.current;
    const stage = stageRef.current;
    stage?.setPointerCapture?.(event.pointerId);
    s.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    s.dragging = true;
    s.lastX = event.clientX;
    stage?.classList.add('is-dragging');
    stopHint();
  };

  const onPointerMove = (event) => {
    const s = state.current;
    if (!s.pointers.has(event.pointerId) || !s.dragging) return;
    // Pan only — ignore multi-touch pinch deltas beyond single-finger drag
    if (s.pointers.size > 1) {
      s.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      return;
    }
    s.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const dx = event.clientX - s.lastX;
    s.lastX = event.clientX;
    s.x += dx;
  };

  const onPointerUp = (event) => {
    const s = state.current;
    s.pointers.delete(event.pointerId);
    if (s.pointers.size === 0) {
      s.dragging = false;
      stageRef.current?.classList.remove('is-dragging');
    } else if (s.pointers.size === 1) {
      const remaining = [...s.pointers.values()][0];
      s.lastX = remaining.x;
    }
  };

  const togglePlay = () => {
    const next = !state.current.auto;
    state.current.auto = next;
    setPlaying(next);
    stopHint();
  };

  const resetView = () => {
    state.current.x = 0;
    stopHint();
  };

  return (
    <figure className="it-demo it-ribbon">
      <div
        ref={stageRef}
        className="it-ribbon-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label="Scrollable ribbon of real Infinite Tapestry strips"
      >
        <canvas ref={canvasRef} className="it-ribbon-canvas" />
        <span className={`it-ribbon-hint${hintGone ? ' is-gone' : ''}`}>
          drag to pan
        </span>
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
