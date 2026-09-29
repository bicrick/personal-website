import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import ProjectFigure from '../components/project/ProjectFigure';
import ProjectPair from '../components/project/ProjectPair';

function Monocle() {
  return (
    <ProjectDetail
      title="monocle"
      date="September 2026"
      linkHref="https://github.com/bicrick/monocle"
      linkLabel="view repo"
      abstract="A Chrome extension that restyles the live tab using your local Cursor CLI. Site JavaScript and media keep running. No cloud API key required."
    >
      <ProjectPair>
        <ProjectFigure
          src={`${process.env.PUBLIC_URL}/images/monocle/wordle-before.png`}
          alt="Wordle before Monocle"
          caption="before"
        />
        <ProjectFigure
          src={`${process.env.PUBLIC_URL}/images/monocle/wordle-after.png`}
          alt="Wordle after a medieval restyle"
          caption="after: make this medieval themed"
        />
      </ProjectPair>

      <h2>/ the idea</h2>

      <p>
        I wanted the model that already lives in my editor to see the page I am looking at and change it, without killing the page&apos;s own scripts. Monocle snapshots the open tab, talks to a local companion, and applies sandboxed scene patches: CSS, overlay HTML, DOM ops, and optional Three.js.
      </p>

      <h2>/ cursor first</h2>

      <p>
        The default provider is Cursor CLI on this machine. The companion runs <code>agent -p</code> with tools, stream-json, and a tab MCP. Each restyle chat is isolated so the agent does not edit your repo. Anthropic, OpenAI, and xAI stay optional fallbacks.
      </p>

      <p>
        This is the most Cursor-shaped thing I have shipped: an editor agent driving a live browser surface. The code is in{' '}
        <a href="https://github.com/bicrick/monocle" target="_blank" rel="noopener noreferrer">bicrick/monocle</a>.
      </p>
    </ProjectDetail>
  );
}

export default Monocle;
