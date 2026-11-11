import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import './T100Ingest.css';
import {
  META,
  STEPS,
  prefersReducedMotion,
} from './T100IngestMeta';

const T100IngestScene = lazy(() => import('./T100IngestScene'));

const PHOTO_MS = 3200;
const CUTOUT_MS = 2400;
const READ_CELL_MS = 280;
const READ_TAIL_MS = 900;
const DONE_DWELL_MS = 2800;
const LOOP_GAP_MS = 700;

function useIsDark() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('is-dark')
      : false,
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains('is-dark'));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  return isDark;
}

function T100Ingest() {
  const [step, setStep] = useState(0);
  const [, setPlaying] = useState(false);
  const [cutProgress, setCutProgress] = useState(0);
  const [litCount, setLitCount] = useState(0);
  const [tee, setTee] = useState(null);
  const [flash, setFlash] = useState(0);
  const [viewfinder, setViewfinder] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const isDark = useIsDark();

  const timerRef = useRef(null);
  const intervalRef = useRef(0);
  const rafRef = useRef(0);
  const loopRef = useRef(true);
  const userControlRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = 0;
    }
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const settleStaticStep = useCallback((index) => {
    const next = Math.max(0, Math.min(STEPS.length - 1, index));
    setStep(next);
    setPlaying(false);
    setFlash(0);
    setViewfinder(false);
    if (next === 0) {
      setCutProgress(0);
      setLitCount(0);
    } else if (next === 1) {
      // Mid-normalize pose for the Cutout scrubber frame
      setCutProgress(0.42);
      setLitCount(0);
    } else if (next === 2) {
      setCutProgress(1);
      setLitCount(META.cells.length);
    } else {
      setCutProgress(1);
      setLitCount(META.cells.length);
    }
    if (next < 3) setTee(null);
  }, []);

  const goTo = useCallback(
    (index) => {
      clearTimers();
      loopRef.current = false;
      userControlRef.current = true;
      settleStaticStep(index);
    },
    [clearTimers, settleStaticStep],
  );

  const runFrom = useCallback(
    (startIndex) => {
      clearTimers();
      loopRef.current = true;
      userControlRef.current = false;

      if (prefersReducedMotion()) {
        settleStaticStep(startIndex);
        return;
      }

      setPlaying(true);
      setTee(null);
      let i = startIndex;

      const schedule = (fn, ms) => {
        timerRef.current = window.setTimeout(fn, ms);
      };

      const advance = () => {
        if (!loopRef.current && i !== startIndex) {
          /* scrubber interrupted */
        }
        setStep(i);
        setFlash(0);
        setViewfinder(false);

        if (i === 0) {
          setCutProgress(0);
          setLitCount(0);
          // Viewfinder then shutter blink mid-Photo
          schedule(() => {
            setViewfinder(true);
            schedule(() => {
              setFlash(1);
              setViewfinder(false);
              schedule(() => {
                setFlash(0);
                schedule(() => {
                  i = 1;
                  advance();
                }, 700);
              }, 140);
            }, 700);
          }, 1400);
          return;
        }

        if (i === 1) {
          setLitCount(0);
          setCutProgress(0);
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - start) / CUTOUT_MS);
            setCutProgress(t);
            if (t < 1) {
              rafRef.current = window.requestAnimationFrame(tick);
            } else {
              rafRef.current = 0;
              schedule(() => {
                i = 2;
                advance();
              }, 350);
            }
          };
          rafRef.current = window.requestAnimationFrame(tick);
          return;
        }

        if (i === 2) {
          setCutProgress(1);
          setLitCount(0);
          let n = 0;
          intervalRef.current = window.setInterval(() => {
            n += 1;
            setLitCount(n);
            if (n >= META.cells.length) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = 0;
              schedule(() => {
                i = 3;
                advance();
              }, READ_TAIL_MS);
            }
          }, READ_CELL_MS);
          return;
        }

        if (i === 3) {
          setCutProgress(1);
          setLitCount(META.cells.length);
          schedule(() => {
            if (!loopRef.current) {
              setPlaying(false);
              return;
            }
            schedule(() => {
              i = 0;
              advance();
            }, LOOP_GAP_MS);
          }, DONE_DWELL_MS);
          return;
        }

        schedule(() => {
          i += 1;
          if (i < STEPS.length) advance();
          else setPlaying(false);
        }, PHOTO_MS);
      };

      advance();
    },
    [clearTimers, settleStaticStep],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const on = mq.matches;
      setReducedMotion(on);
      if (on) {
        clearTimers();
        settleStaticStep(0);
      }
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [clearTimers, settleStaticStep]);

  useEffect(() => {
    const root = document.querySelector('.t100-ingest');
    if (!root || prefersReducedMotion()) return undefined;

    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (started || userControlRef.current) return;
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
      <div
        className="t100-ig-frame"
        data-step={STEPS[step].id}
        data-cut={cutProgress.toFixed(2)}
        data-lit={litCount}
      >
        <div className="t100-ig-stage">
          <Suspense
            fallback={
              <div className="t100-ig-fallback" aria-hidden="true">
                Loading 3D…
              </div>
            }
          >
            <T100IngestScene
              step={step}
              cutProgress={cutProgress}
              litCount={litCount}
              isDark={isDark}
              reducedMotion={reducedMotion}
            />
          </Suspense>

          <div
            className={`t100-ig-viewfinder${viewfinder ? ' is-on' : ''}`}
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
            <span />
          </div>
          <div
            className={`t100-ig-flash${flash > 0 ? ' is-on' : ''}`}
            aria-hidden="true"
          />
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
          onClick={() => {
            loopRef.current = true;
            runFrom(0);
          }}
        >
          Replay
        </button>
      </div>
    </section>
  );
}

export default T100Ingest;
