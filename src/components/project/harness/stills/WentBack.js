import React from 'react';
import Critter from '../Critter';
import { ROSTER } from '../roster';

// Share of the 50 runs where the harness went back and edited again after a
// failed test or check, from the saved transcripts (harness-bench
// scripts/why_swe_agent_extract.py, docs/WHY_SWE_AGENT.md "revises after a failed check").
// Cursor and Claude Code from their full-log reruns (cursor_nothink2, claude_code_nothink2).
const WENT_BACK = { claude_code: 16, cursor: 18, opencode: 15, swe_agent: 30, mini: 10 };
const SCALE = 40; // bar axis runs 0 to 40%

export default function WentBack() {
  return (
    <figure className="hs-fig cf">
      <div className="cf-chart" role="table" aria-label="Share of runs that went back after a failed check">
        {ROSTER.map((h) => {
          const v = WENT_BACK[h.id];
          return (
            <div key={h.id} className="cf-row" role="row">
              <Critter className="cf-critter" outfit={h.outfit} />
              <span className="cf-name" role="rowheader">{h.label}</span>
              <span className="cf-track" role="cell">
                <span className={`cf-bar${h.id === 'swe_agent' ? ' is-top' : ''}`} style={{ width: `${(v / SCALE) * 100}%` }} />
              </span>
              <span className="cf-val">{`${v}%`}</span>
            </div>
          );
        })}
      </div>
      <figcaption>
        Share of the 50 runs where a test or check failed and the harness went back and changed its fix.
      </figcaption>
    </figure>
  );
}
