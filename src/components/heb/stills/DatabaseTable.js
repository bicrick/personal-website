import React from 'react';

const ROWS = [
  ['14', 'store_inventory_extract', 'failed'],
  ['15', 'price_zone_refresh', 'running'],
  ['16', 'warehouse_counts', 'ok'],
];

function DatabaseTable() {
  return (
    <div className="heb-fig heb-db" aria-hidden="true">
      <svg className="heb-db-can" viewBox="0 0 48 72" aria-hidden="true">
        <path d="M8 14 v40 a16 6 0 0 0 32 0 V14" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="24" cy="14" rx="16" ry="6" fill="var(--paper)" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="24" cy="14" rx="10" ry="3" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className="heb-db-sheet">
        <div className="heb-db-name">postgres · jobs</div>
        <div className="heb-db-grid is-head">
          <span>id</span>
          <span>name</span>
          <span>status</span>
        </div>
        {ROWS.map((row) => (
          <div key={row[0]} className="heb-db-grid">
            {row.map((cell) => (
              <span key={cell}>{cell}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DatabaseTable;
