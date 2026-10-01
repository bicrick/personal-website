import React from 'react';

const LINES = [
  ['out', 'GET', '/jobs'],
  ['in', '200', '{ id, status }'],
  ['out', 'POST', '/jobs/1/run'],
  ['in', '202', 'accepted'],
];

function ApiTrace() {
  return (
    <div className="heb-fig heb-trace" aria-hidden="true">
      {LINES.map(([dir, verb, rest]) => (
        <div key={`${verb} ${rest}`} className={dir === 'in' ? 'is-in' : 'is-out'}>
          <span>{dir === 'out' ? '→' : '←'}</span>
          <b>{verb}</b>
          {rest}
        </div>
      ))}
    </div>
  );
}

export default ApiTrace;
