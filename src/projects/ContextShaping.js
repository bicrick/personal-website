import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import {
  Spread,
  Hero,
  Lineup,
  MetricRace,
  CacheRace,
  Display,
  Stat,
  Beat,
} from '../components/project/harness';
import { SWE, SWE_N } from '../components/project/harness/swebench';

// Headline numbers come from the data module, so the copy follows the data.
const byRate = [...SWE].sort((a, b) => b.rate - a.rate);
const best = byRate[0];
const worst = byRate[byRate.length - 1];
const aider = SWE.find((r) => r.id === 'aider');
const cheapest = [...SWE].sort((a, b) => a.usd - b.usd)[0];
const others = SWE.filter((r) => r.id !== 'aider').map((r) => r.cache);
const cents = (v) => (v < 0.01 ? (v * 100).toFixed(2) : (v * 100).toFixed(1));

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
        <Display>Everyone compares the models. Almost no one looks at what&apos;s wrapped around them.</Display>
        <p>
          When a new model comes out, we argue about its benchmark scores. But nobody uses a model
          on its own. You use it through a tool like Claude Code, Cursor or Aider, and that tool
          does a lot of quiet work you never see.
        </p>
        <p>
          The model only reads and writes text. It can&apos;t open your files, and it forgets
          everything between turns. So the tool around it, the harness, decides what it gets to
          read each turn: which files, which instructions, which results so far.
        </p>
        <p>
          It also turns the
          model&apos;s requests into real actions, like searching your code, editing a file or
          running the tests. And when the model&apos;s working memory fills up, the harness
          decides what to drop.
        </p>
        <p>
          Several of these tools can run the very same model. Same mind, different outfit.
        </p>
        <Lineup />
      </Spread>

      <Spread>
        <p>
          I wanted to know how much the outfit matters. So I took one model, Claude Haiku 5.5,
          and ran it in six popular harnesses on the same {SWE_N} real bugs from open-source
          projects, taken from a public benchmark called SWE-bench Verified. Every run got the
          same computer and was graded the same way: by the project&apos;s own tests.
        </p>
        <Stat
          value={`${worst.rate}% → ${best.rate}%`}
          label={`of bugs fixed, from ${worst.label} to ${best.label}, with the same model inside`}
        />
        <p>
          That&apos;s a {best.rate - worst.rate}-point swing from the harness alone. Fixing the
          bug is only part of it, though. Here&apos;s what each fix cost in money, in tokens (the
          chunks of text the model reads and writes) and in time.
        </p>
        <MetricRace />
      </Spread>

      <Spread>
        <Beat>
          The biggest gap is cost. {aider.label} paid about {cents(aider.usd)}¢ per fix;{' '}
          {cheapest.label} paid {cents(cheapest.usd)}¢.
        </Beat>
        <p>
          Every time a harness asks the model something, it sends the whole conversation again.
          Model providers keep a short-term copy of what you sent last time, a cache, and charge
          about a tenth of the price for any opening that matches it exactly.
        </p>
        <CacheRace />
        <p>
          A harness that only adds to the end keeps the opening identical, so most of each trip
          is cheap. Five of the six got {Math.min(...others)} to {Math.max(...others)}% of their
          input from the cache. {aider.label} rebuilds the conversation each time, with a fresh
          map of the project and whole files up front, so almost nothing matches. It got{' '}
          {aider.cache}%.
        </p>
      </Spread>

      <Spread>
        <p>
          The model sets how capable the work can be. The harness decides how much of that you
          actually get, and what you pay for it, mostly through what it puts in front of the
          model and whether it keeps the cache warm.
        </p>
        <Display>Before you upgrade the model, look at what your harness is feeding it.</Display>
      </Spread>

      <Spread kicker="method">
        <p className="hs-note">
          {SWE_N} SWE-bench Verified tasks, one model. Three runs at a time, each in its own
          2 CPU / 4 GB container; minutes per fix use only runs made under those equal
          conditions. With {SWE_N} tasks, each success rate is uncertain by about ±12 points
          (95% Wilson interval), so only the ends of the ranking are clearly apart. Tokens
          include cache reads. Cache rate = cache reads ÷ all input tokens. Cursor bills outside
          my cost tracking, so its cost is estimated from its own token logs, and it kept its
          built-in skills. Every run and log is at{' '}
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
