import React, { useState } from 'react';
import { HEADLINE } from './data';
import useInViewOn from './useInViewOn';
import StaticFallback from './StaticFallback';
import './ContextFigures.css';

function money(n) {
  return `$${n.toFixed(4)}`;
}

export default function HeadlineCompare({ fallbackSrc }) {
  const { ref, on } = useInViewOn();
  const [focus, setFocus] = useState('combined');

  return (
    <figure className="cs-figure" ref={ref}>
      <div className="cs-figure-panel">
        <p className="cs-kicker">same model · final head-to-head</p>
        <div className="cs-headline-grid">
          <div
            className={`cs-metric-card${focus === 'naive' ? ' is-active' : ''}`}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setFocus('naive')}
            onFocus={() => setFocus('naive')}
            onClick={() => setFocus('naive')}
            onKeyDown={(e) => e.key === 'Enter' && setFocus('naive')}
          >
            <p className="cs-metric-label">naive harness</p>
            <p className="cs-metric-value">{HEADLINE.naivePass}%</p>
            <p className="cs-metric-sub">{money(HEADLINE.naiveCost)} per solved task</p>
            <div
              className={`cs-meter${on ? ' is-on' : ''}`}
              style={{ '--fill': `${HEADLINE.naivePass}%` }}
            >
              <span />
            </div>
          </div>

          <div
            className={`cs-metric-card is-best${focus === 'combined' ? ' is-active' : ''}`}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setFocus('combined')}
            onFocus={() => setFocus('combined')}
            onClick={() => setFocus('combined')}
            onKeyDown={(e) => e.key === 'Enter' && setFocus('combined')}
          >
            <p className="cs-metric-label">best harness</p>
            <p className="cs-metric-value">{HEADLINE.combinedPass}%</p>
            <p className="cs-metric-sub">{money(HEADLINE.combinedCost)} per solved task</p>
            <div
              className={`cs-meter${on ? ' is-on' : ''}`}
              style={{ '--fill': `${HEADLINE.combinedPass}%` }}
            >
              <span />
            </div>
          </div>
        </div>
        <p className="cs-delta">
          +{HEADLINE.combinedPass - HEADLINE.naivePass} points · cost down to about{' '}
          <strong>{HEADLINE.costRatioLabel}</strong>
        </p>
        <p className="cs-note">
          {focus === 'naive'
            ? 'Full-repo single-shot baseline from the final run.'
            : 'Combined harness: agent loop, structured tools, no compaction, skill file.'}
        </p>
      </div>
      <figcaption>Naive full-repo prompt vs the best harness, same model</figcaption>
      <StaticFallback src={fallbackSrc} alt="Static headline chart" />
    </figure>
  );
}
