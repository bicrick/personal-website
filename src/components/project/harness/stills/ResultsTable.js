import React from 'react';
import Critter from '../Critter';
import { ROSTER } from '../roster';
import { SWE_N } from '../swebench';

// Results as a launch-style benchmark table, with harnesses as the columns
// (shared ORDER via ROSTER). The best value in each row is picked out.
const ROWS = [
  {
    key: 'rate', label: 'SWE-bench Verified', best: 'max',
    note: `Share of ${SWE_N} real bugs fixed. Small numbers are the 95% range.`,
    fmt: (h) => <>{h.rate}%<small>{h.ci[0]}–{h.ci[1]}</small></>,
  },
  {
    key: 'tok', label: 'Tokens per fix', best: 'min',
    note: 'Everything the model read and wrote, divided by bugs fixed.',
    fmt: (h) => `${Math.round(h.tok / 1000)}k`,
  },
  {
    key: 'usd', label: 'Cost per fix', best: 'min',
    note: 'API spend divided by bugs fixed. Cursor\u2019s is estimated from its own token counts.',
    fmt: (h) => `${(h.usd * 100).toFixed(2)}¢`,
  },
  {
    key: 'min', label: 'Minutes per fix', best: 'min',
    note: 'Wall-clock time divided by bugs fixed.',
    fmt: (h) => h.min.toFixed(1),
  },
];

export default function ResultsTable() {
  return (
    <figure className="hs-fig rt">
      <div className="rt-table" role="table" aria-label="Results by harness">
        <div className="rt-row rt-head" role="row">
          <div className="rt-lab" role="columnheader"><span className="rt-model">Claude Haiku 5.5, thinking off</span></div>
          {ROSTER.map((h) => (
            <div key={h.id} className="rt-cell" role="columnheader">
              <Critter className="rt-critter" outfit={h.outfit} />
              <span className="rt-name">{h.label}</span>
            </div>
          ))}
        </div>
        {ROWS.map((r) => {
          const vals = ROSTER.map((h) => h[r.key]);
          const best = r.best === 'max' ? Math.max(...vals) : Math.min(...vals);
          return (
            <div key={r.key} className="rt-row" role="row">
              <div className="rt-lab" role="rowheader"><b>{r.label}</b><small>{r.note}</small></div>
              {ROSTER.map((h) => (
                <div key={h.id} role="cell" className={`rt-cell rt-val${h[r.key] === best ? ' is-best' : ''}`}>{r.fmt(h)}</div>
              ))}
            </div>
          );
        })}
      </div>
      <figcaption>Same model, same settings, same 50 bugs. The best value in each row is highlighted.</figcaption>
    </figure>
  );
}
