import React from 'react';
import { KEY_ROWS, keyStatuses } from './wordle';
import { THEMES } from './themes';
import './mockpage.css';

const BUBBLES = [
  { left: 8, size: 7, delay: 0, dur: 9 },
  { left: 19, size: 4, delay: 3.2, dur: 7 },
  { left: 31, size: 9, delay: 5.5, dur: 11 },
  { left: 46, size: 5, delay: 1.4, dur: 8 },
  { left: 58, size: 8, delay: 6.8, dur: 10 },
  { left: 70, size: 4, delay: 2.1, dur: 7.5 },
  { left: 82, size: 10, delay: 4.4, dur: 12 },
  { left: 93, size: 5, delay: 0.9, dur: 8.5 },
];

function Fx({ activeId, layer }) {
  const under = layer === 'under';
  return (
    <div className={`mq-fx mq-fx-${layer}`} aria-hidden="true">
      {THEMES.map((theme) => (
        <div
          key={theme.id}
          className={`mq-fx-layer mq-fx-${theme.id}${activeId === theme.id ? ' is-on' : ''}`}
        >
          {theme.id === 'medieval' && under ? (
            <>
              <i className="mq-torch mq-torch-l" />
              <i className="mq-torch mq-torch-r" />
            </>
          ) : null}
          {theme.id === 'medieval' && !under ? <i className="mq-vignette" /> : null}
          {theme.id === 'terminal' && under ? <i className="mq-glow" /> : null}
          {theme.id === 'terminal' && !under ? (
            <>
              <i className="mq-scanlines" />
              <i className="mq-roll" />
            </>
          ) : null}
          {theme.id === 'newsprint' && !under ? (
            <>
              <i className="mq-grain" />
              <i className="mq-rules" />
            </>
          ) : null}
          {theme.id === 'ocean' && under ? (
            <>
              <i className="mq-caustics" />
              {BUBBLES.map((b) => (
                <i
                  key={b.left}
                  className="mq-bubble"
                  style={{
                    left: `${b.left}%`,
                    width: `${b.size}cqmin`,
                    height: `${b.size}cqmin`,
                    animationDelay: `-${b.delay}s`,
                    animationDuration: `${b.dur}s`,
                  }}
                />
              ))}
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Board({ rows, current }) {
  const cells = [];
  for (let r = 0; r < 6; r += 1) {
    const submitted = rows[r];
    const typing = !submitted && r === rows.length;
    for (let c = 0; c < 5; c += 1) {
      let letter = '';
      let state = 'empty';
      if (submitted) {
        letter = submitted.letters[c];
        state = submitted.status[c];
      } else if (typing && current[c]) {
        letter = current[c];
        state = 'typed';
      }
      cells.push(
        <span key={`${r}-${c}`} className={`mq-tile is-${state}`}>
          {letter}
        </span>,
      );
    }
  }
  return <div className="mq-board">{cells}</div>;
}

function Keyboard({ rows, onKey }) {
  const status = keyStatuses(rows);
  return (
    <div className="mq-kb">
      {KEY_ROWS.map((row, i) => (
        <div key={i} className="mq-kb-row">
          {row.map((k) => {
            const className = `mq-key${k.length > 1 ? ' is-wide' : ''}${status[k] ? ` is-${status[k]}` : ''}`;
            const label = k === 'BACK' ? '\u232B' : k === 'ENTER' ? 'enter' : k;
            // Read-only keyboards (home tile) sit inside a tile <button>, so no nested buttons.
            if (!onKey) return <span key={k} className={className}>{label}</span>;
            return (
              <button
                key={k}
                type="button"
                tabIndex={-1}
                className={className}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onKey(k)}
                aria-label={k === 'BACK' ? 'backspace' : k.toLowerCase()}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** A tiny Wordle-shaped page. `theme` swaps variables; the board keeps its state. */
export default function MockPage({
  theme,
  title,
  subtitle,
  rows,
  current,
  onKey,
  paused = false,
  compact = false,
  sweepKey = 0,
  toast = null,
}) {
  return (
    <div
      className={`mq-page${paused ? ' is-paused' : ''}${compact ? ' is-compact' : ''}`}
      data-theme={theme}
    >
      <Fx activeId={theme} layer="under" />
      <div className="mq-col">
        <header className="mq-head">
          <div key={`t-${theme}`} className="mq-title">{title}</div>
          <div key={`s-${theme}`} className="mq-sub">{subtitle}</div>
        </header>
        <div className="mq-frame">
          <Board rows={rows} current={current} />
        </div>
        <Keyboard rows={rows} onKey={onKey} />
      </div>
      <Fx activeId={theme} layer="over" />
      {toast ? <div className="mq-toast">{toast}</div> : null}
      {sweepKey ? <i key={sweepKey} className="mq-sweep" aria-hidden="true" /> : null}
    </div>
  );
}
