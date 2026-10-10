import React from 'react';
import ContextPanel from '../ring/ContextRing';
import TurnStrip from '../ring/TurnStrip';
import { SCENARIOS, ringFor, fmtTokens, SPLIT_NOTE } from '../ring/runs';
import useDemoAutoplay from './useDemoAutoplay';
import DemoFrame from './DemoFrame';

const S = SCENARIOS;

const MODES = [
  {
    id: 'full',
    label: 'full repo',
    pass: 69,
    run: S.full,
    frames: S.full.frames,
    focus: 'repo',
    say: () =>
      `Everything in one prompt: ${fmtTokens(S.full.frames[0].total)} tokens before the model writes a word. 69% across all tasks; 0 for 3 on this one.`,
    notes: { repo: 'All 37 Python files. The missed callers were right there in the prompt; the model still had to rewrite every one in a single reply.' },
  },
  {
    id: 'touched',
    label: 'only files needed',
    pass: 68,
    run: S.touched,
    frames: S.touched.frames,
    focus: 'repo',
    say: () =>
      `Only the files the reference solution touches. Barely smaller (${fmtTokens(S.touched.frames[0].total)}), barely different (68%). Knowing where to look wasn’t the problem.`,
    notes: { repo: 'An oracle: the exact files the fix needs, chosen with the answer key. Real harnesses can’t do this.' },
  },
  {
    id: 'skeleton',
    label: 'skeleton',
    pass: 57,
    run: S.skel_L2,
    frames: S.skel_L2.frames,
    focus: 'repo',
    say: (f) =>
      f === 0
        ? `A signature skeleton first (${fmtTokens(S.skel_L2.frames[0].total)}), so the model can pick files…`
        : `…then the skeleton plus every file it picked: ${fmtTokens(S.skel_L2.frames[1].total)}, more than the whole repo. 57%.`,
    notes: { repo: 'Two calls: pick files from the skeleton, then edit with the skeleton and the picked files.' },
  },
  {
    id: 'skel+agent',
    label: 'skeleton + agent',
    pass: 92,
    run: S.skel_retrieval,
    frames: S.skel_retrieval.frames,
    focus: 'toolout',
    say: (f, last) =>
      last
        ? `25 turns later: ${fmtTokens(S.skel_retrieval.peak)}. The skeleton never leaves; the tool outputs pile on top. 92% across all tasks.`
        : `The skeleton up front (${fmtTokens(S.skel_retrieval.frames[0].total)}), then an agent loop that reads what it needs. Watch the ring grow call by call.`,
    notes: {
      repo: `The skeleton is resent on every call: ${fmtTokens(S.skel_retrieval.frames[0].seg.repo)} tokens, 25 times.`,
    },
  },
  {
    id: 'agentic',
    label: 'agentic search',
    pass: 93,
    run: S.agentic,
    frames: S.agentic.frames,
    focus: 'toolout',
    say: (f, last) =>
      last
        ? `Same growth, no skeleton: ${fmtTokens(S.agentic.peak)} at the step cap. 93% across all tasks, but this hard task beat every grep agent. The next section shows why.`
        : `Start nearly empty (${fmtTokens(S.agentic.frames[0].total)}) and search on demand. Tool outputs and the model’s own edits fill the ring turn by turn.`,
    notes: {
      messages: 'Mostly the agent’s own edit calls. Each carries the exact code it searches for and its replacement, and all of them stay in the prompt.',
    },
  },
];

const TIMELINE = MODES.flatMap((mode, m) =>
  mode.frames.map((_, f) => ({ m, f, last: f === mode.frames.length - 1 }))
);
const DURATIONS = TIMELINE.map(({ m, f, last }) => {
  const n = MODES[m].frames.length;
  if (n <= 2) return 2800;
  if (f === 0) return 2200;
  return last ? 2800 : 240;
});
const FIRST = MODES.map((_, m) => TIMELINE.findIndex((t) => t.m === m));

export default function LayoutDemo() {
  const auto = useDemoAutoplay({ length: TIMELINE.length, durations: DURATIONS, holdLastMs: 3000 });
  const { m, f, last } = TIMELINE[auto.idx];
  const mode = MODES[m];
  const agent = mode.frames.length > 2;
  const frame = mode.frames[f];

  const ring = ringFor(mode.id, frame, {
    title: mode.label,
    footer: agent ? (
      <TurnStrip
        cells={mode.frames.map(() => ({ fill: 1 }))}
        current={f}
        label="model calls"
        onPick={(i) => auto.goTo(FIRST[m] + i)}
        legend={`call ${f + 1} of ${mode.frames.length} · 25 is the step cap`}
      />
    ) : null,
  });

  return (
    <DemoFrame
      auto={auto}
      kicker="What enters the context window"
      badge="real runs · ValidationError task"
      say={mode.say(f, last)}
      tabs={{
        label: 'context layout',
        items: MODES.map((x, i) => ({
          id: x.id,
          label: x.label,
          on: i === m,
          onClick: () => auto.goTo(FIRST[i]),
        })),
      }}
      stats={[
        { label: 'pass, all tasks', value: `${mode.pass}%`, accent: true },
        { label: 'this run', value: mode.run.passed ? 'passed' : mode.run.hitStepCap ? 'failed · step cap' : 'failed' },
        { label: 'prompt', value: `${frame.total.toLocaleString()} tokens` },
      ]}
      caption="Each layout fills the same window differently. Rings: one real run per layout on the marshmallow ValidationError rename (hard tier). Pass rates: main runs, all 25 tasks."
    >
      <ContextPanel
        rings={[ring]}
        focus={mode.focus}
        notes={mode.notes}
        source={`${SPLIT_NOTE} Run ${mode.run.run}.`}
      />
    </DemoFrame>
  );
}
