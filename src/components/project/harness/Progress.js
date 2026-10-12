import React from 'react';

// Thin square progress track for the pinned sections, with quiet stage ticks.
export default function Progress({ p, ticks, stage }) {
  return (
    <div className="sg-prog" aria-hidden="true">
      <div className="sg-prog-bar">
        <i style={{ transform: `scaleX(${p})` }} />
        {ticks.slice(1).map((t) => <b key={t.at} style={{ left: `${t.at * 100}%` }} />)}
      </div>
      <div className="sg-prog-lab">
        {ticks.map((t, n) => (
          <span key={t.at} className={stage === n ? 'is-on' : ''} style={{ left: `${t.at * 100}%` }}>{t.label}</span>
        ))}
      </div>
    </div>
  );
}
