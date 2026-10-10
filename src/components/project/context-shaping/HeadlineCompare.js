import React, { useState } from 'react';
import { HEADLINE } from './data';
import useInViewOn from './useInViewOn';
import './ContextFigures.css';

function money(n) {
  return `$${n.toFixed(4)}`;
}

export default function HeadlineCompare() {
  const { ref, on } = useInViewOn();
  const [focus, setFocus] = useState('combined');

  return (
    <figure className="cs-figure" ref={ref}>
      <div className="cs-figure-panel">
        <p className="cs-kicker">Same model · final head-to-head</p>
        <div className="cs-pair">
          <div
            className={`cs-pair-card${focus === 'naive' ? ' is-active' : ''}`}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setFocus('naive')}
            onFocus={() => setFocus('naive')}
            onClick={() => setFocus('naive')}
            onKeyDown={(e) => e.key === 'Enter' && setFocus('naive')}
          >
            <span className="cs-tip">
              Full-repo single-shot baseline from the final run.
            </span>
            <p className="cs-pair-label">Naive harness</p>
            <p className="cs-pair-value">{HEADLINE.naivePass}%</p>
            <p className="cs-pair-sub">{money(HEADLINE.naiveCost)} / solved task</p>
            <div
              className={`cs-pair-meter${on ? ' is-on' : ''}`}
              style={{ '--fill': `${HEADLINE.naivePass}%` }}
            >
              <span />
            </div>
          </div>

          <div
            className={`cs-pair-card is-best${focus === 'combined' ? ' is-active' : ''}`}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setFocus('combined')}
            onFocus={() => setFocus('combined')}
            onClick={() => setFocus('combined')}
            onKeyDown={(e) => e.key === 'Enter' && setFocus('combined')}
          >
            <span className="cs-tip">
              Agent loop + structured tools + no compaction + skill file.
            </span>
            <p className="cs-pair-label">Best harness</p>
            <p className="cs-pair-value">{HEADLINE.combinedPass}%</p>
            <p className="cs-pair-sub">{money(HEADLINE.combinedCost)} / solved task</p>
            <div
              className={`cs-pair-meter${on ? ' is-on' : ''}`}
              style={{ '--fill': `${HEADLINE.combinedPass}%` }}
            >
              <span />
            </div>
          </div>
        </div>
        <p className="cs-delta">
          +{HEADLINE.combinedPass - HEADLINE.naivePass} points · cost down to about{' '}
          <em>{HEADLINE.costRatioLabel}</em>
        </p>
      </div>
      <figcaption>Naive full-repo prompt vs the best harness, same model.</figcaption>
    </figure>
  );
}
