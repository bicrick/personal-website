import React from 'react';
import { COMPACTION } from '../data';
import ContextPanel from '../ring/ContextRing';
import TurnStrip from '../ring/TurnStrip';
import { COMPACTION_RUNS, fmtTokens, SPLIT_NOTE } from '../ring/runs';
import useDemoAutoplay from './useDemoAutoplay';
import DemoFrame from './DemoFrame';

const BUDGET = COMPACTION_RUNS.budget;
const RUNS = COMPACTION_RUNS.policies;

const POLICY = {
  none: {
    marks: [{ at: BUDGET, label: '12k' }],
    start: `No compaction. Every result stays, so the prompt climbs past 12k to ${fmtTokens(RUNS.none.peak)}. But each call begins with the previous call’s prompt, so the reusable prefix (outer arc) keeps pace.`,
    end: 'Done in 9 calls. Across all runs: 93% pass and an 85% cache hit rate.',
  },
  sum50: {
    marks: [{ at: BUDGET * 0.5, label: '50%' }],
    start: 'Summarize at 50%: once a prompt passes 6k, the whole history is replaced by a summary.',
    event: 'Summarized. The prompt shrinks, but the reusable prefix drops to just the system prompt and tools. The next call pays full price.',
    spiral: 'Now the summary alone is over 6k, so every call triggers another summary, each longer than the last.',
    end: 'Step cap: 25 calls, 14 summaries. Across all runs: 79% pass, a 10% cache hit rate, and the highest cost per solve.',
  },
  sum90: {
    marks: [{ at: BUDGET * 0.9, label: '90%' }],
    start: 'Summarize at 90%: wait until 10.8k, so the history is rewritten less often.',
    event: 'Summarized. Fewer rewrites than at 50%, but each one still wipes the reusable prefix.',
    end: 'Two summaries in this run. Across all runs: 88% pass, a 43% cache hit rate.',
  },
  drop: {
    marks: [{ at: BUDGET * 0.5, label: '50%' }],
    start: 'Drop old tool outputs: past 6k, keep the conversation but blank every result except the last two.',
    event: 'Old outputs blanked. The prompt before the first blanked result is still reusable; everything after it is new.',
    end: 'Done in 8 calls with 4 drops. Across all runs: 93% pass at $0.0143 per solve, the best of the three policies, though the cache hit rate is 16%.',
  },
};

const TIMELINE = COMPACTION.flatMap((p, pi) =>
  RUNS[p.id].frames.map((frame, f, all) => ({ pi, f, frame, last: f === all.length - 1 }))
);
const FIRST = COMPACTION.map((_, pi) => TIMELINE.findIndex((s) => s.pi === pi));

function sayFor({ pi, f, frame, last }) {
  const id = COMPACTION[pi].id;
  const p = POLICY[id];
  if (last) return p.end;
  if (id === 'sum50' && f >= 17) return p.spiral;
  if (frame.event) return p.event;
  if (f > 0) {
    const prior = RUNS[id].frames.slice(0, f).some((x) => x.event);
    if (prior) return p.event;
  }
  return p.start;
}

const SAY = TIMELINE.map(sayFor);
const DURATIONS = TIMELINE.map((s, i) => {
  if (s.f === 0 || s.last) return 2600;
  return SAY[i] !== SAY[i - 1] ? 2400 : 650;
});

export default function CompactionDemo() {
  const auto = useDemoAutoplay({ length: TIMELINE.length, durations: DURATIONS, holdLastMs: 3200 });
  const step = TIMELINE[auto.idx];
  const policy = COMPACTION[step.pi];
  const run = RUNS[policy.id];
  const { frame } = step;
  const reused = frame.cached / frame.total;

  const ring = {
    id: policy.id,
    title: policy.label,
    segments: frame.seg,
    reasoning: frame.reasoning,
    capacity: BUDGET,
    capacityLabel: policy.id === 'none' ? '12k (not enforced)' : '12k budget',
    marks: POLICY[policy.id].marks,
    outer: { tokens: frame.cached, kind: 'cache' },
    note: `${Math.round(reused * 100)}% reused`,
    footer: (
      <TurnStrip
        cells={run.frames.map((x) => ({
          fill: x.cached / x.total,
          mark: x.event ? (policy.id === 'drop' ? 'drop' : 'summary') : null,
        }))}
        current={step.f}
        label="model calls"
        onPick={(i) => auto.goTo(FIRST[step.pi] + i)}
        legend="one cell per call · shade = prompt reused from the previous call · tick = compaction"
      />
    ),
  };

  return (
    <DemoFrame
      auto={auto}
      kicker="Compaction · when the window fills"
      badge="real runs · 12k-token budget"
      say={SAY[auto.idx]}
      tabs={{
        label: 'compaction policy',
        items: COMPACTION.map((p, i) => ({
          id: p.id,
          label: p.label,
          on: i === step.pi,
          onClick: () => auto.goTo(FIRST[i]),
        })),
      }}
      stats={[
        { label: 'pass rate', value: `${policy.pass}%`, accent: true },
        { label: 'cache hit rate', value: `${policy.cache}%` },
        { label: 'cost/solve', value: `$${policy.cost.toFixed(4)}` },
        { label: 'this run', value: `${run.steps} calls · ${run.compactions} compactions` },
      ]}
      caption={`Outer arc and cell shading: how much of each prompt is identical to the previous call’s, which is what the prompt cache can reuse. One real run per policy on the marshmallow RegistryError rename; the three compaction policies ran at a 12k-token budget, “none” is the plain grep agent with no budget. Pass, cache and cost: main runs.`}
    >
      <ContextPanel
        rings={[ring]}
        focus={policy.id === 'drop' ? 'toolout' : policy.id === 'none' ? 'toolout' : 'summary'}
        notes={{
          summary: 'Written by the model itself, then sent as the new start of the conversation. A rewritten start means nothing after the system prompt and tools can come from cache.',
          toolout: policy.id === 'drop' ? 'Blanked results stay as a one-line placeholder, so the conversation keeps its shape.' : null,
        }}
        source={`${SPLIT_NOTE} Reused prefix computed by comparing consecutive prompts. Run ${run.run}.`}
      />
    </DemoFrame>
  );
}
