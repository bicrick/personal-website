import React, { useState } from 'react';
import { LAYOUT } from './data';
import useInViewOn from './useInViewOn';
import StaticFallback from './StaticFallback';
import './ContextFigures.css';

export default function LayoutBars({ fallbackSrc }) {
  const { ref, on } = useInViewOn();
  const best = Math.max(...LAYOUT.map((r) => r.pass));
  const [active, setActive] = useState(LAYOUT[LAYOUT.length - 1].label);
  const current = LAYOUT.find((r) => r.label === active) || LAYOUT[0];

  return (
    <figure className="cs-figure" ref={ref}>
      <div className="cs-figure-panel">
        <p className="cs-kicker">pass rate by context layout</p>
        <ul className="cs-bars">
          {LAYOUT.map((row) => {
            const isBest = row.pass === best;
            const isActive = active === row.label;
            return (
              <li key={row.label}>
                <button
                  type="button"
                  className={`cs-bar-btn${isBest ? ' is-best' : ''}${isActive ? ' is-active' : ''}`}
                  onClick={() => setActive(row.label)}
                  onMouseEnter={() => setActive(row.label)}
                  onFocus={() => setActive(row.label)}
                >
                  <span className="cs-bars-label">{row.label}</span>
                  <span className="cs-bars-track">
                    <span
                      className={`cs-bars-fill${on ? ' is-on' : ''}`}
                      style={{ '--fill': `${row.pass}%` }}
                    />
                  </span>
                  <span className="cs-bars-value">{row.pass}%</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="cs-note">
          {current.label}: {current.pass}% ({current.note}). Single-shot tops out around 69%; the loop is the jump.
        </p>
      </div>
      <figcaption>Pass rate by context layout</figcaption>
      <StaticFallback src={fallbackSrc} alt="Static layout chart" />
    </figure>
  );
}
