import React from 'react';

function AwsDiagram() {
  return (
    <div className="heb-fig heb-arch" aria-hidden="true">
      <div className="heb-arch-app">
        app
        <span>page · API · Postgres</span>
      </div>
      <div className="heb-arch-stem" />
      <div className="heb-arch-row">
        <div>
          EKS
          <span>cluster</span>
        </div>
        <i />
        <div>
          Lambda
          <span>jobs</span>
        </div>
        <i />
        <div>
          S3
          <span>buckets</span>
        </div>
      </div>
    </div>
  );
}

export default AwsDiagram;
