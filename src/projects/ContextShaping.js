import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import { Hero, ContextBar, ScrollGrid, CacheRace, TokenBars, Stat } from '../components/project/harness';
import { SWE_N, SWE_SAME } from '../components/project/harness/swebench';
import { GRID_NONE, GRID_ALL } from '../components/project/harness/grid';

// Every number below comes from the data modules (same-settings runs).
const same = (id) => SWE_SAME.find((r) => r.id === id);
const aider = same('aider');
const mini = same('mini');
const rest = SWE_SAME.filter((r) => r.id !== 'aider');
const lo = Math.min(...rest.map((r) => r.rate));
const hi = Math.max(...rest.map((r) => r.rate));
const caches = rest.map((r) => r.cache);
const spread = (k) => Math.max(...SWE_SAME.map((r) => r[k])) / Math.min(...SWE_SAME.map((r) => r[k]));
const costX = Math.round(spread('usd'));
const tokX = spread('tok').toFixed(1);
const minX = Math.round(spread('min') * 10) / 10;
const topTok = [...SWE_SAME].sort((a, b) => b.tok - a.tok)[0];

function ContextShaping() {
  return (
    <ProjectDetail
      title="same model, six harnesses"
      date="October 2026"
      backHref="/"
      backLabel="home"
      linkHref="https://github.com/bicrick/context-shaping"
      linkLabel="view repo"
      secondaryLinkHref="/writing/context-shaping/harnesses"
      secondaryLinkLabel="meet the harnesses"
      secondaryLinkInternal
      abstract="Everyone compares models. Almost nobody compares the thing wrapped around them."
    >
      <Hero />

      <p>
        When a new AI model comes out, we line them up and argue about who is smartest. But you
        never talk to the model directly. You talk to a harness: the program that decides what the
        model sees, which tools it gets, and when it is done.
      </p>

      <p>
        The model only reads one thing, its context window. The harness fills it.
      </p>

      <ContextBar />

      <p>
        So I took one model, Claude Haiku 5.5, and put it in six different harnesses. Each one got
        the same {SWE_N} real bugs from popular open-source projects, and each project&apos;s own
        tests decided whether the fix worked.
      </p>

      <p className="hs-big">Here are all 300 runs.</p>

      <ScrollGrid />

      <Stat value={`${GRID_ALL} and ${GRID_NONE}`} label={`bugs that every harness fixed, and that none did, out of ${SWE_N}`} />

      <p>
        On whether the bug gets fixed, five of the six land between {lo}% and {hi}%. That is a tie.
        The bug matters far more than the wrapper. Aider is the exception at {aider.rate}%. It was
        built for a person at the keyboard: it suggests an edit and hands control back, asking the
        model only about twice per bug. With nobody there, the model never gets a second look at
        its own fix.
      </p>

      <Stat value={`${costX}×`} label="the gap in cost per fix, same model, same bugs" />

      <p>
        Then the bill. Cost per fix spans {costX} times. Words read per fix span {tokX} times, and
        time per fix more than {Math.floor(minX)} times. Same model, same answers. In model
        terms, a {costX}× price drop would be called a new generation.
      </p>

      <p className="hs-big">Why? The cache.</p>

      <p>
        AI providers charge a tenth of the price for text you already sent them last time. A
        harness that only adds to the end of the window gets that discount on almost everything:{' '}
        {Math.min(...caches)} to {Math.max(...caches)}% of what these five sent was a cheap repeat.
        Aider rebuilds its whole prompt every turn, so only {aider.cache}% was.
      </p>

      <CacheRace />

      <p className="hs-big">The smallest one nearly won.</p>

      <p>
        mini-swe-agent gives the model one thing, a shell. No special tools, no clever prompt. It
        fixed {mini.solved} of {SWE_N}, within a few of the best, while reading the fewest words of
        any harness. {topTok.label} read {(topTok.tok / mini.tok).toFixed(1)} times as much for
        fewer fixes.
      </p>

      <TokenBars />

      <p>
        Harness engineering matters as much as model engineering. The model sets the ceiling.
        The harness decides what it costs to get there, and whether you get there at all. You can
        dig into each one on{' '}
        <Link to="/writing/context-shaping/harnesses">the harness pages</Link>.
      </p>

      <p className="hs-note">
        Method: {SWE_N} SWE-bench Verified bugs, Haiku 5.5 with extended thinking off and every
        command approved in all six, three runs at a time in identical containers. An earlier run
        on each harness&apos;s default settings is in the repo. Cursor&apos;s cost is estimated from
        its own logs. Data and code:{' '}
        <a href="https://github.com/bicrick/context-shaping" target="_blank" rel="noopener noreferrer">github.com/bicrick/context-shaping</a>.
      </p>
    </ProjectDetail>
  );
}

export default ContextShaping;
