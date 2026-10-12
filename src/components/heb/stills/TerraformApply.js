import React from 'react';
import './TerraformApply.css';

const LINES = [
  [['resource', 'kw'], [' '], ['"google_cloud_run_v2_service"', 'str'], [' '], ['"api"', 'str'], [' {']],
  [['  name     = '], ['"dashboard-api"', 'str']],
  [['  location = '], ['"us-central1"', 'str']],
  [['  template {']],
  [['    containers { image = var.image }']],
  [['  }']],
  [['}']],
];

function TerraformApply() {
  return (
    <div className="heb-fig heb-tf" aria-hidden="true">
      <div className="heb-tf-pane is-code">
        <span className="heb-tf-kicker">main.tf</span>
        <div className="heb-tf-code">
          {LINES.map((segments, index) => (
            <div key={index} className="heb-tf-line" style={{ '--i': index }}>
              {segments.map(([text, tone], part) => (
                <span key={part} className={tone ? `is-${tone}` : undefined}>{text}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="heb-tf-link"><i /></div>

      <div className="heb-tf-pane is-result">
        <span className="heb-tf-kicker">terraform apply</span>
        <div className="heb-tf-plan">
          <span className="heb-tf-resource">+ google_cloud_run_v2_service.api</span>
          <span className="heb-tf-status">
            <b className="is-before">creating...</b>
            <b className="is-after">creation complete</b>
          </span>
        </div>
        <div className="heb-tf-card">
          <span className="heb-tf-card-name">dashboard-api</span>
          <span className="heb-tf-badge">Running</span>
        </div>
      </div>
    </div>
  );
}

export default TerraformApply;
