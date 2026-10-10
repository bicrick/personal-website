import React from 'react';
import Critter from '../Critter';

// The model is fixed. Everything left of it is the harness.
const LEVERS = [
  { name: 'what it reads', eg: 'files, maps, search results' },
  { name: 'what it can do', eg: 'grep, edit, run tests, rename' },
  { name: 'what it forgets', eg: 'compaction, clearing old output' },
  { name: 'what it is told', eg: 'CLAUDE.md, skills' },
];

export default function Levers() {
  return (
    <div className="hs-levers">
      <div className="hs-harness">
        <div className="hs-label">the harness · you control this</div>
        {LEVERS.map((l) => (
          <div key={l.name} className="hs-lever">
            <span className="hs-lever-knob" />
            <span className="hs-lever-name">{l.name}</span>
            <span className="hs-lever-eg">{l.eg}</span>
          </div>
        ))}
      </div>
      <div className="hs-arrow" aria-hidden="true">
        <span>context window</span>
      </div>
      <div className="hs-model">
        <div className="hs-label">the model · you don't</div>
        <Critter className="hs-model-critter" mood="open" hop />
        <div className="hs-lock">weights locked</div>
      </div>
      <div className="hs-return" aria-hidden="true">← tool calls come back through the harness</div>
    </div>
  );
}
