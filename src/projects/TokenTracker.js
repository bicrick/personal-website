import React from 'react';
import ProjectDetail from '../components/ProjectDetail';
import LiveSiteEmbed from '../components/project/LiveSiteEmbed';

const SITE = 'https://tokentracker.patrickbrown.dev';
const REPO = 'https://github.com/bicrick/tokentracker';
const DATA_REPO = 'https://github.com/bicrick/tokentracker-data';
const PROFILE = 'https://bicrick.github.io/tokentracker-data/';
const STATS = 'https://bicrick.github.io/tokentracker-data/api/v1/stats.json';

function TokenTracker() {
  return (
    <ProjectDetail
      title="tokentracker"
      date="November 2026"
      linkHref={SITE}
      linkLabel="tokentracker.patrickbrown.dev"
      secondaryLinkHref={REPO}
      secondaryLinkLabel="view repo"
      abstract="Every token my AI coding tools process, across every tool and every machine, saved to my own GitHub and served as a JSON API."
    >
      <LiveSiteEmbed
        src={SITE}
        title="tokentracker"
        viewW={1280}
        viewH={900}
        caption="tokentracker.patrickbrown.dev"
      />

      <p>
        i use tokens in a lot of places. for a while it was mostly cursor, and cursor shows you
        your usage. but a lot of my tokens go through claude code and opencode, and at work
        those run through github copilot. none of that showed up anywhere.
      </p>

      <p>
        i wanted one place that tracked all of it. so i made a tool and open sourced it.
        one command finds the tools on your machine, signs you in to github with a code, and
        syncs hourly after that:
      </p>

      <pre>
        <code>npx @bicrick/tokentracker init</code>
      </pre>

      <p>
        there is no account and no database. your daily token counts per tool and model go
        into a public repo on your own github,{' '}
        <a href={DATA_REPO} target="_blank" rel="noopener noreferrer">tokentracker-data</a>,
        and github pages publishes them as plain json. no prompts, no code, no keys. delete
        the repo and it is all gone.
      </p>

      <pre>
        <code>curl {STATS}</code>
      </pre>

      <LiveSiteEmbed
        src={PROFILE}
        title="tokentracker profile"
        viewW={1280}
        viewH={900}
        caption="my profile, built and hosted by GitHub Pages from my data repo"
      />

      <p>
        that is the api. no server, no key, and an agent can set the whole thing up for you.
        it is also what powers <a href="/tokens">my tokens page</a>.
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
