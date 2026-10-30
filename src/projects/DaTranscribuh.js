import React, { useEffect, useRef } from 'react';
import ProjectDetail from '../components/ProjectDetail';
import './DaTranscribuh.css';

const SITE = 'https://da-transcribuh-site.vercel.app';
const DOWNLOAD = 'https://da-transcribuh-site.vercel.app/download';
const REPO = 'https://github.com/bicrick/da-transcribuh';
const IMG = `${process.env.PUBLIC_URL}/images/da-transcribuh`;

/** Theme-aware looping pill; pauses when prefers-reduced-motion. */
function ThemePill() {
  const lightRef = useRef(null);
  const darkRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const reduce = mq.matches;
      [lightRef.current, darkRef.current].forEach((v) => {
        if (!v) return;
        if (reduce) {
          v.pause();
          try {
            v.currentTime = 0;
          } catch (_) {
            /* ignore */
          }
        } else if (v.paused) {
          v.play().catch(() => {});
        }
      });
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <div className="dt-visual dt-pill-loop" aria-hidden="true">
      <video
        ref={lightRef}
        className="dt-theme-light"
        src={`${IMG}/da-transcribuh-pill-light.mp4`}
        poster={`${IMG}/da-transcribuh-pill-light-poster.jpg`}
        width={768}
        height={432}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <video
        ref={darkRef}
        className="dt-theme-dark"
        src={`${IMG}/da-transcribuh-pill-dark.mp4`}
        poster={`${IMG}/da-transcribuh-pill-dark-poster.jpg`}
        width={768}
        height={432}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    </div>
  );
}

/** Static island-ish pill with capture chip + grab thumb (Ink / Departure Mono feel). */
function CaptureVisual() {
  return (
    <div className="dt-visual dt-capture" aria-hidden="true">
      <div className="dt-capture-pill">
        <span className="dt-capture-dot" />
        <span className="dt-capture-clock">0:04</span>
        <span className="dt-capture-wave">
          {Array.from({ length: 28 }, (_, i) => {
            const t = i / 27;
            const env = 1 - Math.abs(t - 0.5) * 1.4;
            const h = 22 + Math.max(0.2, env) * 48 * (0.55 + 0.45 * Math.sin(i * 1.7));
            return <i key={i} style={{ height: `${h}%` }} />;
          })}
        </span>
        <span className="dt-capture-chip">
          <span className="dt-capture-chip-n">1</span>
          <svg width="10" height="10" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
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
      </div>
      <div className="dt-capture-grab">
        <img
          src={`${IMG}/grab-thumb.jpg`}
          alt=""
          width={120}
          height={72}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}

/**
 * Quiet static mock of ClipboardHistoryView (Paint ink panel, Maccy-structured).
 * Colors / spacing / mono from InkTheme + ClipboardHistoryView.swift.
 */
function ClipboardVisual() {
  const rows = [
    { text: 'make this button blue and bump the price font', shortcut: '⌘1', selected: true },
    { text: 'https://bakery.shop/loaf', shortcut: '⌘2' },
    { text: 'sourdough · crust, crumb, and a little butter', shortcut: '⌘3' },
    { text: 'ship the demo when patrick says so', shortcut: '⌘4' },
  ];
  return (
    <div className="dt-visual dt-clip" aria-hidden="true">
      <div className="dt-clip-panel">
        <div className="dt-clip-header">
          <span className="dt-clip-title">Clipboard</span>
          <span className="dt-clip-search">
            <svg className="dt-clip-search-glyph" width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
              <circle cx="4.4" cy="4.4" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M6.7 6.7 L9.6 9.6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span>type to search…</span>
          </span>
        </div>
        <div className="dt-clip-rule" />
        <ul className="dt-clip-list">
          {rows.map((row) => (
            <li key={row.shortcut} className={row.selected ? 'is-selected' : undefined}>
              <span className="dt-clip-text">{row.text}</span>
              <span className="dt-clip-key">{row.shortcut}</span>
            </li>
          ))}
        </ul>
        <div className="dt-clip-hair" />
        <div className="dt-clip-footer">
          <div>
            <span>Clear</span>
            <span className="dt-clip-key">⌥⌘⌫</span>
          </div>
          <div>
            <span>Preferences…</span>
            <span className="dt-clip-key">⌘,</span>
          </div>
          <div>
            <span>Quit</span>
            <span className="dt-clip-key">⌘Q</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DaTranscribuh() {
  return (
    <ProjectDetail
      title="da transcribuh"
      date="October 2026"
      linkHref={REPO}
      linkLabel="view repo"
      secondaryLinkHref={SITE}
      secondaryLinkLabel="try here"
      tertiaryLinkHref={DOWNLOAD}
      tertiaryLinkLabel="download"
    >
      <p>
        free and MIT. Apple Silicon and Intel, macOS 14+. transcription runs on-device
        with Parakeet v2.
      </p>

      <p>
        <a href={SITE} target="_blank" rel="noopener noreferrer">
          try da transcribuh
        </a>
        {' | '}
        <a href={DOWNLOAD} target="_blank" rel="noopener noreferrer">
          download for mac
        </a>
        {' | '}
        <a href={REPO} target="_blank" rel="noopener noreferrer">
          source on github
        </a>
      </p>

      <h2>/ on-device</h2>
      <ThemePill />
      <p>parakeet v2 runs on your mac. private, fast, no cloud.</p>

      <h2>/ screenshots</h2>
      <CaptureVisual />
      <p>grab part of the screen while you talk. pics and words paste together.</p>

      <h2>/ clipboard</h2>
      <ClipboardVisual />
      <p>⌘⇧C opens history by your pointer. pin the ones you keep.</p>
    </ProjectDetail>
  );
}

export default DaTranscribuh;
