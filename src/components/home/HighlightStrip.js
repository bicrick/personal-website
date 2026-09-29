import React from 'react';
import { Link } from 'react-router-dom';
import './HighlightStrip.css';

const HIGHLIGHTS = [
  {
    label: '45.167s QWOP record',
    href: '/projects/qwop-python',
  },
  {
    label: 'MSAI 3.84',
    href: '/projects/ai-masters',
  },
  {
    label: '10+ teams at H-E-B',
    href: '/heb',
  },
];

export default function HighlightStrip() {
  return (
    <p className="home-proof" aria-label="highlights">
      {HIGHLIGHTS.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 ? <span className="nav-separator">·</span> : null}
          <Link to={item.href}>{item.label}</Link>
        </React.Fragment>
      ))}
    </p>
  );
}
