import React, { useMemo } from 'react';
import { LADDER, MINI_REPO, demoTokensForLevel } from '../data';
import useDemoAutoplay from './useDemoAutoplay';
import DemoTransport, { DemoNarration } from './DemoTransport';
import './Demo.css';

const NARRATION = {
  L0: 'The model only sees file names. It can’t tell who calls what.',
  L1: 'Imports land — now it can see ValidationError flow between modules. First real jump (45%→61%).',
  L2: 'Signatures add shape without bodies. Pass dips a bit while tokens climb.',
  L3: 'Docstrings add intent. Still far cheaper than shipping every line.',
  full: 'Every line ships. Tokens balloon for only a few more points — structure beat volume.',
};

function fileChunk(file, levelId) {
  if (levelId === 'L0') return null;
  if (levelId === 'L1') {
    return file.imports.length ? file.imports.join('\n') : null;
  }
  if (levelId === 'L2') {
    const lines = [...file.imports, file.signature].filter(Boolean);
    return lines.length ? lines.join('\n') : null;
  }
  if (levelId === 'L3') {
    const lines = [...file.imports, file.signature, file.docstring].filter(Boolean);
    return lines.length ? lines.join('\n') : null;
  }
  return file.body;
}

function renderLadderView(levelId) {
  if (levelId === 'L0') {
    return MINI_REPO.files.map((f) => f.path).join('\n');
  }
  return MINI_REPO.files
    .map((f) => {
      const chunk = fileChunk(f, levelId);
      if (!chunk) return null;
      return `# ${f.path}\n${chunk}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

export default function SkeletonDemo() {
  const {
    rootRef,
    idx,
    playing,
    reduce,
    pause,
    play,
    replay,
    stepNext,
    stepPrev,
    goTo,
  } = useDemoAutoplay({
    length: LADDER.length,
    stepMs: 1500,
    holdLastMs: 2600,
    loop: true,
  });

  const level = LADDER[idx];
  const tokens = demoTokensForLevel(level.id);
  const view = useMemo(() => renderLadderView(level.id), [level.id]);
  const tokenPct = Math.min(100, (tokens / 620) * 100);
  const sweetSpot = level.id === 'L1';

  return (
    <figure className="cs-demo" ref={rootRef}>
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">Skeletonization ladder</p>
          <span className="cs-demo-badge">{MINI_REPO.label}</span>
        </div>

        <DemoNarration>{NARRATION[level.id]}</DemoNarration>

        <div className="cs-ladder-rail" role="tablist" aria-label="skeleton level">
          {LADDER.map((l, i) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              className={`cs-ladder-step${i === idx ? ' is-on' : ''}${i < idx ? ' is-done' : ''}`}
              onClick={() => goTo(i)}
            >
              {l.short}
            </button>
          ))}
        </div>

        <DemoTransport
          playing={playing}
          reduce={reduce}
          onReplay={replay}
          onPause={pause}
          onPlay={play}
          onPrev={stepPrev}
          onNext={stepNext}
        />

        <div className="cs-demo-stats">
          <span className="cs-stat">
            level <strong>{level.id}</strong>
          </span>
          <span className={`cs-stat${sweetSpot ? ' is-accent' : ''}`}>
            pass <strong>{level.pass}%</strong>
          </span>
          <span className="cs-stat">
            demo tokens <strong>~{tokens}</strong>
          </span>
        </div>

        <div className="cs-demo-split cs-demo-split--ladder">
          <ul className="cs-file-list cs-file-list--static" aria-label="mini repo files">
            {MINI_REPO.files.map((f) => (
              <li key={f.path}>
                <span className="is-in">{f.path.split('/').pop()}</span>
              </li>
            ))}
          </ul>
          <pre
            key={level.id}
            className={`cs-code cs-code--morph${reduce ? '' : ' is-anim'}`}
          >
            {view}
          </pre>
        </div>

        <div
          className={`cs-token-bar${sweetSpot || level.pass >= 61 ? ' is-hot' : ''}`}
          aria-hidden="true"
        >
          <span style={{ width: `${tokenPct}%` }} />
        </div>
      </div>
      <figcaption>
        The model needs structure (imports / signatures), not every line — past the first level,
        more detail mostly adds tokens. Pass rates from the study; token counts and mini-repo are
        a simplified illustration.
      </figcaption>
    </figure>
  );
}
