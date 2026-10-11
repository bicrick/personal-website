import React from 'react';
import useInView from './useInView';

// A quiet pull-stat: the site's pixel face, small and precise.
export function Stat({ value, label }) {
  const { ref, on } = useInView();
  return (
    <div ref={ref} className={`hs-stat${on ? ' is-on' : ''}`}>
      <span className="hs-stat-value">{value}</span>
      <span className="hs-stat-label">{label}</span>
    </div>
  );
}
