import React, { useEffect, useId, useRef } from 'react';
import useReducedMotion from '../../useReducedMotion';
import { BotEngine } from './engine';

// Idle face from the bloub engine: a circle with eyes cut out of it, gaze
// drift, and blinks. Follow mode watches the pointer. Bead mode watches the
// loop token. Both stay inside the old head's box.
const RAYON = 100;
const YAW_MAX = 16;
const PITCH_MAX = 13;
const PITCH = 10;
const HEAD = 114.2705;
const SPAN = HEAD * 2;
const IDLE_MS = 2500;
const PAD = 110;

function lookAt(dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  const yaw = (dx / len) * YAW_MAX;
  const pitch = PITCH - (dy / len) * PITCH_MAX;
  if (!Number.isFinite(yaw + pitch)) return null;
  return { yaw, pitch, mix: 1, spin: 0, wander: 0 };
}

function beadLook(face) {
  const root = face.ownerSVGElement;
  const bead = root && root.querySelector('.loop-bead');
  if (!bead) return null;
  const faceBox = face.getBoundingClientRect();
  const beadBox = bead.getBoundingClientRect();
  if (faceBox.width === 0 || faceBox.height === 0) return null;
  const dx = (beadBox.left + beadBox.width / 2) - (faceBox.left + faceBox.width / 2);
  const dy = (beadBox.top + beadBox.height / 2) - (faceBox.top + faceBox.height / 2);
  return lookAt(dx, dy);
}

function paint(frame, nodes) {
  const { maskBody, paper, outline, group, eyes } = nodes;
  if (maskBody) maskBody.setAttribute('d', frame.bodyPath);
  if (paper) paper.setAttribute('d', frame.bodyPath);
  if (outline) outline.setAttribute('d', frame.bodyPath);
  if (group) group.setAttribute('opacity', String(frame.bodyAlpha));
  eyes.forEach((node, i) => {
    const eye = frame.eyes[i];
    if (!node) return;
    if (!eye) {
      node.setAttribute('opacity', '0');
      return;
    }
    node.setAttribute('d', eye.d);
    node.setAttribute('transform', eye.matrix);
    node.setAttribute('opacity', String(eye.alpha));
  });
}

export default function BloubFace({ headClass, mode }) {
  const reduce = useReducedMotion();
  const maskId = `bloub${useId().replace(/:/g, '')}`;
  const faceRef = useRef(null);
  const maskBodyRef = useRef(null);
  const paperRef = useRef(null);
  const outlineRef = useRef(null);
  const groupRef = useRef(null);
  const eye0Ref = useRef(null);
  const eye1Ref = useRef(null);
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new BotEngine(RAYON, 'idle');
  const stillRef = useRef(null);
  if (!stillRef.current) stillRef.current = engineRef.current.sample(0);
  const still = stillRef.current;
  const eyeStill = [0, 1].map((i) => still.eyes[i] || { d: '', matrix: '', alpha: 0 });

  useEffect(() => {
    const face = faceRef.current;
    const engine = engineRef.current;
    if (!face || !engine) return undefined;
    const nodes = {
      maskBody: maskBodyRef.current,
      paper: paperRef.current,
      outline: outlineRef.current,
      group: groupRef.current,
      eyes: [eye0Ref.current, eye1Ref.current],
    };

    if (reduce) {
      if (mode === 'bead') {
        const look = beadLook(face);
        if (look) engine.setLook(look, -1);
      }
      paint(engine.sample(0), nodes);
      return undefined;
    }

    let raf = 0;
    let last = 0;
    let clock = 0;
    let visible = true;
    let aiming = false;
    const pointer = { x: 0, y: 0, at: -Infinity };
    const watch = mode === 'follow' ? (face.ownerSVGElement || face) : face;

    const onMove = (event) => {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.at = performance.now();
    };
    if (mode === 'follow') {
      window.addEventListener('pointermove', onMove, { passive: true });
    }

    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; })
      : null;
    if (observer) observer.observe(watch);

    const tick = (ms) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((ms - last) / 1000, 0.064) : 0;
      last = ms;
      if (!visible) return;
      clock += dt;

      if (mode === 'follow') {
        const recent = performance.now() - pointer.at < IDLE_MS;
        const box = watch.getBoundingClientRect();
        if (recent && box.width > 0 && box.height > 0) {
          const look = lookAt(
            pointer.x - (box.left + box.width / 2),
            pointer.y - (box.top + box.height / 2),
          );
          if (look) {
            engine.setLook(look, clock);
            aiming = true;
          }
        } else if (aiming) {
          engine.setLook(null, clock);
          aiming = false;
        }
      } else if (mode === 'bead') {
        const look = beadLook(face);
        if (look) engine.setLook(look, clock);
      }

      paint(engine.sample(clock), nodes);
    };

    paint(engine.sample(0), nodes);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (mode === 'follow') window.removeEventListener('pointermove', onMove);
      if (observer) observer.disconnect();
    };
  }, [reduce, mode]);

  return (
    <svg
      ref={faceRef}
      className="bloub-face"
      x="0"
      y="0"
      width={SPAN}
      height={SPAN}
      viewBox={`${-RAYON} ${-RAYON} ${RAYON * 2} ${RAYON * 2}`}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      pointerEvents="none"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-PAD} y={-PAD} width={PAD * 2} height={PAD * 2}>
          <path ref={maskBodyRef} d={still.bodyPath} fill="#fff" />
          <path ref={eye0Ref} d={eyeStill[0].d} transform={eyeStill[0].matrix} opacity={eyeStill[0].alpha} fill="#000" />
          <path ref={eye1Ref} d={eyeStill[1].d} transform={eyeStill[1].matrix} opacity={eyeStill[1].alpha} fill="#000" />
        </mask>
      </defs>
      <g ref={groupRef} opacity={still.bodyAlpha}>
        <path ref={paperRef} className="bloub-paper" d={still.bodyPath} fill="var(--paper)" pointerEvents="auto" />
        <g mask={`url(#${maskId})`}>
          <rect className={headClass} x={-PAD} y={-PAD} width={PAD * 2} height={PAD * 2} fill="var(--bot)" pointerEvents="none" />
        </g>
        <path ref={outlineRef} className="bloub-outline" d={still.bodyPath} fill="none" pointerEvents="none" />
      </g>
    </svg>
  );
}
