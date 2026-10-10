import React, { useState } from 'react';
import { HEADLINE } from './data';
import useInViewOn from './useInViewOn';
import ContextPanel from './ring/ContextRing';
import { SCENARIOS, FINAL_PROMPTS, ringFor, fmtTokens, SPLIT_NOTE } from './ring/runs';
import './ContextFigures.css';

const NAIVE = SCENARIOS.full;
const BEST = SCENARIOS.combined;
const RINGS = [
  ringFor('naive', NAIVE.frames[0], { title: 'naive: full repo, one shot', short: 'naive' }),
  ringFor('best', BEST.frames[BEST.frames.length - 1], { title: 'best harness, at its peak', short: 'best' }),
];

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
        <div className="cs-headline-rings">
          <p className="cs-kicker">What each one sends · ValidationError task</p>
          <ContextPanel
            rings={RINGS}
            focus="repo"
            notes={{
              repo: 'The naive harness pays for the whole repo on its one call. The best harness never loads code up front.',
              toolout: 'The best harness only holds what find_references, rename_symbol and the tests sent back.',
            }}
            source={`${SPLIT_NOTE} Runs ${NAIVE.run} and ${BEST.run}. Across all ${FINAL_PROMPTS.full.n} final runs: naive prompts averaged ${fmtTokens(FINAL_PROMPTS.full.meanPrompt)} tokens; the best harness peaked at ${fmtTokens(FINAL_PROMPTS.combined.meanPrompt)} on average.`}
          />
        </div>
      </div>
      <figcaption>Naive full-repo prompt vs the best harness, same model, same 1M window.</figcaption>
    </figure>
  );
}
