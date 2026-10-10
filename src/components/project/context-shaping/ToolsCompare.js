import React, { useState } from 'react';
import { TOOLS, VALIDATION_ERROR } from './data';
import StaticFallback from './StaticFallback';
import './ContextFigures.css';

function money(n) {
  return `$${n.toFixed(4)}`;
}

export default function ToolsCompare({ fallbackSrc }) {
  const [side, setSide] = useState('structured');

  return (
    <figure className="cs-figure">
      <div className="cs-figure-panel">
        <p className="cs-kicker">same loop · only the tools change</p>
        <div className="cs-toggle" role="tablist" aria-label="tool setup">
          <button
            type="button"
            className={side === 'grep' ? 'is-on' : ''}
            onClick={() => setSide('grep')}
          >
            grep / read / edit
          </button>
          <button
            type="button"
            className={side === 'structured' ? 'is-on' : ''}
            onClick={() => setSide('structured')}
          >
            find_references + rename
          </button>
        </div>

        <div className="cs-split">
          <div className={`cs-split-card${side === 'grep' ? ' is-best' : ''}`}>
            <p className="cs-split-title">raw tools</p>
            <div className="cs-stat-row">
              <span>pass rate</span>
              <strong>{TOOLS.grep.pass}%</strong>
            </div>
            <div className="cs-stat-row">
              <span>cost / solve</span>
              <strong>{money(TOOLS.grep.cost)}</strong>
            </div>
            <div className="cs-stat-row">
              <span>tool calls / run</span>
              <strong>{TOOLS.grep.calls}</strong>
            </div>
          </div>
          <div className={`cs-split-card${side === 'structured' ? ' is-best' : ''}`}>
            <p className="cs-split-title">structured tools</p>
            <div className="cs-stat-row">
              <span>pass rate</span>
              <strong>{TOOLS.structured.pass}%</strong>
            </div>
            <div className="cs-stat-row">
              <span>cost / solve</span>
              <strong>{money(TOOLS.structured.cost)}</strong>
            </div>
            <div className="cs-stat-row">
              <span>tool calls / run</span>
              <strong>{TOOLS.structured.calls}</strong>
            </div>
          </div>
        </div>

        <p className="cs-delta">
          {TOOLS.costFactor} cheaper · {TOOLS.callFactor} fewer calls · overall gap within noise
        </p>

        <div className="cs-story">
          <p className="cs-story-title">
            hardest task · ValidationError · {VALIDATION_ERROR.lines} lines · {VALIDATION_ERROR.files} files
          </p>
          <div className="cs-story-grid">
            <div className={`cs-story-pill${side === 'grep' ? ' is-win' : ''}`}>
              <p><strong>grep agent {VALIDATION_ERROR.grep.wins}</strong></p>
              <p>{VALIDATION_ERROR.grep.calls} tool calls avg</p>
              <p>prompt up to {VALIDATION_ERROR.grep.tokens.toLocaleString()} tokens</p>
              <p>burned all {VALIDATION_ERROR.grep.turns} model turns</p>
            </div>
            <div className={`cs-story-pill${side === 'structured' ? ' is-win' : ''}`}>
              <p><strong>structured {VALIDATION_ERROR.structured.wins}</strong></p>
              <p>about {VALIDATION_ERROR.structured.calls} tool calls</p>
              <p>prompt never past {VALIDATION_ERROR.structured.tokens.toLocaleString()} tokens</p>
              <p>asked where it was used, then renamed</p>
            </div>
          </div>
        </div>
      </div>
      <figcaption>Raw grep/edit vs structured tools</figcaption>
      <StaticFallback src={fallbackSrc} alt="Static tools comparison chart" />
    </figure>
  );
}
