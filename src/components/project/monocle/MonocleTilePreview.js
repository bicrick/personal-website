import React, { useEffect, useRef, useState } from 'react';
import MockPage from './MockPage';
import MonocleMark from './MonocleMark';
import { THEME_BY_ID } from './themes';
import { makeRow } from './wordle';
import './tile.css';


const ORDER = ['medieval', 'terminal', 'newsprint', 'ocean', 'original'];
const PROMPTS = {
  medieval: 'make this medieval themed',
  terminal: 'turn this into a phosphor terminal',
  newsprint: 'make it a 1920s newspaper page',
  ocean: 'put it at the bottom of the ocean',
  original: 'put it back the way it was',
};

const TARGET = 'LIGHT';
const ROWS = ['ADIEU', 'SHORT', 'LIGHT'].map((word) => makeRow(word, TARGET));

const TYPE_MS = 32;
const WIPE_MS = 1100;
const HOLD_MS = 2300;

function Layer({ id }) {
  const theme = THEME_BY_ID[id];
  return (
    <MockPage
      compact
      theme={id}
      title={theme.title}
      subtitle={theme.subtitle}
      rows={ROWS}
      current=""
    />
  );
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Home tile: types a prompt, then wipes the same little page into the next
 * look. Pauses offscreen. With reduced motion it holds on the medieval frame.
 */
export default function MonocleTilePreview() {
  const ref = useRef(null);
  const [live, setLive] = useState(false);
  const [reduced] = useState(prefersReducedMotion);
  const [base, setBase] = useState(reduced ? 'medieval' : 'original');
  const [next, setNext] = useState(null);
  const [wiping, setWiping] = useState(false);
  const [prompt, setPrompt] = useState(reduced ? PROMPTS.medieval : '');
  const cursor = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!live || reduced) return undefined;
    const timers = [];
    const later = (fn, ms) => timers.push(window.setTimeout(fn, ms));
    let cancelled = false;

    const cycle = () => {
      if (cancelled) return;
      const id = ORDER[cursor.current % ORDER.length];
      cursor.current += 1;
      const text = PROMPTS[id];
      let t = 0;
      [...text].forEach((_, i) => {
        t += TYPE_MS;
        later(() => setPrompt(text.slice(0, i + 1)), t);
      });
      t += 380;
      later(() => {
        setNext(id);
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => setWiping(true)));
      }, t);
      t += WIPE_MS + 60;
      later(() => {
        setBase(id);
        setNext(null);
        setWiping(false);
      }, t);
      t += HOLD_MS;
      later(cycle, t);
    };

    later(cycle, 500);
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [live, reduced]);

  return (
    <div ref={ref} className="mqt" aria-hidden="true">
      <div className="mqt-layer">
        <Layer id={base} />
      </div>
      {next ? (
        <div className={`mqt-layer mqt-top${wiping ? ' is-wiping' : ''}`}>
          <Layer id={next} />
        </div>
      ) : null}
      {next ? <i className={`mqt-edge${wiping ? ' is-wiping' : ''}`} /> : null}
      <MonocleMark size={28} className="mqt-mark" />
      <div className={`mqt-prompt${next ? ' is-sent' : ''}`}>
        <span className="mqt-caret">{'>'}</span>
        <span className="mqt-text">{prompt || '\u00a0'}</span>
        <span className="mqt-enter">enter</span>
      </div>
    </div>
  );
}
