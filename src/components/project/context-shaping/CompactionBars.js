import React, { useState } from 'react';
import { COMPACTION, CACHE } from './data';
import useInViewOn from './useInViewOn';
import StaticFallback from './StaticFallback';
import './ContextFigures.css';

function money(n) {
  return n == null ? '—' : `$${n.toFixed(4)}`;
}

export default function CompactionBars({ fallbackSrc }) {
  const { ref, on } = useInViewOn();
  const [mode, setMode] = useState('pass');
  const [active, setActive] = useState(COMPACTION[2].label);
  const bestPass = Math.max(...COMPACTION.map((r) => r.pass));
  const current = COMPACTION.find((r) => r.label === active) || COMPACTION[0];

  return (
    <figure className="cs-figure" ref={ref}>
      <div className="cs-figure-panel">
        <p className="cs-kicker">compaction at a 12k budget</p>
        <div className="cs-toggle" role="tablist" aria-label="compaction metric">
          <button
            type="button"
            className={mode === 'pass' ? 'is-on' : ''}
            onClick={() => setMode('pass')}
          >
            pass rate
          </button>
          <button
            type="button"
            className={mode === 'cache' ? 'is-on' : ''}
            onClick={() => setMode('cache')}
          >
            prompt cache
          </button>
        </div>

        {mode === 'pass' ? (
          <ul className="cs-bars">
            {COMPACTION.map((row) => {
              const isBest = row.pass === bestPass;
              return (
                <li key={row.label}>
                  <button
                    type="button"
                    className={`cs-bar-btn${isBest ? ' is-best' : ''}${active === row.label ? ' is-active' : ''}`}
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
        ) : (
          <ul className="cs-bars">
            <li>
              <button type="button" className="cs-bar-btn is-active">
                <span className="cs-bars-label">summarize @50%</span>
                <span className="cs-bars-track">
                  <span
                    className={`cs-bars-fill${on ? ' is-on' : ''}`}
                    style={{ '--fill': `${CACHE.summarize50}%` }}
                  />
                </span>
                <span className="cs-bars-value">{CACHE.summarize50}%</span>
              </button>
            </li>
            <li>
              <button type="button" className="cs-bar-btn is-best is-active">
                <span className="cs-bars-label">no compaction</span>
                <span className="cs-bars-track">
                  <span
                    className={`cs-bars-fill${on ? ' is-on' : ''}`}
                    style={{ '--fill': `${CACHE.noCompaction}%` }}
                  />
                </span>
                <span className="cs-bars-value">{CACHE.noCompaction}%</span>
              </button>
            </li>
          </ul>
        )}

        <p className="cs-note">
          {mode === 'cache'
            ? `Summarizing at 50% drops cache hits to ${CACHE.summarize50}%, against ${CACHE.noCompaction}% with no compaction.`
            : `${current.label}: ${current.pass}%${current.cost != null ? ` · ${money(current.cost)} per solve` : ''}. Dropping old tool output wins.`}
        </p>
      </div>
      <figcaption>Compaction at a 12k budget</figcaption>
      <StaticFallback src={fallbackSrc} alt="Static compaction chart" />
    </figure>
  );
}
