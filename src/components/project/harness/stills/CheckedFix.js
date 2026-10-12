import React from 'react';
import Critter from '../Critter';
import { ROSTER } from '../roster';

// Share of the 50 runs that ran code after their first edit, from the saved
// transcripts (context-shaping docs/WHY_SWE_AGENT.md). Claude Code saved no
// tool trace; Cursor's logs were cut off in half its runs, so it undercounts.
const CHECKED = { swe_agent: 98, cursor: 78, opencode: 76, mini: 64, claude_code: null };

export default function CheckedFix() {
  return (
    <figure className="hs-fig cf">
      <div className="cf-chart" role="table" aria-label="Share of runs that checked their fix">
        {ROSTER.map((h) => {
          const v = CHECKED[h.id];
          return (
            <div key={h.id} className="cf-row" role="row">
              <Critter className="cf-critter" outfit={h.outfit} />
              <span className="cf-name" role="rowheader">{h.label}</span>
              <span className="cf-track" role="cell">
                {v == null
                  ? <span className="cf-none">not logged</span>
                  : <span className={`cf-bar${h.id === 'swe_agent' ? ' is-top' : ''}`} style={{ width: `${v}%` }} />}
              </span>
              <span className="cf-val">{v == null ? '' : `${v}%`}</span>
            </div>
          );
        })}
      </div>
      <figcaption>
        Share of the 50 runs that ran code after their first edit. Claude Code didn&apos;t save its
        steps. Cursor&apos;s logs were cut off in half its runs, so its number is low.
      </figcaption>
    </figure>
  );
}
