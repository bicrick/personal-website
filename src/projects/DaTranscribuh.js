import React, { useEffect, useRef } from 'react';
import ProjectDetail from '../components/ProjectDetail';
import './DaTranscribuh.css';

const SITE = 'https://da-transcribuh-site.vercel.app';
const DOWNLOAD = 'https://da-transcribuh-site.vercel.app/download';
const REPO = 'https://github.com/bicrick/da-transcribuh';
const IMG = `${process.env.PUBLIC_URL}/images/da-transcribuh`;

/** Theme-aware looping pill (tight crop); pauses when prefers-reduced-motion. */
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
        src={`${IMG}/da-transcribuh-pill-light-tight.mp4`}
        poster={`${IMG}/da-transcribuh-pill-light-tight-poster.jpg`}
        width={582}
        height={100}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <video
        ref={darkRef}
        className="dt-theme-dark"
        src={`${IMG}/da-transcribuh-pill-dark-tight.mp4`}
        poster={`${IMG}/da-transcribuh-pill-dark-tight-poster.jpg`}
        width={582}
        height={100}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    </div>
  );
}

/**
 * Screenshots → transcript → one paste.
 * Quiet CSS loop: grab while talking, each snip lands inline, then one
 * interleaved paste into an agent/chat box. Reduced-motion shows the end state.
 */
const MERGE_LINES = [
  { n: 1, text: 'this button is ugly', img: 'grab-merge-1' },
  { n: 2, text: 'make this blue', img: 'grab-merge-2' },
  { n: 3, text: 'why is this here', img: 'grab-merge-3' },
];

function ThemePair({ base, width, height }) {
  return (
    <>
      <img
        className="dt-theme-light"
        src={`${IMG}/${base}-light.jpg`}
        alt=""
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
      <img
        className="dt-theme-dark"
        src={`${IMG}/${base}-dark.jpg`}
        alt=""
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </>
  );
}

function CaptureVisual() {
  const wave = Array.from({ length: 28 }, (_, i) => {
    const t = i / 27;
    const env = 1 - Math.abs(t - 0.5) * 1.4;
    const h = 22 + Math.max(0.2, env) * 48 * (0.55 + 0.45 * Math.sin(i * 1.7));
    return <i key={i} style={{ height: `${h}%` }} />;
  });

  return (
    <div className="dt-visual dt-merge" aria-hidden="true">
      <div className="dt-merge-stage">
        <div className="dt-merge-during">
          <div className="dt-capture-pill">
            <span className="dt-capture-dot" />
            <span className="dt-capture-clock">0:08</span>
            <span className="dt-capture-wave">{wave}</span>
            <span className="dt-capture-chip">
              <span className="dt-capture-chip-n dt-merge-count">3</span>
              <span className="dt-capture-chip-thumb dt-merge-chip-stack">
                {MERGE_LINES.map((line) => (
                  <span key={line.n} className={`dt-merge-chip-frame dt-merge-step-${line.n}`}>
                    <ThemePair base={`${line.img}-chip`} width={48} height={18} />
                  </span>
                ))}
              </span>
            </span>
          </div>
          <div className="dt-merge-grabs">
            {MERGE_LINES.map((line) => (
              <div key={line.n} className={`dt-merge-grab dt-merge-step-${line.n}`}>
                <span className="dt-merge-badge">{line.n}</span>
                <ThemePair base={line.img} width={140} height={52} />
              </div>
            ))}
          </div>
        </div>

        <div className="dt-merge-cue">
          <span className="dt-merge-cue-arrow">↓</span>
          <span className="dt-merge-cue-key">⌥ space</span>
          <span className="dt-merge-cue-label">one paste</span>
        </div>

        <div className="dt-merge-paste">
          <div className="dt-merge-paste-chrome">
            <span className="dt-merge-paste-dots" />
            <span>agent</span>
          </div>
          <div className="dt-merge-paste-body">
            {MERGE_LINES.map((line) => (
              <div key={line.n} className={`dt-merge-line dt-merge-step-${line.n}`}>
                <span className="dt-merge-thumb">
                  <ThemePair base={line.img} width={72} height={28} />
                </span>
                <span className="dt-merge-line-text">
                  <span className="dt-merge-line-n">{line.n}.</span> {line.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Quiet static mock of ClipboardHistoryView (Paint ink panel).
 * Row/header/footer all Ink.mono(12); shortcuts Ink.mono(10); rowHeight 22.
 */
function ClipboardVisual() {
  const rows = [
    { text: 'can you bump the loaf price to $5?', shortcut: '⌘1', selected: true },
    { text: 'https://bakery.shop/menu', shortcut: '⌘2' },
    { text: 'const price = loaf.cost * 1.08', shortcut: '⌘3' },
    { text: '4823 cedar ave, apt 4b', shortcut: '⌘4' },
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
      <p>grab while you talk. each pic drops into the words. one paste, pics and text in order.</p>

      <h2>/ clipboard</h2>
      <ClipboardVisual />
      <p>⌘⇧C opens history by your pointer. pin the ones you keep.</p>
    </ProjectDetail>
  );
}

export default DaTranscribuh;
