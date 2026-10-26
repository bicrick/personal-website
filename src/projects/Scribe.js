import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

const SITE = 'https://scribe-friends.vercel.app';
const IMG = `${process.env.PUBLIC_URL}/images/scribe`;

function Scribe() {
  return (
    <ProjectDetail
      title="scribe"
      date="October 2026"
      linkHref={SITE}
      linkLabel="site (invite only)"
      abstract="Ask for anything and scribe writes it by hand. A note, a card, math with graphs, a comic. You watch the pen write it live."
    >
      <figure className="project-figure">
        <video
          src={`${IMG}/scribe-card-writing.mp4`}
          poster={`${IMG}/scribe-card-poster.jpg`}
          width="720"
          height="720"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="scribe writing a birthday card with a tulip doodle, stroke by stroke"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        <figcaption>a birthday card, written live (2x speed)</figcaption>
      </figure>

      <p>
        You type what you want. A planner lays out the page, then a handwriting model draws it
        stroke by stroke in real ink. If you ask for a picture, it gets a pen sketch or a little
        doodle. Otherwise it's just handwriting.
      </p>

      <p>
        I built it because AI output all looks the same: typed, clean, a little cold. I wanted
        something that felt personal, like a note someone actually wrote for you.
      </p>

      <p>
        It's friends-only while I test it, so the site asks for a password.
      </p>
    </ProjectDetail>
  );
}

export default Scribe;
