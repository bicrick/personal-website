import React, { useEffect, useState } from 'react';

const STORAGE = 'theme';
const DARK_MARK = '#';

/** In-memory only — survives client-side route changes, resets on reload. */
let sessionDark = null;

function darkFromLocalHour() {
  const hour = new Date().getHours();
  // Daylight ~06:00–18:00 local; night otherwise. Time wins over prefers-color-scheme.
  return hour < 6 || hour >= 18;
}

function clearPersistedTheme() {
  try {
    window.localStorage.removeItem(STORAGE);
    window.sessionStorage.removeItem(STORAGE);
  } catch {
    /* ignore */
  }
}

function readDark() {
  if (sessionDark !== null) return sessionDark;
  clearPersistedTheme();
  sessionDark = darkFromLocalHour();
  return sessionDark;
}

function applyChromeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
  if (paper) meta.content = paper;
}

function applyHtml(dark) {
  document.documentElement.classList.toggle('is-dark', dark);
  applyChromeColor();
}

if (typeof document !== 'undefined') {
  applyHtml(readDark());
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(readDark);

  useEffect(() => {
    sessionDark = dark;
    clearPersistedTheme();
    applyHtml(dark);
  }, [dark]);

  return (
    <button
      type="button"
      className={`theme-toggle${dark ? ' is-dot' : ''}`}
      aria-pressed={dark}
      aria-label={dark ? 'light mode' : 'dark mode'}
      onClick={() => setDark((on) => !on)}
    >
      {dark ? '' : DARK_MARK}
    </button>
  );
}
