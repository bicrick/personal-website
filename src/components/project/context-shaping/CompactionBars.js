import React, { useState } from 'react';
import { COMPACTION, CACHE } from './data';
import useInViewOn from './useInViewOn';
import './ContextFigures.css';

function money(n) {
  return n == null ? '—' : `$${n.toFixed(4)}`;
}

export default function CompactionBars() {
  const { ref, on } = useInViewOn();
  const [mode, setMode] = useState('pass');
  const bestPass = Math.max(...COMPACTION.map((r) => r.pass));

  const cacheRows = [
    { label: 'summarize @50%', value: CACHE.summarize50, tip: 'Every summary rewrites the prompt prefix.' },
    { label: 'no compaction', value: CACHE.noCompaction, tip: 'Stable prefix keeps the cache hot.', best: true },
  ];

  return (
    <figure className="cs-figure" ref={ref}>
      <div className="cs-figure-panel">
        <p className="cs-kicker">Compaction at a 12k budget</p>
        <div className="cs-toggle" role="tablist" aria-label="compaction metric">
          <button
            type="button"
            className={mode === 'pass' ? 'is-on' : ''}
            onClick={() => setMode('pass')}
          >
            Pass rate
          </button>
          <button
            type="button"
            className={mode === 'cache' ? 'is-on' : ''}
            onClick={() => setMode('cache')}
          >
            Cache hit rate
          </button>
        </div>

        <div className="cs-hbar" role="list">
          {mode === 'pass'
            ? COMPACTION.map((row) => (
                <button
                  key={row.label}
                  type="button"
                  role="listitem"
                  className={`cs-hbar-row${row.pass === bestPass ? ' is-best' : ''}`}
                >
                  <span className="cs-tip">
                    {row.pass}%
                    {row.cost != null ? ` · ${money(row.cost)} / solve` : ''}
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
              ))
            : cacheRows.map((row) => (
                <button
                  key={row.label}
                  type="button"
                  role="listitem"
                  className={`cs-hbar-row${row.best ? ' is-best' : ''}`}
                >
                  <span className="cs-tip">{row.tip}</span>
                  <span className="cs-hbar-label">{row.label}</span>
                  <span className="cs-hbar-track">
                    <span
                      className={`cs-hbar-fill${on ? ' is-on' : ''}`}
                      style={{ '--fill': `${row.value}%` }}
                    >
                      {row.value}%
                    </span>
                  </span>
                </button>
              ))}
        </div>
      </div>
      <figcaption>
        Drop old tool output wins on pass rate and cost. Early summaries also kill the cache (10% vs 85%).
      </figcaption>
    </figure>
  );
}
