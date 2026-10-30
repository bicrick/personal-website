import React, { useCallback, useEffect, useRef, useState } from 'react';
import RecordingIsland from './RecordingIsland';
import SidePanel from './SidePanel';
import MockShop, { GrabThumb } from './MockShop';
import useReducedMotion from '../useReducedMotion';
import {
  formatClock,
  restingLevels,
  smoothLevels,
  speechTargetFromText,
  WaveAttackTau,
  WaveReleaseTau,
  WaveIdleReleaseTau,
  WaveformCount,
} from './ink';
import { DICTATE_SENTENCES, GRAB_TARGETS, HINTS } from './samples';
import './datranscribuh.css';

const TYPE_MS = 28;
/** Rough on-device speech pace while the pill is held (~12–14 chars/s). */
const SPEECH_MS = 72;
/** After paste, linger on idle comb before dismissing the pill. */
const CLOSE_AFTER_IDLE_MS = 420;

function Collage({ items }) {
  if (!items.length) return null;
  return (
    <span className="dtd-collage" aria-hidden="true">
      {items.map((c) => (
        <GrabThumb key={c.id} id={c.targetId} />
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
      setTypePct(27);
      setTalkPct(100);
      if (!done.current) {
        done.current = true;
        onDone?.();
      }
      return undefined;
    }
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

function rectToMarquee(pageEl, targetEl) {
  const page = pageEl.getBoundingClientRect();
  const t = targetEl.getBoundingClientRect();
  const pad = 4;
  return {
    x: ((t.left - page.left - pad) / page.width) * 100,
    y: ((t.top - page.top - pad) / page.height) * 100,
    w: ((t.width + pad * 2) / page.width) * 100,
    h: ((t.height + pad * 2) / page.height) * 100,
  };
}

/**
 * Interactive da transcribuh demo — Monocle-shaped stage with Ink island chrome.
 */
export default function DaTranscribuhDemo() {
  const reduced = useReducedMotion();
  const wrapRef = useRef(null);
  const pageRef = useRef(null);
  const shopRef = useRef(null);
  const autoplayed = useRef(false);
  const dictateIdx = useRef(0);
  const grabIdx = useRef(0);
  const holdStarted = useRef(0);
  const pauseBegan = useRef(null);
  const typeTimer = useRef(null);
  const closeTimer = useRef(null);

  const [inView, setInView] = useState(false);
  const [focused, setFocused] = useState(false);
  const [mode, setMode] = useState('dictate');
  const [holding, setHolding] = useState(false);
  const [islandOn, setIslandOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [captures, setCaptures] = useState(0);
  const [captureItems, setCaptureItems] = useState([]);
  const [fieldText, setFieldText] = useState('');
  const [pastedCollage, setPastedCollage] = useState([]);
  const [marquee, setMarquee] = useState(null);
  const [activeGrabId, setActiveGrabId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [raceOn, setRaceOn] = useState(false);
  const [levels, setLevels] = useState(() => restingLevels());

  const holdingRef = useRef(false);
  const busyRef = useRef(false);
  const modeRef = useRef(mode);
  const captureItemsRef = useRef(captureItems);
  const fieldTextRef = useRef('');
  const islandOnRef = useRef(false);
  const levelsRef = useRef(restingLevels());
  const speechTextRef = useRef('');
  const speechCharsRef = useRef(0);
  const waveModeRef = useRef('idle'); // 'speech' | 'idle'
  const pasteBaseLenRef = useRef(0);

  useEffect(() => { holdingRef.current = holding; }, [holding]);
  useEffect(() => { busyRef.current = busy; }, [busy]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { captureItemsRef.current = captureItems; }, [captureItems]);
  useEffect(() => { fieldTextRef.current = fieldText; }, [fieldText]);
  useEffect(() => { islandOnRef.current = islandOn; }, [islandOn]);

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

  // Pause elapsed clock while off-screen
  useEffect(() => {
    if (holding && !inView) {
      if (pauseBegan.current == null) pauseBegan.current = performance.now();
      return undefined;
    }
    if (holding && inView && pauseBegan.current != null) {
      holdStarted.current += performance.now() - pauseBegan.current;
      pauseBegan.current = null;
    }
    return undefined;
  }, [holding, inView]);

  // Live elapsed while holding + in view
  useEffect(() => {
    if (!holding || !inView) return undefined;
    let raf = 0;
    const loop = (now) => {
      setElapsed((now - holdStarted.current) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [holding, inView]);

  // Advance a speech cursor through the planned sentence while holding.
  useEffect(() => {
    if (!holding || !inView || reduced) return undefined;
    const id = window.setInterval(() => {
      const text = speechTextRef.current;
      if (!text) return;
      if (speechCharsRef.current < text.length) {
        speechCharsRef.current += 1;
      }
    }, SPEECH_MS);
    return () => window.clearInterval(id);
  }, [holding, inView, reduced]);

  // Smooth comb toward speech target or resting idle (FrequencyBands.smooth).
  useEffect(() => {
    if (!islandOn) {
      levelsRef.current = restingLevels();
      setLevels(levelsRef.current);
      return undefined;
    }
    if (reduced) {
      const mid = speechTargetFromText(
        speechTextRef.current || 'talk',
        Math.max(1, Math.floor((speechTextRef.current || 'talk').length * 0.4)),
        WaveformCount,
        0.35
      );
      levelsRef.current = mid;
      setLevels(mid);
      return undefined;
    }
    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      const speaking = waveModeRef.current === 'speech';
      const target = speaking
        ? speechTargetFromText(
            speechTextRef.current,
            speechCharsRef.current,
            WaveformCount,
            now / 1000
          )
        : restingLevels();
      const next = smoothLevels(
        levelsRef.current,
        target,
        delta,
        speaking ? WaveAttackTau : 0.05,
        speaking ? WaveReleaseTau : WaveIdleReleaseTau
      );
      levelsRef.current = next;
      setLevels(next);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [islandOn, reduced]);

  const clearType = () => {
    if (typeTimer.current) {
      clearInterval(typeTimer.current);
      typeTimer.current = null;
    }
  };

  const clearClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const dismissIsland = useCallback(() => {
    waveModeRef.current = 'idle';
    clearClose();
    closeTimer.current = window.setTimeout(() => {
      setIslandOn(false);
      islandOnRef.current = false;
      speechTextRef.current = '';
      speechCharsRef.current = 0;
      closeTimer.current = null;
    }, reduced ? 0 : CLOSE_AFTER_IDLE_MS);
  }, [reduced]);

  const typeIntoField = useCallback(
    (sentence, collage = []) => {
      clearType();
      clearClose();
      busyRef.current = true;
      setBusy(true);
      setStatus('pasting');
      setPastedCollage(collage);
      setIslandOn(true);
      islandOnRef.current = true;
      speechTextRef.current = sentence;
      speechCharsRef.current = 0;
      waveModeRef.current = 'speech';
      const base = fieldTextRef.current ? `${fieldTextRef.current}\n` : '';
      pasteBaseLenRef.current = base.length;
      if (reduced) {
        const next = base + sentence;
        fieldTextRef.current = next;
        setFieldText(next);
        speechCharsRef.current = sentence.length;
        busyRef.current = false;
        setBusy(false);
        setStatus('idle');
        dismissIsland();
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
        speechCharsRef.current = i;
        if (i >= sentence.length) {
          clearType();
          busyRef.current = false;
          setBusy(false);
          setStatus('idle');
          dismissIsland();
        }
      }, TYPE_MS);
    },
    [reduced, dismissIsland]
  );

  const endHold = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    pauseBegan.current = null;

    if (modeRef.current === 'race') {
      setRaceOn(true);
      busyRef.current = true;
      setBusy(true);
      setStatus('racing');
      setElapsed(0);
      setCaptures(0);
      setCaptureItems([]);
      setMarquee(null);
      setActiveGrabId(null);
      setIslandOn(false);
      waveModeRef.current = 'idle';
      return;
    }

    const collage = captureItemsRef.current.slice();
    let sentence;
    if (collage.length) {
      sentence = collage.map((c) => c.prompt).join('; ');
    } else {
      sentence = DICTATE_SENTENCES[dictateIdx.current % DICTATE_SENTENCES.length];
      dictateIdx.current += 1;
    }
    setElapsed(0);
    setCaptures(0);
    setCaptureItems([]);
    setMarquee(null);
    setActiveGrabId(null);
    typeIntoField(sentence, collage);
  }, [typeIntoField]);

  const startHold = useCallback(() => {
    if (busyRef.current || holdingRef.current) return;
    holdingRef.current = true;
    setHolding(true);
    holdStarted.current = performance.now();
    pauseBegan.current = null;
    setStatus('recording');
    setElapsed(0);
    clearClose();
    setIslandOn(true);
    islandOnRef.current = true;
    waveModeRef.current = 'speech';
    speechCharsRef.current = 0;

    if (modeRef.current !== 'race') {
      setCaptures(0);
      setCaptureItems([]);
      setMarquee(null);
      setActiveGrabId(null);
      setPastedCollage([]);
      // Peek the line we'll paste so the comb tracks it while held.
      if (modeRef.current === 'capture') {
        speechTextRef.current = GRAB_TARGETS[grabIdx.current % GRAB_TARGETS.length].prompt;
      } else {
        speechTextRef.current =
          DICTATE_SENTENCES[dictateIdx.current % DICTATE_SENTENCES.length];
      }
    } else {
      speechTextRef.current = '';
      setIslandOn(false);
      waveModeRef.current = 'idle';
    }
  }, []);

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
  const commitGrabRef = useRef(null);
  startHoldRef.current = startHold;
  endHoldRef.current = endHold;

  const commitGrab = useCallback(() => {
    if (!holdingRef.current) return;
    const pageEl = pageRef.current;
    if (!pageEl) return;
    const target = GRAB_TARGETS[grabIdx.current % GRAB_TARGETS.length];
    grabIdx.current += 1;
    const el = pageEl.querySelector(`[data-grab="${target.id}"]`);
    if (el) {
      setMarquee(rectToMarquee(pageEl, el));
      setActiveGrabId(target.id);
    }
    const next = {
      id: `${target.id}-${captureItemsRef.current.length}`,
      targetId: target.id,
      prompt: target.prompt,
    };
    const items = [...captureItemsRef.current, next];
    captureItemsRef.current = items;
    setCaptures(items.length);
    setCaptureItems(items);
    // Comb follows the spoken grab prompts as they stack.
    speechTextRef.current = items.map((c) => c.prompt).join('; ');
    speechCharsRef.current = 0;
    waveModeRef.current = 'speech';
  }, []);
  commitGrabRef.current = commitGrab;

  // Autoplay: hold → grab order button → paste
  useEffect(() => {
    if (!inView || autoplayed.current || reduced) return undefined;
    autoplayed.current = true;
    const timers = [];
    timers.push(
      window.setTimeout(() => {
        // Force first grab to be the order button
        grabIdx.current = 0;
        startHoldRef.current();
        timers.push(
          window.setTimeout(() => {
            commitGrabRef.current();
            timers.push(
              window.setTimeout(() => {
                endHoldRef.current();
              }, 900)
            );
          }, 1100)
        );
      }, 900)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, reduced]);

  // Shift-drag: snap to nearest grab target on release
  const dragRef = useRef(null);
  const onPointerDownPage = (e) => {
    if (!holding) return;
    if (mode !== 'capture' && !e.shiftKey) return;
    // Prefer clicking a grab target directly
    const hit = e.target.closest?.('[data-grab]');
    if (hit && pageRef.current) {
      const id = hit.getAttribute('data-grab');
      const target = GRAB_TARGETS.find((t) => t.id === id) || GRAB_TARGETS[0];
      // Align cycle so next button-grab continues after this
      const idx = GRAB_TARGETS.findIndex((t) => t.id === id);
      if (idx >= 0) grabIdx.current = idx + 1;
      setMarquee(rectToMarquee(pageRef.current, hit));
      setActiveGrabId(id);
      const next = {
        id: `${target.id}-${captureItemsRef.current.length}`,
        targetId: target.id,
        prompt: target.prompt,
      };
      const items = [...captureItemsRef.current, next];
      captureItemsRef.current = items;
      setCaptures(items.length);
      setCaptureItems(items);
      speechTextRef.current = items.map((c) => c.prompt).join('; ');
      speechCharsRef.current = 0;
      waveModeRef.current = 'speech';
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    dragRef.current = { ox: x, oy: y };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }
  };

  const onPointerMovePage = (e) => {
    if (!dragRef.current || !pageRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const left = Math.min(dragRef.current.ox, x);
    const top = Math.min(dragRef.current.oy, y);
    const w = Math.abs(x - dragRef.current.ox);
    const h = Math.abs(y - dragRef.current.oy);
    setMarquee({ x: left, y: top, w, h });
  };

  const onPointerUpPage = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    // Snap to next grab target (button cycles real elements)
    commitGrab();
  };

  const onMode = (id) => {
    if (busy || holding) return;
    setMode(id);
    setRaceOn(false);
    setStatus('idle');
  };

  const clockLabel = formatClock(elapsed);
  const showIsland = islandOn && mode !== 'race';

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
            <span className="dtd-url">bakery.shop</span>
            <span className={`dtd-badge${holding ? ' is-on' : ''}`}>
              {holding ? 'recording' : 'idle'}
            </span>
          </div>

          <div
            className={`dtd-viewport${focused ? ' is-focused' : ''}`}
            tabIndex={0}
            role="application"
            aria-label="Mock bakery page. Hold space to dictate, or use the hold button."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            <div
              className="dtd-page"
              ref={pageRef}
              onPointerDown={onPointerDownPage}
              onPointerMove={onPointerMovePage}
              onPointerUp={onPointerUpPage}
              onPointerCancel={() => {
                dragRef.current = null;
              }}
            >
              <div className="dtd-page-main">
                <MockShop ref={shopRef} activeGrabId={activeGrabId} />

                <div className="dtd-notes">
                  <div className="dtd-notes-label">agent</div>
                  <div className="dtd-field-wrap">
                    {pastedCollage.length ? <Collage items={pastedCollage} /> : null}
                    <div className="dtd-field">
                      {fieldText || (
                        <span className="dtd-placeholder">text lands here</span>
                      )}
                      {busy && status === 'pasting' ? (
                        <span className="dtd-caret" aria-hidden="true" />
                      ) : null}
                    </div>
                  </div>

                  {mode === 'race' && raceOn ? (
                    <RaceTrack
                      running={raceOn}
                      reduced={reduced}
                      onDone={() => {
                        busyRef.current = false;
                        setBusy(false);
                        setStatus('idle');
                        setElapsed(0);
                      }}
                    />
                  ) : null}
                </div>
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
                  visible={showIsland}
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
            <span>clock: {clockLabel}</span>
            <span className="dtd-status-hint">
              {focused
                ? holding
                  ? mode === 'capture'
                    ? 'grab a target'
                    : 'release to paste'
                  : 'space to hold'
                : 'click, then hold space'}
            </span>
          </div>
        </div>

        <SidePanel
          mode={mode}
          onMode={onMode}
          holding={holding}
          busy={busy}
          captures={captures}
          elapsed={clockLabel}
          status={status}
          hint={HINTS[mode] || HINTS.dictate}
          onHoldStart={startHold}
          onHoldEnd={endHold}
          onGrab={commitGrab}
          canGrab={holding && (mode === 'capture' || mode === 'dictate')}
        />
      </div>
      <figcaption>
        canned runs. the real app transcribes on-device with parakeet v2.
      </figcaption>
    </figure>
  );
}
