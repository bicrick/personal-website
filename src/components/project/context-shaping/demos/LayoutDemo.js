import React, { useMemo } from 'react';
import { LAYOUT_MODES, MINI_REPO, demoTokensForLayout } from '../data';
import useDemoAutoplay from './useDemoAutoplay';
import DemoTransport, { DemoNarration } from './DemoTransport';
import './Demo.css';

const NARRATION = {
  full: 'Everything dumped in. Most tokens, and still 69%: the missed callers were right there in the prompt.',
  touched: 'Only the files that change. Knowing where to look didn’t help (68%). Still one shot to get every edit right.',
  skeleton: 'Signatures only, no agent. Cheap, but the model can’t fetch what it’s missing (57%).',
  'skel+tools': 'Skeleton plus a loop that retrieves on demand. Pass jumps to 92%.',
  agentic: 'Search when needed, open what you need. 93%: exploring beats stuffing the window.',
};

function filesInMode(modeId) {
  if (modeId === 'full') return MINI_REPO.files.map((f) => f.path);
  if (modeId === 'touched') return MINI_REPO.files.filter((f) => f.touched).map((f) => f.path);
  if (modeId === 'skeleton' || modeId === 'skel+tools') {
    return MINI_REPO.files.filter((f) => f.touched).map((f) => f.path);
  }
  return ['marshmallow/exceptions.py', 'marshmallow/fields.py'];
}

function codeForMode(file, modeId) {
  if (modeId === 'full') return file.body;
  if (modeId === 'touched') return file.touched ? file.body : '# not in context';
  if (modeId === 'skeleton' || modeId === 'skel+tools') {
    if (!file.touched) return '# not in context';
    return [...file.imports, file.signature, file.docstring].filter(Boolean).join('\n');
  }
  if (file.path === 'marshmallow/exceptions.py' || file.path === 'marshmallow/fields.py') {
    return file.body;
  }
  return '# not retrieved yet';
}

function focusFile(modeId) {
  if (modeId === 'agentic') return 'marshmallow/exceptions.py';
  return MINI_REPO.files.find((f) => f.touched)?.path || MINI_REPO.files[0].path;
}

export default function LayoutDemo() {
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
    length: LAYOUT_MODES.length,
    stepMs: 1700,
    holdLastMs: 2800,
    loop: true,
  });

  const mode = LAYOUT_MODES[idx];
  const modeId = mode.id;
  const inContext = useMemo(() => new Set(filesInMode(modeId)), [modeId]);
  const filePath = focusFile(modeId);
  const file = MINI_REPO.files.find((f) => f.path === filePath) || MINI_REPO.files[0];
  const tokens = demoTokensForLayout(modeId);
  const code = codeForMode(file, modeId);
  const highlighted = inContext.has(file.path);

  return (
    <figure className="cs-demo" ref={rootRef}>
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">What enters the context window</p>
          <span className="cs-demo-badge">{MINI_REPO.label}</span>
        </div>

        <DemoNarration>{NARRATION[modeId]}</DemoNarration>

        <div className="cs-demo-controls" role="tablist" aria-label="context layout">
          {LAYOUT_MODES.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={modeId === m.id}
              className={modeId === m.id ? 'is-on' : ''}
              onClick={() => goTo(i)}
            >
              {m.label}
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
          <span className="cs-stat is-accent">
            pass <strong>{mode.pass}%</strong>
          </span>
          <span className="cs-stat">
            demo tokens <strong>~{tokens}</strong>
          </span>
          <span className="cs-stat">
            in window <strong>
              {inContext.size}/{MINI_REPO.files.length} files
            </strong>
          </span>
        </div>

        <div className="cs-demo-split">
          <ul className="cs-file-list" aria-label="files in context">
            {MINI_REPO.files.map((f) => {
              const on = inContext.has(f.path);
              return (
                <li key={f.path}>
                  <span
                    className={`cs-file-static${filePath === f.path ? ' is-on' : ''}${
                      on ? ' is-in' : ' is-dim'
                    }`}
                  >
                    {f.path.split('/').pop()}
                  </span>
                </li>
              );
            })}
          </ul>
          <pre key={modeId} className={`cs-code${reduce ? '' : ' cs-code--morph is-anim'}`}>
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
        Blue edge = in the window. Pass rates from the study; file set and tokens are a simplified
        illustration.
      </figcaption>
    </figure>
  );
}
