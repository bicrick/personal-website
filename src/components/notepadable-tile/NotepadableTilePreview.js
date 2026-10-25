import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { NOTE, NOTE_HASH, PREFIX_HASHES } from './encoded';
import { EyeIcon, LinkIcon, NewNoteIcon, ShareIcon } from './icons';
import { caretOn, countUpTo, ramp, typingSchedule, useStageScale, useTileLoop } from './useTileLoop';
import './NotepadableTilePreview.css';

const STAGE_W = 640;
const STAGE_H = 360;
const TYPE_START = 500;
const ORIGIN = 'https://notepadable.com/app';
const MAX_URL = 8000;

/*
 * One clock, four beats:
 *   type   empty editor → the note types in; the hash grows (and shrinks on dictionary hits)
 *   link   editor + footer fade away; the full URL sits alone, centered
 *   logo   the link gives way to the notepadable wordmark
 *   return the wordmark fades and the empty editor comes back, identical to t = 0
 */
const XFADE = 700;
const OUT_MS = 450;
const IN_DELAY = 200;

function buildTimeline(doneAt) {
  const link = doneAt + 1100;
  const logo = link + XFADE + 2300;
  const back = logo + XFADE + 1700;
  return { doneAt, link, logo, back, loop: back + XFADE, rest: doneAt + 700 };
}

function urlLength(n) {
  return n === 0 ? ORIGIN.length : ORIGIN.length + 1 + PREFIX_HASHES[n - 1].length;
}

/** Fade + lift helper: writes compositor-only properties. */
function setLayer(el, opacity, dy = 0, scale = 1) {
  if (!el) return;
  el.style.opacity = String(opacity);
  el.style.transform = `translate3d(0, ${dy}px, 0) scale(${scale})`;
  el.style.visibility = opacity <= 0.001 ? 'hidden' : 'visible';
}

/** CodeMirror-ish rendering of the raw markdown: the heading line is bold + underlined like the app. */
function EditorLines({ text, caretRef }) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const last = i === lines.length - 1;
    const heading = /^#{1,6}\s/.test(line);
    return (
      <div key={i} className={`np-line${heading ? ' is-h1' : ''}`}>
        {line || (last ? '' : '\u200b')}
        {last && <span className="np-caret" ref={caretRef} />}
      </div>
    );
  });
}

/**
 * Project-card thumbnail for notepadable: the real editor + footer with an address
 * bar. Hashes are the app's own compress() output for every keystroke.
 */
export default function NotepadableTilePreview({ className = '' }) {
  const rootRef = useRef(null);
  const appRef = useRef(null);
  const linkRef = useRef(null);
  const logoRef = useRef(null);
  const fillRef = useRef(null);
  const caretRef = useRef(null);
  const clipRef = useRef(null);
  const scale = useStageScale(rootRef, STAGE_W);
  const times = useMemo(() => typingSchedule(NOTE, { start: TYPE_START, base: 42 }), []);
  const tl = useMemo(() => buildTimeline(times[times.length - 1]), [times]);
  const [n, setN] = useState(0);
  const nRef = useRef(-1);
  const fill = useRef({ value: null, t: 0 });

  const onFrame = useCallback(
    (t) => {
      // The editor empties once it is fully hidden, so it returns blank.
      const count = t >= tl.link + OUT_MS ? 0 : countUpTo(times, t);
      if (count !== nRef.current) {
        nRef.current = count;
        setN(count);
      }

      // The app animates the capacity bar's width over 0.4s; same feel, as a transform.
      const target = urlLength(count) / MAX_URL;
      const f = fill.current;
      const dt = f.value === null ? Infinity : Math.max(0, t - f.t);
      f.value = f.value === null ? target : target + (f.value - target) * Math.exp(-dt / 110);
      f.t = t;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${f.value})`;

      // Caret: solid while keys land and while the note is empty, else CodeMirror's 1.2s blink.
      if (caretRef.current) {
        const lastKey = count > 0 ? times[count - 1] : 0;
        const solid = count === 0 || count < times.length;
        caretRef.current.style.opacity = solid || caretOn(t, lastKey + 600) ? '1' : '0';
      }

      // Editor chrome: out at `link`, back in at `back` (fully in exactly at the wrap).
      const appOut = ramp(t, tl.link, tl.link + OUT_MS);
      const appIn = ramp(t, tl.back + IN_DELAY, tl.loop);
      const appOpacity = t >= tl.back ? appIn : 1 - appOut;
      setLayer(appRef.current, appOpacity, t >= tl.back ? (1 - appIn) * 6 : -appOut * 6);

      // The link alone.
      const linkIn = ramp(t, tl.link + IN_DELAY, tl.link + XFADE);
      const linkOut = ramp(t, tl.logo, tl.logo + OUT_MS);
      setLayer(linkRef.current, linkIn * (1 - linkOut), (1 - linkIn) * 8 - linkOut * 8);

      // The wordmark.
      const logoIn = ramp(t, tl.logo + IN_DELAY, tl.logo + XFADE);
      const logoOut = ramp(t, tl.back, tl.back + OUT_MS);
      setLayer(logoRef.current, logoIn * (1 - logoOut), 0, 0.97 + 0.03 * logoIn + 0.015 * logoOut);
    },
    [times, tl]
  );
  useTileLoop(rootRef, tl.loop, tl.rest, onFrame);

  useLayoutEffect(() => {
    const el = clipRef.current;
    if (el && el.firstChild) el.classList.toggle('is-clipped', el.firstChild.offsetWidth > el.clientWidth + 1);
  }, [n, scale]);

  const hash = n > 0 ? PREFIX_HASHES[n - 1] : '';
  const len = urlLength(n);

  return (
    <div ref={rootRef} className={`np-tile ${className}`.trim()} aria-hidden="true">
      <div
        className="np-stage"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale})`,
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        <div className="np-app" ref={appRef}>
          <div className="np-addr">
            <div className="np-addr-pill">
              <span className="np-addr-origin">notepadable.com/app</span>
              <span className="np-addr-hash-clip" ref={clipRef}>
                <span className="np-addr-hash">{hash ? `#${hash}` : ''}</span>
              </span>
            </div>
          </div>

          <div className="np-editor">
            <EditorLines text={NOTE.slice(0, n)} caretRef={caretRef} />
          </div>

          <div className="np-footer">
            <div className="np-capacity-bar">
              <div className="np-capacity-fill" ref={fillRef} />
            </div>
            <div className="np-footer-inner">
              <div className="np-brand-area">
                <span className="np-brand">
                  <span>notepad</span>
                  <span className="np-brand-suffix">able</span>
                </span>
                <span className="np-btn-new">
                  <NewNoteIcon />
                </span>
              </div>
              <div className="np-actions">
                <span className="np-capacity-label">{len.toLocaleString('en-US')} / 2,000 chars</span>
                <span className="np-btn">
                  <EyeIcon />
                </span>
                <span className="np-btn">
                  <LinkIcon />
                </span>
                <span className="np-btn">
                  <ShareIcon />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="np-solo np-link" ref={linkRef}>
          <p>
            <span className="np-link-origin">notepadable.com/app#</span>
            {NOTE_HASH}
          </p>
        </div>

        <div className="np-solo np-logo" ref={logoRef}>
          <span className="np-wordmark">
            <strong>notepad</strong>
            <span className="np-wordmark-muted">able</span>
          </span>
        </div>
      </div>
    </div>
  );
}
