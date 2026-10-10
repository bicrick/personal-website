import React from 'react';
import { LADDER } from '../data';
import ContextPanel from '../ring/ContextRing';
import { SCENARIOS, ringFor, fmtTokens, SPLIT_NOTE } from '../ring/runs';
import useDemoAutoplay from './useDemoAutoplay';
import DemoFrame from './DemoFrame';

const key = (id) => (id === 'full' ? 'full' : `skel_${id}`);
const pick = (id) => SCENARIOS[key(id)].frames[0];
const edit = (id) => SCENARIOS[key(id)].frames[1];

const SAY = {
  L0: `File tree only: ${fmtTokens(pick('L0').total)} tokens, a sliver. The model can see file names but not who imports what. 45%.`,
  L1: `Add imports: ${fmtTokens(pick('L1').total)} tokens. Now it can see ValidationError flowing between modules. The one real jump, to 61%.`,
  L2: `Add signatures: ${fmtTokens(pick('L2').total)} tokens, 11× the imports level, and the pass rate dips to 57%.`,
  L3: `Add docstrings: ${fmtTokens(pick('L3').total)} tokens. Still no better than imports alone (59%).`,
  full: `The whole repo: ${fmtTokens(pick('full').total)} tokens, a fifth of the window. The best single shot at 69%, and still far from the agents.`,
};

const STEPS = LADDER.map((level) => {
  const next = edit(level.id);
  return {
    level,
    ring: ringFor(level.id, pick(level.id), {
      title: level.label,
      outer: next ? { tokens: next.total, kind: 'ghost' } : null,
    }),
    notes: {
      repo: next
        ? `This is the prompt the model picks files from. The dashed outer arc is the prompt it edited from next: the skeleton plus the files it picked, ${next.total.toLocaleString()} tokens.`
        : 'Every Python file in marshmallow in one prompt. No picking step, no second call.',
    },
  };
});

export default function SkeletonDemo() {
  const auto = useDemoAutoplay({ length: STEPS.length, stepMs: 2600, holdLastMs: 3000 });
  const step = STEPS[auto.idx];

  return (
    <DemoFrame
      auto={auto}
      kicker="Skeletonization ladder · repo context, L0 → full"
      badge="real runs · ValidationError task"
      say={SAY[step.level.id]}
      caption="Imports were the only level that helped. Ring: the marshmallow ValidationError rename (hard tier), one run per level, on Haiku 5.5’s 1M window. Pass rates: main runs, all 25 tasks."
    >
      <div className="cs-ladder-layout">
        <ContextPanel
          rings={[step.ring]}
          focus="repo"
          notes={step.notes}
          source={`${SPLIT_NOTE} Run ${SCENARIOS[key(step.level.id)].run}.`}
        />
        <div className="cs-passbars" role="group" aria-label="pass rate by level, all 25 tasks">
          <p className="cs-passbars-title">pass rate, all 25 tasks · tokens on the ring</p>
          {STEPS.map((s, i) => (
            <button
              key={s.level.id}
              type="button"
              aria-pressed={i === auto.idx}
              className={`cs-passbar${i === auto.idx ? ' is-on' : ''}${i > auto.idx ? ' is-next' : ''}`}
              onClick={() => auto.goTo(i)}
            >
              <span className="cs-passbar-label">{s.level.label}</span>
              <span className="cs-passbar-track">
                <span style={{ width: `${s.level.pass}%` }} />
              </span>
              <span className="cs-passbar-val">{s.level.pass}%</span>
              <span className="cs-passbar-tok">{fmtTokens(pick(s.level.id).total)}</span>
            </button>
          ))}
        </div>
      </div>
    </DemoFrame>
  );
}
