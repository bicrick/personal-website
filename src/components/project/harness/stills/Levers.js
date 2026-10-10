import React from 'react';
import Critter from '../Critter';

// The model is fixed; everything left of it is the harness. With
// `settings`, each lever shows the choice that won in the test.
const LEVERS = [
  { n: 1, name: 'what it reads', eg: 'files, maps, search results' },
  { n: 2, name: 'what it can do', eg: 'grep, edit, run tests, rename' },
  { n: 3, name: 'what it forgets', eg: 'summaries, clearing old output' },
  { n: 4, name: 'what it’s told', eg: 'CLAUDE.md, skills' },
];

const WINDOW = [
  ['c-sys', 10], ['c-tool', 12], ['c-skill', 6], ['c-msg', 8], ['c-result', 34], ['c-free', 30],
];
// Set well, the window stays lean: a short skill, exact tool results.
const LEAN = [
  ['c-sys', 10], ['c-tool', 12], ['c-skill', 3], ['c-msg', 8], ['c-result', 9], ['c-free', 58],
];

export default function Levers({ settings, mood = 'open', outfit }) {
  return (
    <div className={`hs-levers${settings ? ' is-set' : ''}`}>
      <div className="hs-harness">
        <div className="hs-label">{settings ? 'how i’d set them' : 'the harness · you control this'}</div>
        {LEVERS.map((l, i) => (
          <div key={l.n} className="hs-lever">
            <span className="hs-lever-n">{l.n}</span>
            <span className="hs-lever-text">
              <span className="hs-lever-name">{l.name}</span>
              <span className="hs-lever-eg">{settings ? settings[i] : l.eg}</span>
            </span>
            <span className={`hs-switch${settings ? ' is-on' : ''}`} aria-hidden="true"><i /></span>
          </div>
        ))}
      </div>
      <div className="hs-pipe" aria-hidden="true">
        <span className="hs-pipe-label">context window</span>
        <span className="hs-pipe-bar">
          {(settings ? LEAN : WINDOW).map(([tone, w], i) => (
            <span key={i} className={`hs-seg ${tone}`} style={{ width: `${w}%` }} />
          ))}
        </span>
      </div>
      <div className="hs-model">
        <div className="hs-label">the model · you don’t</div>
        <Critter className="hs-model-critter" mood={mood} outfit={outfit} hop />
        <div className="hs-lock">weights locked</div>
      </div>
      <div className="hs-return" aria-hidden="true">↺ tool calls come back through the harness, every turn</div>
    </div>
  );
}
