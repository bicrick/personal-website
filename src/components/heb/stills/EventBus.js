import React from 'react';

const SOURCES = ['Composer', 'Argo', 'Databricks'];

function EventBus() {
  return (
    <div className="heb-bus" aria-hidden="true">
      <ul className="heb-bus-sources">
        {SOURCES.map((source) => (
          <li key={source}>{source}</li>
        ))}
      </ul>
      <span className="heb-bus-arrow">→</span>
      <div className="heb-bus-node">
        Kafka
        <span>lineage</span>
      </div>
      <span className="heb-bus-arrow">→</span>
      <div className="heb-bus-node">dashboard</div>
    </div>
  );
}

export default EventBus;
