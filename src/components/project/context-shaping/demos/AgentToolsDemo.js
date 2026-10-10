import React, { useMemo } from 'react';
import { TOOLS, VALIDATION_ERROR, MINI_REPO } from '../data';
import useDemoAutoplay from './useDemoAutoplay';
import DemoTransport, { DemoNarration } from './DemoTransport';
import './Demo.css';

/** Guided tour: grep path first (fails), then structured tools (wins). */
const TOUR = [
  {
    mode: 'grep',
    t: 'grep -n ValidationError **/*.py',
    detail: 'dozens of hits across 19 files (study: 468 lines)',
    say: 'Blind text search. Hits everywhere, with no idea which are definitions vs callers.',
  },
  {
    mode: 'grep',
    t: 'read marshmallow/exceptions.py',
    detail: 'open definition',
    say: 'Opens one file at a time. Context fills with noise.',
  },
  {
    mode: 'grep',
    t: 'edit exceptions.py · fields.py · schema.py…',
    detail: 'rename callers one by one',
    say: 'Edits callers one by one. Easy to miss some.',
  },
  {
    mode: 'grep',
    t: 'grep again… more hits',
    detail: 'context ballooning',
    say: 'Still finding leftovers. The token bill climbs.',
  },
  {
    mode: 'grep',
    t: `turn ${VALIDATION_ERROR.grep.turns}/${VALIDATION_ERROR.grep.turns}: stop`,
    detail: 'step cap; callers still missing',
    say: `Hits the step cap. Callers missed. Hard rename ${VALIDATION_ERROR.grep.wins} in the study.`,
  },
  {
    mode: 'structured',
    t: 'find_references(ValidationError)',
    detail: 'AST-grouped defs / imports / code',
    say: 'Switch tools: AST-aware references group defs, imports, and code.',
  },
  {
    mode: 'structured',
    t: 'rename_symbol(…, dry_run=True)',
    detail: 'preview all sites',
    say: 'Dry-run previews every site before touching code.',
  },
  {
    mode: 'structured',
    t: 'rename_symbol(…, apply=True)',
    detail: 'one mechanical rename',
    say: 'One mechanical rename. No grep thrash.',
  },
  {
    mode: 'structured',
    t: 'run tests · find_references again',
    detail: 'zero leftovers, done',
    say: `Tests green, zero leftovers. Hard rename ${VALIDATION_ERROR.structured.wins} with ~${VALIDATION_ERROR.structured.calls} calls.`,
  },
];

export default function AgentToolsDemo() {
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
    length: TOUR.length,
    stepMs: 1300,
    holdLastMs: 3000,
    loop: true,
  });

  const current = TOUR[idx];
  const mode = current.mode;
  const steps = useMemo(
    () => TOUR.filter((s) => s.mode === mode),
    [mode]
  );
  const localIdx = steps.findIndex((s) => s === current);
  const stats = mode === 'grep' ? VALIDATION_ERROR.grep : VALIDATION_ERROR.structured;
  const callersLeft = mode === 'grep' && localIdx >= steps.length - 1;

  return (
    <figure className="cs-demo" ref={rootRef}>
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">Agent loop · {MINI_REPO.task}</p>
          <span className="cs-demo-badge">simplified replay · study transcript patterns</span>
        </div>

        <DemoNarration>{current.say}</DemoNarration>

        <div className="cs-demo-controls" role="tablist" aria-label="tool setup">
          <button
            type="button"
            className={mode === 'grep' ? 'is-on' : ''}
            onClick={() => goTo(0)}
          >
            grep + edit
          </button>
          <button
            type="button"
            className={mode === 'structured' ? 'is-on' : ''}
            onClick={() => goTo(5)}
          >
            find_references + rename
          </button>
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
            study pass <strong>{mode === 'grep' ? TOOLS.grep.pass : TOOLS.structured.pass}%</strong>
          </span>
          <span className="cs-stat">
            hard task <strong>{stats.wins}</strong>
          </span>
          <span className="cs-stat">
            calls{' '}
            <strong>
              {mode === 'grep'
                ? `~${VALIDATION_ERROR.grep.calls}`
                : `~${VALIDATION_ERROR.structured.calls}`}
            </strong>
          </span>
          <span className="cs-stat">
            peak tokens{' '}
            <strong>
              {mode === 'grep'
                ? VALIDATION_ERROR.grep.tokens.toLocaleString()
                : VALIDATION_ERROR.structured.tokens.toLocaleString()}
            </strong>
          </span>
        </div>

        <div className="cs-replay">
          <div className="cs-replay-log" aria-live="polite">
            {steps.map((s, i) => (
              <div
                key={`${s.mode}-${s.t}`}
                className={`step${i < localIdx ? ' is-done' : ''}${i === localIdx ? ' is-current' : ''}`}
              >
                <div>{s.t}</div>
                <div style={{ opacity: 0.7 }}>{s.detail}</div>
              </div>
            ))}
          </div>
          <div className="cs-replay-meta">
            <span className="cs-stat">
              tour <strong>
                {idx + 1}/{TOUR.length}
              </strong>
            </span>
            <span className={`cs-stat${callersLeft ? '' : ' is-accent'}`}>
              callers <strong>{callersLeft ? 'missed' : 'updated'}</strong>
            </span>
            <span className="cs-stat">
              avg study calls/run{' '}
              <strong>{mode === 'grep' ? TOOLS.grep.calls : TOOLS.structured.calls}</strong>
            </span>
          </div>
        </div>
      </div>
      <figcaption>
        ValidationError hard task in the study: grep {VALIDATION_ERROR.grep.wins}, structured{' '}
        {VALIDATION_ERROR.structured.wins}. Replay is simplified.
      </figcaption>
    </figure>
  );
}
