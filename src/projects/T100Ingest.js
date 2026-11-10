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
  // Normalized boxes from Crow Canyon front grid (sequence.json / 08-player-rows)
  nameBox: {
    x: 0.10503512880562066,
    y: 0.36659663865546216,
    w: 0.2105386416861826,
    h: 0.05777310924369748,
  },
  cells: [
    { hole: 1, value: 4, x: 0.3155737704918033, y: 0.36659663865546216, w: 0.05269320843091335, h: 0.05777310924369748 },
    { hole: 2, value: 5, x: 0.36826697892271665, y: 0.36659663865546216, w: 0.05269320843091335, h: 0.05777310924369748 },
    { hole: 3, value: 4, x: 0.42096018735363, y: 0.36659663865546216, w: 0.053864168618266976, h: 0.05777310924369748 },
    { hole: 4, value: 3, x: 0.474824355971897, y: 0.36659663865546216, w: 0.050936768149882905, h: 0.05777310924369748 },
    { hole: 5, value: 3, x: 0.5257611241217799, y: 0.36659663865546216, w: 0.05269320843091335, h: 0.05777310924369748 },
    { hole: 6, value: 3, x: 0.5784543325526932, y: 0.36659663865546216, w: 0.053864168618266976, h: 0.05777310924369748 },
    { hole: 7, value: 3, x: 0.6323185011709602, y: 0.36659663865546216, w: 0.053864168618266976, h: 0.05777310924369748 },
    { hole: 8, value: 2, x: 0.6861826697892272, y: 0.36659663865546216, w: 0.052107728337236536, h: 0.05777310924369748 },
    { hole: 9, value: 3, x: 0.7382903981264637, y: 0.36659663865546216, w: 0.05269320843091335, h: 0.05777310924369748 },
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

function T100Ingest() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cutPhase, setCutPhase] = useState(0); // 0 photo→mask, 1 mask→rect
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
      // Photo: original. Cutout tab: mask-on-void (bg dropped). Read/Done: flat rect.
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

  const showPhoto = step === 0 || (step === 1 && cutPhase === 0);
  const showCutout = step === 1 && cutPhase === 0;
  const showRect = (step === 1 && cutPhase === 1) || step === 2;
  const showGrid = step === 2;
  const showDone = step === 3;

  return (
    <section className="t100-ingest" aria-label="Scorecard ingestion sequence">
      <div className="t100-ig-frame" data-step={STEPS[step].id}>
        <div className="t100-ig-stage">
          {/* Photo — original card, landscape */}
          <img
            className={`t100-ig-layer is-photo${showPhoto ? ' is-on' : ''}`}
            src={`${INGEST}/step-photo.webp`}
            alt=""
            width={960}
            height={444}
            draggable={false}
          />

          {/* Cutout — masked paper over stage (bg drops away) */}
          <div
            className={`t100-ig-layer is-cutout${showCutout ? ' is-on' : ''}`}
            aria-hidden={!showCutout}
          >
            <img
              src={`${INGEST}/step-cutout.webp`}
              alt=""
              width={960}
              height={444}
              draggable={false}
            />
          </div>

          {/* Rectified — flat square card */}
          <img
            className={`t100-ig-layer is-rect${showRect ? ' is-on' : ''}`}
            src={`${INGEST}/step-rectified.webp`}
            alt=""
            width={960}
            height={444}
            draggable={false}
          />

          {/* Read — grid overlay + cell lights */}
          <div
            className={`t100-ig-layer is-read${showGrid ? ' is-on' : ''}`}
            aria-hidden={!showGrid}
          >
            <img
              src={`${INGEST}/step-grid.webp`}
              alt=""
              width={960}
              height={444}
              draggable={false}
            />
            <div className="t100-ig-cells" aria-hidden="true">
              <span
                className={`t100-ig-cell is-name${litCount > 0 ? ' is-lit' : ''}`}
                style={boxStyle(META.nameBox)}
              >
                <em>{META.player}</em>
              </span>
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

          {/* Done — result chip on the same rectified card */}
          <div
            className={`t100-ig-layer is-done${showDone ? ' is-on' : ''}`}
            aria-hidden={!showDone}
          >
            <img
              src={`${INGEST}/step-rectified.webp`}
              alt=""
              width={960}
              height={444}
              draggable={false}
            />
            <div className="t100-ig-result">
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
          </div>
        </div>
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
