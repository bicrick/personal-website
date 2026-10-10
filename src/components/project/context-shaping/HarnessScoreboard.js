import React, { useState } from 'react';
import { SCOREBOARD, HARD_TIER, FINAL_RUNS } from './data';
import StaticFallback from './StaticFallback';
import './ContextFigures.css';

function money(n) {
  if (n >= 0.1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

export default function HarnessScoreboard({ fallbackSrc }) {
  const [active, setActive] = useState(SCOREBOARD[0].label);
  const current = SCOREBOARD.find((r) => r.label === active) || SCOREBOARD[0];

  return (
    <figure className="cs-figure">
      <div className="cs-figure-panel">
        <p className="cs-kicker">real harnesses · same tasks · Haiku 5.5</p>
        <ol className="cs-scoreboard">
          {SCOREBOARD.map((row, i) => (
            <li
              key={row.label}
              role="button"
              tabIndex={0}
              className={`${row.highlight ? 'is-best' : ''}${active === row.label ? ' is-active' : ''}`}
              onClick={() => setActive(row.label)}
              onMouseEnter={() => setActive(row.label)}
              onFocus={() => setActive(row.label)}
              onKeyDown={(e) => e.key === 'Enter' && setActive(row.label)}
            >
              <span className="cs-rank">{i + 1}</span>
              <span className="cs-name">{row.label}</span>
              <span className="cs-pass">{row.pass}%</span>
              <span className="cs-cost">{money(row.cost)}</span>
            </li>
          ))}
        </ol>
        <p className="cs-delta">
          hard tier: naive {HARD_TIER.naive}% → structured loop {HARD_TIER.structuredLoop}% · combined final run{' '}
          {FINAL_RUNS}/{FINAL_RUNS}
        </p>
        <p className="cs-note">
          {current.label}: {current.pass}%, {money(current.cost)} per solve.
        </p>
      </div>
      <figcaption>Real harnesses vs naive and combined</figcaption>
      <StaticFallback src={fallbackSrc} alt="Static real-harness scoreboard" />
    </figure>
  );
}
