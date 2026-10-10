import React, { useEffect, useRef } from 'react';
import { CritterBody } from '../project/harness/Critter';
import useReducedMotion from '../project/useReducedMotion';
import '../project/harness/Critter.css';

// The harness post's mark: the pixel Claude strapped into a harness,
// dangling from a rope. A small spring sim drives it every frame: a gentle
// sway, a slow bungee bob, the body lagging the rope, and the odd lazy leg
// kick. Moving the pointer across the row nudges it.
const G = 6.5; // g / L, about a 2.5s sway
const ROPE_DAMP = 0.5;
const PUMP = 1.2;
const BOB_K = 9; // bungee spring, about a 2s bob
const BOB_DAMP = 0.9;
const BODY_K = 60;
const BODY_DAMP = 8;
const LEG_K = 40;
const LEG_DAMP = 4;
const STEP = 1 / 240;
const DEG = 180 / Math.PI;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pickAmp = () => 0.04 + Math.random() * 0.07;

export default function SwingMark() {
  const rootRef = useRef(null);
  const armRef = useRef(null);
  const bodyRef = useRef(null);
  const legsRef = useRef(null);
  const ropeRef = useRef(null);
  const shadowRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return undefined;

    const s = {
      th: 0.08, w: 0, ph: 0, pw: 0, ps: 0, psw: 0, y: 0.6, yv: 0,
      amp: pickAmp(), swings: 0, kick: 2 + Math.random() * 3,
    };
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
        if (s.swings % 3 === 0) s.amp = pickAmp();
      }
      // bungee: the rope stretches and settles, with a small bob kept alive
      const ya = -BOB_K * s.y - BOB_DAMP * s.yv;
      s.yv += ya * h;
      s.y += s.yv * h;
      // body hangs off the rope end and lags behind it
      const pa = -BODY_K * s.ph - BODY_DAMP * s.pw - a * 0.8;
      s.pw += pa * h;
      s.ph += s.pw * h;
      // legs trail behind the body; now and then it kicks them
      s.kick -= h;
      if (s.kick <= 0) {
        s.psw += (Math.random() < 0.5 ? -1 : 1) * (1.6 + Math.random() * 1.2);
        s.yv -= 0.9;
        s.kick = 3 + Math.random() * 4;
      }
      const la = -LEG_K * s.ps - LEG_DAMP * s.psw - (a + pa) * 0.6 - ya * 0.05;
      s.psw += la * h;
      s.ps += s.psw * h;
    };

    const draw = () => {
      armRef.current.style.transform = `rotate(${s.th * DEG}deg)`;
      const stretch = clamp(s.y * 0.04, -0.04, 0.04);
      bodyRef.current.style.transform = `translateY(${s.y}px) rotate(${clamp(s.ph * DEG, -12, 12)}deg) scale(${1 - stretch * 0.5}, ${1 + stretch})`;
      ropeRef.current.setAttribute('height', `${12.6 + s.y}`);
      legsRef.current.style.transform = `skewX(${clamp(-s.ps * DEG, -24, 24)}deg)`;
      // positive rotation swings the critter left, so the shadow follows -sin
      const x = -Math.sin(s.th);
      shadowRef.current.style.transform = `translateX(${x * 160}%) scaleX(${1 - Math.abs(x) * 0.8})`;
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
      s.w = clamp(s.w - clamp(e.movementX * 0.004, -0.12, 0.12), -1.2, 1.2);
    };
    const onEnter = () => {
      s.yv -= 1.4;
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
          <rect ref={ropeRef} className="swing-rope" x="14.6" y="-2" width="0.8" height="12.6" />
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
