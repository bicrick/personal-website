import React, { useEffect, useRef } from 'react';
import './T100Card.css';

const CARD = `${process.env.PUBLIC_URL}/images/t100/card`;

/** Monotonic ease — no overshoot (smoothstep). */
function easeInOut(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/**
 * Pebble Beach guest card — t100-web fold geometry.
 * One rAF owns all motion. Nested wrappers each take one transform so
 * float / tilt / fold never fight. Cursor is critically damped (no spring).
 */
function T100Card({ compact = false, interactive = true, className = '' }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Cursor — unit square targets, low-pass filtered (no velocity / overshoot)
    let px = 0;
    let py = 0;
    let targetPx = 0;
    let targetPy = 0;
    const CURSOR_ALPHA = 0.06; // ~slow, critically damped approach

    // Float — 3px peak, 7s period
    const FLOAT_AMP_PX = 3;
    const FLOAT_PERIOD_MS = 7000;

    // Fold loop
    const OPEN_MS = 1400;
    const HOLD_OPEN_MS = 1800;
    const CLOSE_MS = 1400;
    const HOLD_SHUT_MS = 1400;
    const PERIOD = OPEN_MS + HOLD_OPEN_MS + CLOSE_MS + HOLD_SHUT_MS;

    let open = 0;
    let raf = 0;
    let running = true;
    const start = performance.now();

    const write = (floatY) => {
      // Fixed decimal places avoid subpixel thrash from long floats
      root.style.setProperty('--px', px.toFixed(4));
      root.style.setProperty('--py', py.toFixed(4));
      root.style.setProperty('--open', open.toFixed(5));
      root.style.setProperty('--float-y', `${floatY.toFixed(2)}px`);
    };

    if (reduceMq.matches || !interactive) {
      open = 0;
      px = 0;
      py = 0;
      write(0);
      root.dataset.motion = reduceMq.matches ? 'reduced' : 'static';
      return undefined;
    }

    const openAt = (elapsed) => {
      const t = elapsed % PERIOD;
      if (t < OPEN_MS) return easeInOut(t / OPEN_MS);
      if (t < OPEN_MS + HOLD_OPEN_MS) return 1;
      if (t < OPEN_MS + HOLD_OPEN_MS + CLOSE_MS) {
        return 1 - easeInOut((t - OPEN_MS - HOLD_OPEN_MS) / CLOSE_MS);
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

      // Pure sine float — continuous derivative at loop boundaries
      const floatY =
        FLOAT_AMP_PX *
        Math.sin((elapsed / FLOAT_PERIOD_MS) * Math.PI * 2);

      // Critically damped cursor (exponential approach — never overshoots)
      px += (targetPx - px) * CURSOR_ALPHA;
      py += (targetPy - py) * CURSOR_ALPHA;
      if (Math.abs(targetPx - px) < 0.0002) px = targetPx;
      if (Math.abs(targetPy - py) < 0.0002) py = targetPy;

      write(floatY);
      raf = requestAnimationFrame(tick);
    };

    const aim = (nx, ny) => {
      targetPx = Math.max(-1, Math.min(1, nx));
      targetPy = Math.max(-1, Math.min(1, ny));
    };

    const onMove = (event) => {
      const rect = root.getBoundingClientRect();
      const hx = rect.width / 2 || 1;
      const hy = rect.height / 2 || 1;
      aim(
        (event.clientX - rect.left - hx) / hx,
        (event.clientY - rect.top - hy) / hy,
      );
    };

    const onLeave = () => aim(0, 0);

    root.addEventListener('pointerenter', onMove, { passive: true });
    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave, { passive: true });

    raf = requestAnimationFrame(tick);
    root.dataset.motion = 'live';

    const onReduceChange = () => {
      if (!reduceMq.matches) return;
      running = false;
      cancelAnimationFrame(raf);
      open = 0;
      px = 0;
      py = 0;
      write(0);
      root.dataset.motion = 'reduced';
    };
    reduceMq.addEventListener?.('change', onReduceChange);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerenter', onMove);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      reduceMq.removeEventListener?.('change', onReduceChange);
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
      style={{ '--px': 0, '--py': 0, '--open': 0, '--float-y': '0px' }}
      role="img"
      aria-label="Pebble Beach Golf Links guest scorecard opening to show the round"
    >
      <div className="t100-card-float">
        <div className="t100-card-tilt">
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
    </div>
  );
}

export default T100Card;
