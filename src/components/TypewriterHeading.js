import { useLayoutEffect, useRef, useState } from 'react';
import { useLandingNav } from '../hooks/landingNavContext';
import { prefersReducedMotion, usesChapterMotion } from '../utils/chapterMode';
import './TypewriterHeading.css';

const STEP_MS = 48;
const CARET_HOLD_MS = 1600;

function chapterIdFrom(node) {
  return node?.closest('[data-chapter]')?.getAttribute('data-chapter') ?? null;
}

export default function TypewriterHeading({
  as: Tag = 'h2',
  className,
  children,
}) {
  const text = String(children ?? '').replace(/\s+/g, ' ').trim();
  const { activeId, titleGen } = useLandingNav();
  const hostRef = useRef(null);
  const timersRef = useRef([]);
  const [shown, setShown] = useState(() => (
    prefersReducedMotion() || !usesChapterMotion() ? text.length : 0
  ));
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
    if (prefersReducedMotion() || !usesChapterMotion()) {
      showAll(false);
      return;
    }

    setShown(0);
    setCaret(true);
    setTyping(true);

    const tick = (index) => {
      if (index >= text.length) {
        setTyping(false);
        const hideCaret = window.setTimeout(() => setCaret(false), CARET_HOLD_MS);
        timersRef.current.push(hideCaret);
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
    if (!usesChapterMotion() || prefersReducedMotion()) {
      showAll(false);
      return () => clearTimers();
    }

    const chapterId = chapterIdFrom(hostRef.current);
    if (!chapterId || chapterId === activeId) {
      play();
    } else {
      hide();
    }

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, titleGen, text]);

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
