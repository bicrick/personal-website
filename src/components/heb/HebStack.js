import React from 'react';
import { MARKS } from './marks';
import './HebStack.css';

const STACK = [
  'python',
  'react',
  'fastapi',
  'postgres',
  'docker',
  'aws',
  'kubernetes',
  'argo',
  'gcp',
  'cloudrun',
  'storage',
  'bigquery',
  'cloudsql',
  'firestore',
  'composer',
  'kafka',
  'tableau',
  'confluence',
  'terraform',
];

function HebStack() {
  return (
    <section className="heb-stack" aria-label="technologies">
      <h2 className="heb-stack-kicker">technologies</h2>
      <ul className="heb-stack-list">
        {STACK.map((id) => {
          const mark = MARKS[id];
          return (
            <li key={id} className="heb-stack-item">
              <span className="heb-stack-icon">{mark.icon}</span>
              <span className="heb-stack-label">{mark.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default HebStack;
