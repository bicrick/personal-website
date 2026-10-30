import React, { useCallback, useEffect, useRef, useState } from 'react';
import RecordingIsland from './RecordingIsland';
import SidePanel from './SidePanel';
import useReducedMotion from '../useReducedMotion';
import { formatClock, waveformLevels } from './ink';
import { SENTENCES, CAPTURE_SWATCHES } from './samples';
import './datranscribuh.css';

const TYPE_MS = 28; // ~ per character when reduced-motion off
function Collage({ items }) {
  if (!items.length) return null;
  return (
    <span className="dtd-collage" aria-hidden="true">
      {items.map((c) => (
        <span key={c.id} className="dtd-collage-tile" style={{ background: c.fill }} title={c.label} />
      ))}
    </span>
  );
}

function RaceTrack({ running, reduced, onDone }) {
  const [typePct, setTypePct] = useState(0);
  const [talkPct, setTalkPct] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!running) {
      setTypePct(0);
      setTalkPct(0);
      done.current = false;
      return undefined;
    }
    if (reduced) {
      setTypePct(27); // ~40/150 of a full lap visual
      setTalkPct(100);
      if (!done.current) {
        done.current = true;
        // Keep the finished race on screen; parent clears via mode change.
      }
      return undefined;
    }
    // ~40 wpm vs ~150 wpm → talk finishes ~3.75× sooner. Animate over ~3.2s talk / ~12s type.
    const talkMs = 3200;
    const typeMs = 12000;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now) => {
      const dt = now - t0;
      setTalkPct(Math.min(100, (dt / talkMs) * 100));
      setTypePct(Math.min(100, (dt / typeMs) * 100));
      if (dt >= talkMs && !done.current) {
        done.current = true;
        onDone?.();
      }
      if (dt < typeMs) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, reduced, onDone]);

  return (
    <div className="dtd-race" aria-label="typing versus talking words per minute">
      <div className="dtd-race-row">
        <span className="dtd-race-label">typing · ~40 wpm</span>
        <div className="dtd-race-bar">
          <i style={{ width: `${typePct}%` }} />
        </div>
        <span className="dtd-race-num">{Math.round(typePct)}%</span>
      </div>
      <div className="dtd-race-row is-talk">
        <span className="dtd-race-label">talking · ~150 wpm</span>
        <div className="dtd-race-bar">
          <i style={{ width: `${talkPct}%` }} />
        </div>
        <span className="dtd-race-num">{Math.round(talkPct)}%</span>
      </div>
    </div>
  );
}

/**
 * Interactive da transcribuh demo — Monocle-shaped stage with the real
 * recording pill chrome (Ink / IslandMetrics classic).
 */
export default function DaTranscribuhDemo() {
  const reduced = useReducedMotion();
  const wrapRef = useRef(null);
  const fieldRef = useRef(null);
  const autoplayed = useRef(false);
  const sentenceIdx = useRef(0);
  const holdStarted = useRef(0);
  const typeTimer = useRef(null);
  const elapsedTimer = useRef(null);

  const [inView, setInView] = useState(false);
  const [focused, setFocused] = useState(false);
  const [mode, setMode] = useState('dictate');
  const [holding, setHolding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [captures, setCaptures] = useState(0);
  const [captureItems, setCaptureItems] = useState([]);
  const [fieldText, setFieldText] = useState('');
  const [pastedCollage, setPastedCollage] = useState([]);
  const [marquee, setMarquee] = useState(null);
  const [drag, setDrag] = useState(null);
  const [status, setStatus] = useState('idle');
  const [raceOn, setRaceOn] = useState(false);
  const [waveTick, setWaveTick] = useState(0);

  const holdingRef = useRef(false);
  const busyRef = useRef(false);
  const modeRef = useRef(mode);
  const captureItemsRef = useRef(captureItems);
  useEffect(() => { holdingRef.current = holding; }, [holding]);
  useEffect(() => { busyRef.current = busy; }, [busy]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { captureItemsRef.current = captureItems; }, [captureItems]);

  // IntersectionObserver — pause off-screen, autoplay once after ~900ms
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

  // Waveform tick while holding + in view
  useEffect(() => {
    if (!holding || !inView || reduced) return undefined;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now) => {
      setWaveTick((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [holding, inView, reduced]);

  const clearType = () => {
    if (typeTimer.current) {
      clearInterval(typeTimer.current);
      typeTimer.current = null;
    }
  };

  const fieldTextRef = useRef('');
  useEffect(() => {
    fieldTextRef.current = fieldText;
  }, [fieldText]);

  const typeIntoField = useCallback(
    (sentence, collage = []) => {
      clearType();
      busyRef.current = true;
      setBusy(true);
      setStatus('pasting');
      setPastedCollage(collage);
      const base = fieldTextRef.current
        ? `${fieldTextRef.current}\n`
        : '';
      if (reduced) {
        const next = base + sentence;
        fieldTextRef.current = next;
        setFieldText(next);
        busyRef.current = false;
        setBusy(false);
        setStatus('idle');
        return;
      }
      setFieldText(base);
      fieldTextRef.current = base;
      let i = 0;
      typeTimer.current = setInterval(() => {
        i += 1;
        const next = base + sentence.slice(0, i);
        fieldTextRef.current = next;
        setFieldText(next);
        if (i >= sentence.length) {
          clearType();
          busyRef.current = false;
          setBusy(false);
          setStatus('idle');
        }
      }, TYPE_MS);
    },
    [reduced]
  );

  const endHold = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    if (elapsedTimer.current) {
      clearInterval(elapsedTimer.current);
      elapsedTimer.current = null;
    }
    const sentence = SENTENCES[sentenceIdx.current % SENTENCES.length];
    sentenceIdx.current += 1;

    if (modeRef.current === 'race') {
      setRaceOn(true);
      busyRef.current = true;
      setBusy(true);
      setStatus('racing');
      setElapsed(0);
      setCaptures(0);
      setCaptureItems([]);
      setMarquee(null);
      return;
    }

    const collage = captureItemsRef.current.slice();
    setElapsed(0);
    setCaptures(0);
    setCaptureItems([]);
    setMarquee(null);
    typeIntoField(sentence, collage);
  }, [typeIntoField]);

  const startHold = useCallback(() => {
    if (busyRef.current || holdingRef.current) return;
    holdingRef.current = true;
    setHolding(true);
    holdStarted.current = performance.now();
    setStatus('recording');
    setElapsed(0);
    if (modeRef.current !== 'race') {
      setCaptures(0);
      setCaptureItems([]);
      setMarquee(null);
      setPastedCollage([]);
    }
    if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    elapsedTimer.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  }, []);

  // Spacebar hold when focused
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!focused) return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        startHold();
      }
    };
    const onKeyUp = (e) => {
      if (!focused) return;
      if (e.code === 'Space') {
        e.preventDefault();
        endHold();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [focused, startHold, endHold]);

  const startHoldRef = useRef(startHold);
  const endHoldRef = useRef(endHold);
  startHoldRef.current = startHold;
  endHoldRef.current = endHold;

  // Autoplay one canned run after ~900ms once in view
  useEffect(() => {
    if (!inView || autoplayed.current || reduced) return undefined;
    autoplayed.current = true;
    const timers = [];
    timers.push(
      window.setTimeout(() => {
        startHoldRef.current();
        timers.push(
          window.setTimeout(() => {
            setCaptures(1);
            setCaptureItems([CAPTURE_SWATCHES[0]]);
            setMarquee({ x: 18, y: 22, w: 42, h: 28 });
            timers.push(
              window.setTimeout(() => {
                endHoldRef.current();
              }, 700)
            );
          }, 900)
        );
      }, 900)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, reduced]);

  // Marquee drag on mock page (shift-drag or capture mode while holding)
  const onPointerDownPage = (e) => {
    if (!holding) return;
    if (mode !== 'capture' && !e.shiftKey) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrag({ ox: x, oy: y, x, y, w: 0, h: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMovePage = (e) => {
    if (!drag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const left = Math.min(drag.ox, x);
    const top = Math.min(drag.oy, y);
    const w = Math.abs(x - drag.ox);
    const h = Math.abs(y - drag.oy);
    setDrag({ ...drag, x: left, y: top, w, h });
    setMarquee({ x: left, y: top, w, h });
  };

  const commitGrab = useCallback(() => {
    const count = captureItemsRef.current.length;
    const next = {
      ...CAPTURE_SWATCHES[count % CAPTURE_SWATCHES.length],
      id: `${CAPTURE_SWATCHES[count % CAPTURE_SWATCHES.length].id}-${count}`,
    };
    const items = [...captureItemsRef.current, next];
    captureItemsRef.current = items;
    setCaptures(items.length);
    setCaptureItems(items);
    setMarquee((m) => m || { x: 12 + count * 8, y: 18 + count * 6, w: 36, h: 24 });
  }, []);

  const onPointerUpPage = () => {
    if (!drag) return;
    if (drag.w > 4 && drag.h > 4) {
      commitGrab();
    }
    setDrag(null);
  };

  const onMode = (id) => {
    if (busy || holding) return;
    setMode(id);
    setRaceOn(false);
    setStatus('idle');
  };

  const levels = holding ? waveformLevels(reduced ? 0.35 : waveTick) : null;

  return (
    <figure className="dtd" ref={wrapRef}>
      <div className="dtd-stage">
        <div className="dtd-browser">
          <div className="dtd-chrome">
            <span className="dtd-lights" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="dtd-url">Notes — untitled</span>
            <span className={`dtd-badge${holding ? ' is-on' : ''}`}>
              {holding ? 'recording' : 'idle'}
            </span>
          </div>

          <div
            className={`dtd-viewport${focused ? ' is-focused' : ''}`}
            tabIndex={0}
            role="application"
            aria-label="Mock editor. Hold space to dictate, or use the hold button."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            <div
              className="dtd-page"
              onPointerDown={onPointerDownPage}
              onPointerMove={onPointerMovePage}
              onPointerUp={onPointerUpPage}
              onPointerCancel={() => setDrag(null)}
            >
              <div className="dtd-page-gutter" aria-hidden="true">
                <span>12</span>
                <span>13</span>
                <span>14</span>
                <span>15</span>
              </div>
              <div className="dtd-page-body">
                <p className="dtd-page-stub">
                  {'// agent session — drop a prompt below'}
                </p>
                <div className="dtd-field-wrap">
                  {pastedCollage.length ? <Collage items={pastedCollage} /> : null}
                  <div className="dtd-field" ref={fieldRef}>
                    {fieldText || (
                      <span className="dtd-placeholder">
                        hold to talk — text lands here
                      </span>
                    )}
                    {busy && status === 'pasting' ? (
                      <span className="dtd-caret" aria-hidden="true" />
                    ) : null}
                  </div>
                </div>

                {mode === 'race' && (raceOn || holding) ? (
                  <RaceTrack
                    running={raceOn || holding}
                    reduced={reduced}
                    onDone={() => {
                      busyRef.current = false;
                      holdingRef.current = false;
                      setBusy(false);
                      setHolding(false);
                      setStatus('idle');
                      setElapsed(0);
                      // Keep raceOn so the finished bars stay visible until mode change.
                    }}
                  />
                ) : null}
              </div>

              {marquee && holding ? (
                <div
                  className="dtd-marquee"
                  style={{
                    left: `${marquee.x}%`,
                    top: `${marquee.y}%`,
                    width: `${marquee.w}%`,
                    height: `${marquee.h}%`,
                  }}
                />
              ) : null}

              <div className="dtd-island-slot">
                <RecordingIsland
                  visible={holding && mode !== 'race'}
                  elapsed={elapsed}
                  captures={captures}
                  levels={levels}
                  paused={!inView}
                  reduced={reduced}
                />
              </div>
            </div>
          </div>

          <div className="dtd-status">
            <span>mode: {mode}</span>
            <span>captures: {captures}</span>
            <span>clock: {formatClock(elapsed)}</span>
            <span className="dtd-status-hint">
              {focused
                ? holding
                  ? mode === 'capture'
                    ? 'shift-drag or grab to capture'
                    : 'release to paste'
                  : 'space to hold'
                : 'click the page, then hold space'}
            </span>
          </div>
        </div>

        <SidePanel
          mode={mode}
          onMode={onMode}
          holding={holding}
          busy={busy}
          captures={captures}
          elapsed={formatClock(elapsed)}
          status={status}
          onHoldStart={startHold}
          onHoldEnd={endHold}
          onGrab={commitGrab}
          canGrab={holding && mode === 'capture'}
        />
      </div>
      <figcaption>
        Canned runs — the real app transcribes on-device with Parakeet v2. Hold
        space (or the button) for the pill; grab a region while holding to bump
        the capture chip, then release for one paste.
      </figcaption>
    </figure>
  );
}
