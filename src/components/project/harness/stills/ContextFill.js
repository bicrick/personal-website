import React, { useEffect, useState } from 'react';
import Fig from '../Fig';
import Critter from '../Critter';
import useInView from '../useInView';

// The context window as one instrument bar, 100k tokens wide. The harness
// fills it step by step; at compaction the old results collapse into a
// short summary and free space reopens. Illustrative sizes.
const SEGS = [
  { key: 'sys', label: 'system prompt' },
  { key: 'tools', label: 'tools' },
  { key: 'files', label: 'your files' },
  { key: 'convo', label: 'conversation' },
  { key: 'sum', label: 'summary' },
];
const STEPS = [
  { say: 'The harness writes the instructions.', w: { sys: 4, tools: 0, files: 0, convo: 1, sum: 0 }, hot: 'sys' },
  { say: 'It lists the tools the model may ask for.', w: { sys: 4, tools: 10, files: 0, convo: 1, sum: 0 }, hot: 'tools' },
  { say: 'The model asks for a file; the harness reads it in.', w: { sys: 4, tools: 10, files: 16, convo: 3, sum: 0 }, hot: 'files' },
  { say: 'A search result lands.', w: { sys: 4, tools: 10, files: 27, convo: 5, sum: 0 }, hot: 'files' },
  { say: 'The model edits; the harness runs the tests.', w: { sys: 4, tools: 10, files: 38, convo: 14, sum: 0 }, hot: 'convo' },
  { say: 'It keeps going. The window is nearly full.', w: { sys: 4, tools: 10, files: 52, convo: 24, sum: 0 }, hot: 'convo' },
  { say: 'Compaction: old results become a short summary.', w: { sys: 4, tools: 10, files: 8, convo: 4, sum: 6 }, hot: 'sum' },
];
const TOTAL = 100;

export default function ContextFill() {
  const { ref, on } = useInView();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!on) return undefined;
    const t = setTimeout(() => setI((x) => (x + 1) % STEPS.length), i === STEPS.length - 1 ? 4500 : 2600);
    return () => clearTimeout(t);
  }, [on, i]);
  const s = STEPS[i];
  const used = SEGS.reduce((n, g) => n + s.w[g.key], 0);
  const small = SEGS.filter((g) => s.w[g.key] > 0 && s.w[g.key] < 22);
  return (
    <Fig
      innerRef={ref}
      className="cb"
      title="context window"
      aside={`${used}k / ${TOTAL}k`}
      caption="The model reads only this window. Everything in it was put there by the harness. Sizes illustrative."
    >
      <div className="cb-bar" role="img" aria-label={`${used}k of ${TOTAL}k tokens used`}>
        {SEGS.map((g) => (
          <span key={g.key} className={`cb-seg is-${g.key}${s.hot === g.key ? ' is-hot' : ''}`} style={{ width: `${s.w[g.key]}%` }} />
        ))}
        <span className="cb-seg is-free" style={{ flex: 1 }} />
      </div>
      <div className="cb-labels">
        {SEGS.map((g) => (
          <span key={g.key} className={`cb-lab${s.w[g.key] >= 22 ? ' is-shown' : ''}${s.hot === g.key ? ' is-hot' : ''}`} style={{ width: `${s.w[g.key]}%` }}>
            {s.w[g.key] >= 22 && <>{g.label} <b>{s.w[g.key]}k</b></>}
          </span>
        ))}
        <span className="cb-lab is-shown is-free" style={{ flex: 1 }}>free <b>{TOTAL - used}k</b></span>
      </div>
      <div className="cb-legend">
        {small.map((g) => (
          <span key={g.key} className={s.hot === g.key ? 'is-hot' : ''}><i className={`cb-sw is-${g.key}`} />{g.label} <b>{s.w[g.key]}k</b></span>
        ))}
      </div>
      <div className="cb-say"><Critter className="cb-critter" /><span key={i}>{s.say}</span></div>
    </Fig>
  );
}
