import React from 'react';

const SOURCES = ['Composer', 'Argo', 'Databricks', 'Informatica'];

function EventBus() {
  return (
    <div className="heb-fig heb-flow" aria-hidden="true">
      <span className="heb-flow-kicker is-sources">sources</span>
      <span className="heb-flow-kicker is-bus">collects</span>
      <span className="heb-flow-kicker is-orch">orchestrates</span>
      <ul className="heb-flow-sources">
        {SOURCES.map((source) => (
          <li key={source}>{source}</li>
        ))}
      </ul>
      <div className="heb-flow-rail is-in"><i /></div>
      <div className="heb-flow-node is-bus">
        ebus
        <span>every run event</span>
      </div>
      <div className="heb-flow-rail is-out"><i /></div>
      <div className="heb-flow-node is-orch">
        dependency service
        <span>jobs and data across platforms</span>
      </div>
    </div>
  );
}

export default EventBus;
