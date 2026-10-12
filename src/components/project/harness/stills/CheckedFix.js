import React from 'react';
import Critter from '../Critter';
import { ROSTER } from '../roster';

// Share of the 50 runs that ran code after their first edit, from the saved
// transcripts (harness-bench scripts/why_swe_agent_extract.py, docs/WHY_SWE_AGENT.md).
// Cursor and Claude Code from their full-log reruns (cursor_nothink2, claude_code_nothink2).
const CHECKED = { swe_agent: 98, cursor: 98, opencode: 76, mini: 64, claude_code: 96 };
const TOP = Math.max(...Object.values(CHECKED));

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
                <span className={`cf-bar${v === TOP ? ' is-top' : ''}`} style={{ width: `${v}%` }} />
              </span>
              <span className="cf-val">{`${v}%`}</span>
            </div>
          );
        })}
      </div>
      <figcaption>
        Share of the 50 runs that ran code after their first edit.
      </figcaption>
    </figure>
  );
}
