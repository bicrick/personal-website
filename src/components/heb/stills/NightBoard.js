import React from 'react';

const CHIPS = ['runs', 'SLAs', 'extracts', 'Tableau', 'on-call'];

const ROWS = [
  { job: 'store_inventory_extract', status: 'failed', sla: 'missed', ran: '03:12', bad: true },
  { job: 'price_zone_refresh', status: 'ok', sla: 'met', ran: '02:40', bad: false },
  { job: 'tableau_sales_refresh', status: 'ok', sla: 'met', ran: '01:15', bad: false },
  { job: 'warehouse_counts', status: 'ok', sla: 'met', ran: '00:05', bad: false },
];

function NightBoard() {
  return (
    <div className="heb-window" aria-hidden="true">
      <div className="heb-window-bar">
        <span>control room</span>
        <span className="heb-scopes">
          <span>my team</span>
          <span className="is-on">platform</span>
        </span>
      </div>
      <ul className="heb-chips">
        {CHIPS.map((chip) => (
          <li key={chip}>{chip}</li>
        ))}
      </ul>
      <div className="heb-window-body">
        <table className="heb-table">
          <thead>
            <tr>
              <th>job</th>
              <th>status</th>
              <th>sla</th>
              <th>ran</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.job} className={row.bad ? 'is-bad' : undefined}>
                <td>{row.job}</td>
                <td>
                  <span className={row.bad ? 'heb-status is-bad' : 'heb-status is-ok'}>
                    {row.status}
                  </span>
                </td>
                <td>{row.sla}</td>
                <td>{row.ran}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NightBoard;
