import React, { useEffect, useRef } from 'react';
import './T100Card.css';

const CARD = `${process.env.PUBLIC_URL}/images/t100/card`;

/** Live-site settle curve (approx). */
function easeSettle(t) {
  const c = Math.max(0, Math.min(1, t));
  // smoothstep-ish with a soft landing, close to cubic-bezier(0.22, 0.8, 0.24, 1)
  return c * c * (3 - 2 * c);
}

function springStep(value, velocity, target, stiff = 0.22, damp = 0.78) {
  const nextV = (velocity + (target - value) * stiff) * damp;
  return { value: value + nextV, velocity: nextV };
}

/**
 * Pebble Beach guest card — CSS 3D fold matching t100-web.vercel.app:
 * bottom panel stays, cover leaf hinges open to show the inside top.
 * Always floats; cursor tilt is a few degrees only; fold loops open↔shut.
 */
function T100Card({ compact = false, interactive = true, className = '' }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    let px = 0;
    let py = 0;
    let vx = 0;
    let vy = 0;
    let targetPx = 0;
    let targetPy = 0;
    let open = compact || !interactive ? 0 : 0;
    let floatPhase = 0;
    let raf = 0;
    let running = true;
    let start = performance.now();
    let pointerOn = false;

    const setVars = () => {
      root.style.setProperty('--px', px.toFixed(4));
      root.style.setProperty('--py', py.toFixed(4));
      root.style.setProperty('--open', open.toFixed(4));
      root.style.setProperty('--float', Math.sin(floatPhase).toFixed(4));
    };

    if (reduceMq.matches || !interactive) {
      open = 0;
      px = 0;
      py = 0;
      root.style.setProperty('--float', '0');
      setVars();
      root.dataset.motion = reduceMq.matches ? 'reduced' : 'static';
      return undefined;
    }

    // Loop: open → hold → close → hold (ms)
    const OPEN_MS = 1100;
    const HOLD_OPEN_MS = 1400;
    const CLOSE_MS = 1100;
    const HOLD_SHUT_MS = 900;
    const PERIOD = OPEN_MS + HOLD_OPEN_MS + CLOSE_MS + HOLD_SHUT_MS;

    const openAt = (elapsed) => {
      const t = elapsed % PERIOD;
      if (t < OPEN_MS) return easeSettle(t / OPEN_MS);
      if (t < OPEN_MS + HOLD_OPEN_MS) return 1;
      if (t < OPEN_MS + HOLD_OPEN_MS + CLOSE_MS) {
        return 1 - easeSettle((t - OPEN_MS - HOLD_OPEN_MS) / CLOSE_MS);
      }
      return 0;
    };

    const tick = (now) => {
      if (!running) return;
      const elapsed = now - start;
      if (root.dataset.freezeOpen != null && root.dataset.freezeOpen !== '') {
        open = Math.max(0, Math.min(1, Number(root.dataset.freezeOpen) || 0));
      } else {
        open = openAt(elapsed);
      }
      floatPhase = elapsed * 0.00115;

      const sx = springStep(px, vx, targetPx, 0.2, 0.8);
      const sy = springStep(py, vy, targetPy, 0.2, 0.8);
      px = sx.value;
      vx = sx.velocity;
      py = sy.value;
      vy = sy.velocity;
      if (Math.abs(px) < 0.0003 && Math.abs(vx) < 0.0003) {
        px = 0;
        vx = 0;
      }
      if (Math.abs(py) < 0.0003 && Math.abs(vy) < 0.0003) {
        py = 0;
        vy = 0;
      }

      setVars();
      raf = requestAnimationFrame(tick);
    };

    const aim = (nx, ny) => {
      // A few degrees only — never a big jump on enter/leave
      targetPx = Math.max(-1, Math.min(1, nx));
      targetPy = Math.max(-1, Math.min(1, ny));
    };

    const onMove = (event) => {
      pointerOn = true;
      const rect = root.getBoundingClientRect();
      const hx = rect.width / 2 || 1;
      const hy = rect.height / 2 || 1;
      aim(
        (event.clientX - rect.left - hx) / hx,
        (event.clientY - rect.top - hy) / hy,
      );
    };

    const onLeave = () => {
      pointerOn = false;
      aim(0, 0);
    };

    root.addEventListener('pointerenter', onMove, { passive: true });
    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave, { passive: true });

    raf = requestAnimationFrame(tick);
    root.dataset.motion = 'live';

    const onReduceChange = () => {
      if (reduceMq.matches) {
        running = false;
        cancelAnimationFrame(raf);
        open = 0;
        px = 0;
        py = 0;
        root.style.setProperty('--float', '0');
        setVars();
        root.dataset.motion = 'reduced';
      }
    };
    reduceMq.addEventListener?.('change', onReduceChange);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerenter', onMove);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      reduceMq.removeEventListener?.('change', onReduceChange);
      void pointerOn;
    };
  }, [interactive, compact]);

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
      style={{ '--px': 0, '--py': 0, '--open': 0, '--float': 0 }}
      role="img"
      aria-label="Pebble Beach Golf Links guest scorecard opening to show the round"
    >
      <div className="t100-card-glow" aria-hidden="true" />
      <div className="t100-card-deal">
        <div className="t100-fold">
          <span className="t100-fold-body">
            <span className="t100-fold-shadow" aria-hidden="true" />
            <span className="t100-fold-base">
              <img
                src={`${CARD}/pebble-inside-bot-800.webp`}
                alt=""
                width={800}
                height={509}
                draggable={false}
                decoding="async"
                loading={compact ? 'lazy' : 'eager'}
              />
            </span>
            <span className="t100-fold-leaf">
              <span className="t100-fold-face t100-fold-inner">
                <img
                  src={`${CARD}/pebble-inside-top-800.webp`}
                  alt=""
                  width={800}
                  height={483}
                  draggable={false}
                  decoding="async"
                  loading={compact ? 'lazy' : 'eager'}
                />
              </span>
              <span className="t100-fold-face t100-fold-cover">
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
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default T100Card;
