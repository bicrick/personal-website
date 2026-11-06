import React, { Suspense, lazy } from 'react';
import ProjectDetail from '../components/ProjectDetail';

const SITE = 'https://scribepages.com';

/* Scenario JSON is heavy — keep it out of main.js. */
const ScribeDemo = lazy(() => import('../components/project/scribe'));

function Scribe() {
  return (
    <ProjectDetail
      title="scribe"
      date="October 2026"
      linkHref={SITE}
      linkLabel="scribepages.com"
      abstract="Ask for a page and scribe writes it by hand. A thank-you, a note, a diagram. You watch the pen move, then print it or keep a pdf."
    >
      <Suspense
        fallback={
          <div className="project-figure" style={{ minHeight: 360 }} aria-hidden="true" />
        }
      >
        <ScribeDemo />
      </Suspense>

      <p>
        you say what you want, or paste something you already wrote. a planner lays
        out the page, then a handwriting model draws each letter with pen strokes.
        it is not a font — no two words come out quite the same.
      </p>

      <p>
        the reel above is canned — newton's third law with a free-body diagram, a
        definite integral by parts, ohm's law with a labeled circuit. same writing
        pipeline as the live app, just offline. notes, thank-you letters, and cards
        go through it too.
      </p>

      <p>
        when a page is done you can print it true size — letter, a4, or a card — or
        save a pdf. if it is not quite right, ask in plain words — make it bigger,
        add a p.s. — and every change stays as a version you can go back to.
      </p>

      <p>
        i built it because ai output all looks the same — typed, clean, a little cold.
        i wanted something that felt personal, like a note someone actually wrote for you.
      </p>

      <p>
        anyone can try it. 3 pages a day with no account, 15 if you sign in with
        email, and the pages you made come with you.{' '}
        <a href={SITE} target="_blank" rel="noopener noreferrer">
          try scribe
        </a>
      </p>
    </ProjectDetail>
  );
}

export default Scribe;
