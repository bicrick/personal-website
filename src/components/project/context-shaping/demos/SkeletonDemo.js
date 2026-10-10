import React, { useMemo, useState } from 'react';
import { LADDER, MINI_REPO, demoTokensForLevel } from '../data';
import './Demo.css';

function renderView(file, levelId) {
  if (levelId === 'L0') return null;
  if (levelId === 'L1') {
    return file.imports.length ? file.imports.join('\n') : '# (no imports)';
  }
  if (levelId === 'L2') {
    const lines = [...file.imports, file.signature].filter(Boolean);
    return lines.join('\n') || '# (no signature)';
  }
  if (levelId === 'L3') {
    const lines = [...file.imports, file.signature, file.docstring].filter(Boolean);
    return lines.join('\n');
  }
  return file.body;
}

export default function SkeletonDemo() {
  const [idx, setIdx] = useState(0);
  const [filePath, setFilePath] = useState(MINI_REPO.files[0].path);
  const level = LADDER[idx];
  const file = MINI_REPO.files.find((f) => f.path === filePath) || MINI_REPO.files[0];
  const tokens = demoTokensForLevel(level.id);
  const view = useMemo(() => renderView(file, level.id), [file, level.id]);

  return (
    <figure className="cs-demo">
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">Skeletonization ladder</p>
          <span className="cs-demo-badge">{MINI_REPO.label}</span>
        </div>

        <div className="cs-slider-wrap">
          <label htmlFor="cs-skel-slider">
            {level.label} · pass rate {level.pass}%
          </label>
          <input
            id="cs-skel-slider"
            type="range"
            min={0}
            max={LADDER.length - 1}
            step={1}
            value={idx}
            onChange={(e) => setIdx(Number(e.target.value))}
            aria-valuetext={level.label}
          />
          <div className="cs-slider-ticks" aria-hidden="true">
            {LADDER.map((l) => (
              <span key={l.id}>{l.short}</span>
            ))}
          </div>
        </div>

        <div className="cs-demo-stats">
          <span className="cs-stat">
            level <strong>{level.id}</strong>
          </span>
          <span className="cs-stat is-accent">
            pass <strong>{level.pass}%</strong>
          </span>
          <span className="cs-stat">
            demo tokens <strong>~{tokens}</strong>
          </span>
        </div>

        <div className="cs-demo-split">
          <ul className="cs-file-list" aria-label="files">
            {MINI_REPO.files.map((f) => (
              <li key={f.path}>
                <button
                  type="button"
                  className={filePath === f.path ? 'is-on' : ''}
                  onClick={() => setFilePath(f.path)}
                >
                  {f.path.split('/').pop()}
                </button>
              </li>
            ))}
          </ul>
          <pre className="cs-code" aria-live="polite">
            {level.id === 'L0'
              ? MINI_REPO.files.map((f) => f.path).join('\n')
              : view}
          </pre>
        </div>

        <div
          className={`cs-token-bar${level.pass >= 61 ? ' is-hot' : ''}`}
          style={{}}
          aria-hidden="true"
        >
          <span style={{ width: `${Math.min(100, (tokens / 620) * 100)}%` }} />
        </div>
      </div>
      <figcaption>
        Drag L0→full on the same mini repo. Pass rates are study numbers; token counts are demo-only.
      </figcaption>
    </figure>
  );
}
