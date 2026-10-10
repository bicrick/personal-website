import React, { useMemo, useState } from 'react';
import { LAYOUT_MODES, MINI_REPO, demoTokensForLayout } from '../data';
import './Demo.css';

function filesInMode(modeId) {
  if (modeId === 'full') return MINI_REPO.files.map((f) => f.path);
  if (modeId === 'touched') return MINI_REPO.files.filter((f) => f.touched).map((f) => f.path);
  if (modeId === 'skeleton' || modeId === 'skel+tools') {
    return MINI_REPO.files.filter((f) => f.touched).map((f) => f.path);
  }
  // agentic: starts with tree, retrieves on demand — highlight exceptions + fields as "opened"
  return ['marshmallow/exceptions.py', 'marshmallow/fields.py'];
}

function codeForMode(file, modeId) {
  if (modeId === 'full') return file.body;
  if (modeId === 'touched') return file.touched ? file.body : '# not in context';
  if (modeId === 'skeleton' || modeId === 'skel+tools') {
    if (!file.touched) return '# not in context';
    return [...file.imports, file.signature, file.docstring].filter(Boolean).join('\n');
  }
  // agentic: only retrieved files show bodies
  if (file.path === 'marshmallow/exceptions.py' || file.path === 'marshmallow/fields.py') {
    return file.body;
  }
  return '# not retrieved yet';
}

export default function LayoutDemo() {
  const [modeId, setModeId] = useState('full');
  const mode = LAYOUT_MODES.find((m) => m.id === modeId) || LAYOUT_MODES[0];
  const inContext = useMemo(() => new Set(filesInMode(modeId)), [modeId]);
  const [filePath, setFilePath] = useState(MINI_REPO.files[0].path);
  const file = MINI_REPO.files.find((f) => f.path === filePath) || MINI_REPO.files[0];
  const tokens = demoTokensForLayout(modeId);
  const code = codeForMode(file, modeId);
  const highlighted = inContext.has(file.path);

  return (
    <figure className="cs-demo">
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">What enters the context window</p>
          <span className="cs-demo-badge">{MINI_REPO.label}</span>
        </div>

        <div className="cs-demo-controls" role="tablist" aria-label="context layout">
          {LAYOUT_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={modeId === m.id}
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
          <span className="cs-stat">
            demo tokens <strong>~{tokens}</strong>
          </span>
          <span className="cs-stat">
            in window <strong>{inContext.size}/{MINI_REPO.files.length} files</strong>
          </span>
        </div>

        <div className="cs-demo-split">
          <ul className="cs-file-list" aria-label="files in context">
            {MINI_REPO.files.map((f) => {
              const on = inContext.has(f.path);
              return (
                <li key={f.path}>
                  <button
                    type="button"
                    className={`${filePath === f.path ? 'is-on' : ''} ${on ? 'is-in' : 'is-dim'}`}
                    onClick={() => setFilePath(f.path)}
                  >
                    {f.path.split('/').pop()}
                  </button>
                </li>
              );
            })}
          </ul>
          <pre className={`cs-code${highlighted ? '' : ''}`} aria-live="polite">
            {highlighted
              ? code.split('\n').map((line, i) => (
                  <div key={i} className={line.includes('ValidationError') ? 'is-hit' : undefined}>
                    {line || ' '}
                  </div>
                ))
              : code}
          </pre>
        </div>

        <div className="cs-token-bar is-hot" aria-hidden="true">
          <span style={{ width: `${Math.min(100, (tokens / 620) * 100)}%` }} />
        </div>
      </div>
      <figcaption>
        Blue edge = in the window. Pass rates from the study; file set and tokens are a simplified illustration.
      </figcaption>
    </figure>
  );
}
