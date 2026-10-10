import React from 'react';

// Shared bits that mimic the Claude Code app: the dark window, the
// context bar, and the terminal transcript.

export function CcWindow({ title, meta, children, className = '' }) {
  return (
    <div className={`cc-window ${className}`}>
      {(title || meta) && (
        <div className="cc-head">
          <span className="cc-title">{title}</span>
          {meta && <span className="cc-meta">{meta}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

// segments: [{ tone, value }] in tokens; total is the window size.
export function CcBar({ segments, total, className = '' }) {
  return (
    <div className={`cc-bar ${className}`}>
      {segments.map((seg, i) => (
        <span
          key={i}
          className={`cc-bar-seg ${seg.tone}`}
          style={{ width: `${(seg.value / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

// lines: [{ kind: 'user' | 'call' | 'out' | 'gap' | 'say', text, ok }]
export function Transcript({ lines }) {
  return (
    <div className="cc-term">
      {lines.map((line, i) => {
        if (line.kind === 'user') {
          return <div key={i} className="cc-line is-user"><span className="cc-gt">&gt;</span> {line.text}</div>;
        }
        if (line.kind === 'call') {
          return (
            <div key={i} className="cc-line is-call">
              <span className={`cc-dot${line.ok === false ? ' is-bad' : ''}`}>⏺</span> {line.text}
            </div>
          );
        }
        if (line.kind === 'out') {
          return <div key={i} className="cc-line is-out"><span className="cc-elbow">⎿</span> {line.text}</div>;
        }
        if (line.kind === 'say') {
          return <div key={i} className="cc-line is-say"><span className="cc-dot is-say">⏺</span> {line.text}</div>;
        }
        return <div key={i} className="cc-line is-gap">{line.text}</div>;
      })}
    </div>
  );
}

export const fmtK = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 1 : 1).replace(/\.0$/, '')}k` : `${n}`);
