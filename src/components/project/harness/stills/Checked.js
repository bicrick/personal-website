import React from 'react';
import Fig from '../Fig';
import Critter from '../Critter';
import useInView from '../useInView';
import { CHECKED_FAIR as CHECKED } from '../why';

// Share of runs that ran code after editing, where transcripts let us see it.
export default function Checked() {
  const { ref, on } = useInView();
  return (
    <Fig
      innerRef={ref}
      className={`ck${on ? ' is-on' : ''}`}
      title="ran the code after editing"
      aside="share of runs"
      caption="Only measurable for the three harnesses that keep step-by-step logs. Very different habits, nearly the same success rate."
    >
      {CHECKED.map((r, n) => (
        <div key={r.id} className="ck-row" style={{ '--d': `${n * 0.2}s` }}>
          <Critter className="ck-critter" outfit={r.outfit} />
          <span className="ck-name">{r.label}{r.tag && <em className="mr-tag">{r.tag}</em>} <span className="ck-rate">· fixed {r.rate}%</span></span>
          <div className="ck-track"><span className="ck-fill" style={{ '--w': `${r.pct}%` }} /></div>
          <b className="ck-val">{r.pct}%</b>
        </div>
      ))}
    </Fig>
  );
}
