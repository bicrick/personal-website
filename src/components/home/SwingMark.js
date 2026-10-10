import React, { useEffect, useRef } from 'react';
import { CritterBody } from '../project/harness/Critter';
import useReducedMotion from '../project/useReducedMotion';
import '../project/harness/Critter.css';

// The harness post's mark: the pixel Claude strapped into a harness,
// swinging from a rope. A small pendulum sim drives it every frame:
// the rope pumps itself to a new height every couple of swings, the body
// lags behind the rope, the legs trail behind the body, and moving the
// pointer across the row gives it a shove.
const G = 8.2; // g / L, about a 2.2s period
const ROPE_DAMP = 0.22;
const PUMP = 1.6;
const BODY_K = 70;
const BODY_DAMP = 7;
const LEG_K = 45;
const LEG_DAMP = 3.2;
const STEP = 1 / 240;
const DEG = 180 / Math.PI;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pickAmp = () => (Math.random() < 0.18 ? 0.62 : 0.22 + Math.random() * 0.26);

export default function SwingMark() {
  const rootRef = useRef(null);
  const armRef = useRef(null);
  const bodyRef = useRef(null);
  const legsRef = useRef(null);
  const shadowRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return undefined;

    const s = { th: 0.35, w: 0, ph: 0, pw: 0, ps: 0, psw: 0, amp: pickAmp(), swings: 0 };
    let raf = 0;
    let last = 0;
    let acc = 0;
    let visible = true;

    const step = (h) => {
      const energy = 0.5 * s.w * s.w + G * (1 - Math.cos(s.th));
      const ampNow = Math.acos(clamp(1 - energy / G, -1, 1));
      const pump = PUMP * (s.amp - ampNow) * Math.sign(s.w || 1) * Math.cos(s.th);
      const a = -G * Math.sin(s.th) - ROPE_DAMP * s.w + pump;
      const prevW = s.w;
      s.w += a * h;
      s.th += s.w * h;
      if ((prevW > 0) !== (s.w > 0)) {
        s.swings += 1;
        if (s.swings % 4 === 0) s.amp = pickAmp();
      }
      // body hangs off the rope end and lags behind it
      const pa = -BODY_K * s.ph - BODY_DAMP * s.pw - a * 0.9;
      s.pw += pa * h;
      s.ph += s.pw * h;
      // legs trail behind the body
      const la = -LEG_K * s.ps - LEG_DAMP * s.psw - (a + pa) * 0.7;
      s.psw += la * h;
      s.ps += s.psw * h;
    };

    const draw = () => {
      const speed = Math.min(Math.abs(s.w) / 2.2, 1);
      armRef.current.style.transform = `rotate(${s.th * DEG}deg)`;
      bodyRef.current.style.transform = `rotate(${clamp(s.ph * DEG, -25, 25)}deg) scale(${1 - 0.03 * speed}, ${1 + 0.05 * speed})`;
      legsRef.current.style.transform = `skewX(${clamp(-s.ps * DEG * 1.4, -38, 38)}deg)`;
      const x = Math.sin(s.th);
      shadowRef.current.style.transform = `translateX(${x * 55}%) scaleX(${1 - Math.abs(x) * 0.45})`;
      shadowRef.current.style.opacity = `${0.11 - Math.abs(x) * 0.05}`;
    };

    const frame = (t) => {
      if (!last) last = t;
      acc += Math.min((t - last) / 1000, 0.05);
      last = t;
      while (acc >= STEP) {
        step(STEP);
        acc -= STEP;
      }
      draw();
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(root);

    const row = root.closest('.writing-row') || root;
    const onMove = (e) => {
      s.w = clamp(s.w + clamp(e.movementX * 0.012, -0.35, 0.35), -4, 4);
    };
    const onEnter = () => {
      s.w += (s.w >= 0 ? 1 : -1) * 0.9;
    };
    row.addEventListener('pointermove', onMove);
    row.addEventListener('pointerenter', onEnter);

    start();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      row.removeEventListener('pointermove', onMove);
      row.removeEventListener('pointerenter', onEnter);
    };
  }, [reduce]);

  return (
    <span ref={rootRef} className="swing-mark" aria-hidden="true">
      <span ref={shadowRef} className="swing-shadow" />
      <span ref={armRef} className="swing-arm">
        <svg className="swing-svg" viewBox="3 0 24 29.5" focusable="false">
          <rect className="swing-rope" x="14.6" y="-2" width="0.8" height="12.6" />
          <g ref={bodyRef} className="swing-body">
            <path className="swing-ring" d="M14 10h2v2h-2zM14.6 10.6h.8v.8h-.8z" fillRule="evenodd" />
            <path className="swing-line" d="M11.4 14.2L14.4 11.8M18.6 14.2L15.6 11.8" />
            <CritterBody x={6} y={12} outfit="harness" legsRef={legsRef} />
          </g>
        </svg>
      </span>
    </span>
  );
}
