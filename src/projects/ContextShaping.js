import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import {
  Spread,
  Hero,
  ContextPanel,
  TurnStack,
  Levers,
  Lineup,
  ReadStrategies,
  ToolsStill,
  ForgetStill,
  ToldStill,
  TaskCard,
  ResultBars,
  Duel,
  Headline,
} from '../components/project/harness';

const SETTINGS = [
  'let it search, in a loop',
  'tools that do the whole job, not grep',
  'forget late; drop old output first'
  'a short skill for the job, not house rules',
];

const READ_RESULTS = [
  { label: 'whole repo', value: 69 },
  { label: 'only the right files', value: 68 },
  { label: 'map + imports', value: 61 },
  { label: 'map, file tree only', value: 45 },
  { label: 'search in a loop', value: 93, hl: true, mood: 'happy' },
];

const FORGET_RESULTS = [
  { label: 'no cap (baseline)', value: 93, side: '85%' },
  { label: 'summarize at 50%', value: 79, side: '10%', mood: 'tired' },
  { label: 'summarize at 90%', value: 88, side: '43%' },
  { label: 'drop old output', value: 93, side: '16%', hl: true },
];

const TOLD_RESULTS = [
  { label: 'no notes', value: 93, side: '$0.0085' },
  { label: 'refactor skill', value: 93, side: '$0.0080', hl: true },
  { label: 'AGENTS.md', value: 91, side: '$0.0092' },
];

const REAL_RESULTS = [
  { label: 'my stacked harness', value: 100, side: '$0.0017', hl: true, mood: 'happy', outfit: 'harness' },
  { label: 'OpenCode', logo: 'opencode', outfit: 'opencode', value: 94, side: '$0.0043' },
  { label: 'mini-swe-agent', logo: 'mini', outfit: 'mini', value: 94, side: '$0.0031' },
  { label: 'Claude Code', logo: 'claude', mood: 'open', value: 91, side: '$0.0048' },
  { label: 'whole repo', value: 64, side: '$0.0653', mood: 'tired' },
  { label: 'Aider, headless', logo: 'aider', outfit: 'aider', value: 18, side: '$0.16' },
];

function ContextShaping() {
  return (
    <ProjectDetail
      title="is your harness making your model dumber?"
      date="October 2026"
      backHref="/"
      backLabel="home"
      linkHref="https://github.com/bicrick/context-shaping"
      linkLabel="view repo"
    >
      <Hero />

      <Spread>
        <p>
          You can&apos;t change the model. You can change what it sees, and how it touches your
          code. That part is the harness. This is a guide to it, and to what happened when I tested
          it.
        </p>
      </Spread>

      <Spread kicker="the context window">
        <p>
          A model never sees your repo. It sees one thing: its context window. Everything it knows
          about your task has to fit in there.
        </p>
        <p>
          This is mine, from the Claude Code app. Blue is the conversation. Everything else was
          loaded before I typed a word.
        </p>
        <ContextPanel />
      </Spread>

      <Spread kicker="every turn">
        <p>
          The model has no memory between turns. Every time it calls a tool, the whole window goes
          back in, plus the new result. It hauls the full cart, every step.
        </p>
        <TurnStack />
      </Spread>

      <Spread kicker="the harness">
        <p>
          The harness is the code around the model: Claude Code, Cursor, Codex and the rest. Put
          the same model in any of them and it behaves differently. The harness is the outfit.
        </p>
        <Lineup />
      </Spread>

      <Spread kicker="four levers">
        <p>
          Every harness sets the same four levers. Together they decide what lands in the window,
          and what the model can do about it.
        </p>
        <Levers />
      </Spread>

      <Spread kicker="the test">
        <p>
          I couldn&apos;t find anyone testing these levers against each other on the same model.
          So I took one cheap model and changed only the harness.
        </p>
        <p>A run passes only if nothing is missed. Every leftover reference is a missed caller.</p>
        <TaskCard />
      </Spread>

      <Spread kicker="lever 1 · what it reads">
        <p>Harnesses show the model your code in one of four ways.</p>
        <ReadStrategies />
        <p>
          More context didn&apos;t help. The whole repo and only the right files scored the same;
          the callers it missed were sitting right there in the prompt. Searching in a loop, and
          checking its own work, did.
        </p>
        <ResultBars title="pass rate, all 25 tasks" rows={READ_RESULTS} />
      </Spread>

      <Spread kicker="lever 2 · what it can do">
        <p>
          Most agents find code with grep and edit one file at a time. A tool that understands the
          code can do the whole job in one call.
        </p>
        <ToolsStill />
        <p>
          On the hardest task, grep drowned in its own search results. The rename tool asked where
          the name was used and renamed it. Across all 25 tasks: 97% vs 93%, and 5.2x cheaper per
          solve.
        </p>
        <Duel />
      </Spread>

      <Spread kicker="lever 3 · what it forgets">
        <p>
          Long sessions fill the window, so the harness throws things out. Some summarize, some
          clear old tool output, and they disagree on when.
        </p>
        <ForgetStill />
        <p>
          With the window capped at 12k tokens, summarizing early hurt most. Each summary rewrites
          the start of the prompt, which wipes the prompt cache, so every call after it costs more.
        </p>
        <ResultBars
          title="pass rate, 12k-token cap"
          sideLabel="cache hit"
          rows={FORGET_RESULTS}
          foot="Per solve: $0.0397 summarizing at 50%, $0.0143 dropping old output."
        />
      </Spread>

      <Spread kicker="lever 4 · what it’s told">
        <p>Notes loaded up front: house rules, or a procedure for one kind of job.</p>
        <ToldStill />
        <p>
          The skill was a small cost win, not an accuracy win. The generic conventions file
          didn&apos;t earn its tokens.
        </p>
        <ResultBars title="pass rate" sideLabel="per solve" rows={TOLD_RESULTS} />
      </Spread>

      <Spread kicker="real harnesses">
        <p>
          Same tasks, same model, in real harnesses. The outfits from earlier land in the low 90s
          for under half a cent. Aider is built for a human in the loop, so running it headless is
          no verdict on Aider.
        </p>
        <ResultBars title="pass rate" sideLabel="per solve" rows={REAL_RESULTS} />
      </Spread>

      <Spread kicker="all four levers">
        <p>
          Then I set every lever to its winner and ran five seeds on all 25 tasks, against the
          whole repo in one prompt.
        </p>
        <Headline />
      </Spread>

      <Spread kicker="the takeaway">
        <Levers settings={SETTINGS} mood="happy" outfit="harness" />
        <p>Before you upgrade the model, look at what your harness is feeding it.</p>
      </Spread>

      <Spread kicker="caveats">
        <p>
          25 small Python refactors I wrote, one model. The winning setup was picked on the same
          tasks it was tested on, so 100% is optimistic. Every task, run and transcript is at{' '}
          <a href="https://github.com/bicrick/context-shaping" target="_blank" rel="noopener noreferrer">
            github.com/bicrick/context-shaping
          </a>
          .
        </p>
      </Spread>
    </ProjectDetail>
  );
}

export default ContextShaping;
