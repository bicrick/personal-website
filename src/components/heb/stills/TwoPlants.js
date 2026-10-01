import React from 'react';

const AWS = ['EKS', 'Postgres', 'the old UI'];
const GCP = ['Cloud Run', 'Firestore', 'Composer'];
const METERS = ['92%', '74%', '41%'];

function TwoPlants() {
  return (
    <div className="heb-plants" aria-hidden="true">
      <section className="heb-plant">
        <h3>AWS</h3>
        <p className="heb-plant-state">still serving</p>
        <ul>
          {AWS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="heb-plant is-next">
        <h3>GCP</h3>
        <p className="heb-plant-state">taking load</p>
        <ul>
          {GCP.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="heb-meters">
          <p className="heb-meters-label">BigQuery freshness</p>
          {METERS.map((width) => (
            <span key={width} style={{ width }} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default TwoPlants;
