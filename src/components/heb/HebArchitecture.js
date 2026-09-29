import React from 'react';
import './HebArchitecture.css';

const PLANES = [
  {
    title: 'AWS, 2023',
    items: ['React UI', 'FastAPI', 'PostgreSQL', 'EKS / Docker', 'Informatica metadata'],
  },
  {
    title: 'the bus',
    items: ['Kafka events', 'dependency service', 'lineage across platforms'],
  },
  {
    title: 'GCP, 2025–26',
    items: ['Cloud Run', 'Cloud SQL + Firestore', 'BigQuery watermarks', 'Composer DAGs'],
  },
];

export default function HebArchitecture() {
  return (
    <figure className="heb-architecture">
      <div className="heb-architecture-grid">
        {PLANES.map((plane) => (
          <div key={plane.title} className="heb-architecture-plane">
            <h3>{plane.title}</h3>
            <ul>
              {plane.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <figcaption>
        Same product. The control plane moved from one cluster on AWS to Composer, Firestore, and BigQuery on GCP. Kafka stayed the bus.
      </figcaption>
    </figure>
  );
}
