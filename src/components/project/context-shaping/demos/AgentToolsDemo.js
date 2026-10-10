import React, { useEffect, useState } from 'react';
import { TOOLS, VALIDATION_ERROR, MINI_REPO } from '../data';
import useReducedMotion from '../../useReducedMotion';
import './Demo.css';

const GREP_STEPS = [
  { t: 'grep -n ValidationError **/*.py', detail: 'dozens of hits across 19 files (study: 468 lines)' },
  { t: 'read marshmallow/exceptions.py', detail: 'open definition' },
  { t: 'edit exceptions.py', detail: 'rename class' },
  { t: 'read fields.py · edit', detail: 'one caller' },
  { t: 'read schema.py · edit', detail: 'one caller' },
  { t: 'read validate.py · edit', detail: 'one caller' },
  { t: 'grep again… more hits', detail: 'context ballooning' },
  { t: `turn ${VALIDATION_ERROR.grep.turns}/${VALIDATION_ERROR.grep.turns} — stop`, detail: 'step cap; callers still missing' },
];

const STRUCT_STEPS = [
  { t: 'find_references(ValidationError)', detail: 'AST-grouped defs / imports / code' },
  { t: 'rename_symbol(…, dry_run=True)', detail: 'preview all sites' },
  { t: 'rename_symbol(…, apply=True)', detail: 'one mechanical rename' },
  { t: 'run tests', detail: 'green' },
  { t: 'find_references(ValidationError)', detail: 'zero leftovers — done' },
];

export default function AgentToolsDemo() {
  const [mode, setMode] = useState('structured');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduce = useReducedMotion();
  const steps = mode === 'grep' ? GREP_STEPS : STRUCT_STEPS;
  const stats = mode === 'grep' ? VALIDATION_ERROR.grep : VALIDATION_ERROR.structured;

  useEffect(() => {
    const len = mode === 'grep' ? GREP_STEPS.length : STRUCT_STEPS.length;
    setStep(reduce ? len - 1 : 0);
    setPlaying(!reduce);
  }, [mode, reduce]);

  useEffect(() => {
    if (!playing || reduce) return undefined;
    const len = mode === 'grep' ? GREP_STEPS.length : STRUCT_STEPS.length;
    if (step >= len - 1) return undefined;
    const id = setTimeout(() => setStep((s) => s + 1), mode === 'grep' ? 700 : 900);
    return () => clearTimeout(id);
  }, [playing, step, mode, reduce]);

  const callersLeft = mode === 'grep' && step >= steps.length - 1;

  return (
    <figure className="cs-demo">
      <div className="cs-demo-panel">
        <div className="cs-demo-head">
          <p className="cs-demo-kicker">Agent loop · {MINI_REPO.task}</p>
          <span className="cs-demo-badge">simplified replay · study transcript patterns</span>
        </div>

        <div className="cs-demo-controls" role="tablist" aria-label="tool setup">
          <button
            type="button"
            className={mode === 'grep' ? 'is-on' : ''}
            onClick={() => setMode('grep')}
          >
            grep + edit
          </button>
          <button
            type="button"
            className={mode === 'structured' ? 'is-on' : ''}
            onClick={() => setMode('structured')}
          >
            find_references + rename
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setPlaying(true);
            }}
          >
            replay
          </button>
        </div>

        <div className="cs-demo-stats">
          <span className="cs-stat is-accent">
            study pass <strong>{mode === 'grep' ? TOOLS.grep.pass : TOOLS.structured.pass}%</strong>
          </span>
          <span className="cs-stat">
            hard task <strong>{stats.wins}</strong>
          </span>
          <span className="cs-stat">
            calls <strong>{mode === 'grep' ? `~${VALIDATION_ERROR.grep.calls}` : `~${VALIDATION_ERROR.structured.calls}`}</strong>
          </span>
          <span className="cs-stat">
            peak tokens <strong>
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
                key={s.t}
                className={`step${i < step ? ' is-done' : ''}${i === step ? ' is-current' : ''}`}
              >
                <div>{s.t}</div>
                <div style={{ opacity: 0.7 }}>{s.detail}</div>
              </div>
            ))}
          </div>
          <div className="cs-replay-meta">
            <span className="cs-stat">
              step <strong>{Math.min(step + 1, steps.length)}/{steps.length}</strong>
            </span>
            <span className={`cs-stat${callersLeft ? '' : ' is-accent'}`}>
              callers <strong>{callersLeft ? 'missed' : 'updated'}</strong>
            </span>
            {mode === 'grep' && (
              <span className="cs-stat">
                avg study calls/run <strong>{TOOLS.grep.calls}</strong>
              </span>
            )}
            {mode === 'structured' && (
              <span className="cs-stat">
                avg study calls/run <strong>{TOOLS.structured.calls}</strong>
              </span>
            )}
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
