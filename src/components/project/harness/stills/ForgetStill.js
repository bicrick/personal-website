import React from 'react';
import Critter from '../Critter';

// What happens when the window fills. Three bars, three answers.
const TRIGGERS = [
  { at: 50, who: 'Gemini CLI' },
  { at: 90, who: 'Codex CLI' },
  { at: 97, who: 'Claude Code, near the limit', high: true },
];

function Blocks({ items }) {
  return (
    <div className="hs-window">
      {items.map(([tone, w], i) => (
        <span key={i} className={`hs-seg ${tone}`} style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

export default function ForgetStill() {
  return (
    <div className="hs-card hs-forget">
      <div className="hs-forget-row">
        <span className="hs-forget-name">full window</span>
        <div className="hs-forget-bar">
          <Blocks items={[['c-sys', 6], ['c-tool', 6], ['c-msg', 3], ['c-result', 18], ['c-result', 22], ['c-result', 20], ['c-result', 17]]} />
          {TRIGGERS.map((t) => (
            <span key={t.who} className={`hs-trigger${t.high ? ' is-high' : ''}`} style={{ left: `${t.at}%` }}>
              <span>{t.who}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="hs-forget-row">
        <span className="hs-forget-name">summarize</span>
        <div className="hs-forget-bar">
          <Blocks items={[['c-sys', 6], ['c-tool', 6], ['c-summary', 12], ['c-result', 17]]} />
        </div>
      </div>
      <div className="hs-forget-row">
        <span className="hs-forget-name">drop old output</span>
        <div className="hs-forget-bar">
          <Blocks items={[['c-sys', 6], ['c-tool', 6], ['c-msg', 3], ['c-cleared', 18], ['c-cleared', 22], ['c-cleared', 20], ['c-result', 17]]} />
        </div>
      </div>
      <div className="hs-legend">
        <span><i className="c-result" />tool results</span>
        <span><i className="c-summary" />model-written summary</span>
        <span><i className="c-cleared" />cleared, a stub stays</span>
      </div>
      <Critter className="hs-forget-critter" mood="sleep" />
    </div>
  );
}
