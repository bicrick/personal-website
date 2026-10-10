import React, { useState } from 'react';
import { SCOREBOARD, HARD_TIER, FINAL_RUNS } from './data';
import useInViewOn from './useInViewOn';
import './ContextFigures.css';

function money(n) {
  if (n >= 0.1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

export default function HarnessScoreboard() {
  const { ref, on } = useInViewOn();
  const [active, setActive] = useState(SCOREBOARD[0].label);
  const maxPass = Math.max(...SCOREBOARD.map((r) => r.pass));

  return (
    <figure className="cs-figure" ref={ref}>
      <div className="cs-figure-panel">
        <p className="cs-kicker">Real harnesses · Haiku 5.5 · same tasks</p>
        <div className="cs-hbar" role="list">
          {SCOREBOARD.map((row) => (
            <button
              key={row.label}
              type="button"
              role="listitem"
              className={`cs-hbar-row${row.highlight || row.pass === maxPass ? ' is-best' : ''}${active === row.label ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(row.label)}
              onFocus={() => setActive(row.label)}
              onClick={() => setActive(row.label)}
            >
              <span className="cs-tip">
                {row.pass}% · {money(row.cost)} per solve
              </span>
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
        <p className="cs-delta">
          Hard tier: naive {HARD_TIER.naive}% → structured loop {HARD_TIER.structuredLoop}% ·
          combined final {FINAL_RUNS}/{FINAL_RUNS}
        </p>
      </div>
      <figcaption>
        Hover a row for cost/solve. Combined harness leads; headless Aider expects a human in the loop.
      </figcaption>
    </figure>
  );
}
