import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import {
  Hero,
  ContextFill,
  Lineup,
  Confounds,
  MetricRace,
  Outcomes,
  Checked,
  Stat,
} from '../components/project/harness';
import { SWE, SWE_N, SWE_VARIANTS, SWE_FAIR } from '../components/project/harness/swebench';
import { OPENCODE_PERMISSION_STOPS } from '../components/project/harness/why';

// Headline numbers come from the data modules, so the copy follows the data.
const byRate = [...SWE].sort((a, b) => b.rate - a.rate);
const best = byRate[0];
const worst = byRate[byRate.length - 1];
const get = (id) => SWE.find((r) => r.id === id);
const oc = get('opencode');
const cu = get('cursor');
const ocA = SWE_VARIANTS.opencode_auto;
const cuN = SWE_VARIANTS.cursor_nothink;
const aider = SWE_FAIR.find((r) => r.id === 'aider');
const top5 = SWE_FAIR.filter((r) => r.id !== 'aider').map((r) => r.rate);
const caches = SWE_FAIR.filter((r) => r.id !== 'aider').map((r) => r.cache);
const ratio = Math.round(aider.usd / ocA.usd);
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
        At first glance: a {best.rate - worst.rate}-point spread, with {best.label} on top. Same
        model, so the wrapper must matter a lot. Before believing that, I checked the obvious
        explanations.
      </p>

      <h2>/ two settings</h2>

      <p>
        Two of the gaps were settings, not design. OpenCode asks permission before some
        commands, and with nobody at the keyboard it stopped {OPENCODE_PERMISSION_STOPS} times
        waiting for a yes. With auto-approve on, it went from {oc.solved} to {ocA.solved} fixes.
      </p>

      <p>
        Cursor had quietly picked a version of the model with extended thinking, extra private
        reasoning before each answer, which no other harness got. With thinking off it went from{' '}
        {cu.solved} to {cuN.solved}, and the three bugs only Cursor had fixed went with it.
      </p>

      <Confounds />

      <Stat value={`${Math.min(...top5)}–${Math.max(...top5)}%`} label="the top five, settings fixed" />

      <p>
        With those fixed, five harnesses sit within {Math.max(...top5) - Math.min(...top5)} points,
        well inside the uncertainty of {SWE_N} bugs. On success, a well-configured harness is a
        well-configured harness. What moved the needle was defaults: how it behaves unattended,
        how hard the model thinks.
      </p>

      <p>
        Even big differences in habit wash out. SWE-agent ran the code after almost every edit;
        mini-swe-agent, about two times in three. They fixed nearly the same number.
      </p>

      <Checked />

      <p>
        And every harness hands in a wrong fix about as often. The runs differ mostly in how many
        end with nothing at all.
      </p>

      <Outcomes />

      <h2>/ cost</h2>

      <p>
        Where the harness really differs is the bill. Here is each fix in money, tokens (the
        chunks of text the model reads and writes) and time, with the two settings fixed.
      </p>

      <MetricRace />

      <Stat value={`${ratio}×`} label={`${aider.label}'s cost per fix vs OpenCode (auto-approve)`} />

      <p>
        The reason is the context window. Providers charge a tenth for text that matches what you
        sent last time. Five harnesses only add to the end of the window, so{' '}
        {Math.min(...caches)}–{Math.max(...caches)}% of their input was that cheap repeat.{' '}
        {aider.label} rebuilds its prompt every turn: {aider.cache}%. That is {cents(aider.usd)}¢
        per fix against {cents(ocA.usd)}¢.
      </p>

      <h2>/ takeaway</h2>

      <p>
        Before you blame or upgrade the model, check what the harness is feeding it and how it is
        configured. Settings decide how often it succeeds. The expensive differences hide in how
        it manages the context.
      </p>

      <p className="hs-note">
        Method: {SWE_N} SWE-bench Verified tasks, three runs at a time in 2 CPU / 4 GB containers,
        every harness on its defaults, plus two reruns of all {SWE_N}: OpenCode with every
        permission auto-approved, and Cursor with thinking off. The reruns had the machine
        mostly to themselves, so their minutes per fix flatter them a little. Success rates
        carry about ±12 points of uncertainty (95% Wilson). Cursor bills outside my cost
        tracking, so its cost is estimated from its own logs.
        Analysis and every
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
