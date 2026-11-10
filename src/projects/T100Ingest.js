import React, { useCallback, useEffect, useRef, useState } from 'react';
import './T100Ingest.css';

const INGEST = `${process.env.PUBLIC_URL}/images/t100/ingest`;

/** Crow Canyon extract — develop e548054 / #56 card 03. */
const EXTRACT = {
  player: 'ANTHONY',
  out: 30,
  inn: 34,
  total: 64,
  holesPlayed: 18,
  teeOptions: ['Blue', 'White'],
  holes: [
    { n: 1, v: 4 },
    { n: 7, v: 3 },
    { n: 12, v: 3 },
    { n: 18, v: 4 },
  ],
  questions: [
    { id: 'course', prompt: 'Is this the course?' },
    { id: 'date', prompt: 'When did you play?' },
    { id: 'tee', prompt: 'Which tees?', options: ['Blue', 'White'] },
  ],
};

const STAGES = [
  {
    id: 'photo',
    label: 'Photo',
    note: 'System camera or library · Front required · Back optional',
  },
  {
    id: 'cutout',
    label: 'Cutout',
    note: 'Vision alpha silhouette · server LSD only if it beats identity',
  },
  {
    id: 'read',
    label: 'Read',
    note: 'RapidOCR maps the grid · Jev per cell · Haiku only if header missing',
  },
  {
    id: 'dewarp',
    label: 'Dewarp',
    note: 'Fold-aware mesh kept when crease ≥ 0.05 or warp ≥ 45 px',
  },
  {
    id: 'done',
    label: 'Done',
    note: 'One tap question per screen · ask below 0.72',
  },
];

const STAGE_MS = [2400, 2800, 3400, 2800, 0];

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function StagePhoto() {
  return (
    <div className="t100-ig-photo">
      <div className="t100-ig-slots" aria-hidden="true">
        <div className="t100-ig-slot is-front is-filled">
          <span className="t100-ig-slot-label">Front</span>
          <div className="t100-ig-slot-frame">
            <img
              src={`${INGEST}/photo-front.webp`}
              alt=""
              width={720}
              height={540}
              draggable={false}
            />
          </div>
        </div>
        <div className="t100-ig-slot is-back is-empty">
          <span className="t100-ig-slot-label">Back</span>
          <div className="t100-ig-slot-frame">
            <span className="t100-ig-slot-empty">
              <i className="t100-ig-cam" />
              <em>Optional</em>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageCutout() {
  // On-device Vision alpha (Yale) + server LSD quad when it beats identity (Seve)
  return (
    <div className="t100-ig-cutout">
      <div className="t100-ig-desk-noise" aria-hidden="true" />
      <div className="t100-ig-cut-pair">
        <figure className="t100-ig-cut-panel is-vision">
          <img
            className="t100-ig-vision-img"
            src={`${INGEST}/cutout-vision.webp`}
            alt=""
            width={715}
            height={1040}
            draggable={false}
          />
          <figcaption className="t100-ig-cut-tag">Vision mask</figcaption>
        </figure>
        <figure className="t100-ig-cut-panel is-lsd">
          <img
            className="t100-ig-quad-img"
            src={`${INGEST}/cutout-quad.webp`}
            alt=""
            width={1279}
            height={720}
            draggable={false}
          />
          <figcaption className="t100-ig-cut-tag">Server LSD quad</figcaption>
        </figure>
      </div>
    </div>
  );
}

function StageRead() {
  return (
    <div className="t100-ig-read">
      <div className="t100-ig-grid-wrap">
        <img
          src={`${INGEST}/read-grid.webp`}
          alt=""
          width={1200}
          height={899}
          draggable={false}
        />
      </div>
      <aside className="t100-ig-chips" aria-label="Extracted values">
        <div className="t100-ig-chip is-player">
          <span>Player</span>
          <strong>{EXTRACT.player}</strong>
        </div>
        <div className="t100-ig-chip is-holes-n">
          <span>Holes</span>
          <strong>{EXTRACT.holesPlayed}</strong>
        </div>
        <div className="t100-ig-chip is-score">
          <span>{EXTRACT.player}</span>
          <strong>
            OUT {EXTRACT.out} · IN {EXTRACT.inn} · TOT {EXTRACT.total}
          </strong>
        </div>
        <div className="t100-ig-chip is-tees">
          <span>Tees</span>
          <strong>{EXTRACT.teeOptions.join(' · ')}</strong>
        </div>
        <div className="t100-ig-chip is-holes">
          <span>Sample holes</span>
          <strong>
            {EXTRACT.holes.map((h) => (
              <em key={h.n}>
                {h.n}: {h.v}
              </em>
            ))}
          </strong>
        </div>
      </aside>
    </div>
  );
}

function StageDewarp({ progress }) {
  // Real fold-aware pair: left = creased, right = mesh kept (score 0.13, 91 px)
  const t = Math.max(0, Math.min(1, progress));
  return (
    <div className="t100-ig-dewarp" style={{ '--open': t }}>
      <div className="t100-ig-dewarp-frame">
        <img
          src={`${INGEST}/dewarp-before-after.webp`}
          alt=""
          width={1396}
          height={1240}
          draggable={false}
        />
        <span className="t100-ig-dewarp-label is-before">Before</span>
        <span className="t100-ig-dewarp-label is-after">After</span>
        <span
          className="t100-ig-dewarp-scrub"
          style={{ left: `${50 + t * 0}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function StageDone({ open }) {
  const shown = open > 0.15;
  const qIndex = Math.min(
    EXTRACT.questions.length - 1,
    Math.floor(Math.max(0, open - 0.2) * EXTRACT.questions.length),
  );
  const question = EXTRACT.questions[qIndex];

  return (
    <div
      className={`t100-ig-done${shown ? ' is-open' : ''}`}
      style={{ '--open': open }}
    >
      <div className="t100-ig-done-cards">
        <img
          className="t100-ig-rendition is-front"
          src={`${INGEST}/rendition-front.webp`}
          alt=""
          width={800}
          height={727}
          draggable={false}
        />
        <img
          className="t100-ig-rendition is-back"
          src={`${INGEST}/rendition-back.webp`}
          alt=""
          width={800}
          height={696}
          draggable={false}
        />
      </div>
      <div className="t100-ig-done-side">
        <div className="t100-ig-done-score">
          <span>{EXTRACT.player}</span>
          <strong>{EXTRACT.total}</strong>
          <em>
            {EXTRACT.holesPlayed} holes · OUT {EXTRACT.out} · IN {EXTRACT.inn}
          </em>
        </div>
        <div className="t100-ig-ask" aria-live="polite">
          <span className="t100-ig-ask-kicker">
            Confirm · {qIndex + 1}/{EXTRACT.questions.length}
          </span>
          <strong>{question.prompt}</strong>
          {question.options ? (
            <div className="t100-ig-ask-opts">
              {question.options.map((opt) => (
                <span key={opt}>{opt}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function T100Ingest() {
  const rootRef = useRef(null);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
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

    const animateProgress = (setter, dur, onDone) => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - (1 - t) ** 3;
        setter(eased);
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

      if (i === 3) {
        setDewarp(0);
        animateProgress(setDewarp, 1500, () => {
          i += 1;
          step();
        });
        return;
      }

      if (i === 4) {
        setDoneOpen(0);
        animateProgress(setDoneOpen, 1400, () => {
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

    const animateProgress = (setter, dur) => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        setter(1 - (1 - t) ** 3);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    if (index === 3) animateProgress(setDewarp, 1100);
    if (index === 4) animateProgress(setDoneOpen, 1000);
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
        {stage === 0 && <StagePhoto />}
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
