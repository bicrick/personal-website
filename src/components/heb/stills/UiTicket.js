import React from 'react';
import HebBarLogo from './HebBarLogo';

const ROWS = [
  ['store_inventory_extract', 'Running', 'is-run', true],
  ['price_zone_refresh', 'Success', 'is-ok', false],
  ['warehouse_counts', 'Failed', 'is-bad', false],
];

function UiTicket() {
  return (
    <div className="heb-window heb-ticket" aria-hidden="true">
      <div className="heb-window-bar">
        <span>Workflows</span>
        <HebBarLogo />
      </div>
      <div className="heb-window-body">
        <div className="heb-filter">
          <span className="heb-filter-hint">filter jobs</span>
          <span className="heb-filter-query">inventory</span>
        </div>
        <div className="heb-jobs-head">
          <span>job</span>
          <span>status</span>
        </div>
        {ROWS.map(([job, status, tone, hit]) => (
          <div key={job} className={hit ? 'heb-job is-hit' : 'heb-job is-miss'}>
            <span>{job}</span>
            <span className={`heb-status is-pill ${tone}`}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UiTicket;
