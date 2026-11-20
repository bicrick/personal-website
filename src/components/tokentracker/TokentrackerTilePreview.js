import React, { useEffect, useRef, useState } from 'react';
import { drawStipple, renderCoin } from './coin';
import './TokentrackerTilePreview.css';

const LOGO = (name) => `${process.env.PUBLIC_URL}/images/tokentracker/logos/${name}.svg`;
const LOGOS = [
  ['claude', 'Claude Code'],
  ['openai', 'Codex'],
  ['cursor', 'Cursor'],
  ['githubcopilot', 'Copilot'],
  ['opencode', 'OpenCode'],
  ['googlegemini', 'Gemini'],
  ['cline', 'Cline'],
  ['deepseek', 'DeepSeek'],
];

const COMMAND = 'npx @bicrick/tokentracker init';
const WORD = 'tokentracker';

// What init prints once the command is typed: sign in to GitHub, save to your own repo
const INSTALL_LINES = [
  ['ok', 'Signed in to GitHub as ', 'bicrick'],
  ['ok', 'Saved 412 rows to ', 'bicrick/tokentracker-data'],
  ['ok', 'Published on ', 'GitHub Pages'],
];

const JSON_LINES = [
  [['p', '{']],
  [['k', '  "handle"'], ['p', ': '], ['s', '"bicrick"'], ['p', ',']],
  [['k', '  "tokens"'], ['p', ': '], ['n', '9829375428'], ['p', ',']],
  [['k', '  "activeDays"'], ['p', ': '], ['n', '233'], ['p', ',']],
  [['k', '  "topTool"'], ['p', ': { '], ['k', '"name"'], ['p', ': '], ['s', '"Cursor"'], ['p', ' },']],
  [['k', '  "topModel"'], ['p', ': '], ['s', '"claude-opus-5-5"'], ['p', ',']],
  [['k', '  "longestStreak"'], ['p', ': '], ['n', '14']],
  [['p', '}']],
];

// Scene lengths in ms; the reel loops
const SCENES = [
  ['install', 3900],
  ['logos', 1900],
  ['api', 2600],
  ['heat', 3800],
  ['coin', 4600],
];

const COLS = 30;
const ROWS = 7;
const HEAT = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = Math.floor(i / ROWS);
  const r = i % ROWS;
  // Usage climbs through the year, weekends stay quiet, a little day-to-day noise
  const trend = 0.15 + (c / (COLS - 1)) * 0.7;
  const weekend = r === 0 || r === 6 ? 0.35 : 1;
  const noise = (Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
  const v = trend * weekend + Math.abs(noise) * 0.3 - 0.1;
  return Math.max(0, Math.min(4, Math.floor(v * 5)));
});
// The cell the pointer lands on
const HOT_COL = 24;
const HOT_ROW = 3;
const HOT = HOT_COL * ROWS + HOT_ROW;
HEAT[HOT] = 4;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Coin({ spinning }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const cells = 64;
    canvas.width = cells;
    canvas.height = cells;
    if (!spinning) {
      renderCoin(ctx, cells, 0.35);
      return undefined;
    }
    let raf = 0;
    const draw = (t) => {
      renderCoin(ctx, cells, (t / 3200) * Math.PI * 2);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [spinning]);
  return <canvas ref={ref} className="ttp-coin" />;
}

/**
 * Home tile for tokentracker: install command, the tools it reads, an API
 * response, a heatmap, then the spinning coin sliding over for the wordmark.
 * Pauses offscreen; with reduced motion it holds on the final frame.
 */
export default function TokentrackerTilePreview() {
  const ref = useRef(null);
  const bg = useRef(null);
  const [live, setLive] = useState(false);
  const [reduced] = useState(prefersReducedMotion);
  const [scene, setScene] = useState(reduced ? 'coin' : 'install');
  const [typed, setTyped] = useState(0);
  const [said, setSaid] = useState(0);
  const [lines, setLines] = useState(0);
  const [heat, setHeat] = useState(0);
  const [pointer, setPointer] = useState(0); // 0 hidden, 1 moving in, 2 hovering
  const [slid, setSlid] = useState(reduced);
  const [word, setWord] = useState(reduced ? WORD.length : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const canvas = bg.current;
    if (!canvas) return undefined;
    const html = document.documentElement;
    const draw = () => drawStipple(canvas, html.classList.contains('is-dark'));
    draw();
    const mo = new MutationObserver(draw);
    mo.observe(html, { attributes: true, attributeFilter: ['class'] });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(draw);
    ro?.observe(canvas);
    return () => {
      mo.disconnect();
      ro?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!live || reduced) return undefined;
    const timers = [];
    const later = (fn, ms) => timers.push(window.setTimeout(fn, ms));
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      setTyped(0);
      setSaid(0);
      setLines(0);
      setHeat(0);
      setPointer(0);
      setSlid(false);
      setWord(0);
      let t = 0;
      SCENES.forEach(([id, len]) => {
        const start = t;
        later(() => setScene(id), start);
        if (id === 'install') {
          for (let i = 1; i <= COMMAND.length; i += 1) later(() => setTyped(i), start + 300 + i * 40);
          for (let i = 1; i <= INSTALL_LINES.length; i += 1) later(() => setSaid(i), start + 1750 + i * 520);
        } else if (id === 'api') {
          for (let i = 1; i <= JSON_LINES.length; i += 1) later(() => setLines(i), start + 150 + i * 140);
        } else if (id === 'heat') {
          for (let c = 1; c <= COLS; c += 1) later(() => setHeat(c), start + 100 + c * 40);
          later(() => setPointer(1), start + 1500);
          later(() => setPointer(2), start + 2350);
        } else if (id === 'coin') {
          later(() => setSlid(true), start + 1300);
          for (let i = 1; i <= WORD.length; i += 1) later(() => setWord(i), start + 1750 + i * 70);
        }
        t += len;
      });
      later(run, t);
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [live, reduced]);

  const on = (id) => `ttp-scene ttp-s-${id}${scene === id ? ' is-on' : ''}`;

  return (
    <div ref={ref} className="ttp" aria-hidden="true">
      <canvas ref={bg} className="ttp-bg" />

      <div className={on('install')}>
        <div className="ttp-term">
          <div className="ttp-term-bar"><i /><i /><i /></div>
          <div className="ttp-term-body">
            <div>
              <span className="ttp-prompt">$</span> {COMMAND.slice(0, typed)}
              {said === 0 ? <span className="ttp-cursor" /> : null}
            </div>
            {INSTALL_LINES.map(([, text, strong], i) => (
              <div key={strong} className={`ttp-term-line${i < said ? ' is-in' : ''}`}>
                <span className="ttp-ok">✓</span> {text}
                <span className="ttp-strong">{strong}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={on('logos')}>
        <div className="ttp-logos">
          {LOGOS.map(([file, name], i) => (
            <div key={file} className="ttp-logo" style={{ transitionDelay: `${i * 70}ms` }}>
              <img src={LOGO(file)} alt="" />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={on('api')}>
        <div className="ttp-api">
          <div className="ttp-api-url">
            <span className="ttp-get">GET</span>
            <span className="ttp-host">bicrick.github.io</span>/tokentracker-data/api/v1/stats.json
          </div>
          <pre>
            {JSON_LINES.map((line, i) => (
              <div key={i} className={i < lines ? 'is-in' : ''}>
                {line.map(([kind, text], j) => (
                  <span key={j} className={`j-${kind}`}>{text}</span>
                ))}
              </div>
            ))}
          </pre>
        </div>
      </div>

      <div className={on('heat')}>
        <div className="ttp-heat-wrap">
          <div className="ttp-heat-head">
            <span>token usage</span>
            <span>2026</span>
          </div>
          <div className="ttp-heat" style={{ '--cols': COLS }}>
            {HEAT.map((v, i) => (
              <i
                key={i}
                className={`h${Math.floor(i / ROWS) < heat ? v : 'x'}${i === HOT && pointer === 2 ? ' is-hot' : ''}`}
              >
                {i === HOT ? (
                  <>
                    <span className={`ttp-tip${pointer === 2 ? ' is-on' : ''}`}>
                      <b>143.2M</b> tokens · Oct 14
                    </span>
                    <svg className={`ttp-pointer is-${pointer}`} viewBox="0 0 16 20">
                      <path d="M1 1v15l4-3.6 2.6 6 2.6-1.1-2.6-5.9H13z" />
                    </svg>
                  </>
                ) : null}
              </i>
            ))}
          </div>
        </div>
      </div>

      <div className={on('coin')}>
        <div className={`ttp-mark${slid ? ' is-slid' : ''}`}>
          <Coin spinning={live && !reduced && scene === 'coin'} />
          <span className="ttp-word">
            <span className="ttp-ghost">{WORD}</span>
            <span className="ttp-typed">
              {WORD.slice(0, word)}
              {slid && word < WORD.length ? <span className="ttp-cursor" /> : null}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
