import React, { useState } from 'react';
import { HANDS } from './scenarios';

function Steps({ run, scenario }) {
  if (!run || !scenario) return null;
  return (
    <ol className="sqd-steps">
      {scenario.steps.slice(0, run.step).map((label, i) => {
        const active = !run.done && i === run.step - 1;
        return (
          <li key={label} className={active ? 'is-active' : 'is-done'}>
            <span className="sqd-step-dot" aria-hidden="true" />
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Session({ run, typed, scenario }) {
  if (!run && !typed) {
    return (
      <p className="sqd-empty">
        Pick a request below. The orchestrator plans the paper, lays out regions,
        generates them in parallel, then writes top to bottom.
      </p>
    );
  }
  if (!run) return null;
  return (
    <div className="sqd-session">
      <div className="sqd-msg sqd-msg-user">{run.prompt}</div>
      <Steps run={run} scenario={scenario} />
      {run.done && scenario ? <div className="sqd-msg sqd-msg-bot">{scenario.reply}</div> : null}
    </div>
  );
}

function PlanView({ scenario }) {
  if (!scenario) {
    return <p className="sqd-empty">No plan yet. Run a scenario to peek at the planner output.</p>;
  }
  const raw = JSON.stringify(scenario.plan, null, 2);
  return (
    <div className="sqd-patch">
      <pre>{raw}</pre>
      <p className="sqd-patch-note">Planner JSON for this run. Regions and paper choice are baked.</p>
    </div>
  );
}

export default function SidePanel({
  scenarios,
  scenarioId,
  scenario,
  run,
  typed,
  working,
  wireOn,
  setWireOn,
  handId,
  setHand,
  onPick,
  onReplay,
  penProgress,
  scrubPen,
  stage,
}) {
  const [tab, setTab] = useState('session');

  return (
    <aside className="sqd-panel" aria-label="Scribe side panel">
      <div className="sqd-panel-head">
        <span className="sqd-panel-mark" aria-hidden="true">✎</span>
        <span className="sqd-panel-name">scribe</span>
        <span className="sqd-panel-pill">orchestrator · local</span>
      </div>

      <div className="sqd-tabs" role="tablist">
        {['session', 'plan'].map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            className={tab === name ? 'is-on' : ''}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="sqd-body">
        {tab === 'session' ? (
          <Session run={run} typed={typed} scenario={scenario} />
        ) : (
          <PlanView scenario={scenario} />
        )}
      </div>

      <div className="sqd-controls" aria-label="Playback controls">
        <label className="sqd-toggle">
          <input
            type="checkbox"
            checked={wireOn}
            onChange={(e) => setWireOn(e.target.checked)}
          />
          <span>wireframe</span>
        </label>
        <button type="button" className="sqd-replay" disabled={!scenario || working} onClick={onReplay}>
          replay pen
        </button>
        <label className="sqd-scrub">
          <span>pen</span>
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round((penProgress || 0) * 1000)}
            disabled={!scenario || stage === 'idle' || stage === 'typing' || stage === 'plan'}
            onChange={(e) => scrubPen(Number(e.target.value) / 1000)}
          />
        </label>
      </div>

      <div className="sqd-hands" role="group" aria-label="Handwriting style">
        {HANDS.map((h) => (
          <button
            key={h.id}
            type="button"
            className={handId === h.id ? 'is-current' : ''}
            disabled={!scenario}
            onClick={() => setHand(h.id)}
          >
            {h.label}
          </button>
        ))}
      </div>

      <div className="sqd-chips" role="group" aria-label="Example requests">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            className={scenarioId === s.id ? 'is-current' : ''}
            disabled={working}
            onClick={() => {
              setTab('session');
              onPick(s.id);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={`sqd-input${typed ? ' is-typing' : ''}`}>
        <span className="sqd-input-caret" aria-hidden="true">{'>'}</span>
        <span className="sqd-input-text">
          {typed || <em>describe the page you want written</em>}
        </span>
      </div>
    </aside>
  );
}
