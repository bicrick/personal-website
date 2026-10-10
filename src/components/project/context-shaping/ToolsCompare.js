import React, { useState } from 'react';
import { TOOLS, VALIDATION_ERROR } from './data';
import './ContextFigures.css';

function money(n) {
  return `$${n.toFixed(4)}`;
}

export default function ToolsCompare() {
  const [side, setSide] = useState('structured');

  return (
    <figure className="cs-figure">
      <div className="cs-figure-panel">
        <p className="cs-kicker">Same loop · only the tools change</p>
        <div className="cs-pair">
          <div
            className={`cs-pair-card${side === 'grep' ? ' is-active is-best' : ''}`}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setSide('grep')}
            onFocus={() => setSide('grep')}
            onClick={() => setSide('grep')}
            onKeyDown={(e) => e.key === 'Enter' && setSide('grep')}
          >
            <span className="cs-tip">
              {TOOLS.grep.pass}% · {money(TOOLS.grep.cost)} · {TOOLS.grep.calls} calls/run
            </span>
            <p className="cs-pair-label">grep / read / edit</p>
            <p className="cs-pair-value">{TOOLS.grep.pass}%</p>
            <p className="cs-pair-sub">
              {money(TOOLS.grep.cost)} · {TOOLS.grep.calls} calls/run
            </p>
          </div>
          <div
            className={`cs-pair-card${side === 'structured' ? ' is-active is-best' : ''}`}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setSide('structured')}
            onFocus={() => setSide('structured')}
            onClick={() => setSide('structured')}
            onKeyDown={(e) => e.key === 'Enter' && setSide('structured')}
          >
            <span className="cs-tip">
              {TOOLS.structured.pass}% · {money(TOOLS.structured.cost)} · {TOOLS.structured.calls} calls/run
            </span>
            <p className="cs-pair-label">find_references + rename</p>
            <p className="cs-pair-value">{TOOLS.structured.pass}%</p>
            <p className="cs-pair-sub">
              {money(TOOLS.structured.cost)} · {TOOLS.structured.calls} calls/run
            </p>
          </div>
        </div>
        <p className="cs-delta">
          <em>{TOOLS.costFactor}</em> cheaper · <em>{TOOLS.callFactor}</em> fewer calls
        </p>

        <div className="cs-story">
          <p className="cs-story-head">
            Hardest task · ValidationError · {VALIDATION_ERROR.lines} lines · {VALIDATION_ERROR.files} files
          </p>
          <div className={`cs-story-card${side === 'grep' ? ' is-best' : ''}`}>
            <p><strong>grep {VALIDATION_ERROR.grep.wins}</strong></p>
            <p>{VALIDATION_ERROR.grep.calls} tool calls avg</p>
            <p>up to {VALIDATION_ERROR.grep.tokens.toLocaleString()} tokens</p>
            <p>all {VALIDATION_ERROR.grep.turns} model turns burned</p>
          </div>
          <div className={`cs-story-card${side === 'structured' ? ' is-best' : ''}`}>
            <p><strong>structured {VALIDATION_ERROR.structured.wins}</strong></p>
            <p>about {VALIDATION_ERROR.structured.calls} tool calls</p>
            <p>never past {VALIDATION_ERROR.structured.tokens.toLocaleString()} tokens</p>
            <p>ask where, then rename</p>
          </div>
        </div>
      </div>
      <figcaption>Overall gap is noisy; the hard rename is not.</figcaption>
    </figure>
  );
}
