import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProjectDetail from '../components/ProjectDetail';
import { Hero, ContextBar, MeetHarnesses, ScrollGrid, WhyTokens, ResultsTable, Model } from '../components/project/harness';
import { SWE_N } from '../components/project/harness/swebench';

// Every number in the post comes from the data modules (same-settings runs, five harnesses).

function ContextShaping() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView();
  }, [hash]);

  return (
    <ProjectDetail
      title="same model, five harnesses"
      date="October 2026"
      backHref="/"
      backLabel="home"
      linkHref="https://github.com/bicrick/context-shaping"
      linkLabel="view repo"
      abstract="Everyone compares models. Almost nobody compares the thing wrapped around them."
    >
      <Hero />

      <p>
        When a new AI model comes out, we line them up and argue about who is smartest. But you
        never talk to the model directly. You talk to a harness: the program that decides what the
        model sees, which tools it gets, and when it is done.
      </p>

      <p>The model only reads one thing, its context window. The harness fills it.</p>

      <ContextBar />

      <h2>/ meet the harnesses</h2>

      <p>Five popular ones, each with its own idea of how to help.</p>

      <MeetHarnesses />

      <h2>/ the test</h2>

      <p>
        I put the same model, <Model />, inside all five and gave each the same {SWE_N} real
        bugs from popular open-source projects, taken from{' '}
        <a href="https://www.swebench.com/" target="_blank" rel="noopener noreferrer">SWE-bench Verified</a>.
        Each project&apos;s own tests decided whether a fix worked. Here are all 250 runs.
      </p>

      <ScrollGrid />

      <h2>/ results</h2>

      <p>On whether a bug gets fixed, it's a tie. The bill is a different story.</p>

      <ResultsTable />

      <h2>/ why tokens differ</h2>

      <p>
        It comes down to what each harness puts in the window, and how often it sends it.
      </p>

      <WhyTokens />

      <p>
        Harness engineering matters as much as model engineering. The model sets the ceiling. The
        harness decides how much you pay, in money and in time, to reach it.
      </p>

      <p className="hs-note">
        Method: {SWE_N} SWE-bench Verified bugs, <Model>Haiku 5.5</Model> with extended thinking off and every
        command approved in all five, three runs at a time in identical containers. An earlier run
        on each harness&apos;s default settings is in the repo. Aider was left out because it
        expects a person or a test command in the loop, and these runs had neither. Cursor&apos;s
        cost is estimated from its own logs. Data and code:{' '}
        <a href="https://github.com/bicrick/context-shaping" target="_blank" rel="noopener noreferrer">github.com/bicrick/context-shaping</a>.
      </p>
    </ProjectDetail>
  );
}

export default ContextShaping;
