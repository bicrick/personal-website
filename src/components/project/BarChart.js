import React from 'react';
import './BarChart.css';

export default function BarChart({ caption, rows, unit }) {
  const max = Math.max(...rows.map((row) => row.value));

  return (
    <figure className="bar-chart">
      <ul>
        {rows.map((row) => (
          <li key={row.label}>
            <span className="bar-chart-label">{row.label}</span>
            <span className="bar-chart-track">
              <span
                className="bar-chart-fill"
                style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
              />
            </span>
            <span className="bar-chart-value">
              {row.display || row.value}
              {unit ? ` ${unit}` : ''}
            </span>
          </li>
        ))}
      </ul>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
