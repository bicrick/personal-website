import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

const LINES = [
  'Same model in all five: claude-haiku-5-5',
  'Thinking off for every run',
  'Every command auto-approved',
  '$0.50 budget per bug, same machine for every run (2 CPU, 4 GB)',
];

const DOCS =
  'https://github.com/bicrick/harness-bench/blob/main/docs/SWEBENCH_PILOT.md';

export default function Model({ children = 'Claude Haiku 5.5' }) {
  const id = useId();
  const btn = useRef(null);
  const panel = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const hover = useRef(false);
  const focused = useRef(0);

  const place = useCallback(() => {
    const b = btn.current?.getBoundingClientRect();
    const p = panel.current;
    if (!b || !p) return;
    const vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
    const w = p.offsetWidth, h = p.offsetHeight;
    const left = Math.max(m, Math.min(b.left + b.width / 2 - w / 2, vw - w - m));
    const below = b.bottom + 6;
    const want = below + h > vh - m && b.top - 6 - h > m ? b.top - 6 - h : below;
    const top = Math.max(m, Math.min(want, vh - h - m));
    setPos({ left, top });
  }, []);

  useLayoutEffect(() => { if (open) place(); else setPos(null); }, [open, place]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!btn.current?.contains(e.target) && !panel.current?.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    const shut = () => setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', key);
    window.addEventListener('scroll', shut, { passive: true });
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', key);
      window.removeEventListener('scroll', shut);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  return (
    <span className="md">
      <button
        ref={btn}
        type="button"
        className="md-term"
        aria-expanded={open}
        aria-controls={id}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => (hover.current || Date.now() - focused.current < 400 ? true : !o))}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') { hover.current = true; setOpen(true); } }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') { hover.current = false; setTimeout(() => { if (!hover.current) setOpen(false); }, 120); } }}
        onFocus={() => { focused.current = Date.now(); setOpen(true); }}
        onBlur={(e) => { if (!panel.current?.contains(e.relatedTarget)) setOpen(false); }}
      >{children}</button>
      {open && (
        <span
          ref={panel}
          id={id}
          role="tooltip"
          className="md-panel"
          style={pos ? { left: pos.left, top: pos.top } : { visibility: 'hidden' }}
          onPointerEnter={() => { hover.current = true; }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') { hover.current = false; setOpen(false); } }}
        >
          <span className="md-head">how we ran it</span>
          {LINES.map((line) => (
            <span key={line} className="md-line">{line}</span>
          ))}
          <a
            className="md-more"
            href={DOCS}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Full settings in the repo ↗
          </a>
        </span>
      )}
    </span>
  );
}
