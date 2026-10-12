import React, { useEffect, useState } from 'react';
import Fig from '../Fig';
import Stack from '../Stack';
import Critter from '../Critter';
import useInView from '../useInView';
import useReducedMotion from '../../useReducedMotion';

// The model's context window as one bar. The harness fills it, piece by piece,
// until it is nearly full. Labels live in a fixed legend under the bar, with
// the same color as their segment. Sizes illustrative.
const SEGS = [
  { key: 'sys', label: 'instructions' },
  { key: 'tools', label: 'tool list' },
  { key: 'files', label: 'code it read' },
  { key: 'convo', label: 'results so far' },
];
const STEPS = [
  { say: 'The harness writes the model its instructions.', w: [8, 0, 0, 0] },
  { say: 'It lists the tools the model is allowed to ask for.', w: [8, 14, 0, 0] },
  { say: 'The model asks to see some code. The harness pastes it in.', w: [8, 14, 30, 0] },
  { say: 'The harness runs the tests and pastes the results in too.', w: [8, 14, 30, 22] },
  { say: 'Every turn adds more. This is all the model ever sees.', w: [8, 14, 38, 34] },
];

export default function ContextBar() {
  const { ref, on } = useInView();
  const reduce = useReducedMotion();
  const [i, setI] = useState(reduce ? STEPS.length - 1 : 0);
  useEffect(() => {
    if (!on || reduce) return undefined;
    const t = setTimeout(() => setI((x) => (x + 1) % STEPS.length), i === STEPS.length - 1 ? 4200 : 2400);
    return () => clearTimeout(t);
  }, [on, i, reduce]);
  const s = STEPS[i];
  const used = s.w.reduce((a, b) => a + b, 0);
  return (
    <Fig innerRef={ref} className="cx" title="the model's context window" aside={`${used}% full`} caption="The harness decides what goes in. The model only reads what it is given.">
      <div className="cx-bar" role="img" aria-label={`context window ${used}% full`}>
        {SEGS.map((g, n) => <span key={g.key} className={`cx-seg is-${g.key}`} style={{ width: `${s.w[n]}%` }} />)}
      </div>
      <div className="cx-legend">
        {SEGS.map((g, n) => (
          <span key={g.key} className={s.w[n] ? 'is-on' : ''}><i className={`cx-sw is-${g.key}`} />{g.label}</span>
        ))}
      </div>
      <div className="cx-say"><Critter className="cx-critter" /><Stack at={i} items={STEPS.map((st) => st.say)} /></div>
    </Fig>
  );
}
