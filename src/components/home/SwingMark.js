import React, { useEffect, useRef, useState } from 'react';
import { CritterBody } from '../project/harness/Critter';
import useReducedMotion from '../project/useReducedMotion';
import '../project/harness/Critter.css';
import './SwingMark.css';
import { OUTFITS } from '../project/harness/order';

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
// Costume loop: the five harnesses from the post, same art.
const HOLD = 2.4; // seconds hanging in each costume
const SPIN = 0.9; // seconds per full turn: front, edge, back, edge, next front

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pickAmp = () => 0.04 + Math.random() * 0.07;

export default function SwingMark({ plain = false }) {
  const rootRef = useRef(null);
  const armRef = useRef(null);
  const bodyRef = useRef(null);
  const legsRef = useRef(null);
  const ropeRef = useRef(null);
  const shadowRef = useRef(null);
  const spinRef = useRef(null);
  const reduce = useReducedMotion();
  const [look, setLook] = useState(0);
  const [back, setBack] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return undefined;

    const s = {
      th: 0.08, w: 0, ph: 0, pw: 0, ps: 0, psw: 0, y: 0.6, yv: 0,
      amp: pickAmp(), swings: 0, kick: 2 + Math.random() * 3,
      clock: 0, look: 0, phase: 0,
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

    const spin = () => {
      // The writing mark stays the plain Claude. The tile still spins costumes.
      if (plain) return 1;
      // 0..HOLD hang, then one horizontal turn; swap costume when edge-on
      const t = s.clock - HOLD;
      if (t < 0) return 1;
      const p = Math.min(t / SPIN, 1);
      // edge-on at 1/4 (show the back) and 3/4 (next costume, front again)
      if (p >= 0.25 && s.phase === 0) {
        s.phase = 1;
        setBack(true);
      }
      if (p >= 0.75 && s.phase === 1) {
        s.phase = 2;
        s.look = (s.look + 1) % OUTFITS.length;
        setBack(false);
        setLook(s.look);
      }
      if (p >= 1) {
        s.clock = 0;
        s.phase = 0;
        return 1;
      }
      // snap to a few frames so the pixels stay crisp
      return Math.round(Math.cos(2 * Math.PI * p) * 6) / 6;
    };

    const draw = () => {
      const sx = spin();
      spinRef.current.style.transform = `scale(${sx === 0 ? 0.08 : sx}, 1)`;
      armRef.current.style.transform = `rotate(${s.th * DEG}deg)`;
      const stretch = clamp(s.y * 0.04, -0.04, 0.04);
      bodyRef.current.style.transform = `translateY(${s.y}px) rotate(${clamp(s.ph * DEG, -12, 12)}deg) scale(${1 - stretch * 0.5}, ${1 + stretch})`;
      ropeRef.current.setAttribute('height', `${(plain ? 8.7 : 12.6) + s.y}`);
      legsRef.current.style.transform = `skewX(${clamp(-s.ps * DEG, -24, 24)}deg)`;
      // positive rotation swings the critter left, so the shadow follows -sin
      const x = -Math.sin(s.th);
      shadowRef.current.style.transform = `translateX(${x * 160}%) scaleX(${(1 - Math.abs(x) * 0.8) * (0.55 + 0.45 * Math.abs(sx))})`;
    };

    const frame = (t) => {
      if (!last) last = t;
      acc += Math.min((t - last) / 1000, 0.05);
      last = t;
      while (acc >= STEP) {
        step(STEP);
        s.clock += STEP;
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
  }, [reduce, plain]);

  return (
    <span ref={rootRef} className={`swing-mark${plain ? ' is-framed' : ''}`} aria-hidden="true">
      <span ref={shadowRef} className="swing-shadow" />
      <span ref={armRef} className="swing-arm">
        <svg className="swing-svg" viewBox="3 0 24 29.5" focusable="false">
          <rect ref={ropeRef} className="swing-rope" x="14.6" y={plain ? 1.9 : -2} width="0.8" height={plain ? 8.7 : 12.6} />
          <g ref={bodyRef} className="swing-body">
            <path className="swing-ring" d="M14 10h2v2h-2zM14.6 10.6h.8v.8h-.8z" fillRule="evenodd" />
            <path className="swing-line" d="M10.4 14.2L14.4 11.8M19.6 14.2L15.6 11.8" />
            <g ref={spinRef} className="swing-spin">
              <CritterBody x={6} y={12} outfit={plain || reduce ? undefined : OUTFITS[look]} back={!plain && !reduce && back} legsRef={legsRef} />
            </g>
          </g>
        </svg>
      </span>
      {plain && (
        <svg className="swing-frame-svg" viewBox="3 0 24 29.5" focusable="false" aria-hidden="true">
          <path className="swing-line swing-frame-leg" d="M6.2 8.2 L11.2 2.05" />
          <path className="swing-line swing-frame-leg" d="M23.8 8.2 L18.8 2.05" />
          <rect className="swing-rope" x="10.2" y="1.35" width="9.6" height="1.15" />
        </svg>
      )}
    </span>
  );
}
