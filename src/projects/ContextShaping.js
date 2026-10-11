import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import {
  Spread,
  Hero,
  ContextPanel,
  TurnStack,
  Lineup,
  LeverBoard,
  RunPlayer,
  ReadStrategies,
  ToolsStill,
  ForgetStill,
  ToldStill,
  SwePassRate,
  SweCostScatter,
  SweTokens,
  SweRig,
  SweOverlap,
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
          The harness is everything around the model. Claude Code, Cursor, OpenCode and Aider can
          all run the same Claude model. Same model inside, different outfit.
        </p>
        <Lineup />
      </Spread>

      <Spread kicker="four levers">
        <p>
          Every harness makes the same four choices. Each one is a lever with a few settings. Pick
          a harness to see how it sets them.
        </p>
        <LeverBoard mode="harness" />
        <p>
          Codex and Gemini CLI run their own models, so you can&apos;t put Claude in them. They
          still have to set the same four levers.
        </p>
      </Spread>

      <Spread kicker="the question">
        <p>
          If the model never changes, how much can the levers alone move the result? And which
          setting wins on each one?
        </p>
      </Spread>

      <Spread kicker="the experiment">
        <p>
          One lever at a time. Everything else stays at a plain baseline: search as it goes, grep
          and edit, forget nothing, no notes. Pick a lever to see what I tried on it.
        </p>
        <LeverBoard mode="experiment" />
      </Spread>

      <Spread kicker="the tasks">
        <p>
          The model is always Claude Haiku 5.5. The tasks are multi-file refactors, like renaming a
          class used all over a codebase. You either update every reference or you don&apos;t, so a
          miss is easy to count.
        </p>
        <TaskCard />
      </Spread>

      <Spread kicker="one run">
        <p>
          Here&apos;s a real run on the hardest task, the way the harness sees it. Watch the window
          grow with each turn, then the grader decide.
        </p>
        <RunPlayer />
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

      <Spread kicker="all four levers, stacked">
        <p>
          Then I set every lever to its winner and ran five seeds on all 25 tasks, against the
          whole repo in one prompt.
        </p>
        <Headline />
        <p>
          But those were 25 refactors I wrote myself, and I picked the winners on the same tasks.
          The real question is whether any of this shows up in harnesses people actually use, on
          bugs nobody wrote for them.
        </p>
      </Spread>

      <Spread kicker="the real test">
        <p>
          So I took 49 real GitHub bugs from SWE-bench Verified and ran them through six
          off-the-shelf harnesses. Same model in all of them. Everything except the harness was
          held fixed.
        </p>
        <SweRig />
      </Spread>

      <Spread kicker="finding 1 · the harness moves the score">
        <p>
          Same model, same bugs, and the pass rate ran from 61% to 78%. That&apos;s 17 points from
          the outfit alone.
        </p>
        <SwePassRate />
        <p>
          Honest version: 49 tasks is not many. The ranges all overlap, so I wouldn&apos;t bet on
          the order in the middle. Top versus bottom is the only gap I&apos;d stand behind.
        </p>
      </Spread>

      <Spread kicker="finding 2 · cost moves way more">
        <p>
          Accuracy spread 17 points. Cost spread 15×. Most harnesses land around a cent per solved
          bug. Aider lands at eight and a half, and solves the fewest.
        </p>
        <SweCostScatter />
      </Spread>

      <Spread kicker="finding 3 · it’s the cache">
        <p>
          Aider isn&apos;t sending the most tokens. It rebuilds the front of the prompt with repo
          maps and whole files, so almost nothing comes from cache. That&apos;s lever 3 again:
          rewrite the start of the prompt and you pay full price every turn.
        </p>
        <SweTokens />
        <p>
          And lever 1: mini-swe-agent, the barest loop here, just searches as it goes. It solves
          about as many as Claude Code on less than half the tokens.
        </p>
      </Spread>

      <Spread kicker="finding 4 · the race is at the margin">
        <p>
          Most of these bugs don&apos;t care which harness you use. All six solved the same 26,
          and none could touch 8. Everything above happened in the 15 in between.
        </p>
        <SweOverlap />
      </Spread>

      <Spread kicker="the takeaway">
        <p>
          The model sets the floor. The harness decides how you spend to get past it, and that
          shows up in your bill long before it shows up in your pass rate. Here&apos;s how
          I&apos;d set the levers.
        </p>
        <LeverBoard mode="mine" />
        <p>Before you upgrade the model, look at what your harness is feeding it.</p>
      </Spread>

      <Spread kicker="caveats">
        <p>
          One model, 49 tasks; one more was dropped because its tests need the open internet.
          Cursor bills outside my cost proxy, so its cost is estimated from its own logs, and it
          kept its built-in skills. Runs were three at a time in 2 CPU / 4 GB containers. Total
          spend: $5.34. Every task, run and transcript is at{' '}
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
