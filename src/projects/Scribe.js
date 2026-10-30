import React, { Suspense, lazy } from 'react';
import ProjectDetail from '../components/ProjectDetail';

const SITE = 'https://scribe-friends.vercel.app';

/* Scenario JSON is ~210KB gz — keep it out of main.js. */
const ScribeDemo = lazy(() => import('../components/project/scribe'));

function Scribe() {
  return (
    <ProjectDetail
      title="scribe"
      date="October 2026"
      linkHref={SITE}
      linkLabel="site (invite only)"
      abstract="Ask for anything and scribe writes it by hand. A note, a card, math with graphs, a comic. You watch the pen write it live."
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
