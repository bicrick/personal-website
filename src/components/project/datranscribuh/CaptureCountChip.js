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
        {/* SF Symbol "photo" stand-in — rounded rect, mountain + sun, stroke weight ~black */}
        <rect
          x="1.25"
          y="3.25"
          width="13.5"
          height="9.5"
          rx="2"
          ry="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <circle cx="5.1" cy="6.35" r="1.15" fill="currentColor" />
        <path
          d="M2.6 11.6 L6.1 7.9 L8.35 10.05 L10.9 7.35 L13.5 11.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
