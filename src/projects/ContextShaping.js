import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import {
  Spread,
  Hero,
  Anatomy,
  Lineup,
  MetricRace,
  CacheRace,
  Display,
  Stat,
  Beat,
} from '../components/project/harness';

function ContextShaping() {
  return (
    <ProjectDetail
      title="same model, six harnesses"
      date="October 2026"
      backHref="/"
      backLabel="home"
      linkHref="https://github.com/bicrick/context-shaping"
      linkLabel="view repo"
    >
      <Hero />

      <Spread>
        <Display>Same model. Six harnesses. <em>Does the wrapper matter?</em></Display>
        <p>
          When people compare AI coding tools, they usually compare the model inside. But you
          never talk to a model directly. You talk to the program wrapped around it, and that
          program is called a harness.
        </p>
      </Spread>

      <Spread kicker="what is a harness">
        <Beat>A harness is not a model.</Beat>
        <p>
          The model is the brain. All it does is read some text and predict what comes next. It
          can&apos;t open your files or run your tests, and it remembers nothing between turns.
        </p>
        <p>
          The model only sees one thing: its context window, the block of text it reads each
          turn. The harness is everything that fills it. It writes the instructions, picks which
          of your files to show, offers tools like search and run tests, actually runs them, and
          decides what to forget when the window gets full.
        </p>
        <Anatomy />
        <p>
          Claude Code, Cursor, Aider and others are all harnesses, and many of them can run the
          exact same model. Same brain, different costume.
        </p>
      </Spread>

      <Spread kicker="the test">
        <p>
          So I took one model, Claude Haiku 5.5, and put it in six popular harnesses. Each one got
          the same 49 real bugs from open-source projects (a public benchmark called SWE-bench
          Verified), the same computer resources, and the same pass/fail check: the
          project&apos;s own tests.
        </p>
        <Lineup />
        <p>The only thing that changed was the costume.</p>
      </Spread>

      <Spread kicker="the results">
        <Stat value="+17" label="points of success rate between best and worst" />
        <p>
          The wrapper alone moved the success rate from 61% to 78%. But success is only half of
          it. What does each fix cost you, in money, in tokens (the chunks of text the model
          reads and writes), and in time?
        </p>
        <MetricRace />
        <Stat value="15×" label="Aider’s cost per fix compared with OpenCode’s" />
        <p>
          Most of them fix a bug for about a cent. Aider pays about eight and a half cents, and
          fixes the fewest.
        </p>
      </Spread>

      <Spread kicker="why">
        <Beat>The difference is the cache.</Beat>
        <p>
          Every time the harness asks the model something, it sends the whole context window
          again. Providers remember the beginning of what you sent last time, and charge about a
          tenth of the price for the part that matches. That memory is the cache.
        </p>
        <CacheRace />
        <p>
          A harness that only adds to the end of the window keeps the start identical, so most
          of each trip is cheap. Five of the six got 90 to 93% of their text from the cache.
          Aider rebuilds its window every time, with a fresh map of the project and whole files,
          so almost nothing matches. It got 4%.
        </p>
      </Spread>

      <Spread kicker="the takeaway">
        <p>
          The model sets how smart the work can be. The harness decides how much of that you
          actually get, and what you pay for it, mostly through what it puts in the context
          window and whether it keeps the cache warm.
        </p>
        <Display>Before you upgrade the model, look at what your harness is <em>feeding it</em>.</Display>
      </Spread>

      <Spread kicker="method">
        <p className="hs-note">
          50 SWE-bench Verified tasks; one was dropped because its tests need the open internet.
          Three runs at a time, each in its own 2 CPU / 4 GB container; minutes per fix use only
          runs made under those equal conditions. With 49 tasks each success rate is about ±12
          points (95% Wilson interval). Tokens include cache reads. Cache rate = cache reads ÷ all
          input tokens. Cursor bills outside my cost tracking, so its cost is estimated from its
          own token logs, and it kept its built-in skills. Total spend $5.34. Every run and log is
          at{' '}
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
