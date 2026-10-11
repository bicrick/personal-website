import React from 'react';
import useInView from './useInView';

// Loud type: the post's question, and its pull-stats.
export function Display({ children }) {
  return <div className="hs-display" role="heading" aria-level="2">{children}</div>;
}

export function Stat({ value, label }) {
  const { ref, on } = useInView();
  return (
    <div ref={ref} className={`hs-stat${on ? ' is-on' : ''}`}>
      <span className="hs-stat-value">{value}</span>
      <span className="hs-stat-label">{label}</span>
    </div>
  );
}

export function Beat({ children }) {
  return <div className="hs-beat">{children}</div>;
}
