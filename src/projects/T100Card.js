import React, { useEffect, useRef } from 'react';
import './T100Card.css';

const CARD = `${process.env.PUBLIC_URL}/images/t100/card`;

/**
 * Closed Pebble Beach guest card in the same CSS-3D desk pose as
 * https://t100-web.vercel.app — full cover visible, soft layered shadows.
 */
function T100Card({ compact = false, interactive = true, className = '' }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!interactive) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let px = 0;
    let py = 0;
    let targetPx = 0;
    let targetPy = 0;
    let ticking = false;
    let raf = 0;

    const apply = () => {
      px += (targetPx - px) * 0.14;
      py += (targetPy - py) * 0.14;
      if (Math.abs(px) < 0.0008) px = 0;
      if (Math.abs(py) < 0.0008) py = 0;
      root.style.setProperty('--px', px.toFixed(3));
      root.style.setProperty('--py', py.toFixed(3));
      if (Math.abs(targetPx - px) > 0.002 || Math.abs(targetPy - py) > 0.002) {
        raf = requestAnimationFrame(apply);
      } else {
        ticking = false;
      }
    };

    const aim = (nx, ny) => {
      if (reduce.matches) return;
      targetPx = Math.max(-1, Math.min(1, nx));
      targetPy = Math.max(-1, Math.min(1, ny));
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(apply);
      }
    };

    const onMove = (event) => {
      const rect = root.getBoundingClientRect();
      const hx = rect.width / 2 || 1;
      const hy = rect.height / 2 || 1;
      aim((event.clientX - rect.left - hx) / hx, (event.clientY - rect.top - hy) / hy);
    };

    const onLeave = () => aim(0, 0);

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [interactive]);

  const classes = [
    't100-card',
    compact ? 'is-compact' : '',
    className,
  ].filter(Boolean).join(' ');

  const style = {
    '--px': 0,
    '--py': 0,
    '--t100-mask': `url(${CARD}/pebble-cover-mask.webp)`,
    '--t100-grain': `url(${CARD}/paper-grain.png)`,
    '--t100-shadow-soft': `url(${CARD}/shadow-soft.png)`,
    '--t100-shadow-contact': `url(${CARD}/shadow-contact.png)`,
  };

  return (
    <div
      ref={rootRef}
      className={classes}
      style={style}
      role="img"
      aria-label="Pebble Beach Golf Links guest scorecard in 3D"
    >
      <div className="t100-card-glow" aria-hidden="true" />
      <div className="t100-card-idle-shadow" aria-hidden="true" />
      <div className="t100-card-shadow-rig" aria-hidden="true">
        <div className="t100-card-shadow t100-card-shadow-soft" />
        <div className="t100-card-shadow t100-card-shadow-contact" />
      </div>
      <div className="t100-card-frame">
        <div className="t100-card-extrude t100-card-extrude-left" aria-hidden="true" />
        <div className="t100-card-extrude t100-card-extrude-right" aria-hidden="true" />
        <div className="t100-card-extrude t100-card-extrude-bottom" aria-hidden="true" />
        <div className="t100-card-face">
          <picture>
            <source
              type="image/webp"
              srcSet={`${CARD}/pebble-cover-800.webp`}
            />
            <img
              src={`${CARD}/pebble-cover-1200.jpg`}
              alt=""
              width={1200}
              height={808}
              draggable={false}
              decoding="async"
              loading={compact ? 'lazy' : 'eager'}
              fetchPriority={compact ? 'low' : 'high'}
            />
          </picture>
          <span className="t100-card-grain" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default T100Card;
