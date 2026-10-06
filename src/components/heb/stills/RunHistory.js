import React from 'react';

const RUNS = 20;

// Each job is a row of runs. 'ok', 'bad', or 'run' for the one in flight.
function history(failedAt, running) {
  return Array.from({ length: RUNS }, (_, i) => {
    if (running && i === RUNS - 1) return 'run';
    if (failedAt.includes(i)) return 'bad';
    return 'ok';
  });
}

const JOBS = [
  { name: 'demand forecast', runs: history([], false) },
  { name: 'inventory reorder', runs: history([], true) },
  { name: 'spoilage model', runs: history([RUNS - 1], false), failed: true },
];

function RunHistory() {
  return (
    <div className="heb-fig heb-runs" aria-hidden="true">
      {JOBS.map((job) => (
        <div key={job.name} className="heb-runs-row">
          <span className="heb-runs-name">{job.name}</span>
          <div className="heb-runs-cells">
            {job.runs.map((state, i) => (
              <i key={`${job.name}-${i}`} className={`is-${state}`} />
            ))}
          </div>
        </div>
      ))}
      <div className="heb-runs-note">
        <span>one square, one run</span>
        <b>spoilage model failed: out of memory</b>
      </div>
    </div>
  );
}

export default RunHistory;
