import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import ProjectFigure from '../components/project/ProjectFigure';
import ProjectPair from '../components/project/ProjectPair';
import {
  MonocleDemo,
  MonocleLoop,
  PatchAnatomy,
} from '../components/project/monocle';

function Monocle() {
  return (
    <ProjectDetail
      title="monocle"
      tldr="Tell the tab how it should look. Its JavaScript never stops."
      date="September 2026"
      linkHref="https://github.com/bicrick/monocle"
      linkLabel="view repo"
      abstract="A Chrome extension that restyles the live tab using your local Cursor CLI. Site JavaScript and media keep running. No cloud API key required."
    >
      <MonocleDemo />

      <h2>/ the idea</h2>

      <p>
        Dark mode extensions recolor a page. Userscripts rewrite one site at a time. I wanted to
        say &ldquo;make this medieval&rdquo; to any page and have it happen, without breaking the
        page. The video keeps playing, the game keeps its state, the feed keeps scrolling.
      </p>

      <p>
        So the model never edits the page. It returns a patch: CSS, overlay HTML, a few DOM ops,
        and optionally some Three.js. A content script validates the patch and applies it to the
        tab that is already open.
      </p>

      <ProjectPair>
        <ProjectFigure
          src={`${process.env.PUBLIC_URL}/images/monocle/wordle-before.png`}
          alt="Wordle before Monocle"
          caption="before"
        />
        <ProjectFigure
          src={`${process.env.PUBLIC_URL}/images/monocle/wordle-after.png`}
          alt="Wordle after a medieval restyle"
          caption="after: make this medieval themed (the real extension, not the demo)"
        />
      </ProjectPair>

      <h2>/ the loop</h2>

      <p>
        The side panel sends your prompt and a snapshot of the tab to a companion process on
        localhost. The companion runs <code>agent -p</code>, the Cursor CLI in print mode, with a
        small tab MCP so the agent can read the page or follow a link when it needs more than the
        snapshot. What comes back is a patch.
      </p>

      <MonocleLoop />

      <h2>/ what a patch can do</h2>

      <p>
        A patch is a small, closed vocabulary. That is what makes it safe to apply to a page the
        model has never seen before.
      </p>

      <PatchAnatomy />

      <h2>/ keeping the page alive</h2>

      <p>
        The demo above is the whole argument. Type a guess, restyle, keep guessing. The board and
        the page timer never reset, because nothing in a patch touches the page&apos;s own
        scripts. On a real site the same rule protects video players: elements that are, or
        contain, <code>video</code> or <code>audio</code> are never wrapped, moved, or removed,
        and the overlay is cut out around them.
      </p>

      <p>
        Model-written JavaScript is the risky part, so it runs in a sandboxed frame and talks to
        the page through a narrow host API. Patches that reach for <code>chrome.*</code>, raw
        WebGL, or external CDN scripts are rejected before they run. Every call the agent
        influences is wrapped so a throw cannot take the extension down with it.
      </p>

      <h2>/ cursor first</h2>

      <p>
        The default provider is Cursor CLI on this machine, so there is no API key to paste. Each
        restyle chat gets its own isolated working directory, which means the agent cannot touch
        your repo. Up to eight sessions run at once. Anthropic, OpenAI, and xAI stay optional
        fallbacks.
      </p>

      <p>
        This is the most Cursor-shaped thing I have shipped: an editor agent driving a live
        browser surface. The code is in{' '}
        <a href="https://github.com/bicrick/monocle" target="_blank" rel="noopener noreferrer">bicrick/monocle</a>.
      </p>
    </ProjectDetail>
  );
}

export default Monocle;
