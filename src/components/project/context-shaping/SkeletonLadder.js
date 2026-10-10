import React, { useState } from 'react';
import { LADDER } from './data';
import useInViewOn from './useInViewOn';
import StaticFallback from './StaticFallback';
import './ContextFigures.css';

export default function SkeletonLadder({ fallbackSrc }) {
  const { ref, on } = useInViewOn();
  const peak = Math.max(...LADDER.map((r) => r.pass));
  const [active, setActive] = useState(LADDER[1].label);
  const current = LADDER.find((r) => r.label === active) || LADDER[0];

  return (
    <figure className="cs-figure" ref={ref}>
      <div className="cs-figure-panel">
        <p className="cs-kicker">skeleton ladder · single-shot</p>
        <div className="cs-ladder">
          {LADDER.map((row, i) => {
            const isPeak = row.pass === peak;
            return (
              <button
                key={row.label}
                type="button"
                className={`cs-ladder-step${isPeak ? ' is-peak' : ''}${active === row.label ? ' is-active' : ''}`}
                onClick={() => setActive(row.label)}
                onMouseEnter={() => setActive(row.label)}
                onFocus={() => setActive(row.label)}
              >
                <span className="cs-ladder-rank">L{i}</span>
                <span className="cs-ladder-name">{row.label.replace(/^L\d\s*/, '')}</span>
                <span className="cs-ladder-pass">{row.pass}%</span>
                <span
                  className={`cs-ladder-bar${on ? ' is-on' : ''}`}
                  style={{ '--fill': `${row.pass}%` }}
                >
                  <span />
                </span>
              </button>
            );
          })}
        </div>
        <p className="cs-note">
          {current.label}: {current.pass}%. L0 to L1 is the only real step; signatures and docstrings add nothing more.
        </p>
      </div>
      <figcaption>Skeleton ladder</figcaption>
      <StaticFallback src={fallbackSrc} alt="Static skeleton ladder chart" />
    </figure>
  );
}
