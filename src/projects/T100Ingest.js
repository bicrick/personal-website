import React, { useCallback, useEffect, useRef, useState } from 'react';
import T100Card from './T100Card';
import './T100Ingest.css';

const CARD = `${process.env.PUBLIC_URL}/images/t100/card`;

/** Exact values printed / written on the Pebble Beach guest card asset. */
const CARD_VALUES = {
  course: 'Pebble Beach Golf Links',
  tee: 'White',
  date: 'Oct 18',
  players: [
    { name: 'Tom', out: 39, inn: 43, tot: 82 },
    { name: 'Sam', out: 49, inn: 41, tot: 90 },
  ],
  holes: [
    { n: 1, tom: 4, sam: 6 },
    { n: 7, tom: 2, sam: 3 },
    { n: 12, tom: 3, sam: 2 },
    { n: 18, tom: 6, sam: 6 },
  ],
};

const STAGES = [
  {
    id: 'photo',
    label: 'Photo',
    note: 'Capture after the round',
  },
  {
    id: 'cutout',
    label: 'Cutout',
    note: 'Apple Vision mask · LSD quads',
  },
  {
    id: 'read',
    label: 'Read',
    note: 'RapidOCR grid · Jev per cell · Haiku for header',
  },
  {
    id: 'dewarp',
    label: 'Dewarp',
    note: 'Fold-aware mesh when a crease is found',
  },
  {
    id: 'done',
    label: 'Done',
    note: 'Ask below 0.9 confidence',
  },
];

const STAGE_MS = [2200, 2400, 3200, 2600, 0];

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function StagePhoto({ flashing }) {
  return (
    <div className={`t100-ig-photo${flashing ? ' is-flash' : ''}`}>
      <div className="t100-ig-phone" aria-hidden="true">
        <div className="t100-ig-phone-notch" />
        <div className="t100-ig-viewfinder">
          <img
            src={`${CARD}/pebble-cover-800.webp`}
            alt=""
            width={800}
            height={503}
            draggable={false}
          />
          <span className="t100-ig-reticle" />
          <span className="t100-ig-shutter" />
        </div>
      </div>
    </div>
  );
}

function StageCutout() {
  return (
    <div className="t100-ig-cutout">
      <div className="t100-ig-desk-noise" aria-hidden="true" />
      <div
        className="t100-ig-paper"
        style={{ '--t100-mask': `url(${CARD}/pebble-cover-mask.webp)` }}
      >
        <img
          className="t100-ig-paper-img"
          src={`${CARD}/pebble-cover-800.webp`}
          alt=""
          width={800}
          height={503}
          draggable={false}
        />
        {/* CSS quad hugs the masked card outline (no SVG viewBox letterboxing) */}
        <span className="t100-ig-quad" aria-hidden="true">
          <i className="t100-ig-quad-handle is-tl" />
          <i className="t100-ig-quad-handle is-tr" />
          <i className="t100-ig-quad-handle is-br" />
          <i className="t100-ig-quad-handle is-bl" />
        </span>
      </div>
    </div>
  );
}

function StageRead() {
  return (
    <div className="t100-ig-read">
      <div className="t100-ig-grid-wrap">
        <img
          src={`${CARD}/pebble-inside-top-800.webp`}
          alt=""
          width={800}
          height={483}
          draggable={false}
        />
        {/* Highlights land on the circled WHITE tee + Tom/Sam handwritten score columns */}
        <span className="t100-ig-hl t100-ig-hl-tee" />
        <span className="t100-ig-hl t100-ig-hl-tom" />
        <span className="t100-ig-hl t100-ig-hl-sam" />
      </div>
      <aside className="t100-ig-chips" aria-label="Extracted values">
        <div className="t100-ig-chip is-course">
          <span>Course</span>
          <strong>{CARD_VALUES.course}</strong>
        </div>
        <div className="t100-ig-chip is-tee">
          <span>Tee</span>
          <strong>{CARD_VALUES.tee}</strong>
        </div>
        <div className="t100-ig-chip is-date">
          <span>Date</span>
          <strong>{CARD_VALUES.date}</strong>
        </div>
        {CARD_VALUES.players.map((p) => (
          <div key={p.name} className="t100-ig-chip is-player">
            <span>{p.name}</span>
            <strong>
              OUT {p.out} · IN {p.inn} · TOT {p.tot}
            </strong>
          </div>
        ))}
        <div className="t100-ig-chip is-holes">
          <span>Sample holes</span>
          <strong>
            {CARD_VALUES.holes.map((h) => (
              <em key={h.n}>
                {h.n}: {h.tom}/{h.sam}
              </em>
            ))}
          </strong>
        </div>
      </aside>
    </div>
  );
}

function StageDewarp({ progress }) {
  // progress 0 = creased halves; near 1 = single flat corrected card (no seam)
  const crease = Math.sin(progress * Math.PI);
  const flat = progress > 0.92;
  return (
    <div
      className={`t100-ig-dewarp${flat ? ' is-flat' : ''}`}
      style={{
        '--open': progress,
        '--crease': crease,
      }}
    >
      {flat ? (
        <div className="t100-ig-flat-card t100-ig-dewarp-flat">
          <div className="t100-ig-flat-shadow" aria-hidden="true" />
          <img
            src={`${CARD}/pebble-flat-800.webp`}
            alt=""
            width={800}
            height={992}
            draggable={false}
          />
        </div>
      ) : (
        <div className="t100-ig-fold-flat">
          <div className="t100-ig-leaf t100-ig-leaf-top">
            <img
              src={`${CARD}/pebble-inside-top-800.webp`}
              alt=""
              width={800}
              height={483}
              draggable={false}
            />
          </div>
          <div className="t100-ig-leaf t100-ig-leaf-bot">
            <img
              src={`${CARD}/pebble-inside-bot-800.webp`}
              alt=""
              width={800}
              height={509}
              draggable={false}
            />
          </div>
          <span className="t100-ig-crease" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

function StageDone({ open }) {
  return (
    <div
      className={`t100-ig-done${open > 0.5 ? ' is-open' : ''}`}
      style={{ '--open': open }}
    >
      <div className="t100-ig-done-closed">
        <T100Card interactive={false} />
      </div>
      <div className="t100-ig-done-open" aria-hidden={open < 0.5}>
        {/* Single flat corrected card — no stacked halves, no fold seam */}
        <div className="t100-ig-flat-card">
          <div className="t100-ig-flat-shadow" aria-hidden="true" />
          <img
            className="t100-ig-flat-img"
            src={`${CARD}/pebble-flat-800.webp`}
            alt=""
            width={800}
            height={992}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

function T100Ingest() {
  const rootRef = useRef(null);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [dewarp, setDewarp] = useState(0);
  const [doneOpen, setDoneOpen] = useState(0);
  const [reduced, setReduced] = useState(() => prefersReducedMotion());
  const timerRef = useRef(null);
  const rafRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const goTo = useCallback((index, { animate = true } = {}) => {
    clearTimers();
    const next = Math.max(0, Math.min(STAGES.length - 1, index));
    setStage(next);
    setFlashing(false);
    setPlaying(false);

    if (next === 3) {
      setDewarp(animate && !prefersReducedMotion() ? 0 : 1);
    } else if (next > 3) {
      setDewarp(1);
    } else {
      setDewarp(0);
    }

    if (next === 4) {
      setDoneOpen(animate && !prefersReducedMotion() ? 0 : 1);
    } else {
      setDoneOpen(0);
    }
  }, [clearTimers]);

  const runFrom = useCallback((startIndex) => {
    clearTimers();
    if (prefersReducedMotion()) {
      goTo(STAGES.length - 1, { animate: false });
      return;
    }

    setPlaying(true);
    let i = startIndex;

    const animateDewarp = (onDone) => {
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - (1 - t) ** 3;
        setDewarp(eased);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          onDone();
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const animateDoneOpen = (onDone) => {
      const start = performance.now();
      const dur = 1100;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - (1 - t) ** 3;
        setDoneOpen(eased);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          onDone();
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const step = () => {
      setStage(i);
      setFlashing(false);

      if (i === 0) {
        timerRef.current = window.setTimeout(() => {
          setFlashing(true);
          timerRef.current = window.setTimeout(() => {
            setFlashing(false);
            i += 1;
            step();
          }, 280);
        }, 900);
        return;
      }

      if (i === 3) {
        setDewarp(0);
        animateDewarp(() => {
          i += 1;
          step();
        });
        return;
      }

      if (i === 4) {
        setDoneOpen(0);
        animateDoneOpen(() => {
          setPlaying(false);
        });
        return;
      }

      const wait = STAGE_MS[i] || 2200;
      timerRef.current = window.setTimeout(() => {
        i += 1;
        if (i < STAGES.length) {
          step();
        } else {
          setPlaying(false);
        }
      }, wait);
    };

    step();
  }, [clearTimers, goTo]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const on = mq.matches;
      setReduced(on);
      if (on) {
        clearTimers();
        setStage(STAGES.length - 1);
        setDewarp(1);
        setDoneOpen(1);
        setPlaying(false);
      }
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [clearTimers]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return undefined;

    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          runFrom(0);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [reduced, runFrom]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const onSelectStage = (index) => {
    if (reduced) {
      goTo(STAGES.length - 1, { animate: false });
      return;
    }
    clearTimers();
    setPlaying(false);
    goTo(index, { animate: true });
    if (index === 3) {
      // scrub to dewarp mid/end — animate flatten once selected
      const start = performance.now();
      const dur = 1000;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        setDewarp(1 - (1 - t) ** 3);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    if (index === 4) {
      const start = performance.now();
      const dur = 900;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        setDoneOpen(1 - (1 - t) ** 3);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    if (index === 0) {
      setFlashing(false);
      timerRef.current = window.setTimeout(() => setFlashing(true), 400);
      timerRef.current = window.setTimeout(() => setFlashing(false), 700);
    }
  };

  const onReplay = () => {
    if (reduced) return;
    runFrom(0);
  };

  return (
    <section
      ref={rootRef}
      className="t100-ingest"
      aria-label="Scorecard ingestion sequence"
    >
      <div className="t100-ig-stage" data-stage={STAGES[stage].id}>
        {stage === 0 && <StagePhoto flashing={flashing} />}
        {stage === 1 && <StageCutout />}
        {stage === 2 && <StageRead />}
        {stage === 3 && <StageDewarp progress={dewarp} />}
        {stage === 4 && <StageDone open={doneOpen} />}
      </div>

      <div className="t100-ig-controls">
        <ol className="t100-ig-steps">
          {STAGES.map((s, index) => (
            <li key={s.id}>
              <button
                type="button"
                className={`t100-ig-step${stage === index ? ' is-active' : ''}${stage > index ? ' is-done' : ''}`}
                onClick={() => onSelectStage(index)}
                aria-current={stage === index ? 'step' : undefined}
              >
                <span className="t100-ig-step-label">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="t100-ig-note">{STAGES[stage].note}</p>
        {!reduced && (
          <button type="button" className="t100-ig-replay" onClick={onReplay} disabled={playing}>
            Replay
          </button>
        )}
      </div>
    </section>
  );
}

export default T100Ingest;
