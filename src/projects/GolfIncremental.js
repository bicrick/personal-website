import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function GolfIncremental() {
  return (
    <ProjectDetail
      title="range rat"
      date="August 2026"
      linkHref="https://golf.bicrick.com"
      linkLabel="play"
      abstract="I shipped a tiny golf incremental by treating coding agents as the workshop. Game logic and music were easy. Pixel sprites were not. This is a note on that gap — and what I wish the tools could see."
      seoTitle="Building Range Rat with Agents - the friction is the sprites"
      seoDescription="Patrick Brown (bicrick) on building Range Rat with coding agents: Godot logic and Suno music were easy, pixel sprites were the hard part. A note on agentic tools, visual QA, and making games without much technical know-how."
      seoKeywords="bicrick, Patrick Brown, Range Rat, agentic coding, Cursor, Godot, pixel art, sprites, Suno, PixelLab, golf incremental"
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
        Range Rat — play it at golf.bicrick.com. This page is about how it was built.
      </p>

      <h2>/ play</h2>

      <p>
        The browser build lives at{' '}
        <a href="https://golf.bicrick.com" target="_blank" rel="noopener noreferrer">
          golf.bicrick.com
        </a>
        . Click once to unlock audio, then swing. Godot 4, GDScript, portrait-friendly
        on a phone. It is unfinished. That is fine.
      </p>

      <h2>/ agents as the workshop</h2>

      <p>
        I did not sit down to write a manifesto about golf. I sat down with Cursor
        agents and an open source engine and treated the whole thing as an artistic
        playground. Range Rat is a driving-range incremental — swing, pick up balls,
        hire a crew, cash out cheese if you stay long enough — but the interesting
        part for me was not the loop. It was using agents as the workshop: a place
        to try a feel, keep what landed, and throw the rest away without pretending
        I had a production pipeline.
      </p>

      <p>
        Cursor agents wrote most of the game logic. I kept verify scripts around so
        a change could be smoke-checked headless instead of only by eye. The web
        export is a static Godot build (OGG music, one track at a time so the first
        download stays lean). PixelLab&apos;s MCP did some of the sprite work. None
        of that is the thesis. The thesis is which parts of making a game are
        actually easy now, and which parts still fight you.
      </p>

      <h2>/ what was easy</h2>

      <p>
        Music was the compass. I used Suno, and it was easy in the way I wish more
        of this were easy: generate, listen, keep the track that told me what the
        range should feel like. The songs decided the mood before the camera or the
        bay did. Once I had that, I could tell an agent &quot;more like this&quot;
        about pacing and atmosphere without writing a design doc.
      </p>

      <p>
        Game logic was easy in the same spirit. Godot 4 plus GDScript is a good
        surface for agents. Incremental rules, pickups, cameras, a web export
        script — that is the kind of work agentic coding is already good at. You
        can describe a loop, get a scene, run a verify script, and iterate. I am
        not saying it is automatic. I am saying the bottleneck moved.
      </p>

      <h2>/ the friction is the sprites</h2>

      <p>
        Visuals were the hard part. Not &quot;I wish I were a better artist.&quot;
        The tools. Getting a pixel sprite that belongs in the world — right size,
        right placement, animation that does not jitter — is still a pipeline, not
        a conversation.
      </p>

      <p>
        The path I actually walked was GPT Image, then a chain of other tools,
        just to get something into the game. PixelLab helped for some sprites.
        None of it felt like the music loop, where I could hear the result and
        decide in one sitting. For art, the model generates a still. Then I crop,
        resize, slice a sheet, drop it on a node, run the game, notice the golfer
        is two tiles too tall or the ball snaps on frame three, and start over.
        Sizing, placement, and animation ate more time than the systems those
        sprites were supposed to dress.
      </p>

      <p>
        Sprite creation and world placement was the most friction-heavy part of
        the project. Multimodal models can make a picture. They cannot yet look
        through the player&apos;s eyes into the running game, notice that the
        pickup is floating, and fix it. They do not iterate on the art that is
        already in the scene. They do not know the tileset they are supposed to
        fit. You end up as the human glue between generate, import, place, and
        play — which is exactly the glue I wanted agents to eat.
      </p>

      <h2>/ what I wish the tools could do</h2>

      <p>
        I want models that treat existing art as the source of truth. Not a new
        image every prompt. Iterate on the sprite that is already in the bay.
        Match the palette. Respect the grid. Look at the game the way a player
        does, then fix problems on their own: too big, too small, one pixel off
        the tee, an idle cycle that pops.
      </p>

      <p>
        I also want temporal capability. Ingest a GIF or a multi-frame sheet and
        make the pixel animation coherent — same silhouette, same timing, no
        frame that looks like a different character. Right now still-image models
        and sheet-slicing tools do not share a brain. An agent that can see
        motion, not just a frame, would close a lot of this gap.
      </p>

      <p>
        Call it autonomous visual QA. The same way I already run headless verify
        scripts for logic, I want an agent that can boot the scene, look at it,
        and say the rat&apos;s hat clips the camera or the ball shadow is on the
        wrong layer — then patch the sprite or the node without me screenshotting
        a postmortem. Until that exists, visuals stay the part you babysit.
      </p>

      <h2>/ why that matters</h2>

      <p>
        The point of this playground is not that I shipped another incremental.
        It is that a layperson should be able to make a small game without much
        technical know-how, on open source Godot, with agents as the workshop.
        Logic is getting there. Audio, at least for a vibe track, is already
        there. Art is not.
      </p>

      <p>
        If the dream is &quot;describe a driving range and play it,&quot; the
        missing piece is not another upgrade tree. It is a model that can see
        the world it is decorating and keep decorating until it fits. I would
        rather say that plainly than pretend Range Rat was blocked on systems
        work. It was not. It was blocked on sprites.
      </p>

      <h2>/ unfinished</h2>

      <p>
        The game is playable and incomplete. Prestige cheese is in there if you
        want a longer loop. I am not going to walk the feature list. I would
        rather you hear the music, notice the pixels that still fight the grid,
        and take this as a status report on the tools: agents made the workshop
        real. They have not made the art department real yet.
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
