import React, { useState } from 'react';
import { LAYOUT } from './data';
import useInViewOn from './useInViewOn';
import './ContextFigures.css';

export default function LayoutBars() {
  const { ref, on } = useInViewOn();
  const best = Math.max(...LAYOUT.map((r) => r.pass));
  const [active, setActive] = useState(LAYOUT[LAYOUT.length - 1].label);

  return (
    <figure className="cs-figure" ref={ref}>
      <div className="cs-figure-panel">
        <p className="cs-kicker">Pass rate by context layout</p>
        <div className="cs-hbar" role="list">
          {LAYOUT.map((row) => (
            <button
              key={row.label}
              type="button"
              role="listitem"
              className={`cs-hbar-row${row.pass === best ? ' is-best' : ''}${active === row.label ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(row.label)}
              onFocus={() => setActive(row.label)}
              onClick={() => setActive(row.label)}
            >
              <span className="cs-tip">{row.note} · {row.pass}%</span>
              <span className="cs-hbar-label">{row.label}</span>
              <span className="cs-hbar-track">
                <span
                  className={`cs-hbar-fill${on ? ' is-on' : ''}`}
                  style={{ '--fill': `${row.pass}%` }}
                >
                  {row.pass}%
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <figcaption>Single-shot tops out near 69%. The agent loop is the jump.</figcaption>
    </figure>
  );
}
