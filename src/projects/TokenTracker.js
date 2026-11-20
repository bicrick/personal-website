import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import LiveSiteEmbed from '../components/project/LiveSiteEmbed';

const SITE = 'https://tokentracker.patrickbrown.dev';
const REPO = 'https://github.com/bicrick/tokentracker';

function TokenTracker() {
  return (
    <ProjectDetail
      title="tokentracker"
      date="November 2026"
      linkHref={SITE}
      linkLabel="tokentracker.patrickbrown.dev"
      secondaryLinkHref={REPO}
      secondaryLinkLabel="view repo"
      abstract="Every token my AI coding tools process, across every tool and every machine, in one public API."
    >
      <LiveSiteEmbed
        src={`${SITE}/u/bicrick`}
        title="tokentracker"
        viewW={1280}
        viewH={900}
        caption="my live profile on tokentracker"
      />

      <p>
        i use tokens in a lot of places. for a while it was mostly cursor, and cursor shows you
        your usage. but a lot of my tokens go through claude code and opencode, and at work
        those run through github copilot. none of that showed up anywhere.
      </p>

      <p>
        i wanted one place that tracked all of it. so i made a tool and open sourced it.
        one command finds the tools on your machine, uploads token counts per day and model,
        and syncs hourly after that:
      </p>

      <pre>
        <code>npx @bicrick/tokentracker init</code>
      </pre>

      <p>
        only counts leave your machine. no prompts, no code. the result is a keyless json api
        with stats, models, tools, and a heatmap, which is what powers{' '}
        <a href="/tokens">my tokens page</a>.
      </p>

      <p>
        <a href={SITE} target="_blank" rel="noopener noreferrer">tokentracker.patrickbrown.dev</a>
        {' · '}
        <a href={REPO} target="_blank" rel="noopener noreferrer">github.com/bicrick/tokentracker</a>
      </p>
    </ProjectDetail>
  );
}

export default TokenTracker;
