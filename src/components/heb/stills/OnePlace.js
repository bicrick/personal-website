import React from 'react';

const LINES = [
  ['process', 'store_inventory_extract', false],
  ['failure', 'no column store_id', true],
  ['sla', 'nightly by 06:00, missed', false],
  ['history', '03:12 failed, 02:40 ok', false],
  ['cost', '$4.20 this run', false],
];

function OnePlace() {
  const stream = [...LINES, ...LINES];

  return (
    <div className="heb-fig heb-one" aria-hidden="true">
      <div className="heb-one-lines">
        {stream.map(([label, value, error], index) => (
          <span
            key={`${label}-${index}`}
            className={index >= LINES.length ? 'is-copy' : undefined}
          >
            <b>{label}</b>
            <i className={error ? 'is-error' : undefined}>{value}</i>
          </span>
        ))}
      </div>
    </div>
  );
}

export default OnePlace;
