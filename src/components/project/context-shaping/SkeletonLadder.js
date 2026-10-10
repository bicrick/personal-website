import React, { useState } from 'react';
import { LADDER } from './data';
import useInViewOn from './useInViewOn';
import './ContextFigures.css';

const TIPS = {
  'L0 file tree': 'Bare file tree only.',
  'L1 +imports': 'File tree plus imports — the only real step up.',
  'L2 +signatures': 'Signatures add length, not accuracy.',
  'L3 +docstrings': 'Docstrings add length, not accuracy.',
};

export default function SkeletonLadder() {
  const { ref, on } = useInViewOn();
  const peak = Math.max(...LADDER.map((r) => r.pass));
  const [active, setActive] = useState(LADDER[1].label);

  return (
    <figure className="cs-figure" ref={ref}>
      <div className="cs-figure-panel">
        <p className="cs-kicker">Skeleton ladder · single-shot</p>
        <div className="cs-hbar" role="list">
          {LADDER.map((row) => (
            <button
              key={row.label}
              type="button"
              role="listitem"
              className={`cs-hbar-row${row.pass === peak ? ' is-best' : ''}${active === row.label ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(row.label)}
              onFocus={() => setActive(row.label)}
              onClick={() => setActive(row.label)}
            >
              <span className="cs-tip">{TIPS[row.label]}</span>
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
      <figcaption>L0→L1 helps. Signatures and docstrings do not.</figcaption>
    </figure>
  );
}
