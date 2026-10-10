import React from 'react';
import { CritterBody } from '../project/harness/Critter';
import '../project/harness/Critter.css';

// The harness post's mark: the pixel Claude strapped into a harness,
// swinging from a rope and kicking its legs.
export default function SwingMark() {
  return (
    <svg
      className="writing-bot swing-mark"
      viewBox="3 0 24 29.5"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse className="swing-shadow" cx="15" cy="28.6" rx="7" ry="0.9" />
      <g className="swing-arm">
        <rect className="swing-rope" x="14.6" y="0" width="0.8" height="10.6" />
        <path className="swing-ring" d="M14 10h2v2h-2zM14.6 10.6h.8v.8h-.8z" fillRule="evenodd" />
        <path className="swing-line" d="M11.4 14.2L14.4 11.8M18.6 14.2L15.6 11.8" />
        <CritterBody x={6} y={12} outfit="harness" walk />
      </g>
    </svg>
  );
}
