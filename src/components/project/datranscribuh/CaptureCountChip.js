import React from 'react';
import { ClassicScale, Ink } from './ink';

/** Port of CaptureCountChip.swift — flat hairline chip with count + photo glyph. */
export default function CaptureCountChip({ count = 1 }) {
  const padX = ClassicScale.chipMinHeight >= 28 ? Ink.space2 : Ink.space1 + 2;
  return (
    <span
      className="dtd-chip"
      style={{
        paddingLeft: padX,
        paddingRight: padX,
        minHeight: ClassicScale.chipMinHeight,
      }}
      aria-label={`${count} ${count === 1 ? 'capture' : 'captures'}`}
    >
      <span className="dtd-chip-count">{count}</span>
      <svg
        className="dtd-chip-icon"
        width={ClassicScale.chipIconSize}
        height={ClassicScale.chipIconSize}
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        {/* SF Symbol "photo" stand-in — filled rectangle + mountain */}
        <rect x="1" y="3" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="5.2" cy="6.4" r="1.2" fill="currentColor" />
        <path d="M2.5 12 L6.2 8.2 L8.5 10.4 L11 7.5 L14.5 12 Z" fill="currentColor" />
      </svg>
    </span>
  );
}
