import React from 'react';
import Critter from '../Critter';
import useInView from '../useInView';

// Every turn, the whole window goes back to the model. Illustrative sizes.
const BASE = [
  { tone: 'c-sys', value: 3 },
  { tone: 'c-tool', value: 4 },
  { tone: 'c-msg', value: 1 },
];
const STEPS = [
  { label: 'Search', value: 2 },
  { label: 'Read schema.py', value: 9 },
  { label: 'Read fields.py', value: 8 },
  { label: 'Update', value: 2 },
  { label: 'Bash pytest', value: 5 },
];
const MAX = 40;

export default function TurnStack() {
  const { ref, on } = useInView();
  let running = BASE.reduce((s, b) => s + b.value, 0);
  const turns = STEPS.map((step, i) => {
    const segs = [...BASE, ...STEPS.slice(0, i).map((s) => ({ tone: 'c-result', value: s.value }))];
    const size = running;
    running += step.value;
    return { step, segs, size };
  });
  const total = turns.reduce((s, t) => s + t.size, 0);

  return (
    <div ref={ref} className={`hs-card hs-turns${on ? ' is-on' : ''}`}>
      <div className="hs-card-head">
        <span>what the model reads, turn by turn</span>
        <span className="hs-muted">k tokens</span>
      </div>
      {turns.map((t, i) => (
        <div key={t.step.label} className="hs-turn" style={{ '--i': i }}>
          <span className="hs-turn-n">{i + 1}</span>
          <div className="hs-turn-track">
            <div className="hs-turn-fill">
              {t.segs.map((seg, j) => (
                <span key={j} className={`hs-seg ${seg.tone}`} style={{ width: `${(seg.value / MAX) * 100}%` }} />
              ))}
            </div>
            {i === turns.length - 1 && <Critter style={{ '--end': `${(t.segs.reduce((a, b) => a + b.value, 0) / MAX) * 100}%` }} className="hs-turn-critter" mood="tired" walk />}
          </div>
          <span className="hs-turn-tok">{t.size}k</span>
          <span className="hs-turn-act">→ {t.step.label}</span>
        </div>
      ))}
      <div className="hs-legend">
        <span><i className="c-sys" />system prompt</span>
        <span><i className="c-tool" />tool definitions</span>
        <span><i className="c-msg" />your message</span>
        <span><i className="c-result" />tool results</span>
      </div>
      <div className="hs-foot">5 turns, {total}k tokens read. The window is resent every time.</div>
    </div>
  );
}
