import React from 'react';
import { TOOLS } from '../data';
import ContextPanel from '../ring/ContextRing';
import TurnStrip from '../ring/TurnStrip';
import { SCENARIOS, ringFor, fmtTokens, SPLIT_NOTE } from '../ring/runs';
import useDemoAutoplay from './useDemoAutoplay';
import DemoFrame from './DemoFrame';

const GREP = SCENARIOS.agentic;
const AST = SCENARIOS.agentic_tools;
const TURNS = GREP.frames.length;
const AST_LAST = AST.frames.length - 1;
const ZOOM = 150_000;

/** Narration beats keyed by turn index; turns in between keep the last line. */
const BEATS = {
  0: 'Same task, same prompt, same 25-turn cap. Left: grep, read, edit. Right: the same loop with find_references and rename_symbol.',
  1: 'First call back. grep returns raw text matches; find_references returns every hit sorted into definitions, imports and code.',
  2: 'rename_symbol previews the change, then renames every site in one call. The grep agent is still reading files.',
  [AST_LAST]: `Structured agent: tests pass, finish. ${AST.toolCalls} tool calls, peak prompt ${fmtTokens(AST.peak)} tokens. Done.`,
  6: 'The grep agent edits call sites a few dozen at a time. Every edit it sends and every result it gets stays in the prompt.',
  12: `Call ${13}: ${GREP.frames[12].calls} tool calls in, ${fmtTokens(GREP.frames[12].total)} tokens and climbing. Nothing ever leaves.`,
  [TURNS - 1]: `Call 25: step cap. ${GREP.toolCalls} tool calls, a ${fmtTokens(GREP.peak)}-token prompt, ${GREP.missedCallers} callers still missed. 0 for 3 on this task.`,
};

const SAY = [];
for (let t = 0, line = BEATS[0]; t < TURNS; t += 1) {
  line = BEATS[t] ?? line;
  SAY.push(line);
}
const DURATIONS = SAY.map((_, t) => (t in BEATS ? 2600 : 520));

function footer(run, t, onPick) {
  const i = Math.min(t, run.frames.length - 1);
  const done = t >= run.frames.length - 1;
  return (
    <TurnStrip
      cells={run.frames.map(() => ({ fill: 1 }))}
      current={i}
      label="model calls"
      onPick={onPick}
      legend={
        done
          ? run.hitStepCap
            ? `step cap · ${run.toolCalls} tool calls`
            : `finished at call ${run.frames.length} · ${run.toolCalls} tool calls`
          : `call ${i + 1} · ${run.frames[i].calls} tool calls so far`
      }
    />
  );
}

export default function AgentToolsDemo() {
  const auto = useDemoAutoplay({ length: TURNS, durations: DURATIONS, holdLastMs: 3200 });
  const t = auto.idx;

  const rings = [
    ringFor('grep', GREP.frames[t], {
      title: 'grep + read + edit',
      short: 'grep',
      zoom: ZOOM,
      footer: footer(GREP, t, auto.goTo),
    }),
    ringFor('ast', AST.frames[Math.min(t, AST_LAST)], {
      title: 'find_references + rename_symbol',
      short: 'structured',
      zoom: ZOOM,
      footer: footer(AST, t, (i) => auto.goTo(i)),
    }),
  ];

  return (
    <DemoFrame
      auto={auto}
      kicker="Agent loop + tools · same loop, two toolkits"
      badge="real runs · ValidationError task"
      say={SAY[t]}
      stats={[
        { label: 'pass, all tasks', value: `${TOOLS.grep.pass}% → ${TOOLS.structured.pass}%`, accent: true },
        { label: 'cost/solve', value: `$${TOOLS.grep.cost} → $${TOOLS.structured.cost}` },
        { label: 'tool calls/run', value: `${TOOLS.grep.calls} → ${TOOLS.structured.calls}` },
      ]}
      caption={`Both rings are zoomed to the first ${fmtTokens(ZOOM)} of the 1M window so the smaller one stays visible. One real run each on the ValidationError rename (468 lines, 19 files); stats below are main-run averages.`}
    >
      <ContextPanel
        rings={rings}
        focus="toolout"
        notes={{
          toolout: 'Raw grep output lists every matching line, comments and strings included. find_references returns the same hits already grouped, so the agent can act on them in one call.',
          messages: 'For the grep agent this is mostly its own edit calls: each one carries the exact text it searches for and its replacement, and all of them stay in the prompt.',
        }}
        source={`${SPLIT_NOTE} Runs ${GREP.run} (grep) and ${AST.run} (structured).`}
      />
    </DemoFrame>
  );
}
