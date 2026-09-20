import React, { useEffect, useState } from 'react';

const STORAGE = 'theme';
const DARK_MARK = '#';

function readDark() {
  try {
    return window.localStorage.getItem(STORAGE) === 'dark';
  } catch {
    return false;
  }
}

function persist(dark) {
  try {
    window.localStorage.setItem(STORAGE, dark ? 'dark' : 'light');
  } catch {
    /* ignore quota / private mode */
  }
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
    applyHtml(dark);
    persist(dark);
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
