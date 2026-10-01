import React from 'react';
import HebBarLogo from './HebBarLogo';

const FILTERS = ['Met', 'Missed', 'Success', 'Running', 'Failed'];

const ROWS = [
  { job: 'store_inventory_extract', platform: 'Argo', sla: 'missed', bad: true },
  { job: 'price_zone_refresh', platform: 'Databricks', sla: 'met', status: 'Running', run: true },
  { job: 'tableau_sales_refresh', platform: 'Informatica', sla: 'met', status: 'Success' },
  { job: 'warehouse_counts', platform: 'Argo', sla: 'met', status: 'Success' },
];

function NightBoard() {
  return (
    <div className="heb-window" aria-hidden="true">
      <div className="heb-window-bar">
        <span>Workflows</span>
        <span className="heb-window-end">
          <span className="heb-scopes">
            <span className="heb-scope-knob" />
            <span className="heb-scope-label">my team</span>
            <span className="heb-scope-label is-platform">platform</span>
          </span>
          <HebBarLogo />
        </span>
      </div>
      <ul className="heb-chips">
        {FILTERS.map((chip) => (
          <li key={chip}>{chip}</li>
        ))}
      </ul>
      <div className="heb-window-body">
        <table className="heb-table">
          <thead>
            <tr>
              <th>workflow</th>
              <th>platform</th>
              <th>sla</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.job} className={row.bad ? 'is-bad is-live' : undefined}>
                <td>{row.job}</td>
                <td>{row.platform}</td>
                <td>
                  {row.bad ? (
                    <span className="heb-sla-live">
                      <span>met</span>
                      <span>missed</span>
                    </span>
                  ) : (
                    row.sla
                  )}
                </td>
                <td>
                  {row.bad ? (
                    <span className="heb-status-live">
                      <span className="heb-status is-pill is-ok">Success</span>
                      <span className="heb-status is-pill is-bad">Failed</span>
                    </span>
                  ) : (
                    <span className={row.run ? 'heb-status is-pill is-run' : 'heb-status is-pill is-ok'}>
                      {row.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NightBoard;
