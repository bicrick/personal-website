import React from 'react';
import Critter from '../Critter';
import { CcWindow, CcBar, Transcript } from '../cc';
import useInView from '../useInView';

// The hardest task, grep agent vs. structured tools. Same model, same loop.
const SIDES = [
  {
    key: 'grep',
    title: 'grep, read, edit',
    mood: 'tired',
    peak: 122762,
    calls: 451,
    record: '0 / 3',
    lines: [
      { kind: 'call', text: 'Bash(grep -rn "ValidationError")' },
      { kind: 'call', text: 'Read(src/marshmallow/fields.py)' },
      { kind: 'call', text: 'Update(src/marshmallow/fields.py)' },
      { kind: 'gap', text: '… 448 more calls' },
      { kind: 'say', text: 'Hit the 25-turn limit.', ok: false },
    ],
  },
  {
    key: 'structured',
    title: 'find_references, rename_symbol',
    mood: 'happy',
    peak: 9785,
    calls: 8,
    record: '3 / 3',
    lines: [
      { kind: 'call', text: 'find_references("ValidationError")' },
      { kind: 'call', text: 'rename_symbol(→ SchemaValidationError)' },
      { kind: 'call', text: 'Bash(pytest)' },
      { kind: 'out', text: 'passed' },
      { kind: 'say', text: 'Done. 0 references left.' },
    ],
  },
];
const SCALE = 130000;

export default function Duel() {
  const { ref, on } = useInView();
  return (
    <div ref={ref} className={`hs-pair hs-duel${on ? ' is-on' : ''}`}>
      {SIDES.map((s) => (
        <CcWindow key={s.key} title={s.title} meta={`${s.record} solved`} className={`is-${s.key}`}>
          <Transcript lines={s.lines} />
          <div className="hs-duel-meter">
            <div className="hs-duel-meter-head">
              <span>biggest prompt</span>
              <span>{s.peak.toLocaleString()} tokens</span>
            </div>
            <CcBar total={SCALE} segments={[{ tone: 'c-msg', value: s.peak }]} className="is-grow" />
            <div className="hs-duel-meter-head">
              <span>tool calls per run</span>
              <span>{s.calls}</span>
            </div>
          </div>
          <Critter className="hs-duel-critter" mood={s.mood} hop={s.mood === 'happy'} walk={s.mood === 'tired'} />
        </CcWindow>
      ))}
    </div>
  );
}
