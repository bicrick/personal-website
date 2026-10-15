import React, { useEffect, useRef, useState } from 'react';
import MockPage from './MockPage';
import SidePanel from './SidePanel';
import useRestyle from './useRestyle';
import useWordle from './useWordle';
import useReducedMotion from '../useReducedMotion';
import './monocle.css';

function formatClock(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Interactive Monocle demo. The left side is a real, playable page; the right
 * side plays canned restyle runs. Game state and the page timer live outside
 * the theme, which is the point: a patch changes how the page looks, not what
 * it is doing.
 */
export default function MonocleDemo() {
  const reduced = useReducedMotion();
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [focused, setFocused] = useState(false);
  const autoplayed = useRef(false);

  const game = useWordle();
  const restyle = useRestyle({ fast: reduced });
  const { start } = restyle;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return undefined;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [inView]);

  useEffect(() => {
    if (!inView || autoplayed.current || reduced) return undefined;
    autoplayed.current = true;
    const id = window.setTimeout(() => start('medieval'), 900);
    return () => window.clearTimeout(id);
  }, [inView, reduced, start]);

  const guessNumber = Math.min(game.rows.length, 6);
  const restyled = restyle.themeId !== 'original';

  return (
    <figure className="mqd" ref={wrapRef}>
      <div className="mqd-stage">
        <div className="mqd-browser">
          <div className="mqd-chrome">
            <span className="mqd-lights" aria-hidden="true"><i /><i /><i /></span>
            <span className="mqd-url">example.com/wordle</span>
            <span className={`mqd-badge${restyled ? ' is-on' : ''}`}>
              {restyled ? 'monocle on' : 'monocle idle'}
            </span>
          </div>
          <div
            className={`mqd-viewport${focused ? ' is-focused' : ''}`}
            tabIndex={0}
            role="application"
            aria-label="Playable word game. Type letters, press enter to guess."
            onKeyDown={game.onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            <MockPage
              theme={restyle.themeId}
              title={restyle.theme.title}
              subtitle={restyle.theme.subtitle}
              rows={game.rows}
              current={game.current}
              onKey={game.press}
              paused={!inView}
              sweepKey={restyle.sweepKey}
              toast={game.toast}
            />
          </div>
          <div className="mqd-status">
            <span>site js: page timer {formatClock(seconds)}</span>
            <span>guess {guessNumber}/6</span>
            <span className="mqd-status-hint">
              {focused ? 'typing' : 'click the page, then type'}
            </span>
          </div>
        </div>

        <SidePanel
          themeId={restyle.themeId}
          theme={restyle.theme}
          run={restyle.run}
          typed={restyle.typed}
          working={restyle.working}
          onPick={restyle.start}
        />
      </div>
      <figcaption>
        Playable. Restyle it, then keep guessing: the board and the page timer never reset.
        These are canned patches so the demo runs without a model. In the extension the same
        shape comes back from <code>agent -p</code>.
      </figcaption>
    </figure>
  );
}
