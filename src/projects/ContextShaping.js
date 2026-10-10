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

const READ_RESULTS = [
  { label: 'whole repo', value: 69 },
  { label: 'only the right files', value: 68 },
  { label: 'map + imports', value: 61 },
  { label: 'map, file tree only', value: 45 },
  { label: 'search in a loop', value: 93, hl: true, mood: 'happy' },
];

const FORGET_RESULTS = [
  { label: 'never forget', value: 93, side: '85%' },
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
          The harness is the code around the model: Claude Code, Cursor, Codex, and the rest. Put
          the same model in any of them and it acts differently. Think of the harness as the outfit.
        </p>
        <Lineup />
      </Spread>

      <Spread kicker="what the harness controls">
        <p>
          It decides what goes in the window and what the model can do about it. We can&apos;t
          change the model. We can change what it sees, and how it touches our code.
        </p>
        <Levers />
      </Spread>

      <Spread kicker="lever 1 · what it reads">
        <p>Harnesses show the model your code in one of four ways.</p>
        <ReadStrategies />
      </Spread>

      <Spread kicker="lever 2 · what it can do">
        <p>
          Most agents find code with grep and edit one file at a time. A tool that understands the
          code can do the whole job in one call.
        </p>
        <ToolsStill />
      </Spread>

      <Spread kicker="lever 3 · what it forgets">
        <p>
          Long sessions fill the window, so the harness throws things out. Some summarize, some
          clear old tool output. They disagree on when.
        </p>
        <ForgetStill />
      </Spread>

      <Spread kicker="lever 4 · what it's told">
        <p>Notes loaded up front: house rules, or a procedure for one kind of job.</p>
        <ToldStill />
      </Spread>

      <Spread kicker="the test">
        <p>
          Nobody tests these against each other with the model held still. So I did: one cheap
          model, Claude Haiku 5.5, on 25 multi-file refactors across three Python libraries. 1,632
          graded runs, $28.53.
        </p>
        <p>A run passes only if nothing is missed. Every leftover reference is a missed caller.</p>
        <TaskCard />
      </Spread>

      <Spread kicker="what it reads · result">
        <p>
          More context didn&apos;t help. The whole repo and only the right files scored the same.
          The callers it missed were sitting in the prompt. Letting it search and check its own work
          did help.
        </p>
        <ResultBars title="pass rate, all 25 tasks" rows={READ_RESULTS} />
      </Spread>

      <Spread kicker="what it can do · result">
        <p>
          The hardest task, same model and same loop. Grep drowned in its own search results.
          The rename tool asked where the name was used, got an exact answer, and renamed it.
        </p>
        <p>Across all 25 tasks: 97% vs 93%, and 5.2x cheaper per solve.</p>
        <Duel />
      </Spread>

      <Spread kicker="what it forgets · result">
        <p>
          With a tight 12k budget, summarizing early hurt most. Every summary rewrites the start of
          the prompt, which wipes the prompt cache, so each call after it costs more: $0.0397 per
          solve vs $0.0143 for dropping old output.
        </p>
        <ResultBars
          title="pass rate"
          sideLabel="cache hit"
          rows={FORGET_RESULTS}
          foot="12k-token budget. Never forget ran without one."
        />
      </Spread>

      <Spread kicker="what it's told · result">
        <p>
          The skill file was a small cost win, not an accuracy win. The generic conventions file
          didn&apos;t earn its tokens.
        </p>
        <ResultBars title="pass rate" sideLabel="per solve" rows={TOLD_RESULTS} />
      </Spread>

      <Spread kicker="real harnesses">
        <p>
          I ran real agents on the same tasks and model. The general ones land in the low 90s for
          under half a cent. Aider is built for a human in the loop, so headless it&apos;s no
          verdict on Aider.
        </p>
        <ResultBars title="pass rate" sideLabel="per solve" rows={REAL_RESULTS} />
      </Spread>

      <Spread kicker="stacking it">
        <p>
          Then I stacked the winners: a loop, structured tools, no compaction, the skill file. Five
          seeds on all 25 tasks, against the whole repo in one prompt.
        </p>
        <Headline />
      </Spread>

      <Spread kicker="what i'd take from it">
        <p>Give the model the operation, not the raw materials.</p>
        <p>Let it look things up instead of preloading everything.</p>
        <p>If it has to forget, drop old tool output first, and do it late.</p>
        <p>Before you upgrade the model, look at what your harness is feeding it.</p>
      </Spread>

      <Spread kicker="caveats">
        <p>
          25 small Python refactors I wrote, one model. The stacked harness was picked on the same
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
