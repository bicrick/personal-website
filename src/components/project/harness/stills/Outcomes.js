import React from 'react';
import Fig from '../Fig';
import Critter from '../Critter';
import useInView from '../useInView';
import { OUTCOMES_FAIR as OUTCOMES } from '../why';

// One square per task: fixed, wrong fix, or no fix at all.
export default function Outcomes() {
  const { ref, on } = useInView();
  return (
    <Fig
      innerRef={ref}
      className={`oc${on ? ' is-on' : ''}`}
      title="how each run ended"
      caption={`On the same settings, almost every run hands in a fix. The top five hand in a wrong one on ${Math.min(...OUTCOMES.filter((r) => r.id !== 'aider').map((r) => r.wrong))} to ${Math.max(...OUTCOMES.filter((r) => r.id !== 'aider').map((r) => r.wrong))} bugs; Aider, built for a person at the keyboard, ends empty and wrong most often.`}
    >
      {OUTCOMES.map((r, row) => (
        <div key={r.id} className="oc-row">
          <div className="oc-who"><Critter className="oc-critter" outfit={r.outfit} /><span>{r.label}</span><b>{r.none}</b></div>
          <div className="oc-cells">
            {[...Array(r.fixed).fill('f'), ...Array(r.wrong).fill('w'), ...Array(r.none).fill('n')].map((k, n) => (
              <span key={n} className={`oc-cell is-${k}`} style={{ '--d': `${row * 0.12 + n * 0.012}s` }} />
            ))}
          </div>
        </div>
      ))}
      <div className="oc-key">
        <span><i className="oc-cell is-f" />fixed</span>
        <span><i className="oc-cell is-w" />wrong fix</span>
        <span><i className="oc-cell is-n" />no fix (count at right)</span>
      </div>
    </Fig>
  );
}
