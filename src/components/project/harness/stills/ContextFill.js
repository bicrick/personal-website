import React, { useEffect, useState } from 'react';
import Fig from '../Fig';
import Critter from '../Critter';
import useInView from '../useInView';

// The context window as a /context-style grid: 100 cells, 1k tokens each.
// The harness fills it turn by turn; the model only ever reads the grid.
// Illustrative sizes, typical of the runs.
const KINDS = [
  { key: 'sys', tone: 'c-sys', label: 'system prompt' },
  { key: 'tools', tone: 'c-tool', label: 'tool definitions' },
  { key: 'files', tone: 'c-msg', label: 'your files' },
  { key: 'convo', tone: 'c-skill', label: 'conversation' },
];
const STEPS = [
  { say: 'the harness writes the instructions', w: { sys: 4, tools: 0, files: 0, convo: 1 } },
  { say: 'and lists the tools the model may ask for', w: { sys: 4, tools: 10, files: 0, convo: 1 } },
  { say: 'model asks to open a file; harness pastes it in', w: { sys: 4, tools: 10, files: 18, convo: 3 } },
  { say: 'model asks to search; the results land', w: { sys: 4, tools: 10, files: 30, convo: 6 } },
  { say: 'model edits; harness runs the tests', w: { sys: 4, tools: 10, files: 44, convo: 14 } },
  { say: 'it keeps going; the window fills up', w: { sys: 4, tools: 10, files: 58, convo: 22 } },
  { say: 'harness compacts: old results swapped for a summary', w: { sys: 4, tools: 10, files: 12, convo: 9 } },
];
const CELLS = 100;

export default function ContextFill() {
  const { ref, on } = useInView();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!on) return undefined;
    const t = setTimeout(() => setI((x) => (x + 1) % STEPS.length), i === STEPS.length - 1 ? 4200 : 2400);
    return () => clearTimeout(t);
  }, [on, i]);
  const s = STEPS[i];
  const cells = [];
  KINDS.forEach((k) => { for (let n = 0; n < s.w[k.key]; n += 1) cells.push(k.tone); });
  const used = cells.length;
  while (cells.length < CELLS) cells.push('');
  return (
    <Fig
      innerRef={ref}
      className="cf"
      title="context window"
      aside={`${used}k / 100k`}
      caption="The model only reads this window. Everything in it was put there by the harness. Sizes illustrative."
    >
      <div className="cf-grid" aria-hidden="true">
        {cells.map((tone, n) => <span key={n} className={`cf-cell ${tone}`} />)}
      </div>
      <div className="cf-step">
        <Critter className="cf-critter" mood={i === STEPS.length - 1 ? 'happy' : 'open'} />
        <span key={i} className="cf-say">{s.say}</span>
      </div>
      <div className="cf-legend">
        {KINDS.map((k) => (
          <span key={k.key}><i className={`cf-sw ${k.tone}`} />{k.label}<b>{s.w[k.key]}k</b></span>
        ))}
        <span><i className="cf-sw" />free<b>{CELLS - used}k</b></span>
      </div>
    </Fig>
  );
}
