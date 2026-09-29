import React from 'react';
import './FlowDiagram.css';

export default function FlowDiagram({ caption, steps }) {
  return (
    <figure className="flow-diagram">
      <ol>
        {steps.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <span>{step.detail}</span>
          </li>
        ))}
      </ol>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
