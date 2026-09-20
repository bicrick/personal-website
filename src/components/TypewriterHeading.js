import { useLayoutEffect, useRef, useState } from 'react';
import './TypewriterHeading.css';

const STEP_MS = 48;
const CARET_HOLD_MS = 1600;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readPlayState(section) {
  if (!section) return 'idle';
  if (section.classList.contains('is-chapter-settled')) return 'settled';
  if (section.classList.contains('is-chapter-drawn')) return 'play';
  if (section.classList.contains('is-chapter-pending')) return 'reset';
  return 'idle';
}

export default function TypewriterHeading({
  as: Tag = 'h2',
  className,
  children,
}) {
  const text = String(children ?? '').replace(/\s+/g, ' ').trim();
  const hostRef = useRef(null);
  const timersRef = useRef([]);
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? text.length : 0));
  const [caret, setCaret] = useState(false);
  const [typing, setTyping] = useState(false);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const showAll = (withCaret = false) => {
    clearTimers();
    setShown(text.length);
    setCaret(withCaret);
    setTyping(false);
  };

  const hide = () => {
    clearTimers();
    setShown(0);
    setCaret(false);
    setTyping(false);
  };

  const play = () => {
    clearTimers();
    if (prefersReducedMotion()) {
      showAll(false);
      return;
    }

    setShown(0);
    setCaret(true);
    setTyping(true);

    const tick = (index) => {
      if (index >= text.length) {
        setTyping(false);
        const hide = window.setTimeout(() => setCaret(false), CARET_HOLD_MS);
        timersRef.current.push(hide);
        return;
      }

      const id = window.setTimeout(() => {
        setShown(index + 1);
        tick(index + 1);
      }, STEP_MS);
      timersRef.current.push(id);
    };

    const start = window.setTimeout(() => tick(0), 70);
    timersRef.current.push(start);
  };

  useLayoutEffect(() => {
    const section = hostRef.current?.closest('[data-chapter]');
    if (!section) {
      play();
      return () => clearTimers();
    }

    let last = 'boot';

    const sync = () => {
      const state = readPlayState(section);
      if (state === last) return;
      last = state;

      if (state === 'play') {
        play();
        return;
      }

      if (state === 'settled') {
        showAll(false);
        return;
      }

      // Idle / reset / first paint: keep the title blank in the blurred preview
      hide();
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    section.addEventListener('chapterplay', play);

    return () => {
      observer.disconnect();
      section.removeEventListener('chapterplay', play);
      clearTimers();
    };
    // text is the only input that should rebuild the printer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const classes = ['typewriter-heading', 'page-title', className].filter(Boolean).join(' ');

  return (
    <Tag ref={hostRef} className={classes} aria-label={text}>
      <span className="typewriter-heading-sizer" aria-hidden="true">
        {text}
        <span className="typewriter-heading-caret is-spacer" />
      </span>
      <span className="typewriter-heading-live" aria-hidden="true">
        {text.slice(0, shown)}
        {caret ? (
          <span className={`typewriter-heading-caret${typing ? ' is-typing' : ''}`} />
        ) : null}
      </span>
    </Tag>
  );
}
