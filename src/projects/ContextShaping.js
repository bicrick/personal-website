import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import {
  Hero,
  ContextFill,
  Lineup,
  MetricRace,
  Outcomes,
  Checked,
  TwoFiles,
  Stat,
} from '../components/project/harness';
import { SWE, SWE_N } from '../components/project/harness/swebench';
import { OPENCODE_PERMISSION_STOPS, AIDER_HANDBACKS } from '../components/project/harness/why';

// Headline numbers come from the data modules, so the copy follows the data.
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
      abstract="Everyone compares the models. Almost no one looks at the program wrapped around them, the harness. I put one model in six of them and gave each the same real bugs to fix."
    >
      <Hero />

      <p>
        The model only reads one thing: its context window. The harness decides what goes in it,
        and does whatever the model asks for.
      </p>

      <ContextFill />

      <h2>/ the test</h2>

      <p>
        One model, Claude Haiku 5.5, in six popular harnesses. The same {SWE_N} real bugs from
        open-source projects (the SWE-bench Verified benchmark), the same computer, and the same
        judge: each project&apos;s own tests.
      </p>

      <Lineup />

      <Stat value={`${worst.rate}% → ${best.rate}%`} label={`bugs fixed, ${worst.label} to ${best.label}`} />

      <p>
        A {best.rate - worst.rate}-point swing, with nothing changed but the wrapper. Here is what
        each fix cost in money, in tokens (the chunks of text the model reads and writes) and in
        time.
      </p>

      <MetricRace />

      <h2>/ why</h2>

      <p>
        I went through every run to see what the winners did differently. The first surprise:
        they don&apos;t write fewer wrong fixes. They give up less.
      </p>

      <Outcomes />

      <p>
        Some of those empty runs are design choices. OpenCode stopped {OPENCODE_PERMISSION_STOPS}{' '}
        times at a permission prompt, waiting for a yes nobody was there to give. Aider is built
        for a person at the keyboard: in {AIDER_HANDBACKS} of {SWE_N} runs its last message asked
        me to run the tests. Run unattended, both just stop.
      </p>

      <p>
        The harnesses that run code on their own tend to check their work before calling it done.
      </p>

      <Checked />

      <p>
        And Cursor looks a little wider. On one bug, the five others all fixed the same file and
        failed. Cursor&apos;s first search covered the whole folder.
      </p>

      <TwoFiles />

      <p>
        Two cautions. Cursor ran its model with extra thinking switched on and its own built-in
        skills, so part of its lead may not be the harness at all. And {SWE_N} bugs is a small
        sample: only the ends of the ranking are clearly apart.
      </p>

      <h2>/ cost</h2>

      <p>
        Cost spread far more than success: {aider.label} paid {cents(aider.usd)}¢ per fix,{' '}
        {cheapest.label} {cents(cheapest.usd)}¢. Providers charge a tenth for text that matches
        what you sent last time. Five harnesses only add to the end of the window, so{' '}
        {Math.min(...others)}–{Math.max(...others)}% of their input was that cheap repeat. Aider
        rebuilds it every turn: {aider.cache}%.
      </p>

      <h2>/ takeaway</h2>

      <p>
        The model sets what&apos;s possible. The harness decides how much of it you get: whether
        the model is allowed to keep going, whether it checks its work, how widely it looks, and
        what you pay along the way. Before you upgrade the model, look at what your harness is
        feeding it.
      </p>

      <p className="hs-note">
        Method: {SWE_N} SWE-bench Verified tasks, three runs at a time in 2 CPU / 4 GB containers,
        every harness on its default settings. Minutes per fix use only runs under those equal
        conditions. Success rates carry about ±12 points of uncertainty (95% Wilson). Cursor bills
        outside my cost tracking, so its cost is estimated from its own logs. Analysis and every
        log:{' '}
        <a href="https://github.com/bicrick/context-shaping/blob/claude/eager-noether-o13tek/docs/WHY_HARNESSES_DIFFER.md" target="_blank" rel="noopener noreferrer">
          github.com/bicrick/context-shaping
        </a>
        .
      </p>
    </ProjectDetail>
  );
}

export default ContextShaping;
