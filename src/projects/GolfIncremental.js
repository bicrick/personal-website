import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function GolfIncremental() {
  return (
    <ProjectDetail
      title="range rat"
      date="August 2026"
      linkHref="https://golf.bicrick.com"
      linkLabel="play"
      abstract="I built a small golf incremental in Godot with coding agents. Logic and music were easy. Pixel sprites were not."
      seoTitle="Range Rat - a small golf incremental"
      seoDescription="Patrick Brown on building Range Rat with Godot and coding agents. Game logic and Suno music were easy. Pixel sprites were the hard part."
      seoKeywords="bicrick, Patrick Brown, Range Rat, Godot, pixel art, sprites, Suno, golf incremental"
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
        Range Rat. Play it at golf.bicrick.com.
      </p>

      <h2>/ play</h2>

      <p>
        I built Range Rat in Godot with coding agents. It&apos;s a driving-range
        incremental: swing, pick up balls, hire a crew. The browser build is at{' '}
        <a href="https://golf.bicrick.com" target="_blank" rel="noopener noreferrer">
          golf.bicrick.com
        </a>
        . Click once to unlock audio, then swing.
      </p>

      <h2>/ what was easy</h2>

      <p>
        Game logic was straightforward. Godot and GDScript are a good surface
        for agents. Incremental rules, pickups, cameras, a web export. You
        describe a loop, get a scene, run a verify script, iterate. Cursor
        agents wrote most of it.
      </p>

      <p>
        Music was easy too. I used Suno, kept the tracks that felt right, and
        moved on.
      </p>

      <h2>/ sprites</h2>

      <p>
        Pixel sprites were the painful part. Size, placement, animation. Getting
        a sprite that belongs in the world still means a pipeline.
      </p>

      <p>
        I started with GPT Image, then a pile of other tools, just to get
        something into the game. Generate a still. Crop, resize, slice a sheet.
        Drop it on a node. Run the game. Notice the golfer is two tiles too tall
        or the ball snaps on frame three. Start over.
      </p>

      <p>
        Models can make a picture. They can&apos;t really see the running game.
        They don&apos;t iterate on a GIF or a sprite sheet that is already in
        the scene. They don&apos;t know if a pickup is floating or an idle
        cycle pops.
      </p>

      <p>
        That&apos;s the friction if you want people to make small games without
        a pipeline. Logic and a vibe track are already there. Art is not.
      </p>

      <p>
        <a href="https://golf.bicrick.com" target="_blank" rel="noopener noreferrer">play Range Rat</a>
        {' | '}
        <a href="https://github.com/bicrick/golf_incremental" target="_blank" rel="noopener noreferrer">see the repo</a>
      </p>
    </ProjectDetail>
  );
}

export default GolfIncremental;
