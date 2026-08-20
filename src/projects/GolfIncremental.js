import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function GolfIncremental() {
  return (
    <ProjectDetail
      title="range rat"
      date="August 2026"
      linkHref="https://golf.bicrick.com"
      linkLabel="play"
      abstract="A golf incremental / idle game about running a chaotic driving range. Hire rats, upgrade the bay, cash out cheese, and keep swinging."
      seoTitle="Range Rat - Golf Incremental Game by bicrick"
      seoDescription="Range Rat by bicrick (Patrick Brown) - A Godot golf incremental about running a driving range, hiring rats, and cashing out cheese. Play free in the browser."
      seoKeywords="bicrick, Patrick Brown, Range Rat, golf incremental, idle game, Godot, cheese, driving range"
      seoUrl="https://bicrick.com/projects/golf-incremental"
      seoImage="https://bicrick.com/images/golf-incremental/range-rat-1200x600.jpg"
    >
      <img
        src={`${process.env.PUBLIC_URL}/images/golf-incremental/range-rat-1200x600.jpg`}
        alt="Range Rat title screen"
        width="1024"
        height="512"
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <p className="project-caption">
        Range Rat — a golf incremental about rats, range bays, and cashing out cheese
      </p>

      <h2>/ play</h2>

      <p>
        The browser demo lives at{' '}
        <a href="https://golf.bicrick.com" target="_blank" rel="noopener noreferrer">
          golf.bicrick.com
        </a>
        . Click once to unlock audio, then swing.
      </p>

      <h2>/ what it is</h2>

      <p>
        Range Rat is a Godot 4 incremental set on a driving range. You swing for distance,
        fill the bucket, pick up balls, hire a crew of rats, and push upgrades until the
        loop opens into prestige cheese and a second tree of overpowered perks.
      </p>

      <p>
        The feel sits between an idle clicker and a tiny management sim: the range is a
        place you improve, not just a score counter. Day and night, music, and a physical
        buildable bay are part of the atmosphere.
      </p>

      <h2>/ building it</h2>

      <p>
        Built in Godot 4 with GDScript. The web build uses the non-threaded HTML5 export
        so it can host cleanly as a static site. Background music is converted to OGG and
        loaded one track at a time over HTTP so the first download stays lean.
      </p>

      <p>
        Hosting follows the same side-site pattern as{' '}
        <a href="https://gd.bicrick.com" target="_blank" rel="noopener noreferrer">gd.bicrick.com</a>
        {' '}and{' '}
        <a href="https://resume.bicrick.com" target="_blank" rel="noopener noreferrer">resume.bicrick.com</a>
        : the playable build is on its own subdomain, while this page is just the writeup
        and link.
      </p>

      <h2>/ links</h2>

      <p>
        <a href="https://golf.bicrick.com" target="_blank" rel="noopener noreferrer">play Range Rat</a>
        {' | '}
        <a href="https://github.com/bicrick/golf_incremental" target="_blank" rel="noopener noreferrer">see the repo</a>
      </p>
    </ProjectDetail>
  );
}

export default GolfIncremental;
