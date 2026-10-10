import React, { useMemo, useState } from 'react';
import { COMPACTION, CACHE } from '../data';
import './Demo.css';

const MESSAGES = [
  { id: 1, kind: 'user', text: 'Rename ValidationError → SchemaError across the package.' },
  { id: 2, kind: 'assistant', text: 'I will find references, then edit.' },
  { id: 3, kind: 'tool', text: 'tool: grep ValidationError → 48 matches' },
  { id: 4, kind: 'tool', text: 'tool: read fields.py (120 lines)' },
  { id: 5, kind: 'tool', text: 'tool: read schema.py (200 lines)' },
  { id: 6, kind: 'tool', text: 'tool: read validate.py (90 lines)' },
  { id: 7, kind: 'assistant', text: 'Editing call sites…' },
  { id: 8, kind: 'tool', text: 'tool: edit exceptions.py' },
  { id: 9, kind: 'tool', text: 'tool: grep again → 22 matches left' },
  { id: 10, kind: 'tool', text: 'tool: read tests/test_schema.py' },
  { id: 11, kind: 'assistant', text: 'Continuing renames…' },
  { id: 12, kind: 'tool', text: 'tool: edit more callers…' },
];

function applyMode(modeId) {
  // Returns { gone: Set, summary: string|null, fill: 0-100 }
  if (modeId === 'none') {
    return { gone: new Set(), summary: null, fill: 92, cache: CACHE.noCompaction };
  }
  if (modeId === 'sum50') {
    // early summary: collapse early tool outputs
    return {
      gone: new Set([3, 4, 5, 6, 8, 9]),
      summary: 'summary@50%: found ValidationError in fields/schema/validate; edits started',
      fill: 55,
      cache: CACHE.summarize50,
    };
  }
  if (modeId === 'sum90') {
    return {
      gone: new Set([3, 4, 5]),
      summary: 'summary@90%: reference search complete; continuing edits',
      fill: 78,
      cache: null,
    };
  }
  // drop old tool outputs — keep recent tools, drop oldest tool msgs
  return {
    gone: new Set([3, 4, 5, 6]),
    summary: null,
    fill: 60,
    cache: null,
  };
}

export default function CompactionDemo() {
  const [modeId, setModeId] = useState('none');
  const mode = COMPACTION.find((m) => m.id === modeId) || COMPACTION[0];
  const view = useMemo(() => applyMode(modeId), [modeId]);

  return (
    <figure className="cs-demo">
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">Compaction · context window</p>
          <span className="cs-demo-badge">simplified window · study cache rates</span>
        </div>

        <div className="cs-demo-controls" role="tablist" aria-label="compaction mode">
          {COMPACTION.map((m) => (
            <button
              key={m.id}
              type="button"
              className={modeId === m.id ? 'is-on' : ''}
              onClick={() => setModeId(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="cs-demo-stats">
          <span className="cs-stat is-accent">
            pass <strong>{mode.pass}%</strong>
          </span>
          {mode.cost != null && (
            <span className="cs-stat">
              cost/solve <strong>${mode.cost.toFixed(4)}</strong>
            </span>
          )}
          <span className="cs-stat">
            cache hit{' '}
            <strong>
              {view.cache != null ? `${view.cache}%` : '—'}
            </strong>
          </span>
        </div>

        <div className="cs-window" aria-live="polite">
          {view.summary && (
            <div className="cs-msg is-summary">{view.summary}</div>
          )}
          {MESSAGES.map((m) => (
            <div
              key={m.id}
              className={`cs-msg${m.kind === 'tool' ? ' is-tool' : ''}${view.gone.has(m.id) ? ' is-gone' : ''}`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="cs-token-bar is-hot" aria-hidden="true">
          <span style={{ width: `${view.fill}%` }} />
        </div>
      </div>
      <figcaption>
        Strike-through = removed from context. Cache 85%→10% when summarizing at 50% is from the study;
        the message list is a simplified illustration.
      </figcaption>
    </figure>
  );
}
