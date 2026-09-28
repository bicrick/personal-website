import { useLayoutEffect, useRef, useState } from 'react';
import './TypewriterHeading.css';

const STEP_MS = 48;
const CARET_HOLD_MS = 1600;
const TYPEWRITER_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 801px)';
const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function shouldType() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  if (window.matchMedia(REDUCE_MOTION_QUERY).matches) return false;
  return window.matchMedia(TYPEWRITER_QUERY).matches;
}

export default function TypewriterHeading({
  as: Tag = 'h2',
  className,
  children,
}) {
  const text = String(children ?? '').replace(/\s+/g, ' ').trim();
  const timersRef = useRef([]);
  const [shown, setShown] = useState(() => (shouldType() ? 0 : text.length));
  const [caret, setCaret] = useState(false);
  const [typing, setTyping] = useState(false);

  useLayoutEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };

    if (!shouldType()) {
      setShown(text.length);
      setCaret(false);
      setTyping(false);
      return undefined;
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

    return () => clearTimers();
  }, [text]);

  const classes = ['typewriter-heading', 'page-title', className].filter(Boolean).join(' ');

  return (
    <Tag className={classes} aria-label={text}>
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
