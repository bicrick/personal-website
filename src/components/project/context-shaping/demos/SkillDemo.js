import React from 'react';
import { SKILL } from '../data';
import ContextPanel from '../ring/ContextRing';
import { PROCEDURE_RUNS, ringFor, fmtTokens, SPLIT_NOTE } from '../ring/runs';
import useDemoAutoplay from './useDemoAutoplay';
import DemoFrame from './DemoFrame';

const RUNS = PROCEDURE_RUNS.runs;
const ZOOM = 1200;
const usd = (n) => `$${n.toFixed(4)}`;

const SKILL_NOTE = (
  <>
    The five steps, in the model’s first message:
    <ol>
      {SKILL.steps.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ol>
  </>
);

const STEPS = [
  {
    run: 'none',
    zoom: null,
    focus: 'messages',
    say: `An agent’s first prompt: system prompt, tool definitions and the task. ${RUNS.none.first.total} tokens, a hairline on a 1M window.`,
    pass: SKILL.noSkill,
    cost: SKILL.costWithout,
  },
  {
    run: 'none',
    zoom: ZOOM,
    focus: 'tools',
    say: `Zoom to the first ${fmtTokens(ZOOM)} tokens. The tool schemas are the biggest fixed cost, resent on every call.`,
    pass: SKILL.noSkill,
    cost: SKILL.costWithout,
  },
  {
    run: 'skill',
    zoom: ZOOM,
    focus: 'procedure',
    say: `Add the five-step refactor skill: ${RUNS.skill.first.seg.procedure} tokens. Pass rate stays at ${SKILL.withSkill}%; cost per solve drops from ${usd(SKILL.costWithout)} to ${usd(SKILL.costWith)}.`,
    pass: SKILL.withSkill,
    cost: SKILL.costWith,
    notes: { procedure: SKILL_NOTE },
  },
  {
    run: 'agentsmd',
    zoom: ZOOM,
    focus: 'procedure',
    say: `Swap in a generic AGENTS.md instead: ${RUNS.agentsmd.first.seg.procedure} tokens, about the same size. ${SKILL.agentsMd}%, and the priciest of the three at ${usd(SKILL.costAgentsMd)}.`,
    pass: SKILL.agentsMd,
    cost: SKILL.costAgentsMd,
    notes: { procedure: 'Repo conventions: where code and tests live, style, keep __all__ in sync, no compatibility shims. True, but not a procedure.' },
  },
  {
    run: 'skill',
    zoom: ZOOM,
    focus: 'procedure',
    say: 'Same size, different content. The specific procedure paid for its tokens; the generic conventions didn’t.',
    pass: SKILL.withSkill,
    cost: SKILL.costWith,
    notes: { procedure: SKILL_NOTE },
  },
];

const LABEL = { none: 'no procedure', skill: 'refactor skill', agentsmd: 'AGENTS.md' };

export default function SkillDemo() {
  const auto = useDemoAutoplay({ length: STEPS.length, stepMs: 2800, holdLastMs: 3200 });
  const step = STEPS[auto.idx];
  const run = RUNS[step.run];

  return (
    <DemoFrame
      auto={auto}
      kicker="Procedural context · skill file vs AGENTS.md"
      badge="real runs · first prompt"
      say={step.say}
      tabs={{
        label: 'procedure',
        items: [
          { id: 'none', label: 'nothing', on: step.run === 'none', onClick: () => auto.goTo(1) },
          { id: 'skill', label: 'refactor skill', on: step.run === 'skill', onClick: () => auto.goTo(2) },
          { id: 'agentsmd', label: 'AGENTS.md', on: step.run === 'agentsmd', onClick: () => auto.goTo(3) },
        ],
      }}
      stats={[
        { label: 'pass, all tasks', value: `${step.pass}%`, accent: true },
        { label: 'cost/solve', value: usd(step.cost) },
      ]}
      caption="A cost win, not an accuracy win. Ring: the first call of one real run per condition on the marshmallow RegistryError rename. Pass and cost: main runs, all tasks."
    >
      <ContextPanel
        rings={[
          ringFor(step.run, run.first, {
            title: LABEL[step.run],
            zoom: step.zoom,
          }),
        ]}
        focus={step.focus}
        notes={step.notes || {}}
        source={`${SPLIT_NOTE} Run ${run.run}.`}
      />
    </DemoFrame>
  );
}
