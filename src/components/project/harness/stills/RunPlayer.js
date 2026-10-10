import React, { useEffect, useState } from 'react';
import Critter from '../Critter';
import { CcWindow, Transcript } from '../cc';
import useInView from '../useInView';
import useReducedMotion from '../../useReducedMotion';

// One real run, step by step: the structured-tools agent on the hardest
// task (run 7e5ff731). Window sizes are each model call's prompt,
// rebuilt from the run's logged token usage, so treat them as close, not
// exact.
const STEPS = [
  {
    caption: 'The harness builds the first window: system prompt, tool definitions, the task.',
    lines: [{ kind: 'user', text: 'Rename ValidationError to SchemaValidationError. Update every reference. No alias.' }],
    window: [['c-sys', 3.0]],
  },
  {
    caption: 'Turn 1. The model asks where the name is used, and previews the rename.',
    lines: [
      { kind: 'call', text: 'find_references("ValidationError")' },
      { kind: 'out', text: '468 references, sorted: 1 definition, 12 imports, …' },
      { kind: 'call', text: 'rename_symbol(→ SchemaValidationError, dry_run)' },
      { kind: 'out', text: 'would change 19 files' },
    ],
    window: [['c-sys', 3.0], ['c-result', 2.5]],
  },
  {
    caption: 'Turn 2. The whole window goes back in. It applies the rename and checks for leftovers.',
    lines: [
      { kind: 'call', text: 'rename_symbol(→ SchemaValidationError)' },
      { kind: 'out', text: 'renamed 468 lines in 19 files' },
      { kind: 'call', text: 'grep("\\bValidationError\\b")' },
      { kind: 'out', text: 'no matches' },
    ],
    window: [['c-sys', 3.0], ['c-result', 2.5], ['c-result', 0.4]],
  },
  {
    caption: 'Turn 3. Runs the tests.',
    lines: [
      { kind: 'call', text: 'run_tests()' },
      { kind: 'out', text: 'PASSED · 1,190 tests' },
    ],
    window: [['c-sys', 3.0], ['c-result', 2.5], ['c-result', 0.4], ['c-result', 2.3]],
  },
  {
    caption: 'Turn 4. Done. Four model calls; the window never passed about 8k tokens.',
    lines: [{ kind: 'call', text: 'finish()' }],
    window: [['c-sys', 3.0], ['c-result', 2.5], ['c-result', 0.4], ['c-result', 2.3]],
  },
  {
    caption: 'Then the grader, which the model never sees.',
    lines: [],
    window: [['c-sys', 3.0], ['c-result', 2.5], ['c-result', 0.4], ['c-result', 2.3]],
    grade: true,
  },
];
const SCALE = 10;

export default function RunPlayer() {
  const { ref, on } = useInView();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!on || !playing || reduce) return undefined;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), step === STEPS.length - 1 ? 4200 : 2400);
    return () => clearTimeout(t);
  }, [on, playing, reduce, step]);

  const go = (s) => {
    setPlaying(false);
    setStep(Math.max(0, Math.min(STEPS.length - 1, s)));
  };

  const cur = STEPS[step];
  const shown = STEPS.slice(0, step + 1).flatMap((s) => s.lines);
  const mark = cur.grade ? <span className="hs-ok">✓</span> : <span className="rp-pending">○</span>;
  const total = cur.window.reduce((a, [, v]) => a + v, 0);

  return (
    <div ref={ref} className="rp">
      <div className="rp-caption" key={step}>
        <span className="rp-step">{step === STEPS.length - 1 ? 'grade' : step === 0 ? 'start' : `turn ${step}`}</span>
        {cur.caption}
      </div>
      <div className="rp-body">
        <CcWindow title="structured agent · hardest task" meta="Haiku 5.5" className="rp-term">
          <Transcript lines={shown} />
          <div className="rp-window">
            <div className="rp-window-head">
              <span>context window</span>
              <span>≈ {total.toFixed(1)}k tokens</span>
            </div>
            <div className="rp-window-bar">
              {cur.window.map(([tone, v], k) => (
                <span key={k} className={`hs-seg ${tone}`} style={{ width: `${(v / SCALE) * 100}%` }} />
              ))}
            </div>
          </div>
        </CcWindow>
        <div className={`rp-grade${cur.grade ? ' is-on' : ''}`}>
          <div className="hs-label">grader</div>
          <div className="rp-check">{mark} tests pass</div>
          <div className="rp-check">{mark} 0 references to ValidationError</div>
          <div className="rp-check">{mark} import check</div>
          <div className="rp-pass">
            <Critter className="rp-critter" mood={cur.grade ? 'happy' : 'open'} hop={cur.grade} />
            <span>{cur.grade ? 'pass' : 'waiting…'}</span>
          </div>
        </div>
      </div>
      <div className="rp-controls">
        <button type="button" onClick={() => go(step - 1)} aria-label="previous step">←</button>
        <button type="button" onClick={() => setPlaying((p) => !p)}>{playing ? 'pause' : 'play'}</button>
        <button type="button" onClick={() => go(step + 1)} aria-label="next step">→</button>
        <div className="rp-dots">
          {STEPS.map((s, k) => (
            <button
              key={k}
              type="button"
              className={`rp-dot${k === step ? ' is-on' : ''}${k < step ? ' is-done' : ''}`}
              onClick={() => go(k)}
              aria-label={`step ${k + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
