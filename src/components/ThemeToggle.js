import React, { useEffect, useState } from 'react';

// 'system' follows the OS; 'light' and 'dark' are explicit picks
const STORAGE = 'theme-mode';
const LEGACY = 'theme';
const MODES = [
  { id: 'system', mark: '\u25A1', label: 'system theme' },
  { id: 'light', mark: '·', label: 'light mode' },
  { id: 'dark', mark: '#', label: 'dark mode' },
];

function readMode() {
  try {
    const mode = window.localStorage.getItem(STORAGE);
    if (mode === 'light' || mode === 'dark' || mode === 'system') return mode;
    // The old toggle stored 'light' for everyone, so only an explicit dark carries over
    return window.localStorage.getItem(LEGACY) === 'dark' ? 'dark' : 'system';
  } catch {
    return 'system';
  }
}

function persist(mode) {
  try {
    window.localStorage.setItem(STORAGE, mode);
  } catch {
    /* ignore quota / private mode */
  }
}

const systemQuery = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

function resolveDark(mode) {
  if (mode === 'system') return Boolean(systemQuery()?.matches);
  return mode === 'dark';
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
  applyHtml(resolveDark(readMode()));
}

export default function ThemeToggle() {
  const [mode, setMode] = useState(readMode);

  useEffect(() => {
    applyHtml(resolveDark(mode));
    persist(mode);
    if (mode !== 'system') return undefined;
    const query = systemQuery();
    if (!query) return undefined;
    const onChange = () => applyHtml(query.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, [mode]);

  const index = Math.max(0, MODES.findIndex((m) => m.id === mode));
  const current = MODES[index];
  const next = MODES[(index + 1) % MODES.length];

  return (
    <button
      type="button"
      className={`theme-toggle is-${current.id}`}
      aria-label={`${current.label}, switch to ${next.label}`}
      title={`${current.label} · click for ${next.label}`}
      onClick={() => setMode(next.id)}
    >
      {current.mark}
    </button>
  );
}
