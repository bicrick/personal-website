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
import { SWE, SWE_N, SWE_SAME } from '../components/project/harness/swebench';
import { OPENCODE_PERMISSION_STOPS, OUTCOMES_SAME } from '../components/project/harness/why';

// Headline numbers come from the data modules, so the copy follows the data.
// SWE = each harness on its defaults; SWE_SAME = all six on the same settings (the result).
const byRate = [...SWE].sort((a, b) => b.rate - a.rate);
const best = byRate[0];
const worst = byRate[byRate.length - 1];
const get = (id) => SWE.find((r) => r.id === id);
const same = (id) => SWE_SAME.find((r) => r.id === id);
const oc = get('opencode');
const cu = get('cursor');
const ai = get('aider');
const ocS = same('opencode');
const cuS = same('cursor');
const aider = same('aider');
const rest = SWE_SAME.filter((r) => r.id !== 'aider');
const top5 = rest.map((r) => r.rate);
const caches = rest.map((r) => r.cache);
const cheapest = [...SWE_SAME].sort((a, b) => a.usd - b.usd)[0];
const ratio = Math.round(aider.usd / cheapest.usd);
const wrongRest = OUTCOMES_SAME.filter((r) => r.id !== 'aider').map((r) => r.wrong);
const wrongAider = OUTCOMES_SAME.find((r) => r.id === 'aider').wrong;
const sweS = same('swe_agent');
const miniS = same('mini');
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

      <h2>/ same settings</h2>

      <p>
        But the harnesses were not running on the same settings. OpenCode asks permission before
        some commands, and with nobody at the keyboard it stopped {OPENCODE_PERMISSION_STOPS} times
        waiting for a yes. And Haiku 5.5 can use extended thinking, extra private reasoning before
        each answer. Every harness had it switched on by default, each to its own degree.
      </p>

      <p>
        So I ran all six again on all {SWE_N} bugs with the same settings: thinking off and every
        command approved. Cursor fell from {cu.solved} to {cuS.solved} fixes, and the three bugs
        only it had fixed went with it. OpenCode, no longer stuck at permission prompts, rose from{' '}
        {oc.solved} to {ocS.solved}. {aider.label} lost the most, {ai.solved} to {aider.solved}.
      </p>

      <Confounds />

      <Stat value={`${Math.min(...top5)}–${Math.max(...top5)}%`} label="the top five, same settings" />

      <p>
        On the same settings, five harnesses sit within {Math.max(...top5) - Math.min(...top5)}{' '}
        points, inside the uncertainty of {SWE_N} bugs. Most of the first-glance ranking came from
        defaults: how a harness behaves unattended, and how hard it lets the model think.
        {' '}{aider.label} is the one clear gap at {aider.rate}%. It is built for a person who runs
        the tests and answers its questions, and it asks the model only about twice per bug.
        Without thinking, that first answer is wrong more often.
      </p>

      <p>
        Even big differences in habit mostly wash out. SWE-agent ran the code after almost every
        edit; mini-swe-agent, about two times in three. They fixed {sweS.solved} and{' '}
        {miniS.solved}.
      </p>

      <Checked />

      <p>
        With every command approved, almost every run ends with an attempt. The top five hand in
        a wrong fix on {Math.min(...wrongRest)} to {Math.max(...wrongRest)} bugs; {aider.label},{' '}
        {wrongAider}.
      </p>

      <Outcomes />

      <h2>/ cost</h2>

      <p>
        Where the harness really differs is the bill. Here is each fix in money, tokens (the
        chunks of text the model reads and writes) and time, with all six on the same settings.
      </p>

      <MetricRace />

      <Stat value={`${ratio}×`} label={`${aider.label}'s cost per fix vs ${cheapest.label}`} />

      <p>
        The reason is the context window. Providers charge a tenth for text that matches what you
        sent last time. Five harnesses only add to the end of the window, so{' '}
        {Math.min(...caches)}–{Math.max(...caches)}% of their input was that cheap repeat.{' '}
        {aider.label} rebuilds its prompt every turn: {aider.cache}%. That is {cents(aider.usd)}¢
        per fix against {cents(cheapest.usd)}¢ for {cheapest.label}.
      </p>

      <h2>/ takeaway</h2>

      <p>
        Before you blame or upgrade the model, check what the harness is feeding it and how it is
        configured. Defaults decided most of who looked best. The expensive differences hide in how
        it manages the context.
      </p>

      <p className="hs-note">
        Method: {SWE_N} SWE-bench Verified tasks, three runs at a time in 2 CPU / 4 GB containers.
        Every harness ran all {SWE_N} twice: on its own defaults, then on the same settings, with
        thinking off (enforced on every request to the model, and for Cursor by its no-thinking
        version of Haiku 5.5) and every command approved. The figures after the first show the
        same-settings runs. Success rates carry about ±12 points of uncertainty (95% Wilson).
        Cursor bills outside my cost tracking, so its cost is estimated from its own logs.
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
