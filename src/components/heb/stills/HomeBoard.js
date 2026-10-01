import React from 'react';
import HebBarLogo from './HebBarLogo';

const HEALTH = ['UI', 'BigQuery', 'Ingest'];

const PAGES = [
  ['Composer', 'DAG runs'],
  ['SLA', 'deadlines'],
  ['Watermarks', 'table freshness'],
  ['Ingest', 'loads and streams'],
  ['Replay', 'a past ingest'],
  ['Streams', 'processing jobs'],
  ['Health', 'services on the bus'],
  ['ML pipelines', 'schedules and endpoints'],
];

function HomeBoard() {
  return (
    <div className="heb-window" aria-hidden="true">
      <div className="heb-window-bar">
        <span>Home</span>
        <HebBarLogo />
      </div>
      <ul className="heb-health">
        {HEALTH.map((name) => (
          <li key={name}>
            <span className="heb-status is-pill is-ok">Healthy</span>
            {name}
          </li>
        ))}
      </ul>
      <ul className="heb-pages">
        {PAGES.map(([title, detail]) => (
          <li key={title}>
            <strong>{title}</strong>
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomeBoard;
