import React from 'react';

/** Hugeicons monocle (MIT), inlined so it follows currentColor. */
export default function MonocleMark({ size = 18, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6" />
      <circle cx="16" cy="8" r="2" />
      <path d="M22 17v2c0 .35-.06.687-.17 1M20 21.83a3 3 0 0 1-2 0M16 17v2c0 .35.06.687.17 1M22 8V5m0 9v-3m-6 3v-4" />
    </svg>
  );
}
