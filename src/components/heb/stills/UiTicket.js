import React from 'react';

const ROWS = [
  ['store_inventory_extract', 'list'],
  ['price_zone_refresh', 'detail'],
  ['warehouse_counts', 'list'],
];

function UiTicket() {
  return (
    <div className="heb-window" aria-hidden="true">
      <div className="heb-window-bar">workflows</div>
      <div className="heb-window-body">
        <div className="heb-filter">filter jobs</div>
        <table className="heb-table">
          <thead>
            <tr>
              <th>job</th>
              <th>page</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([job, page]) => (
              <tr key={job}>
                <td>{job}</td>
                <td>{page}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UiTicket;
