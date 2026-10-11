import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import {
  Spread,
  Hero,
  Lineup,
  SwePassRate,
  SweCostScatter,
  CacheRace,
  SweOverlap,
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
      </Spread>

      <Spread>
        <p>
          Every time a new model drops, we argue about the model. I wanted to know about the other
          half: the wrapper around it.
        </p>
        <p>
          A model never sees your repo. It sees its context window, and something has to decide
          what goes in there: which files, which tool results, what gets thrown out when it fills
          up. That something is the harness. Claude Code, Cursor, Aider and the rest can all run
          the exact same model. Same Claude inside, different outfit.
        </p>
        <Lineup />
      </Spread>

      <Spread>
        <p>
          So I put Claude Haiku 5.5 in six popular harnesses and gave each one the same 49 real
          GitHub bugs from SWE-bench Verified. Same model, same containers, same limits, graded by
          the bugs&apos; own tests. The only thing that changed was the outfit.
        </p>
        <Stat value="+17" label="points of pass rate, from the wrapper alone" />
        <SwePassRate />
        <p>
          Forty-nine bugs is a small sample, so the ranges overlap. I wouldn&apos;t bet on the
          order in the middle. The gap between the top and the bottom is real.
        </p>
      </Spread>

      <Spread>
        <Beat>Cost is where they really pull apart.</Beat>
        <Stat value="15×" label="Aider’s cost per fix vs OpenCode’s" />
        <p>
          Most land around a cent per bug fixed. Aider lands at eight and a half, and fixes the
          fewest.
        </p>
        <SweCostScatter />
      </Spread>

      <Spread>
        <Beat>The difference is the cache.</Beat>
        <p>
          It isn&apos;t that Aider sends the most tokens. It&apos;s which tokens. Every call goes
          back with the whole window, and providers cache the part that hasn&apos;t changed since
          last time. Cached tokens cost about a tenth as much.
        </p>
        <p>
          Here&apos;s one bug both of them fixed, every model call, from the run logs.
        </p>
        <CacheRace />
        <p>
          Aider rebuilds its prompt each time, with a fresh repo map and the full files, so the
          cache almost never matches. Across the run, 4% of its prompt tokens came from cache. The
          other five sat at 90 to 93%, because they only add to the end of the window and leave
          the start alone.
        </p>
      </Spread>

      <Spread>
        <Beat>Most bugs don&apos;t care which harness you pick.</Beat>
        <div className="hs-stat-pair">
          <Stat value="26" label="fixed by all six" />
          <Stat value="8" label="fixed by none" />
        </div>
        <p>The whole race happened in the 15 in between.</p>
        <SweOverlap />
      </Spread>

      <Spread>
        <p>
          So the model sets the floor. The easy bugs get fixed no matter what you wrap it in. The
          harness decides how far past that floor you get, and how much you pay for every step,
          and it does that mostly through what it puts in the context window and whether
          it keeps the cache warm.
        </p>
        <Display>Before you upgrade the model, look at what your harness is <em>feeding it</em>.</Display>
      </Spread>

      <Spread kicker="method">
        <p className="hs-note">
          Claude Haiku 5.5, 50 SWE-bench Verified tasks, one dropped because its tests need the
          open internet. Three runs at a time, each in its own 2 CPU / 4 GB container. Ranges are
          95% Wilson intervals. Cache hit = cache reads ÷ all prompt tokens. Cursor bills outside
          my cost proxy, so its cost is estimated from its own token logs, and it kept its
          built-in skills. Total spend $5.34. Every run and log is at{' '}
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
