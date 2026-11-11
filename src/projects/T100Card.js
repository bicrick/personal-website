import React, { useEffect, useRef } from 'react';
import './T100Card.css';

const CARD = `${process.env.PUBLIC_URL}/images/t100/card`;

/** Spring toward a target with velocity (smoother than a single lerp). */
function springStep(value, velocity, target, stiff = 0.16, damp = 0.78) {
  const nextV = (velocity + (target - value) * stiff) * damp;
  return { value: value + nextV, velocity: nextV };
}

/**
 * Closed Pebble Beach guest card — CSS 3D floating cover.
 * Current cover art only; layered floor shadow + glare track the tilt.
 */
function T100Card({ compact = false, interactive = true, className = '' }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!interactive) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarseMq = window.matchMedia('(hover: none), (pointer: coarse)');

    let px = 0;
    let py = 0;
    let hover = 0;
    let vx = 0;
    let vy = 0;
    let vh = 0;
    let targetPx = 0;
    let targetPy = 0;
    let targetHover = 0;
    let idlePhase = 0;
    let mode = coarseMq.matches ? 'idle' : 'rest'; // 'pointer' | 'orient' | 'idle' | 'rest'
    let raf = 0;
    let running = true;
    let orientArmed = false;

    const setVars = () => {
      root.style.setProperty('--px', px.toFixed(4));
      root.style.setProperty('--py', py.toFixed(4));
      root.style.setProperty('--hover', hover.toFixed(4));
      root.dataset.tilt = mode;
    };

    if (reduceMq.matches) {
      // Static resting pose — CSS already carries --rest-* tilt + shadow
      px = 0;
      py = 0;
      hover = 0;
      setVars();
      root.dataset.tilt = 'reduced';
      return undefined;
    }

    const tick = (now) => {
      if (!running) return;

      if (mode === 'idle') {
        idlePhase = now * 0.00055;
        targetPx = Math.sin(idlePhase) * 0.42;
        targetPy = Math.cos(idlePhase * 0.85 + 0.6) * 0.32;
        targetHover = 0.18;
      } else if (mode === 'rest') {
        targetPx = 0;
        targetPy = 0;
        targetHover = 0;
      }

      const sx = springStep(px, vx, targetPx);
      const sy = springStep(py, vy, targetPy);
      const sh = springStep(hover, vh, targetHover, 0.2, 0.76);
      px = sx.value;
      vx = sx.velocity;
      py = sy.value;
      vy = sy.velocity;
      hover = sh.value;
      vh = sh.velocity;

      if (Math.abs(px) < 0.0004 && Math.abs(vx) < 0.0004) {
        px = 0;
        vx = 0;
      }
      if (Math.abs(py) < 0.0004 && Math.abs(vy) < 0.0004) {
        py = 0;
        vy = 0;
      }

      setVars();
      raf = requestAnimationFrame(tick);
    };

    const aim = (nx, ny, nextHover = targetHover) => {
      targetPx = Math.max(-1, Math.min(1, nx));
      targetPy = Math.max(-1, Math.min(1, ny));
      targetHover = nextHover;
    };

    const onMove = (event) => {
      mode = 'pointer';
      const rect = root.getBoundingClientRect();
      const hx = rect.width / 2 || 1;
      const hy = rect.height / 2 || 1;
      aim(
        (event.clientX - rect.left - hx) / hx,
        (event.clientY - rect.top - hy) / hy,
        1,
      );
    };

    const onEnter = (event) => {
      mode = 'pointer';
      onMove(event);
    };

    const onLeave = () => {
      aim(0, 0, 0);
      mode = coarseMq.matches ? 'idle' : 'rest';
    };

    const onOrient = (event) => {
      if (mode === 'pointer') return;
      if (event.gamma == null || event.beta == null) return;
      mode = 'orient';
      // gamma: left/right, beta: front/back — normalize into ±1
      const nx = Math.max(-1, Math.min(1, event.gamma / 28));
      const ny = Math.max(-1, Math.min(1, (event.beta - 45) / 28));
      aim(nx, ny, 0.35);
    };

    const armOrientation = () => {
      if (orientArmed || reduceMq.matches) return;
      orientArmed = true;
      window.addEventListener('deviceorientation', onOrient, { passive: true });
    };

    const requestOrientation = () => {
      if (!coarseMq.matches) return;
      const DOE = window.DeviceOrientationEvent;
      if (!DOE) {
        mode = 'idle';
        return;
      }
      if (typeof DOE.requestPermission === 'function') {
        DOE.requestPermission()
          .then((state) => {
            if (state === 'granted') armOrientation();
            else mode = 'idle';
          })
          .catch(() => {
            mode = 'idle';
          });
      } else {
        armOrientation();
      }
    };

    // Prefer idle float on touch; try orientation after first tap
    if (coarseMq.matches) {
      mode = 'idle';
      root.addEventListener('pointerdown', requestOrientation, {
        passive: true,
        once: true,
      });
    }

    root.addEventListener('pointerenter', onEnter, { passive: true });
    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave, { passive: true });

    raf = requestAnimationFrame(tick);

    const onReduceChange = () => {
      if (reduceMq.matches) {
        running = false;
        cancelAnimationFrame(raf);
        px = 0;
        py = 0;
        hover = 0;
        setVars();
        root.dataset.tilt = 'reduced';
      }
    };
    reduceMq.addEventListener?.('change', onReduceChange);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', requestOrientation);
      window.removeEventListener('deviceorientation', onOrient);
      reduceMq.removeEventListener?.('change', onReduceChange);
    };
  }, [interactive]);

  const classes = [
    't100-card',
    compact ? 'is-compact' : '',
    interactive ? '' : 'is-static',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={rootRef}
      className={classes}
      style={{ '--px': 0, '--py': 0, '--hover': 0 }}
      role="img"
      aria-label="Pebble Beach Golf Links guest scorecard in 3D"
    >
      <div className="t100-card-glow" aria-hidden="true" />
      <div className="t100-card-floor t100-card-floor-soft" aria-hidden="true" />
      <div className="t100-card-floor t100-card-floor-contact" aria-hidden="true" />
      <div className="t100-card-frame">
        <div className="t100-card-face">
          <img
            src={`${CARD}/pebble-cover-800.webp`}
            alt=""
            width={800}
            height={519}
            draggable={false}
            decoding="async"
            loading={compact ? 'lazy' : 'eager'}
            fetchPriority={compact ? 'low' : 'high'}
          />
          <span className="t100-card-glare" aria-hidden="true" />
          <span className="t100-card-edge" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default T100Card;
