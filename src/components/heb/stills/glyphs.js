import React from 'react';

function Glyph({ children }) {
  return (
    <svg className="heb-glyph" viewBox="0 0 48 32" aria-hidden="true">
      {children}
    </svg>
  );
}

export function GlyphUi() {
  return (
    <Glyph>
      <rect x="4" y="3" width="40" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 10h40M11 16h22M11 21h13" stroke="currentColor" strokeWidth="1.5" />
    </Glyph>
  );
}

export function GlyphCloud() {
  return (
    <Glyph>
      <path
        d="M16 25h17.5a5.2 5.2 0 0 0 .6-10.4 7.2 7.2 0 0 0-13.6-2.4A5.6 5.6 0 0 0 16 25z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Glyph>
  );
}

export function GlyphNet() {
  return (
    <Glyph>
      <circle cx="24" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="25" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="38" cy="25" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21.6 9.2 12.2 22.2M26.4 9.2 35.8 22.2M13 25h22" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </Glyph>
  );
}

export function GlyphArgo() {
  return (
    <Glyph>
      <rect x="2" y="9" width="13" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="33" y="9" width="13" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M17 13h12M29 13l-3.2-2.4M29 13l-3.2 2.4M31 19H19M19 19l3.2-2.4M19 19l3.2 2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Glyph>
  );
}
