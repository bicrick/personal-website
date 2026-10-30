import React, { Suspense, lazy } from 'react';
import ProjectDetail from '../components/ProjectDetail';

const SITE = 'https://scribe-friends.vercel.app';

/* Scenario JSON is heavy — keep it out of main.js. */
const ScribeDemo = lazy(() => import('../components/project/scribe'));

function Scribe() {
  return (
    <ProjectDetail
      title="scribe"
      date="October 2026"
      linkHref={SITE}
      linkLabel="site (invite only)"
      abstract="Ask for anything and scribe writes it by hand. Study notes, a letter, a toast. You watch the pen move."
    >
      <Suspense
        fallback={
          <div className="project-figure" style={{ minHeight: 360 }} aria-hidden="true" />
        }
      >
        <ScribeDemo />
      </Suspense>

      <p>
        you type what you want. a planner lays out the page, then a handwriting model
        draws it stroke by stroke. pictures become pen sketches or little doodles.
      </p>

      <p>
        the reel above is canned — newton's third law, ohm's law, integration by parts,
        a thank-you letter, a wedding toast. same pipeline the live app uses, just offline.
      </p>

      <p>
        i built it because ai output all looks the same — typed, clean, a little cold.
        i wanted something that felt personal, like a note someone actually wrote for you.
      </p>

      <p>
        friends-only while i test it.{' '}
        <a href={SITE} target="_blank" rel="noopener noreferrer">
          try scribe
        </a>
      </p>
    </ProjectDetail>
  );
}

export default Scribe;
