import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import { Hero, ContextBar, ScrollGrid, StartWindow, TokenBars, Stat } from '../components/project/harness';
import { SWE_N, SWE_SAME, WINDOW_START } from '../components/project/harness/swebench';
import { GRID_NONE, GRID_ALL } from '../components/project/harness/grid';

// Every number below comes from the data modules (same-settings runs, five harnesses).
const same = (id) => SWE_SAME.find((r) => r.id === id);
const mini = same('mini');
const lo = Math.min(...SWE_SAME.map((r) => r.rate));
const hi = Math.max(...SWE_SAME.map((r) => r.rate));
const spread = (k) => (Math.max(...SWE_SAME.map((r) => r[k])) / Math.min(...SWE_SAME.map((r) => r[k]))).toFixed(1);
const costX = spread('usd');
const tokX = spread('tok');
const minX = spread('min');
const cents = (v) => `${(v * 100).toFixed(2)}¢`;
const cheap = [...SWE_SAME].sort((x, y) => x.usd - y.usd)[0];
const dear = [...SWE_SAME].sort((x, y) => y.usd - x.usd)[0];
const topTok = [...SWE_SAME].sort((x, y) => y.tok - x.tok)[0];
const win = (id) => WINDOW_START.find((r) => r.id === id);
const big = win('claude_code');
const small = win('mini');
const k = (n) => `${(n / 1000).toFixed(1)}k`;

function ContextShaping() {
  return (
    <ProjectDetail
      title="same model, five harnesses"
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
        So I took one model, Claude Haiku 5.5, and put it in five different harnesses. Each one got
        the same {SWE_N} real bugs from popular open-source projects, taken from{' '}
        <a href="https://www.swebench.com/" target="_blank" rel="noopener noreferrer">SWE-bench Verified</a>, and each project&apos;s own
        tests decided whether the fix worked.
      </p>

      <p className="hs-big">Here are all 250 runs.</p>

      <ScrollGrid />

      <Stat value={`${GRID_ALL} and ${GRID_NONE}`} label={`bugs that every harness fixed, and that none did, out of ${SWE_N}`} />

      <p>
        All five land between {lo}% and {hi}%. At {SWE_N} bugs, that is a tie. Whether a bug gets
        fixed depends far more on the bug than on the wrapper.
      </p>

      <Stat value={`${tokX}×`} label="the gap in tokens read per fix, same model, same bugs" />

      <p>
        The bill is a different story. To land the same fixes, the busiest harness read {tokX} times
        as many tokens (chunks of text, roughly a word each) as the leanest one. Cost per fix runs from {cents(cheap.usd)} to{' '}
        {cents(dear.usd)}, {costX} times, and time per fix varies {minX} times.
      </p>

      <p className="hs-big">Why? What&apos;s already in the window.</p>

      <p>
        Before the model sees a single line of code, the harness has already filled the window
        with instructions and a list of tools. {big.label} hands it {big.tools} tools and about{' '}
        {k(big.start)} tokens. mini-swe-agent hands it one tool, a shell, and {k(small.start)}.
        That opening gets sent again with every message, so it adds up.
      </p>

      <StartWindow />

      <p className="hs-big">The smallest one kept up.</p>

      <p>
        With nothing but a shell and a short prompt, mini-swe-agent fixed {mini.solved} of{' '}
        {SWE_N}, a few behind the best, while reading the fewest tokens and finishing fastest.{' '}
        {topTok.label} read {(topTok.tok / mini.tok).toFixed(1)} times as much for one fewer fix.
      </p>

      <TokenBars />

      <p>
        Harness engineering matters as much as model engineering. The model sets the ceiling. The
        harness decides how much you pay, in money and time, to reach it. You can dig into each one
        on <Link to="/writing/context-shaping/harnesses">the harness pages</Link>.
      </p>

      <p className="hs-note">
        Method: {SWE_N} SWE-bench Verified bugs, Haiku 5.5 with extended thinking off and every
        command approved in all five, three runs at a time in identical containers. An earlier run
        on each harness&apos;s default settings is in the repo. Aider was left out because it expects a person or a test command in the loop, and these runs had neither. Cursor&apos;s cost is estimated from
        its own logs. Data and code:{' '}
        <a href="https://github.com/bicrick/context-shaping" target="_blank" rel="noopener noreferrer">github.com/bicrick/context-shaping</a>.
      </p>
    </ProjectDetail>
  );
}

export default ContextShaping;
