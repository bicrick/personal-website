import React, { useCallback, useEffect, useRef, useState } from 'react';
import './T100Ingest.css';

const INGEST = `${process.env.PUBLIC_URL}/images/t100/ingest`;

const STEPS = [
  {
    id: 'photo',
    label: 'Photo',
    caption: 'System camera or library — Front required, Back optional.',
  },
  {
    id: 'cutout',
    label: 'Cutout',
    caption:
      'Vision mask lifts the paper; the server snaps it flat. Fold-aware dewarp runs only when a crease is found — this card had none, so it was skipped.',
  },
  {
    id: 'read',
    label: 'Read',
    caption:
      'RapidOCR maps the printed hole grid; Jev reads each handwritten cell.',
  },
  {
    id: 'done',
    label: 'Done',
    caption: 'One tap question per screen · ask below 0.72.',
  },
];

const STEP_MS = [2600, 3200, 4200, 0];

const META = {
  player: 'ANTHONY',
  total: 64,
  out: 30,
  inn: 34,
  holesPlayed: 18,
  teeOptions: ['Blue', 'White'],
  question: 'Which tees?',
  nameBox: {
    x: 0.10633333333333336,
    y: 0.5505003706449222,
    w: 0.19977777777777775,
    h: 0.04099913700585288,
  },
  cells: [
    { hole: 1, value: 4, x: 0.3061111111111111, y: 0.5505003706449222, w: 0.049999999999999906, h: 0.04099913700585288 },
    { hole: 2, value: 5, x: 0.35611111111111104, y: 0.5505003706449222, w: 0.050000000000000065, h: 0.04099913700585288 },
    { hole: 3, value: 4, x: 0.4061111111111111, y: 0.5505003706449222, w: 0.051111111111111086, h: 0.04099913700585288 },
    { hole: 4, value: 3, x: 0.4572222222222222, y: 0.5505003706449222, w: 0.04833333333333341, h: 0.04099913700585288 },
    { hole: 5, value: 3, x: 0.5055555555555555, y: 0.5505003706449222, w: 0.04999999999999998, h: 0.04099913700585288 },
    { hole: 6, value: 3, x: 0.5555555555555556, y: 0.5505003706449222, w: 0.051111111111111086, h: 0.04099913700585288 },
    { hole: 7, value: 3, x: 0.6066666666666667, y: 0.5505003706449222, w: 0.05111111111111116, h: 0.04099913700585288 },
    { hole: 8, value: 2, x: 0.6577777777777778, y: 0.5505003706449222, w: 0.04944444444444435, h: 0.04099913700585288 },
    { hole: 9, value: 3, x: 0.7072222222222222, y: 0.5505003706449222, w: 0.050000000000000065, h: 0.04099913700585288 },
  ],
};

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function boxStyle(b) {
  return {
    left: `${b.x * 100}%`,
    top: `${b.y * 100}%`,
    width: `${b.w * 100}%`,
    height: `${b.h * 100}%`,
  };
}

function nameTagStyle(b) {
  /* Anchor above the name row — keep handwritten ink fully visible */
  return {
    left: `${b.x * 100}%`,
    top: `calc(${b.y * 100}% - 26px)`,
    width: 'auto',
  };
}

function T100Ingest() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cutPhase, setCutPhase] = useState(0);
  const [litCount, setLitCount] = useState(0);
  const [tee, setTee] = useState(null);
  const timerRef = useRef(null);
  const rafRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      window.clearInterval(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const goTo = useCallback(
    (index) => {
      clearTimers();
      const next = Math.max(0, Math.min(STEPS.length - 1, index));
      setStep(next);
      setPlaying(false);
      setCutPhase(next >= 2 ? 1 : 0);
      setLitCount(next >= 2 ? META.cells.length : 0);
      if (next < 3) setTee(null);
    },
    [clearTimers],
  );

  const runFrom = useCallback(
    (startIndex) => {
      clearTimers();
      if (prefersReducedMotion()) {
        setStep(STEPS.length - 1);
        setCutPhase(1);
        setLitCount(META.cells.length);
        setPlaying(false);
        return;
      }

      setPlaying(true);
      let i = startIndex;

      const advance = () => {
        setStep(i);

        if (i === 1) {
          setCutPhase(0);
          timerRef.current = window.setTimeout(() => {
            setCutPhase(1);
            timerRef.current = window.setTimeout(() => {
              i += 1;
              advance();
            }, 1600);
          }, 1400);
          return;
        }

        if (i === 2) {
          setLitCount(0);
          let n = 0;
          rafRef.current = window.setInterval(() => {
            n += 1;
            setLitCount(n);
            if (n >= META.cells.length) {
              window.clearInterval(rafRef.current);
              rafRef.current = 0;
              timerRef.current = window.setTimeout(() => {
                i += 1;
                advance();
              }, 900);
            }
          }, 280);
          return;
        }

        if (i === 3) {
          setLitCount(META.cells.length);
          setCutPhase(1);
          setPlaying(false);
          return;
        }

        timerRef.current = window.setTimeout(() => {
          i += 1;
          if (i < STEPS.length) advance();
          else setPlaying(false);
        }, STEP_MS[i] || 2400);
      };

      advance();
    },
    [clearTimers],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (mq.matches) {
        clearTimers();
        setStep(3);
        setCutPhase(1);
        setLitCount(META.cells.length);
        setPlaying(false);
      }
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [clearTimers]);

  useEffect(() => {
    const root = document.querySelector('.t100-ingest');
    if (!root || prefersReducedMotion()) return undefined;

    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (started) return;
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.35)) {
          started = true;
          runFrom(0);
          io.disconnect();
        }
      },
      { threshold: [0.35] },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [runFrom]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const showPhoto = step === 0;
  const showCutout = step === 1 && cutPhase === 0;
  const showRect = step === 1 && cutPhase === 1;
  const showRead = step === 2;
  const showDone = step === 3;

  const resultPanel = (
    <div className="t100-ig-result-inner">
      <div className="t100-ig-score">
        <div className="t100-ig-score-text">
          <span>{META.player}</span>
          <em>
            {META.holesPlayed} holes · OUT {META.out} · IN {META.inn}
          </em>
        </div>
        <strong>{META.total}</strong>
      </div>
      <div className="t100-ig-ask" aria-live="polite">
        <span className="t100-ig-ask-kicker">Confirm · 1/1</span>
        <p>{META.question}</p>
        <div className="t100-ig-ask-opts">
          {META.teeOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              className={tee === opt ? 'is-picked' : undefined}
              onClick={() => setTee(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="t100-ingest" aria-label="Scorecard ingestion sequence">
      <div className="t100-ig-frame" data-step={STEPS[step].id}>
        <div className="t100-ig-stage">
          <div
            className={`t100-ig-layer is-photo${showPhoto ? ' is-on' : ''}`}
            aria-hidden={!showPhoto}
          >
            <img
              src={`${INGEST}/step-photo.webp`}
              alt=""
              width={720}
              height={540}
              draggable={false}
            />
          </div>

          <div
            className={`t100-ig-layer is-cutout${showCutout ? ' is-on' : ''}`}
            aria-hidden={!showCutout}
          >
            <img
              src={`${INGEST}/step-cutout.webp`}
              alt=""
              width={719}
              height={536}
              draggable={false}
            />
          </div>

          <div
            className={`t100-ig-layer is-rect${showRect ? ' is-on' : ''}`}
            aria-hidden={!showRect}
          >
            <img
              src={`${INGEST}/step-rectified.webp`}
              alt=""
              width={719}
              height={536}
              draggable={false}
            />
          </div>

          <div
            className={`t100-ig-layer is-read${showRead ? ' is-on' : ''}`}
            aria-hidden={!showRead}
          >
            <div className="t100-ig-cardbox">
              <img
                src={`${INGEST}/step-grid.webp`}
                alt=""
                width={719}
              height={536}
                draggable={false}
              />
              <div className="t100-ig-cells" aria-hidden="true">
                <span
                  className={`t100-ig-name-tag${litCount > 0 ? ' is-lit' : ''}`}
                  style={nameTagStyle(META.nameBox)}
                >
                  {META.player}
                </span>
                <span
                  className={`t100-ig-cell is-name-hit${litCount > 0 ? ' is-lit' : ''}`}
                  style={boxStyle(META.nameBox)}
                />
                {META.cells.map((cell, idx) => (
                  <span
                    key={cell.hole}
                    className={`t100-ig-cell${litCount > idx ? ' is-lit' : ''}`}
                    style={boxStyle(cell)}
                  >
                    <em>{cell.value}</em>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`t100-ig-layer is-done${showDone ? ' is-on' : ''}`}
            aria-hidden={!showDone}
          >
            <div className="t100-ig-cardbox">
              <img
                src={`${INGEST}/step-rectified.webp`}
                alt=""
                width={719}
              height={536}
                draggable={false}
              />
            </div>
            <div className="t100-ig-result t100-ig-result-overlay">
              {resultPanel}
            </div>
          </div>
        </div>

        {showDone && (
          <div className="t100-ig-result t100-ig-result-below">{resultPanel}</div>
        )}
      </div>

      <div className="t100-ig-controls">
        <div className="t100-ig-tabs" role="tablist" aria-label="Ingest steps">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={step === i}
              className={step === i ? 'is-active' : undefined}
              onClick={() => goTo(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="t100-ig-caption">{STEPS[step].caption}</p>
        <button
          type="button"
          className="t100-ig-replay"
          onClick={() => runFrom(0)}
          disabled={playing}
        >
          Replay
        </button>
      </div>
    </section>
  );
}

export default T100Ingest;
